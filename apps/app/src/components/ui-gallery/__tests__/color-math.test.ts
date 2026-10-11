import { describe, expect, it } from "vitest";

import {
  clampToSrgb,
  composite,
  contrastRatio,
  deltaEOk,
  formatOklch,
  formatRatio,
  hueDistance,
  inSrgbGamut,
  linearToSrgb,
  oklchToRgb,
  parseColor,
  passesWcag,
  relativeLuminance,
  rgbToOklch,
  simulateCvd,
  toGrayscale,
  toHex,
  wcagThreshold,
  type Rgb,
} from "../color/color-math";

/** 測試用：把 hex 解析成 Rgb，解析失敗直接讓測試炸掉。 */
function hex(input: string): Rgb {
  const rgb = parseColor(input);
  if (!rgb) throw new Error(`cannot parse ${input}`);
  return rgb;
}

/** 測試用：hex 轉成 0..255 的三個整數通道。 */
function bytes(input: string): [number, number, number] {
  const rgb = hex(input);
  return [Math.round(rgb.r * 255), Math.round(rgb.g * 255), Math.round(rgb.b * 255)];
}

describe("parseColor", () => {
  it("解析各種 hex 長度並展開縮寫", () => {
    expect(parseColor("#F00")).toEqual({ r: 1, g: 0, b: 0 });
    expect(parseColor("#f008")).toEqual({ r: 1, g: 0, b: 0, a: 0x88 / 255 });
    expect(parseColor("  #9599CC ")).toEqual({ r: 0x95 / 255, g: 0x99 / 255, b: 0xcc / 255 });
    expect(parseColor("#ff000080")).toEqual({ r: 1, g: 0, b: 0, a: 0x80 / 255 });
  });

  it("解析 rgb()/rgba()：整數、百分比、空白與斜線語法", () => {
    expect(parseColor("rgba(0, 0, 0, 0.4)")).toEqual({ r: 0, g: 0, b: 0, a: 0.4 });
    expect(parseColor("RGB(100%, 50%, 0%)")).toEqual({ r: 1, g: 0.5, b: 0 });
    expect(parseColor("rgb(255 0 0 / 50%)")).toEqual({ r: 1, g: 0, b: 0, a: 0.5 });
    expect(parseColor("rgb(300, -5, 128)")).toEqual({ r: 1, g: 0, b: 128 / 255 });
  });

  it("無法解析的輸入回傳 null", () => {
    expect(parseColor("")).toBeNull();
    expect(parseColor("#ggg")).toBeNull();
    expect(parseColor("#12345")).toBeNull();
    expect(parseColor("rgb(1, 2)")).toBeNull();
    expect(parseColor("hsl(1, 2%, 3%)")).toBeNull();
    expect(parseColor("rgba(0, 0, 0, )")).toBeNull();
    expect(parseColor("red")).toBeNull();
  });
});

describe("toHex 與 composite", () => {
  it("toHex 輸出小寫並夾限、四捨五入，忽略 alpha", () => {
    expect(toHex({ r: 1, g: 0, b: 0, a: 0.2 })).toBe("#ff0000");
    expect(toHex({ r: 1.4, g: -0.3, b: 0.5 })).toBe("#ff0080");
    expect(toHex(hex("#9599CC"))).toBe("#9599cc");
  });

  it("rgba(0,0,0,0.4) 疊在白色上約為 #999999", () => {
    const over = composite(hex("rgba(0, 0, 0, 0.4)"), hex("#ffffff"));
    expect(over.a).toBe(1);
    expect(toHex(over)).toBe("#999999");
  });
});

describe("OKLab / OKLCH", () => {
  it("白色的 L ≈ 1 且彩度趨近 0", () => {
    const white = rgbToOklch(hex("#ffffff"));
    expect(white.l).toBeCloseTo(1, 3);
    expect(white.c).toBeLessThan(0.001);
  });

  it("紅色與藍色的色相落在已知角度附近", () => {
    expect(Math.abs(rgbToOklch(hex("#ff0000")).h - 29)).toBeLessThanOrEqual(2);
    expect(Math.abs(rgbToOklch(hex("#0000ff")).h - 264)).toBeLessThanOrEqual(2);
  });

  it("hex → OKLCH → hex 往返誤差每通道不超過 1", () => {
    for (const input of ["#9599cc", "#1b936f", "#f7f6f3"]) {
      const back = toHex(oklchToRgb(rgbToOklch(hex(input))));
      const a = bytes(input);
      const b = bytes(back);
      for (let i = 0; i < 3; i++) expect(Math.abs(a[i] - b[i])).toBeLessThanOrEqual(1);
    }
  });

  it("高彩度 OKLCH 不在 sRGB 色域內，clampToSrgb 降彩度後入域且保留明度與色相", () => {
    const target = { l: 0.6, c: 0.4, h: 140 };
    expect(inSrgbGamut(oklchToRgb(target))).toBe(false);
    const clamped = clampToSrgb(target);
    expect(inSrgbGamut(clamped)).toBe(true);
    const back = rgbToOklch(clamped);
    expect(Math.abs(back.l - 0.6)).toBeLessThan(0.02);
    expect(hueDistance(back.h, 140)).toBeLessThan(1);
    expect(back.c).toBeLessThan(0.4);
    expect(back.c).toBeGreaterThan(0.1);
  });

  it("formatOklch 以兩位小數與整數角度顯示，無彩度時色相為「—」", () => {
    expect(formatOklch({ l: 0.6984, c: 0.0747, h: 280.78 })).toBe("L 0.70 · C 0.07 · H 281°");
    expect(formatOklch(rgbToOklch(hex("#ffffff")))).toBe("L 1.00 · C 0.00 · H —");
  });
});

