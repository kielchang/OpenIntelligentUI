import { describe, expect, it } from "vitest";

import {
  composite,
  contrastRatio,
  hueDistance,
  parseColor,
  rgbToOklch,
  type Oklch,
  type Rgb,
} from "../color/color-math";
import { buildContrastMatrix } from "../color/contrast-matrix";
import { classifyPair, evaluateCategorical } from "../color/cvd-palette";
import {
  OKABE_ITO,
  categoricalFromBrand,
  diverging,
  sequential,
} from "../color/palette-generation";

function hex(input: string): Rgb {
  const rgb = parseColor(input);
  if (!rgb) throw new Error(`cannot parse ${input}`);
  return rgb;
}

function oklch(input: string): Oklch {
  return rgbToOklch(hex(input));
}

describe("sequential", () => {
  it("七階連續色盤：唯一、可解析、明度遞減、色相貼近品牌色", () => {
    const base = oklch("#1b936f");
    const steps = sequential("#1b936f", 7);
    expect(steps).toHaveLength(7);
    expect(new Set(steps).size).toBe(7);

    const values = steps.map(oklch);
    for (let i = 1; i < values.length; i++) {
      expect(values[i].l).toBeLessThan(values[i - 1].l);
    }
    for (const v of values) {
      if (v.c < 0.01) continue;
      expect(hueDistance(v.h, base.h)).toBeLessThanOrEqual(3);
    }
    expect(values[0].l).toBeGreaterThan(0.9);
    expect(values[6].l).toBeLessThan(0.4);
  });

  it("階數為 1 時只回傳最淺端，無法解析的品牌色退回灰階", () => {
    expect(sequential("#1b936f", 1)).toHaveLength(1);
    const fallback = sequential("not-a-colour", 3);
    expect(fallback).toHaveLength(3);
    for (const h of fallback) expect(oklch(h).c).toBeLessThan(0.01);
  });
});

describe("diverging", () => {
  it("七階發散色盤：中點近中性、明度左右對稱", () => {
    const steps = diverging("#9599cc", "#1b936f", 7);
    expect(steps).toHaveLength(7);
    const values = steps.map(oklch);
    expect(values[3].c).toBeLessThan(0.02);
    expect(values[3].l).toBeGreaterThan(0.9);
    for (let i = 0; i < 3; i++) {
      expect(Math.abs(values[i].l - values[6 - i].l)).toBeLessThan(0.03);
    }
    // 左側保留左色相、右側保留右色相。
    expect(hueDistance(values[0].h, oklch("#9599cc").h)).toBeLessThan(3);
    expect(hueDistance(values[6].h, oklch("#1b936f").h)).toBeLessThan(3);
    // 兩端最深、往中點逐步變淺。
    expect(values[0].l).toBeLessThan(values[1].l);
    expect(values[1].l).toBeLessThan(values[2].l);
    expect(values[6].l).toBeLessThan(values[5].l);
    expect(values[5].l).toBeLessThan(values[4].l);
  });
});

describe("categoricalFromBrand", () => {
  it("六色等距旋轉色相，相鄰色相差約 60°", () => {
    const colors = categoricalFromBrand("#9599cc", 6);
    expect(colors).toHaveLength(6);
    expect(new Set(colors).size).toBe(6);
    const hues = colors.map((h) => oklch(h).h);
    for (let i = 0; i < hues.length; i++) {
      const gap = hueDistance(hues[i], hues[(i + 1) % hues.length]);
      expect(Math.abs(gap - 60)).toBeLessThanOrEqual(5);
    }
    expect(hueDistance(hues[0], oklch("#9599cc").h)).toBeLessThan(3);
  });
});

describe("OKABE_ITO", () => {
  it("八色皆可解析", () => {
    expect(OKABE_ITO).toHaveLength(8);
    for (const h of OKABE_ITO) expect(parseColor(h)).not.toBeNull();
  });
});

describe("buildContrastMatrix", () => {
  it("深灰文字在白底上通過一般文字門檻", () => {
    const matrix = buildContrastMatrix(
      [{ name: "text", hex: "#1a1a1a" }],
      [{ name: "bg", hex: "#ffffff" }],
      "normal",
    );
    expect(matrix).toHaveLength(1);
    expect(matrix[0]).toHaveLength(1);
    const cell = matrix[0][0];
    expect(cell.pass).toBe(true);
    expect(cell.threshold).toBe(4.5);
    expect(cell.use).toBe("normal");
    expect(cell.ratio).toBeGreaterThan(17);
  });

  it("帶 alpha 的前景與背景都先合成再量測", () => {
    const white = hex("#ffffff");
    const matrix = buildContrastMatrix(
      [{ name: "t40", hex: "rgba(0, 0, 0, 0.4)" }],
      [
        { name: "bg", hex: "#ffffff" },
        { name: "bga", hex: "rgba(0, 0, 0, 0.5)" },
      ],
      "ui",
    );
    expect(matrix[0][0].ratio).toBeCloseTo(contrastRatio(hex("#999999"), white), 6);
    const flattenedBg = composite(hex("rgba(0, 0, 0, 0.5)"), white);
    expect(matrix[0][1].ratio).toBeCloseTo(
      contrastRatio(composite(hex("rgba(0, 0, 0, 0.4)"), flattenedBg), flattenedBg),
      6,
    );
    expect(matrix[0][1].threshold).toBe(3);
  });

  it("無法解析的顏色得到 NaN 與 pass false，矩陣形狀為 列 = 前景、欄 = 背景", () => {
    const matrix = buildContrastMatrix(
      [
        { name: "ok", hex: "#000000" },
        { name: "bad", hex: "nope" },
      ],
      [
        { name: "w", hex: "#ffffff" },
        { name: "g", hex: "#888888" },
        { name: "bad", hex: "???" },
      ],
      "large",
    );
    expect(matrix).toHaveLength(2);
    expect(matrix[0]).toHaveLength(3);
    expect(matrix[0][0].pass).toBe(true);
    expect(Number.isNaN(matrix[1][0].ratio)).toBe(true);
    expect(matrix[1][0].pass).toBe(false);
    expect(Number.isNaN(matrix[0][2].ratio)).toBe(true);
    expect(matrix[0][2].pass).toBe(false);
  });
});

