/**
 * 「材料集合」區塊的靜態資料：模型在各條路線上能從哪些集合裡挑材料。
 * 清單內容由 __tests__/catalog-content.test.ts 對照 node_modules 的 A2UI 目錄與原始檔。
 */

export type WiredState = "wired" | "partial" | "unwired" | "external";

export const WIRED_LABEL: Record<WiredState, string> = {
  wired: "已接線",
  partial: "部分接線",
  unwired: "未接線",
  external: "外部",
};

export interface CollectionEntry {
  id: string;
  name: string;
  /** 材料數量的文字摘要 */
  count: string;
  source: string;
  /** 誰在什麼時候從這個集合裡挑 */
  picker: string;
  wired: WiredState;
  wiredNote: string;
  /** 頁內錨點 */
  demo?: string;
  demoLabel?: string;
}

export const A2UI_BASIC_CATALOG_ID = "https://a2ui.org/specification/v0_9/basic_catalog.json";
export const TABLE_CATALOG_ID = "copilotkit://open-generative-ui-tables";

export const COLLECTIONS: CollectionEntry[] = [
  {
    id: "a2ui-basic",
    name: "A2UI v0.9 基本目錄（basicCatalog）",
    count: "18 元件 · 14 個 schema 函式（runtime 另 11 個）· 59 個 icon 名稱",
    source: "@a2ui/web_core/v0_9/schemas/basic_catalog.json · @copilotkit/a2ui-renderer",
    picker: "generate_a2ui 的次級模型從目錄點名元件、排巢狀、給版面提示",
    wired: "unwired",
    wiredNote: "套件隨 app 安裝，但 provider 只掛 tableCatalog；這一頁是它在專案裡第一次被完整畫出來",
    demo: "#item-a2ui-content",
    demoLabel: "實渲染 18 個元件",
  },
  {
    id: "a2ui-v08",
    name: "A2UI v0.8 標準目錄",
    count: "18 元件（MultipleChoice 取代 ChoicePicker）",
    source: "@a2ui/web_core/v0_8/schemas/standard_catalog_definition.json · apps/agent/src/form.py",
    picker: "generate_form 工具以手寫固定 schema 組登入卡，模型只決定要不要呼叫",
    wired: "unwired",
    wiredNote: "0.8 信封與巢狀寫法，0.9 渲染器不認；前端也刻意忽略 generate_form",
    demo: "#item-a2ui-versions",
    demoLabel: "0.8 vs 0.9 對照",
  },
  {
    id: "table-catalog",
    name: "專案 A2UI 目錄 tableCatalog",
    count: "1 元件（Table）",
    source: "apps/app/src/components/generative-ui/table-catalog.tsx",
    picker: "Jev 判為 table 後，render_a2ui 只填 title、columns、rows、source",
    wired: "wired",
    wiredNote: "正式對話唯一會畫出來的 A2UI 元件",
    demo: "#item-data-table",
    demoLabel: "看表格",
  },
  {
    id: "controlled",
    name: "Controlled 元件（前端工具）",
    count: "4 個有 UI · 1 個無 UI · 1 個預設渲染",
    source: "apps/app/src/hooks/use-generative-ui-examples.tsx",
    picker: "主模型選工具並填參數；Jev 路由時剔除 barChart、pieChart、generate_form",
    wired: "partial",
    wiredNote: "元件掛著，但 Jev 開啟後圖表工具不會出現在模型面前",
    demo: "#item-controlled",
    demoLabel: "對照表",
  },
  {
    id: "sandbox",
    name: "沙箱材料（設計系統）",
    count: "27 token · 9 色階 · 7 個圖表輔助類別 · 4 個 CDN 函式庫",
    source: "packages/design-system/src/index.ts",
    picker: "generateSandboxedUi 時由設計技能文字指示模型取用，版面仍由模型當場寫",
    wired: "wired",
    wiredNote: "THEME、FORM、SVG 三段 CSS 注入每個沙箱；importmap 提供 three、gsap、d3、chart.js",
    demo: "#item-sandbox-materials",
    demoLabel: "材料清單",
  },
  {
    id: "skills",
    name: "代理技能",
    count: "3 份技能 · 3 種圖型 · 6 個 SVG 元件模式",
    source: "apps/agent/skills/*/SKILL.md",
    picker: "代理依 master-playbook 讀取；apps/mcp 也把同一批技能當 resource 提供",
    wired: "wired",
    wiredNote: "唯一以「模式」而非「元件」供模型挑選的集合",
    demo: "#item-skills",
    demoLabel: "技能與模式",
  },
  {
    id: "jev",
    name: "Jev 視覺化型別",
    count: "13 型別 → 3 條渲染路線",
    source: "apps/agent/src/visualization_router.py",
    picker: "Jev 路由模型先挑型別，再決定 text、A2UI 或沙箱",
    wired: "wired",
    wiredNote: "需要 TYPESAFE_API_KEY；這一步挑的是路線，不是版面",
    demo: "#overview",
    demoLabel: "路由表",
  },
  {
    id: "tools",
    name: "代理工具",
    count: "6 個已註冊 · 5 個定義未註冊",
    source: "apps/agent/main.py · apps/agent/src/templates.py",
    picker: "主模型工具選擇",
    wired: "partial",
    wiredNote: "templates.py 的五個範本工具沒有進 tools 清單",
    demo: "#agent-defined",
    demoLabel: "工具表",
  },
  {
    id: "templates",
    name: "版面範本與示範提示",
    count: "3 份 seed 範本 · 7 條 demo 提示",
    source: "apps/app/src/components/template-library/seed-templates.ts · demo-gallery/demo-data.ts",
    picker: "pending_template state 與 DemoGallery 抽屜，兩者都沒有入口",
    wired: "unwired",
    wiredNote: "專案裡唯一「從版面集合挑」的機制，設計了卻沒接上",
    demo: "#item-template-card",
    demoLabel: "範本卡",
  },
  {
    id: "mcp",
    name: "MCP Apps 伺服器",
    count: "0 個（可選接頭）",
    source: "apps/app/src/lib/copilotkit-runtime-options.ts · apps/mcp/src/server.ts",
    picker: "主模型選 MCP 工具；宿主抓伺服器預先宣告的 ui:// 模板",
    wired: "external",
    wiredNote: "只有設 MCP_SERVER_URL 才接；自家 apps/mcp 只註冊工具，沒有 ui:// 資源",
  },
  {
    id: "open-gen-ui",
    name: "Open Generative UI",
    count: "沒有集合：每次當場生成",
    source: "generateSandboxedUi（由 runtime 注入）",
    picker: "模型當場寫 HTML、CSS、JS；只受技能與設計系統的文字規則約束",
    wired: "wired",
    wiredNote: "本專案主路徑；材料來自上面的「沙箱材料」與「代理技能」",
    demo: "#generative",
    demoLabel: "串流重播",
  },
];

