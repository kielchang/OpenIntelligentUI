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
