/**
 * 色彩數學：sRGB ↔ 線性 RGB ↔ OKLab ↔ OKLCH、WCAG 對比、色覺異常模擬、灰階。
 *
 * 純函式、零執行期依賴。所有 RGB 通道皆為 0..1（非 0..255），alpha 省略時視為 1。
 * OKLab 轉換採 Björn Ottosson 公布的矩陣（線性 sRGB → LMS → 立方根 → Lab）。
 */

/** sRGB 顏色；通道 0..1，`a` 省略視為 1。 */
export interface Rgb {
  r: number;
  g: number;
  b: number;
  a?: number;
}

/** OKLCH：l 0..1、c ≥ 0、h 為角度 [0, 360)。 */
export interface Oklch {
  l: number;
  c: number;
  h: number;
}

/** OKLab 座標。 */
export interface Oklab {
  l: number;
  a: number;
  b: number;
}

export type ContrastUse = "normal" | "large" | "ui";
export type CvdType = "protan" | "deutan" | "tritan";

const DEG = Math.PI / 180;

function clamp01(v: number): number {
  if (Number.isNaN(v)) return 0;
  return v < 0 ? 0 : v > 1 ? 1 : v;
}

/** 將任意角度正規化到 [0, 360)。 */
export function normalizeHue(h: number): number {
  if (!Number.isFinite(h)) return 0;
  const n = h % 360;
  return n < 0 ? n + 360 : n;
}

/* ------------------------------------------------------------------ */
/* 解析與格式化                                                        */
/* ------------------------------------------------------------------ */

