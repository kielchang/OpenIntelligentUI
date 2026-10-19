# CheckboxRadio
以 `fieldset/legend` 分組的原生勾選框與單選鈕，每項可帶說明文字，支援 indeterminate、停用與水平／垂直排列；給匯出選項、生效方式、狀態篩選等少量固定選項用。

## 何時用
- 多選用 checkbox；互斥單選且選項 2–6 個、要一眼看完所有選項時用 radio。
- 選項需要一句說明（「含派遣／約聘計數」）時，把它放在 `.lm-choice__desc`，不要塞進 label 本文。
- 父子勾選（全部／單位／職位）用 indeterminate 表示「部分勾選」，由子項狀態推導，不讓使用者直接設定。
- 選項很短、空間夠寬時用 `.lm-choice-group--inline` 排成一列；有說明文字時一律垂直。

## 不要用
- 選項超過 6 個或名稱很長：用 Select。
- 切換立即生效的檢視模式：用 SegmentedControl。
- 只有一個是／否且會立即生效的設定：仍用 checkbox，不另做 switch。
- 不要省略 `fieldset/legend`，否則螢幕閱讀器不知道這些選項屬於哪個問題。

## 狀態
- 預設：16px 原生控制項，`accent-color: var(--color-mint-dark)`；label 文字 `--text-primary` 14px，說明 `--text-secondary` 12px。
- checked／indeterminate：由瀏覽器以 accent 色繪製；indeterminate 必須用 JS 設 `input.indeterminate = true`（沒有 HTML 屬性）。
- 停用：`disabled`，整個 `.lm-choice` `opacity: .5`、`cursor: not-allowed`（透過 `:has()`，舊瀏覽器可加 `.is-disabled`）。
- focus-visible：`--focus-ring` 2px、offset 3px 套在原生控制項上。
- 深色主題以 `color-scheme: dark` 讓未勾選的框跟著變深。

## 無障礙
- 群組用 `<fieldset class="lm-choice-group">` + `<legend class="lm-choice-group__legend">`；radio 同組共用 `name`。
- 每項用 `<label class="lm-choice">` 包住 input 與文字，整列可點。
- 鍵盤：checkbox Tab 到每一個、Space 切換；radio 群只佔一個 Tab 停留點，↑↓／←→ 在組內移動。
- 父項 checkbox 以 `aria-controls` 指向子項；狀態變更時同步 `checked` 與 `indeterminate`。
- `--color-mint-dark` 對淺色底 3.85:1、深色底 4.78:1，符合 UI 元件 ≥3:1；勾選狀態另有勾號／圓點形狀，不只靠顏色。

## Token
- `--color-mint-dark` accent 色（勾選、圓點）。
- `--text-primary` 選項文字與 legend；`--text-secondary` 說明文字。
- `--space-2`／`--space-5` 垂直與水平間距；`--focus-ring` 焦點環。

## 來源
- hand-written from packages/design-system/src/index.ts（`FORM_STYLES_CSS` 的 `input[type="checkbox"], input[type="radio"]`：16px、accent-color）。
- 來源以 `--color-text-info` 當 accent；本系統改用品牌色 `--color-mint-dark`，並新增 fieldset 分組、說明文字與 indeterminate 示範。
