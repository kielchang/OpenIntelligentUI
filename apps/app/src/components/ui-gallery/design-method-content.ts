/**
 * 「設計方法」區塊的靜態內容：這個專案怎麼設計各種介面，拆成決策、約束、交付三層。
 * 每條規則標出原始檔案，並連到頁內對應的 demo 錨點。
 */

export interface DesignRule {
  rule: string;
  source: string;
  /** 頁內錨點，例如 #sample-reconstructed-bill-splitter */
  demo?: string;
  demoLabel?: string;
  note?: string;
}

export interface DesignLayer {
  id: string;
  title: string;
  summary: string;
  rules: DesignRule[];
}

export const DESIGN_LAYERS: DesignLayer[] = [
  {
    id: "decision",
    title: "決策層：介面類型怎麼被選出來",
    summary:
      "任務先於介面。所有請求被收斂成理解、比較、做工具三種任務，再由分類器 Jev 判定 13 種視覺化型別之一；判定後用「只保留允許的工具」強制執行，而不是請模型自律。",
    rules: [
      {
        rule: "理解 → 清楚的模型加可改的有意義變數；比較 → 攤開準則、取捨、假設；做工具 → 可用輸入、經驗證的計算、輸出、重設",
        source: "apps/agent/src/prompt.py「Choose the right answer」· skills/master-playbook/SKILL.md",
        demo: "#generative",
        demoLabel: "三種任務的重建範例",
      },
      {
        rule: "每則新訊息先由 Jev 判定 13 種型別之一，每種型別附適用條件；table 走 A2UI、text 走文字、其餘走沙箱",
        source: "apps/agent/src/visualization_router.py VISUALIZATIONS、decision_from_response",
        demo: "#overview",
        demoLabel: "Jev 型別表",
      },
      {
        rule: "判定後過濾工具：表格輪只剩 A2UI 工具，沙箱輪只剩 generateSandboxedUi；barChart、pieChart、generate_form 永遠被剔除",
        source: "apps/agent/src/visualization_router.py routed_request",
        demo: "#response",
        demoLabel: "被剔除的原生圖表",
        note: "設計決策從「模型自律」變成「模型拿不到別的工具」。",
      },
      {
        rule: "文字優先；靜態圖夠用就不加互動；不為了讓回答看起來厲害而呼叫工具",
        source: "apps/agent/src/prompt.py「A static diagram is enough when interaction adds no value」",
        demo: "#sample-skill-svg-three-step-flow",
        demoLabel: "靜態三步流程圖",
      },
      {
        rule: "一次回答可以是幾段文字加幾個視覺段落；「UI generated」代表已畫好不重做；沒有跨回合的 patch API，追問永遠是新的一輪",
        source: "apps/agent/src/prompt.py · docs/interactive-answers.md「Follow-up snapshots」",
        demo: "#generative",
        demoLabel: "每筆範例都是獨立快照",
      },
      {
        rule: "表格有硬限制：最多 12 欄、200 列，source 必填，列寬不符就拒絕渲染",
        source: "apps/app/src/components/generative-ui/table-catalog.tsx TableProps",
        demo: "#item-data-table",
        demoLabel: "A2UI 表格與無效列",
      },
      {
        rule: "沒有 Jev 就整輪失敗，刻意不做 fallback，寧可報錯也不讓模型自己猜型別",
        source: "apps/agent/src/visualization_router.py JevVisualizationMiddleware",
        note: "代價是多一個外部相依；好處是型別判斷可測、可審。",
      },
    ],
  },
  {
    id: "constraint",
    title: "約束層：每種介面必須遵守的規則",
    summary:
      "真正的視覺與互動設計不是畫出來的，是寫成模型能遵守的數字與契約：token 而非元件、幾何規格而非範例、互動與無障礙寫進同一份文件。",
    rules: [
      {
        rule: "視覺語言只給 token 與元素預設樣式，不給元件；「不要重新樣式化基本控制項」；css 參數只放 widget 專屬樣式",
        source: "packages/design-system/src/index.ts OPEN_GEN_UI_DESIGN_SKILL、FORM_STYLES_CSS",
        demo: "#item-design-frame",
        demoLabel: "沙箱內的控制項預設樣式",
      },
      {
        rule: "字體 system-ui 16px、行高 1.7；控制項 14px、36px 高、0.5px 邊框、8px 圓角；按鈕透明底細框",
        source: "packages/design-system/src/index.ts FORM_STYLES_CSS",
        demo: "#item-design-frame",
        demoLabel: "同上",
        note: "極低裝飾，視覺張力留給內容。",
      },
      {
        rule: "顏色一律角色 token，深色是另一組重新生成的值，絕不硬編 hex",
        source: "packages/design-system/src/index.ts THEME_CSS · OPEN_GEN_UI_DESIGN_SKILL",
        demo: "#color",
        demoLabel: "色彩學與配色",
      },
      {
        rule: "圖解幾何：viewBox 寬 680、安全區 40–640、箱高 44/56、箱距 ≥60、每列 ≤5 節點、字 14/12、字重 400/500、箭頭不穿箱、太複雜就拆圖、元素由上往下排讓串流自然建構",
        source: "apps/agent/skills/svg-diagrams/SKILL.md",
        demo: "#sample-skill-svg-three-step-flow",
        demoLabel: "技能範例原文",
      },
      {
        rule: "色階是「淡底、深框、深字」三件組；一張圖只用 2–3 階；顏色對應意義不對應順序：暖色主動、冷色被動、灰色結構",
        source: "packages/design-system/src/index.ts SVG_CLASSES_CSS · skills/svg-diagrams/SKILL.md",
        demo: "#item-svg-ramps",
        demoLabel: "九色階兩種模式",
      },
      {
        rule: "互動是契約：每個啟用的控制都要真的運作；valueAsNumber、Number.isFinite、範圍與零除檢查；單位、假設、公式寫在 UI 裡；重設同步重設結果；排序保留篩選；外部文字只走 textContent",
        source: "apps/agent/src/prompt.py「Interaction and quality」· skills/advanced-visualization/SKILL.md readAmount",
        demo: "#sample-reconstructed-bill-splitter",
        demoLabel: "帳單分攤",
      },
      {
        rule: "無障礙寫進同一份契約：label 綁定、鍵盤、可見 focus、對比、reduced motion、SVG 與 canvas 的文字替代、不以顏色單獨傳意、不自動播放、手機寬度可換行",
        source: "apps/agent/src/prompt.py · skills/master-playbook/SKILL.md「Functional and accessible answers」",
        demo: "#sample-reconstructed-bicycle-gears",
        demoLabel: "腳踏車齒輪",
      },
      {
        rule: "資料誠實是介面元素：使用者提供、工具取回、計算得出、示意假設要分開標示在 UI 裡；不發明即時資料；mock 表單不得暗示登入",
        source: "apps/agent/src/prompt.py「Truthful data and capabilities」· docs/interactive-answers.md",
        demo: "#sample-reconstructed-weekend-compare",
        demoLabel: "標示 illustrative 的比較",
      },
      {
        rule: "動態節奏：入場 0.4 秒淡入上移 8px、子元素錯開 60ms；串流中只有新元素動；3D 單一迴圈、示範 1.5 秒；旅程釘圖 6 秒、相機不動；reduced-motion 直達終態",
        source: "packages/design-system/src/index.ts FORM_STYLES_WITH_STAGGER_CSS · apps/app/src/components/generative-ui/open-generative-ui/trip-animator.ts",
        demo: "#sample-reconstructed-coastal-trip",
        demoLabel: "海岸旅程",
      },
      {
        rule: "對外互動只有一條窄門：本地算、使用者點了明確標示的按鈕才送 sendPrompt，帶目前值、停用、await、失敗可重試、finally 恢復；load、timer、input 變化都不得送；外部連結只能 https",
        source: "skills/master-playbook/SKILL.md「Follow-up bridge」· apps/app/src/lib/sandbox/sandbox-functions.ts",
        demo: "#sample-seed-invoice",
        demoLabel: "Invoice 的 sendPrompt 按鈕",
      },
      {
        rule: "地圖專章：Leaflet 1.9.4、USGS 圖磚與可見 attribution、scrollWheelZoom 關閉、300/340px 高、照片要有來源與授權、連線標示「非駕駛路線」",
        source: "apps/agent/skills/advanced-visualization/SKILL.md「Live geographic maps」",
        demo: "#sample-reconstructed-coastal-trip",
        demoLabel: "同上",
      },
      {
        rule: "警示色只有 low-contrast 一層：淡底、同色文字、同色邊框；沒有 high-contrast 實色層",
        source: "packages/design-system/src/index.ts THEME_CSS 的 info/danger/success/warning",
        demo: "#item-alert-tiers",
        demoLabel: "兩種強度對照",
      },
    ],
  },
  {
    id: "delivery",
    title: "交付層：介面怎麼被呈現",
    summary:
      "串流本身就是設計決策。中介層把模型的 JSON token 切成事件，瀏覽器分三段畫：placeholder、預覽 iframe、最終沙箱；隔離決定了每個介面都是一張自足的卡片。",
    rules: [
      {
        rule: "六欄位順序是為了觀感：CSS 先到所以不會出現無樣式畫面；html 在腳本到達前就可讀；行為最後到讓使用者看著功能逐一生效",
        source: "apps/agent/src/prompt.py「Streaming tool contract」· @copilotkit/runtime open-generative-ui-middleware",
        demo: "#generative",
        demoLabel: "串流重播的階段指示條",
      },
      {
        rule: "中介層扣住 TOOL_CALL_START 與 args 事件，等第一個 activity 事件發出才一起放行，RUN_FINISHED 延到下一個事件之後；JSON 解析錯誤只記 warning 然後 resume",
        source: "@copilotkit/runtime/dist/v2/runtime/open-generative-ui-middleware.mjs",
        demo: "#overview",
        demoLabel: "請求流程",
      },
      {
        rule: "渲染器外層每秒最多更新一次，但六種時刻立即放行：第一次 cssComplete、htmlComplete、generating 轉 false、第一次 jsFunctions、jsExpressions 增加、第一段 html",
        source: "apps/app/src/components/generative-ui/open-generative-ui/renderer.tsx shouldFlushImmediately、THROTTLE_MS",
        demo: "#generative",
        demoLabel: "重播時觀察節流",
      },
      {
        rule: "placeholder 只在 generating 且沒有可見沙箱時出現；高度用 initialHeight 或 200；七句詞每 1.8 秒輪換",
        source: "apps/app/src/components/generative-ui/open-generative-ui/renderer.tsx LOADING_PHRASES",
        demo: "#item-loading-placeholder",
        demoLabel: "載入中 placeholder",
        note: "代理輸出的 placeholderMessages 被本地 zod schema 當未知鍵剝掉，從未顯示。",
      },
      {
        rule: "預覽 iframe 要等 css 完成且清理後的 body 不是空白才建；清理五步：砍未閉合標籤、移除 style/script/head 區塊、移除未閉合區塊、砍未完成 entity、只取 body；Idiomorph morph，新節點加 morph-enter",
        source: "apps/app/src/components/generative-ui/open-generative-ui/process-partial-html.ts、frame-content.ts buildPreviewBodyMorph",
        demo: "#generative",
        demoLabel: "重播的 html 串流預覽階段",
      },
      {
        rule: "最終沙箱文件順序固定：CSP、importmap、createTripAnimator、design-system 三段 CSS、生成的 css、生成的 html；CSP 只允許四個 CDN 與 USGS、Wikimedia 圖片",
        source: "apps/app/src/components/generative-ui/open-generative-ui/frame-content.ts buildFinalFrameContent、CSP_META_TAG",
        demo: "#sample-reconstructed-chartjs-bar",
        demoLabel: "CDN 載入失敗時的可讀錯誤",
      },
      {
        rule: "jsFunctions 只注入一次、就緒前排隊；jsExpressions 用索引只跑新增的，逐條 await；高度由沙箱 ResizeObserver 回報，父頁只收自家 iframe 的訊息並夾在 50–4000px",
        source: "apps/app/src/components/generative-ui/open-generative-ui/renderer.tsx、frame-content.ts MEASUREMENT_JS",
        demo: "#sample-reconstructed-monty-hall",
        demoLabel: "多條 jsExpressions 的範例",
      },
      {
        rule: "渲染器永遠用 ExportOverlay 包住框架，即使還在生成中：根節點一換 React 會重掛容器，正在運作的 iframe 會被無聲銷毀",
        source: "apps/app/src/components/generative-ui/open-generative-ui/renderer.tsx 末段註解",
        demo: "#item-export-overlay",
        demoLabel: "匯出選單",
      },
      {
        rule: "隔離決定形狀：沙箱無儲存、無 fetch、無父頁存取，所以資料寫在 UI 裡、狀態只活在 iframe 裡，每次回答是一張快照",
        source: "apps/agent/src/prompt.py「Sandbox execution」· frame-content.ts",
        demo: "#generative",
        demoLabel: "每筆範例自足",
      },
      {
        rule: "sendPrompt 認領機制：iframe 呼叫經 Zod 驗證後在 window 派發事件，監聽者必須同步 claim；bridge 再驗一次、代理忙碌就拒絕、訂閱 RUN_ERROR、卸載時拒絕未完成的請求",
        source: "apps/app/src/lib/sandbox/sandbox-functions.ts、prompt-bridge.tsx",
        demo: "#sample-seed-invoice",
        demoLabel: "展示頁的 stub 用同一個 claim 介面接住",
      },
      {
        rule: "原生元件：A2UI 表格是語意 table 加 caption、可聚焦橫向捲動、必填來源，值一律以文字渲染；HITL 卡只在 executing 顯示按鈕，使用者選擇以字串回到代理",
        source: "apps/app/src/components/generative-ui/table-catalog.tsx、meeting-time-picker.tsx",
        demo: "#item-meeting-picker",
        demoLabel: "排程卡三狀態",
      },
      {
        rule: "匯出走另一個組裝器：importmap、trip animator、design-system、css、一個 Websandbox stub，jsFunctions 放頂層、jsExpressions 包進 async IIFE；圖表匯出改用 UMD Chart.js 且不帶 CSP",
        source: "apps/app/src/components/generative-ui/export-utils.ts",
        demo: "#item-export-overlay",
        demoLabel: "下載獨立 HTML",
      },
      {
        rule: "外殼交付文字：Markdown 每個區塊進入視窗下緣 24px 內才淡入，MutationObserver 追串流新增；自動捲動關閉，只在送出新問題時把問題捲到頂端；複製鈕 hover 或 focus 才顯示",
        source: "apps/app/src/components/chat/reveal-blocks.ts、reader-scroll-view.tsx · apps/app/src/app/page.tsx",
        demo: "#item-chat-shell",
        demoLabel: "嵌入的聊天外殼",
      },
      {
        rule: "金鑰閘門先攔下送出與建議、保留草稿、開對話框；儲存或清除金鑰會換 session key 重掛 CopilotKit",
        source: "apps/app/src/components/chat/key-gated-chat-view.tsx、provider-keys.tsx",
        demo: "#item-chat-shell",
        demoLabel: "在外殼裡送出任何文字",
      },
    ],
  },
];

