// Vercel Function entry (source). Bundled by build-api.mjs into
// api/actions.js — a single self-contained ESM file (only real npm
// dependencies stay external), because Vercel's builder does not
// resolve extensionless TypeScript imports across directories.
//
// The browser client POSTs {action, args, actionCallId} to the relative
// path "./actions" (i.e. /actions at the app root); vercel.json rewrites
// /actions to /api/actions. All real work lives in server/app.ts.

import { handleRequest } from "./app";

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== "POST") {
    return new Response("method not allowed", { status: 405 });
  }
  return handleRequest(req);
}
