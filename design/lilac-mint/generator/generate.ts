/**
 * 產生 Lilac Mint Design System 的 project/ 檔案。
 *   node build.mjs            → 全部
 *   node build.mjs --tokens   → 只有 tokens.json 與本機 tokens.css（給元件撰寫者看名稱）
 */
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { TYPE_GROUPS, compileTokensCss, contrastReport, extractTokens, type Token } from "./tokens";

const HERE = process.cwd(); // build.mjs 以 generator/ 為 cwd 執行
const PROJECT = resolve(HERE, "../project");
const LOCAL = resolve(HERE, "../.local");
const STATIC = resolve(HERE, "static");
const TITLE = "Lilac Mint";
const NAMESPACE = "LilacMint";
const REPO_REF = "kielchang/OpenIntelligentUI@6117c2a";
const tokensOnly = process.argv.includes("--tokens");
const COMPONENT_ORDER = [
  "Button", "SegmentedControl",
  "TextField", "NumberField", "Select", "CheckboxRadio", "RangeSlider", "Textarea", "SearchBox",
  "Toolbar", "DataTable", "Pager", "StatusBadge", "Tag", "KeyValueList",
  "Alert", "ErrorBanner", "Toast", "EmptyState", "LoadingPlaceholder", "Skeleton",
  "AppHeader", "Card", "Drawer", "Dialog", "Tabs",
  "ChartPalette", "SequentialDiverging",
  "DiagramClasses",
  "OrgChartNode",
];

function writeFile(path: string, content: string): void {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content);
}

