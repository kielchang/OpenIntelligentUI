/**
 * 用 A2UI v0.9 扁平元件格式把基本目錄的 18 個元件全部排一次，餵給 @copilotkit/a2ui-renderer 的 basicCatalog。
 * 每個 surface 只用 schema 允許的 props：排版只有 justify／align／weight 這類提示，沒有 px 也沒有顏色。
 */

import { A2UI_BASIC_CATALOG_ID } from "./catalog-content";

export interface A2UISurfaceSample {
  id: string;
  title: string;
  /** 這個 surface 展示哪些元件 */
  covers: string[];
  note: string;
  components: Record<string, unknown>[];
  /** updateDataModel 的初始資料 */
  data?: Record<string, unknown>;
}

const SWATCH_SVG =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'><rect width='64' height='64' rx='12' fill='#1B936F'/><circle cx='32' cy='32' r='14' fill='#ffffff'/></svg>",
  );

/** 44 byte 的空白 WAV 標頭，讓 AudioPlayer 有合法來源又不需要網路 */
const SILENT_WAV = "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=";
/** 只有 ftyp box 的空 mp4 容器：Video 有合法來源可以畫出播放器，不會發出網路請求 */
const EMPTY_MP4 = "data:video/mp4;base64,AAAAHGZ0eXBpc29tAAACAGlzb21pc28ybXA0MQ==";

const CONTENT_SURFACE: A2UISurfaceSample = {
  id: "gallery-a2ui-content",
  title: "內容元件：Text、Image、Icon、Video、AudioPlayer",
  covers: ["Text", "Image", "Icon", "Video", "AudioPlayer", "Column", "Row"],
  note: "Text 只有七個 variant，Image 只有六個尺寸等級與五種 fit；Icon 只能從 59 個名稱裡挑。渲染器輸出 material-symbols-outlined 的 span，沒有載入該字型，所以這裡把名稱以小標籤顯示；正式部署要自行載入 Material Symbols。最後一個 icon 綁到資料模型 /iconName。",
  components: [
    { id: "root", component: "Column", children: ["h1", "h2", "h3", "h4", "h5", "body", "caption", "image-row", "icon-row", "video", "audio"] },
    { id: "h1", component: "Text", text: "A2UI 基本目錄 h1 標題", variant: "h1" },
    { id: "h2", component: "Text", text: "h2 標題", variant: "h2" },
    { id: "h3", component: "Text", text: "h3 標題", variant: "h3" },
    { id: "h4", component: "Text", text: "h4 標題", variant: "h4" },
    { id: "h5", component: "Text", text: "h5 標題", variant: "h5" },
    { id: "body", component: "Text", text: "body：模型只能選 variant，字級、字重、顏色全由渲染器決定。", variant: "body" },
    { id: "caption", component: "Text", text: "caption：說明文字", variant: "caption" },
    { id: "image-row", component: "Row", justify: "start", align: "center", children: ["img-icon", "img-avatar", "img-small", "img-cover"] },
    { id: "img-icon", component: "Image", url: SWATCH_SVG, description: "icon 尺寸", variant: "icon" },
    { id: "img-avatar", component: "Image", url: SWATCH_SVG, description: "avatar 尺寸", variant: "avatar" },
    { id: "img-small", component: "Image", url: SWATCH_SVG, description: "smallFeature 尺寸", variant: "smallFeature" },
    { id: "img-cover", component: "Image", url: SWATCH_SVG, description: "fit: cover", variant: "smallFeature", fit: "cover" },
    { id: "icon-row", component: "Row", justify: "start", align: "center", children: ["ic-check", "ic-star", "ic-warning", "ic-info", "ic-cart", "ic-bound"] },
    { id: "ic-check", component: "Icon", name: "check" },
    { id: "ic-star", component: "Icon", name: "star" },
    { id: "ic-warning", component: "Icon", name: "warning" },
    { id: "ic-info", component: "Icon", name: "info" },
    { id: "ic-cart", component: "Icon", name: "shoppingCart" },
    { id: "ic-bound", component: "Icon", name: { path: "/iconName" } },
    { id: "video", component: "Video", url: EMPTY_MP4 },
    { id: "audio", component: "AudioPlayer", url: SILENT_WAV, description: "無聲 WAV" },
  ],
  data: { iconName: "favorite" },
};

