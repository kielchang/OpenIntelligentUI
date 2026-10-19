/**
 * 色彩學與配色區塊（id = color）的靜態重製。
 * 對應 apps/app/src/components/ui-gallery/sections/color-section.tsx 與 color-components/*.tsx：
 * 所有數字（OKLCH、WCAG 對比、色盲模擬、色盤、ΔE）都在產生期用專案自己的 color/* 純函式算出；
 * 原頁的淺色／深色切換改成兩種模式都先算好，再以 seg() 分段呈現。
 * 唯一的瀏覽器端 JS 是色相環家族圖例的勾選（切換 g[data-family] 的 display）。
 */
import { CHART_COLORS } from "@/components/generative-ui/charts/config";
import { BAR_CHART_FIXTURE } from "@/components/ui-gallery/gallery-fixtures";
import {
  contrastRatio,
  deltaEOk,
  formatOklch,
  formatRatio,
  hueDistance,
  parseColor,
  passesWcag,
  rgbToOklch,
  simulateCvd,
  toGrayscale,
  toHex,
  wcagThreshold,
  type ContrastUse,
  type CvdType,
} from "@/components/ui-gallery/color/color-math";
import { diverging, OKABE_ITO, sequential } from "@/components/ui-gallery/color/palette-generation";
import { classifyPair, evaluateCategorical } from "@/components/ui-gallery/color/cvd-palette";
import { buildContrastMatrix, type NamedColor } from "@/components/ui-gallery/color/contrast-matrix";
import {
  allFamilies,
  APP_TOKENS,
  designSystemFamily,
  HARDCODED_COUNTS,
  HARDCODED_TOTAL,
  SEMANTIC_HUE_CONVENTION,
  svgRamps,
  VALIDATOR_RESULTS,
  type ColorFamily,
} from "@/components/ui-gallery/color/color-inventory";
import { badge, callout, esc, item, pathSpan, section, seg, subhead, table } from "../html";

type Mode = "light" | "dark";
const MODES: Mode[] = ["light", "dark"];
const MODE_LABEL: Record<Mode, string> = { light: "淺色", dark: "深色" };

const CHART_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"];
const CHART_VALUES = [120, 148, 171, 165, 199, 176, 188];
const CHART_NAMES = ["blue", "purple", "pink", "amber", "emerald", "cyan", "orange"];

const LILAC_DARK = "#9599CC";
const MINT_DARK = "#1B936F";

/** 數字輸出到 SVG 座標時取兩位小數，避免 HTML 因浮點尾數膨脹 */
const num = (value: number) => String(Math.round(value * 100) / 100);

function pick(swatches: { name: string; light: string; dark?: string }[], names: string[], mode: Mode): NamedColor[] {
  return names.flatMap((name) => {
    const swatch = swatches.find((entry) => entry.name === name);
    if (!swatch) return [];
    return [{ name, hex: mode === "dark" ? swatch.dark ?? swatch.light : swatch.light }];
  });
}

function oklchOf(value: string): string {
  const rgb = parseColor(value);
  return rgb ? formatOklch(rgbToOklch(rgb)) : "無法解析";
}

/* ------------------------------------------------------------------ */
/* color-components/swatch.tsx                                         */
/* ------------------------------------------------------------------ */

function swatch(name: string, light: string, dark?: string, note?: string): string {
  const darkRgb = dark ? parseColor(dark) : null;
  const chip = dark
    ? `<div class="gal-swatch-chip gal-swatch-chip--split" style="background:${esc(light)}"><span style="background:${esc(light)}"></span><span style="background:${esc(dark)}"></span></div>`
    : `<div class="gal-swatch-chip" style="background:${esc(light)}"></div>`;
  return `<div class="gal-swatch"${note ? ` title="${esc(note)}"` : ""}>${chip}<span class="gal-swatch-name">${esc(name)}</span><span class="gal-swatch-value">${esc(light)}${dark ? ` / ${esc(dark)}` : ""}</span><span class="gal-swatch-value">${esc(oklchOf(light))}${darkRgb ? ` ｜ 深 ${esc(formatOklch(rgbToOklch(darkRgb)))}` : ""}</span>${note ? `<span class="gal-swatch-value">${esc(note)}</span>` : ""}</div>`;
}

/* ------------------------------------------------------------------ */
/* color-components/hue-wheel.tsx                                      */
/* ------------------------------------------------------------------ */

const WHEEL_SIZE = 520;
const WHEEL_CENTER = WHEEL_SIZE / 2;
const WHEEL_MAX_CHROMA = 0.2;
const WHEEL_RADIUS = 220;
const FAMILY_STROKE: Record<string, string> = {
  "design-system": "#1a1a1a",
  "svg-ramps": "#534AB7",
  app: "#1B936F",
  chart: "#A32D2D",
  adhoc: "#854F0B",
};
const HUE_WHEEL_ROOT = "cs-hue-wheels";

