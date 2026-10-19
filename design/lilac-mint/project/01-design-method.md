# 設計方法：三層設計觀

介面不是被「設計」出來的，是被三層機制產生的：決策層決定要不要畫、畫哪一型；約束層把設計系統壓成模型能遵守的數字與契約；交付層把串流的六個欄位變成瀏覽器裡的畫面。每條規則標出原始碼位置，拿來對照自己的系統時逐條問「我們這層是誰在做」。

## 決策層：介面類型怎麼被選出來

任務先於介面。所有請求被收斂成理解、比較、做工具三種任務，再由分類器 Jev 判定 13 種視覺化型別之一；判定後用「只保留允許的工具」強制執行，而不是請模型自律。

| 規則 | 原始碼 | 備註 |
| --- | --- | --- |
| 理解 → 清楚的模型加可改的有意義變數；比較 → 攤開準則、取捨、假設；做工具 → 可用輸入、經驗證的計算、輸出、重設 | apps/agent/src/prompt.py「Choose the right answer」· skills/master-playbook/SKILL.md |  |
| 每則新訊息先由 Jev 判定 13 種型別之一，每種型別附適用條件；table 走 A2UI、text 走文字、其餘走沙箱 | apps/agent/src/visualization_router.py VISUALIZATIONS、decision_from_response |  |
| 判定後過濾工具：表格輪只剩 A2UI 工具，沙箱輪只剩 generateSandboxedUi；barChart、pieChart、generate_form 永遠被剔除 | apps/agent/src/visualization_router.py routed_request | 設計決策從「模型自律」變成「模型拿不到別的工具」。 |
| 文字優先；靜態圖夠用就不加互動；不為了讓回答看起來厲害而呼叫工具 | apps/agent/src/prompt.py「A static diagram is enough when interaction adds no value」 |  |
| 一次回答可以是幾段文字加幾個視覺段落；「UI generated」代表已畫好不重做；沒有跨回合的 patch API，追問永遠是新的一輪 | apps/agent/src/prompt.py · docs/interactive-answers.md「Follow-up snapshots」 |  |
| 表格有硬限制：最多 12 欄、200 列，source 必填，列寬不符就拒絕渲染 | apps/app/src/components/generative-ui/table-catalog.tsx TableProps |  |
| 沒有 Jev 就整輪失敗，刻意不做 fallback，寧可報錯也不讓模型自己猜型別 | apps/agent/src/visualization_router.py JevVisualizationMiddleware | 代價是多一個外部相依；好處是型別判斷可測、可審。 |

## 約束層：每種介面必須遵守的規則

真正的視覺與互動設計不是畫出來的，是寫成模型能遵守的數字與契約：token 而非元件、幾何規格而非範例、互動與無障礙寫進同一份文件。

