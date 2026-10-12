# Select
原生下拉選單加上自訂 chevron 的單選欄位，給 5 個以上固定選項或篩選條件用；保留原生鍵盤與行動裝置行為，只重畫外框與箭頭。

## 何時用
- 從固定清單挑一個：草稿狀態、生效單位、版本、國別。
- 選項超過 SegmentedControl 能放的數量（>5）或名稱較長。
- 篩選器與表單都可用；篩選器通常不需要「請選擇」，表單欄位需要。

## 不要用
- 2–5 個短選項且切換立即生效：用 SegmentedControl。
- 需要多選或選項要帶說明：用 CheckboxRadio。
- 選項要搜尋或超過 50 筆：改做可搜尋的清單（不在本元件範圍）。
- 不要用 `select` 當導覽（選了就跳頁）。

## 狀態
- 預設：`.lm-select` 包 `select.lm-select__native` 與絕對定位的 `svg.lm-select__chevron`；`appearance: none` 去掉原生箭頭，右側留 36px 給 chevron；外框、底、圓角同 TextField。
- 空值：第一個 `<option value="">請選擇</option>`；表單欄位加 `required`，送出前以 `aria-invalid` 與 `.lm-field__error` 提示。
- hover／focus：邊框 `--border-hover`；focus-visible 焦點環由 00-base.css 提供。
- 錯誤：`aria-invalid="true"` → 邊框 `--sandbox-border-danger`，下方圖示＋文字。
- 停用：`disabled`，`opacity: .5`、底 `--surface-tertiary`，chevron 同步變淡。

## 無障礙
- 原生 `<select>`：Tab 聚焦、↑↓ 選取、Enter／Space 開啟、打字跳到選項，不需要額外腳本。
- `<label for>` 必備；說明與錯誤用 `aria-describedby`。
- chevron 放在 `select` 之外、`pointer-events: none`、`aria-hidden="true"`；不能用 `background-image` 的 SVG，因為 data URI 無法引用 `currentColor`。
- 深色主題以 `color-scheme: dark` 讓展開的選單跟著變深。

## Token
- `--surface-primary` 底；`--surface-tertiary` 停用底。
- `--border-default`／`--border-hover`／`--sandbox-border-danger` 邊框三態。
- `--text-primary` 文字；`--text-secondary` chevron 與說明。
- `--sandbox-text-danger` 錯誤文字；`--radius-md` 圓角；`--focus-ring` 焦點環。

## 來源
- hand-written from packages/design-system/src/index.ts（`FORM_STYLES_CSS` 的 `select`：14px、radius-md、底 background-primary，hover 改次級邊框）。
- 來源保留原生箭頭；本系統改為包裝元素內的 inline SVG chevron，使箭頭顏色跟隨 `--text-secondary` 並在兩主題一致。
