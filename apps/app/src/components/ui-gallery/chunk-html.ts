/**
 * 把完整 html 依標籤邊界切成約 n 段，模擬代理逐段串流 html 欄位。
 * 每段都在某個 ">" 之後結束，所以預覽階段的 processPartialHtml 不會吃到半個標籤。
 */
export function chunkHtml(html: string, n: number): string[] {
  if (!html) return [];
  const target = Math.max(1, Math.ceil(html.length / Math.max(1, n)));
  const chunks: string[] = [];
  let start = 0;
  while (start < html.length) {
    let end = Math.min(html.length, start + target);
    if (end < html.length) {
      const boundary = html.indexOf(">", end);
      end = boundary === -1 ? html.length : boundary + 1;
    }
    chunks.push(html.slice(start, end));
    start = end;
  }
  return chunks;
}
