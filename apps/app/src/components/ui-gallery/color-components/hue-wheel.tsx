"use client";

import { useMemo, useState } from "react";
import { parseColor, rgbToOklch } from "../color/color-math";
import type { ColorFamily } from "../color/color-inventory";

const SIZE = 520;
const CENTER = SIZE / 2;
const MAX_CHROMA = 0.2;
const RADIUS = 220;

const FAMILY_STROKE: Record<string, string> = {
  "design-system": "#1a1a1a",
  "svg-ramps": "#534AB7",
  app: "#1B936F",
  chart: "#A32D2D",
  adhoc: "#854F0B",
};

interface HueWheelProps {
  families: ColorFamily[];
  mode: "light" | "dark";
}

/** OKLCH 極座標：角度 = hue、半徑 = chroma、點本身是該色；外框顏色代表家族 */
export function HueWheel({ families, mode }: HueWheelProps) {
  const [enabled, setEnabled] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(families.map((family) => [family.id, true])),
  );

  const points = useMemo(() => {
    return families.flatMap((family) =>
      family.swatches.flatMap((swatch) => {
        const value = mode === "dark" && swatch.dark ? swatch.dark : swatch.light;
        const rgb = parseColor(value);
        if (!rgb) return [];
        const oklch = rgbToOklch(rgb);
        if (oklch.c < 0.004) return [];
        const r = Math.min(1, oklch.c / MAX_CHROMA) * RADIUS;
        const angle = (oklch.h * Math.PI) / 180;
        return [
          {
            key: `${family.id}-${swatch.name}`,
            family: family.id,
            name: swatch.name,
            value,
            x: CENTER + r * Math.cos(angle),
            y: CENTER - r * Math.sin(angle),
            size: 5 + oklch.l * 6,
            label: `${swatch.name} ${value} · L ${oklch.l.toFixed(2)} C ${oklch.c.toFixed(3)} H ${Math.round(oklch.h)}°`,
          },
        ];
      }),
    );
  }, [families, mode]);

  return (
    <div className="gal-stack">
      <div className="gal-legend">
        {families.map((family) => (
          <label key={family.id}>
            <input
              type="checkbox"
              checked={enabled[family.id] ?? true}
              onChange={(event) => setEnabled((previous) => ({ ...previous, [family.id]: event.target.checked }))}
            />
            <span className="gal-legend-dot" style={{ color: FAMILY_STROKE[family.id] ?? "currentColor" }} />
            {family.name}
          </label>
        ))}
      </div>
      <svg className="gal-hue-wheel" viewBox={`0 0 ${SIZE} ${SIZE}`} role="img" aria-label="所有專案色彩在 OKLCH 色相環上的分佈">
        {[0.05, 0.1, 0.15, 0.2].map((c) => (
          <circle key={c} cx={CENTER} cy={CENTER} r={(c / MAX_CHROMA) * RADIUS} fill="none" stroke="var(--border-hover)" strokeDasharray={c === 0.2 ? undefined : "3 4"} />
        ))}
        {[0, 90, 180, 270].map((deg) => {
          const angle = (deg * Math.PI) / 180;
          return (
            <line
              key={deg}
              x1={CENTER}
              y1={CENTER}
              x2={CENTER + RADIUS * Math.cos(angle)}
              y2={CENTER - RADIUS * Math.sin(angle)}
              stroke="var(--border-subtle)"
            />
          );
        })}
        {[
          { deg: 0, label: "0° 紅粉" },
          { deg: 60, label: "60° 橙黃" },
          { deg: 140, label: "140° 綠" },
          { deg: 200, label: "200° 青" },
          { deg: 260, label: "260° 藍" },
          { deg: 300, label: "300° 紫" },
        ].map((tick) => {
          const angle = (tick.deg * Math.PI) / 180;
          return (
            <text
              key={tick.deg}
              x={CENTER + (RADIUS + 22) * Math.cos(angle)}
              y={CENTER - (RADIUS + 22) * Math.sin(angle)}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={11}
              fill="var(--text-tertiary)"
            >
              {tick.label}
            </text>
          );
        })}
        <text x={CENTER + 4} y={CENTER - (0.1 / MAX_CHROMA) * RADIUS - 4} fontSize={10} fill="var(--text-tertiary)">C 0.10</text>
        <text x={CENTER + 4} y={CENTER - RADIUS - 4} fontSize={10} fill="var(--text-tertiary)">C 0.20</text>
        {points
          .filter((point) => enabled[point.family] ?? true)
          .map((point) => (
            <circle
              key={point.key}
              cx={point.x}
              cy={point.y}
              r={point.size}
              fill={point.value}
              stroke={FAMILY_STROKE[point.family] ?? "currentColor"}
              strokeWidth={1.5}
            >
              <title>{point.label}</title>
            </circle>
          ))}
      </svg>
      <p className="gal-lede">
        點越靠外 chroma 越高；點的大小隨明度放大。接近中心的點是中性色，看它們偏向哪個角度，就知道灰階帶的是哪一種色調。
      </p>
    </div>
  );
}
