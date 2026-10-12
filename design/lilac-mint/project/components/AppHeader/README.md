# AppHeader
DOOPING 每個模組頁最上方的應用標頭：純文字字標（沒有 logo）、模組名、主導覽、環境徽章、使用者選單與主題切換，給所有登入後的頁面使用。

## 何時用
- 每個模組頁的第一個元素，sticky 固定在頂端，底下接工具列或內容。
- 導覽連結放模組內的主要頁面（組織圖／人員／草稿／合規），當前頁加 `aria-current="page"`。
- 非正式環境一律顯示環境徽章（測試環境、預備環境），正式環境不顯示。

## 不要用
- 不放 logo 或品牌圖像；字標只用文字「DOOPING」，模組名用文字。
- 不放搜尋框或頁內篩選，那些屬於工具列。
- 不在這裡放品牌漸層 CTA；標頭只用 ink 與次要按鈕。

## 狀態
- 導覽連結：預設 `--text-secondary`；hover `--text-primary`；當前頁 `aria-current="page"` → `--text-primary`、600、2px `--color-mint-dark` 底線。
- 使用者按鈕：`--surface-btn` 底、1px `--border-default`；hover `--surface-btn-hover` + `--border-hover`；停用 opacity 0.45。
- 主題切換：三顆 `aria-pressed` 小按鈕放在 `--surface-secondary` 軌道上；按下的那顆為 ink（`--text-primary` 底、`--background` 字）。
- 環境徽章：warning 低強度（`--sandbox-background-warning` 底、`--sandbox-text-warning` 字、`--sandbox-border-warning` 框）＋燒瓶圖示＋文字。
- 窄版（≤640px）：高度降為 64px、導覽換到第二列、模組名隱藏；480px 不得橫向捲動。

## 無障礙
- `<header>` 內的導覽用 `<nav aria-label="主導覽">`；當前頁以 `aria-current="page"` 標示，不只靠底線顏色。
- 主題切換用 `role="group" aria-label="主題"` 包三顆 `button[aria-pressed]`，每顆有視覺隱藏文字（`.lm-sr-only`）。
- 使用者按鈕帶 `aria-haspopup="menu"` 與 `aria-expanded`。
- 焦點環由 00-base 提供（`--focus-ring`，2px，offset 3px）。
- 文字對比：字標與連結在 `--surface-primary` 上 ≥4.5:1；底線顏色 `--color-mint-dark` 為非文字標記（≥3:1）。

## Token
- `--surface-primary` 疊在 `--background` 上作為標頭底色（深色主題不透出捲動內容）
- `--border-default` 底線與按鈕邊框；`--border-hover` 按鈕 hover 邊框
- `--text-primary` 字標與當前連結；`--text-secondary` 模組名與未選連結
- `--color-mint-dark` 當前頁底線
- `--color-mint` + `--on-brand` 使用者頭像縮寫
- `--sandbox-background-warning`／`--sandbox-text-warning`／`--sandbox-border-warning` 環境徽章
- `--surface-btn`／`--surface-btn-hover` 使用者按鈕；`--surface-secondary` 主題切換軌道
- `--radius-md` 按鈕圓角；`--space-8`／`--space-5` 橫向 padding 與間距

## 來源
- hand-written from apps/app/src/app/chat.css（`.chat-header` 高 76、padding 0 32、gap 20；`.chat-name` 16/600/-0.4px；≤640 高 64 與換行）與 provider-keys.css（≤600 flex-wrap）。
- 標頭按鈕尺寸同 `.chat-header-btn`（padding 6px 12px、13px/500、radius-md）；導覽連結由來源的 12px 提高到 13px/500 以與按鈕對齊。
- 主題切換軌道參考 gallery.css `.gal-seg`（padding 3px、radius 999、`--surface-secondary`）。
- 字標與模組名為 Intentional addition：OpenIntelligentUI 的 `.chat-brand` 是圖片 logo，DOOPING 改為純文字。
