/** Lilac Mint：純文件型別。元件是 CSS 類別（.lm-*）加少量行為（window.LilacMint），沒有 React 匯出；Props 描述消費者要提供的標記與屬性。 */

/* ── 10 actions ── */

/**
 * Button：`<button class="lm-btn lm-btn--<variant> [lm-btn--sm] [lm-btn--icon]">`。
 * 圖示放 `svg.lm-btn__icon`（16px、currentColor、aria-hidden）；載入態放 `svg.lm-btn__spinner` 並設 `aria-busy="true"`。
 */
export interface ButtonProps {
  /** 變體：primary（ink）、secondary（邊框）、ghost（透明）、danger（高強度 danger）、brand（品牌漸層，一頁最多一顆）。 */
  variant: "primary" | "secondary" | "ghost" | "danger" | "brand";
  /** 尺寸：md 36px 高（預設）、sm 28px 高（加 `.lm-btn--sm`）。 */
  size?: "md" | "sm";
  /** 純圖示按鈕：加 `.lm-btn--icon` 成正方形，必須同時提供 `ariaLabel`。 */
  iconOnly?: boolean;
  /** 純圖示按鈕的可讀名稱（`aria-label`）。 */
  ariaLabel?: string;
  /** 停用：原生 `disabled`；視覺 `opacity: .5`、`cursor: not-allowed`。 */
  disabled?: boolean;
  /** 載入中：設 `aria-busy="true"`，並把文字改成進行式（「儲存中…」）；不要同時 `disabled`。 */
  busy?: boolean;
  /** 以連結呈現時用 `<a class="lm-btn" href>`；否則 `<button type="button">`。 */
  href?: string;
  /** 按鈕文字（繁體中文、動詞開頭）。 */
  children: string;
}

/**
 * SegmentedControl：`<div class="lm-seg" role="group" aria-label>` 內放多顆 `<button class="lm-seg__btn" aria-pressed>`。
 * 單選由消費者切換 `aria-pressed`（同組只有一顆為 true）；圖示放 `svg.lm-seg__icon`。
 */
export interface SegmentedControlProps {
  /** 群組的可讀名稱（`aria-label`），說明這組在切換什麼，例如「顯示範圍」。 */
  ariaLabel: string;
  /** 選項 2–5 個；`pressed` 為 true 的那顆套選中樣式。 */
  options: Array<{
    /** 顯示文字（四字以內）。 */
    label: string;
    /** 回傳給消費者的值。 */
    value: string;
    /** 是否為目前選中（對應 `aria-pressed="true"`）。 */
    pressed?: boolean;
    /** 16px inline SVG（aria-hidden），放在文字左側。 */
    icon?: string;
    /** 單顆停用（原生 `disabled`）。 */
    disabled?: boolean;
  }>;
  /** 整組停用：每顆都加 `disabled`。 */
  disabled?: boolean;
  /** 點擊後由消費者更新 `aria-pressed`；元件不保存狀態。 */
  onChange?: (value: string) => void;
}

/* ── 20 inputs ── */

/**
 * 所有欄位共用的容器：`<div class="lm-field [is-disabled]">` 內依序放
 * `label.lm-field__label`、控制項、`p.lm-field__help`、`p.lm-field__error`。
 * 說明與錯誤的 id 都要列進控制項的 `aria-describedby`。
 */
export interface FieldShellProps {
  /** 控制項的 id；`label[for]` 與 `aria-describedby` 都以它為基準（說明 `<id>-help`、錯誤 `<id>-err`）。 */
  id: string;
  /** 標籤文字。 */
  label: string;
  /** 必填：label 內加 `.lm-field__required` 星號（aria-hidden）與 `.lm-sr-only`「（必填）」，控制項加 `required`。 */
  required?: boolean;
  /** 一句說明，放 `.lm-field__help`。 */
  help?: string;
  /** 錯誤訊息：有值時控制項設 `aria-invalid="true"`，`.lm-field__error` 顯示圖示＋文字並加 `role="alert"`。 */
  error?: string;
  /** 停用：控制項 `disabled`，容器加 `.is-disabled` 讓標籤與說明同步變淡。 */
  disabled?: boolean;
}

