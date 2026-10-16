/** 頁面組裝與輸出：主題三態、gallery.css 改寫、頂列、導覽、驗證與 dist 寫檔 */
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { GALLERY_SECTIONS } from "@/components/ui-gallery/section-list";
import { ASSETS, BRANCH_URL, esc, readRepo } from "./html";
import { GENERATIVE_SCRIPT } from "./sections/generative";

const OUT = resolve(process.cwd(), "../dist");

/* ── 主題：globals.css 的 :root／:root.dark 兩段 → 三態 ───────────────── */
function cssBlock(css: string, selector: string): string {
  const re = new RegExp(`(^|\\n)${selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*\\{([^}]*)\\}`);
  const m = re.exec(css);
  if (!m) throw new Error(`block not found: ${selector}`);
  return m[2]
    .split("\n")
    .filter((line) => !/color-scheme\s*:/.test(line))
    .join("\n");
}

function themeTokens(): string {
  const globals = readRepo("apps/app/src/app/globals.css");
  const light = cssBlock(globals, ":root");
  const dark = cssBlock(globals, ":root.dark");
  return `:root {${light}\n  color-scheme: light;\n}
@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) {${dark}\n  color-scheme: dark;\n} }
:root[data-theme="dark"] {${dark}\n  color-scheme: dark;\n}`;
}

/** gallery.css 用 :root.dark 換值；改寫成 data-theme 與 prefers-color-scheme 兩種觸發 */
function rewriteGalleryCss(): string {
  const css = readRepo("apps/app/src/components/ui-gallery/gallery.css");
  const darkRules: string[] = [];
  const rewritten = css.replace(/:root\.dark([^{]*)\{([^}]*)\}/g, (_m, rest: string, body: string) => {
    darkRules.push(`:root:not([data-theme="light"])${rest}{${body}}`);
    return `:root[data-theme="dark"]${rest}{${body}}`;
  });
  return `${rewritten}\n@media (prefers-color-scheme: dark) {\n${darkRules.join("\n")}\n}`;
}

/* Tailwind preflight 裡 /gallery 實際依賴的部分 */
const PREFLIGHT = `
*, ::before, ::after { box-sizing: border-box; border-width: 0; border-style: solid; border-color: var(--border-default); }
h1, h2, h3, h4, h5, h6, p, figure, pre, blockquote, dl, dd { margin: 0; }
h1, h2, h3, h4, h5, h6 { font-size: inherit; font-weight: inherit; }
ol, ul, menu { list-style: none; margin: 0; padding: 0; }
a { color: inherit; text-decoration: inherit; }
img, svg, video, canvas, iframe { display: block; vertical-align: middle; }
img, video { max-width: 100%; height: auto; }
button, input, optgroup, select, textarea { font: inherit; color: inherit; margin: 0; }
button, [role="button"] { cursor: pointer; }
button { background-color: transparent; background-image: none; text-transform: none; }
table { border-collapse: collapse; border-color: inherit; text-indent: 0; }
pre, code, kbd, samp { font-family: "Spline Sans Mono", ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 1em; }
[hidden] { display: none !important; }
`;

const EXTRA_CSS = `
html { -webkit-text-size-adjust: 100%; }
body { margin: 0; background: var(--background); color: var(--text-primary); font-family: var(--font-family); line-height: 1.6; -webkit-font-smoothing: antialiased; min-width: 0; overflow-x: hidden; }
.gal-page { min-width: 0; }
.gal-topbar { top: env(safe-area-inset-top, 0px); }
.gal-badges { display: inline-flex; gap: 6px; align-items: center; flex-wrap: wrap; }
.gal-shot { margin: 8px 0 0; display: grid; gap: 6px; }
.gal-shot img { width: 100%; height: auto; border: 1px solid var(--border-default); border-radius: var(--radius-lg); background: #fff; }
.gal-shot figcaption { font-size: 12px; color: var(--text-tertiary); }
.gal-sample-frame { width: 100%; border: 0; }
.gal-source [role="tabpanel"] > .gal-source-body { margin: 0; }
.gal-topbar-link { font-size: 12px; color: var(--text-secondary); text-decoration: none; border: 1px solid var(--border-default); border-radius: 999px; padding: 5px 10px; white-space: nowrap; }
.gal-topbar-link:hover { color: var(--text-primary); background: var(--surface-secondary); }
.gal-static-note { font-size: 12px; color: var(--text-tertiary); }
@media (max-width: 900px) { .gal-topbar-link { display: none; } }
@media (max-width: 560px) {
  .gal-topbar-inner { gap: 8px; }
  .gal-topbar-title span:last-child { font-size: 13px; }
  .gal-topbar-actions .gal-seg button { white-space: nowrap; padding: 4px 8px; font-size: 11px; }
}
`;

