// FITIND request-handling core — runtime-agnostic (Web Request/Response).
//
// Two entrypoints share this core:
//   * server/standalone.ts — a plain Bun server (local dev / any Docker
//     host); it injects a static-file handler for client/dist.
//   * api/actions.ts — a Vercel Function (Node runtime); Vercel serves
//     client/dist itself and rewrites POST /actions to the function,
//     which forwards the request here.
//
// Database — ONE code path (libSQL) for local and hosted runs:
//   * TURSO_DATABASE_URL set  → remote Turso database
//     (TURSO_AUTH_TOKEN carries its auth token);
//   * otherwise               → a local SQLite file at DATABASE_PATH
//     (default ./data/app.db, directory auto-created) via a file: URL.
//
// On first use the drizzle/*.sql migrations are applied in filename
// order, exactly once each (tracked in the `__standalone_migrations`
// table — the migration files use plain CREATE TABLE, so re-running one
// would crash; restarts skip applied files). This works identically
// against a local file: URL and a remote Turso database.
//
// The action handlers themselves are the unmodified
// `server/src/actions.ts`; the only runtime surface they touch is
// `ctx.db` and `ctx.invalidateQueries()`, both provided here (the DB
// accessor ignores its schema type parameter and returns the one real
// database; a handler calling `ctx.invalidateQueries()` flips a
// per-request flag that becomes `invalidateAll: true` on the response,
// which the vendored client answers by invalidating its QueryClient).
// Catalogue seeding (foods / exercises / recipes) is lazy: the actions
// ensure it themselves on first use, so a fresh empty database fills in
// through normal action calls.

import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { mkdirSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import type { Ctx, SpaceDbAccessor } from "@hatch/space-sdk";
import { Actions } from "./src/actions";
import * as schema from "./src/schema";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const MIGRATIONS_DIR = join(ROOT, "drizzle");

// ---------------------------------------------------------------- database

type Db = ReturnType<typeof drizzle<typeof schema>>;

async function initDb(): Promise<Db> {
  const tursoUrl = process.env.TURSO_DATABASE_URL;
  let dbUrl: string;
  let dbLabel: string;
  if (tursoUrl) {
    dbUrl = tursoUrl;
    dbLabel = "Turso (remote libSQL)";
  } else {
    const dbPath = resolve(process.env.DATABASE_PATH ?? "./data/app.db");
    mkdirSync(dirname(dbPath), { recursive: true });
    dbUrl = `file:${dbPath}`;
    dbLabel = `local file ${dbPath}`;
  }

  const client = createClient({
    url: dbUrl,
    authToken: tursoUrl ? process.env.TURSO_AUTH_TOKEN : undefined,
  });

  if (dbUrl.startsWith("file:")) {
    // Local files only — a remote Turso database manages its own journaling.
    try {
      await client.execute("PRAGMA journal_mode = WAL;");
    } catch {
      // Non-fatal: the database still works in the default journal mode.
    }
  }

  await client.execute(
    "CREATE TABLE IF NOT EXISTS __standalone_migrations " +
      "(name TEXT PRIMARY KEY, applied_at INTEGER NOT NULL)",
  );
  const appliedResult = await client.execute(
    "SELECT name FROM __standalone_migrations",
  );
  const applied = new Set(appliedResult.rows.map((r) => String(r.name)));
  const migrationFiles = readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith(".sql"))
    .sort();
  for (const file of migrationFiles) {
    if (applied.has(file)) continue;
    const sqlText = readFileSync(join(MIGRATIONS_DIR, file), "utf8");
    // executeMultiple runs the whole script (the files' drizzle
    // `--> statement-breakpoint` markers are plain SQL comments to libSQL).
    await client.executeMultiple(sqlText);
    await client.execute({
      sql: "INSERT INTO __standalone_migrations (name, applied_at) VALUES (?, ?)",
      args: [file, Date.now()],
    });
    console.log(`[fitind] applied migration ${file}`);
  }

  console.log(`[fitind] database ready: ${dbLabel}`);
  return drizzle(client, { schema });
}

// Lazy singleton: module import stays cheap and safe on serverless
// cold starts; the first request awaits migrations exactly once.
let dbPromise: Promise<Db> | null = null;
function getDb(): Promise<Db> {
  dbPromise ??= initDb();
  return dbPromise;
}

// ---------------------------------------------------------------- actions

type ActionDef = {
  request?: { safeParse: (args: unknown) => SafeParseResult };
  handler: (ctx: Ctx, args: never) => Promise<unknown>;
};
type SafeParseResult =
  | { success: true; data: unknown }
  | {
      success: false;
      error: { issues: { path: PropertyKey[]; message: string }[] };
    };

const actionTable = Actions as unknown as Record<string, ActionDef>;

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

async function handleAction(req: Request): Promise<Response> {
  let payload: { action?: unknown; args?: unknown };
  try {
    payload = (await req.json()) as typeof payload;
  } catch {
    return json({ error: "invalid JSON body" }, 400);
  }
  const actionName =
    typeof payload?.action === "string" ? payload.action : "";
  const def = actionTable[actionName];
  if (!def || typeof def.handler !== "function") {
    return json({ error: `unknown action: ${actionName || "(missing)"}` });
  }

  let args: unknown = payload?.args ?? {};
  if (def.request) {
    const parsed = def.request.safeParse(args);
    if (!parsed.success) {
      const detail = parsed.error.issues
        .map(
          (i) =>
            `${i.path.map(String).join(".") || "(root)"}: ${i.message}`,
        )
        .join("; ");
      return json({
        error: `invalid request for action ${actionName}: ${detail}`,
      });
    }
    args = parsed.data;
  }

  const db = await getDb();
  const state = { invalidated: false };
  const ctx: Ctx = {
    db: (() => db) as unknown as SpaceDbAccessor,
    invalidateQueries: () => {
      state.invalidated = true;
    },
  };
  try {
    const data = await def.handler(ctx, args as never);
    return json({ data, invalidateAll: state.invalidated });
  } catch (err) {
    return json({
      error: err instanceof Error ? err.message : String(err),
    });
  }
}

// ---------------------------------------------------------------- dispatch

/**
 * Optional static-asset handler injected by the Bun standalone server.
 * Receives the request URL; returns a Response for a file (or the SPA
 * index fallback), or null to fall through to a 404. On Vercel this is
 * omitted — Vercel serves client/dist itself.
 */
export type StaticHandler = (url: URL) => Promise<Response | null> | Response | null;

export async function handleRequest(
  req: Request,
  serveStatic?: StaticHandler,
): Promise<Response> {
  const url = new URL(req.url);
  if (req.method === "POST" && url.pathname === "/actions") {
    return handleAction(req);
  }
  if ((req.method === "GET" || req.method === "HEAD") && serveStatic) {
    const res = await serveStatic(url);
    if (res) return res;
  }
  return new Response("not found", { status: 404 });
}