/**
 * TextField：`FieldShellProps` + `<input class="lm-input">`；有前綴／後綴時以
 * `<div class="lm-input-group">` 包住 `span.lm-input-group__affix` 與 input。
 */
export interface TextFieldProps extends FieldShellProps {
  /** 原生型別；識別碼類（GPN、郵遞區號）用 text + `inputmode="numeric"`，不要用 number。 */
  type?: "text" | "email" | "tel" | "url" | "password";
  /** 格式範例（`name@example.invalid`），不能取代 label。 */
  placeholder?: string;
  /** 目前值。 */
  value?: string;
  /** 前綴槽文字（例如 `ZZ-`）；代碼型前綴加 `.lm-input-group__affix--mono`。有前綴時 input 需 `aria-label` 補完整名稱。 */
  prefix?: string;
  /** 後綴槽文字（例如「人」「元」）；以 `aria-describedby` 連到後綴 id 讓單位被唸出。 */
  suffix?: string;
}

/**
 * NumberField：`FieldShellProps` + `<input class="lm-input lm-input--number" type="number" inputmode="decimal">`。
 * 驗證用 `valueAsNumber` + `Number.isFinite` + min／max／step；結果放 `.lm-field__status[role="status"]`。
 */
export interface NumberFieldProps extends FieldShellProps {
  /** 目前值（數字）；空值以 `NaN` 表示，不得當 0。 */
  value?: number;
  /** 下限（含）。 */
  min?: number;
  /** 上限（含）。 */
  max?: number;
  /** 步進；整數欄位用 1。 */
  step?: number;
  /** 單位後綴（「人」「元」「%」），放 `.lm-input-group__affix`。 */
  unit?: string;
  /** 即時換算結果的文字；數字部分用 `<strong>`（等寬 500）。 */
  status?: string;
}

/**
 * Select：`FieldShellProps` + `<div class="lm-select"><select class="lm-select__native">…</select><svg class="lm-select__chevron"/></div>`。
 */
export interface SelectProps extends FieldShellProps {
  /** 選項；`value` 空字串的那筆是「請選擇」空值。 */
  options: Array<{ value: string; label: string; disabled?: boolean }>;
  /** 目前值；空字串代表未選。 */
  value?: string;
  /** 是否加「請選擇」空值選項（表單欄位要，篩選器通常不要）。 */
  placeholderOption?: boolean;
}

/**
 * CheckboxRadio：`<fieldset class="lm-choice-group [lm-choice-group--inline]"><legend class="lm-choice-group__legend">`
 * 內放多個 `<label class="lm-choice"><input class="lm-choice__input" type="checkbox|radio"><span>文字</span><span class="lm-choice__desc">說明</span></label>`。
 */
export interface CheckboxRadioProps {
  /** `legend` 文字：這組選項回答的問題。 */
  legend: string;
  /** checkbox 多選或 radio 單選（radio 同組共用 `name`）。 */
  type: "checkbox" | "radio";
  /** radio 的 `name`；checkbox 可省略。 */
  name?: string;
  /** 排列：vertical（預設，可帶說明）或 inline（短選項一列）。 */
  layout?: "vertical" | "inline";
  /** 選項清單。 */
  options: Array<{
    value: string;
    label: string;
    /** 一句說明，放 `.lm-choice__desc`。 */
    description?: string;
    checked?: boolean;
    /** 只對 checkbox 有效：以 JS 設 `input.indeterminate = true`，由子項狀態推導。 */
    indeterminate?: boolean;
    disabled?: boolean;
  }>;
}

/**
 * RangeSlider：`<div class="lm-field lm-range [is-disabled]">` 內放 `label.lm-field__label`、
 * `.lm-range__row`（`input.lm-range__input[type=range]` + `output.lm-range__output[for]`）、`.lm-range__ticks`（兩端刻度）。
 */
export interface RangeSliderProps {
  /** 滑桿 id；`label[for]` 與 `output[for]` 都指向它。 */
  id: string;
  label: string;
  min: number;
  max: number;
  step?: number;
  value: number;
  /** 兩端刻度文字（例如「1 層」「8 層」），`aria-hidden`。 */
  ticks?: [string, string];
  /** 值的語意文字（`aria-valuetext`），例如「3 層」。 */
  valueText?: string;
  /** 即時結果說明，放 `.lm-field__help`，以 `input` 事件更新。 */
  help?: string;
  disabled?: boolean;
}

