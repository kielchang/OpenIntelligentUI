/**
 * 06 回應內容元件。每一張都依 fixture props 靜態複刻：
 * Markdown 用自己寫的最小轉換器、圖表以內嵌 SVG 依 fixture 等比重繪、排程卡與匯出選單保留可互動的部分。
 */
import { CHART_COLORS } from "@/components/generative-ui/charts/config";
import { SEED_TEMPLATES } from "@/components/template-library/seed-templates";
import { splitLeadingStyle } from "@/components/ui-gallery/split-leading-style";
import {
  BAR_CHART_FIXTURE,
  INVALID_TABLE,
  MARKDOWN_SAMPLE,
  MEETING_FIXTURE,
  MEETING_SLOTS,
  PIE_CHART_FIXTURE,
  PLAN_FIXTURE,
  QUARTERLY_SALES_TABLE,
  TOOL_REASONING_FIXTURES,
} from "@/components/ui-gallery/gallery-fixtures";
import { esc, item, readRepo, section } from "../html";
import { extractThemedCss, prefixSelectors, scopedDesignSystemCss } from "./replica-css";

/* ── Markdown（最小轉換器：標題、段落、清單、引言、表格、程式碼、粗斜體、行內碼） ── */

function inline(md: string): string {
  let text = esc(md);
  text = text.replace(/`([^`]+)`/g, "<code>$1</code>");
  text = text.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  text = text.replace(/(^|[^*])\*([^*]+)\*(?!\*)/g, "$1<em>$2</em>");
  text = text.replace(/\[([^\]]+)\]\((https?:[^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
  return text;
}

function tableHtml(rows: string[]): string {
  const cells = (row: string) =>
    row
      .replace(/^\|/, "")
      .replace(/\|\s*$/, "")
      .split("|")
      .map((cell) => cell.trim());
  const header = cells(rows[0]);
  const body = rows
    .slice(1)
    .filter((row) => !/^\|\s*:?-{2,}/.test(row))
    .map(cells);
  return `<table data-answer-reveal="visible"><thead><tr>${header.map((h) => `<th>${inline(h)}</th>`).join("")}</tr></thead><tbody>${body
    .map((row) => `<tr>${row.map((cell) => `<td>${inline(cell)}</td>`).join("")}</tr>`)
    .join("")}</tbody></table>`;
}

export function markdownToHtml(md: string): string {
  const lines = md.split(/\r?\n/);
  const out: string[] = [];
  let paragraph: string[] = [];
  const flush = () => {
    if (paragraph.length) out.push(`<p data-answer-reveal="visible">${inline(paragraph.join(" "))}</p>`);
    paragraph = [];
  };
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    const fence = line.match(/^```(\w*)\s*$/);
    if (fence) {
      flush();
      const buffer: string[] = [];
      i += 1;
      while (i < lines.length && !/^```\s*$/.test(lines[i])) {
        buffer.push(lines[i]);
        i += 1;
      }
      out.push(`<pre data-answer-reveal="visible"><code${fence[1] ? ` class="language-${esc(fence[1])}"` : ""}>${esc(buffer.join("\n"))}</code></pre>`);
      continue;
    }
    const heading = line.match(/^(#{1,6})\s+(.+)$/);
    if (heading) {
      flush();
      const level = heading[1].length;
      out.push(`<h${level} data-answer-reveal="visible">${inline(heading[2])}</h${level}>`);
      continue;
    }
    if (/^\|/.test(line)) {
      flush();
      const rows: string[] = [];
      while (i < lines.length && /^\|/.test(lines[i])) {
        rows.push(lines[i]);
        i += 1;
      }
      i -= 1;
      out.push(tableHtml(rows));
      continue;
    }
    if (/^[-*]\s+/.test(line)) {
      flush();
      const items: string[] = [];
      while (i < lines.length && /^[-*]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^[-*]\s+/, ""));
        i += 1;
      }
      i -= 1;
      out.push(`<ul data-answer-reveal="visible">${items.map((text) => `<li>${inline(text)}</li>`).join("")}</ul>`);
      continue;
    }
    if (/^>\s?/.test(line)) {
      flush();
      const quote: string[] = [];
      while (i < lines.length && /^>\s?/.test(lines[i])) {
        quote.push(lines[i].replace(/^>\s?/, ""));
        i += 1;
      }
      i -= 1;
      out.push(`<blockquote data-answer-reveal="visible"><p>${inline(quote.join(" "))}</p></blockquote>`);
      continue;
    }
    if (!line.trim()) {
      flush();
      continue;
    }
    paragraph.push(line.trim());
  }
  flush();
  return out.join("\n");
}

/* ── 工具狀態列與規劃卡 ── */

function formatValue(value: unknown): string {
  if (Array.isArray(value)) return `[${value.length} items]`;
  if (typeof value === "object" && value !== null) return `{${Object.keys(value).length} keys}`;
  if (typeof value === "string") return `"${value}"`;
  return String(value);
}

const SPINNER = `<span class="rp-spin" aria-hidden="true"></span>`;
const CHECK = `<span class="rp-check" aria-hidden="true">✓</span>`;

function toolReasoning(name: string, status: string, args?: object): string {
  const entries = args ? Object.entries(args) : [];
  const indicator = status === "complete" ? CHECK : SPINNER;
  if (!entries.length) {
    return `<div class="rp-tool"><div class="rp-tool-row">${indicator}<span class="rp-tool-name">${esc(name)}</span></div></div>`;
  }
  return `<div class="rp-tool"><details${status === "executing" ? " open" : ""}>
  <summary>${indicator}<span class="rp-tool-name">${esc(name)}</span><span class="rp-tool-caret">▼</span></summary>
  <div class="rp-tool-args">${entries
    .map(([key, value]) => `<div class="rp-tool-arg"><span class="rp-tool-key">${esc(key)}:</span><span class="rp-tool-val">${esc(formatValue(value))}</span></div>`)
    .join("")}</div>
</details></div>`;
}

function planCard(opts: { status: "executing" | "inProgress" | "complete"; approach?: string; technology?: string; keyElements?: string[] }): string {
  const running = opts.status !== "complete";
  const title = running ? "Planning visualization…" : `Plan: ${opts.technology || "visualization"}`;
  const body = opts.approach
    ? `<div class="rp-plan-body">${opts.technology ? `<span class="rp-plan-tech">${esc(opts.technology)}</span>` : ""}<p>${esc(opts.approach)}</p>${
        opts.keyElements?.length ? `<ul>${opts.keyElements.map((el) => `<li>${esc(el)}</li>`).join("")}</ul>` : ""
      }</div>`
    : "";
  return `<div class="rp-tool"><details${running ? " open" : ""}>
  <summary>${running ? SPINNER : CHECK}<span class="rp-tool-name">${esc(title)}</span><span class="rp-tool-caret">▼</span></summary>
  ${body}
</details></div>`;
}

/* ── 載入中 placeholder：七句由 renderer.tsx 原始檔抽出，CSS 動畫每 1.8 秒輪播 ── */

function loadingPhrases(): string[] {
  const source = readRepo("apps/app/src/components/generative-ui/open-generative-ui/renderer.tsx");
  const block = source.match(/export const LOADING_PHRASES = \[([\s\S]*?)\];/);
  if (!block) throw new Error("LOADING_PHRASES not found in renderer.tsx");
  return [...block[1].matchAll(/"([^"]+)"/g)].map((match) => match[1]);
}

function loadingPlaceholder(phrases: string[], height: number): string {
  const total = phrases.length * 1.8;
  return `<div class="rp-ogui" style="height:${height}px">
  <div class="rp-ogui-loading" role="status" aria-live="polite">
    <span class="rp-ogui-spin" aria-hidden="true"></span>
    <span class="rp-ogui-phrases">${phrases
      .map((phrase, index) => `<span style="animation-duration:${total}s;animation-delay:${((index - phrases.length) * 1.8).toFixed(1)}s">${esc(phrase)}...</span>`)
      .join("")}</span>
  </div>
</div>`;
}

/* ── A2UI 表格（與 table-catalog.tsx 相同的標記） ── */

function dataTable(props: { title: string; columns: string[]; rows: string[][]; source: string }): string {
  if (props.rows.some((row) => row.length !== props.columns.length)) {
    return `<p role="alert" class="rp-table-alert">This table has invalid rows or columns. Ask the assistant to regenerate it.</p>`;
  }
  return `<section class="answer-table" aria-label="${esc(props.title)}">
  <div class="answer-table-scroll" role="region" aria-label="${esc(`${props.title} table`)}" tabindex="0">
    <table>
      <caption>${esc(props.title)}</caption>
      <thead><tr>${props.columns.map((column) => `<th scope="col">${esc(column)}</th>`).join("")}</tr></thead>
      <tbody>${props.rows.map((row) => `<tr>${row.map((cell) => `<td>${esc(cell)}</td>`).join("")}</tr>`).join("")}</tbody>
    </table>
    ${props.rows.length === 0 ? "<p>No rows to display.</p>" : ""}
  </div>
  <p class="answer-table-source">${esc(props.source)}</p>
</section>`;
}

/* ── 圖表：依 Recharts 預設版面（300px 高、Y 軸 60、X 軸 30、margin 5/20/5/0）以 SVG 重繪 ── */

type Datum = { label: string; value: number };

function niceStep(raw: number): number {
  const magnitude = 10 ** Math.floor(Math.log10(raw));
  for (const factor of [1, 2, 5, 10]) if (raw <= factor * magnitude) return factor * magnitude;
  return 10 * magnitude;
}

function barChartSvg(data: Datum[]): string {
  const W = 400;
  const H = 300;
  const left = 50;
  const right = 15;
  const top = 5;
  const bottom = 35;
  const plotW = W - left - right;
  const plotH = H - top - bottom;
  const max = Math.max(...data.map((d) => d.value), 0);
  const step = max > 0 ? niceStep(max / 4) : 1;
  const yMax = Math.max(step, Math.ceil(max / step) * step);
  const ticks: number[] = [];
  for (let v = 0; v <= yMax; v += step) ticks.push(v);
  const band = plotW / data.length;
  const barW = band * 0.8;
  const y = (v: number) => top + plotH - (v / yMax) * plotH;
  const x0 = top + plotH;
  const bars = data
    .map((d, i) => {
      const x = left + i * band + (band - barW) / 2;
      const h = (d.value / yMax) * plotH;
      const r = Math.min(4, h);
      const yTop = y(d.value);
      const path = `M${x.toFixed(1)},${x0} V${(yTop + r).toFixed(1)} a${r},${r} 0 0 1 ${r},-${r} H${(x + barW - r).toFixed(1)} a${r},${r} 0 0 1 ${r},${r} V${x0} Z`;
      return `<path d="${path}" fill="${CHART_COLORS[i % CHART_COLORS.length]}"><title>${esc(d.label)} : ${esc(d.value)}</title></path>`;
    })
    .join("");
  const xAxis = `<line x1="${left}" y1="${x0}" x2="${left + plotW}" y2="${x0}" class="rp-axis"/>${data
    .map((d, i) => {
      const cx = left + i * band + band / 2;
      return `<line x1="${cx.toFixed(1)}" y1="${x0}" x2="${cx.toFixed(1)}" y2="${x0 + 6}" class="rp-axis"/><text x="${cx.toFixed(1)}" y="${x0 + 20}" text-anchor="middle" class="rp-tick">${esc(d.label)}</text>`;
    })
    .join("")}`;
  const yAxis = `<line x1="${left}" y1="${top}" x2="${left}" y2="${x0}" class="rp-axis"/>${ticks
    .map((v) => `<line x1="${left - 6}" y1="${y(v).toFixed(1)}" x2="${left}" y2="${y(v).toFixed(1)}" class="rp-axis"/><text x="${left - 9}" y="${y(v).toFixed(1)}" text-anchor="end" dominant-baseline="middle" class="rp-tick">${v}</text>`)
    .join("")}`;
  return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(`Bar chart, ${data.length} bars`)}">${yAxis}${xAxis}${bars}</svg>`;
}

function pieChartSvg(data: Datum[]): string {
  const W = 400;
  const H = 300;
  const cx = 200;
  const cy = 150;
  const r = 100;
  const total = data.reduce((sum, d) => sum + d.value, 0);
  const polar = (deg: number) => {
    const rad = (deg * Math.PI) / 180;
    return `${(cx + r * Math.cos(rad)).toFixed(2)},${(cy - r * Math.sin(rad)).toFixed(2)}`;
  };
  let angle = 0;
  const slices = data
    .map((d, i) => {
      const sweep = total > 0 ? (d.value / total) * 360 : 0;
      const start = angle;
      const end = angle + sweep;
      angle = end;
      const large = sweep > 180 ? 1 : 0;
      return `<path d="M${cx},${cy} L${polar(start)} A${r},${r} 0 ${large} 0 ${polar(end)} Z" fill="${CHART_COLORS[i % CHART_COLORS.length]}" stroke="#fff" stroke-width="1"><title>${esc(d.label)} : ${esc(d.value)}</title></path>`;
    })
    .join("");
  return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(`Pie chart, ${data.length} slices`)}">${slices}</svg>`;
}

