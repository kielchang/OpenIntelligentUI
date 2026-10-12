/**
 * 從 OpenIntelligentUI 的原始碼取出 token：globals.css（app）、THEME_CSS／SVG_CLASSES_CSS（沙箱）、CHART_COLORS。
 * 值一律照原始碼；名稱照原始碼去掉 `--`，沙箱那套與 app 重名，所以改成 sandbox- 前綴並在 usage 註明原名。
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { SVG_CLASSES_CSS, THEME_CSS } from "@repo/design-system";
import { extractDarkBlocks, parseThemeTokens } from "@/components/ui-gallery/design-tokens";
import { CHART_COLORS } from "@/components/generative-ui/charts/config";
import { composite, contrastRatio, formatRatio, parseColor } from "@/components/ui-gallery/color/color-math";
import { diverging, sequential } from "@/components/ui-gallery/color/palette-generation";

export const REPO = resolve(process.cwd(), "../../..");
export const readRepo = (rel: string) => readFileSync(`${REPO}/${rel}`, "utf8");

export interface ThemedValue {
  light: string;
  dark?: string;
}
export interface Token {
  name: string;
  value: string | ThemedValue;
  usage: string;
}
export interface TypeStyle {
  name: string;
  fontSize: string;
  lineHeight: string | number;
  fontWeight: number;
  letterSpacing?: string;
  family?: string;
  sample?: string;
  usage?: string;
}

const IS_COLOR = /^(#[0-9a-fA-F]{3,8}|rgba?\(|hsla?\(|oklch\()/;

function cssBlock(css: string, selector: string): Map<string, string> {
  const map = new Map<string, string>();
  const re = new RegExp(`(^|\\n)${selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*\\{([^}]*)\\}`, "g");
  let m: RegExpExecArray | null;
  while ((m = re.exec(css))) {
    for (const line of m[2].split("\n")) {
      const d = /^\s*(--[a-z0-9-]+)\s*:\s*([^;]+);/i.exec(line);
      if (d && !map.has(d[1])) map.set(d[1], d[2].trim());
    }
  }
  return map;
}

/** app token 的用途說明（繁中）；沒列的用預設句 */
const APP_USAGE: Record<string, string> = {
  background: "頁面底色；聊天外殼與 /gallery 的 body 背景。",
  foreground: "body 的預設文字色；一般內文改用 text-primary。",
  "color-lilac": "品牌識別色之一（lilac）。只用在歡迎畫面漸層、CTA 與 chip，不當內文色。",
  "color-lilac-light": "lilac 的淡階，用於玻璃卡與 hover 暈光。",
  "color-lilac-dark": "lilac 的深階；CopilotKit 元件的主色（copilot-kit-primary-color）與 CTA 漸層起點。對白底 3.1:1，只能當大字或圖形色。",
  "color-mint": "品牌識別色之一（mint）。歡迎畫面漸層與 chip。",
  "color-mint-light": "mint 的淡階，用於玻璃卡。",
  "color-mint-dark": "mint 的深階；CTA 漸層終點、成功狀態、/gallery 的強調色。",
  "color-surface": "舊版表面色（app 第一套 token）；新畫面改用 surface-*。",
  "color-surface-light": "舊版淺表面色；與 background 同值。",
  "color-container": "卡片與對話框容器底色（舊版命名）。",
  "color-text-primary": "舊版文字主色；注意與沙箱的 sandbox-text-primary 同名不同值，只在 app 這一套使用。",
  "color-text-secondary": "舊版文字次色。",
  "color-text-tertiary": "舊版文字三級色。",
  "color-border": "舊版邊框色。",
  "color-border-light": "舊版淡邊框色。",
  "color-border-glass": "玻璃卡邊框（半透明白）。",
  "color-glass": "玻璃卡底色（半透明白）。",
  "color-glass-subtle": "較淡的玻璃底色。",
  "color-glass-dark": "玻璃卡在深色下的底色。",
  "surface-primary": "卡片、表格、面板的主要表面；文字用 text-primary。",
  "surface-secondary": "次要表面：hover 列、側欄、導覽選中態。",
  "surface-tertiary": "三級表面：chip、程式碼底、表格表頭。",
  "surface-quaternary": "四級表面：徽章底、分段按鈕軌道。",
  "surface-btn": "次要按鈕底色。",
  "surface-btn-hover": "次要按鈕 hover 底色。",
  "surface-canvas-header": "畫布標頭底色。",
  "surface-dialog": "對話框底色。",
  "text-primary": "內文與標題的主要文字色；放在 background 與 surface-primary…quaternary 上。",
  "text-secondary": "次要文字：說明、路徑、meta；放在 surface-primary 與 background 上。",
  "text-tertiary": "三級文字：placeholder、註腳、停用；深色主題下對 surface-primary 未達 4.5:1（來源如此），只用於非必要資訊。",
  "border-default": "預設邊框：卡片、表格、輸入框。",
  "border-hover": "hover 與 focus 前的邊框。",
  "border-subtle": "極淡分隔線。",
  "border-light": "淡邊框（與 surface-quaternary 同值）。",
  "accent-indigo": "舊版強調色別名（＝color-lilac-dark）。",
  "accent-blue": "舊版強調色別名（＝color-lilac）。",
  "accent-emerald": "舊版強調色別名（＝color-mint）。",
  backdrop: "對話框與抽屜後方的遮罩。",
  "chart-tooltip-bg": "圖表 tooltip 底色。",
  "chart-tooltip-border": "圖表 tooltip 邊框。",
  "chart-axis": "圖表軸線與刻度文字；對 surface-primary 淺色 4.8:1。",
  "copilot-kit-primary-color": "CopilotKit 元件的主色；淺色別名 color-lilac-dark，深色別名 color-lilac。",
};