const set = extractTokens();
const NAME_RE = /^[A-Za-z0-9][A-Za-z0-9_.-]{0,63}$/;
const allNames = [...set.color, ...set.spacing, ...set.radius, ...set.shadow].map((t) => t.name);
const dupes = allNames.filter((n, i) => allNames.indexOf(n) !== i);
const badNames = allNames.filter((n) => !NAME_RE.test(n));
const aliasMissing = set.color.filter((t) => {
  const vals = typeof t.value === "string" ? [t.value] : Object.values(t.value);
  return vals.some((v) => /^\{/.test(v) && !set.color.some((o) => `{${o.name}}` === v));
});
if (dupes.length || badNames.length || aliasMissing.length) {
  console.error("token problems", { dupes, badNames, aliasMissing: aliasMissing.map((t) => t.name) });
  process.exit(1);
}

const report = contrastReport(set.color);
const failing = report.filter((r) => !r.pass);
for (const row of failing) {
  const t = set.color.find((x) => x.name === row.fg)!;
  if (!t.usage.includes("未達")) t.usage += `（${row.theme === "light" ? "淺色" : "深色"}主題對 ${row.bg} 為 ${row.text}，未達 ${row.threshold}:1，來源如此。）`;
}

const tokensJson = {
  name: TITLE,
  version: 1,
  meta: {
    source: "github",
    repo: "kielchang/OpenIntelligentUI",
    ref: "claude/serene-shannon-z0fh1s@6117c2a",
    package: "apps/app + packages/design-system",
    paths: {
      tokens: ["apps/app/src/app/globals.css", "packages/design-system/src/index.ts", "apps/app/src/components/generative-ui/charts/config.ts"],
      fonts: [],
      assets: [],
      docs: ["docs/interactive-answers.md", "apps/app/src/components/ui-gallery/analysis-content.ts", "apps/app/src/components/ui-gallery/design-method-content.ts", "apps/app/src/components/ui-gallery/catalog-content.ts"],
    },
    components: {},
    synced: "2026-10-11",
  },
  color: {
    themes: [
      { id: "light", name: "Light" },
      { id: "dark", name: "Dark" },
    ],
    note: "app（globals.css）與沙箱（packages/design-system，前綴 sandbox-）兩套並存；深色值都是原始碼重新定義的，不是反轉。",
    tokens: set.color,
  },
  type: {
    fonts: [],
    families: set.families,
    groups: TYPE_GROUPS,
  },
  spacing: { note: "4px 基準；元件內距只取這七階。", tokens: set.spacing },
  radius: { note: "app 五階；沙箱只開放 border-radius-md／lg／xl。", tokens: set.radius },
  shadow: { note: "深色主題不用陰影，靠表面亮度分層（shadow-card 系列為 none）。", tokens: set.shadow },
};

rmSync(PROJECT, { recursive: true, force: true });
mkdirSync(PROJECT, { recursive: true });
mkdirSync(LOCAL, { recursive: true });
writeFile(resolve(PROJECT, "tokens.json"), JSON.stringify(tokensJson, null, 2));
writeFile(resolve(LOCAL, "tokens.css"), compileTokensCss(set, TYPE_GROUPS, TITLE));
// 依 craft.md：系統沒有 tokens.css 時由作者先寫第一份（第一行註解結尾固定），頁面儲存後會接手
writeFile(resolve(PROJECT, "tokens.css"), compileTokensCss(set, TYPE_GROUPS, TITLE));
writeFile(
  resolve(LOCAL, "token-names.md"),
  [
    "# token 名稱（tokens.css 裡是 --<name>）",
    "",
    "## color（淺色 / 深色）",
    ...set.color.map((t) => `- ${t.name}: ${typeof t.value === "string" ? t.value : `${t.value.light} / ${t.value.dark ?? "(同淺色)"}`} — ${t.usage}`),
    "",
    "## spacing",
    ...set.spacing.map((t) => `- ${t.name}: ${t.value}`),
    "## radius",
    ...set.radius.map((t) => `- ${t.name}: ${t.value}`),
    "## shadow",
    ...set.shadow.map((t) => `- ${t.name}`),
    "## font families（--font-<key>）",
    ...Object.entries(set.families).map(([k, v]) => `- ${k}: ${v}`),
    "## type styles（class 名）",
    ...TYPE_GROUPS.flatMap((g) => g.styles.map((s) => `- .${s.name}: ${s.fontSize}/${s.lineHeight} ${s.fontWeight}`)),
    "",
    "## 對比報告",
    ...report.map((r) => `- [${r.theme}] ${r.fg} on ${r.bg}: ${r.text} ${r.pass ? "PASS" : "FAIL"} (≥${r.threshold})`),
  ].join("\n"),
);

console.log(`tokens: color ${set.color.length}, spacing ${set.spacing.length}, radius ${set.radius.length}, shadow ${set.shadow.length}, families ${Object.keys(set.families).length}`);
console.log(`contrast: ${report.length} pairs, ${failing.length} failing: ${failing.map((r) => `${r.theme}:${r.fg}/${r.bg}=${r.text}`).join(", ") || "none"}`);
if (set.skipped.length) console.log(`skipped: ${set.skipped.join(" | ")}`);
if (tokensOnly) process.exit(0);

// ── 其餘檔案：README、章節、元件（static/ 內手寫）、索引 ─────────────────────
const { renderReadme, renderSections } = await import("./docs");
writeFile(resolve(PROJECT, "README.md"), renderReadme(set, report));
for (const [path, text] of Object.entries(renderSections(set, report))) writeFile(resolve(PROJECT, path), text);

if (existsSync(STATIC)) cpSync(STATIC, PROJECT, { recursive: true, filter: (src) => !/\/_src(\/|$)|bundle\.body\.js$|\.d\.ts$/.test(src) || src.endsWith("index.d.ts") });

// 元件順序：群組順序 × 資料夾內的既定順序（bundle.js 標頭與元件表都照這個）
const GROUP_ORDER = ["Actions", "Inputs", "Data", "Feedback", "Layout", "Charts", "Diagram", "OrgChart"];
const groupOf = (name: string): string => {
  const first = readFileSync(resolve(PROJECT, "components", name, "preview.html"), "utf8").split("\n")[0];
  return /group="([^"]+)"/.exec(first)?.[1] ?? "";
};
const components = readdirSync(resolve(PROJECT, "components"), { withFileTypes: true })
  .filter((d) => d.isDirectory() && d.name !== "lib" && d.name !== "src" && d.name !== "_src")
  .map((d) => d.name)
  .filter((name) => existsSync(resolve(PROJECT, "components", name, "preview.html")))
  .sort((a, b) => {
    const ga = GROUP_ORDER.indexOf(groupOf(a));
    const gb = GROUP_ORDER.indexOf(groupOf(b));
    if (ga !== gb) return (ga < 0 ? 99 : ga) - (gb < 0 ? 99 : gb);
    return COMPONENT_ORDER.indexOf(a) - COMPONENT_ORDER.indexOf(b);
  });