function chartCard(opts: { title: string; description: string; kind: "bar" | "pie"; data: Datum[] }): string {
  const head = `<h3>${esc(opts.title)}</h3><p class="rp-chart-desc">${esc(opts.description)}</p>`;
  const cls = `rp-chart${opts.kind === "pie" ? " rp-chart--pie" : ""}`;
  if (!opts.data.length) return `<div class="${cls}">${head}<p class="rp-chart-empty">No data available</p></div>`;
  const figure = opts.kind === "bar" ? barChartSvg(opts.data) : pieChartSvg(opts.data);
  const legend =
    opts.kind === "pie"
      ? `<div class="rp-chart-legend">${opts.data
          .map((d, i) => `<div><span class="rp-chart-swatch" style="background:${CHART_COLORS[i % CHART_COLORS.length]}"></span><span>${esc(d.label)}</span></div>`)
          .join("")}</div>`
      : "";
  return `<div class="${cls}">${head}${figure}${legend}</div>`;
}

/* ── 排程卡（human-in-the-loop） ── */

function meetingPicker(opts: { status: "executing" | "complete"; title: string; slots: { date: string; time: string; duration?: string }[] }): string {
  const prompt = `<div class="rp-meet-state" data-state="prompt">
    <div class="rp-meet-head"><div class="rp-meet-emoji" aria-hidden="true">🗓️</div><h2>${esc(opts.title)}</h2><p>Select a time that works for you</p></div>
    ${
      opts.status === "executing"
        ? `<div class="rp-meet-slots">${opts.slots
            .map(
              (slot, index) =>
                `<button type="button" class="rp-meet-slot" style="animation-delay:${index * 80}ms" data-date="${esc(slot.date)}" data-time="${esc(slot.time)}" data-duration="${esc(slot.duration ?? "")}" data-toast="${esc(
                  `respond(): Meeting scheduled for ${slot.date} at ${slot.time}${slot.duration ? ` (${slot.duration})` : ""}.`,
                )}"><span class="rp-meet-slot-main"><span class="rp-meet-date">${esc(slot.date)}</span><span class="rp-meet-time">${esc(slot.time)}</span></span>${
                  slot.duration ? `<span class="rp-meet-dur">${esc(slot.duration)}</span>` : ""
                }</button>`,
            )
            .join("")}<button type="button" class="rp-meet-decline" style="animation-delay:${opts.slots.length * 80}ms" data-toast="respond(): The user declined all proposed meeting times. Please suggest alternative times or ask for their availability.">None of these work</button></div>`
        : ""
    }
  </div>`;
  const scheduled = `<div class="rp-meet-state" data-state="scheduled" hidden><div class="rp-meet-emoji" aria-hidden="true">📅</div><h2>Meeting Scheduled</h2><p class="rp-meet-when"></p><p class="rp-meet-durline"></p></div>`;
  const declined = `<div class="rp-meet-state" data-state="declined" hidden><div class="rp-meet-emoji" aria-hidden="true">🔄</div><h2>No Time Selected</h2><p>Let me find a better time that works for you</p></div>`;
  return `<div class="rp-meet"><div class="rp-meet-body">${prompt}${opts.status === "executing" ? scheduled + declined : ""}</div></div>`;
}

