import type { OpenGenUIContent } from "@/components/generative-ui/open-generative-ui/schema";

/** 範例來源：seed = 專案內建範本原文；skill = 技能文件裡的範例原文；reconstructed = 依技能規範重建 */
export type SampleProvenance = "seed" | "skill" | "reconstructed";

/** 沙箱 CSP 允許的外部來源；本機離線時這些範例會顯示自己的錯誤狀態 */
export type SampleNetwork = "esm.sh" | "jsdelivr" | "usgs";

/** 一筆生成式 UI 範例：六欄位 payload 加上展示用的中繼資料 */
export interface GallerySample {
  id: string;
  title: string;
  /** 繁體中文說明；reconstructed 的範例必須包含 RECONSTRUCTED_LABEL */
  description: string;
  provenance: SampleProvenance;
  /** Jev 視覺化型別（visualization_router.py），例如 calculator、static_diagram */
  visualization: string;
  /** 原始使用者提示（若有） */
  prompt?: string;
  initialHeight: number;
  placeholderMessages?: string[];
  css: string;
  html: string;
  jsFunctions?: string;
  jsExpressions?: string[];
  needsNetwork?: SampleNetwork[];
}

export const RECONSTRUCTED_LABEL = "依技能規範重建的示範，非代理實際輸出";

/** 把範例轉成渲染器的「完成態」content */
export function toContent(sample: GallerySample): OpenGenUIContent {
  return {
    initialHeight: sample.initialHeight,
    generating: false,
    css: sample.css,
    cssComplete: true,
    html: [sample.html],
    htmlComplete: true,
    jsFunctions: sample.jsFunctions,
    jsFunctionsComplete: true,
    jsExpressions: sample.jsExpressions ?? [],
    jsExpressionsComplete: true,
  };
}