// bundle.css ＝ _src/*.css 依檔名串接；index.d.ts ＝ _src/*.d.ts 串接；bundle.js ＝ 標頭 + bundle.body.js
const srcDir = resolve(STATIC, "components/_src");
const srcFiles = existsSync(srcDir) ? readdirSync(srcDir).sort() : [];
const css = srcFiles.filter((f) => f.endsWith(".css")).map((f) => readFileSync(resolve(srcDir, f), "utf8").trimEnd()).join("\n\n") + "\n";
if (/<\/style/i.test(css)) throw new Error("bundle.css 含 </style");
writeFile(resolve(PROJECT, "components/bundle.css"), `/* ${TITLE} — components/bundle.css；只用 tokens.css 的變數，載在 tokens.css 之後 */\n` + css);
const dts = srcFiles.filter((f) => f.endsWith(".d.ts")).map((f) => readFileSync(resolve(srcDir, f), "utf8").trimEnd()).join("\n\n") + "\n";
writeFile(resolve(PROJECT, "components/index.d.ts"), `/** ${TITLE}：純文件型別。元件是 CSS 類別（.lm-*）加少量行為（window.${NAMESPACE}），沒有 React 匯出；Props 描述消費者要提供的標記與屬性。 */\n\n` + dts);
const body = readFileSync(resolve(STATIC, "components/bundle.body.js"), "utf8");
const header = `/* @ds-bundle: ${JSON.stringify({ format: 4, namespace: NAMESPACE, components: components.filter((c) => c !== "Cover").map((name) => ({ name })) })} */`;
writeFile(resolve(PROJECT, "components/bundle.js"), `${header}\n${body}`);
(tokensJson.meta.components as Record<string, string>) = Object.fromEntries(components.filter((c) => c !== "Cover").map((c) => [c, `components/${c}/preview.html（hand-written）`]));
writeFile(resolve(PROJECT, "tokens.json"), JSON.stringify(tokensJson, null, 2));

const now = new Date().toISOString();
const index = {
  v: 3,
  layout: "files",
  createdOnFiles: { v: 1, at: now },
  title: TITLE,
  namespace: NAMESPACE,
  libraries: [],
  sections: {},
  groups: [],
  assetGroups: {},
  blobs: {},
  docs: { readme: "project/README.md", sections: [] },
  lastChange: { by: "Kiel", at: now, via: `GitHub · ${REPO_REF}`, note: "initial build from OpenIntelligentUI styles, design-system package and gallery analysis" },
};
writeFile(resolve(PROJECT, "design-system.json"), JSON.stringify(index, null, 2));

