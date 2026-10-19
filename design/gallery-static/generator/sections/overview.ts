import { JEV_ROUTES, REPO_MAP, RESPONSE_MODES, STREAM_FIELDS, STRIPPED_TOOLS } from "@/components/ui-gallery/analysis-content";
import { callout, code, esc, lede, pathSpan, section, subhead, table } from "../html";

const FLOW_NODES = [
  { id: "user", x: 20, y: 24, w: 150, title: "使用者", sub: "輸入或點建議", kind: "brand" },
  { id: "chat", x: 200, y: 24, w: 150, title: "CopilotChat", sub: "KeyGatedChatView 先檢查金鑰", kind: "plain" },
  { id: "api", x: 380, y: 24, w: 150, title: "/api/copilotkit", sub: "CopilotRuntime + LangGraphHttpAgent", kind: "plain" },
  { id: "agent", x: 560, y: 24, w: 150, title: "FastAPI agent", sub: "Deep Agent + 中介層", kind: "plain" },
  { id: "jev", x: 560, y: 124, w: 150, title: "Jev 路由", sub: "一次決定 13 種型別之一", kind: "accent" },
  { id: "model", x: 380, y: 124, w: 150, title: "模型 + 工具 + 技能", sub: "只保留該 renderer 的工具", kind: "plain" },
  { id: "text", x: 20, y: 224, w: 150, title: "文字", sub: "AnswerMarkdown", kind: "plain" },
  { id: "a2ui", x: 200, y: 224, w: 150, title: "A2UI Table", sub: "tableCatalog → DataTable", kind: "plain" },
  { id: "sandbox", x: 380, y: 224, w: 150, title: "generateSandboxedUi", sub: "六欄位串流", kind: "accent" },
  { id: "renderer", x: 560, y: 224, w: 150, title: "瀏覽器渲染器", sub: "Websandbox iframe + 橋接", kind: "brand" },
];

const FLOW_EDGES = [
  "M170 52 H200",
  "M350 52 H380",
  "M530 52 H560",
  "M635 80 V124",
  "M560 152 H530",
  "M455 180 V200 H95 V224",
  "M455 180 V200 H275 V224",
  "M455 180 V224",
  "M530 252 H560",
];

function flowDiagram(): string {
  return `<svg class="gal-flow" viewBox="0 0 740 300" role="img" aria-label="請求流程：使用者到瀏覽器渲染器">
  <defs><marker id="gal-flow-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M2 1L8 5L2 9" fill="none" stroke="context-stroke" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></marker></defs>
  ${FLOW_EDGES.map((d) => `<path d="${d}" class="gal-flow-edge" marker-end="url(#gal-flow-arrow)"/>`).join("")}
  ${FLOW_NODES.map(
    (n) =>
      `<g class="gal-flow-node gal-flow-node--${n.kind}"><rect x="${n.x}" y="${n.y}" width="${n.w}" height="56" rx="10"/><text x="${n.x + n.w / 2}" y="${n.y + 22}" text-anchor="middle" font-weight="600">${esc(n.title)}</text><text x="${n.x + n.w / 2}" y="${n.y + 40}" text-anchor="middle" class="gal-flow-sub">${esc(n.sub)}</text></g>`,
  ).join("")}
</svg>`;
}

export function renderOverviewSection(): string {
  const intro = `<p><strong>Open Intelligent UI</strong>（CopilotKit 的開源專案）是一個把回答變成「可以操作的東西」的聊天介面：理解一個機制、比較幾個選項，或當場做一個工具。代理依任務選擇純文字、原生元件（A2UI 表格）或自訂互動 UI（串流進隔離 iframe 的 HTML／CSS／JS）。</p>
<p>正式畫面只有一頁聊天。這個展示頁把專案裡<strong>所有設計過的介面</strong>（含寫好但沒掛上的）用 fixture 資料攤開，並附上架構、串流契約、色彩系統與程式碼層面的解析。</p>
<p>這一份是 /gallery 的<strong>靜態重製版</strong>：不載入 React 與 CopilotKit，表格與數字在產生時從專案原始碼算出，互動樣本以 iframe 重播，需要代理後端的畫面以複刻或截圖呈現。每張卡片右上角的小標籤說明它在這裡是真品、複刻還是截圖。</p>`;

  const body = [
    subhead("請求流程"),
    `<div class="gal-item gal-item--wide">${flowDiagram()}${lede("每一則新訊息先由 Jev（TypeSafe System One）做一次型別判斷，再由中介層過濾工具；回答模型只拿到對應 renderer 的契約。代理的 checkpoint 存在程序記憶體（BoundedMemorySaver，200 條 thread），重啟即失去對話。")}</div>`,
    subhead("三種回應模式"),
    table(
      ["使用者任務", "回應形式", "前端渲染", "依據"],
      RESPONSE_MODES.map((m) => [esc(m.task), esc(m.response), esc(m.renderer), pathSpan(m.where)]),
    ),
    subhead("六欄位串流契約與渲染階段"),
    lede("代理必須依序輸出六個參數；渲染器用「CSS 先到才顯示」的門檻避免無樣式閃爍，再以預覽 iframe 逐段 morph，最後換成有橋接的 Websandbox。"),
    table(
      ["#", "欄位", "代理端規則（prompt.py）", "渲染器行為（renderer.tsx）"],
      STREAM_FIELDS.map((f) => [String(f.order), code(f.field), esc(f.agentRule), esc(f.rendererBehaviour)]),
    ),
    subhead("Jev 視覺化型別 → renderer"),
    table(
      ["型別", "renderer", "備註"],
      JEV_ROUTES.map((r) => [code(r.type), esc(r.renderer), esc(r.note)]),
      { dense: true },
    ),
    callout(
      `<strong>被路由剔除的工具：</strong> ${STRIPPED_TOOLS.map(code).join("、")} 列在 RENDER_TOOLS 卻不在任何允許集合，所以前端雖然註冊了 BarChart／PieChart，正式對話中代理拿不到它們。`,
    ),
    subhead("Repo 地圖"),
    table(["路徑", "角色"], REPO_MAP.map((e) => [pathSpan(e.path), esc(e.role)]), { dense: true }),
  ].join("\n");

  return section("overview", intro, body);
}