/** OKLCH 極座標：角度 = hue、半徑 = chroma、點本身是該色、點大小隨明度放大；外框顏色代表家族 */
function hueWheel(families: ColorFamily[], mode: Mode): string {
  const legend = families
    .map(
      (family) =>
        `<label><input type="checkbox" checked data-family="${esc(family.id)}"><span class="gal-legend-dot" style="color:${esc(FAMILY_STROKE[family.id] ?? "currentColor")}"></span>${esc(family.name)}</label>`,
    )
    .join("");

  const rings = [0.05, 0.1, 0.15, 0.2]
    .map(
      (c) =>
        `<circle cx="${WHEEL_CENTER}" cy="${WHEEL_CENTER}" r="${num((c / WHEEL_MAX_CHROMA) * WHEEL_RADIUS)}" fill="none" stroke="var(--border-hover)"${c === 0.2 ? "" : ` stroke-dasharray="3 4"`}></circle>`,
    )
    .join("");
  const axes = [0, 90, 180, 270]
    .map((deg) => {
      const angle = (deg * Math.PI) / 180;
      return `<line x1="${WHEEL_CENTER}" y1="${WHEEL_CENTER}" x2="${num(WHEEL_CENTER + WHEEL_RADIUS * Math.cos(angle))}" y2="${num(WHEEL_CENTER - WHEEL_RADIUS * Math.sin(angle))}" stroke="var(--border-subtle)"></line>`;
    })
    .join("");
  const ticks = [
    { deg: 0, label: "0° 紅粉" },
    { deg: 60, label: "60° 橙黃" },
    { deg: 140, label: "140° 綠" },
    { deg: 200, label: "200° 青" },
    { deg: 260, label: "260° 藍" },
    { deg: 300, label: "300° 紫" },
  ]
    .map((tick) => {
      const angle = (tick.deg * Math.PI) / 180;
      return `<text x="${num(WHEEL_CENTER + (WHEEL_RADIUS + 22) * Math.cos(angle))}" y="${num(WHEEL_CENTER - (WHEEL_RADIUS + 22) * Math.sin(angle))}" text-anchor="middle" dominant-baseline="central" font-size="11" fill="var(--text-tertiary)">${esc(tick.label)}</text>`;
    })
    .join("");
  const chromaLabels = `<text x="${WHEEL_CENTER + 4}" y="${num(WHEEL_CENTER - (0.1 / WHEEL_MAX_CHROMA) * WHEEL_RADIUS - 4)}" font-size="10" fill="var(--text-tertiary)">C 0.10</text><text x="${WHEEL_CENTER + 4}" y="${WHEEL_CENTER - WHEEL_RADIUS - 4}" font-size="10" fill="var(--text-tertiary)">C 0.20</text>`;

  const groups = families
    .map((family) => {
      const circles = family.swatches
        .flatMap((entry) => {
          const value = mode === "dark" && entry.dark ? entry.dark : entry.light;
          const rgb = parseColor(value);
          if (!rgb) return [];
          const oklch = rgbToOklch(rgb);
          if (oklch.c < 0.004) return [];
          const r = Math.min(1, oklch.c / WHEEL_MAX_CHROMA) * WHEEL_RADIUS;
          const angle = (oklch.h * Math.PI) / 180;
          const label = `${entry.name} ${value} · L ${oklch.l.toFixed(2)} C ${oklch.c.toFixed(3)} H ${Math.round(oklch.h)}°`;
          return [
            `<circle cx="${num(WHEEL_CENTER + r * Math.cos(angle))}" cy="${num(WHEEL_CENTER - r * Math.sin(angle))}" r="${num(5 + oklch.l * 6)}" fill="${esc(value)}" stroke="${esc(FAMILY_STROKE[family.id] ?? "currentColor")}" stroke-width="1.5"><title>${esc(label)}</title></circle>`,
          ];
        })
        .join("");
      return `<g data-family="${esc(family.id)}">${circles}</g>`;
    })
    .join("");

  return `<div class="gal-stack" data-hue-wheel="${mode}">
<div class="gal-legend">${legend}</div>
<svg class="gal-hue-wheel" viewBox="0 0 ${WHEEL_SIZE} ${WHEEL_SIZE}" role="img" aria-label="所有專案色彩在 OKLCH 色相環上的分佈（${esc(MODE_LABEL[mode])}值）">${rings}${axes}${ticks}${chromaLabels}${groups}</svg>
<p class="gal-lede">點越靠外 chroma 越高；點的大小隨明度放大。接近中心的點是中性色，看它們偏向哪個角度，就知道灰階帶的是哪一種色調。</p>
</div>`;
}

/** 圖例勾選：只在 #cs-hue-wheels 內運作，切換同一個色相環裡 g[data-family] 的 display */
const HUE_WHEEL_SCRIPT =
  "<script>(function(){var root=document.getElementById(" +
  JSON.stringify(HUE_WHEEL_ROOT) +
  ");if(!root)return;root.addEventListener('change',function(event){var input=event.target;if(!input||input.tagName!=='INPUT'||!input.getAttribute('data-family'))return;var wheel=input.closest('[data-hue-wheel]');if(!wheel)return;var family=input.getAttribute('data-family');var groups=wheel.querySelectorAll('g[data-family]');for(var i=0;i<groups.length;i++){if(groups[i].getAttribute('data-family')===family){groups[i].style.display=input.checked?'':'none';}}});})();</script>";

/* ------------------------------------------------------------------ */
/* color-components/contrast-grid.tsx                                  */
/* ------------------------------------------------------------------ */

const USE_LABEL: Record<ContrastUse, string> = {
  normal: "正文 4.5:1（1.4.3）",
  large: "大字 3:1（1.4.3）",
  ui: "非文字 3:1（1.4.11）",
};

interface ContrastGridOpts {
  title: string;
  fgs: NamedColor[];
  bgs: NamedColor[];
  use: ContrastUse;
  base?: string;
  sampleText?: string;
}

/** 前景 × 背景的 WCAG 2.2 對比矩陣；比值截斷到兩位小數，判定用原始值 */
function contrastGrid({ title, fgs, bgs, use, base, sampleText = "Aa 字" }: ContrastGridOpts): string {
  const matrix = buildContrastMatrix(fgs, bgs, use, base);
  const head = bgs
    .map((bg) => `<th style="text-align:center"><span class="gal-path">${esc(bg.name)}</span><br><span style="font-weight:400">${esc(bg.hex)}</span></th>`)
    .join("");
  const rows = matrix
    .map((row, rowIndex) => {
      const fg = fgs[rowIndex];
      const cells = row
        .map(
          (cell) =>
            `<td data-pass="${cell.pass}"><span class="gal-contrast-cell"><span class="gal-contrast-sample" style="background:${esc(cell.bg.hex)};color:${esc(cell.fg.hex)};border:1px solid var(--border-subtle)">${esc(sampleText)}</span><span>${esc(formatRatio(cell.ratio))}</span><span>${cell.pass ? "PASS" : "FAIL"}</span></span></td>`,
        )
        .join("");
      return `<tr><th><span class="gal-path">${esc(fg.name)}</span><br><span style="font-weight:400">${esc(fg.hex)}</span></th>${cells}</tr>`;
    })
    .join("\n");
  return `<div class="gal-stack">
<div class="gal-family-head"><h4>${esc(title)}</h4><span class="gal-meta">門檻：${esc(USE_LABEL[use])}；嚴格 ≥ ${wcagThreshold(use)}，不四捨五入</span></div>
<div class="gal-table-wrap"><table class="gal-contrast"><thead><tr><th>前景 ＼ 背景</th>${head}</tr></thead><tbody>${rows}</tbody></table></div>
</div>`;
}

/* ------------------------------------------------------------------ */
/* color-components/cvd-strip.tsx                                      */
/* ------------------------------------------------------------------ */

const CVD_ROWS: { key: CvdType | "normal" | "gray"; label: string }[] = [
  { key: "normal", label: "原色" },
  { key: "protan", label: "紅盲 protan" },
  { key: "deutan", label: "綠盲 deutan" },
  { key: "tritan", label: "藍黃 tritan" },
  { key: "gray", label: "灰階" },
];