export interface PipelineRow {
  field: string;
  when: string;
  event: string;
  browser: string;
}

/** 六欄位從模型 token 到瀏覽器反應的實際路徑 */
export const STREAM_PIPELINE: PipelineRow[] = [
  { field: "initialHeight", when: "數值一到", event: "唯一一次 ACTIVITY_SNAPSHOT：{initialHeight, generating:true}", browser: "建一個該高度的 placeholder 框" },
  { field: "placeholderMessages", when: "陣列開啟與每個元素", event: "/placeholderMessages 與逐項 append", browser: "被本地 zod schema 剝掉，從未到渲染器" },
  { field: "css", when: "整串字串結束後", event: "/css，再 /cssComplete:true", browser: "之前只顯示 placeholder；之後才建預覽 iframe" },
  { field: "html", when: "每次 write 後讀 clarinet 的 textNode 緩衝，有新字就發", event: "/html = [] 再逐段 append；結束時 /htmlComplete:true", browser: "預覽 iframe 逐段 morph；完成後建最終沙箱" },
  { field: "jsFunctions", when: "整串結束後", event: "/jsFunctions，再 /jsFunctionsComplete", browser: "注入最終沙箱一次" },
  { field: "jsExpressions", when: "每個元素", event: "逐項 append；陣列關閉時 /jsExpressionsComplete", browser: "依序 await sandbox.run()" },
  { field: "TOOL_CALL_END", when: "工具呼叫結束", event: "/generating:false", browser: "顯示匯出選單" },
];