const LAYOUT_SURFACE: A2UISurfaceSample = {
  id: "gallery-a2ui-layout",
  title: "排版容器：Row、Column、List、Card、Tabs、Modal、Divider 與版面旋鈕",
  covers: ["Row", "Column", "List", "Card", "Tabs", "Modal", "Divider", "Button", "Text"],
  note: "模型能動的只有 justify、align、weight、direction、axis 這幾個提示；間距、邊框、陰影都是渲染器寫死的，Card 一律撐滿寬度，weight 在這版 React 渲染器裡沒有對應的 flex-grow。children 也可以是 {componentId, path} 模板，從資料模型展開成清單。按鈕點了會以 toast 顯示 action。",
  components: [
    { id: "root", component: "Column", children: ["lbl-justify", "row-between", "row-center", "row-end", "lbl-weight", "row-weight", "lbl-list", "list-h", "lbl-template", "list-template", "lbl-tabs", "tabs", "lbl-modal", "modal", "divider-h", "row-vdivider"] },
    { id: "lbl-justify", component: "Text", text: "Row justify: spaceBetween / center / end，align: center", variant: "caption" },
    { id: "row-between", component: "Row", justify: "spaceBetween", align: "center", children: ["chip-a", "chip-b", "chip-c"] },
    { id: "row-center", component: "Row", justify: "center", align: "center", children: ["chip-d", "chip-e"] },
    { id: "row-end", component: "Row", justify: "end", align: "center", children: ["chip-f"] },
    { id: "chip-a", component: "Button", child: "chip-a-t", variant: "default", action: { event: { name: "layout_demo", context: { slot: "start" } } } },
    { id: "chip-a-t", component: "Text", text: "start" },
    { id: "chip-b", component: "Button", child: "chip-b-t", variant: "default", action: { event: { name: "layout_demo", context: { slot: "middle" } } } },
    { id: "chip-b-t", component: "Text", text: "middle" },
    { id: "chip-c", component: "Button", child: "chip-c-t", variant: "default", action: { event: { name: "layout_demo", context: { slot: "end" } } } },
    { id: "chip-c-t", component: "Text", text: "end" },
    { id: "chip-d", component: "Button", child: "chip-d-t", variant: "primary", action: { event: { name: "layout_demo", context: { slot: "center-1" } } } },
    { id: "chip-d-t", component: "Text", text: "center 1" },
    { id: "chip-e", component: "Button", child: "chip-e-t", variant: "primary", action: { event: { name: "layout_demo", context: { slot: "center-2" } } } },
    { id: "chip-e-t", component: "Text", text: "center 2" },
    { id: "chip-f", component: "Button", child: "chip-f-t", variant: "borderless", action: { event: { name: "layout_demo", context: { slot: "end" } } } },
    { id: "chip-f-t", component: "Text", text: "end（borderless）" },
    { id: "lbl-weight", component: "Text", text: "weight 1 : 2 : 1（spec 的 flex-grow 提示；這版 React 渲染器沒有實作 weight，所以三欄等寬）", variant: "caption" },
    { id: "row-weight", component: "Row", justify: "stretch", align: "stretch", children: ["w1", "w2", "w3"] },
    { id: "w1", component: "Card", weight: 1, child: "w1-t" },
    { id: "w1-t", component: "Text", text: "weight 1" },
    { id: "w2", component: "Card", weight: 2, child: "w2-t" },
    { id: "w2-t", component: "Text", text: "weight 2" },
    { id: "w3", component: "Card", weight: 1, child: "w3-t" },
    { id: "w3-t", component: "Text", text: "weight 1" },
    { id: "lbl-list", component: "Text", text: "List direction: horizontal", variant: "caption" },
    { id: "list-h", component: "List", direction: "horizontal", align: "center", children: ["li-1", "li-2", "li-3", "li-4"] },
    { id: "li-1", component: "Text", text: "項目一" },
    { id: "li-2", component: "Text", text: "項目二" },
    { id: "li-3", component: "Text", text: "項目三" },
    { id: "li-4", component: "Text", text: "項目四" },
    { id: "lbl-template", component: "Text", text: "List children 模板：{componentId: \"tpl-row\", path: \"/plans\"}，從資料模型展開三列", variant: "caption" },
    { id: "list-template", component: "List", direction: "vertical", align: "stretch", children: { componentId: "tpl-row", path: "/plans" } },
    { id: "tpl-row", component: "Row", justify: "spaceBetween", align: "center", children: ["tpl-name", "tpl-price"] },
    { id: "tpl-name", component: "Text", text: { path: "name" } },
    { id: "tpl-price", component: "Text", text: { call: "formatCurrency", args: { value: { path: "price" }, currency: "TWD", decimals: 0 }, returnType: "string" } },
    { id: "lbl-tabs", component: "Text", text: "Tabs: [{title, child}]", variant: "caption" },
    { id: "tabs", component: "Tabs", tabs: [{ title: "方案 A", child: "tab-a" }, { title: "方案 B", child: "tab-b" }] },
    { id: "tab-a", component: "Text", text: "方案 A 的內容：child 只能指向已定義的元件 id。" },
    { id: "tab-b", component: "Text", text: "方案 B 的內容。" },
    { id: "lbl-modal", component: "Text", text: "Modal: trigger + content", variant: "caption" },
    { id: "modal", component: "Modal", trigger: "modal-trigger", content: "modal-body" },
    { id: "modal-trigger", component: "Button", child: "modal-trigger-t", variant: "default", action: { event: { name: "open_modal" } } },
    { id: "modal-trigger-t", component: "Text", text: "開啟 Modal" },
    { id: "modal-body", component: "Column", children: ["modal-title", "modal-text"] },
    { id: "modal-title", component: "Text", text: "Modal 內容", variant: "h3" },
    { id: "modal-text", component: "Text", text: "關閉鈕由渲染器提供，模型只決定 trigger 與 content。" },
    { id: "divider-h", component: "Divider", axis: "horizontal" },
    { id: "row-vdivider", component: "Row", justify: "start", align: "stretch", children: ["vd-left", "divider-v", "vd-right"] },
    { id: "vd-left", component: "Text", text: "左" },
    { id: "divider-v", component: "Divider", axis: "vertical" },
    { id: "vd-right", component: "Text", text: "右（中間是 axis: vertical 的 Divider）" },
  ],
  data: {
    plans: [
      { name: "海岸", price: 4200 },
      { name: "城市", price: 3600 },
      { name: "山區", price: 2900 },
    ],
  },
};

