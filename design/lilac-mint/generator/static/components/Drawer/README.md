# Drawer
從右側滑入的 420px 面板，用來看一筆資料的細節或編輯一筆，不離開目前列表或組織圖；給人員、職位、單位、草稿變更的詳情與編輯使用。

## 何時用
- 從列表或組織圖點一個節點，看它的完整欄位、任職歷程、合規建議。
- 編輯一筆資料的表單（欄位超過三個、需要捲動）。
- 使用者需要同時看到底下的列表或圖（抽屜不遮住全部畫面）。

## 不要用
- 只是要確認一個動作或填一兩個欄位：用 Dialog（對話框確認／短表單，抽屜看細節／編輯一筆）。
- 多步驟流程或整頁表單：導到獨立頁面。
- 不要同時開兩個抽屜；第二層細節改在面板內切換內容。

## 狀態
- 關閉：`.lm-drawer` 為 `display: none`、`aria-hidden="true"`。
- 開啟：加 `.is-open`、`aria-hidden="false"`；遮罩 `--backdrop`，面板 `--surface-primary` 疊在 `--background` 上、左框 `--border-default`、`--shadow-lg`。
- 開啟動畫（180ms 位移淡入）只在 `prefers-reduced-motion: no-preference`。
- 面板分三段：`__header`（標題、副標、關閉鈕）、`__body`（可捲動）、`__footer`（動作列，`--surface-secondary` 底）。
- 內嵌展示 `.lm-drawer--inline`：static、固定高 260px、無遮罩，只用在文件與預覽。
- 窄版：面板寬 `min(420px, 100vw)`，手機上佔滿寬度。

## 無障礙
- 面板 `role="dialog" aria-modal="true" aria-labelledby` 指向標題；容器 `aria-hidden` 隨開關切換。
- 開啟：`data-lm-drawer-open="id"` 或 `LilacMint.drawer.open(el)`，焦點移到面板第一個可聚焦元素。
- 關閉：`data-lm-drawer-close`（關閉鈕、遮罩、頁尾按鈕）、Esc；關閉後把焦點還給開啟按鈕（頁面自行處理）。
- 關閉鈕是 32px 圖示按鈕，必須有 `aria-label="關閉"`。
- 面板內文字只用 `--text-primary`／`--text-secondary`。

## Token
- `--backdrop` 遮罩
- `--surface-primary` 疊在 `--background` 上為面板底；`--surface-secondary` 頁尾底
- `--border-default` 面板左框與分段線；`--border-hover` 按鈕 hover 框
- `--shadow-lg` 面板陰影
- `--text-primary` 標題與值；`--text-secondary` 副標、欄位名、關閉鈕
- `--surface-btn`／`--surface-btn-hover` 次要按鈕；ink 按鈕 `--text-primary` 底 + `--background` 字
- `--radius-md` 按鈕與關閉鈕；`--space-5` 面板橫向 padding

## 來源
- Intentional addition：OpenIntelligentUI 的 `.demo-gallery-drawer`（globals.css）只有定位與滑入規則（右側 480px、`max-width: 90vw`），沒有標頭／內容／頁尾結構；本元件依 DOOPING「看細節／編輯一筆」的需求定寬 420px 並補齊結構。
- 按鈕尺寸同 chat.css 標頭按鈕（padding 6px 12px、13px/500、radius-md）；標題字級同 `.chat-name`（16/600/-0.4px）。
- 開關行為由 bundle.js `LilacMint.drawer` 提供。
