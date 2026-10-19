import { describe, expect, it } from "vitest";
import { splitLeadingStyle } from "../split-leading-style";
import { SEED_TEMPLATES } from "@/components/template-library/seed-templates";

describe("splitLeadingStyle", () => {
  it("pulls the leading <style> block into css and leaves the markup", () => {
    const result = splitLeadingStyle("<style>\n.a { color: red; }\n</style>\n<div class=\"a\">x</div>");
    expect(result.css).toBe(".a { color: red; }");
    expect(result.html).toBe('<div class="a">x</div>');
  });

  it("returns empty css when there is no style block", () => {
    const result = splitLeadingStyle("<p>plain</p>");
    expect(result).toEqual({ css: "", html: "<p>plain</p>" });
  });

  it("converts every seed template into style-free html", () => {
    SEED_TEMPLATES.forEach((template) => {
      const result = splitLeadingStyle(template.html);
      expect(result.css.length).toBeGreaterThan(50);
      expect(result.html).not.toMatch(/<style\b/i);
      expect(result.html.trim().startsWith("<div")).toBe(true);
    });
  });
});
