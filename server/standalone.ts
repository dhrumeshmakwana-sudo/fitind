// FITIND standalone server — local-dev / self-host entrypoint.
//
//   bun install
//   bun run build:client          # produces client/dist
//   bun start                     # listens on PORT (default 3000)
//
// This is a thin Bun.serve wrapper around the shared, runtime-agnostic
// request core in server/app.ts (the same core the Vercel Function in
// api/actions.ts forwards to). The only Bun-specific part is static
// file serving: the built client from client/dist with SPA fallback.
// Database selection (Turso via TURSO_DATABASE_URL/TURSO_AUTH_TOKEN, or
// a local file at DATABASE_PATH) lives in server/app.ts.

import { existsSync, statSync } from "node:fs";
import { join, resolve, sep } from "node:path";
import { handleRequest, type StaticHandler } from "./app";

const PORT = Number(process.env.PORT ?? 3000);
const HOST = "0.0.0.0";
const DIST_DIR = join(import.meta.dir, "..", "client", "dist");

const serveStatic: StaticHandler = (url) => {
  const rel = decodeURIComponent(url.pathname).replace(/^\/+/, "");
  const candidate = resolve(join(DIST_DIR, rel));
  if (
    rel.length > 0 &&
    candidate.startsWith(DIST_DIR + sep) &&
    existsSync(candidate) &&
    statSync(candidate).isFile()
  ) {
    return new Response(Bun.file(candidate));
  }
  const indexFile = join(DIST_DIR, "index.html");
  if (existsSync(indexFile)) {
    return new Response(Bun.file(indexFile), {
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }
  return new Response("client not built — run `bun run build:client`", {
    status: 503,
  });
};

const server = Bun.serve({
  hostname: HOST,
  port: PORT,
  fetch: (req) => handleRequest(req, serveStatic),
});

console.log(
  `[fitind] standalone server listening on http://${HOST}:${server.port}`,
);
