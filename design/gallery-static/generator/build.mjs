// 位置：design/gallery-static/generator/。用專案裡（vitest 帶進來的）esbuild 把 generate.ts 連同專案內容模組打包成單一 ESM，再執行它。
import { createRequire } from "node:module";
import { readdirSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = resolve(HERE, "../../..");
const APP = resolve(REPO, "apps/app");
const PNPM = resolve(REPO, "node_modules/.pnpm");
const viteDir = readdirSync(PNPM).find((name) => name.startsWith("vite@"));
if (!viteDir) throw new Error("vite not found in pnpm store");
const viteRequire = createRequire(resolve(PNPM, viteDir, "node_modules/vite/package.json"));
const esbuild = viteRequire("esbuild");

const entry = process.env.GEN_ENTRY ? resolve(process.cwd(), process.env.GEN_ENTRY) : resolve(HERE, "generate.ts");
const outfile = resolve(HERE, "dist-gen", entry.split("/").pop().replace(/\.ts$/, ".mjs"));
await esbuild.build({
  entryPoints: [entry],
  bundle: true,
  platform: "node",
  format: "esm",
  target: "node22",
  outfile,
  absWorkingDir: APP,
  alias: { "@": resolve(APP, "src"), "@repo/design-system": resolve(REPO, "packages/design-system/dist/index.js") },
  nodePaths: [resolve(APP, "node_modules")],
  packages: "bundle",
  external: ["node:*"],
  logLevel: "warning",
  banner: { js: "import { createRequire as __cr } from 'node:module'; const require = __cr(import.meta.url);" },
});

const run = spawnSync(process.execPath, [outfile, ...process.argv.slice(2)], { stdio: "inherit", cwd: HERE });
process.exit(run.status ?? 1);
