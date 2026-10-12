# SegmentedControl
在兩到五個互斥選項之間切換檢視或模式的分段按鈕，給工具列、設定列與圖表標頭用；選中的那顆浮在軌道上，其餘保持次要文字色。

## 何時用
- 同一份資料的不同檢視（全部單位／直接下屬／主管鏈、表格／圖）或立即生效的模式（淺色／深色／跟隨系統）。
- 選項固定、名稱短（四字以內）、數量 2–5 個；切換後畫面立刻改變、不需要「套用」。
- 需要圖示輔助辨識時，每顆都放 16px inline SVG，並保留文字。

## 不要用
- 選項超過五個或名稱很長：改用 Select。
- 切換的是內容分頁而不是同一份資料的檢視：用 Tabs（有 tabpanel 語意）。
- 需要多選：用 CheckboxRadio 的 checkbox 群。
- 不要把它當表單欄位送出；它的狀態只存在 `aria-pressed`。

## 狀態
- 軌道：`--surface-quaternary` 底、`--border-default` 框、`--radius-md`。
- 未選中：透明底、`--text-secondary` 字；hover 改 `--text-primary`。
- 選中 `aria-pressed="true"`：`--surface-primary` 底、`--border-default` 框、`--shadow-sm`、`--text-primary` 字；深色主題改用 `--surface-btn-hover` 當底（疊在軌道上才看得出來）。
- 停用：每顆 `disabled`，`opacity: .5`、`cursor: not-allowed`；整組停用就每顆都停用。
- focus-visible：`--focus-ring` 2px、offset 3px。

## 無障礙
- 容器 `role="group"` + `aria-label` 說明這組在切換什麼。
- 每顆是 `button[aria-pressed]`，切換時只改 `aria-pressed`，不要改成 `aria-selected` 或 `role="radio"`。
- 鍵盤：Tab 依序到每顆、Enter／Space 切換；不攔截方向鍵。
- 選中態以底色＋邊框＋陰影＋文字色四重表示，不只靠顏色；兩主題文字對比 ≥4.5:1。

## Token
- `--surface-quaternary` 軌道底；`--border-default` 軌道與選中框。
- `--surface-primary` 選中底（淺色）；`--surface-btn-hover` 選中底（深色）。
- `--shadow-sm` 選中浮起。
- `--text-secondary`／`--text-primary` 未選中與選中文字。
- `--radius-md`／`--radius-sm` 軌道與按鈕圓角；`--focus-ring` 焦點環。

## 來源
- hand-written from apps/app/src/components/ui-gallery/gallery.css（`.gal-topbar` 的 `.gal-seg` 主題切換：padding 3px 軌道、5px 12px 按鈕、選中 `--surface-primary` + `--shadow-sm`）。
- 來源軌道用 `--surface-secondary` 與 999px 膠囊；本系統依規約改成 `--surface-quaternary` 軌道、`--radius-md` 圓角，按鈕字級由 12px 改 13px 與 Button 對齊。來源深色主題以寫死的半透明白覆寫選中底，本系統改用 `--surface-btn-hover`。