describe("evaluateCategorical", () => {
  const SAMPLE = ["#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#06b6d4", "#f97316"];

  it("回報七個色相，模擬後的最小距離不大於原色最小距離", () => {
    const report = evaluateCategorical(SAMPLE);
    expect(report.hexes).toEqual(SAMPLE);
    expect(report.hues).toHaveLength(7);
    expect(report.lightness).toHaveLength(7);
    for (const h of report.hues) {
      expect(h).toBeGreaterThanOrEqual(0);
      expect(h).toBeLessThan(360);
    }
    expect(report.cvd.deutan.value).toBeLessThanOrEqual(report.minDeltaE.value);
    expect(report.cvd.protan.value).toBeLessThanOrEqual(report.minDeltaE.value);
    expect(report.cvd.tritan.value).toBeGreaterThanOrEqual(0);
    expect(report.minDeltaE.i).toBeLessThan(report.minDeltaE.j);
    expect(report.minLuminanceGap.value).toBeGreaterThanOrEqual(0);
    expect(report.minLuminanceGap.value).toBeLessThan(1);
    expect(report.minAdjacentHueGap).toBeGreaterThanOrEqual(0);
    expect(Number.isFinite(report.minAdjacentHueGap)).toBe(true);
    expect(typeof report.grayscaleMonotonic).toBe("boolean");
  });

  it("Okabe–Ito 的灰階單調性為布林值；嚴格遞增的灰階序列為 true", () => {
    expect(typeof evaluateCategorical([...OKABE_ITO]).grayscaleMonotonic).toBe("boolean");
    expect(evaluateCategorical(["#000000", "#555555", "#aaaaaa", "#ffffff"]).grayscaleMonotonic).toBe(true);
    expect(evaluateCategorical(["#ffffff", "#aaaaaa", "#555555", "#000000"]).grayscaleMonotonic).toBe(true);
    expect(evaluateCategorical(["#000000", "#ffffff", "#555555"]).grayscaleMonotonic).toBe(false);
  });

  it("略過無法解析的項目；少於兩色時沒有配對", () => {
    const report = evaluateCategorical(["#ff0000", "nope", "#00ff00"]);
    expect(report.hexes).toEqual(["#ff0000", "#00ff00"]);
    expect(report.minDeltaE.i).toBe(0);
    expect(report.minDeltaE.j).toBe(1);

    const single = evaluateCategorical(["#ff0000"]);
    expect(single.minDeltaE.i).toBe(-1);
    expect(single.minDeltaE.value).toBe(Number.POSITIVE_INFINITY);
    expect(single.grayscaleMonotonic).toBe(true);
  });
});

describe("classifyPair", () => {
  it("藍／橙為 safe", () => {
    expect(classifyPair("#0072b2", "#d55e00").risk).toBe("safe");
    expect(classifyPair("#d55e00", "#0072b2").risk).toBe("safe");
  });

  it("亮度差夠大時為 safe", () => {
    const result = classifyPair("#ffffff", "#000000");
    expect(result.risk).toBe("safe");
    expect(result.reason.length).toBeGreaterThan(0);
  });

  it("亮度相近的紅／綠為 risky", () => {
    // #ff0000 Y ≈ 0.21、#00aa00 Y ≈ 0.29，亮度差約 0.07。
    expect(classifyPair("#ff0000", "#00aa00").risk).toBe("risky");
    // #2bb34b Y ≈ 0.33，亮度差約 0.12，仍在相近範圍內。
    expect(classifyPair("#ff0000", "#2bb34b").risk).toBe("risky");
  });

  it("亮度相近的藍／紫與綠／棕為 risky", () => {
    expect(classifyPair("#1e40af", "#7e22ce").risk).toBe("risky");
    expect(classifyPair("#8b5a2b", "#2f8f2f").risk).toBe("risky");
  });

  it("幾乎相同的兩色為 risky，理由指出任何人都難以分辨", () => {
    const result = classifyPair("#888888", "#8a8a8a");
    expect(result.risk).toBe("risky");
    expect(result.reason).toContain("任何人");
  });

  it("未命中規則時為 neutral；無法解析時也為 neutral", () => {
    expect(classifyPair("#3b82f6", "#06b6d4").risk).toBe("neutral");
    expect(classifyPair("nope", "#06b6d4").risk).toBe("neutral");
  });
});
