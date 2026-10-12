# Alert
頁內的提示區塊：四種語意（info／success／warning／danger）× 兩種強度（低：淡底同色字；高：實色底反白字），結構是圖示 + 標題 + 內文 + 可選動作連結 + 關閉鈕；給 DOOPING 草稿驗證結果、合規建議、排程回饋使用。

## 何時用
- 與目前畫面內容直接相關、需要停留的訊息（驗證結果、合規建議、生效日提醒）。
- 合規「建議」：永遠用低強度 info，內文要含「需法務確認」字樣（DOOPING 的 `compliance.evaluate()` 只建議、不判定；每條發現帶 `needs_legal_review`）。
- 高強度只給阻斷式 modal 或 critical（連線中斷、資料未儲存），一個畫面最多一則。

## 不要用
- 短暫、不需停留的回饋（已儲存、已複製）：用 Toast。
- 聊天頁的回答錯誤與重試：用 ErrorBanner。
- 表單欄位錯誤：放在 Field 的錯誤文字，不要在頁頂堆 Alert。
- 把合規建議做成 warning 或 danger：建議不是違規，顏色不得暗示判定。

## 狀態
- 低強度 `.lm-alert--<sem>`：底 `--sandbox-background-<sem>`、1px `--sandbox-border-<sem>`、字與圖示 `--sandbox-text-<sem>`；沒有左側粗邊。
- 高強度 `.lm-alert--<sem>.lm-alert--high`：底 `--sandbox-text-<sem>`、字 `--sandbox-background-primary`。
- 可關閉：`button.lm-alert__close[aria-label="關閉"]`，hover 透明度 0.7；不可關閉的（modal 內）省略按鈕。
- 動作：`a.lm-alert__action` 底線連結，顏色繼承；一則最多一個動作。
- 尺寸：內距 10px 12px、13px/1.5、radius-md、圖示 16px 對齊第一行。

## 無障礙
- danger 用 `role="alert"`（立即朗讀）；其餘 `role="status"`（polite）。
- 標題用 `<strong class="lm-alert__title">`，內文用 `<p>`；圖示 `aria-hidden="true"`。
- 三重編碼：顏色 + 語意圖示（i／勾／三角／圓叉）+ 標題文字。
- 對比：低強度四組兩主題皆 ≥4.67:1；高強度反白字 ≥4.5:1；邊框對頁底 ≥6:1。
- 關閉鈕 24px 可點區域，焦點環由 00-base.css 提供。

## Token
- `--sandbox-background-info|success|warning|danger` 低強度底。
- `--sandbox-text-info|success|warning|danger` 低強度字與圖示；高強度底。
- `--sandbox-border-info|success|warning|danger` 低強度 1px 邊框。
- `--sandbox-background-primary` 高強度文字。
- `--radius-md` 圓角；`--radius-sm` 關閉鈕。

## 來源
- hand-written from apps/app/src/components/ui-gallery/color-components/alert-tiers.tsx 與 gallery.css（`.gal-alert`：flex、gap 10px、padding 10px 12px、13px、圖示 16px margin-top 2px）；兩種強度的配色依 alert-tiers 的 tint／solid 兩層，低強度拿掉來源的左 5px 色條。
- 語意 token 來自 packages/design-system/src/index.ts 的 `THEME_CSS`（`--color-background-*`／`--color-text-*`／`--color-border-*`）。
