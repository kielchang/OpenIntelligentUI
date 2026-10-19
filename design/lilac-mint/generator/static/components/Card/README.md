# Card
把一組相關內容框成一個表面的容器：預設、含標頭與頁尾、緊湊、可點擊與玻璃五種變體，給列表頁、儀表板與詳情頁的分區使用。

## 何時用
- 一個主題一張卡：一個單位的摘要、一筆草稿、一組合規建議。
- 需要標題＋動作＋內容＋頁尾動作時用 `lm-card--sectioned`，把動作放在 `__header` 右側或 `__footer`。
- 整張卡是一個連結時用 `<a class="lm-card">`，裡面不再放其他可點擊元素。
- 玻璃版只放在歡迎畫面或品牌區，底下要有品牌色塊或影像才看得出效果。

## 不要用
- 不要在表格列或清單項目外再包一層卡（表格自己就是表面）。
- 不要用左側彩色粗邊表達狀態；狀態用 StatusBadge 或 Alert。
- 不要把玻璃版用在資料頁；半透明底會降低文字對比。
- 不要在卡內放裝飾性漸層或無意義動畫。

## 狀態
- 預設：`--surface-primary` 底、1px `--border-default`、`--radius-lg`、`--shadow-card`（深色主題為 none，靠表面亮度分層）。
- 緊湊：padding `--space-3`、`--shadow-compact`。
- 可點擊 hover：`--shadow-card-hover` + `--border-hover`；焦點環 `--focus-ring`。
- 玻璃：`--color-glass` 底、`--color-border-glass` 框、`--shadow-glass`、backdrop-filter blur(12px)、`--radius-xl`。
- 標頭／頁尾分隔線 `--border-subtle`；頁尾底 `--surface-secondary`。

## 無障礙
- 卡片本身沒有角色；標題用 `<h2>`／`<h3>` 維持頁面大綱。
- 可點擊版用真正的 `<a href>`，整張卡是一個焦點目標；hover 效果以陰影＋邊框表達，不只靠顏色。
- 動作按鈕放 `__header` 右側或 `__footer`，按鈕文字直接說明動作（檢視、排程、取消）。
- 玻璃版文字只用 `--text-primary`／`--text-secondary`，在兩主題的玻璃底上都 ≥4.5:1。

## Token
- `--surface-primary` 卡片底；`--surface-secondary` 頁尾底；`--surface-btn`／`--surface-btn-hover` 卡內按鈕
- `--border-default` 外框；`--border-hover` 可點擊 hover 外框；`--border-subtle` 標頭／頁尾分隔線
- `--shadow-card`／`--shadow-card-hover`／`--shadow-compact`／`--shadow-glass` 陰影
- `--radius-lg` 預設圓角；`--radius-xl` 玻璃版圓角；`--radius-md` 卡內按鈕
- `--text-primary` 標題與內文；`--text-secondary` meta 與說明
- `--color-glass`／`--color-border-glass` 玻璃版
- `--space-4`／`--space-3` padding

## 來源
- hand-written from apps/app/src/app/globals.css（卡片 padding space-4、1px border-default、radius-lg、surface-primary、shadow-card；`.glass` 的 color-glass、color-border-glass、blur(12px)、shadow-glass、radius-xl）。
- 緊湊版陰影取 globals.css `--shadow-compact`；可點擊 hover 取 `--shadow-card-hover` 與 `--border-hover`。
- 標頭／頁尾分區為 Intentional addition：OpenIntelligentUI 的卡片沒有固定分區，依 DOOPING 草稿卡需求新增。