/**
 * Textarea：`FieldShellProps` + `<textarea class="lm-textarea">`；有上限時在 `.lm-field__meta` 放 `.lm-field__count`。
 */
export interface TextareaProps extends FieldShellProps {
  value?: string;
  placeholder?: string;
  /** 初始可見列數（最小高度仍為 96px）。 */
  rows?: number;
  /** 字數上限；以 `Array.from(value).length` 計算，超出時計數加 `.is-over` 並進入錯誤態，不用 `maxlength` 截斷。 */
  maxLength?: number;
}

/**
 * SearchBox：`<div class="lm-search [has-value]">` 內放 `svg.lm-search__icon`、`input.lm-search__input[type=search]`、
 * `button.lm-search__clear[hidden]`、`kbd.lm-search__kbd`；下方 `p.lm-search__status[role="status"]`。
 */
export interface SearchBoxProps {
  /** input id；`aria-describedby` 指向 status 的 id。 */
  id: string;
  /** 工具列沒有可見標籤，必填 `aria-label`。 */
  ariaLabel: string;
  placeholder?: string;
  value?: string;
  /** 是否顯示 `/` 快捷鍵 chip（一頁只有一個主要搜尋框時才開）。 */
  shortcutHint?: boolean;
  /** status 文字：「找到 N 筆」或「找不到符合『…』的人員或單位」。 */
  status?: string;
  disabled?: boolean;
  /** 輸入時由消費者更新 `.has-value`、清除鈕 `hidden` 與 status。 */
  onInput?: (value: string) => void;
  /** 清除鈕按下：清空值並把焦點放回 input。 */
  onClear?: () => void;
}

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

/* ── 40 feedback：Alert、ErrorBanner、Toast、EmptyState、LoadingPlaceholder、Skeleton ───────── */
/* 純文件型別：描述消費者要寫的標記、class 與屬性；不編譯、不對應任何框架元件。 */

/** 語意色（Alert、Toast 共用） */
export type LmTone = "info" | "success" | "warning" | "danger";

/**
 * Alert — 頁內提示區塊。
 * 標記：`div.lm-alert.lm-alert--<tone>[.lm-alert--high][role]` > `svg[aria-hidden]`（16px 語意圖示）+
 * `div.lm-alert__body`（`strong.lm-alert__title` + `p.lm-alert__text` + 可選 `a.lm-alert__action`）+ 可選 `button.lm-alert__close[aria-label="關閉"]`。
 * `role`：danger 用 `alert`，其餘 `status`。
 */
export interface AlertProps {
  tone: LmTone;
  /** 高強度（實色底反白字）：只給 modal／critical；合規建議永遠低強度 info */
  high?: boolean;
  title: string;
  /** 內文；合規建議必須含「需法務確認」 */
  text: string;
  /** 可選動作連結（最多一個） */
  action?: { label: string; href: string };
  /** 是否渲染關閉鈕；modal 內的通常不給 */
  dismissible?: boolean;
}

/**
 * ErrorBanner — 聊天頁回答失敗的橫幅。
 * 標記：`div.lm-error-banner[role="alert"][aria-busy?]` > `svg.lm-error-banner__icon` + `p.lm-error-banner__msg` +
 * `span.lm-error-banner__actions`（`button.lm-error-banner__btn`「重試」+ `button.lm-error-banner__btn.lm-error-banner__btn--secondary`「開啟 API 金鑰設定」）。
 * busy：重試鈕內放 `span.lm-error-banner__spinner[aria-hidden]`、文字「重試中」、兩顆按鈕 `disabled`、重試鈕與容器 `aria-busy="true"`。
 */
export interface ErrorBannerProps {
  /** 錯誤訊息（一句，說明原因與可做的事） */
  message: string;
  /** 重試進行中 */
  busy?: boolean;
  /** 重試鈕文字；預設「重試」，busy 時「重試中」 */
  retryLabel?: string;
  /** 次要按鈕文字；預設「開啟 API 金鑰設定」；傳 `null` 不渲染 */
  secondaryLabel?: string | null;
}

