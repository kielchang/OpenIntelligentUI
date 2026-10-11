import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { buildReplaySteps, useStreamingReplay } from "../streaming-replay";
import { toContent, type GallerySample } from "../sample-payloads/types";

const sample: GallerySample = {
  id: "t",
  title: "Test",
  description: "test",
  provenance: "skill",
  visualization: "calculator",
  initialHeight: 200,
  css: ".a { color: var(--color-text-primary); }",
  html: "<div class=\"a\"><p>one</p><p>two</p><button type=\"button\">go</button></div>",
  jsFunctions: "function init() { return 1; }",
  jsExpressions: ["init();", "init();"],
};

describe("buildReplaySteps", () => {
  it("walks through every renderer stage in order", () => {
    const steps = buildReplaySteps(sample);
    const stages = steps.map((step) => step.stage);
    expect(stages[0]).toBe("placeholder");
    expect(stages[1]).toBe("css");
    expect(stages.filter((stage) => stage === "html").length).toBeGreaterThan(0);
    expect(stages).toContain("final");
    expect(stages).toContain("functions");
    expect(stages.filter((stage) => stage === "expressions")).toHaveLength(2);
    expect(stages.at(-1)).toBe("done");
    steps.slice(1).forEach((step, index) => expect(step.at).toBeGreaterThan(steps[index].at));
  });

  it("grows the html chunk list and keeps generating until the end", () => {
    const steps = buildReplaySteps(sample);
    const htmlSteps = steps.filter((step) => step.stage === "html");
    htmlSteps.forEach((step, index) => {
      expect(step.content.html).toHaveLength(index + 1);
      expect(step.content.htmlComplete).toBe(false);
      expect(step.content.generating).toBe(true);
    });
    const final = steps.find((step) => step.stage === "final")!;
    expect(final.content.html).toEqual([sample.html]);
    expect(final.content.htmlComplete).toBe(true);
    expect(final.content.generating).toBe(true);
    expect(steps.at(-1)!.content).toEqual(toContent(sample));
  });

  it("skips the functions stage when the sample has no jsFunctions", () => {
    const steps = buildReplaySteps({ ...sample, jsFunctions: undefined, jsExpressions: [] });
    expect(steps.map((step) => step.stage)).not.toContain("functions");
    expect(steps.map((step) => step.stage)).not.toContain("expressions");
  });
});

describe("useStreamingReplay", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("starts idle, advances with timers and finishes complete", () => {
    const { result } = renderHook(() => useStreamingReplay(sample));
    expect(result.current.stage).toBe("idle");
    expect(result.current.content).toBeNull();

    act(() => result.current.start());
    act(() => vi.advanceTimersByTime(10));
    expect(result.current.stage).toBe("placeholder");
    act(() => vi.advanceTimersByTime(1300));
    expect(result.current.stage).toBe("css");
    act(() => vi.advanceTimersByTime(20000));
    expect(result.current.stage).toBe("done");
    expect(result.current.content).toEqual(toContent(sample));
  });

  it("finish() jumps to the complete snapshot and replay() bumps runId", () => {
    const { result, unmount } = renderHook(() => useStreamingReplay(sample));
    act(() => result.current.finish());
    expect(result.current.stage).toBe("done");
    const runId = result.current.runId;
    act(() => result.current.replay());
    expect(result.current.runId).toBe(runId + 1);
    expect(result.current.stage).toBe("idle");
    act(() => vi.advanceTimersByTime(5));
    expect(result.current.stage).toBe("placeholder");
    unmount();
    expect(() => vi.runAllTimers()).not.toThrow();
  });
});
