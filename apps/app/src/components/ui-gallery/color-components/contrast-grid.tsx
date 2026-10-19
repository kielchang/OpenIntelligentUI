"use client";

import { formatRatio, wcagThreshold, type ContrastUse } from "../color/color-math";
import { buildContrastMatrix, type NamedColor } from "../color/contrast-matrix";

const USE_LABEL: Record<ContrastUse, string> = {
  normal: "正文 4.5:1（1.4.3）",
  large: "大字 3:1（1.4.3）",
  ui: "非文字 3:1（1.4.11）",
};

interface ContrastGridProps {
  title: string;
  fgs: NamedColor[];
  bgs: NamedColor[];
  use: ContrastUse;
  /** 半透明色先合成到這個底色 */
  base?: string;
  sampleText?: string;
}

/** 前景 × 背景的 WCAG 2.2 對比矩陣；比值截斷到兩位小數，判定用原始值 */
export function ContrastGrid({ title, fgs, bgs, use, base, sampleText = "Aa 字" }: ContrastGridProps) {
  const matrix = buildContrastMatrix(fgs, bgs, use, base);
  return (
    <div className="gal-stack">
      <div className="gal-family-head">
        <h4>{title}</h4>
        <span className="gal-meta">門檻：{USE_LABEL[use]}；嚴格 ≥ {wcagThreshold(use)}，不四捨五入</span>
      </div>
      <div className="gal-table-wrap">
        <table className="gal-contrast">
          <thead>
            <tr>
              <th>前景 ＼ 背景</th>
              {bgs.map((bg) => (
                <th key={bg.name} style={{ textAlign: "center" }}>
                  <span className="gal-path">{bg.name}</span>
                  <br />
                  <span style={{ fontWeight: 400 }}>{bg.hex}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {matrix.map((row, rowIndex) => (
              <tr key={fgs[rowIndex].name}>
                <th>
                  <span className="gal-path">{fgs[rowIndex].name}</span>
                  <br />
                  <span style={{ fontWeight: 400 }}>{fgs[rowIndex].hex}</span>
                </th>
                {row.map((cell) => (
                  <td key={cell.bg.name} data-pass={cell.pass}>
                    <span className="gal-contrast-cell">
                      <span className="gal-contrast-sample" style={{ background: cell.bg.hex, color: cell.fg.hex, border: "1px solid var(--border-subtle)" }}>
                        {sampleText}
                      </span>
                      <span>{formatRatio(cell.ratio)}</span>
                      <span>{cell.pass ? "PASS" : "FAIL"}</span>
                    </span>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
