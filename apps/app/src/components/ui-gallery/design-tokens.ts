/**
 * 從 design-system 匯出的 CSS 字串解析 token，並產生「強制深色」版本。
 * 全部是字串運算：token 的定義只存在 packages/design-system/src/index.ts。
 */

export interface TokenEntry {
  name: string;
  value: string;
}

export interface ThemeTokens {
  light: TokenEntry[];
  dark: TokenEntry[];
}

export type TokenGroup = "background" | "text" | "border" | "font" | "radius" | "alias" | "other";

const DARK_MEDIA = "@media (prefers-color-scheme: dark)";

/** 找到 `@media (prefers-color-scheme: dark) { … }` 區塊，回傳每個區塊的內容（去掉最外層大括號） */
export function extractDarkBlocks(css: string): string[] {
  const blocks: string[] = [];
  let from = 0;
  while (true) {
    const start = css.indexOf(DARK_MEDIA, from);
    if (start === -1) break;
    const open = css.indexOf("{", start);
    if (open === -1) break;
    let depth = 0;
    let end = -1;
    for (let i = open; i < css.length; i += 1) {
      if (css[i] === "{") depth += 1;
      else if (css[i] === "}") {
        depth -= 1;
        if (depth === 0) {
          end = i;
          break;
        }
      }
    }
    if (end === -1) break;
    blocks.push(css.slice(open + 1, end));
    from = end + 1;
  }
  return blocks;
}

function parseDeclarations(block: string): TokenEntry[] {
  const entries: TokenEntry[] = [];
  const pattern = /--([a-z0-9-]+)\s*:\s*([^;]+);/gi;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(block)) !== null) {
    entries.push({ name: `--${match[1]}`, value: match[2].trim() });
  }
  return entries;
}

/** 解析 THEME_CSS：淺色 = 深色 media 區塊之前的宣告；深色 = 區塊內的宣告 */
export function parseThemeTokens(css: string): ThemeTokens {
  const darkStart = css.indexOf(DARK_MEDIA);
  const lightPart = darkStart === -1 ? css : css.slice(0, darkStart);
  const darkPart = extractDarkBlocks(css).join("\n");
  return { light: parseDeclarations(lightPart), dark: parseDeclarations(darkPart) };
}

/** 把深色 media 區塊的內容再附加一次成為無條件規則，讓 iframe 不靠作業系統偏好也能呈現深色 */
export function forceDarkScheme(css: string): string {
  const blocks = extractDarkBlocks(css);
  if (blocks.length === 0) return css;
  return `${css}\n/* gallery: forced dark */\n${blocks.join("\n")}`;
}

export function tokenGroup(name: string): TokenGroup {
  if (name.startsWith("--color-background")) return "background";
  if (name.startsWith("--color-text")) return "text";
  if (name.startsWith("--color-border")) return "border";
  if (name.startsWith("--font")) return "font";
  if (name.startsWith("--border-radius")) return "radius";
  if (/^--(p|s|t|bg2|b)$/.test(name)) return "alias";
  return "other";
}

export function isColorValue(value: string): boolean {
  return /^(#[0-9a-f]{3,8}|rgba?\(|hsla?\(|oklch\()/i.test(value.trim());
}
