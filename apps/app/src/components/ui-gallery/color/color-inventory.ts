/**
 * 專案裡所有色彩家族的盤點。
 * design-system 兩組從匯出的 CSS 字串即時解析；CHART_COLORS 直接 import；
 * globals.css 與散落硬編碼是靜態清單，由 color-inventory.test.ts 對照原始檔案。
 */
import { SVG_CLASSES_CSS, THEME_CSS } from "@repo/design-system";
import { CHART_COLORS } from "@/components/generative-ui/charts/config";
import { extractDarkBlocks, isColorValue, parseThemeTokens } from "../design-tokens";

export type ColorRole = "background" | "text" | "border" | "semantic" | "brand" | "surface" | "chart" | "diagram" | "adhoc";

export interface ColorSwatch {
  name: string;
  light: string;
  dark?: string;
  role: ColorRole;
  note?: string;
}

export interface ColorFamily {
  id: string;
  name: string;
  source: string;
  description: string;
  usage: string[];
  swatches: ColorSwatch[];
}

function roleOf(name: string): ColorRole {
  if (/-(info|danger|success|warning)$/.test(name)) return "semantic";
  if (name.startsWith("--color-background")) return "background";
  if (name.startsWith("--color-text")) return "text";
  if (name.startsWith("--color-border")) return "border";
  return "adhoc";
}

/** design-system 語意 token（light / dark） */
export function designSystemFamily(): ColorFamily {
  const tokens = parseThemeTokens(THEME_CSS);
  const dark = new Map(tokens.dark.map((entry) => [entry.name, entry.value]));
  return {
    id: "design-system",
    name: "design-system 語意 token",
    source: "packages/design-system/src/index.ts（THEME_CSS）",
    description: "沙箱內生成式 UI 唯一允許使用的色彩；角色命名，深色是另一組重新生成的值（不是反轉）。",
    usage: ["所有 generateSandboxedUi 輸出", "MCP assemble_document", "TemplateCard 預覽 iframe"],
    swatches: tokens.light
      .filter((entry) => isColorValue(entry.value))
      .map((entry) => ({ name: entry.name, light: entry.value, dark: dark.get(entry.name), role: roleOf(entry.name) })),
  };
}

export interface SvgRamp {
  name: string;
  light: { fill: string; stroke: string; text: string; sub: string };
  dark: { fill: string; stroke: string; text: string; sub: string };
}

