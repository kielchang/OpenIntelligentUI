# 情境覆蓋驗收

規則與真實產出之間要有自動驗收；讀碼不算覆蓋。

## 情境矩陣

列是型別，欄是任務與失敗情境；每格至少一個 golden prompt 與一個快照。

| 型別 ＼ 情境 | 理解 | 比較 | 做工具 | 資料缺 | 外部服務掛 | 窄版 |
| --- | --- | --- | --- | --- | --- | --- |
| table | ✓ | ✓ | — | 空表 EmptyState | — | 容器水平捲動 |
| bar_chart／line_chart | ✓ | ✓ | — | No data available | chart.js 載不到 → 文字表格 | 圖寬 100% |
| calculator | — | ✓ | ✓ | NaN 顯示錯誤 | — | 輸入直排 |
| flowchart／static_diagram | ✓ | — | — | — | — | viewBox 縮放 |
| map／animated_route | ✓ | — | — | 無座標 → 清單 | 圖磚被擋 → 文字行程 | 高度固定 |
| 表單／確認卡 | — | — | ✓ | 必填錯誤 | 送出失敗 → 重試 | 單欄 |

## 產出自動檢查（每個樣本）

- 通過 schema（六欄位型別、initialHeight 50–4000）。
- `html` 不含 `<style>`／`<script>`；`css` 只用 token 變數、沒有 raw hex。
- `jsFunctions` 與每條 `jsExpressions` 可被 `new Function` 解析（頂層 await／import 會失敗）。
- 存在 `role="status"` 元素；錯誤路徑可見；沒有 NaN；480px 不溢出。
- 追問按鈕走橋接白名單；外部 URL 只在允許清單內。

## Golden prompt 與快照

每格一個固定 prompt，產出存成快照；視覺回歸容忍 1%。快照不是用來鎖死像素，是用來讓規則改變時看得見影響。

## 真實代理端到端

契約測試（文件彼此不矛盾）不等於情境測試。至少每週跑一次真實代理：固定 prompt 集、記錄型別判定與信心值、比對快照；信心值低於門檻的回答要落到文字加澄清問題，否則算失敗。

## 信心門檻與降級

- 判定信心 < 0.6：回文字加一個澄清問題。
- 0.6–0.8：允許型別但強制「圖配表」。
- > 0.8：照型別。
- 連續兩次同型別失敗（schema 或檢查）：降級到表格或文字。

## OpenIntelligentUI 的缺口（案例）

- **placeholderMessages 從未顯示**：系統提示要求代理輸出 2–4 則進度訊息，但本地 schema 沒有這個欄位，渲染器一律顯示內建的 LOADING_PHRASES。（apps/agent/src/prompt.py、apps/app/src/components/generative-ui/open-generative-ui/schema.ts、apps/app/src/components/generative-ui/open-generative-ui/renderer.tsx）
- **Jev 路由下原生圖表與表單工具永遠被剔除**：barChart、pieChart、generate_form 列在 RENDER_TOOLS 卻不在任何允許集合，每一輪都會被 JevVisualizationMiddleware 過濾；前端註冊的 useComponent 因此不可達。（apps/agent/src/visualization_router.py、apps/app/src/hooks/use-generative-ui-examples.tsx）
- **沙箱深色跟作業系統、app 深色跟 .dark class**：THEME_CSS 只用 prefers-color-scheme；app 用 ThemeProvider 切 :root.dark（預設 light）。作業系統深色但 app 淺色時，iframe 內容會變成淺字配透明底。（packages/design-system/src/index.ts、apps/app/src/hooks/use-theme.tsx、apps/app/src/components/generative-ui/open-generative-ui/renderer.tsx）
- **seed 範本違反自己的設計規則**：規則要求字重只用 400/500、不硬編 hex；weather/invoice/dashboard 使用 600/700 字重，dashboard 的長條用硬編 indigo→emerald 漸層。（apps/app/src/components/template-library/seed-templates.ts、apps/agent/skills/svg-diagrams/SKILL.md）
- **generate_form 的 A2UI 訊息是 0.8 格式，前端渲染器是 0.9**：form.py 輸出 surfaceUpdate／beginRendering 與巢狀 {Card:{…}} 物件；@copilotkit/a2ui-renderer 走 createSurface／updateComponents 與扁平 {component:"Card"}；app 目錄也只註冊 Table。（apps/agent/src/form.py、apps/app/src/components/generative-ui/table-catalog.tsx）
- **globals.css 與 design-system 的 token 命名空間重疊**：兩邊都定義 --color-text-primary/secondary/tertiary，值不同（#010507 vs #1a1a1a）；app 另有 --text-* 與 --surface-* 第三組命名。（apps/app/src/app/globals.css、packages/design-system/src/index.ts）

這些缺口的共同點：規則寫在提示與技能裡，但沒有任何測試拿真實產出對照規則。本系統把規則寫成 token 與元件狀態，驗收清單寫成可執行的檢查。