function cvdTransform(hex: string, key: CvdType | "normal" | "gray"): string {
  const rgb = parseColor(hex);
  if (!rgb) return hex;
  if (key === "normal") return hex;
  if (key === "gray") return toHex(toGrayscale(rgb));
  return toHex(simulateCvd(rgb, key));
}

/** 一組分類色在三種色盲模擬與灰階下的樣子，附最小距離報告 */
function cvdStrip(label: string, hexes: string[], names?: string[]): string {
  const report = evaluateCategorical(hexes);
  const name = (index: number) => names?.[index] ?? hexes[index] ?? "—";
  const rows = CVD_ROWS.map((row) => {
    const chips = hexes
      .map((hex, index) => {
        const value = cvdTransform(hex, row.key);
        return `<span style="background:${esc(value)}" title="${esc(`${name(index)} → ${value}`)}"></span>`;
      })
      .join("");
    return `<span>${esc(row.label)}</span><div class="gal-strip-row">${chips}</div>`;
  }).join("");
  const hueGap = Number.isFinite(report.minAdjacentHueGap) ? `${report.minAdjacentHueGap.toFixed(0)}°` : "—";
  return `<div class="gal-stack">
<h4 class="gal-swatch-name" style="font-size:13px">${esc(label)}</h4>
<div class="gal-strip">${rows}</div>
<ul class="gal-lede" style="margin:0;padding-left:18px">
<li>正常視覺最小 ΔE<sub>ok</sub>×100：${esc((report.minDeltaE.value * 100).toFixed(1))}（${esc(name(report.minDeltaE.i))} ↔ ${esc(name(report.minDeltaE.j))}）；dataviz 門檻 15</li>
<li>色盲模擬後最小距離：protan ${esc((report.cvd.protan.value * 100).toFixed(1))} · deutan ${esc((report.cvd.deutan.value * 100).toFixed(1))}（${esc(name(report.cvd.deutan.i))} ↔ ${esc(name(report.cvd.deutan.j))}） · tritan ${esc((report.cvd.tritan.value * 100).toFixed(1))}；目標 ≥ 8，6–8 只能搭配直接標籤或紋理</li>
<li>灰階單調：${report.grayscaleMonotonic ? "是" : "否"}；最小亮度差 |ΔY| ${esc(report.minLuminanceGap.value.toFixed(3))}（${esc(name(report.minLuminanceGap.i))} ↔ ${esc(name(report.minLuminanceGap.j))}）；相鄰色相最小間距 ${esc(hueGap)}</li>
</ul>
</div>`;
}

/* ------------------------------------------------------------------ */
/* color-components/palette-preview.tsx                                */
/* ------------------------------------------------------------------ */

const MUTED = "var(--border-hover)";

/** 橫向分類長條：細標記、4px 圓角、標籤用文字 token、固定順序 */
function categoricalBars(title: string, hexes: string[], labels: string[], values: number[], highlightIndex?: number): string {
  const max = Math.max(...values, 1);
  const rowHeight = 22;
  const height = labels.length * rowHeight + 8;
  const rows = labels
    .map((label, index) => {
      const y = index * rowHeight + 4;
      const width = Math.max(4, (values[index] / max) * 200);
      const muted = highlightIndex !== undefined && highlightIndex !== index;
      const fill = muted ? MUTED : hexes[index % hexes.length];
      return `<g><text x="0" y="${y + 10}" font-size="11" fill="var(--text-secondary)" dominant-baseline="central">${esc(label)}</text><rect x="96" y="${y + 2}" width="${num(width)}" height="${rowHeight - 6}" rx="4" fill="${esc(fill)}"></rect><text x="${num(96 + width + 6)}" y="${y + 10}" font-size="11" fill="var(--text-tertiary)" dominant-baseline="central">${esc(values[index])}</text></g>`;
    })
    .join("");
  return `<figure style="margin:0"><figcaption class="gal-swatch-name" style="font-size:13px;margin-bottom:6px">${esc(title)}</figcaption><svg class="gal-mini-chart" viewBox="0 0 320 ${height}" role="img" aria-label="${esc(title)}">${rows}</svg></figure>`;
}

/** sequential / diverging 色階條，每階附 OKLCH */
function rampStrip(title: string, hexes: string[], startLabel: string, endLabel: string, midLabel?: string): string {
  const chips = hexes.map((hex) => `<span style="background:${esc(hex)};height:40px" title="${esc(`${hex} · ${oklchOf(hex)}`)}"></span>`).join("");
  const values = hexes.map((hex) => `<span>${esc(hex)}</span>`).join("");
  return `<figure style="margin:0" class="gal-stack"><figcaption class="gal-swatch-name" style="font-size:13px">${esc(title)}</figcaption><div class="gal-strip-row" style="height:40px">${chips}</div><div style="display:flex;justify-content:space-between;font-size:11px;color:var(--text-tertiary)"><span>${esc(startLabel)}</span>${midLabel ? `<span>${esc(midLabel)}</span>` : ""}<span>${esc(endLabel)}</span></div><div class="gal-swatch-value" style="display:flex;flex-wrap:wrap;gap:4px 10px">${values}</div></figure>`;
}

/** 用 sequential 色階畫一列熱力格，示範「連續數值用單色相淺→深」 */
function heatRow(title: string, hexes: string[], values: number[], labels: string[]): string {
  const max = Math.max(...values, 1);
  const cells = values
    .map((value, index) => {
      const step = Math.min(hexes.length - 1, Math.round((value / max) * (hexes.length - 1)));
      const rgb = parseColor(hexes[step]);
      const light = rgb ? rgbToOklch(rgb).l > 0.6 : true;
      return `<span style="background:${esc(hexes[step])};height:44px;display:flex;flex-direction:column;align-items:center;justify-content:center;font-size:10px;color:${light ? "#1a1a1a" : "#ffffff"}" title="${esc(`${labels[index]}: ${value}`)}"><span>${esc(labels[index])}</span><span style="font-weight:600">${esc(value)}</span></span>`;
    })
    .join("");
  return `<figure style="margin:0"><figcaption class="gal-swatch-name" style="font-size:13px;margin-bottom:6px">${esc(title)}</figcaption><div class="gal-strip-row">${cells}</div></figure>`;
}

/* ------------------------------------------------------------------ */
/* color-components/alert-tiers.tsx                                    */
/* ------------------------------------------------------------------ */

interface SemanticSet {
  role: string;
  bg: string;
  text: string;
  border: string;
}

const ALERT_ICONS: Record<string, string> = {
  info: "M12 16v-4m0-4h.01M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0z",
  success: "M20 6 9 17l-5-5",
  warning: "M12 9v4m0 4h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z",
  danger: "M18 6 6 18M6 6l12 12",
};

