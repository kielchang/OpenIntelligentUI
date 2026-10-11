"use client";

import { formatOklch, parseColor, rgbToOklch } from "../color/color-math";

interface CategoricalBarsProps {
  title: string;
  hexes: string[];
  labels: string[];
  values: number[];
  /** 只保留這一個索引的飽和色，其餘轉灰（highlight + mute） */
  highlightIndex?: number;
}

const MUTED = "var(--border-hover)";

/** 橫向分類長條：細標記、4px 圓角、2px 表面間距、標籤用文字 token、固定順序 */
export function CategoricalBars({ title, hexes, labels, values, highlightIndex }: CategoricalBarsProps) {
  const max = Math.max(...values, 1);
  const rowHeight = 22;
  const height = labels.length * rowHeight + 8;
  return (
    <figure style={{ margin: 0 }}>
      <figcaption className="gal-swatch-name" style={{ fontSize: 13, marginBottom: 6 }}>{title}</figcaption>
      <svg className="gal-mini-chart" viewBox={`0 0 320 ${height}`} role="img" aria-label={title}>
        {labels.map((label, index) => {
          const y = index * rowHeight + 4;
          const width = (values[index] / max) * 200;
          const muted = highlightIndex !== undefined && highlightIndex !== index;
          return (
            <g key={label}>
              <text x={0} y={y + 10} fontSize={11} fill="var(--text-secondary)" dominantBaseline="central">
                {label}
              </text>
              <rect x={96} y={y + 2} width={Math.max(4, width)} height={rowHeight - 6} rx={4} fill={muted ? MUTED : hexes[index % hexes.length]} />
              <text x={96 + Math.max(4, width) + 6} y={y + 10} fontSize={11} fill="var(--text-tertiary)" dominantBaseline="central">
                {values[index]}
              </text>
            </g>
          );
        })}
      </svg>
    </figure>
  );
}

interface RampStripProps {
  title: string;
  hexes: string[];
  startLabel: string;
  endLabel: string;
  midLabel?: string;
}

/** sequential / diverging 色階條，每階附 OKLCH */
export function RampStrip({ title, hexes, startLabel, endLabel, midLabel }: RampStripProps) {
  return (
    <figure style={{ margin: 0 }} className="gal-stack">
      <figcaption className="gal-swatch-name" style={{ fontSize: 13 }}>{title}</figcaption>
      <div className="gal-strip-row" style={{ height: 40 }}>
        {hexes.map((hex, index) => {
          const rgb = parseColor(hex);
          return <span key={`${hex}-${index}`} style={{ background: hex, height: 40 }} title={`${hex} · ${rgb ? formatOklch(rgbToOklch(rgb)) : ""}`} />;
        })}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--text-tertiary)" }}>
        <span>{startLabel}</span>
        {midLabel && <span>{midLabel}</span>}
        <span>{endLabel}</span>
      </div>
      <div className="gal-swatch-value" style={{ display: "flex", flexWrap: "wrap", gap: "4px 10px" }}>
        {hexes.map((hex, index) => (
          <span key={`${hex}-${index}-label`}>{hex}</span>
        ))}
      </div>
    </figure>
  );
}

interface HeatRowProps {
  title: string;
  hexes: string[];
  values: number[];
  labels: string[];
}

/** 用 sequential 色階畫一列熱力格，示範「連續數值用單色相淺→深」 */
export function HeatRow({ title, hexes, values, labels }: HeatRowProps) {
  const max = Math.max(...values, 1);
  return (
    <figure style={{ margin: 0 }}>
      <figcaption className="gal-swatch-name" style={{ fontSize: 13, marginBottom: 6 }}>{title}</figcaption>
      <div className="gal-strip-row">
        {values.map((value, index) => {
          const step = Math.min(hexes.length - 1, Math.round((value / max) * (hexes.length - 1)));
          const rgb = parseColor(hexes[step]);
          const light = rgb ? rgbToOklch(rgb).l > 0.6 : true;
          return (
            <span
              key={labels[index]}
              style={{ background: hexes[step], height: 44, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontSize: 10, color: light ? "#1a1a1a" : "#ffffff" }}
              title={`${labels[index]}: ${value}`}
            >
              <span>{labels[index]}</span>
              <span style={{ fontWeight: 600 }}>{value}</span>
            </span>
          );
        })}
      </div>
    </figure>
  );
}
