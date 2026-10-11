import { describe, it, expect } from "vitest";
import { OpenGenUIContentSchema } from "@/components/generative-ui/open-generative-ui/schema";
import {
  SAMPLE_PAYLOADS,
  RECONSTRUCTED_LABEL,
  toContent,
  type SampleNetwork,
} from "../sample-payloads";

// 以 join 組出來，這個測試檔本身才不會踩到設計系統的單一來源守衛。
const TOKEN_DEFINITION = ["--color-background-primary", ":"].join("");

/** 外部來源的文字線索 → 範例必須宣告的 needsNetwork 項目 */
const NETWORK_NEEDLES: Array<[RegExp, SampleNetwork]> = [
  [/esm\.sh/, "esm.sh"],
  [/\bimport\(/, "esm.sh"],
  [/jsdelivr/, "jsdelivr"],
  [/nationalmap/, "usgs"],
];

function allCode(sample: (typeof SAMPLE_PAYLOADS)[number]): string {
  return [sample.css, sample.html, sample.jsFunctions ?? "", ...(sample.jsExpressions ?? [])].join("\n");
}

describe("gallery sample payloads", () => {
  it("has exactly eleven samples with unique ids", () => {
    expect(SAMPLE_PAYLOADS.length).toBe(11);
    const ids = SAMPLE_PAYLOADS.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  describe.each(SAMPLE_PAYLOADS.map((s) => [s.id, s] as const))("%s", (_id, sample) => {
    it("converts to a content object the renderer schema accepts", () => {
      expect(OpenGenUIContentSchema.safeParse(toContent(sample)).success).toBe(true);
    });

    it("keeps html free of style and script tags", () => {
      expect(sample.html).not.toMatch(/<style\b/i);
      expect(sample.html).not.toMatch(/<script\b/i);
      expect(sample.html.trim()).not.toBe("");
    });

    it("never redefines the design-system tokens in css", () => {
      expect(sample.css).not.toContain(TOKEN_DEFINITION);
    });

    it("ships behaviour as classic scripts that compile", () => {
      const scripts = [sample.jsFunctions, ...(sample.jsExpressions ?? [])].filter(
        (code): code is string => typeof code === "string"
      );
      for (const code of scripts) {
        expect(code).not.toMatch(/^\s*import\s/m);
        expect(() => new Function(code)).not.toThrow();
      }
    });

    it("declares a plausible initial height", () => {
      expect(sample.initialHeight).toBeGreaterThanOrEqual(50);
      expect(sample.initialHeight).toBeLessThanOrEqual(4000);
    });

    it("labels reconstructed samples as such", () => {
      if (sample.provenance === "reconstructed") {
        expect(sample.description).toContain(RECONSTRUCTED_LABEL);
      } else {
        expect(sample.description).not.toContain(RECONSTRUCTED_LABEL);
      }
    });

    it("declares every external origin its code mentions", () => {
      const code = allCode(sample);
      for (const [needle, origin] of NETWORK_NEEDLES) {
        if (needle.test(code)) {
          expect(sample.needsNetwork ?? []).toContain(origin);
        }
      }
    });
  });
});