function alertIcon(role: string): string {
  return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${esc(ALERT_ICONS[role] ?? ALERT_ICONS.info)}"></path></svg>`;
}

function ratioBadge(fg: string, bg: string): string {
  const a = parseColor(fg);
  const b = parseColor(bg);
  if (!a || !b) return "";
  const ratio = contrastRatio(a, b);
  const pass = passesWcag(ratio, "normal");
  return badge(`${formatRatio(ratio)} ${pass ? "AA" : "未達 4.5"}`, pass ? "pass" : "fail");
}

/** 同一組語意色的兩種強度：low-contrast tint（專案現有）與 high-contrast 實色（示範補齊） */
function alertTiers(sets: SemanticSet[], surface: string): string {
  const tiers = sets
    .map((set) => {
      const a = parseColor(set.border);
      const b = parseColor(surface);
      let borderLine = "—";
      if (a && b) {
        const ratio = contrastRatio(a, b);
        borderLine = `${formatRatio(ratio)} ${passesWcag(ratio, "ui") ? "PASS" : "FAIL"}`;
      }
      return `<div class="gal-alert-tier">
<div class="gal-family-head"><h4>${esc(set.role)}</h4><span class="gal-meta">bg ${esc(set.bg)} · text ${esc(set.text)} · border ${esc(set.border)}</span></div>
<div class="gal-alert" style="background:${esc(set.bg)};color:${esc(set.text)};border:1px solid ${esc(set.border)};border-left-width:5px">${alertIcon(set.role)}<div><strong>Low-contrast（專案現有 token）</strong><span>淡底 + 左 5px 邊框 + icon + 同色系深字：日常提示。</span><div style="margin-top:6px">${ratioBadge(set.text, set.bg)}</div></div></div>
<div class="gal-alert" style="background:${esc(set.text)};color:#ffffff">${alertIcon(set.role)}<div><strong>High-contrast（示範：專案缺這一層）</strong><span>以 text 色當底、反白字：只給阻斷式 modal／critical。</span><div style="margin-top:6px">${ratioBadge("#ffffff", set.text)}</div></div></div>
<span class="gal-meta">邊框對頁面底色（${esc(surface)}）非文字 3:1：${esc(borderLine)}</span>
</div>`;
    })
    .join("\n");
  return `<div class="gal-grid gal-grid--two">${tiers}</div>`;
}

/* ------------------------------------------------------------------ */
/* color-components/budget-bar.tsx                                     */
/* ------------------------------------------------------------------ */

function budgetBar(): string {
  return `<div class="gal-stack">
<div class="gal-budget" aria-label="60-30-10 色彩配額"><span style="flex:60;background:var(--surface-quaternary)">60% 中性／背景</span><span style="flex:30;background:var(--border-hover)">30% 結構／邊框</span><span style="flex:10;background:linear-gradient(135deg, var(--color-lilac-dark), var(--color-mint-dark));color:#fff">10%</span></div>
<p class="gal-lede">10% 的高飽和預算由「警示」與「圖表重點色」共用。專案裡吃掉這份預算的東西：lilac→mint 漸層 CTA（cta-btn、TemplateCard Apply、CategoryFilter 作用態、DesktopTipModal 按鈕）、七色 CHART_COLORS、QrModal 狀態點、錯誤橫幅的橘框。疲勞來自面積 × 頻率，所以 toast 四秒自清、banner 同時只有一個，比選色更重要。</p>
</div>`;
}

/* ------------------------------------------------------------------ */
/* RatioLine（color-section.tsx 內部元件）                              */
/* ------------------------------------------------------------------ */

function ratioLine(label: string, fg: string, bg: string, use: "normal" | "ui" | "large"): string {
  const a = parseColor(fg);
  const b = parseColor(bg);
  if (!a || !b) return "";
  const ratio = contrastRatio(a, b);
  const pass = passesWcag(ratio, use);
  return `<li><span class="gal-contrast-sample" style="background:${esc(bg)};color:${esc(fg)};border:1px solid var(--border-subtle)">Aa</span> ${esc(label)}：${esc(formatRatio(ratio))}（需 ${use === "normal" ? "4.5" : "3"}:1）<span class="gal-badge" data-state="${pass ? "pass" : "fail"}" style="margin-left:6px">${pass ? "PASS" : "FAIL"}</span></li>`;
}

/* ------------------------------------------------------------------ */
/* 真實 BarChart 的靜態複刻（charts/bar-chart.tsx + Recharts 版面）     */
/* ------------------------------------------------------------------ */

/** 1-2-5 階的好看刻度步長 */
function niceStep(raw: number): number {
  if (!(raw > 0)) return 1;
  const magnitude = 10 ** Math.floor(Math.log10(raw));
  const normalized = raw / magnitude;
  const factor = normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10;
  return magnitude * factor;
}

