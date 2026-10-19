import { FORM_STYLES_CSS, SVG_CLASSES_CSS, THEME_CSS } from "@repo/design-system";
import { forceDarkScheme, isColorValue, parseThemeTokens, tokenGroup, type TokenEntry, type TokenGroup } from "@/components/ui-gallery/design-tokens";
import { DESIGN_SYSTEM_MARKUP } from "@/components/ui-gallery/gallery-fixtures";
import { addAsset, esc, item, readRepo, section, seg } from "../html";

const GROUP_LABEL: Record<TokenGroup, string> = {
  background: "背景",
  text: "文字",
  border: "邊框",
  font: "字體",
  radius: "圓角",
  alias: "縮寫別名",
  other: "其他",
};

const APP_TOKEN_GROUPS = [
  { label: "品牌", names: ["--color-lilac", "--color-lilac-light", "--color-lilac-dark", "--color-mint", "--color-mint-light", "--color-mint-dark"] },
  { label: "表面", names: ["--background", "--surface-primary", "--surface-secondary", "--surface-tertiary", "--surface-quaternary", "--color-container"] },
  { label: "文字", names: ["--text-primary", "--text-secondary", "--text-tertiary", "--color-text-primary", "--color-text-secondary", "--color-text-tertiary"] },
  { label: "邊框與玻璃", names: ["--border-default", "--border-hover", "--color-border-glass", "--color-glass", "--color-glass-subtle"] },
];

function swatchGrid(entries: TokenEntry[], dark?: Map<string, string>): string {
  return `<div class="gal-swatch-grid">${entries
    .map((entry) => {
      const darkValue = dark?.get(entry.name);
      let chip: string;
      if (isColorValue(entry.value)) {
        chip = darkValue
          ? `<div class="gal-swatch-chip gal-swatch-chip--split" style="background:${esc(entry.value)}"><span style="background:${esc(entry.value)}"></span><span style="background:${esc(darkValue)}"></span></div>`
          : `<div class="gal-swatch-chip" style="background:${esc(entry.value)}"></div>`;
      } else if (entry.name.startsWith("--font")) {
        chip = `<div class="gal-swatch-chip" style="background:var(--surface-quaternary);padding:6px;font-size:11px;align-items:center"><span style="font-family:${esc(entry.value)}">Aa 字</span></div>`;
      } else {
        chip = `<div class="gal-swatch-chip" style="background:var(--surface-quaternary);padding:6px;align-items:center"><span style="width:28px;height:28px;border:1px solid var(--border-hover);border-radius:${esc(entry.value)};background:var(--surface-primary);display:inline-block"></span></div>`;
      }
      return `<div class="gal-swatch">${chip}<span class="gal-swatch-name">${esc(entry.name)}</span><span class="gal-swatch-value">${esc(entry.value)}${darkValue ? ` / ${esc(darkValue)}` : ""}</span></div>`;
    })
    .join("")}</div>`;
}

