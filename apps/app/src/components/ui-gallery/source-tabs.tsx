"use client";

import { useState } from "react";
import type { GallerySample } from "./sample-payloads/types";

type SourceTab = "css" | "html" | "jsFunctions" | "jsExpressions";

const TABS: SourceTab[] = ["css", "html", "jsFunctions", "jsExpressions"];

/** 六欄位中的四個程式欄位原文；initialHeight 與 placeholderMessages 顯示在標題列 */
export function SourceTabs({ sample }: { sample: GallerySample }) {
  const [tab, setTab] = useState<SourceTab>("html");
  const source: Record<SourceTab, string> = {
    css: sample.css || "（空：靜態圖不需要額外樣式）",
    html: sample.html,
    jsFunctions: sample.jsFunctions ?? "（空：沒有行為）",
    jsExpressions: (sample.jsExpressions ?? []).join("\n") || "（空）",
  };
  return (
    <div className="gal-source">
      <div className="gal-source-head">
        <div className="gal-source-tabs" role="tablist" aria-label="payload 欄位">
          {TABS.map((item) => (
            <button
              key={item}
              type="button"
              role="tab"
              aria-selected={tab === item}
              onClick={() => setTab(item)}
            >
              {item}
            </button>
          ))}
        </div>
        <span className="gal-meta">
          initialHeight {sample.initialHeight}
          {sample.placeholderMessages && ` · placeholderMessages ${sample.placeholderMessages.length} 則`}
        </span>
      </div>
      <pre className="gal-source-body" role="tabpanel">
        <code>{source[tab]}</code>
      </pre>
    </div>
  );
}
