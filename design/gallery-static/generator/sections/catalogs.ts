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
} from "@/components/ui-gallery/catalog-content";
import { A2UI_SURFACES, surfaceMessages } from "@/components/ui-gallery/a2ui-catalog-samples";
import { anchor, code, codeBlock, details, esc, item, lede, pathSpan, section, shot, subhead, table } from "../html";

const SURFACE_SHOTS: Record<string, { file: string; anchor: string }> = {
  "gallery-a2ui-content": { file: "02-item-a2ui-content.png", anchor: "item-a2ui-content" },
  "gallery-a2ui-layout": { file: "03-item-a2ui-layout.png", anchor: "item-a2ui-layout" },
  "gallery-a2ui-inputs": { file: "12-item-a2ui-inputs-after-edits.png", anchor: "item-a2ui-inputs" },
};

const chips = (items: string[]) => `<ul class="gal-chips">${items.map((i) => `<li>${esc(i)}</li>`).join("")}</ul>`;

export function renderCatalogSection(): string {
  const intro = `<p>「從集合挑」和「當場設計」是兩種不同的生成方式。這一區把專案裡每一個<strong>可供模型挑選的集合</strong>攤開：它在哪個檔案、有幾件材料、誰在什麼時候挑、有沒有接上線。其中 A2UI v0.9 基本目錄的 18 個元件在 /gallery 用套件內建的 basicCatalog 真實渲染；靜態版放的是那三個 surface 的截圖與完整的訊息 JSON，正式對話裡只有 Table 一個元件會出現。</p>
<p>A2UI 的排版只有 justify、align、weight 這類提示，沒有像素也沒有顏色；沙箱材料則相反，顏色與控制項樣式固定，版面由模型當場寫。</p>`;

  const index = item({
    id: "item-collections",
    name: "集合索引",
    path: "每列對照一個原始檔案與一個頁內 demo；接線狀態依 providers.tsx、main.py 與 runtime options 判定",
    state: "mounted",
    show: "replica",
    demo: "plain",
    wide: true,
    body: table(
      ["集合", "材料數", "來源", "誰挑、何時挑", "接線", "頁內"],
      COLLECTIONS.map((c) => [
        `<strong>${esc(c.name)}</strong>`,
        esc(c.count),
        pathSpan(c.source),
        esc(c.picker),
        `<span class="gal-wired" data-wired="${c.wired}">${WIRED_LABEL[c.wired]}</span><span class="gal-wired-note">${esc(c.wiredNote)}</span>`,
        c.demo ? anchor(c.demo, c.demoLabel ?? "看 demo") : `<span class="gal-meta">無 demo</span>`,
      ]),
      { dense: true },
    ),
  });

  const surfaces = A2UI_SURFACES.map((sample) => {
    const meta = SURFACE_SHOTS[sample.id];
    const covered = A2UI_BASIC_COMPONENTS.filter((entry) => sample.covers.includes(entry.name));
    return item({
      id: meta.anchor,
      name: sample.title,
      exportName: "basicCatalog",
      path: "@copilotkit/a2ui-renderer · 元件定義 @a2ui/web_core v0.9（Google，Apache 2.0）",
      state: "unmounted",
      show: "shot",
      demo: "plain",
      wide: true,
      propsSummary: `createSurface → updateDataModel → updateComponents；${sample.components.length} 個扁平元件，root 為 Column`,
      note: `<p>${esc(sample.note)}</p><p>截圖來自本機 /gallery 以 basicCatalog 真實渲染的畫面；下方 JSON 是餵給渲染器的完整訊息序列，可直接拿去任何 A2UI v0.9 渲染器重現。</p>`,
      body: `<div class="gal-grid gal-grid--two">
  <div><p class="gal-covers">展示元件：${esc(sample.covers.join("、"))}</p>${shot(meta.file, `${sample.title}（本機 basicCatalog 渲染）`)}</div>
  ${table(
    ["元件", "群組", "props", "模型能動的旋鈕"],
    covered.map((entry) => [code(entry.name), esc(A2UI_GROUP_LABEL[entry.group]), esc(entry.props), entry.knobs ? esc(entry.knobs) : `<span class="gal-meta">無</span>`]),
    { dense: true },
  )}
</div>
${details("v0.9 訊息序列（createSurface / updateDataModel / updateComponents）", codeBlock(JSON.stringify(surfaceMessages(sample), null, 2)))}`,
    });
  }).join("\n");

  const modalShot = shot("11-modal-open.png", "A2UI Modal 開啟時的畫面", "Modal 的關閉鈕由渲染器提供，模型只決定 trigger 與 content");

  const functions = item({
    id: "item-a2ui-functions",
    name: "14 個 client 函式",
    exportName: "BASIC_FUNCTIONS",
    path: "@a2ui/web_core/v0_9/basic_catalog",
    state: "unmounted",
    show: "replica",
    demo: "plain",
    propsSummary: "寫在 DynamicValue 的 {call, args, returnType}，或 checks: [{condition, message}]；輸入 surface 實際用了 email、formatString、pluralize、formatCurrency、openUrl",
    note: `<p>schema 只公開這 14 個；安裝的 runtime 另實作 ${A2UI_RUNTIME_EXTRA_FUNCTIONS.length} 個沒寫進 schema 的函式（${esc(A2UI_RUNTIME_EXTRA_FUNCTIONS.join("、"))}），模型照 schema 不會知道它們存在。</p>`,
    body: table(["函式", "角色", "args"], A2UI_BASIC_FUNCTIONS.map((fn) => [code(fn.name), esc(A2UI_FUNCTION_ROLE_LABEL[fn.role]), esc(fn.args)]), { dense: true }),
  });

  const icons = item({
    id: "item-a2ui-icons",
    name: `Icon.name 的 ${A2UI_ICON_NAMES.length} 個固定名稱`,
    exportName: "Icon",
    path: "@a2ui/web_core/v0_9/schemas/basic_catalog.json",
    state: "unmounted",
    show: "replica",
    demo: "plain",
    propsSummary: "模型不能自創 icon；要動態就綁 {path}，值仍須落在這份清單",
    body: chips(A2UI_ICON_NAMES),
  });

  const versions = item({
    id: "item-a2ui-versions",
    name: "v0.8 標準目錄 vs v0.9 基本目錄：form.py 停在哪一版",
    exportName: "generate_form",
    path: "apps/agent/src/form.py · @a2ui/web_core/v0_8 · @a2ui/web_core/v0_9",
    state: "agent",
    show: "replica",
    demo: "plain",
    wide: true,
    propsSummary: `v0.8 的 ${A2UI_V08_COMPONENTS.length} 個元件與 v0.9 幾乎同名，差別在信封、寫法與旋鈕；form.py 的每一項都落在 0.8 那一欄`,
    note: `<p>v0.8 元件：${esc(A2UI_V08_COMPONENTS.join("、"))}。v0.9 把 MultipleChoice 換成 ChoicePicker，其餘 17 個名稱不變。</p>`,
    body: table(
      ["面向", "v0.8", "v0.9（app 渲染器）", "form.py 實際"],
      A2UI_VERSION_DIFF.map((row) => [esc(row.aspect), esc(row.v08), esc(row.v09), row.formPy ? code(row.formPy) : `<span class="gal-meta">未用到</span>`]),
      { dense: true },
    ),
  });

  const sandbox = item({
    id: "item-sandbox-materials",
    name: "沙箱材料：注入每個 generateSandboxedUi iframe 的固定資產",
    exportName: "THEME_CSS · FORM_STYLES_CSS · SVG_CLASSES_CSS · IMPORTMAP · OPEN_GEN_UI_DESIGN_SKILL",
    path: "packages/design-system/src/index.ts",
    state: "mounted",
    show: "replica",
    demo: "plain",
    wide: true,
    propsSummary: "這是唯一「材料固定、版面當場寫」的集合：模型拿到的是 token 名稱與類別名稱，不是元件",
    body: table(
      ["群組", "材料", "來源常數", "頁內"],
      SANDBOX_MATERIALS.map((g) => [esc(g.group), chips(g.items), code(g.source), anchor(g.demo, g.demoLabel)]),
      { dense: true },
    ),
  });

  const skills = item({
    id: "item-skills",
    name: "代理技能：以「模式」供模型挑選",
    exportName: "SKILL.md ×3",
    path: "apps/agent/skills/",
    state: "agent",
    show: "replica",
    demo: "plain",
    propsSummary: "技能提供的是決策規則、串流契約與圖型模式，不是元件；apps/mcp 以 resource 提供同一批文字",
    body: `<div class="gal-stack">${SKILL_MATERIALS.map(
      (s) =>
        `<div><p style="margin:0 0 4px"><code>${esc(s.name)}</code><span aria-hidden="true"> · </span>${anchor(s.demo, s.demoLabel)}</p><p class="gal-meta" style="margin:0 0 6px">${esc(s.description)}</p>${chips(s.patterns)}</div>`,
    ).join("")}</div>`,
  });

  const controlled = item({
    id: "item-controlled",
    name: "Controlled 元件：開發者寫版面，模型只填資料",
    exportName: "useGenerativeUIExamples",
    path: "apps/app/src/hooks/use-generative-ui-examples.tsx",
    state: "mounted",
    show: "replica",
    demo: "plain",
    propsSummary: "Jev 路由啟用時 barChart、pieChart、generate_form 會從工具清單剔除，模型看不到這些元件",
    body: table(
      ["工具名", "hook", "元件", "Jev", "頁內"],
      CONTROLLED_COMPONENTS.map((c) => [
        code(c.name),
        esc(c.hook),
        `${esc(c.component)}<span class="gal-wired-note">${esc(c.file)}</span>`,
        c.strippedByJev ? `<span class="gal-wired" data-wired="unwired">被剔除</span>` : `<span class="gal-wired" data-wired="wired">保留</span>`,
        c.demo ? anchor(c.demo, "看 demo") : `<span class="gal-meta">無 UI</span>`,
      ]),
      { dense: true },
    ),
  });

  const body = [
    index,
    subhead("A2UI v0.9 基本目錄：18 個元件"),
    lede(`共有欄位：${esc(A2UI_COMMON_PROPS)}。輸入元件的值一律綁到資料模型的 <code>{path}</code>；在本機 /gallery 按鈕的 action 會以 toast 顯示代理收到的事件（截圖裡底部的深色條）。`),
    surfaces,
    `<div class="gal-grid gal-grid--two">${functions}${icons}</div>`,
    versions,
    `<div class="gal-item gal-item--wide">${modalShot}</div>`,
    subhead("其他集合：沙箱材料、技能、Controlled 元件"),
    sandbox,
    `<div class="gal-grid gal-grid--two">${skills}${controlled}</div>`,
  ].join("\n");

  return section("catalogs", intro, body);
}
