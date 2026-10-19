/**
 * 靜態重製版 Artifact 的共用 helper。所有區塊模組都回傳 HTML 字串；互動只靠 generate.ts 注入的幾個通用 hook：
 *  - 分頁：容器 [data-tabs] 內的 button[role=tab][data-tab=K] 與 [data-panel=K]（點擊切換 hidden 與 aria-selected）
 *  - toast：任何元素加 data-toast="文字"，點擊後底部顯示 4 秒
 *  - 主題：button[data-theme-set=light|dark|system]
 *  - 深連結：純 token 的 #id
 * CSS 類別一律用 /gallery 的 gallery.css（.gal-*），產生器會整份帶入並改寫成三態主題。
 */
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { GALLERY_SECTIONS } from "@/components/ui-gallery/section-list";

export const REPO = resolve(process.cwd(), "../../.."); // build.mjs 以 generator/ 為 cwd 執行
export const APP_SRC = `${REPO}/apps/app/src`;
export const SHOT_DIRS = [resolve(process.cwd(), "shots")];
export const BRANCH_URL = "https://github.com/kielchang/OpenIntelligentUI/tree/claude/serene-shannon-z0fh1s";

export function esc(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** 發布時與 index.html 一起上傳的檔案：路徑 → 內容 */
export const ASSETS = new Map<string, string | Buffer>();

export function addAsset(path: string, content: string | Buffer): string {
  ASSETS.set(path, content);
  return path;
}

export function shotPath(file: string): string | null {
  for (const dir of SHOT_DIRS) {
    const candidate = resolve(dir, file);
    if (existsSync(candidate)) return candidate;
  }
  return null;
}

/** 截圖：從 generator/shots 找檔，登記成 assets/shots/<file> 並回傳 <figure> */
export function shot(file: string, alt: string, caption?: string, opts: { maxWidth?: number } = {}): string {
  const source = shotPath(file);
  if (!source) throw new Error(`screenshot not found: ${file}`);
  const path = `assets/shots/${file}`;
  if (!ASSETS.has(path)) ASSETS.set(path, readFileSync(source));
  const style = opts.maxWidth ? ` style="max-width:${opts.maxWidth}px"` : "";
  return `<figure class="gal-shot"${style}><img src="${path}" alt="${esc(alt)}" loading="lazy" decoding="async">${
    caption ? `<figcaption>${caption}</figcaption>` : ""
  }</figure>`;
}

export type ItemState = "mounted" | "unmounted" | "agent" | "css";
/** 呈現方式：live = 真的在跑（iframe／計算）、replica = 靜態複刻、shot = 截圖、computed = 產生期算出的數字 */
export type ShowKind = "live" | "replica" | "shot" | "computed";

const STATE_LABEL: Record<ItemState, string> = { mounted: "已掛載", unmounted: "未掛載", agent: "代理端定義", css: "純 CSS" };
const SHOW_LABEL: Record<ShowKind, string> = { live: "真品", replica: "複刻", shot: "截圖", computed: "產生期計算" };
const SHOW_WIRED: Record<ShowKind, string> = { live: "wired", computed: "wired", replica: "partial", shot: "external" };

export function badge(text: string, state: string): string {
  return `<span class="gal-badge" data-state="${esc(state)}">${esc(text)}</span>`;
}

export function showBadge(kind: ShowKind): string {
  return `<span class="gal-wired" data-wired="${SHOW_WIRED[kind]}" title="在 Artifact 裡的呈現方式">${SHOW_LABEL[kind]}</span>`;
}

export interface ItemOpts {
  id?: string;
  name: string;
  exportName?: string;
  path: string;
  state: ItemState;
  show?: ShowKind;
  propsSummary?: string;
  /** HTML */
  note?: string;
  demo?: "boxed" | "plain" | "center";
  wide?: boolean;
  /** HTML */
  body: string;
}

export function item(o: ItemOpts): string {
  const demo = o.demo ?? "boxed";
  return `<article${o.id ? ` id="${esc(o.id)}"` : ""} class="gal-item${o.wide ? " gal-item--wide" : ""}" data-state="${o.state}">
  <header class="gal-item-head"><h3>${esc(o.name)}</h3><span class="gal-badges">${o.show ? showBadge(o.show) : ""}${badge(STATE_LABEL[o.state], o.state)}</span></header>
  <p class="gal-meta">${o.exportName ? `<code>${esc(o.exportName)}</code><span aria-hidden="true"> · </span>` : ""}<span class="gal-path">${esc(o.path)}</span></p>
  ${o.propsSummary ? `<p class="gal-props">${esc(o.propsSummary)}</p>` : ""}
  <div class="gal-demo gal-demo--${demo}">${o.body}</div>
  ${o.note ? `<div class="gal-note">${o.note}</div>` : ""}
</article>`;
}

export function section(id: string, intro: string, body: string): string {
  const index = GALLERY_SECTIONS.findIndex((s) => s.id === id);
  const meta = GALLERY_SECTIONS[index];
  return `<section id="${id}" class="gal-section" aria-labelledby="${id}-title">
  <header class="gal-section-head"><span class="gal-section-index">${String(index + 1).padStart(2, "0")}</span><div><h2 id="${id}-title">${esc(meta?.label ?? id)}</h2>${meta?.blurb ? `<p class="gal-section-blurb">${esc(meta.blurb)}</p>` : ""}</div></header>
  ${intro ? `<div class="gal-section-intro">${intro}</div>` : ""}
  ${body}
</section>`;
}

/** 表格：headers 是純文字，rows 的每格是 HTML（呼叫端自行 esc） */
export function table(headers: string[], rows: string[][], opts: { dense?: boolean; className?: string } = {}): string {
  return `<div class="gal-table-wrap"><table class="gal-table${opts.dense ? " gal-table--dense" : ""}${opts.className ? ` ${opts.className}` : ""}">
<thead><tr>${headers.map((h) => `<th>${esc(h)}</th>`).join("")}</tr></thead>
<tbody>${rows.map((row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join("")}</tr>`).join("\n")}</tbody>
</table></div>`;
}

export const subhead = (text: string) => `<h3 class="gal-subhead">${esc(text)}</h3>`;
export const lede = (html: string) => `<p class="gal-lede">${html}</p>`;
export const callout = (html: string) => `<div class="gal-callout">${html}</div>`;
export const pathSpan = (path: string) => `<span class="gal-path">${esc(path)}</span>`;
export const code = (text: string) => `<code>${esc(text)}</code>`;
export const anchor = (href: string, label: string) => `<a class="gal-anchor" href="${esc(href)}">${esc(label)} ↓</a>`;

export function details(summary: string, body: string, open = false): string {
  return `<details class="gal-details"${open ? " open" : ""}><summary>${esc(summary)}</summary>${body}</details>`;
}

export function codeBlock(text: string, className = "gal-source-body"): string {
  return `<pre class="${className}"><code>${esc(text)}</code></pre>`;
}

let tabSeq = 0;
/** 通用分頁：panels 是 HTML */
export function tabs(items: { key: string; label: string; panel: string }[], opts: { active?: string; ariaLabel?: string; headExtra?: string } = {}): string {
  const active = opts.active ?? items[0]?.key;
  const id = `tabs-${++tabSeq}`;
  return `<div class="gal-source" data-tabs="${id}">
  <div class="gal-source-head"><div class="gal-source-tabs" role="tablist"${opts.ariaLabel ? ` aria-label="${esc(opts.ariaLabel)}"` : ""}>${items
    .map((t) => `<button type="button" role="tab" data-tab="${esc(t.key)}" aria-selected="${t.key === active}">${esc(t.label)}</button>`)
    .join("")}</div>${opts.headExtra ?? ""}</div>
  ${items.map((t) => `<div role="tabpanel" data-panel="${esc(t.key)}"${t.key === active ? "" : " hidden"}>${t.panel}</div>`).join("\n")}
