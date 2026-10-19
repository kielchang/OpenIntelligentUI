import { describe, expect, it } from "vitest";
import { SVG_CLASSES_CSS, THEME_CSS } from "@repo/design-system";
import { extractDarkBlocks, forceDarkScheme, isColorValue, parseThemeTokens, tokenGroup } from "../design-tokens";
import { chunkHtml } from "../chunk-html";

describe("parseThemeTokens", () => {
  const tokens = parseThemeTokens(THEME_CSS);

  it("finds the light and dark colour tokens", () => {
    const lightColors = tokens.light.filter((entry) => isColorValue(entry.value));
    const darkColors = tokens.dark.filter((entry) => isColorValue(entry.value));
    expect(lightColors).toHaveLength(21);
    expect(darkColors).toHaveLength(21);
    expect(tokens.light.some((entry) => entry.name === "--font-sans")).toBe(true);
  });

  it("groups names by role", () => {
    expect(tokenGroup("--color-background-info")).toBe("background");
    expect(tokenGroup("--color-text-primary")).toBe("text");
    expect(tokenGroup("--border-radius-md")).toBe("radius");
    expect(tokenGroup("--p")).toBe("alias");
  });
});

describe("forceDarkScheme", () => {
  it("re-emits the dark media block as unconditional rules", () => {
    const forced = forceDarkScheme(THEME_CSS);
    const tail = forced.slice(forced.indexOf("gallery: forced dark"));
    expect(tail).toContain("#1a1a18");
    expect(tail).not.toContain("@media");
    expect(extractDarkBlocks(SVG_CLASSES_CSS)).toHaveLength(1);
    expect(forceDarkScheme(SVG_CLASSES_CSS)).toContain("gallery: forced dark");
  });

  it("leaves css without a dark block untouched", () => {
    expect(forceDarkScheme("body { color: red; }")).toBe("body { color: red; }");
  });
});

describe("chunkHtml", () => {
  it("splits on tag boundaries and reassembles losslessly", () => {
    const html = "<div><p>one</p><p>two</p><ul><li>a</li><li>b</li></ul></div>";
    const chunks = chunkHtml(html, 4);
    expect(chunks.join("")).toBe(html);
    chunks.slice(0, -1).forEach((chunk) => expect(chunk.endsWith(">")).toBe(true));
    expect(chunks.length).toBeGreaterThan(1);
  });

  it("returns an empty list for empty html", () => {
    expect(chunkHtml("", 5)).toEqual([]);
  });
});
