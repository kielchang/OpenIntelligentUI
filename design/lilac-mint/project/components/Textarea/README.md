# Textarea
多行文字輸入欄位，含標籤、說明、即時字數計數與超出上限的錯誤態；給異動原因、備註、合規說明等要寫一段話的欄位用。

## 何時用
- 內容可能超過一行：異動原因、稽核備註、例外說明。
- 有字數上限時一定顯示 `.lm-field__count`（「42 / 80」），超出就轉錯誤，不要用 `maxlength` 默默截斷。
- 內容由系統產生、只供閱讀時用停用態，不要改成純文字（保留可選取與捲動）。

## 不要用
- 一行寫得完的用 TextField。
- 要格式化文字（粗體、清單）：本元件只處理純文字。
- 不要用它顯示程式碼或日誌；那些是唯讀區塊，不是輸入。

## 狀態
- 預設：`.lm-textarea`，`min-height: 96px`、`resize: vertical`、14px/1.5、padding 8px 12px，外框與底同 TextField。
- hover／focus：邊框 `--border-hover`；focus-visible 焦點環。
- 計數：`.lm-field__count` 用 `--font-mono` 12px、`--text-secondary`、tabular-nums；超出時加 `.is-over` 變 `--sandbox-text-danger` 500。
- 錯誤：textarea `aria-invalid="true"` + `--sandbox-border-danger`；`.lm-field__error` 寫出超出幾字與上限。
- 停用：`disabled`，`opacity: .5`、底 `--surface-tertiary`、`resize: none`。
- 字數以 `Array.from(value).length` 計算，避免 emoji 與代理對被算成兩字。

## 無障礙
- `<label for>` 必備；`aria-describedby` 同時指向說明與錯誤段落。
- 計數元素 `aria-live="polite"`，錯誤段落 `role="alert"`。
- 必填以 `required` + 視覺星號 + `.lm-sr-only` 的「（必填）」。
- 錯誤以邊框色＋圖示＋文字＋計數變色表示。

## Token
- `--surface-primary`／`--surface-tertiary` 底與停用底。
- `--border-default`／`--border-hover`／`--sandbox-border-danger` 邊框三態。
- `--text-primary`、`--text-secondary` 文字與說明；`--sandbox-text-danger` 錯誤與超限計數。
- `--font-mono` 計數；`--radius-md` 圓角；`--focus-ring` 焦點環。

## 來源
- hand-written from packages/design-system/src/index.ts（`FORM_STYLES_CSS` 的 `textarea`：`min-height: 80px`、`resize: vertical`）。
- 最小高度由 80px 改 96px（三行 14px/1.5 加內距）；字數計數與超限錯誤為 Intentional addition，依 DOOPING 異動原因欄位需求新增。
