import { GallerySection } from "../gallery-section";
import { GalleryItem } from "../gallery-item";
import { DESIGN_LAYERS, MCP_DIFF, RENDER_STAGES, STREAM_PIPELINE, VERDICT } from "../design-method-content";

function RulesTable({ layerId }: { layerId: string }) {
  const layer = DESIGN_LAYERS.find((item) => item.id === layerId);
  if (!layer) return null;
  return (
    <div className="gal-table-wrap">
      <table className="gal-table gal-table--dense gal-rules">
        <thead>
          <tr>
            <th>規則</th>
            <th>原始來源</th>
            <th>頁內對照</th>
          </tr>
        </thead>
        <tbody>
          {layer.rules.map((rule) => (
            <tr key={rule.rule}>
              <td>
                {rule.rule}
                {rule.note && <div className="gal-rule-note">{rule.note}</div>}
              </td>
              <td>
                <span className="gal-path">{rule.source}</span>
              </td>
              <td>
                {rule.demo ? (
                  <a className="gal-anchor" href={rule.demo}>
                    {rule.demoLabel ?? "看 demo"} ↓
                  </a>
                ) : (
                  <span className="gal-meta">無對應 demo</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function DesignMethodSection() {
  return (
    <GallerySection
      id="method"
      intro={
        <>
          <p>
            這個專案不是在設計一組介面，而是在設計<strong>一套讓模型在幾秒內生成介面的規則系統</strong>。介面設計拆成三層：決策層決定該出哪種介面，約束層規定介面必須長怎樣、怎麼動，交付層決定它怎麼在串流中出現。
            外面再包一層刻意極簡的聊天外殼。
          </p>
          <p>每條規則都標出原始檔案，並連到這一頁裡對應的 demo；點「↓」會捲到該處。</p>
        </>
      }
    >
      {DESIGN_LAYERS.map((layer) => (
        <GalleryItem key={layer.id} id={`method-${layer.id}`} name={layer.title} path="規則表：每列對照一個原始檔案與一個頁內 demo" state="mounted" demo="plain" wide propsSummary={layer.summary}>
          <RulesTable layerId={layer.id} />
        </GalleryItem>
      ))}

      <h3 className="gal-subhead">交付層細節：從模型 token 到瀏覽器</h3>
      <div className="gal-table-wrap">
        <table className="gal-table gal-table--dense">
          <thead>
            <tr>
              <th>欄位</th>
              <th>中介層解析時機</th>
              <th>發出的事件</th>
              <th>瀏覽器反應</th>
            </tr>
          </thead>
          <tbody>
            {STREAM_PIPELINE.map((row) => (
              <tr key={row.field}>
                <td><code>{row.field}</code></td>
                <td>{row.when}</td>
                <td>{row.event}</td>
                <td>{row.browser}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="gal-grid">
        {RENDER_STAGES.map((stage) => (
          <div key={stage.title} className="gal-callout">
            <strong>{stage.title}</strong>
            <div className="gal-meta" style={{ margin: "4px 0 6px" }}>條件：{stage.condition}</div>
            {stage.detail}
          </div>
        ))}
      </div>

      <h3 className="gal-subhead">與 MCP 舊軌道的差異</h3>
      <div className="gal-table-wrap">
        <table className="gal-table gal-table--dense">
          <thead>
            <tr>
              <th>面向</th>
              <th>web 串流渲染器</th>
              <th>MCP assemble_document</th>
            </tr>
          </thead>
          <tbody>
            {MCP_DIFF.map((row) => (
              <tr key={row.aspect}>
                <td>{row.aspect}</td>
                <td>{row.web}</td>
                <td>{row.mcp}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3 className="gal-subhead">評價</h3>
      <div className="gal-grid gal-grid--two">
        <div className="gal-callout">
          <strong>強項</strong>
          <ul style={{ margin: "6px 0 0", paddingLeft: 18 }}>
            {VERDICT.strengths.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div className="gal-callout">
          <strong>弱項</strong>
          <ul style={{ margin: "6px 0 0", paddingLeft: 18 }}>
            {VERDICT.weaknesses.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </div>
    </GallerySection>
  );
}