function barChartReplica(): string {
  const { title, description, data } = BAR_CHART_FIXTURE;
  const width = 640;
  const height = 300;
  const margin = { top: 5, right: 20, bottom: 5, left: 0 };
  const yAxisWidth = 60;
  const xAxisHeight = 30;
  const plotLeft = margin.left + yAxisWidth;
  const plotRight = width - margin.right;
  const plotTop = margin.top;
  const plotBottom = height - margin.bottom - xAxisHeight;
  const plotWidth = plotRight - plotLeft;
  const plotHeight = plotBottom - plotTop;

  const max = Math.max(...data.map((entry) => entry.value), 1);
  const step = niceStep(max / 4);
  const yMax = Math.ceil(max / step) * step;
  const ticks: number[] = [];
  for (let value = 0; value <= yMax + 1e-9; value += step) ticks.push(value);
  const yOf = (value: number) => plotBottom - (value / yMax) * plotHeight;

  const band = plotWidth / data.length;
  const barWidth = band * 0.8;
  const radius = 4;
  const bars = data
    .map((entry, index) => {
      const x = plotLeft + band * index + (band - barWidth) / 2;
      const y = yOf(entry.value);
      const r = Math.min(radius, barWidth / 2, Math.max(0, plotBottom - y));
      const path = `M${num(x)},${num(plotBottom)} V${num(y + r)} Q${num(x)},${num(y)} ${num(x + r)},${num(y)} H${num(x + barWidth - r)} Q${num(x + barWidth)},${num(y)} ${num(x + barWidth)},${num(y + r)} V${num(plotBottom)} Z`;
      const fill = CHART_COLORS[index % CHART_COLORS.length];
      return `<path d="${path}" fill="${esc(fill)}"><title>${esc(`${entry.label}: ${entry.value}`)}</title></path>`;
    })
    .join("");
  const xLabels = data
    .map((entry, index) => {
      const cx = plotLeft + band * index + band / 2;
      return `<line x1="${num(cx)}" y1="${num(plotBottom)}" x2="${num(cx)}" y2="${num(plotBottom + 6)}" stroke="currentColor"></line><text x="${num(cx)}" y="${num(plotBottom + 9)}" text-anchor="middle" dominant-baseline="hanging" font-size="12" fill="currentColor">${esc(entry.label)}</text>`;
    })
    .join("");
  const yLabels = ticks
    .map((value) => {
      const y = yOf(value);
      return `<line x1="${num(plotLeft - 6)}" y1="${num(y)}" x2="${num(plotLeft)}" y2="${num(y)}" stroke="currentColor"></line><text x="${num(plotLeft - 9)}" y="${num(y)}" text-anchor="end" dominant-baseline="central" font-size="12" fill="currentColor">${esc(value)}</text>`;
    })
    .join("");

  return `<div style="border-radius:12px;border:1px solid var(--border-default);box-shadow:0 1px 2px rgba(0,0,0,0.05);padding:24px;max-width:42rem;margin:24px auto;background:var(--surface-primary)">
<div style="margin-bottom:16px"><h3 style="margin:0;font-size:20px;line-height:28px;font-weight:700;color:var(--text-primary)">${esc(title)}</h3><p style="margin:0;font-size:14px;line-height:20px;color:var(--text-secondary)">${esc(description)}</p></div>
<svg viewBox="0 0 ${width} ${height}" width="100%" style="display:block;height:auto;color:var(--text-secondary)" role="img" aria-label="${esc(title)}">
<g>${bars}</g>
<line x1="${num(plotLeft)}" y1="${num(plotBottom)}" x2="${num(plotRight)}" y2="${num(plotBottom)}" stroke="currentColor"></line>${xLabels}
<line x1="${num(plotLeft)}" y1="${num(plotTop)}" x2="${num(plotLeft)}" y2="${num(plotBottom)}" stroke="currentColor"></line>${yLabels}
</svg>
</div>`;
}

/* ------------------------------------------------------------------ */
/* 區塊                                                                 */
/* ------------------------------------------------------------------ */

function modeSeg(render: (mode: Mode) => string, ariaLabel: string): string {
  return seg(
    MODES.map((mode) => ({ key: mode, label: MODE_LABEL[mode], panel: render(mode) })),
    { ariaLabel },
  );
}

interface ModeData {
  mode: Mode;
  dsText: NamedColor[];
  dsBg: NamedColor[];
  dsBgPrimary: string;
  semanticSets: SemanticSet[];
  semanticText: NamedColor[];
  semanticBg: NamedColor[];
  appBackground: string;
  appText: NamedColor[];
  appSurface: NamedColor[];
  surfaces: NamedColor[];
  dsNeutral: string;
  appNeutral: string;
}

function computeMode(mode: Mode, designSystem: ColorFamily): ModeData {
  const dsText = pick(designSystem.swatches, ["--color-text-primary", "--color-text-secondary", "--color-text-tertiary"], mode);
  const dsBg = pick(designSystem.swatches, ["--color-background-primary", "--color-background-secondary", "--color-background-tertiary"], mode);
  const dsBgPrimary = dsBg[0]?.hex ?? "#ffffff";
  const semanticSets: SemanticSet[] = ["info", "success", "warning", "danger"].map((role) => ({
    role,
    bg: pick(designSystem.swatches, [`--color-background-${role}`], mode)[0]?.hex ?? "",
    text: pick(designSystem.swatches, [`--color-text-${role}`], mode)[0]?.hex ?? "",
    border: pick(designSystem.swatches, [`--color-border-${role}`], mode)[0]?.hex ?? "",
  }));
  const appBackground = pick(APP_TOKENS, ["--background"], mode)[0]?.hex ?? "#ffffff";
  const appText = pick(APP_TOKENS, ["--text-primary", "--text-secondary", "--text-tertiary"], mode);
  const appSurface = pick(APP_TOKENS, ["--surface-primary", "--surface-secondary", "--surface-quaternary", "--background"], mode);
  return {
    mode,
    dsText,
    dsBg,
    dsBgPrimary,
    semanticSets,
    semanticText: semanticSets.map((set) => ({ name: `text-${set.role}`, hex: set.text })),
    semanticBg: semanticSets.map((set) => ({ name: `bg-${set.role}`, hex: set.bg })),
    appBackground,
    appText,
    appSurface,
    surfaces: [
      { name: "--surface-primary", hex: appSurface[0]?.hex ?? "#ffffff" },
      { name: "sandbox bg-primary", hex: dsBgPrimary },
    ],
    dsNeutral: mode === "dark" ? "#2c2c2a" : "#f7f6f3",
    appNeutral: mode === "dark" ? "#9ca3af" : "#6b7280",
  };
}

