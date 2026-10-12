/**
 * 08 已設計未掛載。元件依原始標記與 globals.css 的真實規則靜態複刻；
 * 抽屜、QR 視窗、範本 chip 的 portal 行為需要 React／CopilotKit runtime，用本機 /gallery 截圖。
 */
import { DEMO_CATEGORIES, DEMO_EXAMPLES, type DemoItem } from "@/components/demo-gallery/demo-data";
import { SEED_TEMPLATES } from "@/components/template-library/seed-templates";
import { splitLeadingStyle } from "@/components/ui-gallery/split-leading-style";
import { BAR_CHART_FIXTURE, PICK_PROMPTS, PIE_CHART_FIXTURE } from "@/components/ui-gallery/gallery-fixtures";
import { CHART_COLORS } from "@/components/generative-ui/charts/config";
import { addAsset, BRANCH_URL, esc, item, readRepo, section, shot } from "../html";
import { extractThemedCss, prefixSelectors, scopedDesignSystemCss, stripInlineHandlers, themedVars } from "./replica-css";

/* ── 分類篩選與示範卡 ── */

function demoCard(demo: DemoItem): string {
  return `<button type="button" class="rp-demo-card" data-toast="${esc(`onTry → ${demo.title}`)}">
  <span class="rp-demo-card-body">
    <span class="rp-demo-card-head">
      <span class="rp-demo-card-title"><span class="rp-demo-emoji" aria-hidden="true">${esc(demo.emoji)}</span><span class="rp-demo-h">${esc(demo.title)}</span></span>
      <span class="rp-demo-cat">${esc(demo.category)}</span>
    </span>
    <span class="rp-demo-desc">${esc(demo.description)}</span>
  </span>
</button>`;
}

function categoryFilterReplica(): string {
  const panels: { key: string; label: string; items: DemoItem[] }[] = [
    { key: "all", label: "All", items: DEMO_EXAMPLES },
    ...DEMO_CATEGORIES.map((category) => ({ key: category.toLowerCase().replace(/\s+/g, "-"), label: category, items: DEMO_EXAMPLES.filter((demo) => demo.category === category) })),
  ];
  return `<div class="gal-stack rp-cat" data-tabs="rp-cat">
  <div class="rp-cat-chips" role="tablist" aria-label="CategoryFilter">${panels
    .map((panel) => `<button type="button" role="tab" data-tab="${panel.key}" aria-selected="${panel.key === "all"}">${esc(panel.label)}</button>`)
    .join("")}</div>
  ${panels
    .map(
      (panel) =>
        `<div role="tabpanel" data-panel="${panel.key}"${panel.key === "all" ? "" : " hidden"}><div class="gal-stack">${
          panel.items.length ? panel.items.map(demoCard).join("") : `<p class="rp-demo-empty">No demos in this category</p>`
        }</div></div>`,
    )
    .join("\n")}
</div>`;
}

/* ── 範本卡 ── */

type Datum = { label: string; value: number };

function barPreview(data: Datum[]): string {
  const max = Math.max(...data.map((d) => d.value));
  const barWidth = Math.min(40, Math.floor(280 / data.length) - 8);
  const chartWidth = data.length * (barWidth + 8);
  const chartHeight = 100;
  const rects = data
    .map((d, i) => {
      const h = max > 0 ? (d.value / max) * (chartHeight - 20) : 0;
      return `<rect x="${i * (barWidth + 8)}" y="${(chartHeight - h - 10).toFixed(2)}" width="${barWidth}" height="${h.toFixed(2)}" rx="3" fill="${CHART_COLORS[i % CHART_COLORS.length]}"/>`;
    })
    .join("");
  return `<svg viewBox="0 0 ${chartWidth} ${chartHeight}" width="100%" height="100%" preserveAspectRatio="xMidYMid meet" style="padding:16px" aria-hidden="true">${rects}</svg>`;
}

function piePreview(data: Datum[]): string {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  const cx = 60;
  const cy = 60;
  const r = 50;
  let cumulative = 0;
  const slices = data
    .map((d, i) => {
      const startAngle = (cumulative / total) * 2 * Math.PI - Math.PI / 2;
      cumulative += d.value;
      const endAngle = (cumulative / total) * 2 * Math.PI - Math.PI / 2;
      const largeArc = d.value / total > 0.5 ? 1 : 0;
      const x1 = cx + r * Math.cos(startAngle);
      const y1 = cy + r * Math.sin(startAngle);
      const x2 = cx + r * Math.cos(endAngle);
      const y2 = cy + r * Math.sin(endAngle);
      return `<path d="M${cx},${cy} L${x1.toFixed(2)},${y1.toFixed(2)} A${r},${r} 0 ${largeArc},1 ${x2.toFixed(2)},${y2.toFixed(2)} Z" fill="${CHART_COLORS[i % CHART_COLORS.length]}"/>`;
    })
    .join("");
  return `<svg viewBox="0 0 120 120" width="100%" height="100%" preserveAspectRatio="xMidYMid meet" aria-hidden="true">${slices}</svg>`;
}

