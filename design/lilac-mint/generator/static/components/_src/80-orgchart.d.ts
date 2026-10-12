/* ── 80 orgchart ── 純文件型別 */

/** 節點狀態：normal 一般、vacant 空缺（職位 open 無占用者）、frozen 凍結（單位或職位 frozen） */
export type OrgNodeState = "normal" | "vacant" | "frozen";

/** OrgChartNode：組織圖上的一個節點卡（純 HTML/CSS；React Flow 自訂節點可直接套同一組 class） */
export interface OrgChartNodeProps {
  /** 姓名；空缺時傳「空缺」 */
  name: string;
  /** 職稱（body-small） */
  title: string;
  /** 單位（caption，text-secondary）；單位節點本身可省略 */
  unit?: string;
  /** 業務編號（GPN 或 code），寫進 `data-code` 供搜尋與高亮；不是鍵 */
  code?: string;
  /** 主管標記：皇冠圖示 + 「主管」 */
  isManager?: boolean;
  /** 派遣／約聘（contingent）計數；>0 才顯示「派遣 N」chip（`--color-lilac` + `--on-brand`） */
  contingentCount?: number;
  /** 直屬（含折疊時隱藏的後代）人數；>0 才顯示折疊鈕 */
  directReports?: number;
  /** 折疊狀態：true 顯示「+N」、false 顯示「−」；對應 `aria-expanded` 的反向 */
  collapsed?: boolean;
  /** 折疊鈕按下（只回報意圖；折疊狀態由圖的 state 持有） */
  onToggle?: () => void;
  /** 資料狀態：vacant 加 `.is-vacant`（虛線框、surface-secondary、「空缺職位」標籤）、frozen 加 `.is-frozen`（次要文字、鎖圖示、「凍結，不可指派」） */
  state?: OrgNodeState;
  /** 搜尋命中：加 `.is-highlighted`（2px `--focus-ring` 外框） */
  highlighted?: boolean;
  /** 草稿變更中的節點：加 `.is-draft`（warning 框、左上角「草稿」小標） */
  draft?: boolean;
  /** 這個節點對目前父節點是虛線匯報：加 `.lm-org-node--dotted`（虛線框、「虛線匯報」標籤），接線亦為虛線 */
  dotted?: boolean;
}

/** 連線語意：實線＝正式匯報（契約函式推導），虛線＝虛線匯報（dottedTo） */
export interface OrgChartTreeProps {
  /** 根節點 */
  root: OrgChartNodeProps;
  /** 直屬子節點；dotted 為 true 的子節點接線為虛線 */
  children: OrgChartNodeProps[];
  /** ≤560px 時改為左側軌道的直列（預設 true） */
  stackOnNarrow?: boolean;
}