const SANDBOX_USAGE: Record<string, string> = {
  "sandbox-background-primary": "沙箱頁面底色（原名 --color-background-primary）。",
  "sandbox-background-secondary": "沙箱卡片與區塊底（原名 --color-background-secondary）。",
  "sandbox-background-tertiary": "沙箱三級底：chip、表頭（原名 --color-background-tertiary）。",
  "sandbox-text-primary": "沙箱內文主色，放在 sandbox-background-primary…tertiary 上（原名 --color-text-primary）。",
  "sandbox-text-secondary": "沙箱次要文字（原名 --color-text-secondary）。",
  "sandbox-text-tertiary": "沙箱三級文字；淺色下對 sandbox-background-primary 4.6:1（原名 --color-text-tertiary）。",
  "sandbox-border-primary": "沙箱主要邊框（原名 --color-border-primary）。",
  "sandbox-border-secondary": "沙箱次要邊框（原名 --color-border-secondary）。",
  "sandbox-border-tertiary": "沙箱淡邊框（原名 --color-border-tertiary）。",
};
for (const sem of ["info", "danger", "success", "warning"]) {
  SANDBOX_USAGE[`sandbox-background-${sem}`] = `${sem} 的低強度底（tint）；文字用 sandbox-text-${sem}（原名 --color-background-${sem}）。`;
  SANDBOX_USAGE[`sandbox-text-${sem}`] = `${sem} 的文字色，放在 sandbox-background-${sem} 上；高強度層以它當底配白字（原名 --color-text-${sem}）。`;
  SANDBOX_USAGE[`sandbox-border-${sem}`] = `${sem} 的邊框與左側條（原名 --color-border-${sem}）。`;
}

export interface TokenSet {
  color: Token[];
  spacing: Token[];
  radius: Token[];
  shadow: Token[];
  families: Record<string, string>;
  skipped: string[];
}

