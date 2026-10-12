/**
 * 複刻用的 CSS 工具（純字串處理，沒有 DOM）。
 * 頁面主題是三態（light／dark／system）：深色規則一律同時寫成
 *   :root[data-theme="dark"] X  與  @media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) X }
 * html.ts 的 extractCssRules 會把 @media 內的規則攤平成無條件規則（例如 chat.css 在 640px 以下隱藏品牌 logo），
 * 這裡改用保留 @media 包裝的抽取。
 */
import { readRepo } from "../html";

export const DARK_FORCED = ':root[data-theme="dark"]';
export const DARK_AUTO = ':root:not([data-theme="light"])';

export interface CssBlock {
  prelude: string;
  body: string;
}

export function stripComments(css: string): string {
  return css.replace(/\/\*[\s\S]*?\*\//g, "");
}

/** 把一段 CSS 切成頂層區塊：prelude 是選擇器或 at-rule 前置字，body 是大括號內原文（可能含巢狀區塊） */
export function splitBlocks(css: string): CssBlock[] {
  const blocks: CssBlock[] = [];
  let i = 0;
  while (i < css.length) {
    const open = css.indexOf("{", i);
    if (open < 0) break;
    let prelude = css.slice(i, open);
    const semi = prelude.lastIndexOf(";");
    if (semi >= 0) prelude = prelude.slice(semi + 1);
    prelude = prelude.trim();
    let depth = 1;
    let j = open + 1;
    while (j < css.length && depth > 0) {
      if (css[j] === "{") depth += 1;
      else if (css[j] === "}") depth -= 1;
      j += 1;
    }
    blocks.push({ prelude, body: css.slice(open + 1, j - 1) });
    i = j;
  }
  return blocks;
}

/** 深色覆寫：同一份宣告同時以「強制深色」與「跟隨系統」兩種選擇器輸出 */
export function darkRule(selector: string, body: string): string {
  return `${DARK_FORCED} ${selector} {${body}}\n@media (prefers-color-scheme: dark) { ${DARK_AUTO} ${selector} {${body}} }`;
}

/** 某個複刻容器的 token：淺色值直接寫在容器上，深色值走三態覆寫 */
export function themedVars(scope: string, light: string, dark: string): string {
  return `${scope} {${light}}\n${darkRule(scope, dark)}`;
}

/**
 * 從原始 CSS 抽出符合條件的規則：
 *  - @media 內的規則保留原本的 media 包裝
 *  - `:root.dark X` 改寫成頁面的三態深色選擇器
 *  - 指定名稱的 @keyframes 整段帶出
 */
export function extractThemedCss(css: string, matcher: (selector: string) => boolean, keyframes: string[] = []): string {
  const walk = (blocks: CssBlock[], sink: string[]) => {
    for (const block of blocks) {
      if (block.prelude.startsWith("@keyframes")) {
        const name = block.prelude.split(/\s+/)[1];
        if (name && keyframes.includes(name)) sink.push(`${block.prelude} {${block.body}}`);
        continue;
      }
      if (block.prelude.startsWith("@media")) {
        const inner: string[] = [];
        walk(splitBlocks(block.body), inner);
        if (inner.length) sink.push(`${block.prelude} {\n${inner.join("\n")}\n}`);
        continue;
      }
      if (block.prelude.startsWith("@")) continue;
      const kept: string[] = [];
      const dark: string[] = [];
      for (const raw of block.prelude.split(",")) {
        const selector = raw.trim();
        if (!selector) continue;
        const darkMatch = selector.match(/^:root\.dark\s+(.+)$/);
        if (darkMatch) {
          if (matcher(darkMatch[1])) dark.push(darkMatch[1]);
        } else if (matcher(selector)) {
          kept.push(selector);
        }
      }
      if (kept.length) sink.push(`${kept.join(", ")} {${block.body}}`);
      for (const selector of dark) sink.push(darkRule(selector, block.body));
    }
  };
  const out: string[] = [];
  walk(splitBlocks(stripComments(css)), out);
  return out.join("\n");
}

/** 把每條規則的選擇器都加上前綴（@media 內也處理；@keyframes 原樣保留） */
export function prefixSelectors(css: string, prefix: string): string {
  const walk = (blocks: CssBlock[]): string[] =>
    blocks
      .map((block) => {
        if (block.prelude.startsWith("@keyframes")) return `${block.prelude} {${block.body}}`;
        if (block.prelude.startsWith("@media")) return `${block.prelude} {\n${walk(splitBlocks(block.body)).join("\n")}\n}`;
        if (block.prelude.startsWith("@")) return "";
        const selectors = block.prelude
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
          .map((s) => `${prefix} ${s}`);
        return `${selectors.join(", ")} {${block.body}}`;
      })
      .filter(Boolean);
  return walk(splitBlocks(stripComments(css))).join("\n");
}

/** 沙箱設計系統的 THEME_CSS（packages/design-system），由原始檔文字抽出，不經套件匯入 */
export function designSystemThemeCss(): string {
  const source = readRepo("packages/design-system/src/index.ts");
  const match = source.match(/export const THEME_CSS = `([\s\S]*?)`;/);
  if (!match) throw new Error("THEME_CSS not found in packages/design-system/src/index.ts");
  return match[1];
}

/**
 * 把 THEME_CSS 的 :root 變數限制在某個容器，深色區塊改寫成頁面三態主題；
 * seed 範本等「沙箱內的標記」因此能直接在頁面裡渲染並跟著主題走。
 */
export function scopedDesignSystemCss(scope: string): string {
  const out: string[] = [];
  for (const block of splitBlocks(stripComments(designSystemThemeCss()))) {
    if (block.prelude === ":root") out.push(`${scope} {${block.body}}`);
    else if (block.prelude.startsWith("@media")) {
      for (const inner of splitBlocks(block.body)) if (inner.prelude === ":root") out.push(darkRule(scope, inner.body));
    }
  }
  return out.join("\n");
}

/** 把 seed 範本裡的 inline 事件屬性拿掉（它們呼叫沙箱的 Websandbox 橋，頁面裡不存在） */
export function stripInlineHandlers(html: string): string {
  return html.replace(/\son[a-z]+="[^"]*"/gi, "");
}
