/* ── 30 data：Toolbar、DataTable、Pager、StatusBadge、Tag、KeyValueList ───────────────── */
/* 純文件型別：描述消費者要寫的標記、class 與屬性；不編譯、不對應任何框架元件。 */

/** DOOPING 狀態詞彙（StatusBadge 與 DataTable 狀態欄共用） */
export type LmStatusKey =
  | "draft" | "validated" | "scheduled" | "applied" | "cancelled"
  | "active" | "frozen" | "inactive" | "merged" | "contingent";

/**
 * Toolbar — 列表頁頂端的篩選與動作列。
 * 標記：`<div class="lm-toolbar" role="toolbar" aria-label>` 內依序放
 * `label.lm-toolbar__filter`（含 `select.lm-toolbar__select` 或 `input.lm-toolbar__input`）、
 * `span.lm-toolbar__sep`（aria-hidden）、`label.lm-toolbar__search`（圖示 + `.lm-sr-only` + `input[type=search]`）、
 * `span.lm-toolbar__status[role=status]`、`span.lm-toolbar__actions`（`button.lm-toolbar__btn`，主要加 `--primary`）。
 */
export interface ToolbarProps {
  /** `aria-label`：這條工具列管的是哪個清單（例如「人員名冊篩選」） */
  label: string;
  /** 篩選控制項：每個是一個 `label.lm-toolbar__filter`，文字在前、控制項在後 */
  filters: Array<{ label: string; control: "select" | "date" | "text"; value?: string; options?: string[] }>;
  /** 搜尋框 placeholder；同時要放一段 `.lm-sr-only` 文字當標籤 */
  searchPlaceholder?: string;
  /** 結果槽文字（`role="status"`），例如「128 筆 · 生效日 2026-10-01」；更新文字即會被朗讀 */
  status?: string;
  /** 動作按鈕：最多兩顆；`primary: true` 的加 `.lm-toolbar__btn--primary`（ink） */
  actions?: Array<{ label: string; primary?: boolean; disabled?: boolean; icon?: string }>;
  /** `.lm-toolbar--compact`：gap 12px、內距 6px 12px，給抽屜或側欄內的小工具列 */
  compact?: boolean;
}

/**
 * DataTable — 標準資料表格。
 * 標記：`div.lm-table-wrap`（可加 `--scroll` 固定高度）> `table.lm-table` > `caption` + `thead` + `tbody`。
 * 可排序表頭：`th[aria-sort="ascending|descending|none"] > button.lm-table__sort`（內含上下箭頭 SVG，path 分別標 `.lm-table__arrow-up/-down`）。
 * 選取欄：`th.lm-table__check > input[type=checkbox][aria-label="全選本頁"]`；列 `td.lm-table__check > input[aria-label="選取 <GPN>"]`，選中列加 `tr.is-selected`。
 * 列狀態：`tr.is-contingent`（姓名斜體 + `.lm-table__tag`「派遣」）、`tr.is-frozen`（文字 `--text-secondary` + 鎖頭圖示）。
 * 欄 class：`.lm-table__mono`（GPN，不換行）、`.lm-table__range`（期間，日期包 `<time>`，只在逗號後換行）、`.lm-table__num`（右對齊 mono）、`.lm-table__name`（不換行）、
 * `.lm-table__cell`（圖示 + 文字的 inline-flex；加 `--wrap` 讓 tag 掉到下一行）、`.lm-table__badge.lm-table__badge--<key>`（狀態徽章）。
 */
export interface DataTableProps {
  /** `caption` 文字：資料範圍 + 「示意資料」+ 已選筆數 */
  caption: string;
  /** 欄定義：`sortable` 的欄輸出 `th[aria-sort]`；`align: "num"` 加 `.lm-table__num` */
  columns: Array<{ key: string; label: string; sortable?: boolean; sort?: "ascending" | "descending" | "none"; align?: "text" | "num" }>;
  /** 列資料：`status` 用 DOOPING 詞彙；`selected`／`contingent`／`frozen` 對應 `.is-*` class */
  rows: Array<{
    gpn: string;
    name: string;
    unit: string;
    position: string;
    /** `[from, to)` 字串；`to` 可為 `∞` */
    period: string;
    status: LmStatusKey;
    fte: string;
    selected?: boolean;
    contingent?: boolean;
    frozen?: boolean;
  }>;
  /** 是否渲染第一欄 checkbox（批次操作需要） */
  selectable?: boolean;
  /** `.lm-table-wrap--scroll`：固定 360px 高、表頭 sticky */
  scroll?: boolean;
}

