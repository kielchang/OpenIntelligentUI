# RangeSlider
在固定範圍內拖動調整一個參數並立刻看到結果的滑桿，含即時 `output`、兩端刻度與說明；給顯示層級、縮放、門檻值等「調了就看」的設定用。

## 何時用
- 值的意義在於相對位置（多一點、少一點），而且畫面會隨拖動即時改變：組織圖展開層級、縮放比例、合規門檻的試算。
- 範圍窄、步進少（通常 ≤ 20 格）、不需要精確到個位數。
- 一定要配 `output` 顯示目前值，並在兩端標示最小／最大的意義（「1 層」「8 層」）。

## 不要用
- 要輸入精確數字（員額 12.5、單價 960000）：用 NumberField；精確值才有辦法驗證與對帳。
- 範圍很大或步進很細（0–1,000,000）：滑桿一格跳太多，改 NumberField。
- 選項是離散類別而不是連續量：用 SegmentedControl 或 Select。
- 不要把滑桿當進度條；進度條不可互動。

## 狀態
- 預設：原生 `input[type="range"]`，`accent-color: var(--color-mint-dark)`，軌道高 20px 的點擊區；右側 `output` 用 `--font-mono` 500、tabular-nums。
- 刻度：`.lm-range__ticks` 兩端文字 `--text-secondary` 12px，`aria-hidden`（值已由 output 與 aria 屬性表達）。
- 停用：`disabled`，滑桿 `opacity: .5`、`cursor: not-allowed`；容器 `.is-disabled` 讓 output 與刻度同步變淡。
- focus-visible：`--focus-ring` 2px、offset 3px。
- 深色主題以 `color-scheme: dark` 讓軌道配色跟著變深。

## 無障礙
- `<label for>` 指向滑桿；`output` 加 `for` 綁定同一個 id。
- 鍵盤：←→／↑↓ 一格、PageUp／PageDown 大步、Home／End 到兩端，都是原生行為。
- 值有單位或語意時另加 `aria-valuetext`（例如「3 層」）。
- 即時結果放在 `.lm-field__help` 或 `role="status"`，用 `input` 事件更新，不要等 `change`。
- `--color-mint-dark` 對兩主題底色 ≥3.85:1，拇指另有形狀，不只靠顏色。

## Token
- `--color-mint-dark` 滑桿 accent。
- `--text-primary` 標籤與 output；`--text-secondary` 刻度與說明。
- `--font-mono` output；`--space-3` 滑桿與 output 間距；`--focus-ring` 焦點環。

## 來源
- hand-written from packages/design-system/src/index.ts（`FORM_STYLES_CSS` 的 `input[type="range"]`：4px 軌道、18px 圓形拇指）。
- 來源以自繪拇指與 `rgba` 陰影；本系統改用原生外觀 + `accent-color`，避免寫死色碼並讓兩主題自動對應；`output` 與兩端刻度為新增。
