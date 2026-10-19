"use client";

import { STAGE_ORDER, type ReplayStage } from "./streaming-replay";

const STAGE_LABEL: Record<ReplayStage, string> = {
  idle: "尚未開始",
  placeholder: "placeholder（LOADING_PHRASES）",
  css: "css 完成 → 可顯示",
  html: "html 串流預覽（Idiomorph）",
  final: "htmlComplete → 最終沙箱",
  functions: "jsFunctions 注入",
  expressions: "jsExpressions 依序執行",
  done: "generating:false → 可匯出",
};

interface ReplayControlsProps {
  stage: ReplayStage;
  onReplay: () => void;
  onFinish: () => void;
}

/** 重播控制與六欄位對應的渲染階段指示條 */
export function ReplayControls({ stage, onReplay, onFinish }: ReplayControlsProps) {
  const currentIndex = STAGE_ORDER.indexOf(stage);
  return (
    <div className="gal-replay">
      <ol className="gal-stage-track" aria-label="渲染階段">
        {STAGE_ORDER.map((item, index) => {
          const status =
            currentIndex === -1 ? "pending" : index < currentIndex ? "done" : index === currentIndex ? "active" : "pending";
          return (
            <li key={item} data-status={status} aria-current={status === "active" ? "step" : undefined}>
              {STAGE_LABEL[item]}
            </li>
          );
        })}
      </ol>
      <div className="gal-replay-actions">
        <button type="button" className="gal-btn" onClick={onReplay}>
          重播串流
        </button>
        <button type="button" className="gal-btn" onClick={onFinish} disabled={stage === "done"}>
          立即完成
        </button>
      </div>
    </div>
  );
}