export type A2UIGroup = "content" | "layout" | "input";

export const A2UI_GROUP_LABEL: Record<A2UIGroup, string> = {
  content: "內容",
  layout: "排版容器",
  input: "輸入與動作",
};

export interface A2UIComponentEntry {
  name: string;
  group: A2UIGroup;
  /** 主要 props 摘要 */
  props: string;
  /** 模型能動的排版或樣式旋鈕 */
  knobs?: string;
}

/** v0.9 基本目錄 18 個元件；順序與 basic_catalog.json 相同 */
export const A2UI_BASIC_COMPONENTS: A2UIComponentEntry[] = [
  { name: "Text", group: "content", props: "text: DynamicString", knobs: "variant: h1 · h2 · h3 · h4 · h5 · body · caption" },
  { name: "Image", group: "content", props: "url、description", knobs: "fit: contain · cover · fill · none · scaleDown；variant: icon · avatar · smallFeature · mediumFeature · largeFeature · header" },
  { name: "Icon", group: "content", props: "name: 59 個固定名稱或 {path}" },
  { name: "Video", group: "content", props: "url" },
  { name: "AudioPlayer", group: "content", props: "url、description" },
  { name: "Row", group: "layout", props: "children: id[] 或 {componentId, path} 模板", knobs: "justify: start · center · end · spaceBetween · spaceAround · spaceEvenly · stretch；align: start · center · end · stretch" },
  { name: "Column", group: "layout", props: "children", knobs: "justify、align 同 Row，主軸改為垂直" },
  { name: "List", group: "layout", props: "children", knobs: "direction: vertical · horizontal；align" },
  { name: "Card", group: "layout", props: "child: 單一子元件 id" },
  { name: "Tabs", group: "layout", props: "tabs: [{title, child}]" },
  { name: "Modal", group: "layout", props: "trigger、content: 子元件 id" },
  { name: "Divider", group: "layout", props: "無", knobs: "axis: horizontal · vertical" },
  { name: "Button", group: "input", props: "child、action: {event:{name, context}} 或 {functionCall}", knobs: "variant: default · primary · borderless" },
  { name: "TextField", group: "input", props: "label、value: {path}、validationRegexp、checks", knobs: "variant: shortText · longText · number · obscured" },
  { name: "CheckBox", group: "input", props: "label、value: {path}、checks" },
  { name: "ChoicePicker", group: "input", props: "label、options: [{label, value}]、value: {path}", knobs: "variant: mutuallyExclusive · multipleSelection；displayStyle: checkbox · chips；filterable" },
  { name: "Slider", group: "input", props: "label、min、max、value: {path}" },
  { name: "DateTimeInput", group: "input", props: "label、value: {path}、min、max", knobs: "enableDate、enableTime" },
];