| 規則 | 原始碼 | 備註 |
| --- | --- | --- |
| 視覺語言只給 token 與元素預設樣式，不給元件；「不要重新樣式化基本控制項」；css 參數只放 widget 專屬樣式 | packages/design-system/src/index.ts OPEN_GEN_UI_DESIGN_SKILL、FORM_STYLES_CSS |  |
| 字體 system-ui 16px、行高 1.7；控制項 14px、36px 高、0.5px 邊框、8px 圓角；按鈕透明底細框 | packages/design-system/src/index.ts FORM_STYLES_CSS | 極低裝飾，視覺張力留給內容。 |
| 顏色一律角色 token，深色是另一組重新生成的值，絕不硬編 hex | packages/design-system/src/index.ts THEME_CSS · OPEN_GEN_UI_DESIGN_SKILL |  |
| 圖解幾何：viewBox 寬 680、安全區 40–640、箱高 44/56、箱距 ≥60、每列 ≤5 節點、字 14/12、字重 400/500、箭頭不穿箱、太複雜就拆圖、元素由上往下排讓串流自然建構 | apps/agent/skills/svg-diagrams/SKILL.md |  |
| 色階是「淡底、深框、深字」三件組；一張圖只用 2–3 階；顏色對應意義不對應順序：暖色主動、冷色被動、灰色結構 | packages/design-system/src/index.ts SVG_CLASSES_CSS · skills/svg-diagrams/SKILL.md |  |
| 互動是契約：每個啟用的控制都要真的運作；valueAsNumber、Number.isFinite、範圍與零除檢查；單位、假設、公式寫在 UI 裡；重設同步重設結果；排序保留篩選；外部文字只走 textContent | apps/agent/src/prompt.py「Interaction and quality」· skills/advanced-visualization/SKILL.md readAmount |  |
| 無障礙寫進同一份契約：label 綁定、鍵盤、可見 focus、對比、reduced motion、SVG 與 canvas 的文字替代、不以顏色單獨傳意、不自動播放、手機寬度可換行 | apps/agent/src/prompt.py · skills/master-playbook/SKILL.md「Functional and accessible answers」 |  |
| 資料誠實是介面元素：使用者提供、工具取回、計算得出、示意假設要分開標示在 UI 裡；不發明即時資料；mock 表單不得暗示登入 | apps/agent/src/prompt.py「Truthful data and capabilities」· docs/interactive-answers.md |  |
| 動態節奏：入場 0.4 秒淡入上移 8px、子元素錯開 60ms；串流中只有新元素動；3D 單一迴圈、示範 1.5 秒；旅程釘圖 6 秒、相機不動；reduced-motion 直達終態 | packages/design-system/src/index.ts FORM_STYLES_WITH_STAGGER_CSS · apps/app/src/components/generative-ui/open-generative-ui/trip-animator.ts |  |
| 對外互動只有一條窄門：本地算、使用者點了明確標示的按鈕才送 sendPrompt，帶目前值、停用、await、失敗可重試、finally 恢復；load、timer、input 變化都不得送；外部連結只能 https | skills/master-playbook/SKILL.md「Follow-up bridge」· apps/app/src/lib/sandbox/sandbox-functions.ts |  |
| 地圖專章：Leaflet 1.9.4、USGS 圖磚與可見 attribution、scrollWheelZoom 關閉、300/340px 高、照片要有來源與授權、連線標示「非駕駛路線」 | apps/agent/skills/advanced-visualization/SKILL.md「Live geographic maps」 |  |
| 警示色只有 low-contrast 一層：淡底、同色文字、同色邊框；沒有 high-contrast 實色層 | packages/design-system/src/index.ts THEME_CSS 的 info/danger/success/warning |  |

## 交付層：介面怎麼被呈現

串流本身就是設計決策。中介層把模型的 JSON token 切成事件，瀏覽器分三段畫：placeholder、預覽 iframe、最終沙箱；隔離決定了每個介面都是一張自足的卡片。