// ── 本機預覽：把 tokens.css、bundle.css、bundle.js 內嵌進每個 preview.html，另產總覽頁 ─────
const PREVIEW = resolve(HERE, "../preview");
rmSync(PREVIEW, { recursive: true, force: true });
mkdirSync(PREVIEW, { recursive: true });
const tokensCssText = readFileSync(resolve(PROJECT, "tokens.css"), "utf8");
const bundleCssText = readFileSync(resolve(PROJECT, "components/bundle.css"), "utf8");
const bundleJsText = readFileSync(resolve(PROJECT, "components/bundle.js"), "utf8");
// 主題：?theme=light|dark；沒有就跟隨系統。模擬 Artifact 預覽框在 <html> 設 data-theme。
const themeBoot = `(function(){var t=new URLSearchParams(location.search).get("theme");if(t!=="light"&&t!=="dark"){t=window.matchMedia&&matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";}document.documentElement.setAttribute("data-theme",t);})();`;
const cards: Array<{ name: string; group: string; height: number }> = [];
for (const name of ["Cover", ...components.filter((c) => c !== "Cover")]) {
  const src = readFileSync(resolve(PROJECT, "components", name, "preview.html"), "utf8");
  const first = src.split("\n")[0];
  cards.push({ name, group: /group="([^"]+)"/.exec(first)?.[1] ?? "", height: Number(/height=(\d+)/.exec(first)?.[1] ?? 120) });
  const html = src.replace(/<head>/i, `<head>\n<script>${themeBoot}</script>\n<style data-ds="tokens">${tokensCssText}</style>\n<style data-ds="bundle">${bundleCssText}</style>\n<script data-ds="bundle">${bundleJsText}</script>`);
  writeFile(resolve(PREVIEW, `${name}.html`), html);
}
const escHtml = (v: string) => v.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const groups = [...new Set(cards.filter((c) => c.name !== "Cover").map((c) => c.group))];
const sectionLinks = ["README.md", "01-design-method.md", "02-presentation-rules.md", "03-guardrails.md", "04-coverage-acceptance.md", "05-color-governance.md"];
const indexHtml = `<!doctype html>
<html lang="zh-Hant">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${TITLE} · 本機預覽</title>
<link rel="icon" href="data:,">
<script>${themeBoot}</script>
<link rel="stylesheet" href="../project/tokens.css">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Spline+Sans+Mono:wght@400;500&display=swap" rel="stylesheet">
<style>
  html, body { margin: 0; }
  body { background: var(--background); color: var(--text-primary); font-family: var(--font-sans); }
  .top { position: sticky; top: 0; z-index: 2; display: flex; flex-wrap: wrap; gap: var(--space-3); align-items: center; justify-content: space-between; padding: var(--space-3) var(--space-4); background: var(--background); border-bottom: 1px solid var(--border-default); }
  .top h1 { margin: 0; font-size: 16px; font-weight: 700; letter-spacing: -0.4px; }
  .seg { display: inline-flex; gap: 2px; padding: 2px; border-radius: var(--radius-md); background: var(--surface-quaternary); }
  .seg button { font: 500 13px/1 var(--font-sans); padding: 6px 12px; border: 0; border-radius: var(--radius-sm); background: transparent; color: var(--text-secondary); cursor: pointer; }
  .seg button[aria-pressed="true"] { background: var(--surface-primary); color: var(--text-primary); box-shadow: var(--shadow-sm); }
  main { max-width: 1040px; margin: 0 auto; padding: var(--space-6) var(--space-4) var(--space-8); }
  nav.toc { display: flex; flex-wrap: wrap; gap: var(--space-2); margin-bottom: var(--space-6); font-size: 13px; }
  nav.toc a { color: var(--text-secondary); text-decoration: none; padding: 4px 10px; border: 1px solid var(--border-default); border-radius: var(--radius-sm); }
  nav.toc a:hover { color: var(--text-primary); border-color: var(--border-hover); }
  .docs { font-size: 13px; color: var(--text-secondary); margin: 0 0 var(--space-6); }
  .docs a { color: var(--text-primary); }
  h2 { font-size: 15px; font-weight: 600; margin: var(--space-8) 0 var(--space-3); }
  figure { margin: 0 0 var(--space-4); border: 1px solid var(--border-default); border-radius: var(--radius-lg); overflow: hidden; background: var(--surface-primary); }
  figcaption { display: flex; justify-content: space-between; gap: var(--space-3); padding: var(--space-2) var(--space-4); font-size: 13px; font-weight: 600; border-bottom: 1px solid var(--border-default); }
  figcaption a { font-weight: 400; color: var(--text-secondary); }
  iframe { display: block; width: 100%; border: 0; }
  .cover-wrap { overflow-x: auto; }
  .cover-wrap iframe { width: 960px; }
</style>
</head>
<body>
<header class="top">
  <h1>${TITLE} · 本機預覽</h1>
  <div class="seg" role="group" aria-label="主題">
    <button type="button" data-set="light">淺色</button><button type="button" data-set="dark">深色</button><button type="button" data-set="system">跟隨系統</button>
  </div>
</header>
<main>
  <p class="docs">品牌書與章節：${sectionLinks.map((f) => `<a href="../project/${f}">${f}</a>`).join("、")}（在 GitHub 上會渲染成 Markdown）。每張卡片是一個元件的實況預覽，樣式來自 <code>project/tokens.css</code> 與 <code>project/components/bundle.css</code>。</p>
  <nav class="toc">${groups.map((g) => `<a href="#g-${g}">${g}</a>`).join("")}</nav>
  <figure><figcaption>Cover<a href="Cover.html">單獨開啟</a></figcaption><div class="cover-wrap"><iframe data-src="Cover.html" title="Cover" style="height:${cards[0].height}px" loading="lazy"></iframe></div></figure>
${groups
  .map(
    (g) => `  <h2 id="g-${g}">${g}</h2>\n${cards
      .filter((c) => c.group === g)
      .map((c) => `  <figure id="${c.name}"><figcaption>${c.name}<span><a href="../project/components/${c.name}/README.md">README</a> · <a href="${c.name}.html">單獨開啟</a></span></figcaption><iframe data-src="${c.name}.html" title="${escHtml(c.name)}" style="height:${c.height}px" loading="lazy"></iframe></figure>`)
      .join("\n")}`,
  )
  .join("\n")}
</main>
<script>
(function () {
  var frames = Array.prototype.slice.call(document.querySelectorAll("iframe[data-src]"));
  var buttons = Array.prototype.slice.call(document.querySelectorAll("[data-set]"));
  function apply(choice) {
    var theme = choice;
    if (choice === "system") theme = window.matchMedia && matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", theme);
    frames.forEach(function (f) { f.src = f.getAttribute("data-src") + "?theme=" + theme; });
    buttons.forEach(function (b) { b.setAttribute("aria-pressed", b.getAttribute("data-set") === choice ? "true" : "false"); });
    try { localStorage.setItem("lm-preview-theme", choice); } catch (e) {}
  }
  var saved = "system";
  try { saved = localStorage.getItem("lm-preview-theme") || "system"; } catch (e) {}
  buttons.forEach(function (b) { b.addEventListener("click", function () { apply(b.getAttribute("data-set")); }); });
  apply(saved);
})();
</script>
</body>
</html>
`;
writeFile(resolve(PREVIEW, "index.html"), indexHtml);