const INPUT_SURFACE: A2UISurfaceSample = {
  id: "gallery-a2ui-inputs",
  title: "輸入與動作：TextField、CheckBox、ChoicePicker、Slider、DateTimeInput、Button，加資料綁定與 client 函式",
  covers: ["TextField", "CheckBox", "ChoicePicker", "Slider", "DateTimeInput", "Button", "Text", "Column", "Row"],
  note: "每個輸入都綁到資料模型的 {path}；下方的 Text 用 formatString、pluralize 即時讀同一份資料。Email 欄位掛了 checks: email() 驗證。按 Primary 會把 context 裡的綁定值一起送出，頁面上以 toast 顯示代理會收到的 action。",
  components: [
    { id: "root", component: "Column", children: ["name", "email", "qty", "notes", "secret", "agree", "plan", "toppings", "volume", "date", "time", "echo", "echo-plural", "echo-currency", "buttons"] },
    { id: "name", component: "TextField", label: "Name（shortText）", value: { path: "/name" }, variant: "shortText" },
    {
      id: "email",
      component: "TextField",
      label: "Email（checks: email）",
      value: { path: "/email" },
      variant: "shortText",
      checks: [{ condition: { call: "email", args: { value: { path: "/email" } }, returnType: "boolean" }, message: "請輸入有效的 email" }],
    },
    { id: "qty", component: "TextField", label: "Quantity（number）", value: { path: "/qty" }, variant: "number" },
    { id: "notes", component: "TextField", label: "Notes（longText）", value: { path: "/notes" }, variant: "longText" },
    { id: "secret", component: "TextField", label: "Password（obscured）", value: { path: "/secret" }, variant: "obscured" },
    { id: "agree", component: "CheckBox", label: "我同意（CheckBox）", value: { path: "/agree" } },
    {
      id: "plan",
      component: "ChoicePicker",
      label: "方案（mutuallyExclusive · chips）",
      variant: "mutuallyExclusive",
      displayStyle: "chips",
      options: [
        { label: "海岸", value: "coast" },
        { label: "城市", value: "city" },
        { label: "山區", value: "mountain" },
      ],
      value: { path: "/plan" },
    },
    {
      id: "toppings",
      component: "ChoicePicker",
      label: "配料（multipleSelection · checkbox · filterable）",
      variant: "multipleSelection",
      displayStyle: "checkbox",
      filterable: true,
      options: [
        { label: "起司", value: "cheese" },
        { label: "蘑菇", value: "mushroom" },
        { label: "橄欖", value: "olive" },
        { label: "羅勒", value: "basil" },
        { label: "辣椒", value: "chili" },
      ],
      value: { path: "/toppings" },
    },
    { id: "volume", component: "Slider", label: "Volume（Slider 0–100）", min: 0, max: 100, value: { path: "/volume" } },
    { id: "date", component: "DateTimeInput", label: "Date（enableDate）", enableDate: true, enableTime: false, value: { path: "/date" } },
    { id: "time", component: "DateTimeInput", label: "Time（enableTime）", enableDate: false, enableTime: true, value: { path: "/time" } },
    {
      id: "echo",
      component: "Text",
      text: { call: "formatString", args: { value: "formatString：${/name} 選了 ${/plan}，volume ${/volume}" }, returnType: "string" },
      variant: "body",
    },
    {
      id: "echo-plural",
      component: "Text",
      text: { call: "pluralize", args: { value: { path: "/volume" }, one: "pluralize：one item", other: "pluralize：other items" }, returnType: "string" },
      variant: "caption",
    },
    {
      id: "echo-currency",
      component: "Text",
      text: { call: "formatCurrency", args: { value: { path: "/price" }, currency: "TWD", decimals: 0 }, returnType: "string" },
      variant: "caption",
    },
    { id: "buttons", component: "Row", justify: "start", align: "center", children: ["btn-default", "btn-primary", "btn-borderless", "btn-fn"] },
    { id: "btn-default", component: "Button", child: "btn-default-t", variant: "default", action: { event: { name: "cancel" } } },
    { id: "btn-default-t", component: "Text", text: "Default" },
    {
      id: "btn-primary",
      component: "Button",
      child: "btn-primary-t",
      variant: "primary",
      action: { event: { name: "submit", context: { name: { path: "/name" }, plan: { path: "/plan" }, volume: { path: "/volume" }, agree: { path: "/agree" } } } },
    },
    { id: "btn-primary-t", component: "Text", text: "Primary：送出 action" },
    { id: "btn-borderless", component: "Button", child: "btn-borderless-t", variant: "borderless", action: { event: { name: "skip" } } },
    { id: "btn-borderless-t", component: "Text", text: "Borderless" },
    { id: "btn-fn", component: "Button", child: "btn-fn-t", variant: "default", action: { functionCall: { call: "openUrl", args: { url: "https://a2ui.org" }, returnType: "void" } } },
    { id: "btn-fn-t", component: "Text", text: "functionCall: openUrl（開新分頁）" },
  ],
  data: {
    name: "Sample Lee",
    email: "sample@example.invalid",
    qty: 3,
    notes: "",
    secret: "",
    agree: false,
    plan: ["coast"],
    toppings: ["cheese"],
    volume: 40,
    date: "2026-10-11",
    time: "09:30",
    price: 1234.5,
  },
};

export const A2UI_SURFACES: A2UISurfaceSample[] = [CONTENT_SURFACE, LAYOUT_SURFACE, INPUT_SURFACE];

/** 把一個 surface 轉成 v0.9 的 server→client 訊息序列 */
export function surfaceMessages(sample: A2UISurfaceSample): Record<string, unknown>[] {
  const messages: Record<string, unknown>[] = [
    { version: "v0.9", createSurface: { surfaceId: sample.id, catalogId: A2UI_BASIC_CATALOG_ID } },
  ];
  if (sample.data) {
    messages.push({ version: "v0.9", updateDataModel: { surfaceId: sample.id, path: "/", value: sample.data } });
  }
  messages.push({ version: "v0.9", updateComponents: { surfaceId: sample.id, components: sample.components } });
  return messages;
}
