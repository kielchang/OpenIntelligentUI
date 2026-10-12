# 呈現方式規則

## 先問題後畫面

說不出「這個畫面回答什麼問題」就不做互動 UI。任務只有三種：理解（清楚的模型加可改的有意義變數）、比較（攤開準則、取捨、假設）、做工具（可用的輸入、經驗證的計算、輸出、重設）。文字優先；靜態圖夠用就不加互動；不為了讓回答看起來厲害而加畫面。

| 任務 | 回應 | 渲染器 | 出處 |
| --- | --- | --- | --- |
| 快速事實、寫作、程式碼、閒聊 | 直接文字 | CopilotChat 的 assistant message（AnswerMarkdown） | docs/interactive-answers.md |
| 基本表格、精確數值比較 | A2UI Table | tableCatalog → DataTable（React 以文字渲染） | components/generative-ui/table-catalog.tsx |
| 理解機制或關係 | 圖解或互動說明 | generateSandboxedUi → 隔離 iframe | skills/svg-diagrams、advanced-visualization |
| 比較選項 | 表格、準則、取捨；必要時可調權重 | A2UI Table 或沙箱 | skills/master-playbook |
| 做一個工具 | 可用的輸入、計算、輸出與重設 | 沙箱（calculator） | skills/advanced-visualization |

## 13 種呈現型別

分類是封閉的，每種型別附適用條件與渲染路徑；判定後用「只保留允許的工具」強制執行，被剔除的工具：`barChart`、`pieChart`、`generate_form`。信心值要記也要用：低於門檻回文字加一個澄清問題。

| 型別 | 渲染路徑 | 條件與備註 |
| --- | --- | --- |
| `text` | text | 一般聊天回答 |
| `table` | a2ui | A2UI Table；≤12 欄、≤200 列、必填 source |
| `bar_chart` | open_generative_ui | 沙箱；importmap 提供 chart.js／d3 |
| `line_chart` | open_generative_ui | 沙箱 |
| `scatter_plot` | open_generative_ui | 沙箱 |
| `distribution` | open_generative_ui | 沙箱；模擬與理論值分開標示 |
| `part_to_whole` | open_generative_ui | 沙箱 |
| `flowchart` | open_generative_ui | 沙箱；svg-diagrams 技能 |
| `static_diagram` | open_generative_ui | 沙箱；svg-diagrams 技能 |
| `interactive_diagram` | open_generative_ui | 沙箱；可含 Three.js |
| `animated_route` | open_generative_ui | 沙箱；Leaflet + USGS + createTripAnimator |
| `map` | open_generative_ui | 沙箱；Leaflet + USGS 圖磚 |
| `calculator` | open_generative_ui | 沙箱；輸入驗證與重設 |

## 選型決策樹

1. 能一句話或一張表說清楚就不畫：文字或表格。
2. 需要精確值：表格為主（`table`），圖只做輔助且永遠配表。
3. 時間變化用折線（`line_chart`）；類別比較用長條（`bar_chart`）；兩個變數的關係用散佈（`scatter_plot`）；分佈用 `distribution`，模擬值與理論值分開標示；整體與部分用 `part_to_whole`，五類以內。
4. 流程與步驟用 `flowchart`；結構與關係用 `static_diagram`；需要操作才懂的機制用 `interactive_diagram`。
5. 空間用 `map`；有順序的地點用 `animated_route`。外部圖磚與函式庫可能載不到，先設計可見的失敗狀態。
6. 可調參數看結果用 `calculator`：輸入驗證、重設、輸出用 role=status。
7. 要送出或確認：表單與人機確認卡，走預建元件或宣告式目錄，不當場生成。
8. 以上都不確定：回文字，問一個澄清問題。

## 四條交付軌道

| 軌道 | 誰定版面 | 何時定 | 模型能動什麼 | 安全邊界 | 往返 | 適用 |
| --- | --- | --- | --- | --- | --- | --- |
| 預建元件 | 開發者 | 建置期 | 只給資料（props） | React 渲染，沒有任意程式 | 無 | 固定流程、精確值、企業主檔畫面（DOOPING 的組織圖、目錄、草稿） |
| 宣告式目錄（A2UI v0.9） | 目錄作者定元件；模型組樹 | 元件建置期、組合生成期 | 挑元件、巢狀、justify／align／weight、資料綁定、action 事件 | 無像素無顏色；JSON 可用 schema 驗證 | action → 事件 → 新回合 | 結構化但內容多變的表單、卡片、清單 |
| 當場生成（Open Generative UI） | 模型 | 生成期 | css、html、jsFunctions、jsExpressions 全部 | iframe 沙箱、CSP、importmap、橋接白名單、zod schema | sendPrompt({text}) 開新回合 | 開放式探索、計算器、圖解、模擬 |
| 伺服器 UI（MCP Apps） | 工具提供者 | 工具端建置期 | 無；模型只呼叫工具 | iframe、JSON-RPC over postMessage、ui:// 資源 | 工具呼叫 | 第三方工具自帶的畫面 |

同一系統可以同時有三條，但每個需求只走一條，由路由決定；混用的代價是兩套視覺語言並存（本系統以 `sandbox-` 前綴把沙箱那套收進同一份 token）。

## 呈現建議卡

每個新畫面先填這張卡，再開工：

- 需求一句話：
- 資料形狀：筆數、欄位數、是否時間序列、是否地理、是否需要精確值
- 互動需求：唯讀、篩選排序、調參數看結果、填表送出、人機確認
- 建議型別（主、備）與理由：
- 交付軌道與取捨：
- 必要元素：空狀態、載入、錯誤、文字替代、資料來源標示
- 驗收條目：
- 交接：配色、圖面

## 反模式

圖表取代精確表格；每個需求一個新元件；讓模型自由決定但沒有契約；沒有萬用出口的分類；失敗留白；把示意資料當真；互動只為了互動；行動裝置後補；信心值記了不用。