| 規則 | 原始碼 | 備註 |
| --- | --- | --- |
| 六欄位順序是為了觀感：CSS 先到所以不會出現無樣式畫面；html 在腳本到達前就可讀；行為最後到讓使用者看著功能逐一生效 | apps/agent/src/prompt.py「Streaming tool contract」· @copilotkit/runtime open-generative-ui-middleware |  |
| 中介層扣住 TOOL_CALL_START 與 args 事件，等第一個 activity 事件發出才一起放行，RUN_FINISHED 延到下一個事件之後；JSON 解析錯誤只記 warning 然後 resume | @copilotkit/runtime/dist/v2/runtime/open-generative-ui-middleware.mjs |  |
| 渲染器外層每秒最多更新一次，但六種時刻立即放行：第一次 cssComplete、htmlComplete、generating 轉 false、第一次 jsFunctions、jsExpressions 增加、第一段 html | apps/app/src/components/generative-ui/open-generative-ui/renderer.tsx shouldFlushImmediately、THROTTLE_MS |  |
| placeholder 只在 generating 且沒有可見沙箱時出現；高度用 initialHeight 或 200；七句詞每 1.8 秒輪換 | apps/app/src/components/generative-ui/open-generative-ui/renderer.tsx LOADING_PHRASES | 代理輸出的 placeholderMessages 被本地 zod schema 當未知鍵剝掉，從未顯示。 |
| 預覽 iframe 要等 css 完成且清理後的 body 不是空白才建；清理五步：砍未閉合標籤、移除 style/script/head 區塊、移除未閉合區塊、砍未完成 entity、只取 body；Idiomorph morph，新節點加 morph-enter | apps/app/src/components/generative-ui/open-generative-ui/process-partial-html.ts、frame-content.ts buildPreviewBodyMorph |  |
| 最終沙箱文件順序固定：CSP、importmap、createTripAnimator、design-system 三段 CSS、生成的 css、生成的 html；CSP 只允許四個 CDN 與 USGS、Wikimedia 圖片 | apps/app/src/components/generative-ui/open-generative-ui/frame-content.ts buildFinalFrameContent、CSP_META_TAG |  |
| jsFunctions 只注入一次、就緒前排隊；jsExpressions 用索引只跑新增的，逐條 await；高度由沙箱 ResizeObserver 回報，父頁只收自家 iframe 的訊息並夾在 50–4000px | apps/app/src/components/generative-ui/open-generative-ui/renderer.tsx、frame-content.ts MEASUREMENT_JS |  |
| 渲染器永遠用 ExportOverlay 包住框架，即使還在生成中：根節點一換 React 會重掛容器，正在運作的 iframe 會被無聲銷毀 | apps/app/src/components/generative-ui/open-generative-ui/renderer.tsx 末段註解 |  |
| 隔離決定形狀：沙箱無儲存、無 fetch、無父頁存取，所以資料寫在 UI 裡、狀態只活在 iframe 裡，每次回答是一張快照 | apps/agent/src/prompt.py「Sandbox execution」· frame-content.ts |  |
| sendPrompt 認領機制：iframe 呼叫經 Zod 驗證後在 window 派發事件，監聽者必須同步 claim；bridge 再驗一次、代理忙碌就拒絕、訂閱 RUN_ERROR、卸載時拒絕未完成的請求 | apps/app/src/lib/sandbox/sandbox-functions.ts、prompt-bridge.tsx |  |
| 原生元件：A2UI 表格是語意 table 加 caption、可聚焦橫向捲動、必填來源，值一律以文字渲染；HITL 卡只在 executing 顯示按鈕，使用者選擇以字串回到代理 | apps/app/src/components/generative-ui/table-catalog.tsx、meeting-time-picker.tsx |  |
| 匯出走另一個組裝器：importmap、trip animator、design-system、css、一個 Websandbox stub，jsFunctions 放頂層、jsExpressions 包進 async IIFE；圖表匯出改用 UMD Chart.js 且不帶 CSP | apps/app/src/components/generative-ui/export-utils.ts |  |
| 外殼交付文字：Markdown 每個區塊進入視窗下緣 24px 內才淡入，MutationObserver 追串流新增；自動捲動關閉，只在送出新問題時把問題捲到頂端；複製鈕 hover 或 focus 才顯示 | apps/app/src/components/chat/reveal-blocks.ts、reader-scroll-view.tsx · apps/app/src/app/page.tsx |  |
| 金鑰閘門先攔下送出與建議、保留草稿、開對話框；儲存或清除金鑰會換 session key 重掛 CopilotKit | apps/app/src/components/chat/key-gated-chat-view.tsx、provider-keys.tsx |  |

## 交付層的三段渲染

- **第一段：placeholder**（generating 且沒有任何可見沙箱）：高度 initialHeight 或 200；12px 旋轉圈加一句每 1.8 秒輪換的詞。
- **第二段：預覽 iframe**（cssComplete 且清理後的 body 不是空白）：沒有 localApi 的 Websandbox；head 寫入 overflow hidden、design-system、生成 css；body 用 Idiomorph morph，失敗退回 innerHTML；html 裡已完整的 <style> 會被抬到 head 當容錯。
- **第三段：最終沙箱**（htmlComplete）：銷毀預覽、以完整文件建立帶 localApi 的 Websandbox；就緒後先跑量測腳本（ResizeObserver、前 3 秒每 200ms 回報）；再注入 jsFunctions、逐條執行 jsExpressions；generating:false 後顯示匯出選單。

## 模型拿到的材料集合