function topbar(): string {
  const themes = [
    { value: "light", label: "淺色" },
    { value: "dark", label: "深色" },
    { value: "system", label: "跟隨系統" },
  ];
  return `<header class="gal-topbar"><div class="gal-topbar-inner">
  <div class="gal-topbar-title"><span class="gal-topbar-kicker">Open Intelligent UI</span><span>UI 展示與專案解析（靜態重製版）</span></div>
  <div class="gal-topbar-actions">
    <div class="gal-seg" role="group" aria-label="主題">${themes.map((t) => `<button type="button" data-theme-set="${t.value}" aria-pressed="${t.value === "system"}">${t.label}</button>`).join("")}</div>
    <a class="gal-topbar-link" href="${BRANCH_URL}" target="_blank" rel="noopener">GitHub 分支 ↗</a>
  </div>
</div></header>`;
}

function nav(): string {
  return `<nav class="gal-nav" aria-label="區塊導覽"><ol>${GALLERY_SECTIONS.map(
    (s, i) => `<li><a href="#${s.id}"${i === 0 ? ' class="is-active"' : ""}><span class="gal-nav-index">${i + 1}</span><span>${esc(s.label)}</span></a></li>`,
  ).join("")}</ol></nav>`;
}

const PAGE_SCRIPT = `
(function () {
  var root = document.documentElement;
  function applyTheme(value) {
    if (value === "light" || value === "dark") root.setAttribute("data-theme", value); else root.removeAttribute("data-theme");
    document.querySelectorAll("[data-theme-set]").forEach(function (b) { b.setAttribute("aria-pressed", String(b.getAttribute("data-theme-set") === value)); });
    try { localStorage.setItem("gal-theme", value); } catch (e) {}
  }
  var saved = null;
  try { saved = localStorage.getItem("gal-theme"); } catch (e) {}
  if (saved === "light" || saved === "dark") applyTheme(saved);
  else { var attr = root.getAttribute("data-theme"); applyTheme(attr === "light" || attr === "dark" ? attr : "system"); }
  document.querySelectorAll("[data-theme-set]").forEach(function (b) { b.addEventListener("click", function () { applyTheme(b.getAttribute("data-theme-set")); }); });

  document.querySelectorAll("[data-tabs]").forEach(function (box) {
    var buttons = Array.prototype.filter.call(box.querySelectorAll("[data-tab]"), function (b) { return b.closest("[data-tabs]") === box; });
    var panels = Array.prototype.filter.call(box.querySelectorAll("[data-panel]"), function (p) { return p.closest("[data-tabs]") === box; });
    buttons.forEach(function (button) {
      button.addEventListener("click", function () {
        var key = button.getAttribute("data-tab");
        buttons.forEach(function (b) { var on = b === button; b.setAttribute("aria-selected", String(on)); if (b.hasAttribute("aria-pressed")) b.setAttribute("aria-pressed", String(on)); });
        panels.forEach(function (p) { p.hidden = p.getAttribute("data-panel") !== key; });
      });
    });
  });

  var region = document.getElementById("gal-toast-region");
  var toastTimer = null;
  window.galToast = function (message) {
    if (!region) return;
    region.hidden = false;
    region.innerHTML = "";
    var el = document.createElement("div");
    el.className = "gal-toast";
    el.textContent = message;
    region.appendChild(el);
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { region.hidden = true; region.innerHTML = ""; }, 4000);
  };
  document.addEventListener("click", function (event) {
    var target = event.target.closest && event.target.closest("[data-toast]");
    if (target) { event.preventDefault(); window.galToast(target.getAttribute("data-toast")); }
  });

  if ("IntersectionObserver" in window) {
    var links = document.querySelectorAll(".gal-nav a");
    var sections = Array.prototype.map.call(links, function (a) { return document.getElementById(a.getAttribute("href").slice(1)); }).filter(Boolean);
    var observer = new IntersectionObserver(function (entries) {
      var visible = entries.filter(function (e) { return e.isIntersecting; }).sort(function (a, b) { return a.boundingClientRect.top - b.boundingClientRect.top; });
      if (!visible[0]) return;
      var id = visible[0].target.id;
      links.forEach(function (a) { a.classList.toggle("is-active", a.getAttribute("href") === "#" + id); });
    }, { rootMargin: "-20% 0px -70% 0px", threshold: 0 });
    sections.forEach(function (s) { observer.observe(s); });
  }
})();
`;

