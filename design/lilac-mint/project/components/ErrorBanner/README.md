# ErrorBanner
聊天頁回答失敗時的錯誤橫幅：訊息 + 「重試」按鈕（busy 時顯示旋轉圈、`aria-busy`、停用）+ 「開啟 API 金鑰設定」次要按鈕；放在回答區上方，給對話式介面與需要「重試」的失敗狀態使用。

## 何時用
- 一次請求失敗、使用者可以重試或改設定（金鑰、端點）就能復原。
- 失敗與某個回答或區塊綁在一起，要貼在那個區塊上方。

## 不要用
- 一般提示或驗證結果：用 Alert（warning／danger）。
- 無法復原、需要阻斷的錯誤：用高強度 Alert 或 Dialog。
- 不要同時顯示多條 ErrorBanner；新的錯誤取代舊的。

## 狀態
- 一般：底 `--sandbox-background-warning`、1px `--sandbox-border-warning`、文字與圖示 `--sandbox-text-warning`、radius 10px、內距 12px 16px、13px、下方 margin 12px。
- 重試按鈕 `.lm-error-banner__btn`：實色（`--sandbox-text-warning` 底、`--sandbox-background-primary` 字）。
- 次要按鈕 `--secondary`：透明底、1px `--sandbox-border-warning`、字 `--sandbox-text-warning`；hover 底 `--sandbox-background-primary`。
- busy：容器與重試按鈕 `aria-busy="true"`，兩顆按鈕 `disabled`（透明度 0.5），重試鈕前放 `.lm-error-banner__spinner`（12px、2px currentColor、只在 `prefers-reduced-motion: no-preference` 旋轉），文字改「重試中」。
- 窄版：訊息獨占一列，按鈕換到下一列。

## 無障礙
- 容器 `role="alert"`（來源如此），出現即朗讀；訊息用 `<p>`。
- busy 時以 `aria-busy` 與 `disabled` 表達，不要只靠旋轉圈；旋轉圈 `aria-hidden="true"`。
- 按鈕文字具體：「重試」「開啟 API 金鑰設定」，不要用圖示代替。
- 對比：`--sandbox-text-warning` 對 `--sandbox-background-warning` 兩主題 ≥5.8:1；反白按鈕字 ≥4.5:1。

## Token
- `--sandbox-background-warning` 橫幅底；`--sandbox-border-warning` 邊框與按鈕框；`--sandbox-text-warning` 文字、圖示、實色按鈕底。
- `--sandbox-background-primary` 實色按鈕文字、次要按鈕 hover 底。
- `--radius-md` 按鈕圓角；`--space-2`／`--space-3` 間距。

## 來源
- hand-written from apps/app/src/components/chat/error-banner.tsx 與 apps/app/src/app/chat.css（`.chat-error`：padding 12px 16px、radius 10px、margin-bottom 12px、13px；`button:disabled` opacity 0.5）。
- 來源顏色是硬編 `#ffac4d`（底 `#ffac4d20`、框 `#ffac4d`），本系統改用 warning 語意 token；來源的底線文字按鈕改為實色／次要按鈕並補上 busy 旋轉圈。
- `.provider-keys-recover` 的 margin-left 16px 改為按鈕群 gap 8px。