interface TemplateCardOpts {
  id: string;
  name: string;
  description: string;
  html: string;
  componentType?: "barChart" | "pieChart";
  data?: Datum[];
  dataDescription: string;
  version: number;
  deletable?: boolean;
}

function templateCard(t: TemplateCardOpts): string {
  let preview: string;
  if (t.componentType && t.data) {
    preview = `<div class="rp-tc-chart">${t.componentType === "barChart" ? barPreview(t.data) : piePreview(t.data)}</div>`;
  } else if (t.html) {
    preview = `<div class="rp-tc-scale" aria-hidden="true">${stripInlineHandlers(t.html)}</div>`;
  } else {
    preview = `<div class="rp-tc-chart"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="color:var(--text-tertiary);opacity:0.5" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg></div>`;
  }
  return `<div class="rp-tc rp-ds">
  <div class="rp-tc-preview">${preview}<span class="rp-tc-version">v${t.version}</span></div>
  <div class="rp-tc-info">
    <h4 class="rp-tc-name">${esc(t.name)}</h4>
    <p class="rp-tc-desc">${esc(t.description)}</p>
    ${t.dataDescription ? `<p class="rp-tc-data">Data: ${esc(t.dataDescription)}</p>` : ""}
  </div>
  <div class="rp-tc-actions">
    <button type="button" class="rp-tc-apply" data-toast="${esc(`onApply(${t.id}) → 寫入 pending_template 並聚焦輸入框`)}">Apply</button>
    ${t.deletable ? `<button type="button" class="rp-tc-delete" data-toast="${esc(`onDelete(${t.id})`)}">Delete</button>` : ""}
  </div>
</div>`;
}

/* ── 範本 chip（就地渲染的 fallback 外觀） ── */

function templateChip(name: string): string {
  return `<div class="rp-chip" id="rp-chip">
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="opacity:0.55;flex-shrink:0" aria-hidden="true"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></svg>
  <span class="rp-chip-name">${esc(name)}</span>
  <button type="button" class="rp-chip-x" aria-label="Remove template" data-toast="示範：handleDismiss → agent.setState({ pending_template: null })"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg></button>
</div>`;
}

/* ── QR 按鈕與狀態列 ── */

const QR_STATUS: Record<"waiting" | "scanned" | "picked", string> = {
  waiting: "Waiting for scan...",
  scanned: "Scanned! Waiting for pick...",
  picked: "Pick received!",
};

function qrButton(): string {
  return `<button type="button" class="rp-qr-btn" title="QR Code — Audience Pick" data-toast="示範：setQrOpen(true)；視窗需要 qrcode.react 與 /api/pick/ip，見下方截圖">
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" aria-hidden="true"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="3" height="3"/><path d="M21 14h-3v3"/><path d="M18 21h3v-3"/></svg>
  <span>QR Pick</span>
</button>`;
}

function qrStatusRow(status: "waiting" | "scanned" | "picked"): string {
  return `<div class="rp-qr-status" data-status="${status}"><span class="rp-qr-dot" aria-hidden="true"></span>${esc(QR_STATUS[status])}<code>${status}</code></div>`;
}

/* ── 手機提示視窗（靜態卡片，不做全螢幕遮罩） ── */

function desktopTip(): string {
  return `<div class="rp-tip-backdrop">
  <div class="rp-tip" role="dialog" aria-labelledby="rp-tip-title">
    <div class="rp-tip-icon"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--color-lilac-dark)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8"/><path d="M12 17v4"/></svg></div>
    <h2 id="rp-tip-title">Best viewed on desktop</h2>
    <p>This experience includes interactive visualizations that work best on larger screens.</p>
    <button type="button" data-toast="示範：dismiss() → sessionStorage.setItem('desktop-tip-dismissed', '1')">Continue anyway</button>
  </div>
</div>`;
}

/* ── 歡迎畫面說明卡（內容與 explainer-cards.tsx 相同） ── */

