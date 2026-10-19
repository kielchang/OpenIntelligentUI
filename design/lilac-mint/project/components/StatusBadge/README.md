# StatusBadge
DOOPING 狀態詞彙的徽章：草稿 `draft／validated／scheduled／applied／cancelled`、單位與職位 `active／frozen`、人員 `active／inactive／merged`、以及派遣／約聘 `contingent`；每顆都是圖示 + 中文標籤（+ 可選英文鍵），給表格、抽屜、卡片標頭使用。

## 何時用
- 顯示一筆資料目前的生命週期狀態，而且狀態是系統詞彙（上面十個鍵）之一。
- 表格狀態欄：直接用 DataTable 的 `.lm-table__badge--<key>`，色規則相同。

## 不要用
- 使用者自訂的分類、篩選條件或可移除的標籤：用 Tag。
- 一段提示訊息：用 Alert。
- 不要發明新的狀態鍵或顏色；新狀態先加進詞彙表再加 modifier。

## 狀態
- 灰（`--surface-quaternary` 底、`--text-primary` 字、1px `--border-default`）：`draft` 鉛筆、`frozen` 鎖頭、`inactive` 減號圓。
- info（`--sandbox-background-info`／`--sandbox-text-info`／`--sandbox-border-info`）：`validated` 圓勾、`merged` 合併分支。
- warning：`scheduled` 時鐘。
- success：`applied` 勾、`active` 實心圓點。
- danger：`cancelled` 叉。
- 派遣／約聘 `contingent`：`--color-lilac` 底、`--on-brand` 字、1px `--color-lilac-dark`、虛線人形圖示。
- 尺寸：md 預設（3px 10px、12px/600、圖示 14px）；`.lm-badge--sm`（1px 8px、11px、圖示 12px），表格密集列與組織圖節點用 sm。
- 英文鍵：`<code>` 放在中文標籤後，給工程與對帳畫面；一般畫面可省略。

## 無障礙
- 三重編碼：底色 + 圖示 + 文字，同一語意色內（info 的 validated／merged、灰的 draft／frozen／inactive）靠圖示與文字區分。
- 圖示 `aria-hidden="true"`；徽章本身是 `<span>`，不加 role。
- 所有語意配對兩主題皆 ≥4.67:1；`--on-brand` 放在 `--color-lilac` 上 12:1。
- 不要把徽章做成按鈕；要可點的狀態篩選用 Tag 的 chip。

## Token
- `--surface-quaternary`、`--text-primary`、`--border-default` 灰徽章。
- `--sandbox-background-info|success|warning|danger` 底；`--sandbox-text-*` 字與圖示；`--sandbox-border-*` 1px 外框。
- `--color-lilac`、`--on-brand`、`--color-lilac-dark` 派遣徽章。
- `--font-sans` 標籤；`--font-mono` 英文鍵。

## 來源
- hand-written from apps/app/src/components/ui-gallery/gallery.css（`.gal-badge`：pill、2px 9px、11px/600、letter-spacing 0.01em）；語意色改用設計系統的低強度配對，不再用來源的 rgba 混色。
- 狀態詞彙與圖示為 Intentional addition：OpenIntelligentUI 沒有這組狀態，依 DOOPING 草稿／單位／職位／人員狀態新增。