export function buildPage(sections: string[]): void {

  const page = `<title>Open Intelligent UI Gallery</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Spline+Sans+Mono:wght@400;500&display=swap" rel="stylesheet">
<style>
/* 版面：/gallery 的 gallery.css 原樣帶入，token 來自 globals.css；主題改成 data-theme + prefers-color-scheme 三態 */
${themeTokens()}
${PREFLIGHT}
${rewriteGalleryCss()}
${EXTRA_CSS}
</style>
<div class="gal-page">
${topbar()}
<div class="gal-layout">
${nav()}
<main class="gal-main" id="gallery-main">
${sections.join("\n")}
<p class="gal-static-note">靜態重製版由產生器從 OpenIntelligentUI 分支 <a href="${BRANCH_URL}" target="_blank" rel="noopener">claude/serene-shannon-z0fh1s</a> 的原始碼產生；表格、色彩數字與樣本頁都來自同一份程式，截圖來自本機 /gallery。</p>
</main>
</div>
</div>
<div id="gal-toast-region" class="gal-toast-region" role="status" aria-live="polite" hidden></div>
<script>${PAGE_SCRIPT}</script>
<script>${GENERATIVE_SCRIPT}</script>
`;

  /* ── 驗證 ──────────────────────────────────────────── */
  const problems: string[] = [];
  if (/<html[\s>]|<body[\s>]|<!doctype/i.test(page)) problems.push("index.html contains document-level tags");
  const ids = new Set<string>();
  for (const m of page.matchAll(/\sid="([^"]+)"/g)) ids.add(m[1]);
  for (const m of page.matchAll(/href="#([^"]+)"/g)) {
    if (!ids.has(m[1])) problems.push(`missing anchor target #${m[1]}`);
  }
  for (const m of page.matchAll(/(?:src|href)="(assets\/[^"]+)"/g)) {
    if (!ASSETS.has(m[1])) problems.push(`missing asset ${m[1]}`);
  }
  for (const m of page.matchAll(/data-(?:final|preview)="(assets\/[^"]+)"/g)) {
    if (!ASSETS.has(m[1])) problems.push(`missing asset ${m[1]}`);
  }
  const unused = [...ASSETS.keys()].filter((path) => !page.includes(path));

  /* ── 輸出 ──────────────────────────────────────────── */
  rmSync(OUT, { recursive: true, force: true });
  mkdirSync(OUT, { recursive: true });
  writeFileSync(resolve(OUT, "index.html"), page);
  // 本機入口：index.html 是給 Artifact 宿主包裝的 fragment，這裡補上完整文件骨架，可直接用瀏覽器或靜態伺服器開
  const titleTag = /^\s*<title>[^<]*<\/title>/.exec(page)?.[0].trim() ?? "";
  const body = titleTag ? page.replace(/^\s*<title>[^<]*<\/title>/, "") : page;
  const local = `<!doctype html>\n<html lang="zh-Hant">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n${titleTag}\n<link rel=\"icon\" href=\"data:,\">\n<style>:root{color-scheme:light}body{margin:0}img{max-width:100%}[hidden]{display:none!important}</style>\n</head>\n<body>\n${body}\n</body>\n</html>\n`;
  writeFileSync(resolve(OUT, "local.html"), local);
  let total = Buffer.byteLength(page);
  const manifest: Record<string, number> = { "index.html": Buffer.byteLength(page) };
  for (const [path, content] of ASSETS) {
    const file = resolve(OUT, path);
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, content);
    const size = typeof content === "string" ? Buffer.byteLength(content) : content.length;
    manifest[path] = size;
    total += size;
  }
  writeFileSync(resolve(OUT, "manifest.json"), JSON.stringify(manifest, null, 2));

  const mb = (n: number) => `${(n / 1024 / 1024).toFixed(2)} MB`;
  console.log(`index.html ${mb(manifest["index.html"])} · ${ASSETS.size} assets · total ${mb(total)}`);
  console.log(`sections ${sections.length} · items ${(page.match(/class="gal-item[ "]/g) ?? []).length} · shots ${[...ASSETS.keys()].filter((p) => p.startsWith("assets/shots/")).length}`);
  if (unused.length) console.log(`unused assets: ${unused.join(", ")}`);
  if (problems.length) {
    console.error(`PROBLEMS (${problems.length}):\n${problems.join("\n")}`);
    process.exitCode = 1;
  } else {
    console.log("checks OK: fragment only, anchors resolve, assets present");
  }
}
