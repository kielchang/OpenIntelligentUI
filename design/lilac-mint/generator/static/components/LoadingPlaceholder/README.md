# LoadingPlaceholder
生成或讀取中的佔位框：固定高度的淡底框（`--surface-secondary`、1px 邊框、radius-lg），中央 12px 旋轉圈 + 一句每 1.8 秒輪播的狀態短句；給等待組織圖、匯報線計算、草稿套用等需要數秒的內容區塊使用。

## 何時用
- 即將出現的是一整塊內容（圖、面板、生成結果），高度大致可預期。
- 等待時間 1–10 秒，輪播短句能讓使用者知道還在進行。

## 不要用
- 等待時間很短（<300ms）：什麼都不顯示，避免閃爍。
- 可預期的表格或清單形狀：用 Skeleton，讓版面先就位。
- 按鈕內的載入：用按鈕自己的 loading 態。
- 短句不要寫進度百分比或承諾時間；它不是進度列。

## 狀態
- 預設 `.lm-loading`：高 120px、底 `--surface-secondary`、1px `--border-default`、radius-lg；旋轉圈 12px（2px `--border-hover` 環、`--text-secondary` 弧）；短句 12px/500 `--text-secondary`，尾端自動加「...」。
- `.lm-loading--compact`：高 50px（來源的最小高度）。
- 輪播：`LilacMint.rotate(el, phrases, 1800)`；`prefers-reduced-motion: reduce` 時只顯示第一句，旋轉圈也不轉。
- 完成後整塊換成內容；失敗換成 Alert 或 ErrorBanner，不要停在佔位框。

## 無障礙
- 容器 `role="status" aria-busy="true" aria-live="polite"`；短句變化會被輕聲朗讀，頻率 1.8 秒可接受，但不要更快。
- 旋轉圈 `aria-hidden="true"`。
- 中文短句用「正在…」句型，說明在做什麼（讀取組織圖、計算匯報線、套用草稿）。
- 對比：`--text-secondary` 對 `--surface-secondary` 兩主題 ≥4.5:1。

## Token
- `--surface-secondary` 框底；`--border-default` 框線；`--border-hover` 旋轉圈環；`--text-secondary` 弧與文字。
- `--radius-lg` 圓角。

## 來源
- hand-written from apps/app/src/components/generative-ui/open-generative-ui/renderer.tsx（`LOADING_PHRASES` 七句、`useLoadingPhrase` 1800ms、placeholder 的 `--color-background-secondary` 底 + `--color-border-tertiary` 框 + 12px 旋轉圈 + 12px/500 文字、`ogui-spin` 0.8s；`MIN_HEIGHT` 50）。
- 中文短句為 Intentional addition，依 DOOPING 情境新增。