/** 與 design-system-frame.tsx 的 buildFrameDocument 同邏輯 */
function buildFrameDocument(markup: string, mode: "light" | "dark"): string {
  const theme = mode === "dark" ? forceDarkScheme(THEME_CSS) : THEME_CSS;
  const svg = mode === "dark" ? forceDarkScheme(SVG_CLASSES_CSS) : SVG_CLASSES_CSS;
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>design-system ${mode}</title>
<style>${theme}\n${svg}\n${FORM_STYLES_CSS}</style>
<style>html { background: var(--color-background-primary); } body { padding: 16px; margin: 0; } #content > * { animation: none; opacity: 1; }</style>
</head><body><div id="content">${markup}</div></body></html>`;
}

/** 從 globals.css 的 :root 與 :root.dark 區塊讀出 app 端 token 的字面值 */
function readAppTokens(): { light: Map<string, string>; dark: Map<string, string> } {
  const css = readRepo("apps/app/src/app/globals.css");
  const block = (selector: string): Map<string, string> => {
    const map = new Map<string, string>();
    const re = new RegExp(`${selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*\\{([^}]*)\\}`, "g");
    let m: RegExpExecArray | null;
    while ((m = re.exec(css))) {
      for (const line of m[1].split("\n")) {
        const d = /^\s*(--[a-z0-9-]+)\s*:\s*([^;]+);/i.exec(line);
        if (d && !map.has(d[1])) map.set(d[1], d[2].trim());
      }
    }
    return map;
  };
  return { light: block(":root"), dark: block(":root.dark") };
}

export function renderDesignSystemSection(): string {
  const tokens = parseThemeTokens(THEME_CSS);
  const darkMap = new Map(tokens.dark.map((e) => [e.name, e.value]));
  const groups = new Map<TokenGroup, TokenEntry[]>();
  tokens.light.forEach((entry) => {
    const g = tokenGroup(entry.name);
    groups.set(g, [...(groups.get(g) ?? []), entry]);
  });

  const lightPath = addAsset("assets/design-system/light.html", buildFrameDocument(DESIGN_SYSTEM_MARKUP, "light"));
  const darkPath = addAsset("assets/design-system/dark.html", buildFrameDocument(DESIGN_SYSTEM_MARKUP, "dark"));
  const frame = (src: string, title: string) =>
    `<iframe class="gal-frame" title="${esc(title)}" sandbox="" src="${src}" loading="lazy" style="width:100%;height:620px;border:1px solid var(--border-default);border-radius:var(--radius-lg);background:#fff"></iframe>`;

  const app = readAppTokens();

  const intro = `<p>沙箱裡的生成式 UI 只能用 <code>packages/design-system/src/index.ts</code> 提供的 token：背景、文字、邊框各三階，加上 info／danger／success／warning 四組語意色，以及字體與圓角。渲染器會把 <code>THEME_CSS + SVG_CLASSES_CSS + FORM_STYLES_WITH_STAGGER_CSS</code> 注入每個 iframe，所以 button、input、select 不用自己寫樣式。</p>
<p>這裡的色票與數值都是從匯出的 CSS 字串在產生時解析出來的，深色欄來自 <code>@media (prefers-color-scheme: dark)</code> 區塊。</p>`;

  const tokenItems = `<div class="gal-grid">${(["background", "text", "border", "font", "radius", "alias"] as TokenGroup[])
    .map((group) =>
      item({
        name: `${GROUP_LABEL[group]} token`,
        exportName: "THEME_CSS",
        path: "packages/design-system/src/index.ts",
        state: "mounted",
        show: "computed",
        demo: "plain",
        propsSummary: group === "alias" ? "--p --s --t --bg2 --b 是 SVG 類別用的短名" : undefined,
        body: swatchGrid(groups.get(group) ?? [], darkMap),
      }),
    )
    .join("")}</div>`;

  const frameItem = item({
    id: "item-design-frame",
    name: "表單控制項與 SVG 類別（沙箱內實際樣式）",
    exportName: "FORM_STYLES_CSS · SVG_CLASSES_CSS",
    path: "packages/design-system/src/index.ts",
    state: "mounted",
    show: "live",
    demo: "plain",
    wide: true,
    note: `<p>正式沙箱的深色只跟隨作業系統偏好，這裡的「深色」是把 media 區塊展開後強制套用，用來預覽同一份 token 在兩種模式的樣子。兩個 iframe 都是這一頁附帶的檔案，沒有腳本，sandbox 不開放任何權限。</p>`,
    body: seg(
      [
        { key: "light", label: "淺色", panel: frame(lightPath, "設計系統控制項與 SVG 類別預覽（淺色）") },
        { key: "dark", label: "深色", panel: frame(darkPath, "設計系統控制項與 SVG 類別預覽（深色）") },
      ],
      { ariaLabel: "沙箱色彩模式" },
    ),
  });

  const appItem = item({
    name: "app 端第二套 token（globals.css）",
    exportName: ":root / :root.dark",
    path: "apps/app/src/app/globals.css",
    state: "mounted",
    show: "computed",
    demo: "plain",
    wide: true,
    note: `<p>聊天外殼、對話框與未掛載元件用的是這一套（品牌 lilac／mint、<code>--surface-*</code>、<code>--text-*</code>），與沙箱 token 是兩套並存的系統；連 <code>--color-text-primary</code> 都各自定義了一次，值不同。左半是淺色、右半是深色的字面值，直接從 globals.css 的兩個區塊讀出。</p>`,
    body: `<div class="gal-stack">${APP_TOKEN_GROUPS.map(
      (group) =>
        `<div><h4 class="gal-swatch-name" style="margin-bottom:6px">${esc(group.label)}</h4>${swatchGrid(
          group.names.map((name) => ({ name, value: app.light.get(name) ?? "(未定義)" })),
          app.dark,
        )}</div>`,
    ).join("")}</div>`,
  });

  return section("design-system", intro, [tokenItems, frameItem, appItem].join("\n"));
}
