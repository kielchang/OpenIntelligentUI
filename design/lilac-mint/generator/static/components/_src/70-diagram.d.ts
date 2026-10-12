/* ── 70 diagram ── 純文件型別 */

/** 九色階名稱：`.c-<name>`，對應 `--ramp-<name>-fill／-stroke／-text／-text-small` */
export type DiagramRamp = "purple" | "teal" | "coral" | "pink" | "gray" | "blue" | "green" | "amber" | "red";

/** SVG 內可用的 class：形狀、連線與文字 */
export type DiagramClass =
  /** 方塊群組：子元素 rect／circle／ellipse 取 sandbox 底色與淡框 */
  | "box"
  /** 可點節點：cursor pointer，hover opacity 0.8 */
  | "node"
  /** 箭頭線：currentColor、1.5px；配合 `<marker>` 內的 `.arr-head` */
  | "arr"
  /** marker 內的箭頭路徑：currentColor、不填色 */
  | "arr-head"
  /** 註記虛線：sandbox-svg-t、1px、4 4 */
  | "leader"
  /** 文字 13px/400 */
  | "t"
  /** 小字 12px/400（sandbox-svg-s） */
  | "ts"
  /** 標題 14px/600 */
  | "th";

/** DiagramClasses：把一段 inline SVG 放進 `.lm-diagram`，形狀與文字只寫 class、不寫色碼 */
export interface DiagramClassesProps {
  /** 圖解標題（容器內 13px/600） */
  title?: string;
  /** inline SVG 字串；根元素要有 `viewBox` 與 `role="img" aria-label`，寬度跟隨容器 */
  svg: string;
  /** 圖下 caption（12px，sandbox-text-secondary）；說明色階表意 */
  caption?: string;
  /** 這張圖用到的色階與各自的意義（文件化用；顏色本身不表意） */
  legend?: Array<{ ramp: DiagramRamp; meaning: string }>;
  /** `<marker>` 的 id；`.arr` 的 `marker-end="url(#id)"` 用它（預設 "lm-arrow"） */
  markerId?: string;
}
