// 本機檢查設計系統元件預覽：模擬 Artifact 預覽框（預載 tokens.css、bundle.css、bundle.js、data-theme），
// 淺／深兩主題各開一次，收集 console／pageerror、量溢出、截圖到 design/lilac-mint/.local/shots/。需要 playwright-core 與 Chromium（CHROMIUM_PATH 指定執行檔）。
//   node preview-check.mjs all            → static/components 下全部
//   node preview-check.mjs Button Alert   → 指定元件
//   node preview-check.mjs all --project  → 檢查 project/components（產生器輸出）
import { chromium } from "playwright-core";
import { spawn } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, readdirSync } from "node:fs";

const ROOT = new URL("..", import.meta.url).pathname.replace(/\/$/, ""); // design/lilac-mint
const args = process.argv.slice(2);
const useProject = args.includes("--project");
const wide = args.includes("--wide");
const base = useProject ? `${ROOT}/project/components` : `${ROOT}/generator/static/components`;
const rel = useProject ? "project/components" : "generator/static/components";
const names = args.filter((a) => !a.startsWith("--"));
const comps = names.length && names[0] !== "all" ? names : readdirSync(base).filter((d) => existsSync(`${base}/${d}/preview.html`));
const OUT = `${ROOT}/.local/shots`;
mkdirSync(OUT, { recursive: true });
const PORT = 8078;
const BASE = `http://127.0.0.1:${PORT}`;

const tokensCss = readFileSync(`${ROOT}/project/tokens.css`, "utf8");
const bundleCss = useProject
  ? readFileSync(`${ROOT}/project/components/bundle.css`, "utf8")
  : readdirSync(`${ROOT}/generator/static/components/_src`).filter((f) => f.endsWith(".css")).sort().map((f) => readFileSync(`${ROOT}/generator/static/components/_src/${f}`, "utf8")).join("\n");
const bundleJs = useProject ? readFileSync(`${ROOT}/project/components/bundle.js`, "utf8") : readFileSync(`${ROOT}/generator/static/components/bundle.body.js`, "utf8");

const server = spawn("python3", ["-m", "http.server", String(PORT), "--bind", "127.0.0.1", "--directory", ROOT], { stdio: "ignore" });
await new Promise((r) => setTimeout(r, 1000));
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined, args: ["--no-sandbox"] });
let failures = 0;

for (const comp of comps) {
  const path = `${base}/${comp}/preview.html`;
  const src = readFileSync(path, "utf8");
  const first = src.split("\n")[0];
  const marker = /^<!-- @dsCard([^>]*)-->/.exec(first);
  const height = marker ? Number(/height=(\d+)/.exec(marker[1])?.[1] ?? 120) : 120;
  const problems = [];
  if (!marker) problems.push("第一行不是 @dsCard 標記");
  if (/<iframe|<object|<embed|<noscript|<portal/i.test(src)) problems.push("含禁止的嵌入元素");
  if (!/<!doctype html>/i.test(src)) problems.push("缺 doctype");
  if ((src.match(/<script\b/gi) || []).length > 1) problems.push("超過一個 <script>");
  const injected = src
    .replace(/<html([^>]*)>/i, (m, attrs) => `<html${attrs.replace(/\sdata-theme="[^"]*"/, "")} data-theme="__THEME__">`)
    .replace(/<head>/i, `<head><style data-ds="tokens">${tokensCss}</style><style data-ds="bundle">${bundleCss}</style><script data-ds="bundle">${bundleJs}</script>`);
  for (const theme of ["light", "dark"]) {
    const context = await browser.newContext({ viewport: { width: wide ? 960 : 720, height: Math.max(height, 200) }, colorScheme: theme });
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", (e) => errors.push(`pageerror ${e.message.slice(0, 200)}`));
    page.on("console", (m) => {
      if (m.type() !== "error") return;
      const t = m.text();
      if (/fonts\.g(oogleapis|static)\.com|ERR_TUNNEL|ERR_PROXY|net::ERR/.test(t)) return;
      errors.push(`console ${t.slice(0, 200)}`);
    });
    const url = `${BASE}/${rel}/${comp}/preview.html`;
    await page.route(url, (route) => route.fulfill({ contentType: "text/html", body: injected.replace("__THEME__", theme) }));
    await page.goto(url, { waitUntil: "load", timeout: 60000 }).catch((e) => errors.push(`goto ${e.message.slice(0, 120)}`));
    await page.waitForTimeout(700);
    const m = await page.evaluate(() => ({
      scrollW: document.documentElement.scrollWidth,
      clientW: document.documentElement.clientWidth,
      docH: Math.ceil(document.body.getBoundingClientRect().bottom + parseFloat(getComputedStyle(document.body).marginBottom || "0")),
      bg: getComputedStyle(document.body).backgroundColor,
      text: document.body.innerText.trim().length,
      fontSans: getComputedStyle(document.body).fontFamily.slice(0, 40),
    }));
    if (m.scrollW > m.clientW + 1) errors.push(`橫向溢出 ${m.scrollW}>${m.clientW}`);
    if (m.text < 3) errors.push("頁面幾乎沒有文字");
    if (m.docH > height + 40) errors.push(`內容高 ${m.docH} 超過 height=${height}`);
    await page.screenshot({ path: `${OUT}/${comp}-${theme}.png`, fullPage: true }).catch(() => {});
    const line = `${comp} [${theme}] h=${m.docH}/${height} bg=${m.bg} ${errors.length ? "FAIL " + errors.join(" | ") : "ok"}`;
    console.log(line);
    if (errors.length) failures++;
    await context.close();
  }
  if (problems.length) {
    failures++;
    console.log(`${comp} FILE: ${problems.join(" | ")}`);
  }
}
await browser.close();
server.kill();
console.log(failures ? `FAILURES: ${failures}` : "all previews OK");
