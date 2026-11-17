// Vendored standalone replacement for `@hatch/space-sdk/build`.
//
// Same canonical client bundling as the real SDK (entrypoint, outdir,
// production NODE_ENV define, asset naming, tailwind plugin, and the
// bare-asset-URL re-prefix pass), minus the Muse runtime's build-driver
// guard — here `bun run build:client` is meant to be run by hand / in
// Docker.

import { readFile, rm } from "node:fs/promises";
import { basename } from "node:path";
import tailwindPlugin from "bun-plugin-tailwind";

const ENTRY = "./client/index.html";
const OUTDIR = "./client/dist";

export interface BuildClientOptions {}

export async function buildClient(_options: BuildClientOptions = {}): Promise<void> {
  if (typeof Bun === "undefined" || typeof Bun.build !== "function") {
    throw new Error("buildClient() must run under Bun");
  }
  await rm(OUTDIR, { force: true, recursive: true });
  const platformVersion = await readFile("./space.json", "utf8")
    .then((text) => JSON.parse(text).platformVersion as unknown)
    .catch(() => undefined);
  const result = await Bun.build({
    entrypoints: [ENTRY],
    outdir: OUTDIR,
    minify: true,
    define: {
      "process.env.NODE_ENV": JSON.stringify("production"),
      __HATCH_SPACE_PLATFORM_VERSION__: JSON.stringify(
        typeof platformVersion === "number" ? platformVersion : 0,
      ),
    },
    naming: {
      asset: "assets/[name]-[hash].[ext]",
      chunk: "assets/[name]-[hash].[ext]",
      entry: "[name].[ext]",
    },
    plugins: [tailwindPlugin],
  });
  if (!result.success) {
    for (const log of result.logs) {
      console.error(log);
    }
    throw new Error("buildClient() failed; see logged diagnostics");
  }
  // Bun writes imported assets to `assets/<name>-<hash>.<ext>` but emits
  // the import URL as a bare `./<name>-<hash>.<ext>`; re-prefix bare
  // imported-asset URLs to `./assets/...` so they resolve next to the
  // entry/chunk refs (idempotent; chunk refs already carry `assets/`).
  const assetFiles = result.outputs
    .filter((output) => output.kind === "asset")
    .map((output) => basename(output.path));
  for (const output of result.outputs) {
    if (!/\.(js|css|html)$/.test(output.path)) {
      continue;
    }
    let text = await output.text();
    let changed = false;
    for (const name of assetFiles) {
      const bare = `./${name}`;
      if (text.includes(bare)) {
        text = text.split(bare).join(`./assets/${name}`);
        changed = true;
      }
    }
    if (changed) {
      await Bun.write(output.path, text);
    }
  }
}
