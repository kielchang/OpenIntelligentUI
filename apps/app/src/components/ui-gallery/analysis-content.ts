/** 總覽與解析區塊用的靜態內容；全部可對照 repo 內的檔案 */

export interface ResponseMode {
  task: string;
  response: string;
  renderer: string;
  where: string;
}

export const RESPONSE_MODES: ResponseMode[] = [
  { task: "快速事實、寫作、程式碼、閒聊", response: "直接文字", renderer: "CopilotChat 的 assistant message（AnswerMarkdown）", where: "docs/interactive-answers.md" },
  { task: "基本表格、精確數值比較", response: "A2UI Table", renderer: "tableCatalog → DataTable（React 以文字渲染）", where: "components/generative-ui/table-catalog.tsx" },
  { task: "理解機制或關係", response: "圖解或互動說明", renderer: "generateSandboxedUi → 隔離 iframe", where: "skills/svg-diagrams、advanced-visualization" },
  { task: "比較選項", response: "表格、準則、取捨；必要時可調權重", renderer: "A2UI Table 或沙箱", where: "skills/master-playbook" },
  { task: "做一個工具", response: "可用的輸入、計算、輸出與重設", renderer: "沙箱（calculator）", where: "skills/advanced-visualization" },
];

export interface StreamField {
  order: number;
  field: string;
  agentRule: string;
  rendererBehaviour: string;
}

export const STREAM_FIELDS: StreamField[] = [
  { order: 1, field: "initialHeight", agentRule: "預估完成後的高度（px）", rendererBehaviour: "作為框架初始高度；之後由沙箱回報的 __ogui_resize 取代，限 50–4000px" },
  { order: 2, field: "placeholderMessages", agentRule: "2–4 則簡短進度訊息", rendererBehaviour: "不在本地 schema 內，從未顯示；渲染器改用自己的 LOADING_PHRASES 每 1.8 秒輪播" },
  { order: 3, field: "css", agentRule: "所有樣式一次給齊", rendererBehaviour: "cssComplete 之前只顯示 placeholder；完成後才建立預覽 iframe" },
  { order: 4, field: "html", agentRule: "body 標記，不含 <style>/<script>", rendererBehaviour: "逐段用 Idiomorph morph 進預覽 iframe（1 秒節流）；htmlComplete 後建立最終 Websandbox" },
  { order: 5, field: "jsFunctions", agentRule: "具名函式宣告", rendererBehaviour: "最終沙箱就緒後注入一次" },
  { order: 6, field: "jsExpressions", agentRule: "小型同步敘述", rendererBehaviour: "依到達順序逐條 await 執行；generating:false 後顯示匯出選單" },
];

export interface JevRoute {
  type: string;
  renderer: "text" | "a2ui" | "open_generative_ui";
  note: string;
}

export const JEV_ROUTES: JevRoute[] = [
  { type: "text", renderer: "text", note: "一般聊天回答" },
  { type: "table", renderer: "a2ui", note: "A2UI Table；≤12 欄、≤200 列、必填 source" },
  { type: "bar_chart", renderer: "open_generative_ui", note: "沙箱；importmap 提供 chart.js／d3" },
  { type: "line_chart", renderer: "open_generative_ui", note: "沙箱" },
  { type: "scatter_plot", renderer: "open_generative_ui", note: "沙箱" },
  { type: "distribution", renderer: "open_generative_ui", note: "沙箱；模擬與理論值分開標示" },
  { type: "part_to_whole", renderer: "open_generative_ui", note: "沙箱" },
  { type: "flowchart", renderer: "open_generative_ui", note: "沙箱；svg-diagrams 技能" },
  { type: "static_diagram", renderer: "open_generative_ui", note: "沙箱；svg-diagrams 技能" },
  { type: "interactive_diagram", renderer: "open_generative_ui", note: "沙箱；可含 Three.js" },
  { type: "animated_route", renderer: "open_generative_ui", note: "沙箱；Leaflet + USGS + createTripAnimator" },
  { type: "map", renderer: "open_generative_ui", note: "沙箱；Leaflet + USGS 圖磚" },
  { type: "calculator", renderer: "open_generative_ui", note: "沙箱；輸入驗證與重設" },
];

export const STRIPPED_TOOLS = ["barChart", "pieChart", "generate_form"];

export interface RepoEntry {
  path: string;
  role: string;
}

