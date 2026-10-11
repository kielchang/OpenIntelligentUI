/**
 * 前景 × 背景的 WCAG 對比矩陣。
 *
 * 帶 alpha 的顏色會先疊在底色上再量測：背景先疊在 base 上，前景再疊在該背景上。
 * 純函式、零執行期依賴。
 */

import {
  composite,
  contrastRatio,
  parseColor,
  passesWcag,
  wcagThreshold,
  type ContrastUse,
  type Rgb,
} from "./color-math";

/** 具名顏色：名稱、色碼（hex 或 rgb/rgba）與可選的備註。 */
export interface NamedColor {
  name: string;
  hex: string;
  note?: string;
}

/** 矩陣中的一格：某前景在某背景上的對比結果。 */
export interface ContrastCell {
  fg: NamedColor;
  bg: NamedColor;
  ratio: number;
  threshold: number;
  pass: boolean;
  use: ContrastUse;
}

const WHITE: Rgb = { r: 1, g: 1, b: 1, a: 1 };

/** 把顏色疊在不透明底色上；alpha 為 1 時原樣回傳（仍補上 a: 1）。 */
function flatten(color: Rgb, under: Rgb): Rgb {
  return (color.a ?? 1) < 1 ? composite(color, under) : { ...color, a: 1 };
}

/**
 * 建立對比矩陣：列為前景、欄為背景。
 * 無法解析的顏色產生 ratio NaN、pass false，讓畫面可以標示「無效」而不是靜默略過。
 * `base` 為最底層的不透明底色（預設白色），用來攤平帶 alpha 的背景。
 */
export function buildContrastMatrix(
  fgs: NamedColor[],
  bgs: NamedColor[],
  use: ContrastUse,
  base = "#ffffff",
): ContrastCell[][] {
  const baseRgb = flatten(parseColor(base) ?? WHITE, WHITE);
  const threshold = wcagThreshold(use);

  const parsedBgs = bgs.map((bg) => {
    const rgb = parseColor(bg.hex);
    return rgb ? flatten(rgb, baseRgb) : null;
  });

  return fgs.map((fg) => {
    const fgRgb = parseColor(fg.hex);
    return bgs.map((bg, j) => {
      const bgRgb = parsedBgs[j];
      if (!fgRgb || !bgRgb) {
        return { fg, bg, ratio: Number.NaN, threshold, pass: false, use };
      }
      const ratio = contrastRatio(fgRgb, bgRgb);
      return { fg, bg, ratio, threshold, pass: passesWcag(ratio, use), use };
    });
  });
}
