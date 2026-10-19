/**
 * 類別色盤的可辨性評估：原色距離、色覺異常模擬後距離、亮度差、灰階單調性與相鄰色相差。
 * 另提供兩色配對的風險分類（紅／綠、綠／棕、藍／紫等常見混淆）。
 *
 * 純函式、零執行期依賴。評估結果只是提示，不代表無障礙驗收結論。
 */

import {
  deltaEOk,
  hueDistance,
  parseColor,
  relativeLuminance,
  rgbToOklch,
  simulateCvd,
  type CvdType,
  type Rgb,
} from "./color-math";

/** 一對顏色（以索引指向輸入陣列）與其距離值。 */
export interface PairDistance {
  i: number;
  j: number;
  value: number;
}

export interface CategoricalReport {
  /** 實際納入評估的色碼（無法解析者已略過）。 */
  hexes: string[];
  hues: number[];
  lightness: number[];
  /** 原色之間最小的 OKLab 距離。 */
  minDeltaE: PairDistance;
  /** 各型色覺異常模擬後，最小的 OKLab 距離。 */
  cvd: Record<CvdType, PairDistance>;
  /** 最小的相對亮度差 |ΔY|。 */
  minLuminanceGap: PairDistance;
  /** 依輸入順序，相對亮度是否嚴格遞增或嚴格遞減（灰階印出仍能讀出順序）。 */
  grayscaleMonotonic: boolean;
  /** 相鄰兩色之間最小的色相角距離。 */
  minAdjacentHueGap: number;
}

export type PairRisk = "safe" | "risky" | "neutral";

const CVD_TYPES: readonly CvdType[] = ["protan", "deutan", "tritan"];

/** 沒有任何配對時的佔位值：距離視為無限大（沒有任何一對是接近的）。 */
const NO_PAIR: PairDistance = { i: -1, j: -1, value: Number.POSITIVE_INFINITY };

/** 在所有 i < j 的配對中找出 distance 最小者。 */
function minPair(count: number, distance: (i: number, j: number) => number): PairDistance {
  let best: PairDistance = NO_PAIR;
  for (let i = 0; i < count; i++) {
    for (let j = i + 1; j < count; j++) {
      const value = distance(i, j);
      if (value < best.value) best = { i, j, value };
    }
  }
  return best;
}

/** 評估一組類別色的可辨性。 */
export function evaluateCategorical(hexes: string[]): CategoricalReport {
  const kept: string[] = [];
  const rgbs: Rgb[] = [];
  for (const hex of hexes) {
    const rgb = parseColor(hex);
    if (rgb) {
      kept.push(hex);
      rgbs.push(rgb);
    }
  }
  const n = rgbs.length;
  const oklch = rgbs.map((rgb) => rgbToOklch(rgb));
  const luminance = rgbs.map((rgb) => relativeLuminance(rgb));

  const cvd = {} as Record<CvdType, PairDistance>;
  for (const type of CVD_TYPES) {
    const simulated = rgbs.map((rgb) => simulateCvd(rgb, type));
    cvd[type] = minPair(n, (i, j) => deltaEOk(simulated[i], simulated[j]));
  }

  let increasing = true;
  let decreasing = true;
  for (let i = 1; i < n; i++) {
    if (!(luminance[i] > luminance[i - 1])) increasing = false;
    if (!(luminance[i] < luminance[i - 1])) decreasing = false;
  }

  let minAdjacentHueGap = Number.POSITIVE_INFINITY;
  for (let i = 1; i < n; i++) {
    minAdjacentHueGap = Math.min(minAdjacentHueGap, hueDistance(oklch[i - 1].h, oklch[i].h));
  }

  return {
    hexes: kept,
    hues: oklch.map((o) => o.h),
    lightness: oklch.map((o) => o.l),
    minDeltaE: minPair(n, (i, j) => deltaEOk(rgbs[i], rgbs[j])),
    cvd,
    minLuminanceGap: minPair(n, (i, j) => Math.abs(luminance[i] - luminance[j])),
    grayscaleMonotonic: increasing || decreasing,
    minAdjacentHueGap,
  };
}

/* ------------------------------------------------------------------ */
/* 配對風險分類                                                        */
/* ------------------------------------------------------------------ */

/** 色相帶（OKLCH 角度）。 */
interface HueBand {
  from: number;
  to: number;
}

const RED_BAND: HueBand = { from: 20, to: 60 };
const GREEN_BAND: HueBand = { from: 120, to: 160 };
const BLUE_BAND: HueBand = { from: 240, to: 270 };
const PURPLE_BAND: HueBand = { from: 280, to: 320 };
const SAFE_BLUE_BAND: HueBand = { from: 230, to: 270 };
const ORANGE_BAND: HueBand = { from: 40, to: 80 };
/** 棕色視為低明度的橙色相。 */
const BROWN_BAND: HueBand = { from: 30, to: 90 };
const BROWN_L_MAX = 0.65;