const HEX_RE = /^#([0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/i;
const FUNC_RE = /^rgba?\(\s*(.*?)\s*\)$/i;
const NUMBER_RE = /^[+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?$/i;

/** 解析色彩通道：整數 0..255 或百分比；超出範圍會被夾住。 */
function parseChannel(token: string): number | null {
  if (token.endsWith("%")) {
    const n = token.slice(0, -1);
    if (!NUMBER_RE.test(n)) return null;
    return clamp01(Number(n) / 100);
  }
  if (!NUMBER_RE.test(token)) return null;
  return clamp01(Number(token) / 255);
}

/** 解析 alpha：0..1 或百分比。 */
function parseAlpha(token: string): number | null {
  if (token.endsWith("%")) {
    const n = token.slice(0, -1);
    if (!NUMBER_RE.test(n)) return null;
    return clamp01(Number(n) / 100);
  }
  if (!NUMBER_RE.test(token)) return null;
  return clamp01(Number(token));
}

/**
 * 解析 `#rgb`、`#rgba`、`#rrggbb`、`#rrggbbaa`、`rgb(r, g, b)`、`rgba(r, g, b, a)`
 * （整數 0..255 或百分比，也接受空白分隔與 `/ a` 寫法）。不分大小寫、自動去除前後空白；
 * 其他格式回傳 null。
 */
export function parseColor(input: string): Rgb | null {
  if (typeof input !== "string") return null;
  const s = input.trim();
  if (s.length === 0) return null;

  const hex = HEX_RE.exec(s);
  if (hex) {
    const digits = hex[1];
    const expand = digits.length === 3 || digits.length === 4;
    const read = (i: number): number => {
      const part = expand ? digits[i] + digits[i] : digits.slice(i * 2, i * 2 + 2);
      return parseInt(part, 16) / 255;
    };
    const rgb: Rgb = { r: read(0), g: read(1), b: read(2) };
    if (digits.length === 4 || digits.length === 8) rgb.a = read(3);
    return rgb;
  }

  const fn = FUNC_RE.exec(s);
  if (!fn) return null;
  const body = fn[1];
  let channels: string[];
  let alphaToken: string | undefined;

  if (body.includes(",")) {
    const parts = body.split(",").map((p) => p.trim());
    if (parts.length === 4) {
      alphaToken = parts[3];
      channels = parts.slice(0, 3);
    } else if (parts.length === 3) {
      channels = parts;
    } else {
      return null;
    }
  } else {
    const segments = body.split("/").map((p) => p.trim());
    if (segments.length > 2) return null;
    channels = segments[0].split(/\s+/).filter((p) => p.length > 0);
    if (channels.length !== 3) return null;
    if (segments.length === 2) alphaToken = segments[1];
  }

  const r = parseChannel(channels[0]);
  const g = parseChannel(channels[1]);
  const b = parseChannel(channels[2]);
  if (r === null || g === null || b === null) return null;
  const rgb: Rgb = { r, g, b };
  if (alphaToken !== undefined) {
    if (alphaToken.length === 0) return null;
    const a = parseAlpha(alphaToken);
    if (a === null) return null;
    rgb.a = a;
  }
  return rgb;
}

function toByte(c: number): number {
  return Math.round(clamp01(c) * 255);
}

/** 轉成小寫 `#rrggbb`（忽略 alpha；通道先夾在 0..1 再四捨五入）。 */
export function toHex(rgb: Rgb): string {
  const hexByte = (c: number): string => toByte(c).toString(16).padStart(2, "0");
  return `#${hexByte(rgb.r)}${hexByte(rgb.g)}${hexByte(rgb.b)}`;
}

/** source-over 合成：前景（可帶 alpha）疊在視為不透明的背景上，結果不透明。 */
export function composite(fg: Rgb, bg: Rgb): Rgb {
  const a = clamp01(fg.a ?? 1);
  return {
    r: fg.r * a + bg.r * (1 - a),
    g: fg.g * a + bg.g * (1 - a),
    b: fg.b * a + bg.b * (1 - a),
    a: 1,
  };
}

/* ------------------------------------------------------------------ */
/* sRGB 轉換函式                                                       */
/* ------------------------------------------------------------------ */

/** sRGB 編碼通道 → 線性光。 */
export function srgbToLinear(c: number): number {
  const v = Math.abs(c);
  const lin = v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  return c < 0 ? -lin : lin;
}

/** 線性光 → sRGB 編碼通道。 */
export function linearToSrgb(c: number): number {
  const v = Math.abs(c);
  const enc = v <= 0.0031308 ? v * 12.92 : 1.055 * Math.pow(v, 1 / 2.4) - 0.055;
  return c < 0 ? -enc : enc;
}

/* ------------------------------------------------------------------ */
/* OKLab / OKLCH                                                       */
/* ------------------------------------------------------------------ */

/** sRGB → OKLab（Ottosson M1 → 立方根 → M2）。 */
export function rgbToOklab(rgb: Rgb): Oklab {
  const r = srgbToLinear(rgb.r);
  const g = srgbToLinear(rgb.g);
  const b = srgbToLinear(rgb.b);

  const l = 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b;
  const m = 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b;
  const s = 0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b;

  const l_ = Math.cbrt(l);
  const m_ = Math.cbrt(m);
  const s_ = Math.cbrt(s);

  return {
    l: 0.2104542553 * l_ + 0.793617785 * m_ - 0.0040720468 * s_,
    a: 1.9779984951 * l_ - 2.428592205 * m_ + 0.4505937099 * s_,
    b: 0.0259040371 * l_ + 0.7827717662 * m_ - 0.808675766 * s_,
  };
}

/** OKLab → sRGB，不夾限（通道可能落在 0..1 之外，供色域判斷使用）。 */
export function oklabToRgb(lab: Oklab): Rgb {
  const l_ = lab.l + 0.3963377774 * lab.a + 0.2158037573 * lab.b;
  const m_ = lab.l - 0.1055613458 * lab.a - 0.0638541728 * lab.b;
  const s_ = lab.l - 0.0894841775 * lab.a - 1.291485548 * lab.b;

  const l = l_ * l_ * l_;
  const m = m_ * m_ * m_;
  const s = s_ * s_ * s_;

  const r = 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
  const g = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
  const b = -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s;

  return { r: linearToSrgb(r), g: linearToSrgb(g), b: linearToSrgb(b), a: 1 };
}

/** sRGB → OKLCH；色相以角度表示並正規化到 [0, 360)，彩度趨近 0 時色相為 0。 */
export function rgbToOklch(rgb: Rgb): Oklch {
  const lab = rgbToOklab(rgb);
  const c = Math.hypot(lab.a, lab.b);
  const h = c < 1e-9 ? 0 : normalizeHue(Math.atan2(lab.b, lab.a) / DEG);
  return { l: lab.l, c, h };
}

/** OKLCH → sRGB，不夾限。 */
export function oklchToRgb(o: Oklch): Rgb {
  const rad = o.h * DEG;
  return oklabToRgb({ l: o.l, a: o.c * Math.cos(rad), b: o.c * Math.sin(rad) });
}

/** 三個通道是否都落在 [−epsilon, 1 + epsilon]。 */
export function inSrgbGamut(rgb: Rgb, epsilon = 1e-4): boolean {
  const ok = (v: number): boolean => Number.isFinite(v) && v >= -epsilon && v <= 1 + epsilon;
  return ok(rgb.r) && ok(rgb.g) && ok(rgb.b);
}

function clampChannels(rgb: Rgb): Rgb {
  return { r: clamp01(rgb.r), g: clamp01(rgb.g), b: clamp01(rgb.b), a: 1 };
}

/**
 * 把 OKLCH 壓進 sRGB 色域：保持明度與色相，以二分法（20 次）降低彩度直到入域，
 * 最後再把通道夾在 0..1 以吸收 epsilon 誤差。明度超出 0..1 時先夾限。
 */
export function clampToSrgb(o: Oklch): Rgb {
  const l = clamp01(o.l);
  const h = normalizeHue(o.h);
  const cMax = Math.max(0, Number.isFinite(o.c) ? o.c : 0);

  const direct = oklchToRgb({ l, c: cMax, h });
  if (inSrgbGamut(direct)) return clampChannels(direct);

  let lo = 0;
  let hi = cMax;
  for (let i = 0; i < 20; i++) {
    const mid = (lo + hi) / 2;
    if (inSrgbGamut(oklchToRgb({ l, c: mid, h }))) lo = mid;
    else hi = mid;
  }
  return clampChannels(oklchToRgb({ l, c: lo, h }));
}

/* ------------------------------------------------------------------ */
/* WCAG 對比                                                           */
/* ------------------------------------------------------------------ */

/** WCAG 2.x 相對亮度（由線性通道加權），忽略 alpha。 */
export function relativeLuminance(rgb: Rgb): number {
  return (
    0.2126 * srgbToLinear(clamp01(rgb.r)) +
    0.7152 * srgbToLinear(clamp01(rgb.g)) +
    0.0722 * srgbToLinear(clamp01(rgb.b))
  );
}

/** 對比值 (L1 + 0.05) / (L2 + 0.05)；前景有 alpha 時先疊在背景上再量測。 */
export function contrastRatio(fg: Rgb, bg: Rgb): number {
  const fgFlat = (fg.a ?? 1) < 1 ? composite(fg, bg) : fg;
  const l1 = relativeLuminance(fgFlat);
  const l2 = relativeLuminance(bg);
  const hi = Math.max(l1, l2);
  const lo = Math.min(l1, l2);
  return (hi + 0.05) / (lo + 0.05);
}

/** WCAG AA 門檻：一般文字 4.5、大字 3、UI 元件與圖形 3。 */
export function wcagThreshold(use: ContrastUse): number {
  return use === "normal" ? 4.5 : 3;
}

/** 嚴格比較 ratio ≥ 門檻，不做任何四捨五入（4.499 不通過）。 */
export function passesWcag(ratio: number, use: ContrastUse): boolean {
  return Number.isFinite(ratio) && ratio >= wcagThreshold(use);
}

/**
 * 顯示用字串 `"4.49:1"`：取到小數第二位時採「截斷」而非四捨五入，
 * 以免把不及格的 4.499 顯示成看似及格的 4.50。
 */
export function formatRatio(ratio: number): string {
  if (!Number.isFinite(ratio)) return "—";
  // 加上極小量以抵銷 4.49 * 100 = 448.999… 這類浮點誤差，但不足以影響 4.499。
  const truncated = Math.floor(ratio * 100 + 1e-7) / 100;
  return `${truncated.toFixed(2)}:1`;
}

/* ------------------------------------------------------------------ */
/* 色覺異常模擬與灰階                                                  */
/* ------------------------------------------------------------------ */

type Matrix3 = readonly [
  readonly [number, number, number],
  readonly [number, number, number],
  readonly [number, number, number],
];

/** Machado、Oliveira 與 Fernandes（2009）severity 1.0 的線性 RGB 矩陣。 */
const CVD_MATRICES: Record<CvdType, Matrix3> = {
  protan: [
    [0.152286, 1.052583, -0.204868],
    [0.114503, 0.786281, 0.099216],
    [-0.003882, -0.048116, 1.051998],
  ],
  deutan: [
    [0.367322, 0.860646, -0.227968],
    [0.280085, 0.672501, 0.047413],
    [-0.01182, 0.04294, 0.968881],
  ],
  tritan: [
    [1.255528, -0.076749, -0.178779],
    [-0.078411, 0.930809, 0.147602],
    [0.004733, 0.691367, 0.3039],
  ],
};

/** 在線性 RGB 套用色覺異常矩陣後回到 sRGB，通道夾在 0..1；alpha 原樣保留。 */
export function simulateCvd(rgb: Rgb, type: CvdType): Rgb {
  const m = CVD_MATRICES[type];
  const r = srgbToLinear(clamp01(rgb.r));
  const g = srgbToLinear(clamp01(rgb.g));
  const b = srgbToLinear(clamp01(rgb.b));
  const out: Rgb = {
    r: clamp01(linearToSrgb(clamp01(m[0][0] * r + m[0][1] * g + m[0][2] * b))),
    g: clamp01(linearToSrgb(clamp01(m[1][0] * r + m[1][1] * g + m[1][2] * b))),
    b: clamp01(linearToSrgb(clamp01(m[2][0] * r + m[2][1] * g + m[2][2] * b))),
  };
  if (rgb.a !== undefined) out.a = rgb.a;
  return out;
}

/** 以相對亮度 Y 轉灰階：三個通道都設為 linearToSrgb(Y)；alpha 原樣保留。 */
export function toGrayscale(rgb: Rgb): Rgb {
  const y = clamp01(linearToSrgb(relativeLuminance(rgb)));
  const out: Rgb = { r: y, g: y, b: y };
  if (rgb.a !== undefined) out.a = rgb.a;
  return out;
}

/* ------------------------------------------------------------------ */
/* 距離與格式化                                                        */
/* ------------------------------------------------------------------ */

/** OKLab 空間的歐氏距離（忽略 alpha）。 */
export function deltaEOk(a: Rgb, b: Rgb): number {
  const la = rgbToOklab(a);
  const lb = rgbToOklab(b);
  return Math.hypot(la.l - lb.l, la.a - lb.a, la.b - lb.b);
}

/** 兩個色相之間最短的角距離，範圍 0..180。 */
export function hueDistance(h1: number, h2: number): number {
  const d = Math.abs(normalizeHue(h1) - normalizeHue(h2));
  return d > 180 ? 360 - d : d;
}

/** 顯示用字串 `"L 0.69 · C 0.07 · H 290°"`；彩度低於 0.005 時色相無意義，顯示為「—」。 */
export function formatOklch(o: Oklch): string {
  const hue = o.c < 0.005 ? "—" : `${Math.round(normalizeHue(o.h)) % 360}°`;
  return `L ${o.l.toFixed(2)} · C ${o.c.toFixed(2)} · H ${hue}`;
}
