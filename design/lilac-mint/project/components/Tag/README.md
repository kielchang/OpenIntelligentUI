# Tag
小型標籤家族：一般標籤、計數 tag、品牌 tag、可移除 tag，以及可切換的篩選 chip（`button[aria-pressed]`）；用來標示歸屬、來源與篩選條件，給 DOOPING 名冊、抽屜與篩選列使用。

## 何時用
- 標示一筆資料的歸屬或附加屬性（單位、地點、來源系統 SMERP／SMFLOW）。
- 顯示帶計數的分類（派遣 12、職缺 3）。
- 可切換的多選篩選：用 `.lm-chip` 並以 `aria-pressed` 表示選中。
- 使用者選了多個條件、可逐一移除：用 `.lm-tag__remove`。

## 不要用
- 系統狀態（draft／active／frozen…）：用 StatusBadge，顏色與圖示固定。
- 單選切換（只能選一個）：用 Inputs 群組的分段控制或 radio。
- 把 tag 當連結或按鈕：一般 `.lm-tag` 是 `<span>`，要可點的只有 chip 與移除鈕。

## 狀態
- 一般 `.lm-tag`：`--surface-tertiary` 底、1px `--border-default`、`--text-primary`、3px 10px、12px/500、pill。
- 計數 `.lm-tag__count`：標籤內右側小圓（`--text-primary` 底、`--background` 字、`--font-mono` 11px）。
- 品牌 `.lm-tag--brand`：`--color-lilac` 底、`--on-brand` 字、1px `--color-lilac-dark`。
- 可移除：標籤內放 `button.lm-tag__remove`（18px、× 圖示、`aria-label="移除"`），hover 底 `--surface-quaternary`。
- chip 未選 `.lm-chip[aria-pressed="false"]`：`--surface-primary` 底、1px `--border-default`；hover `--surface-btn-hover`。
- chip 選中 `[aria-pressed="true"]`：`--color-mint` 底、`--on-brand` 字、1px `--color-mint-dark`，並顯示勾號 `.lm-chip__check`。
- chip 停用：`:disabled`，透明度 0.5。

## 無障礙
- chip 是原生 `<button aria-pressed>`，Space／Enter 切換；一組 chip 外層加 `role="group" aria-label`。
- 選中不只靠顏色：勾號圖示 + `aria-pressed`。
- 移除鈕必須有 `aria-label="移除"`（可加上標籤名：「移除 兼任」）。
- 可移除 tag 的文字與 × 之間保持 pill 內距，點擊目標至少 18px。

## Token
- `--surface-tertiary` 一般 tag 底；`--surface-primary` chip 底；`--surface-btn-hover` chip hover；`--surface-quaternary` 移除鈕 hover。
- `--border-default`／`--border-hover` 邊框。
- `--text-primary` 文字與計數底；`--background` 計數文字。
- `--color-lilac`＋`--on-brand`＋`--color-lilac-dark` 品牌 tag；`--color-mint`＋`--on-brand`＋`--color-mint-dark` 選中 chip；`--color-mint-light`／`--color-lilac-light` hover。
- `--font-mono` 計數。

## 來源
- hand-written from apps/app/src/components/ui-gallery/gallery.css（`.gal-badge` pill 尺寸）與 apps/app/src/components/template-library/template-chip.tsx 的 chip 用法（composer 上方的單一可移除 chip）；篩選 chip 的 `aria-pressed` 與品牌色配對為 Intentional addition。