/** 所有元件共有：weight（flex-grow，只在 Row／Column 的直接子元件生效）；沒有 px、沒有顏色、沒有 CSS */
export const A2UI_COMMON_PROPS = "id、component、weight（spec 定義為 flex-grow 提示，只在 Row／Column 直接子元件生效；@copilotkit/a2ui-renderer 1.55.2 的 React 元件沒有實作它）";

export type A2UIFunctionRole = "validate" | "format" | "logic" | "action";

export const A2UI_FUNCTION_ROLE_LABEL: Record<A2UIFunctionRole, string> = {
  validate: "驗證",
  format: "格式化",
  logic: "邏輯",
  action: "動作",
};

export interface A2UIFunctionEntry {
  name: string;
  role: A2UIFunctionRole;
  args: string;
}

/** v0.9 基本目錄 14 個 client 函式；用在 DynamicValue 的 {call, args, returnType} 與 checks */
export const A2UI_BASIC_FUNCTIONS: A2UIFunctionEntry[] = [
  { name: "required", role: "validate", args: "value" },
  { name: "regex", role: "validate", args: "value、pattern" },
  { name: "length", role: "validate", args: "value、min／max" },
  { name: "numeric", role: "validate", args: "value、min／max" },
  { name: "email", role: "validate", args: "value" },
  { name: "formatString", role: "format", args: "value（含 ${/path} 與 ${fn()} 插值）" },
  { name: "formatNumber", role: "format", args: "value、decimals、grouping" },
  { name: "formatCurrency", role: "format", args: "value、currency、decimals" },
  { name: "formatDate", role: "format", args: "value、format（TR35 樣式）" },
  { name: "pluralize", role: "format", args: "value、zero／one／two／few／many／other" },
  { name: "and", role: "logic", args: "values[]" },
  { name: "or", role: "logic", args: "values[]" },
  { name: "not", role: "logic", args: "value" },
  { name: "openUrl", role: "action", args: "url" },
];

/** 安裝的 runtime（@a2ui/web_core BASIC_FUNCTIONS）多實作、但沒寫進 basic_catalog.json 的函式 */
export const A2UI_RUNTIME_EXTRA_FUNCTIONS = [
  "add", "subtract", "multiply", "divide",
  "equals", "not_equals", "greater_than", "less_than",
  "contains", "starts_with", "ends_with",
];

/** Icon.name 的固定清單；順序與 schema 相同 */
export const A2UI_ICON_NAMES = [
  "accountCircle", "add", "arrowBack", "arrowForward", "attachFile", "calendarToday", "call", "camera", "check", "close",
  "delete", "download", "edit", "event", "error", "fastForward", "favorite", "favoriteOff", "folder", "help",
  "home", "info", "locationOn", "lock", "lockOpen", "mail", "menu", "moreVert", "moreHoriz", "notificationsOff",
  "notifications", "pause", "payment", "person", "phone", "photo", "play", "print", "refresh", "rewind",
  "search", "send", "settings", "share", "shoppingCart", "skipNext", "skipPrevious", "star", "starHalf", "starOff",
  "stop", "upload", "visibility", "visibilityOff", "volumeDown", "volumeMute", "volumeOff", "volumeUp", "warning",
];

