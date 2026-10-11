/**
 * seed 範本是「<style>…</style> + 標記」的舊格式；渲染器契約要求樣式走 css 欄位、
 * html 不含 <style>。這個函式把開頭的 style 區塊抽出來。
 */
export function splitLeadingStyle(html: string): { css: string; html: string } {
  const match = html.match(/^\s*<style\b[^>]*>([\s\S]*?)<\/style>\s*/i);
  if (!match) return { css: "", html };
  return { css: match[1].trim(), html: html.slice(match[0].length) };
}
