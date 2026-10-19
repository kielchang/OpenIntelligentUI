"use client";

import { GallerySection } from "../gallery-section";
import { JEV_ROUTES, REPO_MAP, RESPONSE_MODES, STREAM_FIELDS, STRIPPED_TOOLS } from "../analysis-content";

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
] as const;

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

function FlowDiagram() {
  return (
    <svg className="gal-flow" viewBox="0 0 740 300" role="img" aria-label="請求流程：使用者到瀏覽器渲染器">
      <defs>
        <marker id="gal-flow-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M2 1L8 5L2 9" fill="none" stroke="context-stroke" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </marker>
      </defs>
      {FLOW_EDGES.map((d) => (
        <path key={d} d={d} className="gal-flow-edge" markerEnd="url(#gal-flow-arrow)" />
      ))}
      {FLOW_NODES.map((node) => (
        <g key={node.id} className={`gal-flow-node gal-flow-node--${node.kind}`}>
          <rect x={node.x} y={node.y} width={node.w} height={56} rx={10} />
          <text x={node.x + node.w / 2} y={node.y + 22} textAnchor="middle" fontWeight={600}>
            {node.title}
          </text>
          <text x={node.x + node.w / 2} y={node.y + 40} textAnchor="middle" className="gal-flow-sub">
            {node.sub}
          </text>
        </g>
      ))}
    </svg>
  );
}

export function OverviewSection() {
  return (
    <GallerySection
      id="overview"
      intro={
        <>
          <p>
            <strong>Open Intelligent UI</strong>（CopilotKit 的開源專案）是一個把回答變成「可以操作的東西」的聊天介面：理解一個機制、比較幾個選項，或當場做一個工具。
            代理依任務選擇純文字、原生元件（A2UI 表格）或自訂互動 UI（串流進隔離 iframe 的 HTML／CSS／JS）。
          </p>
          <p>
            正式畫面只有一頁聊天。這個展示頁把專案裡<strong>所有設計過的介面</strong>（含寫好但沒掛上的）用 fixture 資料攤開，並附上架構、串流契約、色彩系統與程式碼層面的解析。
            不需要代理後端與 API 金鑰。
          </p>
        </>
      }
    >
      <h3 className="gal-subhead">請求流程</h3>
      <div className="gal-item gal-item--wide">
        <FlowDiagram />
        <p className="gal-lede">
          每一則新訊息先由 Jev（TypeSafe System One）做一次型別判斷，再由中介層過濾工具；回答模型只拿到對應 renderer 的契約。
          代理的 checkpoint 存在程序記憶體（BoundedMemorySaver，200 條 thread），重啟即失去對話。
        </p>
      </div>

      <h3 className="gal-subhead">三種回應模式</h3>
      <div className="gal-table-wrap">
        <table className="gal-table">
          <thead>
            <tr>
              <th>使用者任務</th>
              <th>回應形式</th>
              <th>前端渲染</th>
              <th>依據</th>
            </tr>
          </thead>
          <tbody>
            {RESPONSE_MODES.map((mode) => (
              <tr key={mode.task}>
                <td>{mode.task}</td>
                <td>{mode.response}</td>
                <td>{mode.renderer}</td>
                <td><span className="gal-path">{mode.where}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3 className="gal-subhead">六欄位串流契約與渲染階段</h3>
      <p className="gal-lede">
        代理必須依序輸出六個參數；渲染器用「CSS 先到才顯示」的門檻避免無樣式閃爍，再以預覽 iframe 逐段 morph，最後換成有橋接的 Websandbox。
      </p>
      <div className="gal-table-wrap">
        <table className="gal-table">
          <thead>
            <tr>
              <th>#</th>
              <th>欄位</th>
              <th>代理端規則（prompt.py）</th>
              <th>渲染器行為（renderer.tsx）</th>
            </tr>
          </thead>
          <tbody>
            {STREAM_FIELDS.map((field) => (
              <tr key={field.field}>
                <td>{field.order}</td>
                <td><code>{field.field}</code></td>
                <td>{field.agentRule}</td>
                <td>{field.rendererBehaviour}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3 className="gal-subhead">Jev 視覺化型別 → renderer</h3>
      <div className="gal-table-wrap">
        <table className="gal-table gal-table--dense">
          <thead>
            <tr>
              <th>型別</th>
              <th>renderer</th>
              <th>備註</th>
            </tr>
          </thead>
          <tbody>
            {JEV_ROUTES.map((route) => (
              <tr key={route.type}>
                <td><code>{route.type}</code></td>
                <td>{route.renderer}</td>
                <td>{route.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="gal-callout">
        <strong>被路由剔除的工具：</strong>{" "}
        {STRIPPED_TOOLS.map((tool) => (
          <code key={tool}>{tool}</code>
        )).reduce<React.ReactNode[]>((acc, node, index) => (index === 0 ? [node] : [...acc, "、", node]), [])}
        {" "}列在 RENDER_TOOLS 卻不在任何允許集合，所以前端雖然註冊了 BarChart／PieChart，正式對話中代理拿不到它們。
      </div>

      <h3 className="gal-subhead">Repo 地圖</h3>
      <div className="gal-table-wrap">
        <table className="gal-table gal-table--dense">
          <thead>
            <tr>
              <th>路徑</th>
              <th>角色</th>
            </tr>
          </thead>
          <tbody>
            {REPO_MAP.map((entry) => (
              <tr key={entry.path}>
                <td><span className="gal-path">{entry.path}</span></td>
                <td>{entry.role}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </GallerySection>
  );
}
