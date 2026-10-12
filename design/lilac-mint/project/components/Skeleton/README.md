# Skeleton
內容載入前的形狀佔位：以 `--surface-quaternary` 的圓角色塊模擬即將出現的文字列、頭像＋兩行、表格列，讓版面先就位；閃爍只在 `prefers-reduced-motion: no-preference` 下啟用；給 DOOPING 名冊、抽屜與卡片的首次載入使用。

## 何時用
- 即將出現的內容形狀可預期（表格、人員卡、屬性清單），而且載入通常 0.3–3 秒。
- 要避免內容到達時版面跳動。

## 不要用
- 形狀不可預期的生成內容：用 LoadingPlaceholder。
- 載入極短（<300ms）：不顯示。
- 載入失敗或結果為空：換成 Alert／EmptyState，不要讓骨架一直閃。
- 不要用骨架模擬按鈕或輸入框，使用者會嘗試點。

## 狀態
- 基本 `.lm-skeleton`：高 12px、`--surface-quaternary` 底、`--radius-sm`。
- 變體：`--heading`（16px 高）、`--circle`（40px 圓）、寬度 `--long`（92%）／`--medium`（72%）／`--short`（46%）。
- 組合：`.lm-skeleton-group`（直排、gap 10px）、`.lm-skeleton-row`（頭像＋群組）、`.lm-skeleton-table`（4 欄 grid、`--head` 表頭列、外框與 `--surface-primary` 底）。
- 動畫：`lm-skeleton-pulse` 1.4s 透明度 1→0.55，只在 `prefers-reduced-motion: no-preference`；reduce 時靜止。
- 列數與寬度照真實內容估計；表格骨架列數 = 每頁筆數的前 4–5 列即可。

## 無障礙
- 骨架容器 `aria-hidden="true"`；旁邊放一個 `.lm-sr-only` 的「載入中」給螢幕閱讀器。
- 內容到達後移除「載入中」文字，或改成 `role="status"` 宣告「已載入 N 筆」。
- 色塊不是文字，不受 4.5:1 約束；深色主題下 `--surface-quaternary` 為 5% 白，與表面有可辨差異即可。

## Token
- `--surface-quaternary` 色塊；`--surface-tertiary` 表頭色塊；`--surface-primary` 表格骨架底。
- `--border-default` 表格骨架外框與表頭框；`--radius-sm` 色塊圓角；`--radius-lg` 表格外框。
- `--space-3`／`--space-4` 間距。

## 來源
- Intentional addition：OpenIntelligentUI 以 LoadingPlaceholder（renderer.tsx）處理生成等待，沒有骨架元件；依 DOOPING 清單與抽屜的載入需求新增；表格骨架尺寸依 DataTable（列高 ≈ 37px、4 欄）。
