// 讀 dist/manifest.json，印出 Artifact 工具 files 參數用的對映（published path → 本機路徑）
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
const DIST = resolve(process.cwd(), "../dist");
const manifest = JSON.parse(readFileSync(resolve(DIST, "manifest.json"), "utf8"));
const files = {};
let total = 0;
for (const [path, size] of Object.entries(manifest)) {
  if (path === "index.html") continue;
  files[path] = resolve(DIST, path);
  total += size;
}
console.log(JSON.stringify({ count: Object.keys(files).length, totalMB: +(total / 1048576).toFixed(2), index: manifest["index.html"] }, null, 0));
console.log(JSON.stringify(files));