/* ── 樣式 ── */

const REPLICA_CSS = `
.rp-resp [hidden] { display: none !important; }
.rp-md { font-size: 15px; line-height: 1.65; color: var(--text-primary); max-width: 72ch; }
.rp-md > * { margin: 0 0 14px; }
.rp-md > :last-child { margin-bottom: 0; }
.rp-md h1, .rp-md h2, .rp-md h3 { font-weight: 600; line-height: 1.3; }
.rp-md table { border-collapse: collapse; width: 100%; font-size: 14px; }
.rp-md th, .rp-md td { border: 1px solid var(--border-default); padding: 6px 10px; text-align: left; }
.rp-md th { background: var(--surface-quaternary); font-weight: 600; }
.rp-md ul { padding-left: 22px; }
.rp-md li { margin: 2px 0; }
.rp-md blockquote { padding: 4px 14px; border-left: 3px solid var(--border-hover); color: var(--text-secondary); }
.rp-md blockquote p { margin: 0; }
.rp-md code { font-family: ui-monospace, "SF Mono", Menlo, monospace; font-size: 0.9em; background: var(--surface-quaternary); padding: 1px 5px; border-radius: 4px; }
.rp-md pre { background: var(--surface-quaternary); padding: 12px 14px; border-radius: var(--radius-md); overflow: auto; }
.rp-md pre code { background: none; padding: 0; font-size: 13px; }
.rp-tool { margin: 8px 0; font-size: 14px; color: var(--text-secondary); }
.rp-tool summary, .rp-tool-row { display: flex; align-items: center; gap: 8px; cursor: pointer; list-style: none; }
.rp-tool-row { cursor: default; }
.rp-tool summary::-webkit-details-marker { display: none; }
.rp-tool-name { font-weight: 500; }
.rp-tool-caret { font-size: 10px; }
.rp-spin { display: inline-block; width: 12px; height: 12px; border-radius: 50%; border: 2px solid var(--text-tertiary); border-top-color: transparent; animation: rp-spin 1s linear infinite; flex-shrink: 0; }
.rp-check { color: #22c55e; font-size: 12px; }
.rp-tool-args { padding-left: 20px; margin-top: 4px; display: grid; gap: 4px; font-size: 12px; color: var(--text-tertiary); }
.rp-tool-arg { display: flex; gap: 8px; min-width: 0; }
.rp-tool-key { font-weight: 500; flex-shrink: 0; }
.rp-tool-val { color: var(--text-secondary); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.rp-plan-body { padding-left: 20px; margin-top: 6px; display: grid; gap: 6px; font-size: 12px; color: var(--text-tertiary); justify-items: start; }
.rp-plan-body p { margin: 0; color: var(--text-secondary); }
.rp-plan-body ul { margin: 0; padding-left: 16px; list-style: disc; display: grid; gap: 2px; }
.rp-plan-tech { display: inline-block; padding: 2px 6px; border-radius: 4px; background: var(--surface-quaternary); color: var(--text-secondary); font-weight: 500; font-size: 11px; }
@keyframes rp-spin { to { transform: rotate(360deg); } }
.rp-ogui { position: relative; width: 100%; border-radius: 12px; background: var(--surface-secondary); border: 1px solid var(--border-default); overflow: hidden; }
.rp-ogui-loading { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; gap: 8px; font-size: 12px; font-weight: 500; color: var(--text-secondary); }
.rp-ogui-spin { width: 12px; height: 12px; border-radius: 50%; border: 2px solid var(--border-default); border-top-color: var(--text-secondary); animation: rp-spin 0.8s linear infinite; flex-shrink: 0; }
.rp-ogui-phrases { position: relative; display: inline-block; height: 1.4em; min-width: 9.5em; }
.rp-ogui-phrases span { position: absolute; left: 0; top: 0; white-space: nowrap; opacity: 0; animation-name: rp-ogui-cycle; animation-timing-function: linear; animation-iteration-count: infinite; }
@keyframes rp-ogui-cycle { 0%, 14.2% { opacity: 1; } 14.3%, 100% { opacity: 0; } }
.rp-export { position: relative; }
.rp-export-ctl { position: absolute; top: 8px; right: 8px; z-index: 2; }
.rp-export-trigger { display: inline-flex; align-items: center; justify-content: center; border-radius: 8px; padding: 6px; background: var(--surface-primary); border: 1px solid var(--border-default); color: var(--text-secondary); box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.07); cursor: pointer; transition: transform 150ms; }
.rp-export-trigger:hover { transform: scale(1.05); }
.rp-export-menu { display: none; position: absolute; top: 100%; right: 0; margin-top: 4px; min-width: 180px; padding: 4px 0; border-radius: 8px; background: var(--surface-primary); border: 1px solid var(--border-default); box-shadow: 0 10px 25px -3px rgba(0, 0, 0, 0.12); backdrop-filter: blur(12px); animation: rp-slide-in 0.15s ease-out; }
.rp-export-ctl:focus-within .rp-export-menu { display: block; }
.rp-export-menu button { display: flex; align-items: center; gap: 10px; width: 100%; padding: 8px 12px; font-size: 12px; text-align: left; background: none; border: 0; color: var(--text-primary); cursor: pointer; font-family: inherit; }
.rp-export-menu button:hover { background: var(--surface-quaternary); }
@keyframes rp-slide-in { from { transform: translateY(-4px) scale(0.97); opacity: 0; } to { transform: none; opacity: 1; } }
.rp-ds-frame { padding: 16px; min-height: 300px; background: var(--color-background-primary); color: var(--color-text-primary); font-family: var(--font-sans); border: 1px solid var(--border-default); border-radius: var(--radius-lg); overflow: auto; }
.rp-table { --color-border: var(--border-default); --color-background-secondary: var(--surface-quaternary); color: var(--text-primary); }
.rp-table .answer-table { margin: 0; }
.rp-table-alert { margin: 0; font-size: 14px; color: var(--text-primary); }
.rp-chart { border: 1px solid var(--border-default); border-radius: 12px; box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05); padding: 24px; max-width: 672px; margin: 0 auto; background: var(--surface-primary); color: var(--text-primary); }
.rp-chart--pie { max-width: 512px; }
.rp-chart h3 { font-size: 20px; font-weight: 700; margin: 0; }
.rp-chart-desc { font-size: 14px; color: var(--text-secondary); margin: 0 0 16px; }
.rp-chart svg { width: 100%; height: auto; display: block; }
.rp-chart .rp-axis { stroke: var(--text-secondary); stroke-width: 1; }
.rp-chart .rp-tick { font-size: 11px; fill: var(--text-secondary); font-family: var(--font-family); }
.rp-chart-empty { text-align: center; color: var(--text-secondary); padding: 32px 0; margin: 0; }
.rp-chart-legend { margin-top: 16px; display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 14px; }
.rp-chart-legend > div { display: flex; align-items: center; gap: 8px; }
.rp-chart-swatch { display: inline-block; width: 12px; height: 12px; border-radius: 2px; flex-shrink: 0; }
.rp-meet { border-radius: 16px; box-shadow: 0 10px 25px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.03); max-width: 448px; width: 100%; border: 1px solid var(--border-default); margin: 0 auto; background: var(--surface-primary); color: var(--text-primary); }
.rp-meet-body { padding: 32px; }
.rp-meet-head { text-align: center; margin-bottom: 24px; }
.rp-meet-state[data-state="scheduled"], .rp-meet-state[data-state="declined"] { text-align: center; }
.rp-meet-emoji { font-size: 72px; line-height: 1; margin-bottom: 16px; }
.rp-meet h2 { font-size: 24px; font-weight: 700; margin: 0 0 8px; }
.rp-meet p { margin: 0 0 8px; color: var(--text-secondary); }
.rp-meet-durline { font-size: 14px; }
.rp-meet-slots { display: grid; gap: 12px; }
.rp-meet-slot { width: 100%; padding: 16px 24px; border-radius: 12px; font-weight: 500; border: 2px solid var(--border-default); background: transparent; color: inherit; box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05); display: flex; justify-content: space-between; align-items: center; cursor: pointer; font-family: inherit; transition: transform 150ms, border-color 150ms, background 150ms, box-shadow 150ms; animation: rp-fade-slide-up 0.4s ease-out both; }
.rp-meet-slot:hover { border-color: #3b82f6; background: rgba(59, 130, 246, 0.08); box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.07); transform: scale(1.02); }
.rp-meet-slot:active { transform: scale(0.98); }
.rp-meet-slot-main { display: grid; text-align: left; }
.rp-meet-date { font-weight: 700; }
.rp-meet-time, .rp-meet-dur { font-size: 14px; color: var(--text-secondary); }
.rp-meet-decline { width: 100%; padding: 12px 24px; border-radius: 12px; font-weight: 500; border: 0; background: transparent; color: var(--text-secondary); cursor: pointer; font-family: inherit; font-size: 14px; animation: rp-fade-slide-up 0.4s ease-out both; }
.rp-meet-decline:hover { background: var(--surface-quaternary); color: var(--text-primary); }
@keyframes rp-fade-slide-up { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
`;