export function extractTokens(): TokenSet {
  const globals = readRepo("apps/app/src/app/globals.css");
  const light = cssBlock(globals, ":root");
  const dark = cssBlock(globals, ":root.dark");
  const color: Token[] = [];
  const spacing: Token[] = [];
  const radius: Token[] = [];
  const shadow: Token[] = [];
  const families: Record<string, string> = {};
  const skipped: string[] = [];

  const aliasOf = (v: string): string | null => {
    const m = /^var\(--([a-z0-9-]+)\)$/.exec(v);
    return m ? `{${m[1]}}` : null;
  };
  const themed = (name: string, lv: string, dv?: string): string | ThemedValue => (dv && dv !== lv ? { light: lv, dark: dv } : lv);

  for (const [raw, lv] of light) {
    const name = raw.slice(2);
    const dv = dark.get(raw);
    const usage = APP_USAGE[name] ?? "見 apps/app/src/app/globals.css。";
    if (name === "font-family") {
      families.sans = lv.replace(/'/g, '"');
      continue;
    }
    if (name.startsWith("space-")) {
      spacing.push({ name, value: lv, usage: usageForSpace(name, lv) });
      continue;
    }
    if (name.startsWith("radius-")) {
      radius.push({ name, value: lv, usage: usageForRadius(name) });
      continue;
    }
    if (name.startsWith("shadow-")) {
      shadow.push({ name, value: themed(name, lv, dv), usage: usageForShadow(name) });
      continue;
    }
    const la = aliasOf(lv);
    const da = dv ? aliasOf(dv) : null;
    if (la || IS_COLOR.test(lv)) {
      const lightValue = la ?? lv.toLowerCase();
      const darkValue = dv ? (da ?? (IS_COLOR.test(dv) ? dv.toLowerCase() : undefined)) : undefined;
      if (dv && darkValue === undefined) skipped.push(`${raw} 的深色值「${dv}」不是顏色，深色沿用淺色`);
      color.push({ name, value: themed(name, lightValue, darkValue), usage });
      continue;
    }
    skipped.push(`${raw}: ${lv}（頁面不接受的值，未納入）`);
  }

  // 沙箱 token（THEME_CSS）
  const sandbox = parseThemeTokens(THEME_CSS);
  const sandboxDark = new Map(sandbox.dark.map((e) => [e.name, e.value]));
  for (const entry of sandbox.light) {
    const dv = sandboxDark.get(entry.name);
    if (entry.name.startsWith("--color-")) {
      const name = `sandbox-${entry.name.slice("--color-".length)}`;
      color.push({ name, value: themed(name, entry.value.toLowerCase(), dv?.toLowerCase()), usage: SANDBOX_USAGE[name] ?? `沙箱 token（原名 ${entry.name}）。` });
    } else if (entry.name.startsWith("--font-")) {
      families[`sandbox-${entry.name.slice("--font-".length)}`] = entry.value;
    } else if (entry.name.startsWith("--border-radius-")) {
      const size = entry.name.slice("--border-radius-".length);
      radius.push({ name: `border-radius-${size}`, value: entry.value, usage: `沙箱的 ${size} 圓角（原名 ${entry.name}）；生成式 UI 的 css 參數只能用這三個。` });
    } else {
      const alias = aliasOf(entry.value);
      if (alias) {
        const target = alias.slice(1, -1).replace(/^color-/, "sandbox-");
        color.push({ name: `sandbox-svg-${entry.name.slice(2)}`, value: `{${target}}`, usage: `SVG 類別用的短名（原名 ${entry.name} = var(${alias.slice(1, -1).replace(/^/, "--")})）。` });
      } else {
        skipped.push(`${entry.name}: ${entry.value}（沙箱）`);
      }
    }
  }

  // SVG 九色階
  const rampRe = /svg rect\.c-([a-z]+)[^{]*\{\s*fill:\s*(#[0-9a-fA-F]{6});\s*stroke:\s*(#[0-9a-fA-F]{6});\s*\}\s*svg \.c-\1 text\.th, svg \.c-\1 text\.t \{ fill: (#[0-9a-fA-F]{6}); \}\s*svg \.c-\1 text\.ts \{ fill: (#[0-9a-fA-F]{6}); \}/g;
  const parseRamps = (css: string) => {
    const out = new Map<string, { fill: string; stroke: string; text: string; textSmall: string }>();
    let m: RegExpExecArray | null;
    while ((m = rampRe.exec(css))) if (!out.has(m[1])) out.set(m[1], { fill: m[2].toLowerCase(), stroke: m[3].toLowerCase(), text: m[4].toLowerCase(), textSmall: m[5].toLowerCase() });
    rampRe.lastIndex = 0;
    return out;
  };
  const rampsLight = parseRamps(SVG_CLASSES_CSS);
  const rampsDark = parseRamps(extractDarkBlocks(SVG_CLASSES_CSS).join("\n"));
  for (const [ramp, lv] of rampsLight) {
    const dv = rampsDark.get(ramp);
    const base = `SVG 圖解色階 .c-${ramp}`;
    color.push({ name: `ramp-${ramp}-fill`, value: themed("", lv.fill, dv?.fill), usage: `${base} 的形狀底色（rect／circle／ellipse 的 fill）。` });
    color.push({ name: `ramp-${ramp}-stroke`, value: themed("", lv.stroke, dv?.stroke), usage: `${base} 的外框（stroke）；與 fill 之間至少 3:1。` });
    color.push({ name: `ramp-${ramp}-text`, value: themed("", lv.text, dv?.text), usage: `${base} 內 text.t／text.th 的文字色，放在 ramp-${ramp}-fill 上。` });
    color.push({ name: `ramp-${ramp}-text-small`, value: themed("", lv.textSmall, dv?.textSmall), usage: `${base} 內 text.ts（12px）的文字色，放在 ramp-${ramp}-fill 上。` });
  }

  // 圖表分類色與焦點環
  CHART_COLORS.forEach((hex, i) => {
    color.push({ name: `chart-${i + 1}`, value: hex.toLowerCase(), usage: `圖表分類色第 ${i + 1} 位；順序固定、不循環，第 8 個類別起改用 highlight+mute。淺深兩主題同值。` });
  });
  color.push({ name: "focus-ring", value: "#189370", usage: "鍵盤焦點環（2px solid，offset 3px）；對 surface-primary 淺色 3.9:1、深色 4.7:1。" });
  // 新增（原始碼無）：放在 color-lilac／color-mint 等品牌淡色上的文字色；品牌色在深色主題不變暗，所以兩主題同值
  color.push({ name: "on-brand", value: "#010507", usage: "放在 color-lilac、color-mint、color-lilac-light、color-mint-light 上的文字與圖示色；兩主題同值（品牌淡色不隨主題變暗）。新增 token：來源的 CTA 用白字放在 lilac-dark→mint-dark 漸層上，對 lilac-dark 只有 2.72:1，本系統改以淡品牌色配深字。" });
  families.mono = '"Spline Sans Mono", ui-monospace, SFMono-Regular, Menlo, monospace';
  // 新增（衍生）：連續與發散色階，由品牌深階以 OKLCH 生成；兩主題同值（圖表色與 UI 色分家）
  const mintDark = color.find((t) => t.name === "color-mint-dark")!.value as string;
  const lilacDark = color.find((t) => t.name === "color-lilac-dark")!.value as string;
  sequential(mintDark, 7).forEach((hex, i) => {
    color.push({ name: `scale-mint-${i + 1}`, value: hex.toLowerCase(), usage: `單色連續色階第 ${i + 1}／7 階（淺→深），色相固定為 color-mint-dark，明度遞減、彩度拋物線收斂，由 OKLCH 生成。用於熱力圖、單一度量的深淺；不當分類色。兩主題同值。` });
  });
  diverging(lilacDark, mintDark, 7).forEach((hex, i) => {
    color.push({ name: `scale-diverge-${i + 1}`, value: hex.toLowerCase(), usage: `發散色階第 ${i + 1}／7 階：1 為 color-lilac-dark 極、4 為中性中點、7 為 color-mint-dark 極，由 OKLCH 生成。用於偏差、正負、前後對比；中點永遠代表零或基準。兩主題同值。` });
  });

  return { color, spacing, radius, shadow, families, skipped };
}

function usageForSpace(name: string, value: string): string {
  const n = Number(name.split("-")[1]);
  const uses: Record<number, string> = {
    1: "最小間距：圖示與文字、徽章內距上下。",
    2: "chip 與徽章的內距、緊湊列表的列距。",
    3: "表單欄位之間、卡片內的段距。",
    4: "卡片內距、工具列水平內距、網格 gap。",
    5: "區塊內的大段距。",
    6: "區塊之間、對話框內距。",
    8: "頁面區段之間。",
  };
  return `${value}。${uses[n] ?? ""}`.trim();
}
function usageForRadius(name: string): string {
  const uses: Record<string, string> = {
    "radius-sm": "小控制項：chip、徽章、輸入框。",
    "radius-md": "按鈕、表格外框、導覽項。",
    "radius-lg": "卡片、iframe 框、對話框內區塊。",
    "radius-xl": "大卡片與抽屜。",
    "radius-2xl": "歡迎畫面的大容器。",
  };
  return uses[name] ?? "見 globals.css。";
}
function usageForShadow(name: string): string {
  const uses: Record<string, string> = {
    "shadow-sm": "分段按鈕選中態、輸入框 focus 前。",
    "shadow-md": "下拉選單。",
    "shadow-lg": "toast、popover、對話框。",
    "shadow-glass": "玻璃卡。",
    "shadow-glow-lilac": "lilac 暈光（hover 裝飾）。",
    "shadow-glow-mint": "mint 暈光（hover 裝飾）。",
    "shadow-card": "卡片靜止；深色主題改為無陰影、靠表面亮度分層。",
    "shadow-card-hover": "卡片 hover；深色主題無。",
    "shadow-compact": "緊湊卡片靜止；深色主題無。",
    "shadow-compact-hover": "緊湊卡片 hover；深色主題無。",
  };
  return uses[name] ?? "見 globals.css。";
}

export const TYPE_GROUPS = [
  {
    name: "Text",
    family: "sans",
    note: "一個 sans 家族，六個字級；字重只用 400／500／600／700。",
    styles: [
      { name: "display", fontSize: "28px", lineHeight: 1.2, fontWeight: 700, letterSpacing: "-0.02em", sample: "Answers you can interact with", usage: "歡迎畫面標題與區塊大標（.branded-header-title）。" },
      { name: "heading", fontSize: "16px", lineHeight: 1.25, fontWeight: 600, letterSpacing: "-0.4px", sample: "Open Intelligent UI", usage: "聊天標頭與卡片標題（.chat-name）。" },
      { name: "subheading", fontSize: "15px", lineHeight: 1.4, fontWeight: 600, sample: "請求流程", usage: "區塊內小標。" },
      { name: "body", fontSize: "14px", lineHeight: 1.6, fontWeight: 400, sample: "代理依任務選擇純文字、原生元件或自訂互動 UI。", usage: "內文、表格儲存格、表單文字。" },
      { name: "body-small", fontSize: "13px", lineHeight: 1.5, fontWeight: 400, sample: "初始高度由沙箱回報取代，限 50–4000px。", usage: "密集表格、meta、註記。" },
      { name: "label", fontSize: "13px", lineHeight: 1.4, fontWeight: 600, sample: "OpenAI API key", usage: "表單標籤、表頭、徽章文字。" },
      { name: "caption", fontSize: "12px", lineHeight: 1.4, fontWeight: 400, sample: "Illustrative sample values (not live data)", usage: "說明、資料來源標示、路徑。" },
    ] as TypeStyle[],
  },
  {
    name: "Code",
    family: "mono",
    styles: [{ name: "code", fontSize: "13px", lineHeight: 1.5, fontWeight: 400, sample: "generateSandboxedUi({ css, html, jsFunctions })", usage: "程式碼、token 名稱、識別字。" }] as TypeStyle[],
  },
];

export interface ContrastRow {
  fg: string;
  bg: string;
  theme: "light" | "dark";
  ratio: number;
  text: string;
  threshold: number;
  pass: boolean;
}

function resolveValue(tokens: Token[], name: string, theme: "light" | "dark", depth = 0): string | null {
  const t = tokens.find((x) => x.name === name);
  if (!t || depth > 16) return null;
  const v = typeof t.value === "string" ? t.value : (t.value[theme] ?? t.value.light);
  const alias = /^\{([^}]+)\}$/.exec(v);
  return alias ? resolveValue(tokens, alias[1], theme, depth + 1) : v;
}

/** 文字 token × 底色 token 的對比；深色的半透明表面先與 background 合成 */
export function contrastReport(tokens: Token[]): ContrastRow[] {
  const pairs: Array<[string, string, number]> = [
    ["text-primary", "surface-primary", 4.5],
    ["text-primary", "background", 4.5],
    ["text-secondary", "surface-primary", 4.5],
    ["text-secondary", "background", 4.5],
    ["text-tertiary", "surface-primary", 4.5],
    ["foreground", "background", 4.5],
    ["chart-axis", "surface-primary", 4.5],
    ["color-lilac-dark", "surface-primary", 3],
    ["color-mint-dark", "surface-primary", 3],
    ["focus-ring", "surface-primary", 3],
    ["on-brand", "color-lilac", 4.5],
    ["on-brand", "color-mint", 4.5],
    ["background", "text-primary", 4.5],
    ["sandbox-text-primary", "sandbox-background-primary", 4.5],
    ["sandbox-text-secondary", "sandbox-background-primary", 4.5],
    ["sandbox-text-tertiary", "sandbox-background-primary", 4.5],
    ["sandbox-text-primary", "sandbox-background-secondary", 4.5],
    ["sandbox-text-info", "sandbox-background-info", 4.5],
    ["sandbox-text-danger", "sandbox-background-danger", 4.5],
    ["sandbox-text-success", "sandbox-background-success", 4.5],
    ["sandbox-text-warning", "sandbox-background-warning", 4.5],
    ["sandbox-border-info", "sandbox-background-primary", 3],
    ["sandbox-border-danger", "sandbox-background-primary", 3],
    ["sandbox-border-success", "sandbox-background-primary", 3],
    ["sandbox-border-warning", "sandbox-background-primary", 3],
  ];
  const rows: ContrastRow[] = [];
  for (const theme of ["light", "dark"] as const) {
    const base = resolveValue(tokens, "background", theme) ?? "#ffffff";
    for (const [fg, bg, threshold] of pairs) {
      const fv = resolveValue(tokens, fg, theme);
      const bv = resolveValue(tokens, bg, theme);
      if (!fv || !bv) continue;
      const bgRgb = composite(parseColor(bv), parseColor(base));
      const fgRgb = composite(parseColor(fv), bgRgb);
      const ratio = contrastRatio(fgRgb, bgRgb);
      rows.push({ fg, bg, theme, ratio, text: formatRatio(ratio), threshold, pass: ratio >= threshold });
    }
  }
  return rows;
}

/** 依 format.md「tokens.css as compiled」產生本機預覽用的 tokens.css（頁面會自己生成，這份只給 Playwright 用） */
export function compileTokensCss(set: TokenSet, groups: typeof TYPE_GROUPS, title: string): string {
  const val = (t: Token, theme: "light" | "dark") => {
    const v = typeof t.value === "string" ? t.value : (t.value[theme] ?? t.value.light);
    const alias = /^\{([^}]+)\}$/.exec(v);
    return alias ? `var(--${alias[1]})` : v;
  };
  const lines: string[] = [`/* ${title} — generated from tokens.json */`];
  lines.push(`:root, [data-theme="light"] {`);
  for (const t of [...set.color, ...set.shadow]) lines.push(`  --${t.name}: ${val(t, "light")};`);
  lines.push(`}`);
  lines.push(`[data-theme="dark"] {`);
  for (const t of [...set.color, ...set.shadow]) lines.push(`  --${t.name}: ${val(t, "dark")};`);
  lines.push(`}`);
  lines.push(`:root {`);
  for (const t of [...set.spacing, ...set.radius]) lines.push(`  --${t.name}: ${t.value};`);
  for (const [k, v] of Object.entries(set.families)) lines.push(`  --font-${k}: ${v};`);
  lines.push(`}`);
  for (const g of groups) {
    for (const s of g.styles) {
      lines.push(`.${s.name} { font-family: var(--font-${s.family ?? g.family}); font-size: ${s.fontSize}; line-height: ${s.lineHeight}; font-weight: ${s.fontWeight};${s.letterSpacing ? ` letter-spacing: ${s.letterSpacing};` : ""} }`);
    }
  }
  return lines.join("\n");
}