export function renderColorSection(): string {
  const families = allFamilies();
  const designSystem = designSystemFamily();
  const ramps = svgRamps();
  const byMode: Record<Mode, ModeData> = {
    light: computeMode("light", designSystem),
    dark: computeMode("dark", designSystem),
  };
  const chartColors: NamedColor[] = CHART_COLORS.map((hex, index) => ({ name: CHART_NAMES[index], hex }));
  const sequentialRamp = sequential("#1b936f", 7);
  const divergingRamp = diverging("#9599cc", "#1b936f", 7);
  const riskyPairs: string[] = [];
  for (let i = 0; i < CHART_COLORS.length; i += 1) {
    for (let j = i + 1; j < CHART_COLORS.length; j += 1) {
      const verdict = classifyPair(CHART_COLORS[i], CHART_COLORS[j]);
      if (verdict.risk === "risky") riskyPairs.push(`${CHART_NAMES[i]} ↔ ${CHART_NAMES[j]}：${verdict.reason}`);
    }
  }
  const lilacRgb = parseColor(LILAC_DARK)!;
  const whiteRgb = parseColor("#ffffff")!;
  const lilacOnWhite = formatRatio(contrastRatio(lilacRgb, whiteRgb));
  const bluePurpleDeltaE = (deltaEOk(parseColor(CHART_COLORS[0])!, parseColor(CHART_COLORS[1])!) * 100).toFixed(0);
  const globalsCount = HARDCODED_COUNTS.find((entry) => entry.file.endsWith("globals.css"))?.count ?? 0;

  const intro = `<p>這個專案同時存在<strong>五個色彩家族</strong>：沙箱用的 design-system 語意 token、SVG 九色階、app 的品牌 lilac／mint 與 Tailwind 灰階、七色 CHART_COLORS，以及散落在十幾個檔案裡的硬編碼值。下面用 OKLCH 把它們放到同一個座標系，用 WCAG 2.2 AA 的嚴格門檻算對比，再用色盲模擬與 dataviz 驗證腳本檢查圖表色。所有數字都在頁面上即時計算。</p>
<p>方法論：三層 token（primitive → semantic → component，應用程式只碰 semantic）、主色用公式延伸而不是憑感覺、對比是生成參數不是事後檢查、色彩疲勞管的是 60-30-10 配額、警示色與圖表色在 semantic 層分家。</p>`;

  /* 1 · 色彩家族盤點 */
  const familyItems = families
    .map((family) =>
      item({
        name: family.name,
        path: family.source,
        state: family.id === "adhoc" ? "css" : "mounted",
        show: "computed",
        demo: "plain",
        wide: true,
        propsSummary: family.description,
        note: family.usage.length > 0 ? `<p>用在：${esc(family.usage.join("；"))}</p>` : undefined,
        body: `<div class="gal-swatch-grid">${family.swatches.map((entry) => swatch(entry.name, entry.light, entry.dark, entry.note)).join("")}</div>`,
      }),
    )
    .join("\n");
  const hardcodedItem = item({
    name: "硬編碼色值統計",
    path: "apps/app/src（非測試檔）",
    state: "css",
    demo: "plain",
    wide: true,
    propsSummary: `以 /#[0-9a-fA-F]{3,8}\\b|rgba?\\(/ 逐一計數，共 ${HARDCODED_TOTAL} 處；globals.css 是 token 定義本身，a2ui-theme.css 從未被引用。`,
    body: table(
      ["檔案", "筆數", "備註"],
      HARDCODED_COUNTS.map((entry) => [pathSpan(entry.file), esc(entry.count), esc(entry.note ?? "")]),
      { dense: true },
    ),
  });

  /* 2 · 色相環 */
  const hueWheelItem = item({
    name: "OKLCH 極座標分佈",
    path: "color-components/hue-wheel.tsx（即時計算）",
    state: "mounted",
    show: "computed",
    demo: "plain",
    wide: true,
    note: `<p>品牌 lilac 在 281°、mint 在 167°–180°；design-system 的 info 藍在 255° 附近、CHART_COLORS 的 blue 在 262°、purple 在 293°——同一個「藍」有三種角度。design-system 的灰（淺 ${esc(byMode.light.dsNeutral)}，${esc(oklchOf(byMode.light.dsNeutral))}；深 ${esc(byMode.dark.dsNeutral)}，${esc(oklchOf(byMode.dark.dsNeutral))}）是帶暖調的灰；app 的 Tailwind 灰（淺 ${esc(byMode.light.appNeutral)}，${esc(oklchOf(byMode.light.appNeutral))}；深 ${esc(byMode.dark.appNeutral)}，${esc(oklchOf(byMode.dark.appNeutral))}）偏冷藍，兩套中性色方向相反。</p>`,
    body: `<div id="${HUE_WHEEL_ROOT}">${modeSeg((mode) => hueWheel(families, mode), "色相環使用的色彩模式")}</div>${HUE_WHEEL_SCRIPT}`,
  });

  /* 3 · 系統配色診斷 */
  const tokenTable = item({
    name: "三層 token 對照",
    path: "packages/design-system · apps/app/src/app/globals.css",
    state: "mounted",
    demo: "plain",
    body: table(
      ["層", "design-system（沙箱）", "app（globals.css）"],
      [
        ["Primitive", "無；hex 直接寫在 semantic 裡", "部分：lilac／mint 色階（外觀命名）、Tailwind 灰"],
        ["Semantic", "有，角色命名正確：background／text／border × 3 階 + 4 語意", "混用：--surface-*、--text-* 是角色，--color-lilac 是外觀，還有一組同名的 --color-text-*"],
        ["Component", "無（元素選擇器直接套 token）", "--surface-btn、--surface-dialog、--chart-* 等，散在 :root"],
        ["深色機制", "@media (prefers-color-scheme) 重新生成", ":root.dark 換值；ThemeProvider 預設 light"],
        ["表面層級", "3 層 background", "4 層 surface（深色用 2–6% 白色透明度）"],
      ].map((row) => row.map((cell) => esc(cell))),
      { dense: true },
    ),
  });
  const brandItem = item({
    name: "品牌色 vs 互動主色",
    path: "apps/app/src/app/globals.css（--copilot-kit-primary-color）",
    state: "mounted",
    show: "computed",
    demo: "plain",
    note: `<p>品牌色 lilac-dark 直接當 CopilotKit 的 primary；它的 chroma 低、明度高，做大面積很舒服，但當文字或圖示色不夠對比。建議拆成 --brand（少量高調）與 --primary（由 brand 降 chroma、調 tone 後重新生成）。</p>`,
    body: modeSeg((mode) => {
      const surface = byMode[mode].appSurface[0]?.hex ?? "#ffffff";
      return `<ul class="gal-lede" style="margin:0;padding-left:18px;display:grid;gap:6px">
<li>--color-lilac-dark ${esc(LILAC_DARK)}：${esc(formatOklch(rgbToOklch(lilacRgb)))}</li>
${ratioLine("lilac-dark 當文字 on #ffffff", LILAC_DARK, "#ffffff", "normal")}
${ratioLine("lilac-dark 當圖示／邊框 on #ffffff", LILAC_DARK, "#ffffff", "ui")}
${ratioLine("mint-dark 當文字 on #ffffff", MINT_DARK, "#ffffff", "normal")}
${ratioLine("白字 on lilac-dark（.cta-btn--primary 漸層起點）", "#ffffff", LILAC_DARK, "normal")}
${ratioLine("白字 on mint-dark（漸層終點）", "#ffffff", MINT_DARK, "normal")}
${ratioLine("focus ring #189370 on --surface-primary", "#189370", surface, "ui")}
${ratioLine(".chat-error 邊框 #ffac4d on --surface-primary", "#ffac4d", surface, "ui")}
</ul>`;
    }, "品牌色對比使用的色彩模式"),
  });

  /* 4 · 對比驗收矩陣 */
  const contrastBlock = modeSeg((mode) => {
    const data = byMode[mode];
    return `<div class="gal-stack">
${contrastGrid({ title: `design-system 文字 × 背景（${mode}）`, fgs: data.dsText, bgs: data.dsBg, use: "normal" })}
${contrastGrid({ title: `design-system 語意文字 × 語意底（${mode}）`, fgs: data.semanticText, bgs: data.semanticBg, use: "normal" })}
${contrastGrid({ title: `design-system 語意邊框 × 背景，非文字 3:1（${mode}）`, fgs: data.semanticSets.map((set) => ({ name: `border-${set.role}`, hex: set.border })), bgs: data.dsBg, use: "ui", sampleText: "■" })}
${contrastGrid({ title: `app --text-* × --surface-*（${mode}；半透明表面先合成到 --background ${data.appBackground}）`, fgs: data.appText, bgs: data.appSurface, use: "normal", base: data.appBackground })}
${contrastGrid({ title: `CHART_COLORS 對表面，非文字 3:1（${mode}）`, fgs: chartColors, bgs: data.surfaces, use: "ui", sampleText: "▇", base: data.appBackground })}
</div>`;
  }, "對比矩陣使用的色彩模式");
  const contrastCallout = callout(
    `<strong>怎麼讀：</strong>比值截斷到兩位小數顯示，判定用原始值，所以顯示 4.49 的一定不過。設計系統的次要文字對次要背景在淺色模式剛好差一點；app 的 --text-tertiary 當任何正文都不過，只能當裝飾或大字。`,
  );

  /* 5 · 圖表配色 */
  const validatorTables = VALIDATOR_RESULTS.map(
    (result) =>
      `<table class="gal-table gal-table--dense" style="margin-bottom:8px"><caption style="text-align:left;font-weight:600;padding:4px 0">${esc(result.palette)}</caption><tbody>${result.rows
        .map(
          (row) =>
            `<tr><td>${esc(row[0])}</td><td>${badge(row[1], row[1] === "PASS" ? "pass" : row[1] === "FAIL" ? "fail" : "unmounted")}</td><td>${esc(row[2])}</td></tr>`,
        )
        .join("")}</tbody></table>`,
  ).join("");
  const chartCvdItem = item({
    id: "item-chart-cvd",
    name: "CHART_COLORS 的色盲與灰階檢查",
    path: "apps/app/src/components/generative-ui/charts/config.ts",
    state: "mounted",
    show: "computed",
    demo: "plain",
    wide: true,
    note: `<div><p>dataviz 驗證腳本（validate_palette.js）結論：</p>${validatorTables}</div>`,
    body: `<div class="gal-stack">
${cvdStrip("CHART_COLORS（固定順序 index % 7）", [...CHART_COLORS], CHART_NAMES)}
${cvdStrip("對照：Okabe-Ito 八色（色盲黃金標準）", [...OKABE_ITO])}
${
  riskyPairs.length > 0
    ? callout(`<strong>危險配對（classifyPair）：</strong><ul style="margin:4px 0 0;padding-left:18px">${riskyPairs.map((pair) => `<li>${esc(pair)}</li>`).join("")}</ul>`)
    : ""
}
</div>`,
  });
  const barChartItem = item({
    name: "真實 BarChart（CHART_COLORS 逐根換色）",
    path: "apps/app/src/components/generative-ui/charts/bar-chart.tsx",
    state: "mounted",
    show: "replica",
    demo: "plain",
    note: `<p>同一個度量的每一根長條換不同色相，顏色沒有承載任何資訊（dataviz 反模式：顏色跟位置走）；第 8 筆資料會循環回第 1 色。</p>`,
    body: barChartReplica(),
  });
  const highlightItem = item({
    name: "建議：單一度量用單色，重點用 highlight + mute",
    path: "color-components/palette-preview.tsx（示範）",
    state: "mounted",
    show: "computed",
    demo: "plain",
    note: `<p>一個度量一個顏色；要強調某一筆就只讓它飽和、其餘灰。超過 6–8 類不加新色相，改 small multiples 或「Other」。</p>`,
    body: `<div class="gal-stack">${categoricalBars("單一度量：mint-dark 一色", [MINT_DARK], CHART_LABELS, CHART_VALUES)}${categoricalBars("highlight + mute：只強調 May", [...CHART_COLORS], CHART_LABELS, CHART_VALUES, 4)}</div>`,
  });
  const sequentialItem = item({
    name: "Sequential：以 mint-dark 為 hue 生成",
    path: "color/palette-generation.ts",
    state: "mounted",
    show: "computed",
    demo: "plain",
    note: `<p>固定 hue、明度 0.95 → 0.35 線性、chroma 隨明度拋物線收斂（避免極亮極暗處 gamut clipping）。連續數值（金額、計數）用這種，不套分類色盤。</p>`,
    body: `<div class="gal-stack">${rampStrip("sequential('#1b936f', 7)", sequentialRamp, "低", "高")}${heatRow("月度數值熱力列（等距資料 = 等距感知）", sequentialRamp, CHART_VALUES, CHART_LABELS)}</div>`,
  });
  const divergingItem = item({
    name: "Diverging：lilac-dark ↔ mint-dark，中性中點",
    path: "color/palette-generation.ts",
    state: "mounted",
    show: "computed",
    demo: "plain",
    note: `<p>兩個 sequential 在中性中點（L 0.95、C 0.01）交會，兩極明度對稱；正負、超標／未達用這種，中點對齊零。</p>`,
    body: rampStrip("diverging('#9599cc', '#1b936f', 7)", divergingRamp, "− lilac", "+ mint", "0 中性"),
  });
  const rampsItem = item({
    id: "item-svg-ramps",
    name: "SVG 九色階在兩種模式的 fill / stroke / text",
    path: "packages/design-system/src/index.ts（SVG_CLASSES_CSS）",
    state: "mounted",
    show: "computed",
    demo: "plain",
    wide: true,
    note: `<p>這組是「淡底、深框、深字」的圖解色，不是圖表分類色；技能文件規定一張圖 2–3 階、顏色對應類別。驗證腳本指出 amber／green 與 pink／coral 相鄰時色盲難分，所以圖解要靠標籤與形狀而不是只靠色階。</p>`,
    body: `<div class="gal-swatch-grid">${ramps
      .map(
        (ramp) =>
          `<div class="gal-swatch"><div class="gal-swatch-chip gal-swatch-chip--split" style="height:64px"><span style="background:${esc(ramp.light.fill)};border-right:3px solid ${esc(ramp.light.stroke)};display:flex;align-items:center;justify-content:center;color:${esc(ramp.light.text)};font-size:11px;font-weight:500">Aa</span><span style="background:${esc(ramp.dark.fill)};border-left:3px solid ${esc(ramp.dark.stroke)};display:flex;align-items:center;justify-content:center;color:${esc(ramp.dark.text)};font-size:11px;font-weight:500">Aa</span></div><span class="gal-swatch-name">.c-${esc(ramp.name)}</span><span class="gal-swatch-value">淺 ${esc(ramp.light.fill)} / ${esc(ramp.light.stroke)}</span><span class="gal-swatch-value">深 ${esc(ramp.dark.fill)} / ${esc(ramp.dark.stroke)}</span></div>`,
      )
      .join("")}</div>`,
  });

  /* 6 · 警示／狀態色 */
  const hueConventionLine = (mode: Mode) =>
    byMode[mode].semanticSets
      .map((set) => {
        const rgb = parseColor(set.text);
        if (!rgb) return "";
        const hue = rgbToOklch(rgb).h;
        const convention = SEMANTIC_HUE_CONVENTION[set.role];
        const distance = hueDistance(hue, convention.hue);
        const ok = distance <= 15;
        return `<span style="margin-left:8px">${esc(set.role)} ${Math.round(hue)}°（慣例 ${esc(convention.label)} ${convention.hue}°）${badge(ok ? "在範圍內" : `偏 ${Math.round(distance)}°`, ok ? "pass" : "fail")}</span>`;
      })
      .join("");
  const alertItem = item({
    id: "item-alert-tiers",
    name: "四種語意色的兩種強度",
    path: "packages/design-system/src/index.ts（--color-*-info/success/warning/danger）",
    state: "mounted",
    show: "computed",
    demo: "plain",
    wide: true,
    note: `<div><p>專案的 bg + text + border 三件組正是 Carbon 的 low-contrast tint 結構，但沒有 high-contrast 層；錯誤橫幅用自己的 #ffac4d、QrModal 用 #e6a817／#1b936f，都沒走這組 token。</p><p>語意 hue 是否落在慣例範圍（±15°）：</p><p>淺色值：${hueConventionLine("light")}</p><p>深色值：${hueConventionLine("dark")}</p><p>三重編碼檢查：DataTable 的無效列只有文字（缺 icon）；MeetingTimePicker 用 emoji 當 icon；QrModal 有色點 + 文字但色點太小。</p></div>`,
    body: modeSeg((mode) => alertTiers(byMode[mode].semanticSets, byMode[mode].dsBgPrimary), "警示色使用的色彩模式"),
  });

  /* 7 · 色彩疲勞 */
  const budgetItem = item({
    name: "配額與頻率",
    path: "方法論：references/04-alerts-and-dataviz",
    state: "mounted",
    demo: "plain",
    wide: true,
    body: budgetBar(),
  });

  /* 8 · 建議清單 */
  const recommendations: [string, string][] = [
    [
      "拆 --brand 與 --primary",
      `lilac-dark 對白底只有 ${lilacOnWhite}，當 CopilotKit primary 的文字／圖示色不達 3:1。保留它當品牌色（logo、CTA 漸層），另生一個 OKLCH L≈0.45、C≈0.10、H 281° 的互動主色。代價：多一個 token、按鈕沒那麼「淡紫」。`,
    ],
    [
      "統一一套 semantic 命名",
      "刪掉 globals.css 與 design-system 重名的 --color-text-*；app 側改成 --surface-*／--text-*／--border-* 一套角色名，沙箱側維持 --color-*。代價：一次性搬 CSS。",
    ],
    [
      "中性色帶主色調",
      "app 的 Tailwind 灰偏冷藍（H≈260°）、design-system 灰偏暖（H≈90°），兩套看起來像拼裝。選一個 hue（建議 brand 的 281°），chroma 壓到 0.01–0.02 重生灰階。代價：灰階全換、視覺回歸要重拍。",
    ],
    [
      "圖表色 token 化並固定順序",
      `CHART_COLORS 改成 --chart-1..7 token、淺深兩套（深色降 chroma）；index % 7 循環改成「第 8 類折成 Other」；藍／紫相鄰對 ΔE 只有 ${bluePurpleDeltaE} 要重新排序或換色。代價：三處複製要合併。`,
    ],
    [
      "警示色補 high-contrast 層",
      "以 text 色當底、反白字，只給 modal／critical；.chat-error 與 QrModal 改用語意 token。代價：橘框顏色會變。",
    ],
    [
      "硬編碼改 token、CI 擋 raw hex",
      `${HARDCODED_TOTAL} 處字面中，globals.css 之外約 ${HARDCODED_TOTAL - globalsCount} 處可逐步改成 var()；a2ui-theme.css 未引用可刪。CI 在 token build 時算對比，低於門檻 fail。代價：lint 初期會紅一片。`,
    ],
    [
      "沙箱深色跟 app 一致",
      "THEME_CSS 除了 media query，再加 :root[data-theme=dark] 選擇器；渲染器建立 iframe 時把 app 的主題寫進去。代價：design-system 多一個選擇器、frame-content 多一行。",
    ],
  ];
  const findings = recommendations
    .map(([title, detail]) => `<article class="gal-finding"><span class="gal-badge gal-severity-medium">建議</span><h3>${esc(title)}</h3><p>${esc(detail)}</p></article>`)
    .join("\n");

  const body = `<div class="gal-actions"><span class="gal-meta">淺色值與深色值都在產生期算好；色相環、對比矩陣、品牌色對比與警示色各自用「淺色／深色」分段切換，數字與原頁即時計算的結果相同。</span></div>

${subhead("1 · 色彩家族盤點")}
<div class="gal-stack">
${familyItems}
${hardcodedItem}
</div>

${subhead("2 · 色相環：三套系統彼此不對齊")}
${hueWheelItem}

${subhead("3 · 系統配色診斷（token 架構）")}
<div class="gal-grid gal-grid--two">
${tokenTable}
${brandItem}
</div>

${subhead("4 · 對比驗收矩陣（WCAG 2.2 AA）")}
<div class="gal-stack">
${contrastBlock}
${contrastCallout}
</div>

${subhead("5 · 圖表配色")}
<div class="gal-stack">
${chartCvdItem}
<div class="gal-grid gal-grid--two">
${barChartItem}
${highlightItem}
</div>
<div class="gal-grid gal-grid--two">
${sequentialItem}
${divergingItem}
</div>
${rampsItem}
</div>

${subhead("6 · 警示／狀態色：用強度分級，不用更多色相")}
${alertItem}

${subhead("7 · 色彩疲勞：60-30-10 配額")}
${budgetItem}

${subhead("8 · 色彩建議清單（附取捨）")}
<div class="gal-stack">
${findings}
</div>`;

  return section("color", intro, body);
}
