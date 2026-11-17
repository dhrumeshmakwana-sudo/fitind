// Vercel Function (Node runtime) — the FITIND action RPC endpoint.
//
// The browser client POSTs {action, args, actionCallId} to the relative
// path "./actions" (i.e. /actions at the app root); vercel.json rewrites
// /actions to this function at /api/actions. All real work — database
// (Turso via libSQL), migrations, dispatch — lives in the shared core,
// server/app.ts, which is also what the local Bun server runs.
//
// Set TURSO_DATABASE_URL and TURSO_AUTH_TOKEN in the Vercel project's
// environment variables; without them the function falls back to a
// local file database, which does NOT persist on Vercel.

import { handleRequest } from "../server/app";

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== "POST") {
    return new Response("method not allowed", { status: 405 });
  }
  return handleRequest(req);
}
