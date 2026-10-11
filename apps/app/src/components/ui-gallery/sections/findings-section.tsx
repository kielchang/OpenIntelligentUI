import { GallerySection } from "../gallery-section";
import { FINDINGS } from "../analysis-content";

const SEVERITY_LABEL = { high: "高", medium: "中", low: "低" } as const;

export function FindingsSection() {
  return (
    <GallerySection
      id="findings"
      intro={
        <p>
          以下是讀碼時發現的不一致，依影響程度排序。色彩相關的建議在「色彩學與配色」區塊的最後一段；舊版渲染器（已移除）相關的殘留註解不在此列。
        </p>
      }
    >
      <div className="gal-stack">
        {FINDINGS.map((finding) => (
          <article key={finding.id} className="gal-finding">
            <span className={`gal-badge gal-severity-${finding.severity}`}>{SEVERITY_LABEL[finding.severity]}</span>
            <h3>{finding.title}</h3>
            <p>{finding.detail}</p>
            <ul>
              {finding.paths.map((path) => (
                <li key={path}>
                  <span className="gal-path">{path}</span>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </GallerySection>
  );
}
