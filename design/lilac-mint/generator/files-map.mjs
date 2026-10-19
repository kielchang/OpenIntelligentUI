// 列出 project/ 下所有檔案，產生 Artifact publish 的 files 對映（索引 design-system.json 由 file_path 給，不放進 map）
import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";
const ROOT = new URL("../project/", import.meta.url).pathname;
const walk = (dir) => readdirSync(dir).flatMap((n) => (statSync(join(dir, n)).isDirectory() ? walk(join(dir, n)) : [join(dir, n)]));
const files = walk(ROOT).map((f) => "project/" + f.slice(ROOT.length)).filter((f) => f !== "project/design-system.json").sort();
const map = Object.fromEntries(files.map((f) => [f, f]));
console.log(JSON.stringify(map));
console.error(`${files.length} files`);