/** 彩度低於此值時色相沒有意義，不套用色相帶規則。 */
const ACHROMATIC_C = 0.02;
/** 亮度差低於此值時，色相混淆會造成真正的辨識問題。 */
const SIMILAR_Y = 0.15;
/** 亮度差達到此值時，即使色相被混淆仍可靠明暗區分。 */
const SAFE_Y = 0.3;
/** 模擬後 OKLab 距離低於此值，視為在該型色覺異常下幾乎無法區分。 */
const SIM_CLOSE_DE = 0.06;

function inBand(h: number, band: HueBand): boolean {
  return h >= band.from && h <= band.to;
}

/** 兩色是否分別落在兩個色相帶（不分順序）。 */
function crossBands(hA: number, hB: number, x: HueBand, y: HueBand): boolean {
  return (inBand(hA, x) && inBand(hB, y)) || (inBand(hA, y) && inBand(hB, x));
}

const CVD_LABEL: Record<CvdType, string> = {
  protan: "紅色盲（protan）",
  deutan: "綠色盲（deutan）",
  tritan: "藍色盲（tritan）",
};

/**
 * 以經驗規則分類兩色配對在色覺異常下的風險；`reason` 為繁體中文說明。
 * - risky：紅／綠、綠／棕、藍／紫等常見混淆帶且亮度相近，或模擬後幾乎重疊。
 * - safe：藍／橙配對，或亮度差足夠大。
 * - neutral：其餘情況，需另行以模擬結果判讀。
 */
export function classifyPair(hexA: string, hexB: string): { risk: PairRisk; reason: string } {
  const a = parseColor(hexA);
  const b = parseColor(hexB);
  if (!a || !b) {
    return { risk: "neutral", reason: "顏色無法解析，無法評估配對風險。" };
  }

  const oa = rgbToOklch(a);
  const ob = rgbToOklch(b);
  const dy = Math.abs(relativeLuminance(a) - relativeLuminance(b));
  const dyText = `|ΔY| ≈ ${dy.toFixed(2)}`;
  const chromatic = oa.c >= ACHROMATIC_C && ob.c >= ACHROMATIC_C;

  // 兩色本身就幾乎相同時，問題不在色覺異常，而是所有人都分不出來。
  const deOriginal = deltaEOk(a, b);
  if (deOriginal < SIM_CLOSE_DE) {
    return {
      risk: "risky",
      reason: `兩色本身差異極小（ΔE ≈ ${deOriginal.toFixed(3)}），任何人都難以分辨。`,
    };
  }

  if (chromatic && dy < SIMILAR_Y) {
    if (crossBands(oa.h, ob.h, RED_BAND, GREEN_BAND)) {
      return {
        risk: "risky",
        reason: `紅／綠配對且亮度相近（${dyText}），紅色盲與綠色盲難以區分。`,
      };
    }
    const brownGreen =
      (inBand(oa.h, BROWN_BAND) && oa.l < BROWN_L_MAX && inBand(ob.h, GREEN_BAND)) ||
      (inBand(ob.h, BROWN_BAND) && ob.l < BROWN_L_MAX && inBand(oa.h, GREEN_BAND));
    if (brownGreen) {
      return {
        risk: "risky",
        reason: `綠／棕配對且亮度相近（${dyText}），在紅綠色覺異常下兩者都偏向暗黃。`,
      };
    }
    if (crossBands(oa.h, ob.h, BLUE_BAND, PURPLE_BAND)) {
      return {
        risk: "risky",
        reason: `藍／紫配對且亮度相近（${dyText}），紅色盲與綠色盲看不出紫色中的紅成分。`,
      };
    }
  }

  if (dy >= SAFE_Y) {
    return {
      risk: "safe",
      reason: `亮度差足夠（${dyText} ≥ 0.30），即使色相被混淆仍可靠明暗區分。`,
    };
  }
  if (chromatic && crossBands(oa.h, ob.h, SAFE_BLUE_BAND, ORANGE_BAND)) {
    return {
      risk: "safe",
      reason: "藍／橙配對位於各型色覺異常共同保留的色軸上，通常都能分辨。",
    };
  }

  // 色相帶規則沒有命中時，退回模擬距離：任一型模擬後幾乎重疊就視為有風險。
  if (dy < SIMILAR_Y) {
    for (const type of CVD_TYPES) {
      const de = deltaEOk(simulateCvd(a, type), simulateCvd(b, type));
      if (de < SIM_CLOSE_DE) {
        return {
          risk: "risky",
          reason: `在${CVD_LABEL[type]}模擬下兩色幾乎重疊（ΔE ≈ ${de.toFixed(3)}），且亮度相近（${dyText}）。`,
        };
      }
    }
  }

  return {
    risk: "neutral",
    reason: `未命中常見混淆帶（${dyText}），請以模擬結果與灰階預覽確認。`,
  };
}
