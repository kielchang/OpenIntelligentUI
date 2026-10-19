# 三套生成式 UI 規格

解析 AG-UI 文件列出的 A2UI、Open-JSON-UI、MCP-UI（MCP Apps），以及「排版由誰決定、何時決定、從集合挑還是當場生成」。

## 一、三套規格與本專案的對應

AG-UI 那一頁本身只有一張三列的表加兩句話：A2UI、Open-JSON-UI、MCP-UI 是「生成式 UI 規格」，AG-UI 不是規格而是代理與應用之間的雙向互動協定，三套規格都能跑在它上面。下面依原始碼與各家文件把三套拆開，再對回這個專案。

先講一個命名漂移。AG-UI 頁把第三套寫成「MCP-UI，Microsoft + Shopify」，但 CopilotKit 現行文件的同一張表已改成「MCP Apps，MCP Ecosystem」。兩者是同一條血脈：MCP-UI 是 Shopify 工程師 Ido Salomon 與 Liad Yosef 發起的社群專案，2025 年 11 月由 Anthropic 與 OpenAI 的 MCP 維護者連同 MCP-UI 作者提出 SEP-1865，標準化成 MCP Apps 擴充。AG-UI 的 middleware 實作的是 MCP Apps 定版後的常數，不是舊 MCP-UI。

### 三套規格逐一解析

**A2UI，Google 主導**

- 定位：宣告式資料格式，官方說法是「safe like data, but expressive like code」。代理送的是 JSON，不是可執行程式碼。目前 v0.9.1 為正式版，v1.0 為候選版，v0.8 為舊版，整體仍標示「early stage public preview」。
- 訊息模型：扁平元件清單，以 id 互相引用，官方理由是這種結構「easy for LLMs to generate incrementally」。v0.9 的四個操作是 createSurface、updateComponents、updateDataModel、deleteSurface。資料綁定用 JSON Pointer，寫成 `{ "path": "/origin" }`。
- 渲染與安全：客戶端持有一份「已核准元件目錄」，代理只能點名目錄內的元件，渲染由各平台自己的原生元件完成。官方提供 Lit 與 Flutter 渲染器，React 由 CopilotKit 的 `@copilotkit/a2ui-renderer` 補上。
- 互動回傳：使用者操作變成 action 事件，帶 name、surfaceId、sourceComponentId、timestamp、context。AG-UI 的 middleware 把它轉成一句文字訊息塞回對話，再觸發代理下一輪。
- AG-UI 接法：`@ag-ui/a2ui-middleware` 發出 activity 型別 `a2ui-surface`。有兩種流派。固定 schema 是工具回傳 `a2ui_operations` 信封，代理只填資料。動態 schema 是注入 `generate_a2ui` 工具，由次級模型串流 `render_a2ui` 呼叫，middleware 等整個 components 陣列完整才開始畫。
- 強弱：強在安全、跨平台、可串流、外觀與宿主一致。弱在表現力被目錄封頂，動態模式多一次模型呼叫，0.8 與 0.9 的訊息信封不相容，綁定欄位的 Zod 型別若寫成純字串會在渲染時直接拋 React error #31。

**Open-JSON-UI，掛名 OpenAI**

- 定位：兩份文件都只寫一句「OpenAI 內部宣告式生成 UI schema 的開放標準化」。
- 我能找到的全部材料：CopilotKit 的 generative-ui 範例 README 給了一段標示為 illustrative 的 JSON，形狀是 `type: "open-json-ui"` 包一個 `spec.components` 陣列，每個元件有 type 與 properties。除此之外沒有 OpenAI 的規格倉庫、沒有 npm 套件、CopilotKit 現行文件原始碼裡也沒有專頁，概覽頁的「Learn More」只連 A2UI 與 MCP Apps。第三方目錄 ag-ui.ai 同樣標記「無法確認第一方規格、版本政策與相容性測試」。
- 結論：它目前是分類表上的一個占位名稱，不是可以實作的規格。OpenAI 公開的 UI 路線其實走進了 MCP Apps，因為 MCP Apps 提案的共同作者就包含 OpenAI Apps SDK 團隊，而 Apps SDK 用的是 HTML iframe，不是 JSON 元件樹。
- 強弱：無法評估。任何以它為基礎的設計都應視為暫定。