/**
 * Pager — 表格底部分頁列。
 * 標記：`nav.lm-pager[aria-label="分頁"]` > `label.lm-pager__size`（含 `select.lm-pager__select`）+ `span.lm-pager__status[role=status]` +
 * `span.lm-pager__nav`（`button.lm-pager__btn`：上一頁、頁碼（當前 `aria-current="page"`）、`span.lm-pager__ellipsis[aria-hidden]`、下一頁）。
 */
export interface PagerProps {
  /** 每頁筆數與可選值 */
  pageSize: number;
  pageSizeOptions?: number[];
  /** 目前頁（從 1 起）與總頁數；第一頁的上一頁、最後一頁的下一頁要 `disabled` */
  page: number;
  pageCount: number;
  /** 總筆數；狀態文字格式「第 {from}–{to} 筆，共 {total} 筆」 */
  total: number;
  /** 顯示的頁碼按鈕（省略處放 `.lm-pager__ellipsis`） */
  visiblePages?: number[];
}

/**
 * StatusBadge — DOOPING 狀態徽章。
 * 標記：`span.lm-badge.lm-badge--<key>`（可加 `.lm-badge--sm`）> `svg[aria-hidden]` + 中文標籤 + 可選 `<code>英文鍵</code>`。
 * 色規則：`draft/frozen/inactive` 灰、`validated/merged` info、`scheduled` warning、`applied/active` success、`cancelled` danger、`contingent` lilac。
 */
export interface StatusBadgeProps {
  /** 狀態鍵，決定 modifier、顏色與圖示 */
  status: LmStatusKey;
  /** 中文標籤（草稿／已驗證／已排程／已套用／已取消／有效／凍結／離職／已合併／派遣） */
  label: string;
  /** 是否在標籤後顯示 `<code>` 英文鍵（工程與對帳畫面） */
  showKey?: boolean;
  /** 尺寸：md 預設；sm 加 `.lm-badge--sm` */
  size?: "sm" | "md";
}

/**
 * Tag — 標籤家族。
 * 一般：`span.lm-tag`；計數：內含 `span.lm-tag__count`；品牌：`.lm-tag--brand`；
 * 可移除：內含 `button.lm-tag__remove[aria-label="移除"]`（× SVG）；
 * 篩選 chip：`button.lm-chip[aria-pressed]`，內含 `svg.lm-chip__check`（選中才顯示），一組外層 `role="group" aria-label`。
 */
export interface TagProps {
  label: string;
  /** `"tag"` 靜態標籤（可加 count／removable／brand）；`"chip"` 可切換的 `button[aria-pressed]` */
  kind?: "tag" | "chip";
  /** 右側計數小圓 */
  count?: number;
  /** `.lm-tag--brand`：lilac 底 + on-brand 字 */
  brand?: boolean;
  /** 渲染 `.lm-tag__remove`；`removeLabel` 預設「移除」，建議「移除 {label}」 */
  removable?: boolean;
  removeLabel?: string;
  /** chip 專用：`aria-pressed` 初值與 disabled */
  pressed?: boolean;
  disabled?: boolean;
}

/**
 * KeyValueList — `<dl>` 兩欄描述清單。
 * 標記：`dl.lm-kv`（可加 `.lm-kv--dense`）> 交替的 `dt`／`dd`；分組標題是 `dt.lm-kv__group`。
 * 值 class：`.lm-kv__mono`（GPN、uuid 前 8 碼、期間、FTE）、`a.lm-kv__link`、`.lm-kv__empty`（顯示「—」）、`.lm-kv__multi`（保留換行）。
 */
export interface KeyValueListProps {
  /** 群組：每個群組一個 `dt.lm-kv__group` 加其後的配對；不需分組時只給一個群組且 `title` 留空 */
  groups: Array<{
    title?: string;
    items: Array<{
      label: string;
      /** 空值傳 `null`，會輸出 `.lm-kv__empty`「—」 */
      value: string | null;
      /** `"mono"`、`"link"`（需 `href`）、`"multi"`（`white-space: pre-line`） */
      format?: "text" | "mono" | "link" | "multi";
      href?: string;
      /** 顯示截斷值（如 uuid 前 8 碼）時把完整值放這裡，會輸出到 `title` */
      fullValue?: string;
    }>;
  }>;
  /** `.lm-kv--dense`：一列一組、6px 上下內距、列間 1px `--border-subtle` */
  dense?: boolean;
}
