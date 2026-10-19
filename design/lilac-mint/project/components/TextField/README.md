# TextField
單行文字輸入欄位，含標籤、說明、錯誤訊息與前綴／後綴槽；給人員主檔、單位維護與對話框表單用，是其他輸入元件共用的 `.lm-field` 容器基礎。

## 何時用
- 自由文字且一行寫得完：姓名、職稱、信箱、代碼。
- 固定前綴或單位：把 `ZZ-`、「人」、「元」放進 `.lm-input-group__affix`，不要讓使用者自己打。
- 欄位有限制或來源說明時，用 `.lm-field__help` 一句講完，並以 `aria-describedby` 連到 input。

## 不要用
- 數值運算用 NumberField；多行用 Textarea；固定選項用 Select；搜尋用 SearchBox。
- 不要用 placeholder 代替 label；placeholder 只放格式範例（`name@example.invalid`）。
- 不要把錯誤訊息放在 input 上方或只改邊框顏色。

## 狀態
- 預設：`--surface-primary` 底、1px `--border-default`、`--radius-md`、14px、padding 8px 12px、最低 36px 高。
- hover／focus：邊框 `--border-hover`；focus-visible 另加 `--focus-ring`。
- 錯誤：input 設 `aria-invalid="true"`，邊框 `--sandbox-border-danger`；下方 `.lm-field__error` 放圖示＋文字（`--sandbox-text-danger`），並以 `aria-describedby` 指向它。
- 停用：`disabled`，`opacity: .5`、底改 `--surface-tertiary`、`cursor: not-allowed`；容器加 `.is-disabled` 讓標籤同步變淡。
- 必填：label 內 `.lm-field__required` 放 `*`（`aria-hidden`），再以 `.lm-sr-only` 補「（必填）」；input 加 `required`。
- 前綴／後綴：`.lm-input-group` 把 affix 與 input 拼成一條；affix 底 `--surface-tertiary`、字 `--text-secondary`；錯誤與停用會連動 affix 邊框與透明度。

## 無障礙
- 每個 input 都有 `<label for>`；前綴佔掉標籤語意時用 `aria-label` 補完整名稱。
- 說明與錯誤都用 `aria-describedby` 連結；錯誤段落加 `role="alert"` 讓即時驗證被唸出。
- placeholder 用 `--text-secondary`（兩主題 ≥4.5:1），不用 `--text-tertiary`。
- 錯誤以邊框色＋圖示＋文字三重表示。

## Token
- `--surface-primary` 輸入底；`--surface-tertiary` 停用底與 affix 底。
- `--border-default`／`--border-hover`／`--sandbox-border-danger` 預設、hover、錯誤邊框。
- `--text-primary` 輸入文字與標籤；`--text-secondary` 說明、placeholder、affix。
- `--sandbox-text-danger` 錯誤文字與必填星號。
- `--radius-md` 圓角；`--font-sans`／`--font-mono` 文字與代碼型前綴；`--focus-ring` 焦點環。

## 來源
- hand-written from packages/design-system/src/index.ts（`FORM_STYLES_CSS` 的 input：14px、radius-md、底 background-primary）與 apps/app/src/components/chat/provider-keys.css（1px `--border-default`、底 `--surface-primary`、radius 8px）。
- 來源的 0.5px 邊框與 `rgba` 焦點暈改為 1px token 邊框與共用焦點環；padding 由 6px／10px 統一為 8px 12px。
