# Toolbar
列表頁頂端的篩選與動作列：左側放篩選控制項（法人、生效日、搜尋），右側放動作按鈕，中間以 `role="status"` 的結果槽回報目前筆數與生效日；給 DOOPING 名冊、職位清單、草稿清單等資料頁使用。

## 何時用
- 表格或清單上方需要「查詢條件 + 結果摘要 + 主要動作」三件事同時出現。
- 生效日是查詢條件之一（組織圖與名冊都是 as-of 查詢）。
- 動作最多兩顆：一顆次要（匯出）、一顆主要 ink（新增草稿）。

## 不要用
- 頁面標頭或導覽列：那是 Layout 群組的 AppHeader。
- 超過三個篩選條件：改用側欄篩選面板，Toolbar 只留搜尋與生效日。
- 表單送出：Toolbar 的輸入框只是查詢條件，不做驗證也不儲存。

## 狀態
- 預設：`.lm-toolbar` 底 `--surface-primary`、下緣 1px `--border-default`，項目 gap 16px、內距 8px 16px。
- 輸入框 hover：邊框 `--border-hover`；focus：00-base.css 的焦點環。
- 結果槽更新：`.lm-toolbar__status` 的文字改變即可，`role="status"` 會以 polite 方式朗讀。
- 主要按鈕停用（例如沒有編輯權限）：`:disabled`，透明度 0.5。
- 窄版（≤480px）：自動換行，結果槽獨占一列，分隔線隱藏。

## 無障礙
- 容器 `role="toolbar"` 並給 `aria-label`；每個控制項用 `<label>` 包住或加 `aria-label`。
- 搜尋框的 placeholder 不是標籤：旁邊放 `.lm-sr-only` 文字。
- 結果槽 `role="status"`，不要放互動元素。
- 按鈕用 `<button type="button">`，圖示 `aria-hidden="true"`、搭配文字。

## Token
- `--surface-primary` 列底；`--border-default` 下緣、輸入框與次要按鈕邊框；`--border-hover` hover 邊框。
- `--text-primary` 標籤與輸入文字；`--text-secondary` 結果槽與搜尋圖示。
- `--surface-btn`／`--surface-btn-hover` 次要按鈕底。
- ink 主要按鈕：`--text-primary` 底、`--background` 字。
- `--radius-md` 按鈕與輸入框圓角；`--space-2`／`--space-4` 內距與間距。

## 來源
- hand-written from doooping-orgchart-platform：apps/web/src/app.css（`.toolbar`、`.toolbar label`、`.toolbar .status`、`.toolbar__slot`）：flex wrap、gap 16px、padding 8px 16px、下緣 1px、status margin-left auto。
- 按鈕尺寸依 chat.css 標頭按鈕（6px 12px、13px/500、radius-md）；輸入框依 FORM_STYLES_CSS（8px 12px、1px 邊框、14px）。