export const REPO_MAP: RepoEntry[] = [
  { path: "apps/app/", role: "Next.js 16 + CopilotKit v2 前端；/api/copilotkit runtime、/api/provider-keys、/api/pick" },
  { path: "apps/agent/", role: "FastAPI + LangGraph Deep Agent；prompt.py、visualization_router.py（Jev）、skills/" },
  { path: "apps/mcp/", role: "可選的獨立 MCP 伺服器：skills 資源、prompt 範本、assemble_document（舊版 postMessage 橋接）" },
  { path: "packages/design-system/", role: "一個 TS 檔匯出 THEME_CSS、SVG_CLASSES_CSS、FORM_STYLES_*、OPEN_GEN_UI_DESIGN_SKILL、IMPORTMAP" },
  { path: "apps/app/src/components/generative-ui/open-generative-ui/", role: "串流渲染器：renderer.tsx、frame-content.ts（CSP、importmap）、trip-animator.ts、websandbox-loader.ts" },
  { path: "apps/app/src/lib/sandbox/", role: "經驗證的宿主橋接：sendPrompt（1–4000 字）、openLink（僅 https）、prompt-bridge" },
  { path: "docs/", role: "architecture、interactive-answers、visualization-routing、deployment 等" },
];

export interface AgentTool {
  name: string;
  file: string;
  registered: boolean;
  frontend: string;
}

export const AGENT_TOOLS: AgentTool[] = [
  { name: "query_data", file: "apps/agent/src/query.py", registered: true, frontend: "ToolReasoning（預設工具渲染）" },
  { name: "get_trip_stop_images", file: "apps/agent/src/trip_images.py", registered: true, frontend: "ToolReasoning" },
  { name: "plan_visualization", file: "apps/agent/src/plan.py", registered: true, frontend: "PlanCard（useRenderTool）" },
  { name: "manage_todos / get_todos", file: "apps/agent/src/todos.py", registered: true, frontend: "ToolReasoning；React 待辦 UI 已於 df2a78f 刪除" },
  { name: "generate_form", file: "apps/agent/src/form.py", registered: true, frontend: "被 useDefaultRenderTool 忽略（回傳空片段）" },
  { name: "generateSandboxedUi", file: "由 CopilotKit runtime 注入（openGenerativeUI: true）", registered: true, frontend: "OpenGenUIActivityRenderer" },
  { name: "A2UI Table", file: "由 runtime 注入（a2ui.injectA2UITool）", registered: true, frontend: "DataTable（tableCatalog）" },
  { name: "save_/list_/apply_/delete_template、clear_pending_template", file: "apps/agent/src/templates.py", registered: false, frontend: "TemplateLibrary／TemplateChip（也未掛載）" },
];

export interface Finding {
  id: string;
  severity: "high" | "medium" | "low";
  title: string;
  detail: string;
  paths: string[];
}

