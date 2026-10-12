import { FINDINGS } from "@/components/ui-gallery/analysis-content";
import { esc, pathSpan, section } from "../html";

const SEVERITY_LABEL = { high: "高", medium: "中", low: "低" } as const;

export function renderFindingsSection(): string {
  const intro = `<p>以下是讀碼時發現的不一致，依影響程度排序。色彩相關的建議在「色彩學與配色」區塊的最後一段；舊版渲染器（已移除）相關的殘留註解不在此列。</p>`;
  const cards = FINDINGS.map(
    (f) => `<article class="gal-finding"><span class="gal-badge gal-severity-${f.severity}">${SEVERITY_LABEL[f.severity]}</span><h3>${esc(f.title)}</h3><p>${esc(f.detail)}</p><ul>${f.paths
      .map((p) => `<li>${pathSpan(p)}</li>`)
      .join("")}</ul></article>`,
  ).join("\n");
  return section("findings", intro, `<div class="gal-stack">${cards}</div>`);
}