// ── 自檢 ───────────────────────────────────────────────
const problems: string[] = [];
const walk = (dir: string): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap((d) => (d.isDirectory() ? walk(resolve(dir, d.name)) : [resolve(dir, d.name)]));
const files = walk(PROJECT);
let total = 0;
for (const f of files) {
  const size = statSync(f).size;
  total += size;
  const rel = f.slice(PROJECT.length + 1);
  if (rel.endsWith("preview.html")) {
    const first = readFileSync(f, "utf8").split("\n")[0];
    if (!/^<!-- @dsCard/.test(first)) problems.push(`${rel}: 第一行不是 @dsCard 標記`);
    if (/<iframe|<object|<embed|<noscript/i.test(readFileSync(f, "utf8"))) problems.push(`${rel}: 含禁止的嵌入元素`);
  }
  if (rel === "components/bundle.js") {
    const js = readFileSync(f, "utf8");
    if (/\bimport\s|<\/script|<!--/.test(js)) problems.push("bundle.js 含 import、</script 或 <!--");
    if (!js.includes(`window.${NAMESPACE}`)) problems.push(`bundle.js 沒有指派 window.${NAMESPACE}`);
  }
}
const sections = files.filter((f) => f.endsWith(".md") && !f.includes("/components/") && !f.endsWith("README.md")).length;
if (sections > 24) problems.push(`章節 ${sections} 份超過 24`);
for (const c of components) if (!existsSync(resolve(PROJECT, "components", c, "README.md")) && c !== "Cover") problems.push(`components/${c} 缺 README.md`);
if (!existsSync(resolve(PROJECT, "components/Cover/preview.html"))) problems.push("缺 Cover");

console.log(`project: ${files.length} files, ${(total / 1024).toFixed(0)} KB, components ${components.length} (${components.join(", ")}), sections ${sections}`);
if (problems.length) {
  console.error(`PROBLEMS:\n${problems.join("\n")}`);
  process.exitCode = 1;
} else console.log("checks OK");