**MCP-UI 到 MCP Apps，Shopify 社群起步，MCP 官方定版**

- 定位：讓 MCP 工具在回傳文字之外附帶一段可互動 UI，宿主把它當容器顯示。CopilotKit 把這類歸為「open-ended」，代價是「security/performance concerns when rendering arbitrary content, inconsistent styling, and reduced portability outside the web」。
- 訊息模型：伺服器先以 `ui://` 為 scheme 預先宣告 UI 資源，工具在 `_meta.ui.resourceUri` 指向它，mime 為 `text/html;profile=mcp-app`，能力宣告鍵是 `io.modelcontextprotocol/ui`。靜態模板與動態工具結果分開，所以模板可快取。MCP-UI 原本支援 inline HTML、外部 URL、Remote DOM 三種，MCP Apps 初版只收 HTML，其餘延後。
- 渲染與安全：沙箱 iframe 是硬規定。CopilotKit 渲染器用 `allow-scripts allow-same-origin allow-forms`，iframe 與宿主之間走 JSON-RPC over postMessage，方法有 ui/initialize、ui/notifications/*、ui/message、ui/open-link。iframe 要回呼伺服器時，宿主只代理四種方法：tools/call、resources/read、notifications/message、ping。`_meta.ui.visibility` 可以把工具標成只給模型或只給 UI。提案文件要求伺服器為每個 UI 工具提供純文字 fallback。
- 互動回傳：UI 直接對伺服器呼叫工具，宿主可要求使用者同意；要和代理對話則用 ui/message 送提示。
- 強弱：強在前端零程式碼、完整互動、UI 由伺服器維護、能存進對話紀錄重開。弱在樣式與宿主脫節、每次顯示要一趟伺服器往返、只限瀏覽器、serverId 不固定會讓舊對話裡的 UI 無法還原。

### 三套並排，加上這個專案實際用的第四條路

| 面向 | A2UI | Open-JSON-UI | MCP Apps | Open Generative UI，本專案主路徑 |
|---|---|---|---|---|
| UI 由誰決定 | 代理挑目錄內元件 | 不明 | MCP 伺服器預先宣告 | 代理當場寫 HTML/CSS/JS |
| 傳輸單位 | JSON 操作，可串流 | 示意 JSON | `ui://` 資源 + 工具結果 | 工具呼叫參數，六欄位依序串流 |
| 渲染 | 宿主原生元件 | 不明 | 沙箱 iframe | 沙箱 iframe，先預覽後正式 |
| 回傳管道 | action 事件 | 不明 | JSON-RPC，可直呼工具 | 驗證過的 sendPrompt 與 openLink 橋 |
| 安全邊界 | 只能用目錄 | 不明 | iframe + 方法白名單 | iframe + CSP + 橋接白名單 |
| 控制與自由 | 共享 | 不明 | 低控制高自由 | 低控制高自由，但無伺服器往返 |

CopilotKit 自己的 README 把 Open Generative UI 列為第四類，與 MCP Apps 的差別寫得很直接：MCP Apps 是代理呼叫遠端工具、伺服器回一個 iframe 來源，重活在伺服器；Open Generative UI 是內容直接放在工具呼叫裡，沒有伺服器往返也沒有 URL。這個專案的 `generateSandboxedUi` 就是這條路，所以它不在 AG-UI 那頁的三套之內。

對回專案的實際狀態：

- **A2UI 有用但只用了一小角。** 前端目錄只註冊一個 Table 元件，欄位是 title、columns、rows、source，目錄 id 是 `copilotkit://open-generative-ui-tables`，runtime 開了 `injectA2UITool`。Jev 路由只把「基本表格」送去 A2UI。代理端的 `form.py` 仍輸出 0.8 風格的 surfaceUpdate 與 beginRendering 巢狀物件，0.9 渲染器畫不出來，這就是 /gallery 用靜態複刻呈現登入卡的原因。另外 `lib/a2ui-theme.css` 從首次提交就存在、沒有任何引用。
- **MCP Apps 是可選接頭，而且自家伺服器不合規。** 只有設了 `MCP_SERVER_URL` 才會把 `mcpApps.servers` 交給 runtime，runtime 會自動套 middleware。專案自帶的 `apps/mcp` 伺服器只註冊工具，沒有 `_meta.ui` 也沒有 `ui://` 資源，所以它是一般 MCP 伺服器，接進來不會出現任何 UI。
- **Open-JSON-UI 完全沒用到，也沒有東西可用。**

### 對這個專案的意義

- **路線選擇是合理的。** 這個產品要的是圖表、模擬器、計算器這類開放式互動，A2UI 的目錄模式封頂太低，MCP Apps 又要求把 UI 搬到伺服器端維護。Open Generative UI 把開放式與零往返結合，代價是全部安全責任落在前端的 CSP、沙箱與橋接白名單上，這部分 /gallery 的「約束層」已經逐條對照過。
- **A2UI 的角色應該明確化。** 它現在只服務表格，卻留著 0.8 格式的表單工具與未引用的主題檔。要嘛把 `form.py` 改成 0.9 的 createSurface 與 updateComponents 並把 Button、TextField 補進目錄，要嘛移除表單工具與主題檔，兩者都比現在的半套乾淨。
- **MCP Apps 的位置是「接外部服務」，不是「包自己的 UI」。** 若未來要接 Excalidraw 這類現成 MCP App，現有接頭夠用，記得固定 serverId。若想把自家 `apps/mcp` 升級成 MCP App，需要加 `ui://` 資源與 `_meta.ui.resourceUri`，並為每個 UI 工具提供文字 fallback。
- **不要為 Open-JSON-UI 預留抽象。** 等 OpenAI 或 CopilotKit 真的發布規格再說。

目前 /gallery 的「設計方法」區塊有 web 渲染器與 MCP assemble_document 的對照表，但沒有這三套規格的對照。若要，我可以把上面的並排表與專案對應做成新的「規格對照」區塊加進頁面。

Sources:
- [AG-UI: Generative UI specs](https://docs.ag-ui.com/concepts/generative-ui-specs)
- [CopilotKit/generative-ui README](https://github.com/CopilotKit/generative-ui)
- [CopilotKit monorepo docs source: A2UI, MCP Apps, Open Generative UI, specs overview](https://github.com/CopilotKit/CopilotKit/tree/main/showcase/shell-docs/src/content)
- [google/A2UI README](https://github.com/google/A2UI)
- [MCP blog: MCP Apps extension SEP-1865](https://blog.modelcontextprotocol.io/posts/2025-11-21-mcp-apps/)
- [Shopify Engineering: MCP-UI, breaking the text wall](https://shopify.engineering/mcp-ui-breaking-the-text-wall)
- [The New Stack: MCP-UI creators on rich user interfaces](https://thenewstack.io/mcp-ui-creators-on-why-ai-agents-need-rich-user-interfaces/)
- [ag-ui-protocol/ag-ui: a2ui-middleware and mcp-apps-middleware source](https://github.com/ag-ui-protocol/ag-ui/tree/main/middlewares)
- [CopilotKit docs: Open-JSON-UI page, unreachable from this container](https://docs.copilotkit.ai/agno/generative-ui/open-json-ui)
- [ag-ui.ai: Open-JSON-UI entry](https://ag-ui.ai/en/technologies/open-json-ui)
## 二、排版誰決定、何時決定

三套規格對「排版誰決定」的答案各不相同，而且「明確定義」和「LLM 設計」不是二選一，中間還有「LLM 從固定積木裡組合」這一層。用兩個軸看最清楚：排版由誰定、何時定。

| 路線 | 排版由誰定 | 何時定 | LLM 能動的範圍 | 挑選還是當場做 |
|---|---|---|---|---|
| Controlled，AG-UI 前端工具 | 開發者寫 React 元件 | 建置時 | 只選哪個元件、填資料 | 從集合挑 |
| A2UI 固定 schema | 開發者寫 JSON 元件樹 | 建置時 | 只填資料模型 | 從集合挑 |
| A2UI 動態 schema | 次級 LLM 從目錄組合 | 執行時 | 選元件、排巢狀、給版面提示 | 當場組合，材料固定 |
| MCP Apps | 伺服器開發者寫 HTML 模板 | 建置時，預先宣告 | 只選工具、傳參數 | 從集合挑 |
| Open Generative UI，本專案主路徑 | LLM 寫 HTML/CSS | 執行時 | 整個版面、尺寸、互動 | 當場設計 |

幾個關鍵細節：

- **A2UI 的「排版」只有版面提示，沒有像素。** v0.9 基本目錄共 18 個元件，排版能力集中在 Row 與 Column 的 justify、align，子元件的 weight 類似 flex-grow，Text 的 variant 只有 h1 到 h5、body、caption，Image 的 variant 是 icon、avatar、smallFeature 這種尺寸等級。沒有 CSS、沒有寬高數字、沒有顏色。實際長相由客戶端渲染器與主題決定，所以同一份 JSON 在 Lit、Flutter、React 上各自長得像宿主。LLM 設計的是結構與相對關係，不是視覺。
- **A2UI 動態模式是「當場組合、材料固定」。** 開發者先定目錄並寫好每個元件的描述，runtime 把目錄序列化進代理上下文，次級 LLM 只能從這份清單點名。目錄可以加自訂元件，但每個自訂元件仍是開發者預先寫好的 React 渲染器。
- **MCP Apps 完全不讓 LLM 碰排版。** UI 模板是伺服器預先宣告的 `ui://` 資源，工具呼叫時宿主抓模板、把工具結果以 JSON-RPC 通知塞進 iframe。LLM 的決策只到「叫哪個工具、帶什麼參數」。提案文件還特別把模板與資料分離，理由是模板可快取。
- **Open Generative UI 是真的當場設計，但有文字規則約束。** 代理拿到的排版指引全是自然語言：設計技能寫「flex/grid 搭配緊湊間距」，進階技能給一條固定的響應式網格公式，系統提示要求支援窄版、估算 initialHeight、避免固定寬度溢出。設計系統 CSS 固定的是顏色、字體、表單控制項樣式與 SVG 色階，不固定版面。所以版面品質取決於模型遵守規則的程度，這也是我先前列的弱項之一。

對這個專案而言，它其實是兩段式：

1. **第一段是從集合挑。** Jev 路由在 13 種型別裡選一個，表格走 A2UI、短答走文字、其餘走沙箱。這一步是挑渲染路線，不是設計版面。
2. **第二段依路線分流。** 走 A2UI Table 時版面由 DataTable 元件固定，LLM 只給 title、columns、rows、source。走沙箱時 LLM 當場寫整個版面。另外 barChart、pieChart、plan_visualization、schedule_meeting 是開發者預建的 React 元件，LLM 只填資料，屬於 Controlled 那一格。

兩個邊角：`form.py` 的登入卡是開發者手寫的 A2UI 元件樹，alignment 與 usageHint 都寫死，性質是固定 schema。template-library 的三份 seed 是預建版面集合，但沒掛載，挑選機制 pending_template 也沒人消費。所以專案裡「從版面集合挑」的能力是設計了卻沒接上，實際跑的只有「挑路線」與「當場設計」兩種。