/**
 * Toast — 短暫回饋（樣式在 00-base.css，行為在 bundle.js）。
 * 觸發：`LilacMint.toast(message, tone)` 或任何元素加 `data-lm-toast="訊息" data-lm-tone="<tone>"`。
 * 區域由 bundle.js 自建：`#lm-toast-region.lm-toast-region[role=status][aria-live=polite]`；
 * 文件展示可用 `.lm-toast-region.lm-toast-region--static` 靜態擺放 `.lm-toast.lm-toast--<tone>`。
 */
export interface ToastProps {
  /** 一句話，不超過一行；不放連結或按鈕 */
  message: string;
  tone?: LmTone;
  /** 固定 4000ms 自清、同時最多 3 則（bundle.js 決定，不可覆寫） */
  readonly durationMs?: 4000;
}

/**
 * EmptyState — 置中空狀態。
 * 標記：`div.lm-empty` > `svg.lm-empty__icon[aria-hidden]`（48px）+ `h2|h3.lm-empty__title` + `p.lm-empty__text` +
 * 可選 `div.lm-empty__actions`（`button.lm-empty__btn` 主要 + `a.lm-empty__link` 次要）。
 */
export interface EmptyStateProps {
  /** 情境：決定圖示與預設文案；`forbidden` 不渲染動作 */
  variant: "empty" | "filtered" | "forbidden";
  title: string;
  /** 說明：為什麼空 + 可以做什麼 */
  text: string;
  /** 主要動作（`empty`：新增草稿；`filtered`：清除篩選） */
  primary?: { label: string };
  /** 次要連結（例如「了解匯入流程」） */
  secondary?: { label: string; href: string };
  /** 標題層級，依頁面結構決定 */
  headingLevel?: 2 | 3;
}

/**
 * LoadingPlaceholder — 生成／讀取中的佔位框。
 * 標記：`div.lm-loading[.lm-loading--compact][role="status"][aria-busy="true"][aria-live="polite"]` >
 * `span.lm-loading__spinner[aria-hidden]` + `span.lm-loading__phrase[id]`；
 * 啟動輪播：`LilacMint.rotate(document.getElementById(id), phrases, 1800)`，尾端「...」由 CSS `::after` 加。
 */
export interface LoadingPlaceholderProps {
  /** 輪播短句；英文可直接用來源的 LOADING_PHRASES，中文用「正在…」句型 */
  phrases: string[];
  /** 輪播間隔，預設 1800ms */
  intervalMs?: number;
  /** `.lm-loading--compact`：高 50px；預設 120px */
  compact?: boolean;
}

/**
 * Skeleton — 載入骨架。
 * 色塊：`span.lm-skeleton[.lm-skeleton--heading|--circle][.lm-skeleton--long|--medium|--short]`；
 * 組合：`div.lm-skeleton-group`（直排）、`div.lm-skeleton-row`（頭像＋群組）、`div.lm-skeleton-table`（4 欄 grid，第一列用 `.lm-skeleton--head`）。
 * 容器 `aria-hidden="true"`，旁邊放 `span.lm-sr-only`「載入中」。
 */
export interface SkeletonProps {
  /** 形狀：`text`（標題 + 數行）、`avatar`（圓 + 兩行）、`table`（表頭 + N 列 × 4 欄） */
  shape: "text" | "avatar" | "table";
  /** `text` 的行數或 `table` 的列數；預設 3／4 */
  lines?: number;
  /** 螢幕閱讀器文字，預設「載入中」 */
  srLabel?: string;
}

/* ── 50 layout ── 純文件型別：描述每個元件的資料與行為，不編譯、不綁框架 */

/** 主題選項（AppHeader 的三顆 aria-pressed 按鈕） */
export type ThemeChoice = "light" | "dark" | "system";

/** AppHeader：模組頁頂端的應用標頭（純文字字標、模組名、導覽、環境徽章、使用者、主題切換） */
export interface AppHeaderProps {
  /** 模組名稱，顯示在字標「DOOPING」右側的分隔線後，例如「組織與人員」 */
  module: string;
  /** 字標的連結目的地；省略則為模組首頁 */
  homeHref?: string;
  /** 主導覽連結；current 為 true 的那一筆加 `aria-current="page"`（只能有一筆） */
  nav: Array<{ label: string; href: string; current?: boolean }>;
  /** 環境徽章文字（例如「測試環境」）；正式環境省略，不顯示徽章 */
  environment?: string;
  /** 使用者按鈕：顯示名與頭像縮寫（一個字） */
  user: { name: string; initial: string };
  /** 使用者按鈕按下（開選單） */
  onUserMenu?: () => void;
  /** 目前主題；對應的按鈕 `aria-pressed="true"` */
  theme: ThemeChoice;
  /** 主題切換 */
  onThemeChange?: (theme: ThemeChoice) => void;
}