export interface RenderStage {
  title: string;
  condition: string;
  detail: string;
}

export const RENDER_STAGES: RenderStage[] = [
  {
    title: "第一段：placeholder",
    condition: "generating 且沒有任何可見沙箱",
    detail: "高度 initialHeight 或 200；12px 旋轉圈加一句每 1.8 秒輪換的詞。",
  },
  {
    title: "第二段：預覽 iframe",
    condition: "cssComplete 且清理後的 body 不是空白",
    detail: "沒有 localApi 的 Websandbox；head 寫入 overflow hidden、design-system、生成 css；body 用 Idiomorph morph，失敗退回 innerHTML；html 裡已完整的 <style> 會被抬到 head 當容錯。",
  },
  {
    title: "第三段：最終沙箱",
    condition: "htmlComplete",
    detail: "銷毀預覽、以完整文件建立帶 localApi 的 Websandbox；就緒後先跑量測腳本（ResizeObserver、前 3 秒每 200ms 回報）；再注入 jsFunctions、逐條執行 jsExpressions；generating:false 後顯示匯出選單。",
  },
];

export interface DiffRow {
  aspect: string;
  web: string;
  mcp: string;
}

/** 同一套 design-system 的兩條軌道刻意不互通 */
export const MCP_DIFF: DiffRow[] = [
  { aspect: "輸入", web: "六欄位分開串流", mcp: "只收一個 html 字串" },
  { aspect: "橋接", web: "Websandbox RPC，Zod 驗證，有回應與錯誤", mcp: "全域 window.sendPrompt 用 postMessage 送到 '*'，無驗證無回應" },
  { aspect: "連結", web: "openLink 只允許 https，可設白名單", mcp: "攔截所有 http 開頭的 a[href] 點擊" },
  { aspect: "高度", web: "ResizeObserver，前 3 秒每 200ms，父頁夾 50–4000", mcp: "#content.offsetHeight，15 秒內每 200ms" },
  { aspect: "注入", web: "CSP、importmap、createTripAnimator、design-system、css", mcp: "CSP、design-system；無 importmap、無 trip animator" },
  { aspect: "CSP 圖片", web: "self、data、blob、USGS、Wikimedia", mcp: "self、data、blob（地圖圖磚會被擋）" },
  { aspect: "入場動畫", web: "只在 initial-render 與 morph-enter", mcp: "#content 子元素永遠 stagger" },
];

export const VERDICT = {
  strengths: [
    "把設計系統壓縮成模型能遵守的數字與契約，而不是一份給人看的風格指南。",
    "串流優先：CSS 門檻、Idiomorph 預覽、常駐的匯出包裝，都是為了「邊生成邊可讀」。",
    "誠實標示與無障礙進了契約本文，不是附錄。",
    "型別判斷抽離成分類器並以工具過濾強制執行，可測、可審。",
  ],
  weaknesses: [
    "規則與真實輸出之間沒有自動驗收：pytest 只驗文件彼此不矛盾，不驗產物。",
    "兩套視覺語言並存：沙箱用 design-system token，原生元件用 Tailwind 灰與藍。",
    "placeholderMessages 被 zod 剝掉，提示要求的東西沒有畫面。",
    "1 秒節流讓短回答的預覽只更新一兩次，串流感主要來自那幾個立即放行點。",
    "最終沙箱的深色跟作業系統走，與 app 的主題切換脫節；連專案自己的 seed 範本都違反字重與硬編色規則。",
  ],
};
