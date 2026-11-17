// Vercel Function entry (source). Bundled by build-api.mjs into
// api/actions.js — a single self-contained ESM file (only real npm
// dependencies stay external), because Vercel's builder does not
// resolve extensionless TypeScript imports across directories.
//
// The browser client POSTs {action, args, actionCallId} to the relative
// path "./actions" (i.e. /actions at the app root); vercel.json rewrites
// /actions to /api/actions. All real work lives in server/app.ts.
//
// IMPORTANT: use Vercel's named-method Web signature (POST), not a
// default export — a default export is treated as a classic Node
// (req, res) handler and its returned Response is ignored.

import { handleRequest } from "./app";

export async function POST(req: Request): Promise<Response> {
  return handleRequest(req);
}

export async function GET(): Promise<Response> {
  return new Response("method not allowed", { status: 405 });
}
