# SearchBox
工具列裡的搜尋輸入框，左側放大鏡、右側清除鈕與 `/` 快捷提示，下方以 `role="status"` 回報筆數；給組織圖、人員清單與草稿清單的即時篩選用。

## 何時用
- 在已載入的清單或圖上即時篩選：人名、單位、代碼（GPN）。
- 一頁只有一個主要搜尋框時，提供 `/` 快捷鍵聚焦，並用 chip 標示。
- 結果數量對使用者有意義時，用 `.lm-search__status` 說「找到 N 筆」或「找不到符合『…』的人員」。

## 不要用
- 一般文字欄位（名稱、備註）用 TextField；`type="search"` 會讓瀏覽器與輸入法以搜尋行為處理。
- 需要多條件（狀態＋單位＋日期）的篩選：搜尋框只負責關鍵字，其餘交給 Select／CheckboxRadio。
- 不要把搜尋結果塞進 status 文字；status 只報數量與下一步提示。

## 狀態
- 預設：`.lm-search` 包 `svg.lm-search__icon`、`input.lm-search__input`、`button.lm-search__clear`、`kbd.lm-search__kbd`；input 左右各留 36px／40px 給圖示與按鈕；外框、底、圓角同 TextField；`max-width: 420px`。
- 有值：容器加 `.has-value`，清除鈕顯示（`hidden` 移除）、`/` chip 隱藏。
- 聚焦：`:focus-within` 隱藏 `/` chip；邊框 `--border-hover`；focus-visible 焦點環。
- 清除鈕 hover：底 `--surface-quaternary`、圖示 `--text-primary`。
- 停用：`disabled`，`opacity: .5`、底 `--surface-tertiary`；清除鈕與 chip 不出現。
- 原生的 `::-webkit-search-cancel-button` 已隱藏，改用自訂清除鈕以保持兩主題一致。

## 無障礙
- input 給 `aria-label`（工具列通常沒有可見標籤）與 `aria-describedby` 指向 status。
- 清除鈕是真正的 `<button type="button">` 加 `aria-label="清除搜尋"`；只在有值時出現，按下後焦點回到 input。
- `/` chip 是 `<kbd aria-hidden>`；快捷鍵監聽在 `document`，焦點在任何輸入欄位時不攔截；Esc 清空。
- status 區 `role="status" aria-live="polite"`，筆數變化會被唸出但不打斷輸入。
- 有候選清單時依來源實作 `role="listbox"` + `aria-selected`，↑↓／Enter／Esc 操作（不在本預覽範圍）。

## Token
- `--surface-primary` 底；`--surface-tertiary` 停用底與 `/` chip 底；`--surface-quaternary` 清除鈕 hover。
- `--border-default`／`--border-hover` 邊框。
- `--text-primary` 輸入文字；`--text-secondary` 圖示、placeholder、chip、status。
- `--font-mono` chip；`--radius-md`／`--radius-sm` 外框與 chip 圓角；`--focus-ring` 焦點環。

## 來源
- hand-written from doooping-orgchart-platform apps/web/src/SearchBox.tsx（`type="search"`、placeholder「搜尋人名／單位／代碼」、↑↓／Enter／Esc）與 app.css（`.toolbar input`、`.search-box`）。
- 來源輸入框只有 `padding: 2px 6px` 與瀏覽器預設外觀；本系統統一為 36px 高的 `.lm-input` 尺寸，並新增放大鏡、清除鈕、`/` chip 與筆數 status。
