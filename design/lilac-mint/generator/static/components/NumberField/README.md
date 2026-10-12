# NumberField
數值輸入欄位，右對齊、等寬字、帶單位後綴與範圍說明；給員額、單價、百分比等會拿去計算的欄位用，並以 `role="status"` 即時回報換算結果。

## 何時用
- 值會被計算或比較：核定員額、單價、上限、比例。
- 有明確的 `min`／`max`／`step`，而且要在輸入時立刻告訴使用者超出範圍。
- 輸入後有立即可見的結果（例如員額 × 單價），把結果放在 `.lm-field__status[role="status"]`。

## 不要用
- 只是「看起來像數字」的識別碼（員工編號、郵遞區號、電話）用 TextField + `inputmode="numeric"`，否則會被去掉前導零與自動加減。
- 在固定範圍內調參數、看結果比精確輸入重要時用 RangeSlider。
- 不要省略單位；沒有單位的數字沒有意義。

## 數值邊界規則
- 以 `input.valueAsNumber` 讀值，再用 `Number.isFinite()` 判斷；空字串、`e`、`-` 等半成品都視為「不是數字」，不得當 0。
- 範圍檢查用 `n < min || n > max`，邊界值（等於 min 或 max）合法。
- 步進檢查用 `Math.abs(n / step - Math.round(n / step)) > 1e-9`，避免浮點誤差（0.1 + 0.2）。
- 換算結果以 `Math.round()` 取整並用 `toLocaleString('zh-Hant')` 加千分位；金額一律整數。
- 任一欄位有錯就不顯示結果，改成「請先修正欄位中的錯誤」；不要顯示 `NaN` 或 `Infinity`。
- 顯示上限與下限時與 `.lm-field__help` 的文字一致，避免說明寫 0–50、驗證卻擋 0。

## 狀態
- 預設：`.lm-input.lm-input--number`，`type="number" inputmode="decimal"`，`--font-mono`、右對齊、tabular-nums；其餘同 TextField。
- 錯誤：`aria-invalid="true"` + `--sandbox-border-danger` 邊框 + `.lm-field__error`（圖示＋文字），訊息說明「要介於多少與多少」而不只說「無效」。
- 停用：`disabled`，容器 `.is-disabled`。
- 結果：`.lm-field__status` 用 `--text-primary`，數字用 `<strong>`（等寬 500）。

## 無障礙
- `aria-describedby` 同時指向說明與錯誤段落；錯誤段落 `role="alert"`，結果段落 `role="status" aria-live="polite"`。
- `inputmode="decimal"` 讓行動裝置叫出數字鍵盤；整數欄位仍用 decimal 以保留負號。
- 不要攔截方向鍵；原生步進（↑↓）保留。
- 深色主題以 `color-scheme: dark` 讓步進按鈕跟著變深。

## Token
- `--font-mono` 數字與結果；`--text-primary` 文字。
- `--sandbox-border-danger`／`--sandbox-text-danger` 錯誤邊框與訊息。
- `--surface-primary`、`--border-default`、`--border-hover`、`--radius-md` 同 TextField。
- `--surface-tertiary`／`--text-secondary` 單位後綴。

## 來源
- hand-written from packages/design-system/src/index.ts（`FORM_STYLES_CSS` 的 `input[type="number"]`）；右對齊、等寬字、單位槽與邊界規則為 Intentional addition：OpenIntelligentUI 沒有獨立的數值欄位，依 DOOPING 員額與預算欄位需求新增。