/** v0.8 標準目錄的 18 個元件名稱（字母序） */
export const A2UI_V08_COMPONENTS = [
  "AudioPlayer", "Button", "Card", "CheckBox", "Column", "DateTimeInput", "Divider", "Icon", "Image", "List",
  "Modal", "MultipleChoice", "Row", "Slider", "Tabs", "Text", "TextField", "Video",
];

export interface VersionDiffRow {
  aspect: string;
  v08: string;
  v09: string;
  /** form.py 實際用的是哪一邊 */
  formPy?: string;
}

export const A2UI_VERSION_DIFF: VersionDiffRow[] = [
  { aspect: "訊息信封", v08: "surfaceUpdate · dataModelUpdate · beginRendering", v09: "createSurface · updateComponents · updateDataModel · deleteSurface", formPy: "surfaceUpdate + beginRendering" },
  { aspect: "元件寫法", v08: "巢狀：{ id, component: { Card: { child } } }", v09: "扁平：{ id, component: \"Card\", child }", formPy: "巢狀" },
  { aspect: "排版旋鈕", v08: "Column／Row 用 alignment、distribution", v09: "justify、align（對應 flex 的 justify-content、align-items）", formPy: "alignment: center、distribution: center" },
  { aspect: "文字樣式", v08: "Text.usageHint: h1 … caption", v09: "Text.variant", formPy: "usageHint: h2、caption" },
  { aspect: "選項元件", v08: "MultipleChoice", v09: "ChoicePicker（variant + displayStyle + filterable）" },
  { aspect: "根節點", v08: "beginRendering.root 指定 id", v09: "元件 id 必須是 root", formPy: "root: \"root\"" },
  { aspect: "目錄", v08: "固定標準目錄", v09: "createSurface.catalogId 必填，可自訂目錄" },
  { aspect: "主題", v08: "beginRendering.styles", v09: "createSurface.theme：primaryColor、iconUrl、agentDisplayName" },
  { aspect: "資料綁定", v08: "{ path }", v09: "{ path } 不變；另加 client 函式 {call, args, returnType} 與 checks 驗證" },
];

export interface SandboxMaterialGroup {
  group: string;
  items: string[];
  source: string;
  demo: string;
  demoLabel: string;
}

export const SANDBOX_MATERIALS: SandboxMaterialGroup[] = [
  {
    group: "色彩 token（21）",
    items: [
      "--color-background-primary", "--color-background-secondary", "--color-background-tertiary",
      "--color-background-info", "--color-background-danger", "--color-background-success", "--color-background-warning",
      "--color-text-primary", "--color-text-secondary", "--color-text-tertiary",
      "--color-text-info", "--color-text-danger", "--color-text-success", "--color-text-warning",
      "--color-border-primary", "--color-border-secondary", "--color-border-tertiary",
      "--color-border-info", "--color-border-danger", "--color-border-success", "--color-border-warning",
    ],
    source: "THEME_CSS",
    demo: "#design-system",
    demoLabel: "token 色票",
  },
  {
    group: "字體與圓角（6）",
    items: ["--font-sans", "--font-serif", "--font-mono", "--border-radius-md", "--border-radius-lg", "--border-radius-xl"],
    source: "THEME_CSS",
    demo: "#design-system",
    demoLabel: "token 色票",
  },
  {
    group: "表單控制項（預先套好樣式）",
    items: ["button", "input[type=text]", "input[type=number]", "input[type=email]", "input[type=search]", "input[type=range]", "input[type=checkbox]", "input[type=radio]", "textarea", "select"],
    source: "FORM_STYLES_CSS",
    demo: "#item-design-frame",
    demoLabel: "沙箱內實際樣式",
  },
  {
    group: "SVG 色階（9）",
    items: [".c-purple", ".c-teal", ".c-coral", ".c-pink", ".c-gray", ".c-blue", ".c-green", ".c-amber", ".c-red"],
    source: "SVG_CLASSES_CSS",
    demo: "#item-svg-ramps",
    demoLabel: "色階與 CVD",
  },
  {
    group: "圖表輔助類別（7）",
    items: [".box", ".node", ".arr", ".leader", ".t", ".ts", ".th"],
    source: "SVG_CLASSES_CSS",
    demo: "#item-design-frame",
    demoLabel: "沙箱內實際樣式",
  },
  {
    group: "CDN 函式庫 importmap（4）",
    items: ["three", "gsap", "d3", "chart.js"],
    source: "IMPORTMAP（esm.sh）",
    demo: "#generative",
    demoLabel: "Chart.js 與 Three.js 樣本",
  },
  {
    group: "設計技能文字",
    items: ["只用 CSS 變數上色", "深色自動", "基本控制項不重做樣式", "flex／grid 緊湊間距", "css 參數只放 widget 專屬樣式"],
    source: "OPEN_GEN_UI_DESIGN_SKILL",
    demo: "#method-constraint",
    demoLabel: "約束層規則",
  },
];

