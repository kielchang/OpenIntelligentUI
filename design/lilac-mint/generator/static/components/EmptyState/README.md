# EmptyState
清單或面板沒有內容時的置中提示：48px 線條圖示、標題、一句說明、主要動作（ink 按鈕）與次要連結；三種情境：沒有資料、沒有符合篩選的結果、沒有權限；給 DOOPING 名冊、草稿清單、組織圖面板使用。

## 何時用
- 查詢回傳 0 筆，而且畫面原本預期有一張表格或清單。
- 使用者篩選到沒有結果，要給「清除篩選」的出口。
- 權限不足：說明原因與下一步（向誰申請），不給假的動作。

## 不要用
- 載入中：用 Skeleton 或 LoadingPlaceholder，等資料回來再決定是否空。
- 錯誤（API 失敗）：用 Alert danger 或 ErrorBanner，不要偽裝成「沒有資料」。
- 表格內的 `td[colspan]` 提示列：表格不渲染，整塊換成 EmptyState。

## 狀態
- 沒有資料：收件匣圖示；主要動作「新增草稿」+ 次要連結「了解匯入流程」。
- 沒有符合篩選的結果：搜尋叉圖示；唯一動作「清除篩選」。
- 沒有權限：鎖頭圖示；沒有動作，說明要寫清楚申請途徑。
- 版面：`.lm-empty` 置中 flex column、gap 8px、內距 24px 16px；圖示 `--text-secondary`；標題 16px/600；說明 13px `--text-secondary`、最寬 36em。
- 主要按鈕 `.lm-empty__btn`：ink（`--text-primary` 底、`--background` 字）；次要連結 `.lm-empty__link` 底線。

## 無障礙
- 標題用與頁面層級相符的 `<h2>`／`<h3>`；圖示 `aria-hidden="true"`。
- 說明文字要說「為什麼空」與「可以做什麼」，不要只寫「沒有資料」。
- 「清除篩選」是 `<button>`；導向其他頁的用 `<a>`。
- 對比：`--text-secondary` 兩主題 ≥4.5:1；ink 按鈕 ≥10:1。

## Token
- `--text-secondary` 圖示與說明；`--text-primary` 標題、按鈕底、連結。
- `--background` 按鈕文字。
- `--radius-md` 按鈕圓角；`--space-2`／`--space-3`／`--space-4`／`--space-6` 間距。

## 來源
- Intentional addition：OpenIntelligentUI 沒有獨立的空狀態元件（/gallery 與 DOOPING app.css 的 `.permissions .empty` 只是一段灰字），依 DOOPING 清單頁需求新增；按鈕尺寸依 chat.css 標頭按鈕（6px 12px、13px/500、radius-md）。
