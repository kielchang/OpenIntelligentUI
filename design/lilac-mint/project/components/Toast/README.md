# Toast
短暫的非阻斷回饋：固定在視窗底部置中的小黑條（ink 底、反白字、左側 8px 語意色點），四種 tone（info／success／warning／danger），4 秒自清、同時最多 3 則；給「已儲存」「已排程」這類一句話的結果回報使用。

## 何時用
- 操作已完成或失敗，使用者不需要再做什麼（草稿已排程、已複製 GPN、匯出完成）。
- 結果與目前畫面沒有固定位置可貼（跨頁、背景作業）。

## 不要用
- 需要操作（復原、重試、確認）的訊息：Toast 4 秒就消失，改用 Alert 或 Dialog。
- 長文或多行說明：一則一句、不超過一行。
- 表單驗證錯誤或合規建議：那些要停留，用 Alert。
- 不要為了「看起來有回應」每個點擊都發 Toast。

## 狀態
- 樣式在 `00-base.css`（`.lm-toast`、`.lm-toast--info/success/warning/danger`、`.lm-toast-region`），不要重寫。
- 觸發：`LilacMint.toast(message, tone)`，或在按鈕上寫 `data-lm-toast="訊息" data-lm-tone="success"` 自動接線。
- 自清：4 秒；佇列超過 3 則時最舊的先移除。
- 進場動畫 160ms，只在 `prefers-reduced-motion: no-preference`。
- `.lm-toast-region--static`：文件與展示用的非固定排列（row、wrap），正式頁面不要用。

## 無障礙
- 區域由 bundle.js 建立：`#lm-toast-region[role="status"][aria-live="polite"]`，新訊息會被朗讀，不搶焦點。
- tone 以顏色點 + 文字表達；danger 訊息文字本身要說明失敗原因（「排程失敗：匯報線循環」），不只靠紅點。
- 不放連結或按鈕（4 秒內無法可靠操作，且會破壞 `role="status"` 語意）。
- 對比：ink 底（`--text-primary`）配 `--background` 字，淺 10.3:1、深 16:1。

## Token
- `--text-primary` toast 底；`--background` 文字與預設色點。
- `--sandbox-text-info|success|warning|danger` tone 色點。
- `--shadow-lg` 陰影；`--radius-md` 圓角；`--space-2`／`--space-4` 內距；`--space-6` 距視窗底部。

## 來源
- 00-base.css 的 `.lm-toast` 系列（bundle.js 的 `toast()`）；行為規則（4 秒、最多 3 則）依 bundle.body.js。
- 視覺參考 apps/app/src/components/ui-gallery/gallery.css（`.gal-toast`）。
