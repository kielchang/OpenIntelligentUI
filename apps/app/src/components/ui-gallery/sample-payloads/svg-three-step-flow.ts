import type { GallerySample } from "./types";

/**
 * svg-diagrams 技能文件「Example: Simple 3-Step Flow」的 SVG 原文，逐字複製。
 * 靜態圖表只走 html 欄位：樣式全在 SVG 呈現屬性上，不需要 css／js 通道。
 */
const FLOW_SVG = `
<svg width="100%" viewBox="0 0 680 288" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5"
            markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M2 1L8 5L2 9" fill="none" stroke="context-stroke"
            stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    </marker>
  </defs>

  <!-- Step 1 -->
  <rect x="230" y="20" width="220" height="56" rx="8"
        fill="#E1F5EE" stroke="#0F6E56" stroke-width="0.5"/>
  <text x="340" y="38" text-anchor="middle" dominant-baseline="central"
        font-size="14" font-weight="500" fill="#085041">User request</text>
  <text x="340" y="56" text-anchor="middle" dominant-baseline="central"
        font-size="12" fill="#0F6E56">HTTP POST /api/data</text>

  <!-- Arrow 1->2 -->
  <line x1="340" y1="76" x2="340" y2="100" stroke="#534AB7"
        stroke-width="1.5" marker-end="url(#arrow)"/>

  <!-- Step 2 -->
  <rect x="230" y="106" width="220" height="56" rx="8"
        fill="#EEEDFE" stroke="#534AB7" stroke-width="0.5"/>
  <text x="340" y="124" text-anchor="middle" dominant-baseline="central"
        font-size="14" font-weight="500" fill="#3C3489">Server processing</text>
  <text x="340" y="142" text-anchor="middle" dominant-baseline="central"
        font-size="12" fill="#534AB7">Validate and transform</text>

  <!-- Arrow 2->3 -->
  <line x1="340" y1="162" x2="340" y2="186" stroke="#854F0B"
        stroke-width="1.5" marker-end="url(#arrow)"/>

  <!-- Step 3 -->
  <rect x="230" y="192" width="220" height="56" rx="8"
        fill="#FAEEDA" stroke="#854F0B" stroke-width="0.5"/>
  <text x="340" y="210" text-anchor="middle" dominant-baseline="central"
        font-size="14" font-weight="500" fill="#633806">Database write</text>
  <text x="340" y="228" text-anchor="middle" dominant-baseline="central"
        font-size="12" fill="#854F0B">INSERT into table</text>
</svg>
`.trim();

export const SVG_FLOW_SAMPLE: GallerySample = {
  id: "skill-svg-three-step-flow",
  title: "SVG three-step flow",
  description:
    "svg-diagrams 技能文件裡的完整範例（Example: Simple 3-Step Flow），SVG 原文逐字複製：680 寬的 viewBox、兩行節點、箭頭 marker 與每個圖形的明確 fill／stroke。靜態圖表不需要 css 與 js。",
  provenance: "skill",
  visualization: "flowchart",
  initialHeight: 300,
  css: "",
  html: FLOW_SVG,
};
