/* ── 60 charts ── 純文件型別 */

/** 分類色索引：`--chart-1`…`--chart-7`，順序固定、不循環 */
export type ChartSeriesIndex = 1 | 2 | 3 | 4 | 5 | 6 | 7;

/** ChartPalette：分類色盤長條圖與基礎元素（軸、網格、圖例、tooltip） */
export interface ChartPaletteProps {
  /** 圖表標題（13px/600） */
  title: string;
  /** 類別依資料順序排列；第 i 筆用 `--chart-{i+1}`，最多 7 筆 */
  categories: Array<{ label: string; value: number }>;
  /** 只強調這一個索引（0 起算），其餘退為 `--surface-quaternary` + 1px `--border-default`；類別超過 7 個時必填 */
  highlightIndex?: number;
  /** 在長條上標數值（預設 true；highlight 模式下只標被強調的那筆） */
  showValues?: boolean;
  /** 靜態 tooltip（文件展示用；實際互動由圖表函式庫提供，樣式同 `.lm-chart__tooltip`） */
  tooltip?: { index: number; text: string };
  /** y 軸刻度（例如 [0, 20, 40, 60, 80]）；省略則依最大值取整 */
  ticks?: number[];
  /** 數值單位，寫進 caption（「單位：人」） */
  unit?: string;
  /** caption；示範資料固定寫「示意資料」 */
  caption?: string;
  /** SVG 的 `aria-label`；省略則由標題與各類別數值組成 */
  ariaLabel?: string;
}

/** 連續或發散色階的階數 */
export type ScaleStep = 1 | 2 | 3 | 4 | 5 | 6 | 7;

/** SequentialDiverging：連續（scale-mint）或發散（scale-diverge）色階，含色階條、熱力圖與偏差條 */
export interface SequentialDivergingProps {
  /** sequential：`--scale-mint-1…7` 淺→深，單一度量；diverging：`--scale-diverge-1…7`，4 為基準／零 */
  kind: "sequential" | "diverging";
  /** 值域；sequential 為 [min, max]，diverging 為 [−range, +range]（中點固定為 0 或 baseline） */
  domain: [number, number];
  /** diverging 的基準值（預設 0）；中點格標示這個值 */
  baseline?: number;
  /** 階數標籤；省略則 sequential 標 1…7、diverging 標 −3…0…+3 */
  stepLabels?: [string, string, string, string, string, string, string];
  /** 兩端的文字說明（「低／高」、「低於基準／高於基準」） */
  ends?: { low: string; high: string };
  /** 熱力圖資料（只在 sequential）：rows × cols 的數值；格子只帶顏色，數值放 title 與同一份表格 */
  heatmap?: { rows: string[]; cols: string[]; values: number[][]; unit?: string };
  /** 偏差條資料（只在 diverging）：每列一個相對基準的偏差 */
  deviations?: Array<{ label: string; value: number }>;
  /** 把數值對應到階數；省略則在 domain 內線性等分 */
  stepOf?: (value: number) => ScaleStep;
  /** 標題（13px/600） */
  title?: string;
}
