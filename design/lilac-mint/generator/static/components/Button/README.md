# Button
觸發一個動作的按鈕，給所有需要「送出、儲存、取消、刪除、開始」的畫面用；五種變體對應動作的重要性，兩種尺寸對應所在的密度。

## 何時用
- 使用者要觸發動作（送出草稿、排程生效、匯出）時用 `<button>`；要前往另一頁時用 `<a class="lm-btn">`。
- 一個區塊只放一顆 primary；其餘動作用 secondary 或 ghost。
- 不可逆的動作（刪除、取消排程）用 danger，並搭配確認對話框。
- `brand` 只給整頁唯一的品牌入口（例如歡迎畫面的「開始建立組織圖」）；**一頁最多一顆**。
- 動作要等待伺服器回應時改成載入態：加 `aria-busy="true"` 與 `.lm-btn__spinner`，文字改成進行式（「儲存中…」）。

## 不要用
- 不要拿按鈕做導覽或切換檢視；切換用 SegmentedControl 或 Tabs。
- 不要同一列放兩顆 primary，也不要把 danger 當成「強調」用。
- 純圖示按鈕一定要有 `aria-label`；不要只靠 `title`。
- 不要在 brand 以外的按鈕加漸層或陰影裝飾。

## 狀態
- 預設：primary `--text-primary` 底、`--background` 字；secondary `--surface-btn` 底、`--border-default` 框、`--text-primary` 字；ghost 透明底；danger `--sandbox-text-danger` 底、`--sandbox-background-primary` 字；brand `--color-lilac`→`--color-mint` 漸層、`--on-brand` 字。
- hover：secondary 改 `--surface-btn-hover` 與 `--border-hover`；ghost 改 `--surface-quaternary`；primary／danger 以 `color-mix` 把底色往頁底拉 12%；brand 加 `--shadow-md`。
- focus-visible：`--focus-ring` 2px、offset 3px（00-base.css 共用）。
- 停用：`disabled`，`opacity: .5` + `cursor: not-allowed`，hover 不生效。
- 載入中：`aria-busy="true"`，旋轉圈以 `@keyframes lm-spin` 轉動；`prefers-reduced-motion: reduce` 時靜止，仍以文字「…中」表示進行。
- 尺寸：md 36px 高（padding 6px 12px、13px/500）；sm 28px 高（padding 3px 10px、12px）。純圖示 `.lm-btn--icon` 為正方形。

## 無障礙
- 用原生 `<button type="button">`；連結樣式的按鈕用 `<a href>`。
- 鍵盤：Tab 聚焦、Enter／Space 觸發；焦點環由 00-base.css 提供。
- 圖示一律 `aria-hidden="true"`；純圖示按鈕給 `aria-label`。
- 載入態用 `aria-busy="true"`，不要同時 `disabled`（螢幕閱讀器會失去焦點）。
- 對比：primary 淺 10.3:1、深 16:1；danger 兩主題 ≥7:1；brand 的 `--on-brand` 對 lilac 12:1、對 mint 13:1。

## Token
- `--text-primary`／`--background` primary 的底與字（ink 按鈕）。
- `--surface-btn`、`--surface-btn-hover`、`--border-default`、`--border-hover` secondary 的底與框。
- `--surface-quaternary` ghost hover 底。
- `--sandbox-text-danger`／`--sandbox-background-primary` danger 的底與字。
- `--color-lilac`、`--color-mint`、`--on-brand` brand 漸層與字；`--shadow-md` brand hover。
- `--radius-md` 圓角；`--font-sans` 字體；`--focus-ring` 焦點環。

## 來源
- hand-written from apps/app/src/app/chat.css（`.chat-header-btn`：padding 6px 12px、13px/500、radius-md）與 globals.css（`.cta-btn`）。
- 來源 CTA 以白字放在 `--color-lilac-dark`→`--color-mint-dark` 漸層上，對 lilac-dark 只有 2.72:1；本系統 brand 改用淡品牌色（`--color-lilac`→`--color-mint`）配深字 `--on-brand`，並把 999px 膠囊改成 `--radius-md` 與其他按鈕一致。