export const FINDINGS: Finding[] = [
  {
    id: "unmounted",
    severity: "high",
    title: "約三分之二已設計的元件沒有任何入口",
    detail: "DemoGallery、CategoryFilter、DemoCard、TemplateLibrary、TemplateCard、TemplateChip、QrModal、QrButton、DesktopTipModal、ExplainerCards、ExampleLayout 都沒有被 import；/pick 與 OG image 路由存在但首頁沒有連結。",
    paths: ["apps/app/src/components/demo-gallery/", "apps/app/src/components/template-library/", "apps/app/src/components/qr-modal/index.tsx", "apps/app/src/components/desktop-tip-modal.tsx", "apps/app/src/components/explainer-cards.tsx"],
  },
  {
    id: "placeholder-messages",
    severity: "medium",
    title: "placeholderMessages 從未顯示",
    detail: "系統提示要求代理輸出 2–4 則進度訊息，但本地 schema 沒有這個欄位，渲染器一律顯示內建的 LOADING_PHRASES。",
    paths: ["apps/agent/src/prompt.py", "apps/app/src/components/generative-ui/open-generative-ui/schema.ts", "apps/app/src/components/generative-ui/open-generative-ui/renderer.tsx"],
  },
  {
    id: "stripped-tools",
    severity: "medium",
    title: "Jev 路由下原生圖表與表單工具永遠被剔除",
    detail: "barChart、pieChart、generate_form 列在 RENDER_TOOLS 卻不在任何允許集合，每一輪都會被 JevVisualizationMiddleware 過濾；前端註冊的 useComponent 因此不可達。",
    paths: ["apps/agent/src/visualization_router.py", "apps/app/src/hooks/use-generative-ui-examples.tsx"],
  },
  {
    id: "dark-mode-mismatch",
    severity: "medium",
    title: "沙箱深色跟作業系統、app 深色跟 .dark class",
    detail: "THEME_CSS 只用 prefers-color-scheme；app 用 ThemeProvider 切 :root.dark（預設 light）。作業系統深色但 app 淺色時，iframe 內容會變成淺字配透明底。",
    paths: ["packages/design-system/src/index.ts", "apps/app/src/hooks/use-theme.tsx", "apps/app/src/components/generative-ui/open-generative-ui/renderer.tsx"],
  },
  {
    id: "seed-rules",
    severity: "low",
    title: "seed 範本違反自己的設計規則",
    detail: "規則要求字重只用 400/500、不硬編 hex；weather/invoice/dashboard 使用 600/700 字重，dashboard 的長條用硬編 indigo→emerald 漸層。",
    paths: ["apps/app/src/components/template-library/seed-templates.ts", "apps/agent/skills/svg-diagrams/SKILL.md"],
  },
  {
    id: "category-colors",
    severity: "low",
    title: "DemoCard 的 CATEGORY_COLORS 鍵值與分類不符",
    detail: "鍵是「3D / Animation、Data Visualization…」，分類卻是「Understand、Compare、Make a tool」，所以徽章永遠落在灰色 fallback。",
    paths: ["apps/app/src/components/demo-gallery/demo-card.tsx", "apps/app/src/components/demo-gallery/demo-data.ts"],
  },
  {
    id: "a2ui-theme",
    severity: "low",
    title: "lib/a2ui-theme.css 沒有任何地方引用",
    detail: "一整套 Material 風格 tonal palette（112 處色值）與 Google Sans 字體設定沒有被 import。",
    paths: ["apps/app/src/lib/a2ui-theme.css"],
  },
  {
    id: "a2ui-format",
    severity: "medium",
    title: "generate_form 的 A2UI 訊息是 0.8 格式，前端渲染器是 0.9",
    detail: "form.py 輸出 surfaceUpdate／beginRendering 與巢狀 {Card:{…}} 物件；@copilotkit/a2ui-renderer 走 createSurface／updateComponents 與扁平 {component:\"Card\"}；app 目錄也只註冊 Table。",
    paths: ["apps/agent/src/form.py", "apps/app/src/components/generative-ui/table-catalog.tsx"],
  },
  {
    id: "langgraph-json",
    severity: "low",
    title: "langgraph.json 指向 main.py:graph，但 main.py 匯出的是 agent",
    detail: "只影響 LangGraph CLI；uvicorn 路徑不受影響。",
    paths: ["apps/agent/langgraph.json", "apps/agent/main.py"],
  },
  {
    id: "ci-filter",
    severity: "low",
    title: "CI 用 pnpm --filter app start，但套件名是 @repo/app",
    detail: "smoke 工作流程的啟動步驟實際上沒有啟動前端。",
    paths: [".github/workflows/ci.yml", "apps/app/package.json"],
  },
  {
    id: "unused-deps",
    severity: "low",
    title: "六個相依套件沒有被 import",
    detail: "react-rnd、react18-json-view、@copilotkit/react-ui、@copilotkitnext/shared、@ag-ui/a2ui-middleware、@ag-ui/mcp-apps-middleware。",
    paths: ["apps/app/package.json"],
  },
  {
    id: "template-tools",
    severity: "low",
    title: "templates.py 的五個工具定義了但沒有註冊",
    detail: "main.py 的 tools 清單沒有包含它們，TemplateLibrary 的 apply 流程在後端無法完成。",
    paths: ["apps/agent/src/templates.py", "apps/agent/main.py"],
  },
  {
    id: "dom-coupling",
    severity: "low",
    title: "ExplainerCardsPortal 與 TemplateChip 依賴 CopilotKit 內部 DOM",
    detail: "各自用 data-testid 選擇器找歡迎畫面與輸入框；CopilotKit 升版後可能靜默失效。",
    paths: ["apps/app/src/components/explainer-cards.tsx", "apps/app/src/components/template-library/template-chip.tsx"],
  },
  {
    id: "token-overlap",
    severity: "medium",
    title: "globals.css 與 design-system 的 token 命名空間重疊",
    detail: "兩邊都定義 --color-text-primary/secondary/tertiary，值不同（#010507 vs #1a1a1a）；app 另有 --text-* 與 --surface-* 第三組命名。",
    paths: ["apps/app/src/app/globals.css", "packages/design-system/src/index.ts"],
  },
];
