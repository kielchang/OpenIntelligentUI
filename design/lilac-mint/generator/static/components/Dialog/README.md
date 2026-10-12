# Dialog
原生 `<dialog>` 的模態對話框：標題、一段說明、取消與確認兩顆按鈕，給「確認一個動作」或「填一兩個欄位」的短互動使用。

## 何時用
- 確認會改變狀態的動作：排程草稿、取消草稿、結束任職。
- 短表單：一到兩個欄位（例如輸入生效日、選一個原因）。
- 破壞性動作用 `lm-dialog__btn--danger`，並在標題旁放 danger 圖示（`__icon--danger`）。

## 不要用
- 看一筆資料的細節或編輯多個欄位：用 Drawer（抽屜看細節／編輯一筆，對話框確認／短表單）。
- 不要堆疊對話框；確認後的結果用 Toast 回報。
- 不要把對話框當作提示訊息（沒有動作可按的內容用 Alert）。

## 狀態
- 關閉：原生 `dialog:not([open])` 隱藏。
- 開啟：`showModal()`；`::backdrop` 用 `--backdrop`；面板 `--surface-dialog` 疊在 `--background` 上、1px `--border-default`、`--radius-xl`、`--shadow-lg`、寬 `min(480px, 90vw)`。
- 按鈕：取消為 ghost（透明底、`--border-default` 框）；確認為 ink（`--text-primary` 底、`--background` 字）；破壞性為 danger 高強度（`--sandbox-text-danger` 底、`--sandbox-background-primary` 字）。
- 按鈕停用 opacity 0.45；hover 時 ghost 轉 `--surface-btn-hover` + `--border-hover`。
- 內嵌展示 `.lm-dialog--inline`：用 `<div>` 同樣 class 結構 static 顯示，只用於文件與預覽。

## 無障礙
- 用原生 `<dialog>` 與 `showModal()`：焦點圈限、Esc 關閉、背景不可互動由瀏覽器處理。
- `aria-labelledby` 指向標題；破壞性對話框把預設焦點放在「保留」而不是「刪除」（`autofocus`）。
- 開啟：`data-lm-dialog-open="id"` 或 `LilacMint.dialog.open(el)`；關閉：`data-lm-dialog-close`。
- 標題以文字說明動作與對象（「取消草稿 D-0042？」），不只靠顏色與圖示表示危險。
- 文字對比：標題 `--text-primary`、說明 `--text-secondary` 在 `--surface-dialog` 上 ≥4.5:1；danger 按鈕兩主題都 ≥4.5:1。

## Token
- `--backdrop` `::backdrop`
- `--surface-dialog` 疊在 `--background` 上為面板底
- `--border-default` 面板與 ghost 按鈕框；`--border-hover` hover 框
- `--radius-xl` 面板圓角；`--radius-md` 按鈕圓角；`--shadow-lg` 面板陰影
- `--text-primary` 標題、強調字、ink 按鈕底；`--text-secondary` 說明
- `--sandbox-text-danger` danger 按鈕底與圖示；`--sandbox-background-primary` danger 按鈕字；`--sandbox-background-danger`／`--sandbox-border-danger` 圖示底與框
- `--space-6` 面板 padding；`--space-5` 動作列上方間距

## 來源
- hand-written from apps/app/src/components/chat/provider-keys.css（`.provider-keys-dialog` 寬 min(480px, …)、padding 24、radius 16、`::backdrop` 遮罩；`.provider-keys-actions` 右對齊、gap 8、flex-wrap、margin-top 20；儲存鈕為 text-primary 底）。
- 標題由來源的 20px 改為型階 heading（16/600/-0.4px）；按鈕尺寸改為 chat.css 標頭按鈕（padding 6px 12px、13px/500）以與全系統一致。
- danger 高強度配色與圖示為 Intentional addition，依 BRIEF 語意色規則。
