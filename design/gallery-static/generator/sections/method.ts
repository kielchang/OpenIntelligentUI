import { DESIGN_LAYERS, MCP_DIFF, RENDER_STAGES, STREAM_PIPELINE, VERDICT } from "@/components/ui-gallery/design-method-content";
import { anchor, code, esc, item, pathSpan, section, shot, subhead, table } from "../html";

function rulesTable(layerId: string): string {
  const layer = DESIGN_LAYERS.find((l) => l.id === layerId);
  if (!layer) return "";
  return table(
    ["規則", "原始來源", "頁內對照"],
    layer.rules.map((rule) => [
      `${esc(rule.rule)}${rule.note ? `<div class="gal-rule-note">${esc(rule.note)}</div>` : ""}`,
      pathSpan(rule.source),
      rule.demo ? anchor(rule.demo, rule.demoLabel ?? "看 demo") : `<span class="gal-meta">無對應 demo</span>`,
    ]),
    { dense: true, className: "gal-rules" },
  );
}

const STAGE_SHOTS = ["03-stream-1-placeholder.png", "03-stream-2-preview.png", "03-stream-3-final.png"];

export function renderMethodSection(): string {
  const intro = `<p>這個專案不是在設計一組介面，而是在設計<strong>一套讓模型在幾秒內生成介面的規則系統</strong>。介面設計拆成三層：決策層決定該出哪種介面，約束層規定介面必須長怎樣、怎麼動，交付層決定它怎麼在串流中出現。外面再包一層刻意極簡的聊天外殼。</p>
<p>每條規則都標出原始檔案，並連到這一頁裡對應的 demo；點「↓」會捲到該處。</p>`;

  const layers = DESIGN_LAYERS.map((layer) =>
    item({
      id: `method-${layer.id}`,
      name: layer.title,
      path: "規則表：每列對照一個原始檔案與一個頁內 demo",
      state: "mounted",
      show: "replica",
      demo: "plain",
      wide: true,
      propsSummary: layer.summary,
      body: rulesTable(layer.id),
    }),
  ).join("\n");

  const pipeline = table(
    ["欄位", "中介層解析時機", "發出的事件", "瀏覽器反應"],
    STREAM_PIPELINE.map((row) => [code(row.field), esc(row.when), esc(row.event), esc(row.browser)]),
    { dense: true },
  );

  const stages = `<div class="gal-grid">${RENDER_STAGES.map(
    (stage, index) =>
      `<div class="gal-callout"><strong>${esc(stage.title)}</strong><div class="gal-meta" style="margin:4px 0 6px">條件：${esc(stage.condition)}</div>${esc(stage.detail)}${shot(
        STAGE_SHOTS[index],
        `${stage.title}在本機 /gallery 的畫面`,
        "本機 /gallery 以正式渲染器重播時的這一段",
      )}</div>`,
  ).join("")}</div>`;

  const mcp = table(["面向", "web 串流渲染器", "MCP assemble_document"], MCP_DIFF.map((row) => [esc(row.aspect), esc(row.web), esc(row.mcp)]), { dense: true });

  const verdict = `<div class="gal-grid gal-grid--two">
  <div class="gal-callout"><strong>強項</strong><ul style="margin:6px 0 0;padding-left:18px">${VERDICT.strengths.map((s) => `<li>${esc(s)}</li>`).join("")}</ul></div>
  <div class="gal-callout"><strong>弱項</strong><ul style="margin:6px 0 0;padding-left:18px">${VERDICT.weaknesses.map((s) => `<li>${esc(s)}</li>`).join("")}</ul></div>
</div>`;

  return section(
    "method",
    intro,
    [layers, subhead("交付層細節：從模型 token 到瀏覽器"), pipeline, stages, subhead("與 MCP 舊軌道的差異"), mcp, subhead("評價"), verdict].join("\n"),
  );
}
