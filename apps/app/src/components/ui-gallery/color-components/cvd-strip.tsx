"use client";

import { useMemo } from "react";
import { parseColor, simulateCvd, toGrayscale, toHex, type CvdType } from "../color/color-math";
import { evaluateCategorical } from "../color/cvd-palette";

const ROWS: { key: CvdType | "normal" | "gray"; label: string }[] = [
  { key: "normal", label: "原色" },
  { key: "protan", label: "紅盲 protan" },
  { key: "deutan", label: "綠盲 deutan" },
  { key: "tritan", label: "藍黃 tritan" },
  { key: "gray", label: "灰階" },
];

function transform(hex: string, key: CvdType | "normal" | "gray"): string {
  const rgb = parseColor(hex);
  if (!rgb) return hex;
  if (key === "normal") return hex;
  if (key === "gray") return toHex(toGrayscale(rgb));
  return toHex(simulateCvd(rgb, key));
}

interface CvdStripProps {
  label: string;
  hexes: string[];
  names?: string[];
}

/** 一組分類色在三種色盲模擬與灰階下的樣子，附最小距離報告 */
export function CvdStrip({ label, hexes, names }: CvdStripProps) {
  const report = useMemo(() => evaluateCategorical(hexes), [hexes]);
  const name = (index: number) => names?.[index] ?? hexes[index];
  return (
    <div className="gal-stack">
      <h4 className="gal-swatch-name" style={{ fontSize: 13 }}>{label}</h4>
      <div className="gal-strip">
        {ROWS.map((row) => (
          <div key={row.key} style={{ display: "contents" }}>
            <span>{row.label}</span>
            <div className="gal-strip-row">
              {hexes.map((hex, index) => (
                <span key={`${row.key}-${index}`} style={{ background: transform(hex, row.key) }} title={`${name(index)} → ${transform(hex, row.key)}`} />
              ))}
            </div>
          </div>
        ))}
      </div>
      <ul className="gal-lede" style={{ margin: 0, paddingLeft: 18 }}>
        <li>
          正常視覺最小 ΔE<sub>ok</sub>×100：{(report.minDeltaE.value * 100).toFixed(1)}（{name(report.minDeltaE.i)} ↔ {name(report.minDeltaE.j)}）；dataviz 門檻 15
        </li>
        <li>
          色盲模擬後最小距離：protan {(report.cvd.protan.value * 100).toFixed(1)} · deutan {(report.cvd.deutan.value * 100).toFixed(1)}（{name(report.cvd.deutan.i)} ↔ {name(report.cvd.deutan.j)}） · tritan {(report.cvd.tritan.value * 100).toFixed(1)}；目標 ≥ 8，6–8 只能搭配直接標籤或紋理
        </li>
        <li>
          灰階單調：{report.grayscaleMonotonic ? "是" : "否"}；最小亮度差 |ΔY| {report.minLuminanceGap.value.toFixed(3)}（{name(report.minLuminanceGap.i)} ↔ {name(report.minLuminanceGap.j)}）；相鄰色相最小間距 {Number.isFinite(report.minAdjacentHueGap) ? `${report.minAdjacentHueGap.toFixed(0)}°` : "—"}
        </li>
      </ul>
    </div>
  );
}