| 集合 | 數量 | 誰在什麼時候挑 | 接線狀態 | 說明 |
| --- | --- | --- | --- | --- |
| A2UI v0.9 基本目錄（basicCatalog） | 18 元件 · 14 個 schema 函式（runtime 另 11 個）· 59 個 icon 名稱 | generate_a2ui 的次級模型從目錄點名元件、排巢狀、給版面提示 | 未接線 | 套件隨 app 安裝，但 provider 只掛 tableCatalog；這一頁是它在專案裡第一次被完整畫出來 |
| A2UI v0.8 標準目錄 | 18 元件（MultipleChoice 取代 ChoicePicker） | generate_form 工具以手寫固定 schema 組登入卡，模型只決定要不要呼叫 | 未接線 | 0.8 信封與巢狀寫法，0.9 渲染器不認；前端也刻意忽略 generate_form |
| 專案 A2UI 目錄 tableCatalog | 1 元件（Table） | Jev 判為 table 後，render_a2ui 只填 title、columns、rows、source | 已接線 | 正式對話唯一會畫出來的 A2UI 元件 |
| Controlled 元件（前端工具） | 4 個有 UI · 1 個無 UI · 1 個預設渲染 | 主模型選工具並填參數；Jev 路由時剔除 barChart、pieChart、generate_form | 部分接線 | 元件掛著，但 Jev 開啟後圖表工具不會出現在模型面前 |
| 沙箱材料（設計系統） | 27 token · 9 色階 · 7 個圖表輔助類別 · 4 個 CDN 函式庫 | generateSandboxedUi 時由設計技能文字指示模型取用，版面仍由模型當場寫 | 已接線 | THEME、FORM、SVG 三段 CSS 注入每個沙箱；importmap 提供 three、gsap、d3、chart.js |
| 代理技能 | 3 份技能 · 3 種圖型 · 6 個 SVG 元件模式 | 代理依 master-playbook 讀取；apps/mcp 也把同一批技能當 resource 提供 | 已接線 | 唯一以「模式」而非「元件」供模型挑選的集合 |
| Jev 視覺化型別 | 13 型別 → 3 條渲染路線 | Jev 路由模型先挑型別，再決定 text、A2UI 或沙箱 | 已接線 | 需要 TYPESAFE_API_KEY；這一步挑的是路線，不是版面 |
| 代理工具 | 6 個已註冊 · 5 個定義未註冊 | 主模型工具選擇 | 部分接線 | templates.py 的五個範本工具沒有進 tools 清單 |
| 版面範本與示範提示 | 3 份 seed 範本 · 7 條 demo 提示 | pending_template state 與 DemoGallery 抽屜，兩者都沒有入口 | 未接線 | 專案裡唯一「從版面集合挑」的機制，設計了卻沒接上 |
| MCP Apps 伺服器 | 0 個（可選接頭） | 主模型選 MCP 工具；宿主抓伺服器預先宣告的 ui:// 模板 | 外部 | 只有設 MCP_SERVER_URL 才接；自家 apps/mcp 只註冊工具，沒有 ui:// 資源 |
| Open Generative UI | 沒有集合：每次當場生成 | 模型當場寫 HTML、CSS、JS；只受技能與設計系統的文字規則約束 | 已接線 | 本專案主路徑；材料來自上面的「沙箱材料」與「代理技能」 |

技能提供的模式（模型從這些模式裡挑，而不是從零設計）：

- **master-playbook**：Choose text, native components, or a custom interactive answer for understanding, comparing, and making tools. 模式：Data and assumptions、Tool contract、Functional and accessible answers、Follow-up bridge。
- **advanced-visualization**：Build responsive, accessible calculators, comparisons, charts, and simulations with the sandbox contract. 模式：Streaming and execution、Data and calculations、Controls and layout、Agent follow-ups、Live geographic maps、Trip itineraries with sequential pin drops。
- **svg-diagrams**：Generating rich inline SVG diagrams to visually explain systems, processes, architectures, and abstract concepts. 模式：圖型：Flowchart、Structural Diagram、Illustrative Diagram、元件模式：Single-Line Node、Two-Line Node、Arrow Connector、Dashed Flow Indicator、Leader Line with Label、Large Container、680px viewBox、九色階、文字寬度估算。

## 評價

強項：
- 把設計系統壓縮成模型能遵守的數字與契約，而不是一份給人看的風格指南。
- 串流優先：CSS 門檻、Idiomorph 預覽、常駐的匯出包裝，都是為了「邊生成邊可讀」。
- 誠實標示與無障礙進了契約本文，不是附錄。
- 型別判斷抽離成分類器並以工具過濾強制執行，可測、可審。

弱項：
- 規則與真實輸出之間沒有自動驗收：pytest 只驗文件彼此不矛盾，不驗產物。
- 兩套視覺語言並存：沙箱用 design-system token，原生元件用 Tailwind 灰與藍。
- placeholderMessages 被 zod 剝掉，提示要求的東西沒有畫面。
- 1 秒節流讓短回答的預覽只更新一兩次，串流感主要來自那幾個立即放行點。
- 最終沙箱的深色跟作業系統走，與 app 的主題切換脫節；連專案自己的 seed 範本都違反字重與硬編色規則。