</div>`;
}

/** 分段按鈕（主題、模式切換）：以 data-tabs 同一機制實作，panels 由呼叫端給 */
export function seg(items: { key: string; label: string; panel: string }[], opts: { active?: string; ariaLabel?: string } = {}): string {
  const active = opts.active ?? items[0]?.key;
  const id = `seg-${++tabSeq}`;
  return `<div class="gal-stack" data-tabs="${id}">
  <div class="gal-seg" role="tablist"${opts.ariaLabel ? ` aria-label="${esc(opts.ariaLabel)}"` : ""}>${items
    .map((t) => `<button type="button" role="tab" data-tab="${esc(t.key)}" aria-selected="${t.key === active}" aria-pressed="${t.key === active}">${esc(t.label)}</button>`)
    .join("")}</div>
  ${items.map((t) => `<div role="tabpanel" data-panel="${esc(t.key)}"${t.key === active ? "" : " hidden"}>${t.panel}</div>`).join("\n")}
</div>`;
}

export function readRepo(relPath: string): string {
  return readFileSync(resolve(REPO, relPath), "utf8");
}

/** 從一份 CSS 文字裡抽出符合選擇器前綴的完整規則（含巢狀的 @keyframes 不處理），用來真實套用 globals.css 的視覺樣式 */
export function extractCssRules(css: string, matcher: (selector: string) => boolean): string {
  const out: string[] = [];
  const re = /([^{}]+)\{([^{}]*)\}/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(css))) {
    const selector = m[1].trim();
    if (selector.startsWith("@")) continue;
    if (matcher(selector)) out.push(`${selector} {${m[2]}}`);
  }
  return out.join("\n");
}
