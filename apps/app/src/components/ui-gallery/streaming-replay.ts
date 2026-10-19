"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { OpenGenUIContent } from "@/components/generative-ui/open-generative-ui/schema";
import { chunkHtml } from "./chunk-html";
import { toContent, type GallerySample } from "./sample-payloads/types";

export type ReplayStage =
  | "idle"
  | "placeholder"
  | "css"
  | "html"
  | "final"
  | "functions"
  | "expressions"
  | "done";

export interface ReplayStep {
  at: number;
  stage: ReplayStage;
  content: OpenGenUIContent;
}

export const STAGE_ORDER: ReplayStage[] = [
  "placeholder",
  "css",
  "html",
  "final",
  "functions",
  "expressions",
  "done",
];

/**
 * 把一筆完成態 payload 攤成代理串流時渲染器會看到的 content 序列。
 * 每一步都是新的物件，渲染器才會偵測到 content 變化。
 */
export function buildReplaySteps(sample: GallerySample): ReplayStep[] {
  const steps: ReplayStep[] = [];
  const base = { initialHeight: sample.initialHeight, generating: true as const };
  steps.push({ at: 0, stage: "placeholder", content: { ...base } });

  const withCss: OpenGenUIContent = { ...base, css: sample.css, cssComplete: true, html: [] };
  steps.push({ at: 1200, stage: "css", content: { ...withCss } });

  const chunks = chunkHtml(sample.html, 12);
  let t = 1500;
  chunks.forEach((_, index) => {
    steps.push({
      at: t,
      stage: "html",
      content: { ...withCss, html: chunks.slice(0, index + 1), htmlComplete: false },
    });
    t += 180;
  });

  t += 250;
  const withHtml: OpenGenUIContent = { ...withCss, html: [sample.html], htmlComplete: true };
  steps.push({ at: t, stage: "final", content: { ...withHtml } });

  let withFunctions: OpenGenUIContent = withHtml;
  if (sample.jsFunctions) {
    t += 400;
    withFunctions = { ...withHtml, jsFunctions: sample.jsFunctions, jsFunctionsComplete: true };
    steps.push({ at: t, stage: "functions", content: { ...withFunctions } });
  }

  const expressions = sample.jsExpressions ?? [];
  let withExpressions: OpenGenUIContent = withFunctions;
  expressions.forEach((_, index) => {
    t += 350;
    withExpressions = { ...withFunctions, jsExpressions: expressions.slice(0, index + 1) };
    steps.push({ at: t, stage: "expressions", content: { ...withExpressions } });
  });

  t += 300;
  steps.push({ at: t, stage: "done", content: toContent(sample) });
  return steps;
}

export interface ReplayState {
  content: OpenGenUIContent | null;
  stage: ReplayStage;
  runId: number;
}

export interface StreamingReplay extends ReplayState {
  start: () => void;
  finish: () => void;
  replay: () => void;
}

/**
 * 以計時器依序餵 content 給真實渲染器。
 * 所有 setState 都在事件處理或計時器 callback 內；unmount 時清掉計時器。
 */
export function useStreamingReplay(sample: GallerySample): StreamingReplay {
  const [state, setState] = useState<ReplayState>({ content: null, stage: "idle", runId: 0 });
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimers = useCallback(() => {
    timers.current.forEach((timer) => clearTimeout(timer));
    timers.current = [];
  }, []);

  const schedule = useCallback(
    (runId: number) => {
      const steps = buildReplaySteps(sample);
      steps.forEach((step) => {
        const timer = setTimeout(() => {
          setState({ content: step.content, stage: step.stage, runId });
        }, step.at);
        timers.current.push(timer);
      });
    },
    [sample],
  );

  const replay = useCallback(() => {
    clearTimers();
    setState((previous) => {
      const runId = previous.runId + 1;
      schedule(runId);
      return { content: null, stage: "idle", runId };
    });
  }, [clearTimers, schedule]);

  const start = useCallback(() => {
    setState((previous) => {
      if (previous.stage !== "idle") return previous;
      schedule(previous.runId);
      return previous;
    });
  }, [schedule]);

  const finish = useCallback(() => {
    clearTimers();
    setState((previous) => ({ content: toContent(sample), stage: "done", runId: previous.runId }));
  }, [clearTimers, sample]);

  useEffect(() => clearTimers, [clearTimers]);

  return { ...state, start, finish, replay };
}
