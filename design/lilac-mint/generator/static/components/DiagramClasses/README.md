# DiagramClasses
給 inline SVG 圖解用的一組 class：`.box` 方塊、`.node` 可點節點、`.arr` 箭頭、`.leader` 註記虛線、`.t`／`.ts`／`.th` 文字與九個色階 `.c-<name>`，全部只在 `.lm-diagram svg` 範圍內生效；給流程圖、架構圖、說明圖解使用。

## 何時用
- 用 SVG 畫流程、關係、架構時，把 SVG 放進 `<div class="lm-diagram">`，形狀與文字只寫 class、不寫色碼。
- 同類節點同一個色階（`.c-teal` 全是「輸入」、`.c-amber` 全是「寫入」），色階表意要在圖內或 caption 說明。
- 箭頭用 `<line class="arr" marker-end="url(#id)">`，`<marker>` 內的路徑用 `.arr-head`（currentColor），線與箭頭永遠同色。

## 不要用
- 不要在 SVG 內寫 `fill="#…"` 或 `prefers-color-scheme` 覆寫；淺深兩套值已在 `--ramp-*` token 裡。
- 色階不是語意色：危險／成功走 Alert 與 StatusBadge，不用 `.c-red`／`.c-green` 表達。
- 不要在圖解裡放小於 12px 的文字；`.ts` 已是最小。
- 不要把 `.lm-diagram` 放在品牌漸層或玻璃上，底色必須是沙箱底色。

## 狀態
- 容器 `.lm-diagram`：`--sandbox-background-primary` 底、1px `--border-default`、`--radius-lg`、padding `--space-4`；文字 `--sandbox-text-primary`／`--sandbox-text-secondary`。
- `.box`：fill `--sandbox-background-secondary`（`--sandbox-svg-bg2`）、stroke `--sandbox-border-tertiary`（`--sandbox-svg-b`）、1px。
- `.node`：`cursor: pointer`，hover opacity 0.8。
- `.arr`：stroke currentColor（svg 的 `color` = `--sandbox-svg-s`）、1.5px；`.arr-head` 同色。
- `.leader`：`--sandbox-svg-t`、1px、4 4 虛線。
- 文字：`.t` 13px/400、`.ts` 12px/400（`--sandbox-svg-s`）、`.th` 14px/600。
- 九色階 `.c-purple`／`teal`／`coral`／`pink`／`gray`／`blue`／`green`／`amber`／`red`：rect／circle／ellipse 的 fill `--ramp-<name>-fill`、stroke `--ramp-<name>-stroke`；`.t`／`.th` 用 `--ramp-<name>-text`、`.ts` 用 `--ramp-<name>-text-small`。

## 無障礙
- `<svg role="img" aria-label>` 把流程用文字講一遍（「送出草稿，經驗證，再排程生效」）。
- 節點意義不只靠顏色：每個方塊都有 `.th` 標題與 `.ts` 說明文字。
- ramp 的 fill 與 stroke 之間至少 3:1，text 與 fill 之間 ≥4.5:1（淺深兩套都是）。
- `.node` 可點時另外提供鍵盤可達的替代操作（SVG 內的元素不在 tab 順序）。

## Token
- `--sandbox-background-primary`／`--border-default`／`--radius-lg` 容器
- `--sandbox-svg-p`／`--sandbox-svg-s`／`--sandbox-svg-t` 文字與線
- `--sandbox-svg-bg2`／`--sandbox-svg-b` `.box` 的 fill 與 stroke
- `--ramp-<name>-fill`／`-stroke`／`-text`／`-text-small`（name ∈ purple teal coral pink gray blue green amber red）

## 來源
- hand-written from packages/design-system/src/index.ts `SVG_CLASSES_CSS`（`.box`、`.node`、`.arr` 1.5px、`.leader` 4 4 虛線、九色階的 fill／stroke／text 配色）；深色值由來源的 `@media (prefers-color-scheme: dark)` 改為 token 兩套值。
- 文字字級依本系統型階：`.t` 13px、`.ts` 12px、`.th` 14px/600（來源 `.t` 14px、`.th` 500）；`.leader` 由 0.5px 改為 1px 以免在一般螢幕上看不見。
- 三步流程範例改寫自 apps/agent/skills/svg-diagrams/SKILL.md 的「Simple 3-Step Flow」，箭頭改用 currentColor 而非 context-stroke。