describe("WCAG 對比", () => {
  it("黑白對比為 21", () => {
    expect(Math.abs(contrastRatio(hex("#ffffff"), hex("#000000")) - 21)).toBeLessThan(0.01);
  });

  it("#1a1a1a 在白底上約 17.4", () => {
    const ratio = contrastRatio(hex("#1a1a1a"), hex("#ffffff"));
    expect(ratio).toBeGreaterThan(17.3);
    expect(ratio).toBeLessThan(17.5);
  });

  it("對比值不受前景／背景順序影響，帶 alpha 的前景先合成再量測", () => {
    expect(contrastRatio(hex("#1b936f"), hex("#ffffff"))).toBeCloseTo(
      contrastRatio(hex("#ffffff"), hex("#1b936f")),
      10,
    );
    const translucent = contrastRatio(hex("rgba(0, 0, 0, 0.4)"), hex("#ffffff"));
    const flattened = contrastRatio(hex("#999999"), hex("#ffffff"));
    expect(translucent).toBeCloseTo(flattened, 6);
  });

  it("relativeLuminance 以線性通道加權", () => {
    expect(relativeLuminance(hex("#ffffff"))).toBeCloseTo(1, 10);
    expect(relativeLuminance(hex("#000000"))).toBe(0);
    expect(relativeLuminance(hex("#ff0000"))).toBeCloseTo(0.2126, 6);
  });

  it("門檻與判定不做四捨五入", () => {
    expect(wcagThreshold("normal")).toBe(4.5);
    expect(wcagThreshold("large")).toBe(3);
    expect(wcagThreshold("ui")).toBe(3);
    expect(passesWcag(4.499, "normal")).toBe(false);
    expect(passesWcag(4.5, "normal")).toBe(true);
    expect(passesWcag(2.999, "ui")).toBe(false);
    expect(passesWcag(3, "large")).toBe(true);
    expect(passesWcag(Number.NaN, "normal")).toBe(false);
  });

  it("formatRatio 截斷而非四捨五入", () => {
    expect(formatRatio(4.4999)).toBe("4.49:1");
    expect(formatRatio(4.49)).toBe("4.49:1");
    expect(formatRatio(4.5)).toBe("4.50:1");
    expect(formatRatio(21)).toBe("21.00:1");
    expect(formatRatio(Number.NaN)).toBe("—");
  });
});

describe("色覺異常模擬與灰階", () => {
  it("protan 模擬後純紅與純綠的色相收斂、距離縮小", () => {
    const red = hex("#ff0000");
    const green = hex("#00ff00");
    const before = deltaEOk(red, green);
    const simRed = simulateCvd(red, "protan");
    const simGreen = simulateCvd(green, "protan");
    const after = deltaEOk(simRed, simGreen);
    expect(after).toBeLessThan(before);
    // 原本相距約 110° 的色相，模擬後都落在黃色附近。
    expect(hueDistance(rgbToOklch(red).h, rgbToOklch(green).h)).toBeGreaterThan(90);
    expect(hueDistance(rgbToOklch(simRed).h, rgbToOklch(simGreen).h)).toBeLessThan(20);
    expect(inSrgbGamut(simRed, 0)).toBe(true);
    expect(inSrgbGamut(simGreen, 0)).toBe(true);
  });

  it("三種模擬都保留 alpha 並維持灰色不變", () => {
    const gray: Rgb = { r: 0.5, g: 0.5, b: 0.5, a: 0.7 };
    for (const type of ["protan", "deutan", "tritan"] as const) {
      const out = simulateCvd(gray, type);
      expect(out.a).toBe(0.7);
      expect(Math.abs(out.r - 0.5)).toBeLessThan(0.01);
      expect(Math.abs(out.g - 0.5)).toBeLessThan(0.01);
      expect(Math.abs(out.b - 0.5)).toBeLessThan(0.01);
    }
  });

  it("toGrayscale 讓三通道相等且等於亮度回編碼值", () => {
    const gray = toGrayscale(hex("#ff0000"));
    expect(gray.r).toBeCloseTo(gray.g, 10);
    expect(gray.g).toBeCloseTo(gray.b, 10);
    expect(gray.r).toBeCloseTo(linearToSrgb(0.2126), 6);
  });
});

describe("hueDistance", () => {
  it("取最短角距離並處理跨 0° 與負角度", () => {
    expect(hueDistance(350, 10)).toBe(20);
    expect(hueDistance(10, 350)).toBe(20);
    expect(hueDistance(0, 180)).toBe(180);
    expect(hueDistance(-10, 10)).toBe(20);
    expect(hueDistance(90, 90)).toBe(0);
  });
});
