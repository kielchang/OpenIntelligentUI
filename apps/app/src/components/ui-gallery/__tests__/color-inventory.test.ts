import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  ADHOC_FAMILY,
  allFamilies,
  APP_TOKENS,
  chartFamily,
  designSystemFamily,
  HARDCODED_COUNTS,
  HARDCODED_TOTAL,
  svgRamps,
} from "../color/color-inventory";
import { parseColor } from "../color/color-math";

const APP_ROOT = resolve(__dirname, "../../../..");
const REPO_ROOT = resolve(APP_ROOT, "../..");
const normalize = (value: string) => value.replace(/\s+/g, "").toLowerCase();

describe("design-system families", () => {
  it("parses 21 colour tokens with dark counterparts", () => {
    const family = designSystemFamily();
    expect(family.swatches).toHaveLength(21);
    family.swatches.forEach((swatch) => {
      expect(parseColor(swatch.light)).not.toBeNull();
      expect(swatch.dark).toBeDefined();
      expect(parseColor(swatch.dark!)).not.toBeNull();
    });
  });

  it("parses nine SVG ramps with fill, stroke and text in both modes", () => {
    const ramps = svgRamps();
    expect(ramps.map((ramp) => ramp.name)).toEqual(["purple", "teal", "coral", "pink", "gray", "blue", "green", "amber", "red"]);
    ramps.forEach((ramp) => {
      (["fill", "stroke", "text", "sub"] as const).forEach((key) => {
        expect(ramp.light[key]).toMatch(/^#[0-9A-Fa-f]{6}$/);
        expect(ramp.dark[key]).toMatch(/^#[0-9A-Fa-f]{6}$/);
      });
      expect(ramp.light.fill).not.toBe(ramp.dark.fill);
    });
  });

  it("imports CHART_COLORS instead of copying them", () => {
    expect(chartFamily().swatches).toHaveLength(7);
    expect(allFamilies().map((family) => family.id)).toEqual(["design-system", "svg-ramps", "app", "chart", "adhoc"]);
  });
});

describe("static inventories stay in sync with the source files", () => {
  const globals = readFileSync(resolve(APP_ROOT, "src/app/globals.css"), "utf8");
  const lightBlock = globals.slice(globals.indexOf(":root {"), globals.indexOf(":root.dark {"));
  const darkBlock = globals.slice(globals.indexOf(":root.dark {"), globals.indexOf("/* === Base Styles === */"));

  it("APP_TOKENS light and dark values match globals.css", () => {
    APP_TOKENS.forEach((token) => {
      const light = normalize(lightBlock).includes(normalize(`${token.name}:${token.light};`));
      expect(light, `${token.name} light`).toBe(true);
      if (token.dark) {
        const dark = normalize(darkBlock).includes(normalize(`${token.name}:${token.dark};`));
        expect(dark, `${token.name} dark`).toBe(true);
      }
    });
  });

  it("every ad-hoc colour exists in the file its note names", () => {
    const sources: Record<string, string> = {
      "focus ring / OG 強調": "src/app/chat.css",
      ".chat-error 邊框": "src/app/chat.css",
      "QrModal scanned": "src/components/qr-modal/index.tsx",
      "QrModal picked": "src/components/qr-modal/index.tsx",
      "indigo fallback": "src/components/template-library/template-card.tsx",
      "emerald fallback": "src/components/template-library/template-card.tsx",
      "pick 頁背景漸層": "src/app/pick/page.tsx",
      "pick 頁錯誤字": "src/app/pick/page.tsx",
      "OG 背景": "src/app/opengraph-image.tsx",
    };
    Object.entries(sources).forEach(([name, file]) => {
      const swatch = ADHOC_FAMILY.swatches.find((item) => item.name === name);
      expect(swatch, name).toBeDefined();
      const text = normalize(readFileSync(resolve(APP_ROOT, file), "utf8"));
      expect(text.includes(normalize(swatch!.light)), `${name} in ${file}`).toBe(true);
    });
  });

  it("HARDCODED_COUNTS matches a fresh count over the same files", () => {
    const pattern = /#[0-9a-fA-F]{3,8}\b|rgba?\(/g;
    HARDCODED_COUNTS.forEach((entry) => {
      const text = readFileSync(resolve(REPO_ROOT, entry.file), "utf8");
      const count = (text.match(pattern) ?? []).length;
      expect(count, entry.file).toBe(entry.count);
    });
    expect(HARDCODED_TOTAL).toBe(HARDCODED_COUNTS.reduce((sum, entry) => sum + entry.count, 0));
  });
});
