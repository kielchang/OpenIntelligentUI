"use client";

import { useEffect } from "react";
import { A2UIProvider, A2UIRenderer, basicCatalog, useA2UIActions } from "@copilotkit/a2ui-renderer";
import { GallerySection } from "../gallery-section";
import { GalleryItem } from "../gallery-item";
import { RenderBoundary } from "../render-boundary";
import { useGalleryToast } from "../gallery-toast";
import {
  A2UI_BASIC_COMPONENTS,
  A2UI_BASIC_FUNCTIONS,
  A2UI_COMMON_PROPS,
  A2UI_FUNCTION_ROLE_LABEL,
  A2UI_GROUP_LABEL,
  A2UI_ICON_NAMES,
  A2UI_RUNTIME_EXTRA_FUNCTIONS,
  A2UI_V08_COMPONENTS,
  A2UI_VERSION_DIFF,
  COLLECTIONS,
  CONTROLLED_COMPONENTS,
  SANDBOX_MATERIALS,
  SKILL_MATERIALS,
  WIRED_LABEL,
} from "../catalog-content";
import { A2UI_SURFACES, surfaceMessages, type A2UISurfaceSample } from "../a2ui-catalog-samples";

interface ActionPayload {
  name?: string;
  sourceComponentId?: string;
  context?: unknown;
}

/** 把渲染器回報的 client→server action 整理成一行可讀文字；@copilotkit/a2ui-renderer 以 { userAction } 包裝 */
function describeAction(message: unknown): string {
  const envelope = message as { userAction?: ActionPayload; action?: ActionPayload } | null;
  const action = envelope?.userAction ?? envelope?.action;
  if (!action) return `A2UI action：${JSON.stringify(message)}`.slice(0, 220);
  const context = action.context && Object.keys(action.context as object).length > 0 ? ` context=${JSON.stringify(action.context)}` : "";
  return `A2UI action：${action.name}（來自 ${action.sourceComponentId}）${context}`.slice(0, 220);
}

function LiveSurface({ sample }: { sample: A2UISurfaceSample }) {
  const { processMessages } = useA2UIActions();
  useEffect(() => {
    processMessages(surfaceMessages(sample));
  }, [processMessages, sample]);
  return <A2UIRenderer surfaceId={sample.id} fallback={<p className="gal-note">surface 尚未建立</p>} />;
}

