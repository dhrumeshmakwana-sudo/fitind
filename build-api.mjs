// Bundle the Vercel function into one self-contained ESM file.
// Run with Bun: `bun run build-api.mjs` (wired into vercel.json's
// buildCommand and the package.json "build:api" script).
//
// Local sources (server/**, vendor/**) are inlined; genuine npm
// dependencies stay external so Vercel's file tracing ships them from
// node_modules untouched (notably @libsql/client's native parts).

const result = await Bun.build({
  entrypoints: ["server/vercel-entry.ts"],
  outdir: "api",
  naming: "actions.js",
  target: "node",
  format: "esm",
  external: ["@libsql/client", "@libsql/*", "libsql", "drizzle-orm", "drizzle-orm/*"],
});

if (!result.success) {
  for (const log of result.logs) console.error(log);
  process.exit(1);
}
console.log("built api/actions.js");