export interface SkillMaterial {
  name: string;
  description: string;
  /** 技能提供給模型挑選的模式 */
  patterns: string[];
  demo: string;
  demoLabel: string;
}

export const SKILL_MATERIALS: SkillMaterial[] = [
  {
    name: "master-playbook",
    description: "Choose text, native components, or a custom interactive answer for understanding, comparing, and making tools.",
    patterns: ["Data and assumptions", "Tool contract", "Functional and accessible answers", "Follow-up bridge"],
    demo: "#method-decision",
    demoLabel: "決策層規則",
  },
  {
    name: "advanced-visualization",
    description: "Build responsive, accessible calculators, comparisons, charts, and simulations with the sandbox contract.",
    patterns: ["Streaming and execution", "Data and calculations", "Controls and layout", "Agent follow-ups", "Live geographic maps", "Trip itineraries with sequential pin drops"],
    demo: "#generative",
    demoLabel: "計算機、地圖與行程樣本",
  },
  {
    name: "svg-diagrams",
    description: "Generating rich inline SVG diagrams to visually explain systems, processes, architectures, and abstract concepts.",
    patterns: [
      "圖型：Flowchart、Structural Diagram、Illustrative Diagram",
      "元件模式：Single-Line Node、Two-Line Node、Arrow Connector、Dashed Flow Indicator、Leader Line with Label、Large Container",
      "680px viewBox、九色階、文字寬度估算",
    ],
    demo: "#sample-skill-svg-three-step-flow",
    demoLabel: "三步流程 SVG",
  },
];

export interface ControlledComponent {
  name: string;
  hook: string;
  component: string;
  file: string;
  /** Jev 路由啟用時是否被剔除 */
  strippedByJev: boolean;
  demo?: string;
}

export const CONTROLLED_COMPONENTS: ControlledComponent[] = [
  { name: "pieChart", hook: "useComponent", component: "PieChart", file: "components/generative-ui/charts/pie-chart.tsx", strippedByJev: true, demo: "#response" },
  { name: "barChart", hook: "useComponent", component: "BarChart", file: "components/generative-ui/charts/bar-chart.tsx", strippedByJev: true, demo: "#response" },
  { name: "plan_visualization", hook: "useRenderTool", component: "PlanCard", file: "components/generative-ui/plan-card.tsx", strippedByJev: false, demo: "#response" },
  { name: "scheduleTime", hook: "useHumanInTheLoop", component: "MeetingTimePicker", file: "components/generative-ui/meeting-time-picker.tsx", strippedByJev: false, demo: "#item-meeting-picker" },
  { name: "toggleTheme", hook: "useFrontendTool", component: "無 UI：切換 light／dark", file: "hooks/use-theme.tsx", strippedByJev: false },
  { name: "（其餘工具）", hook: "useDefaultRenderTool", component: "ToolReasoning；generate_form 回傳空片段", file: "components/tool-rendering.tsx", strippedByJev: false, demo: "#response" },
];
