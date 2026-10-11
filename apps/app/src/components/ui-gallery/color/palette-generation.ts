/**
 * 由單一品牌色衍生連續、發散與類別色盤。
 *
 * 全部在 OKLCH 中插值，再以 clampToSrgb 壓進 sRGB 色域並輸出 `#rrggbb`。
 * 純函式、零執行期依賴。
 */

import {
  clampToSrgb,
  normalizeHue,
  parseColor,
  rgbToOklch,
  toHex,
  type Oklch,
  type Rgb,
} from "./color-math";

const DEG = Math.PI / 180;

/** 解析輸入色；無法解析時退回中性灰，避免整個色盤生成中斷。 */
function parseOrGray(hex: string): Rgb {
  return parseColor(hex) ?? { r: 0.5, g: 0.5, b: 0.5 };
}

/** 兩個色相沿最短弧的中點；對向色相時取其一的垂直方向。 */
function meanHue(h1: number, h2: number): number {
  const x = Math.cos(h1 * DEG) + Math.cos(h2 * DEG);
  const y = Math.sin(h1 * DEG) + Math.sin(h2 * DEG);
  if (Math.hypot(x, y) < 1e-9) return normalizeHue(h1 + 90);
  return normalizeHue(Math.atan2(y, x) / DEG);
}

function oklchToHex(o: Oklch): string {
  return toHex(clampToSrgb(o));
}

/** 連續色盤的明度端點與彩度拋物線參數。 */
const SEQ_L_LIGHT = 0.95;
const SEQ_L_DARK = 0.35;
const SEQ_L_PEAK = 0.62;
const SEQ_L_HALF_WIDTH = 0.33;
const SEQ_C_FLOOR_RATIO = 0.15;

/**
 * 連續（sequential）色盤：保留品牌色相，明度由 0.95（淺端）線性降到 0.35（深端）。
 * 彩度依明度走拋物線，於中段明度 0.62 達到品牌彩度，兩端收斂但不低於品牌彩度的 15%，
 * 讓最淺與最深的階段仍帶一點色相訊息。結果順序為淺 → 深。
 */
export function sequential(baseHex: string, steps: number): string[] {
  const n = Math.max(1, Math.floor(steps));
  const base = rgbToOklch(parseOrGray(baseHex));
  const floor = base.c * SEQ_C_FLOOR_RATIO;
  const out: string[] = [];
  for (let i = 0; i < n; i++) {
    const t = n === 1 ? 0 : i / (n - 1);
    const l = SEQ_L_LIGHT + (SEQ_L_DARK - SEQ_L_LIGHT) * t;
    const parabola = 1 - ((l - SEQ_L_PEAK) / SEQ_L_HALF_WIDTH) ** 2;
    const c = Math.max(floor, base.c * parabola);
    out.push(oklchToHex({ l, c, h: base.h }));
  }
  return out;
}

/** 發散色盤的端點參數：中點為接近中性的淺灰，兩側往深、往彩走。 */
const DIV_L_MID = 0.95;
const DIV_L_END = 0.45;
const DIV_C_MID = 0.01;

/**
 * 發散（diverging）色盤：中點為 oklch(0.95, 0.01, 兩色相中點)，
 * 左右兩側各自從中點往端點對稱插值（明度 0.95 → 0.45、彩度 0.01 → 該側彩度）。
 * 回傳順序為 左深 … 中性 … 右深；建議使用奇數階數以保留真正的中點。
 */
export function diverging(leftHex: string, rightHex: string, steps: number): string[] {
  const n = Math.max(1, Math.floor(steps));
  const left = rgbToOklch(parseOrGray(leftHex));
  const right = rgbToOklch(parseOrGray(rightHex));
  const midHue = meanHue(left.h, right.h);
  const out: string[] = [];
  for (let i = 0; i < n; i++) {
    // t 在 [-1, 1]：負值為左側、正值為右側、0 為中點。
    const t = n === 1 ? 0 : (i / (n - 1)) * 2 - 1;
    const s = Math.abs(t);
    const side = t < 0 ? left : right;
    const h = s < 1e-9 ? midHue : side.h;
    const l = DIV_L_MID + (DIV_L_END - DIV_L_MID) * s;
    const c = DIV_C_MID + (side.c - DIV_C_MID) * s;
    out.push(oklchToHex({ l, c: Math.max(0, c), h }));
  }
  return out;
}

const CAT_L = 0.62;
const CAT_C_MAX = 0.14;

/**
 * 以品牌色相為起點等距旋轉色相的類別色盤：明度固定 0.62、彩度取 min(品牌彩度, 0.14)。
 * 僅供示範「色相等距」的做法；實務上類別色應另行驗證色覺異常與灰階可辨性。
 */
export function categoricalFromBrand(brandHex: string, count: number): string[] {
  const n = Math.max(1, Math.floor(count));
  const brand = rgbToOklch(parseOrGray(brandHex));
  const c = Math.min(brand.c, CAT_C_MAX);
  const out: string[] = [];
  for (let i = 0; i < n; i++) {
    const h = normalizeHue(brand.h + (360 * i) / n);
    out.push(oklchToHex({ l: CAT_L, c, h }));
  }
  return out;
}

/** Okabe–Ito 八色：廣泛用於色覺異常友善的類別配色。 */
export const OKABE_ITO: readonly string[] = [
  "#E69F00",
  "#56B4E9",
  "#009E73",
  "#F0E442",
  "#0072B2",
  "#D55E00",
  "#CC79A7",
  "#000000",
];