function parseRamps(css: string): Map<string, { fill: string; stroke: string; text: string; sub: string }> {
  const ramps = new Map<string, { fill: string; stroke: string; text: string; sub: string }>();
  const shape = /svg rect\.c-([a-z]+), svg circle\.c-\1, svg ellipse\.c-\1 \{ fill: (#[0-9A-Fa-f]{6}); stroke: (#[0-9A-Fa-f]{6}); \}/g;
  const heading = /svg \.c-([a-z]+) text\.th, svg \.c-\1 text\.t \{ fill: (#[0-9A-Fa-f]{6}); \}/g;
  const sub = /svg \.c-([a-z]+) text\.ts \{ fill: (#[0-9A-Fa-f]{6}); \}/g;
  let match: RegExpExecArray | null;
  while ((match = shape.exec(css)) !== null) {
    ramps.set(match[1], { fill: match[2], stroke: match[3], text: "", sub: "" });
  }
  while ((match = heading.exec(css)) !== null) {
    const ramp = ramps.get(match[1]);
    if (ramp) ramp.text = match[2];
  }
  while ((match = sub.exec(css)) !== null) {
    const ramp = ramps.get(match[1]);
    if (ramp) ramp.sub = match[2];
  }
  return ramps;
}

/** SVG 九色階：每階 fill / stroke / 標題字 / 副標字，light 與 dark */
export function svgRamps(): SvgRamp[] {
  const darkStart = SVG_CLASSES_CSS.indexOf("@media (prefers-color-scheme: dark)");
  const lightCss = darkStart === -1 ? SVG_CLASSES_CSS : SVG_CLASSES_CSS.slice(0, darkStart);
  const darkCss = extractDarkBlocks(SVG_CLASSES_CSS).join("\n");
  const light = parseRamps(lightCss);
  const dark = parseRamps(darkCss);
  return Array.from(light.entries()).map(([name, values]) => ({
    name,
    light: values,
    dark: dark.get(name) ?? values,
  }));
}

export function svgRampFamily(): ColorFamily {
  const ramps = svgRamps();
  return {
    id: "svg-ramps",
    name: "SVG 九色階（.c-*）",
    source: "packages/design-system/src/index.ts（SVG_CLASSES_CSS）· apps/agent/skills/svg-diagrams/SKILL.md",
    description: "圖解用的淡底／深框／深字三件組；技能文件要求一張圖只用 2–3 階，顏色對應類別而非順序。",
    usage: ["svg-diagrams 技能產生的流程圖與結構圖", "bicycle-gears 等互動 SVG"],
    swatches: ramps.flatMap((ramp) => [
      { name: `.c-${ramp.name} fill`, light: ramp.light.fill, dark: ramp.dark.fill, role: "diagram" as const },
      { name: `.c-${ramp.name} stroke`, light: ramp.light.stroke, dark: ramp.dark.stroke, role: "diagram" as const },
      { name: `.c-${ramp.name} text`, light: ramp.light.text, dark: ramp.dark.text, role: "diagram" as const },
    ]),
  };
}

/** app 端 globals.css 的 token（靜態抄錄；測試會對照原檔） */
export const APP_TOKENS: ColorSwatch[] = [
  { name: "--color-lilac", light: "#BEC2FF", role: "brand" },
  { name: "--color-lilac-light", light: "#D4D7FF", role: "brand" },
  { name: "--color-lilac-dark", light: "#9599CC", role: "brand", note: "同時是 --copilot-kit-primary-color（淺色）" },
  { name: "--color-mint", light: "#85E0CE", role: "brand" },
  { name: "--color-mint-light", light: "#A8E9DC", role: "brand" },
  { name: "--color-mint-dark", light: "#1B936F", role: "brand" },
  { name: "--background", light: "#F7F7F9", dark: "#0a0a0a", role: "background" },
  { name: "--foreground", light: "#010507", dark: "#ededed", role: "text" },
  { name: "--color-surface", light: "#DEDEE9", dark: "#1a1a2e", role: "surface" },
  { name: "--color-container", light: "#FFFFFF", dark: "#1a1a2e", role: "surface" },
  { name: "--color-text-primary", light: "#010507", dark: "#e5e7eb", role: "text", note: "與 design-system 同名、不同值" },
  { name: "--color-text-secondary", light: "#57575B", dark: "#9ca3af", role: "text" },
  { name: "--color-text-tertiary", light: "#8E8E93", dark: "#6b7280", role: "text" },
  { name: "--color-border", light: "#DBDBE5", dark: "rgba(255, 255, 255, 0.1)", role: "border" },
  { name: "--color-border-glass", light: "rgba(255, 255, 255, 0.3)", dark: "rgba(255, 255, 255, 0.08)", role: "border" },
  { name: "--surface-primary", light: "#fff", dark: "rgba(255, 255, 255, 0.04)", role: "surface" },
  { name: "--surface-secondary", light: "#fafafa", dark: "rgba(255, 255, 255, 0.02)", role: "surface" },
  { name: "--surface-tertiary", light: "#f9fafb", dark: "rgba(255, 255, 255, 0.06)", role: "surface" },
  { name: "--surface-quaternary", light: "#f3f4f6", dark: "rgba(255, 255, 255, 0.05)", role: "surface" },
  { name: "--text-primary", light: "#374151", dark: "#e5e7eb", role: "text", note: "Tailwind gray-700" },
  { name: "--text-secondary", light: "#6b7280", dark: "#9ca3af", role: "text", note: "Tailwind gray-500" },
  { name: "--text-tertiary", light: "#9ca3af", dark: "#6b7280", role: "text", note: "Tailwind gray-400" },
  { name: "--border-default", light: "#e5e7eb", dark: "rgba(255, 255, 255, 0.08)", role: "border" },
  { name: "--border-hover", light: "#d1d5db", dark: "rgba(255, 255, 255, 0.14)", role: "border" },
  { name: "--chart-axis", light: "#6b7280", dark: "#a1a1aa", role: "chart" },
  { name: "--chart-tooltip-bg", light: "#ffffff", dark: "#27272a", role: "chart" },
];

export const APP_FAMILY: ColorFamily = {
  id: "app",
  name: "app 品牌與介面 token（globals.css）",
  source: "apps/app/src/app/globals.css",
  description: "聊天外殼、對話框與未掛載元件使用；混用外觀命名（lilac／mint）與角色命名（surface／text），深色以 :root.dark 換值。",
  usage: ["chat.css 外殼", "provider-keys.css", "demo-gallery、template-library、qr-modal、desktop-tip-modal", "CopilotKit 主題覆寫"],
  swatches: APP_TOKENS,
};

export function chartFamily(): ColorFamily {
  return {
    id: "chart",
    name: "CHART_COLORS（Recharts 與匯出）",
    source: "apps/app/src/components/generative-ui/charts/config.ts（另在 template-card.tsx、export-utils.ts 各複製一份）",
    description: "七個 Tailwind 500 系飽和色，依 index % 7 循環指派；沒有 token 化，淺深模式同一組。",
    usage: ["BarChart / PieChart", "TemplateCard 迷你圖", "chartToStandaloneHtml 匯出"],
    swatches: CHART_COLORS.map((hex, index) => ({ name: `CHART_COLORS[${index}]`, light: hex, role: "chart" as const })),
  };
}

export const ADHOC_FAMILY: ColorFamily = {
  id: "adhoc",
  name: "散落的硬編碼色",
  source: "多個元件與樣式檔",
  description: "沒有走任何一套 token 的顏色；每一個都是深色模式與換品牌時的漏網之魚。",
  usage: [],
  swatches: [
    { name: "focus ring / OG 強調", light: "#189370", role: "adhoc", note: "chat.css、provider-keys.css、opengraph-image.tsx" },
    { name: ".chat-error 邊框", light: "#ffac4d", role: "adhoc", note: "chat.css（背景為 #ffac4d20）" },
    { name: "QrModal scanned", light: "#e6a817", role: "adhoc", note: "qr-modal/index.tsx" },
    { name: "QrModal picked", light: "#1b936f", role: "adhoc", note: "qr-modal/index.tsx（與 --color-mint-dark 同值但未引用 token）" },
    { name: "indigo fallback", light: "#6366f1", role: "adhoc", note: "template-card.tsx、category-filter.tsx 的 var() fallback" },
    { name: "emerald fallback", light: "#10b981", role: "adhoc", note: "template-card.tsx、category-filter.tsx 的 var() fallback" },
    { name: "TemplateChip 漸層", light: "rgba(99,102,241,0.12)", role: "adhoc", note: "template-chip.tsx" },
    { name: "seed dashboard 長條漸層", light: "rgba(99,102,241,0.7)", role: "adhoc", note: "seed-templates.ts（違反「不硬編」規則）" },
    { name: "DemoCard 3D / Animation", light: "rgba(139,92,246,1)", role: "adhoc", note: "demo-card.tsx CATEGORY_COLORS（鍵值對不上分類）" },
    { name: "DemoCard Data Visualization", light: "rgba(59,130,246,1)", role: "adhoc", note: "demo-card.tsx" },
    { name: "pick 頁背景漸層", light: "#0f0f1a", role: "adhoc", note: "pick/page.tsx（#0f0f1a → #1a1a2e → #16213e）" },
    { name: "pick 頁錯誤字", light: "#ff6b6b", role: "adhoc", note: "pick/page.tsx" },
    { name: "OG 背景", light: "#FAFAFC", role: "adhoc", note: "opengraph-image.tsx" },
    { name: "MeetingTimePicker hover 邊框", light: "#3b82f6", role: "adhoc", note: "Tailwind blue-500 class" },
    { name: "PlanCard / ToolReasoning 完成勾", light: "#22c55e", role: "adhoc", note: "Tailwind green-500 class" },
  ],
};

export function allFamilies(): ColorFamily[] {
  return [designSystemFamily(), svgRampFamily(), APP_FAMILY, chartFamily(), ADHOC_FAMILY];
}

/** 非測試檔裡的 hex / rgb() 字面數量（以 /#[0-9a-fA-F]{3,8}\b|rgba?\(/ 逐一計數；測試會重新計算） */
export const HARDCODED_COUNTS: { file: string; count: number; note?: string }[] = [
  { file: "apps/app/src/app/globals.css", count: 121, note: "token 定義本身" },
  { file: "apps/app/src/lib/a2ui-theme.css", count: 112, note: "未被引用" },
  { file: "apps/app/src/components/template-library/template-card.tsx", count: 20 },
  { file: "apps/app/src/components/qr-modal/index.tsx", count: 18 },
  { file: "apps/app/src/components/demo-gallery/demo-card.tsx", count: 16 },
  { file: "apps/app/src/components/generative-ui/export-utils.ts", count: 14 },
  { file: "apps/app/src/app/pick/page.tsx", count: 13 },
  { file: "apps/app/src/components/template-library/index.tsx", count: 13 },
  { file: "apps/app/src/components/desktop-tip-modal.tsx", count: 13 },
  { file: "apps/app/src/components/generative-ui/export-overlay.tsx", count: 10 },
  { file: "apps/app/src/components/demo-gallery/index.tsx", count: 9 },
  { file: "apps/app/src/app/opengraph-image.tsx", count: 7 },
  { file: "apps/app/src/components/generative-ui/charts/config.ts", count: 7, note: "CHART_COLORS" },
  { file: "apps/app/src/app/chat.css", count: 6 },
  { file: "apps/app/src/components/demo-gallery/category-filter.tsx", count: 6 },
  { file: "apps/app/src/components/generative-ui/open-generative-ui/renderer.tsx", count: 5, note: "var() 的 fallback" },
  { file: "apps/app/src/components/template-library/template-chip.tsx", count: 4 },
  { file: "apps/app/src/components/chat/provider-keys.css", count: 3 },
  { file: "apps/app/src/components/template-library/seed-templates.ts", count: 2 },
];

export const HARDCODED_TOTAL = HARDCODED_COUNTS.reduce((sum, entry) => sum + entry.count, 0);

/** dataviz 技能的 validate_palette.js 在本次解析時的結果（靜態紀錄） */
export const VALIDATOR_RESULTS = [
  {
    palette: "CHART_COLORS（淺色 surface）",
    rows: [
      ["Lightness band", "PASS", "7 色都在 L 0.43–0.77"],
      ["Chroma floor", "PASS", "都 ≥ 0.1"],
      ["CVD separation", "FAIL", "#8b5cf6 ↔ #3b82f6 deutan ΔE 1.3、tritan 3.4"],
      ["Normal-vision floor", "FAIL", "同一對 ΔE 12.0，低於 15"],
      ["Contrast vs surface", "WARN", "amber 2.09、emerald 2.47、cyan 2.36、orange 2.73 皆 < 3:1"],
    ],
  },
  {
    palette: "CHART_COLORS（深色 surface）",
    rows: [
      ["Lightness band", "FAIL", "amber 0.77、emerald 0.70、cyan 0.72、orange 0.71 超出"],
      ["CVD separation", "FAIL", "同上，藍／紫相鄰對"],
      ["Contrast vs surface", "PASS", "都 ≥ 3:1"],
    ],
  },
  {
    palette: "SVG 九色階 stroke（淺色）",
    rows: [
      ["Chroma floor", "FAIL", "teal 0.091、gray 0.006 讀起來像灰"],
      ["CVD separation", "FAIL", "#854F0B ↔ #3B6D11（amber／green）deutan ΔE 1.1"],
      ["Normal-vision floor", "FAIL", "#993556 ↔ #993C1D（pink／coral）ΔE 8.0"],
      ["Contrast vs surface", "PASS", "都 ≥ 3:1"],
    ],
  },
];

/** 語意色慣例色相範圍（度），允許 ±15° */
export const SEMANTIC_HUE_CONVENTION: Record<string, { hue: number; label: string }> = {
  info: { hue: 250, label: "藍" },
  danger: { hue: 25, label: "紅" },
  success: { hue: 140, label: "綠" },
  warning: { hue: 70, label: "橙／琥珀" },
};
