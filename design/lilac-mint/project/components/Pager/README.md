# Pager
表格底部的分頁列：每頁筆數、目前範圍（「第 1–20 筆，共 128 筆」）、上一頁／下一頁與頁碼按鈕；搭配 DataTable 使用，給 DOOPING 名冊與清單頁。

## 何時用
- 伺服器端分頁的清單，一次顯示 20–100 筆。
- 使用者需要跳到特定頁或改每頁筆數。

## 不要用
- 無限捲動或「載入更多」的動態清單。
- 資料少於一頁：隱藏整個 Pager，只留結果筆數在 Toolbar 的結果槽。
- 組織圖節點的分頁：節點用折疊計數，不分頁。

## 狀態
- 預設：`.lm-pager` 上緣 1px `--border-default`、內距 6px 16px、gap 12px，字 13px。
- 頁碼按鈕 `.lm-pager__btn`：次要按鈕樣式（`--surface-btn`、1px `--border-default`、6px 10px、radius-md）；hover `--surface-btn-hover`。
- 當前頁 `aria-current="page"`：ink 反白（`--text-primary` 底、`--background` 字）。
- 停用：第一頁的「上一頁」、最後一頁的「下一頁」用 `disabled`，透明度 0.5；不要把按鈕拿掉，位置要穩定。
- 省略號 `.lm-pager__ellipsis` 只是視覺，`aria-hidden="true"`。
- 窄版（≤480px）：導覽按鈕獨占一列。

## 無障礙
- 容器 `<nav aria-label="分頁">`；範圍文字 `role="status"`，換頁後更新會被朗讀。
- 每個頁碼按鈕給 `aria-label="第 N 頁"`，上一頁／下一頁按鈕同時有圖示與文字。
- 每頁筆數的 `<select>` 用 `<label>` 包住。
- 鍵盤：全部是原生 `<button>`／`<select>`，Tab 順序從左到右。

## Token
- `--surface-primary` 列底；`--border-default` 上緣與按鈕邊框；`--border-hover` hover 邊框。
- `--surface-btn`／`--surface-btn-hover` 按鈕底。
- `--text-primary` 文字與當前頁底；`--background` 當前頁文字；`--text-secondary` 範圍文字與省略號。
- `--radius-md` 按鈕與 select 圓角；`--space-3`／`--space-4` 間距。

## 來源
- hand-written from doooping-orgchart-platform：apps/web/src/app.css（`.directory .pager`）：flex、gap 12px、padding 6px 16px、上緣 1px。
- 按鈕尺寸依 chat.css 標頭按鈕（13px/500、radius-md）。
