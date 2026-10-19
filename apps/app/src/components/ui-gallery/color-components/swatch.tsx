"use client";

import { formatOklch, parseColor, rgbToOklch } from "../color/color-math";

interface SwatchProps {
  name: string;
  light: string;
  dark?: string;
  note?: string;
}

/** 色票：顏色、hex／rgba 原值與 OKLCH 座標；有深色值時左右對照 */
export function Swatch({ name, light, dark, note }: SwatchProps) {
  const rgb = parseColor(light);
  const oklch = rgb ? formatOklch(rgbToOklch(rgb)) : "無法解析";
  const darkRgb = dark ? parseColor(dark) : null;
  return (
    <div className="gal-swatch" title={note}>
      <div className={`gal-swatch-chip${dark ? " gal-swatch-chip--split" : ""}`} style={{ background: light }}>
        {dark && (
          <>
            <span style={{ background: light }} />
            <span style={{ background: dark }} />
          </>
        )}
      </div>
      <span className="gal-swatch-name">{name}</span>
      <span className="gal-swatch-value">{light}{dark ? ` / ${dark}` : ""}</span>
      <span className="gal-swatch-value">{oklch}{darkRgb ? ` ｜ 深 ${formatOklch(rgbToOklch(darkRgb))}` : ""}</span>
      {note && <span className="gal-swatch-value">{note}</span>}
    </div>
  );
}