const EXPLAINER_CARDS = [
  {
    icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/></svg>`,
    title: "Generative UI",
    description: "AI generates interactive charts, visualizations, and rich components directly in the conversation.",
  },
  {
    icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>`,
    title: "Interactive Widgets",
    description: "Complex HTML/JS visualizations run in sandboxed iframes — try asking for an animation or diagram.",
  },
  {
    icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>`,
    title: "Visualize Anything",
    description: "Ask for algorithm visualizations, 3D animations, diagrams, or any interactive visual explanation.",
  },
];

function explainerCards(): string {
  return `<div class="explainer-cards">${EXPLAINER_CARDS.map(
    (card) => `<div class="explainer-card">
  <div style="display:flex;align-items:center;gap:8px"><div class="explainer-card-icon">${card.icon}</div><span style="font-size:13px;font-weight:600;color:var(--text-primary)">${esc(card.title)}</span></div>
  <p style="font-size:12px;line-height:1.5;color:var(--text-secondary);margin:0">${esc(card.description)}</p>
</div>`,
  ).join("")}</div>`;
}

/* ── 只存在於 CSS 的視覺樣式（標記與 React 的 CssShowcase 相同） ── */

function cssShowcase(): string {
  return `<div class="gal-stack rp-css">
  <div class="gal-bg-frame">
    <div class="abstract-bg"><div class="blob-3"></div></div>
    <div class="gal-bg-content">
      <div class="glass-card"><strong class="text-gradient" style="font-size:16px">.glass-card + .text-gradient</strong><p style="margin:6px 0 0;font-size:12px;color:var(--text-secondary)">backdrop-filter 12px、玻璃邊框、hover 上浮</p></div>
      <div class="glass-subtle" style="padding:16px"><strong style="font-size:13px">.glass-subtle</strong><p style="margin:6px 0 0;font-size:12px;color:var(--text-secondary)">較輕的玻璃，用在歡迎卡</p></div>
      <div class="border-gradient" style="padding:16px;border-radius:12px"><strong style="font-size:13px">.border-gradient</strong><p style="margin:6px 0 0;font-size:12px;color:var(--text-secondary)">lilac → mint 漸層邊框</p></div>
    </div>
  </div>
  <div>
    <div class="branded-header-title">.branded-header-title</div>
    <div class="branded-header-subtitle">.branded-header-subtitle — 品牌漸層標題與副標</div>
  </div>
  <div class="cta-banner" style="border-radius:12px;border:1px solid var(--border-default)">
    <div class="cta-content">
      <div class="cta-text">
        <span class="cta-icon" aria-hidden="true"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg></span>
        <p class="cta-headline">.cta-banner <span class="cta-subtext">— 帶漸層 icon 與主要按鈕的橫幅</span></p>
      </div>
      <div class="cta-actions"><button type="button" class="cta-btn cta-btn--primary" data-toast=".cta-btn--primary：純樣式，沒有行為">.cta-btn--primary</button></div>
    </div>
  </div>
</div>`;
}

/* ── 手機投票頁（依 pick/page.tsx 的 inline styles 靜態複刻） ── */

function pickPage(): string {
  const picks = [1, 2, 7].map((index) => PICK_PROMPTS[index]);
  return `<div class="rp-phone" id="rp-pick">
  <div class="rp-pick">
    <div class="rp-pick-state" data-state="choose">
      <h1>Pick a Visualization</h1>
      <p class="rp-pick-sub">Tap one and the AI agent will build it live.</p>
      <div class="rp-pick-grid">${picks
        .map((prompt) => `<button type="button" class="rp-pick-card" data-toast="${esc(`示範：POST /api/pick { sessionId: 'gallery-demo', prompt: '${prompt.title}…' }`)}"><span class="rp-pick-emoji" aria-hidden="true">${esc(prompt.emoji)}</span><span>${esc(prompt.title)}</span></button>`)
        .join("")}</div>
    </div>
    <div class="rp-pick-state rp-pick-success" data-state="sent" hidden>
      <span style="font-size:48px">&#10003;</span>
      <h2>Sent!</h2>
      <p>Look up at the big screen to see it come to life.</p>
      <button type="button" class="rp-pick-reset">重設示範</button>
    </div>
  </div>
</div>`;
}

/* ── Open Graph 社群圖（依 opengraph-image.tsx 的版面以 CSS 等比複刻） ── */

function ogImage(logo: string): string {
  return `<div class="rp-og-wrap"><div class="rp-og" role="img" aria-label="Open Graph 預覽：Answers you can interact with">
  <div class="rp-og-top">Open Generative UI <span class="rp-og-by">by <img src="${logo}" alt="CopilotKit"></span></div>
  <div class="rp-og-title"><span>Answers you can</span><span class="rp-og-accent">interact with.</span></div>
  <div class="rp-og-chips"><span>Understand</span><span>Compare</span><span>Make a tool</span></div>
  <div class="rp-og-foot">Open source. Built with CopilotKit.</div>
</div></div>`;
}

/* ── 樣式 ── */

const REPLICA_CSS = `
.rp-unm [hidden] { display: none !important; }
.rp-cat-chips { display: flex; gap: 8px; overflow-x: auto; padding-bottom: 4px; }
.rp-cat-chips button { flex-shrink: 0; padding: 6px 12px; border-radius: 999px; font-size: 12px; font-weight: 500; cursor: pointer; background: var(--surface-primary); color: var(--text-secondary); border: 1px solid var(--border-default); font-family: inherit; transition: all 150ms; }
.rp-cat-chips button[aria-selected="true"] { background: linear-gradient(135deg, var(--color-lilac-dark), var(--color-mint-dark)); color: #fff; border-color: transparent; }
.rp-demo-card { display: flex; flex-direction: column; text-align: left; width: 100%; border-radius: 12px; overflow: hidden; border: 1px solid var(--border-default); background: var(--surface-primary); color: var(--text-primary); cursor: pointer; padding: 0; font-family: inherit; transition: box-shadow 200ms, transform 200ms; }
.rp-demo-card:hover { box-shadow: 0 10px 25px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.03); transform: translateY(-2px); }
.rp-demo-card-body { display: flex; flex-direction: column; gap: 6px; padding: 16px; }
.rp-demo-card-head { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.rp-demo-card-title { display: flex; align-items: center; gap: 8px; min-width: 0; }
.rp-demo-emoji { font-size: 18px; }
.rp-demo-h { font-size: 14px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.rp-demo-cat { font-size: 10px; font-weight: 600; padding: 2px 8px; border-radius: 999px; flex-shrink: 0; background: var(--surface-quaternary); color: var(--text-secondary); }
.rp-demo-desc { font-size: 12px; color: var(--text-secondary); display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.rp-demo-empty { margin: 0; padding: 32px 0; text-align: center; font-size: 14px; font-weight: 500; color: var(--text-secondary); }
.rp-tc { border-radius: 12px; overflow: hidden; display: flex; flex-direction: column; border: 1px solid var(--border-default); background: var(--surface-primary); color: var(--text-primary); min-width: 0; }
.rp-tc-preview { position: relative; overflow: hidden; height: 140px; background: var(--color-background-secondary); }
.rp-tc-scale { position: absolute; inset: 0; width: 300%; height: 300%; transform: scale(0.333); transform-origin: top left; pointer-events: none; background: var(--color-background-primary); color: var(--color-text-primary); font: 16px/1.7 system-ui, -apple-system, sans-serif; overflow: hidden; }
.rp-tc-scale * { box-sizing: border-box; }
.rp-tc-chart { height: 100%; display: flex; align-items: center; justify-content: center; }
.rp-tc-chart svg { width: 100%; height: 100%; }
.rp-tc-version { position: absolute; top: 8px; right: 8px; font-size: 10px; font-weight: 600; padding: 2px 6px; border-radius: 999px; background: var(--color-background-info); color: var(--color-text-info); }
.rp-tc-info { display: flex; flex-direction: column; gap: 4px; padding: 12px; flex: 1; }
.rp-tc-name { font-size: 14px; font-weight: 600; margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.rp-tc-desc { font-size: 12px; color: var(--text-secondary); margin: 0; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.rp-tc-data { font-size: 10px; margin: 4px 0 0; color: var(--text-tertiary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.rp-tc-actions { display: flex; gap: 8px; padding: 0 12px 12px; }
.rp-tc-apply { flex: 1; font-size: 12px; font-weight: 500; padding: 6px; border-radius: 8px; border: 0; color: #fff; background: linear-gradient(135deg, var(--color-lilac-dark), var(--color-mint-dark)); cursor: pointer; font-family: inherit; transition: transform 150ms; }
.rp-tc-apply:hover { transform: scale(1.02); }
.rp-tc-delete { font-size: 12px; padding: 6px 12px; border-radius: 8px; background: none; border: 1px solid var(--color-border-tertiary); color: var(--color-text-danger); cursor: pointer; font-family: inherit; }
.rp-chip { display: inline-flex; align-items: center; gap: 6px; padding: 2px 4px 2px 8px; border-radius: 6px; font-size: 12px; font-weight: 500; user-select: none; background: linear-gradient(135deg, rgba(99, 102, 241, 0.12), rgba(16, 185, 129, 0.12)); border: 1px solid rgba(99, 102, 241, 0.22); color: var(--text-primary); animation: rp-chip-in 0.15s ease-out; }
.rp-chip-name { max-width: 140px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; line-height: 16px; }
.rp-chip-x { padding: 2px; border-radius: 4px; border: 0; background: none; color: inherit; line-height: 0; cursor: pointer; }
.rp-chip-x:hover { background: rgba(127, 127, 127, 0.2); }
@keyframes rp-chip-in { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }
.rp-qr-btn { display: inline-flex; align-items: center; gap: 6px; padding: 8px 12px; border-radius: 999px; font-size: 14px; font-weight: 500; white-space: nowrap; cursor: pointer; color: var(--text-secondary); border: 1px solid var(--border-default); background: var(--surface-primary); font-family: var(--font-family); transition: transform 150ms; }
.rp-qr-btn:hover { transform: translateY(-1px); }
.rp-qr-status { display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 500; color: var(--text-secondary); }
.rp-qr-status code { margin-left: 4px; font-size: 11px; color: var(--text-tertiary); }
.rp-qr-dot { width: 8px; height: 8px; border-radius: 50%; background: currentColor; }
.rp-qr-status[data-status="waiting"] .rp-qr-dot { animation: rp-pulse 2s infinite; }
.rp-qr-status[data-status="scanned"] { color: #e6a817; }
.rp-qr-status[data-status="picked"] { color: #1b936f; }
@keyframes rp-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
.rp-tip-backdrop { display: flex; align-items: center; justify-content: center; padding: 24px; border-radius: var(--radius-lg); background: rgba(0, 0, 0, 0.45); backdrop-filter: blur(6px); }
.rp-tip { background: var(--color-glass-dark); backdrop-filter: blur(16px); border: 1px solid var(--color-border-glass); border-radius: var(--radius-xl); box-shadow: var(--shadow-glass); padding: 32px 28px; max-width: 340px; width: 100%; text-align: center; font-family: var(--font-family); color: var(--text-primary); }
.rp-tip-icon { width: 56px; height: 56px; margin: 0 auto 20px; border-radius: 14px; background: linear-gradient(135deg, rgba(190, 194, 255, 0.15), rgba(133, 224, 206, 0.12)); display: flex; align-items: center; justify-content: center; }
.rp-tip h2 { font-size: 18px; font-weight: 700; margin: 0 0 8px; letter-spacing: -0.01em; }
.rp-tip p { font-size: 14px; color: var(--text-secondary); margin: 0 0 24px; line-height: 1.5; }
.rp-tip button { width: 100%; padding: 10px 20px; border-radius: 999px; font-size: 14px; font-weight: 600; font-family: var(--font-family); color: #fff; background: linear-gradient(135deg, var(--color-lilac-dark), var(--color-mint-dark)); border: 0; box-shadow: 0 1px 4px rgba(149, 153, 204, 0.3); cursor: pointer; }
.rp-explainer .explainer-cards { margin: 0 auto; }
.rp-css .glass-card, .rp-css .glass-subtle, .rp-css .border-gradient { color: var(--text-primary); }
.rp-css .cta-btn { font-family: var(--font-family); }
.rp-phone { width: 375px; max-width: 100%; height: 640px; border: 10px solid var(--text-primary); border-radius: 28px; background: #000; overflow: hidden; box-sizing: border-box; }
.rp-pick { height: 100%; box-sizing: border-box; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 24px 16px; font-family: 'Plus Jakarta Sans', system-ui, sans-serif; background: linear-gradient(145deg, #0f0f1a 0%, #1a1a2e 50%, #16213e 100%); color: #fff; }
.rp-pick-state { width: 100%; display: flex; flex-direction: column; align-items: center; }
.rp-pick h1 { font-size: 24px; font-weight: 700; margin: 0 0 4px; text-align: center; color: #fff; }
.rp-pick-sub { font-size: 14px; color: rgba(255, 255, 255, 0.6); margin: 0 0 32px; text-align: center; }
.rp-pick-grid { display: flex; flex-direction: column; gap: 14px; width: 100%; max-width: 340px; }
.rp-pick-card { display: flex; align-items: center; gap: 14px; padding: 18px 20px; border-radius: 16px; border: 1px solid rgba(255, 255, 255, 0.12); background: rgba(255, 255, 255, 0.06); backdrop-filter: blur(12px); color: #fff; font-size: 16px; font-weight: 600; cursor: pointer; transition: transform 0.15s, background 0.15s; text-align: left; font-family: inherit; }
.rp-pick-card:hover { background: rgba(255, 255, 255, 0.12); transform: translateY(-1px); }
.rp-pick-emoji { font-size: 28px; line-height: 1; }
.rp-pick-success { gap: 8px; color: #85e0ce; }
.rp-pick-success h2 { font-size: 24px; font-weight: 700; margin: 0; }
.rp-pick-success p { font-size: 14px; color: rgba(255, 255, 255, 0.6); margin: 0; text-align: center; }
.rp-pick-reset { margin-top: 24px; padding: 6px 14px; border-radius: 999px; border: 1px solid rgba(255, 255, 255, 0.3); background: transparent; color: #fff; font-size: 12px; cursor: pointer; font-family: inherit; }
.rp-og-wrap { container-type: inline-size; width: 100%; max-width: 600px; }
.rp-og { aspect-ratio: 1200 / 630; background: #FAFAFC; color: #010507; border-radius: 12px; border: 1px solid var(--border-default); box-sizing: border-box; display: flex; flex-direction: column; justify-content: space-between; padding: 5.83cqw 6.67cqw; font-family: var(--font-family); font-weight: 500; overflow: hidden; }
.rp-og-top { display: flex; align-items: center; font-size: 2.08cqw; }
.rp-og-by { margin-left: 2.5cqw; display: flex; align-items: center; gap: 1.33cqw; color: #57575B; }
.rp-og-by img { width: 13.33cqw; height: 3cqw; object-fit: contain; }
.rp-og-title { display: flex; flex-direction: column; font-size: 6.5cqw; letter-spacing: -0.33cqw; line-height: 1.12; }
.rp-og-accent { color: #189370; }
.rp-og-chips { display: flex; gap: 1.33cqw; font-size: 1.67cqw; }
.rp-og-chips span { border: 1px solid #DBDBE5; border-radius: 1cqw; padding: 1.17cqw 2cqw; background: #fff; }
.rp-og-foot { font-size: 1.5cqw; color: #57575B; }
.rp-exlayout { flex: 1; min-height: 0; display: flex; flex-direction: row; }
.rp-exlayout-chat { height: 100%; flex: 1; }
`;

/** globals.css 才有的 token，複刻容器自己補上（淺色值照 globals.css，深色值照 :root.dark） */
const SCOPED_TOKENS = [
  themedVars(
    ".rp-css",
    `--color-surface-light: #F7F7F9; --color-surface: #DEDEE9; --color-container: #FFFFFF; --color-glass: rgba(255, 255, 255, 0.7); --color-glass-subtle: rgba(255, 255, 255, 0.5); --color-border-glass: rgba(255, 255, 255, 0.3); --shadow-glass: 0 4px 30px rgba(0, 0, 0, 0.1); --space-6: 24px; --color-lilac-light: #D4D7FF; --color-mint-light: #A8E9DC;`,
    `--color-surface-light: #0f0f1a; --color-surface: #1a1a2e; --color-container: #1a1a2e; --color-glass: rgba(20, 20, 40, 0.7); --color-glass-subtle: rgba(20, 20, 40, 0.5); --color-border-glass: rgba(255, 255, 255, 0.08); --shadow-glass: 0 4px 30px rgba(0, 0, 0, 0.3);`,
  ),
  themedVars(
    ".rp-explainer",
    `--color-glass-subtle: rgba(255, 255, 255, 0.5); --color-border-glass: rgba(255, 255, 255, 0.3);`,
    `--color-glass-subtle: rgba(20, 20, 40, 0.5); --color-border-glass: rgba(255, 255, 255, 0.08);`,
  ),
  themedVars(
    ".rp-tip",
    `--color-glass-dark: rgba(255, 255, 255, 0.9); --color-border-glass: rgba(255, 255, 255, 0.3); --shadow-glass: 0 4px 30px rgba(0, 0, 0, 0.1);`,
    `--color-glass-dark: rgba(10, 10, 20, 0.85); --color-border-glass: rgba(255, 255, 255, 0.08); --shadow-glass: 0 4px 30px rgba(0, 0, 0, 0.3);`,
  ),
].join("\n");

export function renderUnmountedSection(): string {
  const logo = addAsset("assets/copilotkit-logo.svg", readRepo("apps/app/public/copilotkit-logo.svg"));
  const globalsCss = readRepo("apps/app/src/app/globals.css");
  const showcaseCss = extractThemedCss(
    globalsCss,
    (s) =>
      [".abstract-bg", ".blob", ".glass", ".brand-glass-container", ".text-gradient", ".border-gradient", ".branded-header", ".cta-"].some((prefix) => s.startsWith(prefix)),
    ["blob1", "blob2", "blob3"],
  );
  const explainerCss = extractThemedCss(globalsCss, (s) => s.startsWith(".explainer-card"));
  const seedCss = SEED_TEMPLATES.map((template) => prefixSelectors(splitLeadingStyle(template.html).css, ".rp-ds")).join("\n");

  const drawerItem = item({
    name: "示範抽屜",
    exportName: "DemoGallery",
    path: "apps/app/src/components/demo-gallery/index.tsx",
    state: "unmounted",
    show: "shot",
    propsSummary: "{ open, onClose, onTryDemo }；手機為底部全螢幕、桌面為右側 480px 面板；Esc 關閉",
    note: `<p>這是本機 /gallery 按「開啟 Demo Gallery 抽屜」後的截圖：抽屜是 position:fixed 的 React 元件（open 狀態、backdrop、Esc 監聽），要在 CopilotKit runtime 的頁面裡才掛得起來。分類篩選與卡片的靜態複刻在下一張。</p>`,
    body: shot("06-demo-drawer.png", "Demo Gallery 抽屜：右側 480px 面板，標題、7 的計數徽章、分類 chip 與七張示範卡", "本機 /gallery，桌面寬度（1280）的右側面板形態；手機形態見「聊天外殼」的手機截圖下半"),
  });

  const filterItem = item({
    name: "分類篩選與示範卡",
    exportName: "CategoryFilter · DemoCard",
    path: "apps/app/src/components/demo-gallery/",
    state: "unmounted",
    show: "replica",
    propsSummary: "CategoryFilter { selected, onSelect }；DemoCard { demo, onTry }；資料來自 DEMO_EXAMPLES（7 筆）",
    note: `<p>DemoCard 的 CATEGORY_COLORS 鍵是舊分類名（3D / Animation…），對不上 Understand／Compare／Make a tool，所以徽章永遠是灰色。</p><p>chip 的篩選用頁面的分頁機制重現；點卡片會顯示 onTry 會收到的標題。</p>`,
    body: categoryFilterReplica(),
  });

  const templateItem = item({
    id: "item-template-card",
    name: "範本卡",
    exportName: "TemplateCard",
    path: "apps/app/src/components/template-library/template-card.tsx",
    state: "unmounted",
    show: "replica",
    propsSummary: "{ id, name, description, html, componentType?, componentData?, dataDescription, version, onApply, onDelete? }；HTML 預覽是縮到 0.333 的 sandbox iframe，圖表則是內嵌 SVG 迷你圖",
    note: `<p>三張 seed 的預覽改成把範本標記直接放進頁面、以 transform: scale(0.333) 縮小（沙箱 THEME_CSS 的 token 限制在卡片內並跟著主題走）；真品是 srcdoc iframe。迷你長條／圓餅 SVG 與真品相同算法。</p>`,
    wide: true,
    body: `<div class="gal-grid">${[
      ...SEED_TEMPLATES.map((template) =>
        templateCard({
          id: template.id,
          name: template.name,
          description: template.description,
          html: template.html,
          dataDescription: template.data_description,
          version: template.version,
        }),
      ),
      templateCard({ id: "bar", name: "Saved bar chart", description: "componentType=barChart 的範本：預覽改用內嵌 SVG", html: "", componentType: "barChart", data: BAR_CHART_FIXTURE.data, dataDescription: "label/value", version: 2, deletable: true }),
      templateCard({ id: "pie", name: "Saved pie chart", description: "componentType=pieChart 的範本", html: "", componentType: "pieChart", data: PIE_CHART_FIXTURE.data, dataDescription: "label/value", version: 1, deletable: true }),
    ].join("")}</div>`,
  });

  const chipItem = item({
    name: "已選範本 chip",
    exportName: "TemplateChip",
    path: "apps/app/src/components/template-library/template-chip.tsx",
    state: "unmounted",
    show: "shot",
    propsSummary: "無 props；讀 agent.state.pending_template，找到 CopilotKit 輸入框就 portal 到它上方，否則就地渲染",
    note: `<p>這裡用 agent.setState 寫本地狀態；沒有代理執行。若上方聊天外殼的輸入框在畫面上，chip 會跑到那裡。</p><p>portal 行為需要 CopilotKit 的輸入框 DOM，所以用本機 /gallery 截圖：第一張是 chip 跑進聊天外殼輸入框上方、第二張是這張卡自己只剩兩顆按鈕。上面的 chip 是「找不到輸入框時就地渲染」的靜態外觀，兩顆按鈕只切換它的顯示。</p>`,
    body: `<div class="gal-stack" id="rp-chip-demo">
  <div class="gal-actions">
    <button type="button" class="gal-btn gal-btn--small rp-chip-set" data-toast="示範：agent.setState({ pending_template: { id: 'seed-invoice-001', name: 'Invoice Card' } })">設定 pending_template</button>
    <button type="button" class="gal-btn gal-btn--small rp-chip-clear" data-toast="示範：已清除 pending_template">清除</button>
  </div>
  <div>${templateChip("Invoice Card")}</div>
  ${shot("06-template-chip-in-chat.png", "聊天外殼的輸入框上方出現 Invoice Card chip", "本機 /gallery：設定 pending_template 後，chip portal 到 CopilotKit 輸入框上方")}
  ${shot("06-template-chip.png", "已選範本 chip 這張卡：只剩設定與清除兩顆按鈕", "同一時刻這張卡本身：chip 已被 portal 走", { maxWidth: 480 })}
</div>`,
  });

  const qrItem = item({
    name: "QR 投票視窗",
    exportName: "QrModal · QrButton",
    path: "apps/app/src/components/qr-modal/index.tsx",
    state: "unmounted",
    show: "shot",
    propsSummary: "QrModal { isOpen, onClose, sessionId, scanStatus: waiting | scanned | picked }；localhost 會改用 LAN IP 產生 /pick 連結",
    note: `<p>視窗是本機 /gallery 的截圖：QR 由 qrcode.react 依 /pick?session= 連結產生，靜態頁沒有這個路由與 /api/pick/ip。QrButton 與三種 scanStatus 的狀態列是靜態複刻。</p>`,
    body: `<div class="gal-stack">
  <div class="gal-actions">${qrButton()}</div>
  <div class="gal-stack" style="gap:6px">${(["waiting", "scanned", "picked"] as const).map(qrStatusRow).join("")}</div>
  ${shot("06-qr-modal.png", "Scan to Pick a Visualization 視窗：QR code 與 Waiting for scan… 狀態", "本機 /gallery 按 QR Pick 後（scanStatus=waiting）")}
</div>`,
  });

  const tipItem = item({
    name: "手機提示視窗",
    exportName: "DesktopTipModal",
    path: "apps/app/src/components/desktop-tip-modal.tsx",
    state: "unmounted",
    show: "replica",
    propsSummary: "無 props；sm:hidden（只在 <640px 顯示）；關閉後寫 sessionStorage",
    note: `<p>它是全螢幕遮罩，所以這裡不預設掛載；按「顯示」才掛上，桌面寬度看不到，把視窗縮到 640px 以下或在手機上按。</p><p>靜態版把遮罩縮成容器內的一塊，卡片本身與真品相同（玻璃底、漸層 icon、Continue anyway）；真品只在 &lt;640px 顯示並讀 sessionStorage 旗標。</p>`,
    body: desktopTip(),
  });

  const explainerItem = item({
    name: "歡迎畫面說明卡",
    exportName: "ExplainerCards · ExplainerCardsPortal",
    path: "apps/app/src/components/explainer-cards.tsx",
    state: "unmounted",
    show: "replica",
    propsSummary: "Portal 會用 MutationObserver 找 [data-testid=copilot-welcome-screen]，把三張卡插在建議列之前",
    wide: true,
    body: `<div class="gal-stack rp-explainer">
  ${explainerCards()}
  <div class="gal-actions">
    <button type="button" class="gal-btn gal-btn--small" data-toast="示範：ExplainerCardsPortal 會等 [data-testid=copilot-welcome-screen] 出現，把三張卡插在建議列之前；需要 CopilotChat runtime">注入到上方聊天外殼的歡迎畫面</button>
    <span class="gal-meta">注入後往上捲到「聊天外殼」看效果。</span>
  </div>
</div>`,
  });

  const cssItem = item({
    name: "只存在於 CSS 的視覺樣式",
    exportName: ".abstract-bg .blob-3 .glass* .text-gradient .border-gradient .branded-header-* .cta-banner",
    path: "apps/app/src/app/globals.css",
    state: "css",
    show: "replica",
    wide: true,
    demo: "plain",
    note: `<p>動態模糊色塊背景原本是 position:fixed 的全頁層，這裡限制在容器內展示。</p><p>規則由 globals.css 原文抽出（含 blob 的 keyframes 與 :root.dark 覆寫），只有 globals.css 才定義的 token 在容器上補齊。</p>`,
    body: cssShowcase(),
  });

  const pickItem = item({
    name: "手機投票頁",
    exportName: "PickPage",
    path: "apps/app/src/app/pick/page.tsx",
    state: "unmounted",
    show: "replica",
    propsSummary: "?session=<id>；隨機抽 3 個提示；載入時 PUT /api/pick、點選後 POST；無 session 顯示 Invalid link",
    demo: "center",
    note: `<p>12 個候選提示：${esc(PICK_PROMPTS.map((prompt) => `${prompt.emoji} ${prompt.title}`).join("、"))}。</p><p>/pick 需要 Next.js 路由與 /api/pick，Artifact 沒有後端，所以依 page.tsx 的 inline styles 靜態複刻；三個候選固定成本機截圖裡那組（真品每次隨機），點選後切到「Sent!」。</p>`,
    body: `<div class="gal-stack" style="align-items:center">
  ${pickPage()}
  <a class="gal-btn gal-btn--small" href="${BRANCH_URL}/apps/app/src/app/pick/page.tsx" target="_blank" rel="noopener noreferrer">在 GitHub 看 pick/page.tsx ↗</a>
</div>`,
  });

  const ogItem = item({
    name: "Open Graph 社群圖",
    exportName: "OpenGraphImage",
    path: "apps/app/src/app/opengraph-image.tsx",
    state: "unmounted",
    show: "replica",
    propsSummary: "1200×630 ImageResponse；讀 public/fonts 與 logo；三顆 Understand / Compare / Make a tool chip",
    demo: "center",
    note: `<p>真品是 Next.js 在伺服器端用 ImageResponse 轉出的 PNG（固定淺色、Plus Jakarta Sans Medium）；這裡用 CSS 依同一份 JSX 版面複刻，尺寸以 container query 單位等比縮放。</p>`,
    body: ogImage(logo),
  });

  const layoutItem = item({
    name: "範例版面包裝",
    exportName: "ExampleLayout",
    path: "apps/app/src/components/example-layout/index.tsx",
    state: "unmounted",
    show: "replica",
    propsSummary: "{ chatContent }；只剩一個 flex 包裝，mode-toggle 與 headless-chat 已刪除",
    body: `<div class="rp-exlayout"><div class="rp-exlayout-chat"><div style="padding:12px;border:1px dashed var(--border-hover);border-radius:8px;font-size:12px">chatContent 槽</div></div></div>`,
  });

  const script = `<script>(function(){
var chipDemo=document.getElementById('rp-chip-demo'),chip=document.getElementById('rp-chip');
if(chipDemo&&chip){chipDemo.addEventListener('click',function(event){var button=event.target.closest('button');if(!button)return;if(button.classList.contains('rp-chip-set'))chip.hidden=false;else if(button.classList.contains('rp-chip-clear')||button.classList.contains('rp-chip-x'))chip.hidden=true;});}
var pick=document.getElementById('rp-pick');
if(pick){pick.addEventListener('click',function(event){var button=event.target.closest('button');if(!button)return;var sent=button.classList.contains('rp-pick-card');if(!sent&&!button.classList.contains('rp-pick-reset'))return;pick.querySelectorAll('.rp-pick-state').forEach(function(state){state.hidden=sent?state.dataset.state!=='sent':state.dataset.state!=='choose';});});}
})();</script>`;

  const intro = `<p>這些元件都在 repo 裡、都能編譯，但<strong>沒有任何檔案 import 它們</strong>：示範抽屜、範本庫、QR 投票、手機提示、歡迎卡，以及一批只存在於 globals.css 的視覺樣式。它們反映了專案改版前的產品方向（以 widget 與範本為中心），與現在「answers you can interact with」的定位不同。</p>`;

  const body = `<style>${scopedDesignSystemCss(".rp-ds")}\n${seedCss}\n${showcaseCss}\n${explainerCss}\n${SCOPED_TOKENS}\n${REPLICA_CSS}</style>
<div class="gal-grid rp-unm">
${drawerItem}
${filterItem}
${templateItem}
${chipItem}
${qrItem}
${tipItem}
${explainerItem}
${cssItem}
${pickItem}
${ogItem}
${layoutItem}
</div>
${script}`;

  return section("unmounted", intro, body);
}
