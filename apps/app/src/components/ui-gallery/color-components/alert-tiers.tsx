"use client";

import { contrastRatio, formatRatio, parseColor, passesWcag } from "../color/color-math";

export interface SemanticSet {
  role: string;
  bg: string;
  text: string;
  border: string;
}

const ICONS: Record<string, string> = {
  info: "M12 16v-4m0-4h.01M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0z",
  success: "M20 6 9 17l-5-5",
  warning: "M12 9v4m0 4h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z",
  danger: "M18 6 6 18M6 6l12 12",
};

function ratioBadge(fg: string, bg: string) {
  const a = parseColor(fg);
  const b = parseColor(bg);
  if (!a || !b) return null;
  const ratio = contrastRatio(a, b);
  const pass = passesWcag(ratio, "normal");
  return (
    <span className="gal-badge" data-state={pass ? "pass" : "fail"}>
      {formatRatio(ratio)} {pass ? "AA" : "未達 4.5"}
    </span>
  );
}

/** 同一組語意色的兩種強度：low-contrast tint（專案現有）與 high-contrast 實色（示範補齊） */
export function AlertTiers({ sets, surface }: { sets: SemanticSet[]; surface: string }) {
  return (
    <div className="gal-grid gal-grid--two">
      {sets.map((set) => (
        <div key={set.role} className="gal-alert-tier">
          <div className="gal-family-head">
            <h4>{set.role}</h4>
            <span className="gal-meta">bg {set.bg} · text {set.text} · border {set.border}</span>
          </div>
          <div className="gal-alert" style={{ background: set.bg, color: set.text, borderLeft: `5px solid ${set.border}`, border: `1px solid ${set.border}`, borderLeftWidth: 5 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d={ICONS[set.role] ?? ICONS.info} />
            </svg>
            <div>
              <strong>Low-contrast（專案現有 token）</strong>
              <span>淡底 + 左 5px 邊框 + icon + 同色系深字：日常提示。</span>
              <div style={{ marginTop: 6 }}>{ratioBadge(set.text, set.bg)}</div>
            </div>
          </div>
          <div className="gal-alert" style={{ background: set.text, color: "#ffffff" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d={ICONS[set.role] ?? ICONS.info} />
            </svg>
            <div>
              <strong>High-contrast（示範：專案缺這一層）</strong>
              <span>以 text 色當底、反白字：只給阻斷式 modal／critical。</span>
              <div style={{ marginTop: 6 }}>{ratioBadge("#ffffff", set.text)}</div>
            </div>
          </div>
          <span className="gal-meta">
            邊框對頁面底色（{surface}）非文字 3:1：
            {(() => {
              const a = parseColor(set.border);
              const b = parseColor(surface);
              if (!a || !b) return "—";
              const ratio = contrastRatio(a, b);
              return `${formatRatio(ratio)} ${passesWcag(ratio, "ui") ? "PASS" : "FAIL"}`;
            })()}
          </span>
        </div>
      ))}
    </div>
  );
}