/** Card：相關內容的表面容器 */
export interface CardProps {
  /** 外觀變體：default（預設）、compact（padding space-3、shadow-compact）、glass（只用在歡迎／品牌區） */
  variant?: "default" | "compact" | "glass";
  /** 給了 href 就輸出 `<a class="lm-card">`，整張卡是一個連結；不可再放其他可點元素 */
  href?: string;
  /** 標題（subheading 15/600）；有標頭分區時放在 `__header` */
  title?: string;
  /** 標題下的 meta（caption、text-secondary） */
  meta?: string;
  /** 標頭右側的動作（有則輸出 `lm-card--sectioned` 的 `__header`） */
  headerAction?: { label: string; onClick: () => void };
  /** 頁尾動作列（有則輸出 `__footer`）；primary 的那顆為 ink 按鈕 */
  footerActions?: Array<{ label: string; onClick: () => void; primary?: boolean }>;
  /** 內容 */
  children?: unknown;
}

/** Drawer：右側 420px 抽屜，看細節或編輯一筆 */
export interface DrawerProps {
  /** 容器 id；`data-lm-drawer-open="id"` 與 `LilacMint.drawer.open(id)` 用它 */
  id: string;
  /** 是否開啟（切 `.is-open` 與 `aria-hidden`） */
  open: boolean;
  /** 關閉要求（關閉鈕、遮罩、Esc）；呼叫端負責把焦點還給開啟按鈕 */
  onClose: () => void;
  /** 標題（`aria-labelledby` 的目標） */
  title: string;
  /** 副標（例如「ZZ-000123 · 在職」） */
  subtitle?: string;
  /** 頁尾動作列；primary 的那顆為 ink 按鈕 */
  actions?: Array<{ label: string; onClick: () => void; primary?: boolean; disabled?: boolean }>;
  /** 可捲動內容 */
  children?: unknown;
  /** 內嵌展示（static、固定高 260px）；只用於文件與預覽 */
  inline?: boolean;
}

/** Dialog：原生 `<dialog>` 的確認／短表單對話框 */
export interface DialogProps {
  /** `<dialog id>`；`data-lm-dialog-open="id"` 與 `LilacMint.dialog.open(id)` 用它 */
  id: string;
  /** 標題，要說明動作與對象（「取消草稿 D-0042？」） */
  title: string;
  /** 說明文字（text-secondary 13px）；可含 `<strong>` 強調 */
  description?: string;
  /** 破壞性動作：確認鈕改為 danger 高強度、標題旁顯示 danger 圖示、預設焦點放在取消 */
  destructive?: boolean;
  /** 取消鈕文字（ghost）；預設「取消」 */
  cancelLabel?: string;
  /** 確認鈕文字（ink 或 danger） */
  confirmLabel: string;
  /** 確認 */
  onConfirm: () => void;
  /** 取消或 Esc */
  onCancel?: () => void;
  /** 確認鈕停用（例如短表單尚未填完） */
  confirmDisabled?: boolean;
  /** 短表單內容（放在說明與動作列之間） */
  children?: unknown;
}

/** Tabs：底線式分頁 */
export interface TabsProps {
  /** tab 清單；id 用來產生 `aria-controls`／`aria-labelledby` */
  tabs: Array<{
    id: string;
    label: string;
    /** 計數 chip（只放切換前就該知道的數字） */
    count?: number;
    disabled?: boolean;
  }>;
  /** 目前選中的 tab id */
  selectedId: string;
  /** 切換（click 或鍵盤 ← → Home End） */
  onChange?: (id: string) => void;
  /** tablist 的 `aria-label`（這組分頁是什麼） */
  label: string;
  /** 每個 tab 的面板內容，以 tab id 為鍵 */
  panels: Record<string, unknown>;
}

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