export function renderResponseSection(): string {
  const chatCss = readRepo("apps/app/src/app/chat.css");
  const answerCss = extractThemedCss(chatCss, (s) => s.startsWith(".answer-markdown") || s.startsWith(".answer-table"));
  const weather = splitLeadingStyle(SEED_TEMPLATES[0].html);
  const weatherCss = prefixSelectors(weather.css, ".rp-ds");
  const phrases = loadingPhrases();

  const markdownItem = item({
    name: "Markdown 回答（逐段顯現）",
    exportName: "AnswerMarkdown",
    path: "apps/app/src/components/chat/answer-markdown.tsx",
    state: "mounted",
    show: "replica",
    propsSummary: "CopilotChatAssistantMessage.MarkdownRenderer 的 props；每個區塊進入視窗時淡入上移 6px（reveal-blocks.ts）",
    note: `<p>真品把 Markdown 交給 CopilotKit 的 renderer，再由 reveal-blocks 把每個區塊標成 <code>data-answer-reveal=pending → visible</code>；這裡用產生期的最小轉換器輸出同一份 MARKDOWN_SAMPLE，區塊直接標成 visible（本機截圖裡這格是空白的，因為 pending 區塊在進入視窗前 opacity 為 0）。</p>`,
    body: `<div class="chat-content"><div class="answer-markdown"><div class="rp-md">${markdownToHtml(MARKDOWN_SAMPLE)}</div></div></div>`,
  });

  const toolItem = item({
    name: "工具呼叫狀態",
    exportName: "ToolReasoning",
    path: "apps/app/src/components/tool-rendering.tsx",
    state: "mounted",
    show: "replica",
    propsSummary: "{ name, args?, status: executing | inProgress | complete }；執行中自動展開 <details>，完成自動收合",
    body: `<div class="gal-stack">${TOOL_REASONING_FIXTURES.map((fixture) => toolReasoning(fixture.name, fixture.status, fixture.args as object | undefined)).join("")}</div>`,
  });

  const planItem = item({
    name: "視覺化規劃卡",
    exportName: "PlanCard",
    path: "apps/app/src/components/generative-ui/plan-card.tsx",
    state: "mounted",
    show: "replica",
    propsSummary: "{ status, approach?, technology?, keyElements? }；對應 plan_visualization 工具（useRenderTool）",
    body: `<div class="gal-stack">${planCard({ status: "executing" })}${planCard({ status: "complete", ...PLAN_FIXTURE })}</div>`,
  });

  const loadingItem = item({
    id: "item-loading-placeholder",
    name: "自訂 UI 載入中 placeholder",
    exportName: "OpenGenUIActivityRenderer（generating:true）",
    path: "apps/app/src/components/generative-ui/open-generative-ui/renderer.tsx",
    state: "mounted",
    show: "replica",
    propsSummary: `content = { initialHeight: 160, generating: true }；每 1.8 秒輪播 LOADING_PHRASES：${phrases.join("、")}`,
    note: `<p>代理輸出的 placeholderMessages 不會出現在這裡；渲染器只認得自己的七句。</p><p>這裡的輪播是純 CSS 動畫（七個 span 以負延遲錯開），週期與真品相同。</p>`,
    body: loadingPlaceholder(phrases, 160),
  });

  const exportItem = item({
    id: "item-export-overlay",
    name: "匯出選單",
    exportName: "ExportOverlay",
    path: "apps/app/src/components/generative-ui/export-overlay.tsx",
    state: "mounted",
    show: "replica",
    propsSummary: "{ title, html?, componentData?, componentType, ready?, children }；滑鼠移入右上角出現 ⋯ → Copy to clipboard / Download file",
    note: `<p>真品的 ⋯ 只在 hover 時出現；這裡固定顯示，點它展開選單（focus-within），兩個選項各自示範真品會做的事。內容是 seed 範本 Weather 直接在頁面裡渲染（沙箱 THEME_CSS 的 token 限制在這個容器內並跟著主題走），不是沙箱 iframe。</p>`,
    body: `<div class="rp-export">
  <div class="rp-export-ctl">
    <button type="button" class="rp-export-trigger" title="Options" aria-haspopup="menu"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/></svg></button>
    <div class="rp-export-menu" role="menu">
      <button type="button" role="menuitem" data-toast="示範：navigator.clipboard.writeText(assembleStandaloneHtmlFromActivity({ css, html }, 'Weather card'))"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>Copy to clipboard</button>
      <button type="button" role="menuitem" data-toast="示範：triggerDownload(standaloneHtml, 'weather-card.html')"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>Download file</button>
    </div>
  </div>
  <div class="rp-ds rp-ds-frame">${weather.html}</div>
</div>`,
  });

  const tableItem = item({
    id: "item-data-table",
    name: "A2UI 表格（真實 catalog 路徑）",
    exportName: "DataTable · tableCatalog",
    path: "apps/app/src/components/generative-ui/table-catalog.tsx",
    state: "mounted",
    show: "replica",
    propsSummary: "{ title ≤300, columns 1–12, rows ≤200×≤12, source }；列寬不符時顯示 role=alert",
    note: `<p>真品走 A2UIProvider → createSurface／updateComponents 的 catalog 路徑；這裡直接輸出 DataTable 的標記（chat.css 的 .answer-table 規則）與同一句 role=alert。</p>`,
    body: `<div class="gal-stack rp-table">${dataTable(QUARTERLY_SALES_TABLE)}${dataTable(INVALID_TABLE)}</div>`,
  });

  const barItem = item({
    name: "長條圖",
    exportName: "BarChart",
    path: "apps/app/src/components/generative-ui/charts/bar-chart.tsx",
    state: "mounted",
    show: "replica",
    propsSummary: "{ title, description, data: {label, value}[] }；Recharts；顏色依 CHART_COLORS 循環",
    note: `<p>註冊成 useComponent(&quot;barChart&quot;)，但 Jev 路由每一輪都把它剔除，正式對話中不會出現。</p><p>內嵌 SVG 依 fixture 等比重繪 Recharts 的預設版面（300px 高、Y 軸刻度 0–2000、bar 頂圓角 4）；滑過長條可看到原生 tooltip。</p>`,
    body: `<div class="gal-stack">${chartCard({ ...BAR_CHART_FIXTURE, kind: "bar" })}${chartCard({ title: "Empty state", description: "data: []", data: [], kind: "bar" })}</div>`,
  });

  const pieItem = item({
    name: "圓餅圖",
    exportName: "PieChart",
    path: "apps/app/src/components/generative-ui/charts/pie-chart.tsx",
    state: "mounted",
    show: "replica",
    propsSummary: "同 BarChart schema；兩欄圖例",
    note: `<p>扇形從三點鐘方向逆時針排列（Recharts 預設 startAngle=0），半徑 100，切片間 1px 白邊。</p>`,
    body: chartCard({ ...PIE_CHART_FIXTURE, kind: "pie" }),
  });

  const slots = MEETING_SLOTS.map((slot) => ({ ...slot, duration: `${MEETING_FIXTURE.meetingDuration} min` }));
  const meetingItem = item({
    id: "item-meeting-picker",
    name: "排程卡（human-in-the-loop）",
    exportName: "MeetingTimePicker",
    path: "apps/app/src/components/generative-ui/meeting-time-picker.tsx",
    state: "mounted",
    show: "replica",
    propsSummary: "{ status, respond?, reasonForScheduling?, meetingDuration?, timeSlots? }；只有 status=executing 才顯示時段按鈕",
    note: `<p>按時段會切到「Meeting Scheduled」、按 None of these work 切到「No Time Selected」，toast 顯示 respond() 會收到的字串；真品沒有重設，這裡多一顆方便重看。</p>`,
    body: `<div class="gal-stack" id="rp-meet">
  ${meetingPicker({ status: "executing", title: MEETING_FIXTURE.reasonForScheduling, slots })}
  ${meetingPicker({ status: "complete", title: "（complete 狀態：只剩標題）", slots: [] })}
  <div class="gal-actions"><button type="button" class="gal-btn gal-btn--small rp-meet-reset">重設示範</button></div>
</div>`,
  });

  const script = `<script>(function(){
var root=document.getElementById('rp-meet');if(!root)return;
function show(state){root.querySelectorAll('.rp-meet-state').forEach(function(s){if(s.dataset.state==='prompt'&&!s.parentNode.querySelector('[data-state="scheduled"]'))return;s.hidden=s.dataset.state!==state;});}
root.addEventListener('click',function(event){var button=event.target.closest('button');if(!button)return;
if(button.classList.contains('rp-meet-slot')){root.querySelector('.rp-meet-when').textContent=button.dataset.date+' at '+button.dataset.time;var line=root.querySelector('.rp-meet-durline');line.textContent=button.dataset.duration?'Duration: '+button.dataset.duration:'';line.hidden=!button.dataset.duration;show('scheduled');}
else if(button.classList.contains('rp-meet-decline'))show('declined');
else if(button.classList.contains('rp-meet-reset'))show('prompt');});
})();</script>`;

  const intro = `<p>代理回答進到對話時會經過這些 React 元件：工具呼叫的狀態列、規劃卡、A2UI 表格、Recharts 圖表、人機協作的排程卡，以及自訂 UI 完成後的匯出選單。在 /gallery 裡每一張都用 fixture props 直接掛載；這份靜態版依同一組 fixture 複刻（圖表以內嵌 SVG 等比重繪），能互動的部分保留。</p>`;

  const body = `<style>${answerCss}\n${scopedDesignSystemCss(".rp-ds")}\n${weatherCss}\n${REPLICA_CSS}</style>
<div class="gal-grid rp-resp">
${markdownItem}
${toolItem}
${planItem}
${loadingItem}
${exportItem}
${tableItem}
${barItem}
${pieItem}
${meetingItem}
</div>
${script}`;

  return section("response", intro, body);
}
