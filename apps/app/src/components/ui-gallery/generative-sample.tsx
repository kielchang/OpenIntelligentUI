"use client";

import { useEffect, useRef } from "react";
import { OpenGenUIActivityRenderer } from "@/components/generative-ui/open-generative-ui";
import {
  assembleStandaloneHtmlFromActivity,
  slugify,
  triggerDownload,
} from "@/components/generative-ui/export-utils";
import { useStreamingReplay } from "./streaming-replay";
import { ReplayControls } from "./replay-controls";
import { SourceTabs } from "./source-tabs";
import { toContent, type GallerySample, type SampleNetwork, type SampleProvenance } from "./sample-payloads/types";

const PROVENANCE_LABEL: Record<SampleProvenance, string> = {
  seed: "專案內建範本原文",
  skill: "技能文件範例原文",
  reconstructed: "依技能規範重建",
};

const NETWORK_LABEL: Record<SampleNetwork, string> = {
  "esm.sh": "需要 esm.sh",
  jsdelivr: "需要 cdn.jsdelivr.net",
  usgs: "需要 USGS 圖磚",
};

interface GenerativeSampleProps {
  sample: GallerySample;
  /** 捲進視窗時自動開始重播（只給前幾筆用，避免一次建立太多沙箱） */
  autoStart?: boolean;
}

/** 一筆生成式 UI 範例：海報態 → 真實渲染器串流重播 → 階段指示、原始碼、下載 */
export function GenerativeSample({ sample, autoStart = false }: GenerativeSampleProps) {
  const replay = useStreamingReplay(sample);
  const { start } = replay;
  const host = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!autoStart || typeof IntersectionObserver === "undefined") return;
    const element = host.current;
    if (!element) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          start();
          observer.disconnect();
        }
      },
      { rootMargin: "0px 0px -15% 0px" },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [autoStart, start]);

  const download = () => {
    const html = assembleStandaloneHtmlFromActivity(toContent(sample), sample.title);
    triggerDownload(html, `${slugify(sample.title) || "sample"}.html`);
  };

  return (
    <article className="gal-sample" ref={host} id={`sample-${sample.id}`} data-provenance={sample.provenance}>
      <header className="gal-sample-head">
        <div className="gal-sample-title">
          <h3>{sample.title}</h3>
          <p className="gal-meta">
            Jev 型別 <code>{sample.visualization}</code>
            <span aria-hidden="true"> · </span>
            <span className="gal-badge" data-state={sample.provenance === "reconstructed" ? "unmounted" : "mounted"}>
              {PROVENANCE_LABEL[sample.provenance]}
            </span>
            {sample.needsNetwork?.map((network) => (
              <span key={network} className="gal-badge" data-state="agent">
                {NETWORK_LABEL[network]}
              </span>
            ))}
          </p>
        </div>
        <div className="gal-sample-actions">
          {replay.stage === "idle" ? (
            <>
              <button type="button" className="gal-btn gal-btn--primary" onClick={replay.start}>
                開始串流重播
              </button>
              <button type="button" className="gal-btn" onClick={replay.finish}>
                直接顯示完成版
              </button>
            </>
          ) : (
            <button type="button" className="gal-btn" onClick={download}>
              下載獨立 HTML
            </button>
          )}
        </div>
      </header>
      <p className="gal-sample-desc">{sample.description}</p>
      {sample.prompt && (
        <details className="gal-details">
          <summary>原始使用者提示</summary>
          <p className="gal-prompt">{sample.prompt}</p>
        </details>
      )}
      <div className="gal-sample-stage">
        {replay.content ? (
          <OpenGenUIActivityRenderer
            key={replay.runId}
            activityType="open-generative-ui"
            content={replay.content}
            message={{}}
            agent={{}}
          />
        ) : (
          <div className="gal-sample-poster" style={{ minHeight: Math.min(sample.initialHeight, 240) }}>
            <p>
              按「開始串流重播」會用正式的 <code>OpenGenUIActivityRenderer</code> 依序餵入六個欄位：
              先看到 placeholder，css 完成後出現預覽 iframe，html 完成後建立最終 Websandbox，再注入腳本。
            </p>
          </div>
        )}
      </div>
      {replay.stage !== "idle" && (
        <ReplayControls stage={replay.stage} onReplay={replay.replay} onFinish={replay.finish} />
      )}
      <details className="gal-details">
        <summary>六欄位 payload 原文</summary>
        <SourceTabs sample={sample} />
      </details>
    </article>
  );
}