function A2UISurfaceItem({ sample, anchor }: { sample: A2UISurfaceSample; anchor: string }) {
  const { toast } = useGalleryToast();
  const covered = A2UI_BASIC_COMPONENTS.filter((entry) => sample.covers.includes(entry.name));
  return (
    <GalleryItem
      id={anchor}
      name={sample.title}
      exportName="basicCatalog"
      path="@copilotkit/a2ui-renderer · 元件定義 @a2ui/web_core v0.9（Google，Apache 2.0）"
      state="unmounted"
      demo="plain"
      wide
      propsSummary={`createSurface → updateDataModel → updateComponents；${sample.components.length} 個扁平元件，root 為 Column`}
      note={<p>{sample.note}</p>}
    >
      <div className="gal-grid gal-grid--two">
        <div>
          <p className="gal-covers">展示元件：{sample.covers.join("、")}</p>
          <div className="gal-a2ui-stage">
            <RenderBoundary fallback={<p className="gal-note">basicCatalog 渲染時丟出例外；這個版本的 renderer 不接受這份元件定義。</p>}>
              <A2UIProvider catalog={basicCatalog} onAction={(message) => toast(describeAction(message))}>
                <LiveSurface sample={sample} />
              </A2UIProvider>
            </RenderBoundary>
          </div>
        </div>
        <div className="gal-table-wrap">
          <table className="gal-table gal-table--dense">
            <thead>
              <tr>
                <th>元件</th>
                <th>群組</th>
                <th>props</th>
                <th>模型能動的旋鈕</th>
              </tr>
            </thead>
            <tbody>
              {covered.map((entry) => (
                <tr key={entry.name}>
                  <td>
                    <code>{entry.name}</code>
                  </td>
                  <td>{A2UI_GROUP_LABEL[entry.group]}</td>
                  <td>{entry.props}</td>
                  <td>{entry.knobs ?? <span className="gal-meta">無</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </GalleryItem>
  );
}

function CollectionsIndex() {
  return (
    <div className="gal-table-wrap">
      <table className="gal-table gal-table--dense">
        <thead>
          <tr>
            <th>集合</th>
            <th>材料數</th>
            <th>來源</th>
            <th>誰挑、何時挑</th>
            <th>接線</th>
            <th>頁內</th>
          </tr>
        </thead>
        <tbody>
          {COLLECTIONS.map((entry) => (
            <tr key={entry.id}>
              <td>
                <strong>{entry.name}</strong>
              </td>
              <td>{entry.count}</td>
              <td>
                <span className="gal-path">{entry.source}</span>
              </td>
              <td>{entry.picker}</td>
              <td>
                <span className="gal-wired" data-wired={entry.wired}>
                  {WIRED_LABEL[entry.wired]}
                </span>
                <span className="gal-wired-note">{entry.wiredNote}</span>
              </td>
              <td>
                {entry.demo ? (
                  <a className="gal-anchor" href={entry.demo}>
                    {entry.demoLabel ?? "看 demo"} ↓
                  </a>
                ) : (
                  <span className="gal-meta">無 demo</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function CatalogSection() {
  return (
    <GallerySection
      id="catalogs"
      intro={
        <>
          <p>
            「從集合挑」和「當場設計」是兩種不同的生成方式。這一區把專案裡每一個<strong>可供模型挑選的集合</strong>攤開：它在哪個檔案、有幾件材料、誰在什麼時候挑、有沒有接上線。
            其中 A2UI v0.9 基本目錄的 18 個元件在這裡用套件內建的 basicCatalog 真實渲染，正式對話裡只有 Table 一個元件會出現。
          </p>
          <p>A2UI 的排版只有 justify、align、weight 這類提示，沒有像素也沒有顏色；沙箱材料則相反，顏色與控制項樣式固定，版面由模型當場寫。</p>
        </>
      }
    >
      <GalleryItem id="item-collections" name="集合索引" path="每列對照一個原始檔案與一個頁內 demo；接線狀態依 providers.tsx、main.py 與 runtime options 判定" state="mounted" demo="plain" wide>
        <CollectionsIndex />
      </GalleryItem>

      <h3 className="gal-subhead">A2UI v0.9 基本目錄：18 個元件全部實渲染</h3>
      <p className="gal-lede">
        共有欄位：{A2UI_COMMON_PROPS}。輸入元件的值一律綁到資料模型的 <code>{"{path}"}</code>，按鈕的 action 以 toast 顯示代理會收到的事件。
      </p>
      {A2UI_SURFACES.map((sample, index) => (
        <A2UISurfaceItem key={sample.id} sample={sample} anchor={["item-a2ui-content", "item-a2ui-layout", "item-a2ui-inputs"][index]} />
      ))}

      <div className="gal-grid gal-grid--two">
        <GalleryItem
          id="item-a2ui-functions"
          name="14 個 client 函式"
          exportName="BASIC_FUNCTIONS"
          path="@a2ui/web_core/v0_9/basic_catalog"
          state="unmounted"
          demo="plain"
          propsSummary="寫在 DynamicValue 的 {call, args, returnType}，或 checks: [{condition, message}]；上面輸入區實際用了 email、formatString、pluralize、formatCurrency、openUrl"
          note={
            <p>
              schema 只公開這 14 個；安裝的 runtime 另實作 {A2UI_RUNTIME_EXTRA_FUNCTIONS.length} 個沒寫進 schema 的函式（{A2UI_RUNTIME_EXTRA_FUNCTIONS.join("、")}），模型照 schema 不會知道它們存在。
            </p>
          }
        >
          <div className="gal-table-wrap">
            <table className="gal-table gal-table--dense">
              <thead>
                <tr>
                  <th>函式</th>
                  <th>角色</th>
                  <th>args</th>
                </tr>
              </thead>
              <tbody>
                {A2UI_BASIC_FUNCTIONS.map((fn) => (
                  <tr key={fn.name}>
                    <td>
                      <code>{fn.name}</code>
                    </td>
                    <td>{A2UI_FUNCTION_ROLE_LABEL[fn.role]}</td>
                    <td>{fn.args}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GalleryItem>

        <GalleryItem
          id="item-a2ui-icons"
          name={`Icon.name 的 ${A2UI_ICON_NAMES.length} 個固定名稱`}
          exportName="Icon"
          path="@a2ui/web_core/v0_9/schemas/basic_catalog.json"
          state="unmounted"
          demo="plain"
          propsSummary="模型不能自創 icon；要動態就綁 {path}，值仍須落在這份清單"
        >
          <ul className="gal-chips">
            {A2UI_ICON_NAMES.map((name) => (
              <li key={name}>{name}</li>
            ))}
          </ul>
        </GalleryItem>
      </div>

      <GalleryItem
        id="item-a2ui-versions"
        name="v0.8 標準目錄 vs v0.9 基本目錄：form.py 停在哪一版"
        exportName="generate_form"
        path="apps/agent/src/form.py · @a2ui/web_core/v0_8 · @a2ui/web_core/v0_9"
        state="agent"
        demo="plain"
        wide
        propsSummary={`v0.8 的 ${A2UI_V08_COMPONENTS.length} 個元件與 v0.9 幾乎同名，差別在信封、寫法與旋鈕；form.py 的每一項都落在 0.8 那一欄`}
        note={<p>v0.8 元件：{A2UI_V08_COMPONENTS.join("、")}。v0.9 把 MultipleChoice 換成 ChoicePicker，其餘 17 個名稱不變。</p>}
      >
        <div className="gal-table-wrap">
          <table className="gal-table gal-table--dense">
            <thead>
              <tr>
                <th>面向</th>
                <th>v0.8</th>
                <th>v0.9（app 渲染器）</th>
                <th>form.py 實際</th>
              </tr>
            </thead>
            <tbody>
              {A2UI_VERSION_DIFF.map((row) => (
                <tr key={row.aspect}>
                  <td>{row.aspect}</td>
                  <td>{row.v08}</td>
                  <td>{row.v09}</td>
                  <td>{row.formPy ? <code>{row.formPy}</code> : <span className="gal-meta">未用到</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GalleryItem>

      <h3 className="gal-subhead">其他集合：沙箱材料、技能、Controlled 元件</h3>
      <GalleryItem
        id="item-sandbox-materials"
        name="沙箱材料：注入每個 generateSandboxedUi iframe 的固定資產"
        exportName="THEME_CSS · FORM_STYLES_CSS · SVG_CLASSES_CSS · IMPORTMAP · OPEN_GEN_UI_DESIGN_SKILL"
        path="packages/design-system/src/index.ts"
        state="mounted"
        demo="plain"
        wide
        propsSummary="這是唯一「材料固定、版面當場寫」的集合：模型拿到的是 token 名稱與類別名稱，不是元件"
      >
        <div className="gal-table-wrap">
          <table className="gal-table gal-table--dense">
            <thead>
              <tr>
                <th>群組</th>
                <th>材料</th>
                <th>來源常數</th>
                <th>頁內</th>
              </tr>
            </thead>
            <tbody>
              {SANDBOX_MATERIALS.map((group) => (
                <tr key={group.group}>
                  <td>{group.group}</td>
                  <td>
                    <ul className="gal-chips">
                      {group.items.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </td>
                  <td>
                    <code>{group.source}</code>
                  </td>
                  <td>
                    <a className="gal-anchor" href={group.demo}>
                      {group.demoLabel} ↓
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GalleryItem>

      <div className="gal-grid gal-grid--two">
        <GalleryItem
          id="item-skills"
          name="代理技能：以「模式」供模型挑選"
          exportName="SKILL.md ×3"
          path="apps/agent/skills/"
          state="agent"
          demo="plain"
          propsSummary="技能提供的是決策規則、串流契約與圖型模式，不是元件；apps/mcp 以 resource 提供同一批文字"
        >
          <div className="gal-stack">
            {SKILL_MATERIALS.map((skill) => (
              <div key={skill.name}>
                <p style={{ margin: "0 0 4px" }}>
                  <code>{skill.name}</code>
                  <span aria-hidden="true"> · </span>
                  <a className="gal-anchor" href={skill.demo}>
                    {skill.demoLabel} ↓
                  </a>
                </p>
                <p className="gal-meta" style={{ margin: "0 0 6px" }}>
                  {skill.description}
                </p>
                <ul className="gal-chips">
                  {skill.patterns.map((pattern) => (
                    <li key={pattern}>{pattern}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </GalleryItem>

        <GalleryItem
          id="item-controlled"
          name="Controlled 元件：開發者寫版面，模型只填資料"
          exportName="useGenerativeUIExamples"
          path="apps/app/src/hooks/use-generative-ui-examples.tsx"
          state="mounted"
          demo="plain"
          propsSummary="Jev 路由啟用時 barChart、pieChart、generate_form 會從工具清單剔除，模型看不到這些元件"
        >
          <div className="gal-table-wrap">
            <table className="gal-table gal-table--dense">
              <thead>
                <tr>
                  <th>工具名</th>
                  <th>hook</th>
                  <th>元件</th>
                  <th>Jev</th>
                  <th>頁內</th>
                </tr>
              </thead>
              <tbody>
                {CONTROLLED_COMPONENTS.map((entry) => (
                  <tr key={entry.name}>
                    <td>
                      <code>{entry.name}</code>
                    </td>
                    <td>{entry.hook}</td>
                    <td>
                      {entry.component}
                      <span className="gal-wired-note">{entry.file}</span>
                    </td>
                    <td>{entry.strippedByJev ? <span className="gal-wired" data-wired="unwired">被剔除</span> : <span className="gal-wired" data-wired="wired">保留</span>}</td>
                    <td>
                      {entry.demo ? (
                        <a className="gal-anchor" href={entry.demo}>
                          看 demo ↓
                        </a>
                      ) : (
                        <span className="gal-meta">無 UI</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GalleryItem>
      </div>
    </GallerySection>
  );
}
