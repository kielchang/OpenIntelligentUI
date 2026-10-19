/**
 * README（品牌書）與五個章節。文字繁中；所有數字由專案的純函式在產生期算出，不手抄。
 */
import type { ContrastRow, TokenSet } from "./tokens";
import { RESPONSE_MODES, STREAM_FIELDS, JEV_ROUTES, STRIPPED_TOOLS, FINDINGS } from "@/components/ui-gallery/analysis-content";
import { DESIGN_LAYERS, STREAM_PIPELINE, RENDER_STAGES, MCP_DIFF, VERDICT } from "@/components/ui-gallery/design-method-content";
import { COLLECTIONS, WIRED_LABEL, SKILL_MATERIALS } from "@/components/ui-gallery/catalog-content";
import { CHART_COLORS } from "@/components/generative-ui/charts/config";
import { evaluateCategorical, classifyPair } from "@/components/ui-gallery/color/cvd-palette";
import { OKABE_ITO } from "@/components/ui-gallery/color/palette-generation";
import { HARDCODED_COUNTS, HARDCODED_TOTAL, VALIDATOR_RESULTS, SEMANTIC_HUE_CONVENTION } from "@/components/ui-gallery/color/color-inventory";
import { composite, contrastRatio, formatRatio, formatOklch, hueDistance, parseColor, rgbToOklch } from "@/components/ui-gallery/color/color-math";

const esc = (s: unknown) => String(s).replace(/\|/g, "\\|").replace(/\r?\n/g, " ");
const code = (s: string) => `\`${s}\``;
function table(headers: string[], rows: unknown[][]): string {
  return [
    `| ${headers.map(esc).join(" | ")} |`,
    `| ${headers.map(() => "---").join(" | ")} |`,
    ...rows.map((r) => `| ${r.map(esc).join(" | ")} |`),
  ].join("\n");
}

function resolve(set: TokenSet, name: string, theme: "light" | "dark", depth = 0): string {
  const t = set.color.find((x) => x.name === name);
  if (!t || depth > 16) return "";
  const v = typeof t.value === "string" ? t.value : (t.value[theme] ?? t.value.light);
  const alias = /^\{([^}]+)\}$/.exec(v);
  return alias ? resolve(set, alias[1], theme, depth + 1) : v;
}
/** 深色的半透明表面先與 background 合成，回傳實際畫出的顏色 */
function painted(set: TokenSet, name: string, theme: "light" | "dark") {
  const base = parseColor(resolve(set, "background", theme))!;
  return composite(parseColor(resolve(set, name, theme))!, base);
}

const pairKey = (r: ContrastRow) => `${r.fg}|${r.bg}`;
function contrastTable(report: ContrastRow[]): string {
  const seen = new Map<string, { fg: string; bg: string; threshold: number; light?: ContrastRow; dark?: ContrastRow }>();
  for (const r of report) {
    const k = pairKey(r);
    if (!seen.has(k)) seen.set(k, { fg: r.fg, bg: r.bg, threshold: r.threshold });
    seen.get(k)![r.theme] = r;
  }
  const cell = (r?: ContrastRow) => (r ? `${r.text}${r.pass ? "" : "（未達）"}` : "—");
  return table(
    ["前景", "底色", "門檻", "淺色", "深色"],
    [...seen.values()].map((p) => [code(p.fg), code(p.bg), `${p.threshold}:1`, cell(p.light), cell(p.dark)]),
  );
}

const COMPONENT_GROUPS: Array<[string, Array<[string, string]>]> = [
  ["Actions", [["Button", "primary（ink）、secondary、ghost、danger、brand；一頁一顆 brand。"], ["SegmentedControl", "二到五個互斥選項的切換（主題、檢視模式）。"]]],
  ["Inputs", [["TextField", "單行文字；錯誤訊息說怎麼修。"], ["NumberField", "數值；valueAsNumber + Number.isFinite + 範圍。"], ["Select", "有限選項（≤ 12）。"], ["CheckboxRadio", "多選與單選群組，fieldset/legend。"], ["RangeSlider", "可調參數看結果時才用。"], ["Textarea", "多行文字與字數上限。"], ["SearchBox", "搜尋與結果數 role=status。"]]],
  ["Data", [["Toolbar", "篩選列 + 狀態槽 + 動作區。"], ["DataTable", "精確值的主要容器：排序、選取、派遣／凍結列、數值右對齊。"], ["Pager", "分頁與每頁筆數。"], ["StatusBadge", "有限狀態枚舉（DOOPING 草稿、單位、職位、人員）。"], ["Tag", "標籤、篩選 chip、可移除。"], ["KeyValueList", "一筆資料的屬性清單。"]]],
  ["Feedback", [["Alert", "四語意 × 低／高強度；合規建議永遠低強度 info。"], ["ErrorBanner", "可重試的錯誤。"], ["Toast", "4 秒自清的操作回饋。"], ["EmptyState", "沒有資料／沒有結果／沒有權限。"], ["LoadingPlaceholder", "固定高度的載入框與輪播字句。"], ["Skeleton", "已知形狀的載入。"]]],
  ["Layout", [["AppHeader", "字標、導覽、環境徽章、主題切換。"], ["Card", "預設、緊湊、可點擊、玻璃。"], ["Drawer", "看細節、編輯一筆。"], ["Dialog", "確認與短表單。"], ["Tabs", "同一物件的幾個面向。"]]],
  ["Charts", [["ChartPalette", "chart-1…7 固定順序；highlight+mute。"], ["SequentialDiverging", "連續與發散色階。"]]],
  ["Diagram", [["DiagramClasses", "SVG 圖解的 box／node／arr／leader 與九色階。"]]],
  ["OrgChart", [["OrgChartNode", "組織圖節點：主管、派遣、折疊、空缺、凍結、草稿、虛線匯報。"]]],
];

export function renderReadme(set: TokenSet, report: ContrastRow[]): string {
  const lilacDarkOnWhite = formatRatio(contrastRatio(parseColor(resolve(set, "color-lilac-dark", "light"))!, parseColor("#ffffff")!));
  const mintDarkOnWhite = formatRatio(contrastRatio(parseColor(resolve(set, "color-mint-dark", "light"))!, parseColor("#ffffff")!));
  const failing = report.filter((r) => !r.pass);
  const lilacOklch = formatOklch(rgbToOklch(parseColor(resolve(set, "color-lilac", "light"))!));
  const mintOklch = formatOklch(rgbToOklch(parseColor(resolve(set, "color-mint", "light"))!));
  return `企業資料密集系統的視覺語言：答案要能操作，畫面克制，每個狀態都看得見。品牌色 lilac 與 mint 只做識別，工作畫面以中性表面、角色化文字與語意色為主；深色主題是重新生成的一套值，不是反轉。

## 內容原則

- 每張表、每張圖、每個計算結果都標示資料來源的四種身分：使用者輸入、取得的資料、計算值、示意資料。示意資料在 caption 寫「示意資料」（沙箱內用原文 "Illustrative sample values (not live data)"）。
- 錯誤訊息說明怎麼修，不只說錯了：「生效日不能早於單位成立日 2024-01-01」而不是「輸入無效」。空值寫「—」，沒有資料用 EmptyState 的「沒有資料」（原文 "No data available"）。
- 不得暗示示範表單會驗證或儲存；按鈕文案寫實際會發生的事（「驗證草稿」「排程生效」），不寫「送出」。
- 合規發現只建議、不擋操作、不判定合規：每條都帶「需法務確認」，用 Alert 的低強度 info，不用 danger。
- 文案繁體中文、祈使句、句號收尾，沒有驚嘆號、沒有 emoji；識別字、token、操作代碼（OP-ORG-01、ORG-EX-01）與系統代號（SMERP、SMFLOW、DOOPING）保持英文。任何範例資料都是合成的：姓名「樣本·」開頭、員工編號 ZZ- 開頭、信箱 example.invalid。
- 載入期間的字句可以有一點個性但要短：原文輪播 "Sketching pixels" "Wiring up nodes" "Painting gradients"；中文版「正在讀取組織圖」「正在計算匯報線」「正在套用草稿」，每 1.8 秒換一句，reduced-motion 時停在第一句。

## 色彩

三層：品牌層（${code("color-lilac")}、${code("color-lilac-dark")}、${code("color-mint")}、${code("color-mint-dark")}）只在識別與一顆品牌按鈕出現；角色層（${code("background")}、${code("surface-primary")}…${code("surface-quaternary")}、${code("text-primary")}、${code("text-secondary")}、${code("border-default")}…）是元件唯一能用的名稱；沙箱那套以 ${code("sandbox-")} 前綴並存，語意色（info／success／warning／danger）統一從沙箱那套取。

- 頁面底色用 ${code("background")}；卡片、表格、面板用 ${code("surface-primary")}；hover 列與側欄用 ${code("surface-secondary")}；表頭、chip、程式碼底用 ${code("surface-tertiary")}；徽章底與分段按鈕軌道用 ${code("surface-quaternary")}。深色主題的表面是半透明白疊在 ${code("background")} 上，層次靠亮度，不靠陰影（${code("shadow-card")} 系列在深色為 none）。
- 內文與標題用 ${code("text-primary")}；說明、路徑、meta 用 ${code("text-secondary")}；${code("text-tertiary")} 兩主題都不到 4.5:1，只給停用態與純裝飾。body 的預設字色 ${code("foreground")} 只用在 body，內文一律改 ${code("text-primary")}。
- 邊框用 ${code("border-default")}，hover 與 focus 前換 ${code("border-hover")}，極淡分隔線用 ${code("border-subtle")}。鍵盤焦點一律 ${code("focus-ring")} 2px 實線、offset 3px，對 ${code("surface-primary")} 淺色 ${formatRatio(contrastRatio(painted(set, "focus-ring", "light"), painted(set, "surface-primary", "light")))}、深色 ${formatRatio(contrastRatio(painted(set, "focus-ring", "dark"), painted(set, "surface-primary", "dark")))}。
- 品牌色：lilac 是 ${lilacOklch}、mint 是 ${mintOklch}，兩者都是高明度低彩度的淡色，放在它們上面的文字與圖示一律 ${code("on-brand")}。${code("color-lilac-dark")} 對白底只有 ${lilacDarkOnWhite}，不得當文字或有意義的圖形色；${code("color-mint-dark")} 對白底 ${mintDarkOnWhite}，可當圖示、大字、選中底線與主管標記，不當內文。主要按鈕是 ink：${code("text-primary")} 底配 ${code("background")} 字；品牌按鈕用 ${code("color-lilac")} 到 ${code("color-mint")} 的漸層配 ${code("on-brand")} 字，一頁最多一顆。
- 語意色雙強度。低強度：${code("sandbox-background-<sem>")} 底、${code("sandbox-text-<sem>")} 字與圖示、1px ${code("sandbox-border-<sem>")} 框，用在 Alert、StatusBadge、環境徽章、表格內的狀態。高強度：${code("sandbox-text-<sem>")} 當底、${code("sandbox-background-primary")} 當字，只給 modal、danger 按鈕與必須打斷的訊息。狀態永遠是顏色加圖示加文字，三者缺一不可。
- 圖表色與 UI 色分家：分類用 ${code("chart-1")}…${code("chart-7")}，順序固定、不循環；第 8 個類別起或要強調時改 highlight+mute（一個類別用它的 chart 色，其餘 ${code("surface-quaternary")} 加 ${code("border-default")}）。連續數值用 ${code("scale-mint-1")}…${code("scale-mint-7")}；偏差、正負、前後對比用 ${code("scale-diverge-1")}…${code("scale-diverge-7")}，第 4 階永遠是零或基準。軸線與刻度文字用 ${code("chart-axis")}，tooltip 用 ${code("chart-tooltip-bg")} 與 ${code("chart-tooltip-border")}。精確值永遠配表格，圖只做輔助。
- 配額約 60／30／10：中性表面與文字佔六成，結構（邊框、表頭、分隔）三成，強調（品牌、語意、圖表）一成；toast、banner、選中態、品牌按鈕共用那一成。
- SVG 圖解用九色階 ${code("ramp-<name>-fill")}／${code("-stroke")}／${code("-text")}／${code("-text-small")}（purple、teal、coral、pink、gray、blue、green、amber、red），淺深各一套值，由 DiagramClasses 綁定；圖解不用 chart 色。

對比（WCAG 2.x，文字 4.5:1、大字與有意義的非文字 3:1；深色主題的半透明表面先與 ${code("background")} 合成再算）：

${contrastTable(report)}

未達門檻的 ${failing.length} 對保持原始碼的值，usage 註明；元件與預覽不使用這些配對。

## 字體與字級

- 一個 sans 家族 ${code("sans")}（Plus Jakarta Sans 堆疊）與一個 mono 家族 ${code("mono")}（Spline Sans Mono 堆疊），兩者由 Google Fonts 載入，每個預覽自己放 link。
- 字級八個：${code("display")} 28px/1.2/700 只給歡迎畫面與區塊大標；${code("heading")} 16px/1.25/600/-0.4px 給標頭與卡片標題；${code("subheading")} 15px/600 給區塊小標；${code("body")} 14px/1.6 是內文、儲存格、表單文字；${code("body-small")} 13px/1.5 給密集表格、meta、註記；${code("label")} 13px/600 給表單標籤、表頭、徽章；${code("caption")} 12px 給說明、資料來源、路徑；${code("code")} 13px mono 給程式碼、token、識別字、員工編號與 uuid。
- 字重只用 400、500、600、700；數值欄用 mono 並右對齊。

## 間距、圓角、陰影

- 間距七階 ${code("space-1")}（4px）到 ${code("space-8")}（32px）：圖示與文字 space-1；chip 與徽章內距 space-2；欄位之間 space-3；卡片內距、工具列水平內距、網格 gap space-4；區塊內大段距 space-5；區塊之間與對話框內距 space-6；頁面區段之間 space-8。
- 圓角：${code("radius-sm")} 6px 給 chip、徽章、輸入框；${code("radius-md")} 8px 給按鈕、表格外框、導覽項；${code("radius-lg")} 12px 給卡片與對話框內區塊；${code("radius-xl")} 16px 給大卡片與抽屜；${code("radius-2xl")} 24px 只給歡迎畫面大容器。沙箱內容用 ${code("border-radius-md")}／${code("-lg")}／${code("-xl")}。
- 陰影：${code("shadow-card")} 卡片靜止、${code("shadow-card-hover")} 卡片 hover、${code("shadow-compact")} 緊湊卡片、${code("shadow-sm")} 分段按鈕選中態、${code("shadow-md")} 下拉選單、${code("shadow-lg")} toast、popover 與對話框；深色主題 card 與 compact 系列為 none。${code("shadow-glass")}、${code("shadow-glow-lilac")}、${code("shadow-glow-mint")} 只給玻璃卡與品牌區。

## 圖示

- 沒有 logo：字標以純文字排 ${code("heading")} 字級（「DOOPING」加模組名），不畫標誌。
- 圖示一律 inline SVG，16px，stroke 1.75，${code("currentColor")}，跟著文字色走；放在語意色上時用 ${code("sandbox-text-<sem>")}。
- 沒有 emoji；狀態的圖示來自固定對照（草稿鉛筆、已驗證勾、排程時鐘、已套用勾、取消叉、凍結鎖、合併箭頭、派遣虛線）。

## 版面與狀態

- 密度以表格為準：儲存格 8px 12px、13px 字；工具列按鈕 6px 12px、13px/500；輸入框 8px 12px、14px；卡片內距 16px、1px ${code("border-default")}、${code("radius-lg")}。
- 每個資料畫面有四個狀態：載入（Skeleton 或 LoadingPlaceholder）、空（EmptyState，分沒有資料、沒有結果、沒有權限）、錯誤（ErrorBanner 或 Alert，能重試就給重試）、有資料。沒有一個狀態留白。
- 所有互動元件可鍵盤操作：tab 到得了、Enter／Space 觸發、方向鍵在 tablist 與 radio 群內移動、Esc 關閉 Dialog 與 Drawer；焦點環永遠可見。
- 480px 寬不得橫向捲動：工具列換行、表格水平捲動（容器上）、抽屜改全寬。
- 動畫只在 ${code("prefers-reduced-motion: no-preference")} 內，且只做 160ms 以內的進場與 skeleton 閃爍。

## 元件

只用角色層 token，class 以 ${code("lm-")} 開頭，狀態用 ${code("is-*")} 或 ARIA 屬性；行為在 ${code("window.LilacMint")}（toast、tabs、dialog、drawer、rotate），沒有框架。

${COMPONENT_GROUPS.map(([group, comps]) => `**${group}**\n${comps.map(([name, note]) => `- ${code(name)}：${note}`).join("\n")}`).join("\n\n")}

## 呈現方式速查

先問要回答什麼問題，再選畫面；說不出問題就不做互動 UI。能一句話或表格說清楚就不畫圖；要精確值就表格，圖只做輔助；時間用折線、關係用流程圖、空間用地圖、分佈與比例用對應圖型；可調參數看結果才用計算器與滑桿；要送出或確認才用表單與對話框；判斷信心不足就回文字加一個澄清問題。四條交付軌道（預建元件、宣告式目錄、當場生成、伺服器 UI）每個需求只走一條，由誰定版面、改版頻率與安全邊界決定。細則見章節「呈現方式規則」「守則」「情境覆蓋驗收」。

DOOPING 的對應：組織圖用預建元件（React Flow 畫布）配 OrgChartNode 的狀態語彙；人員目錄與職位清單用 Toolbar + DataTable + Pager；草稿用 KeyValueList + StatusBadge + Dialog（驗證、排程兩步各自確認）；合規發現用低強度 info Alert 與 DataTable；版本差異用 Tag（新增／移動／更名）與 ${code("scale-diverge")} 色階，不用紅綠對比。

## 接到 DOOPING

DOOPING 的 ${code("apps/web/src/app.css")} 已用這些變數名加 fallback，尚未定義；載入 tokens.css 後只要在 ${code(":root")} 補下面的別名（${code("--background")} 與 ${code("--foreground")} 與本系統同名，直接生效）：

${table(["DOOPING 變數", "目前 fallback", "對映 token", "說明"], [
    ["--background", "#fff", "background", "同名，tokens.css 已定義"],
    ["--foreground", "#1c1f26", "foreground（內文改 text-primary）", "同名，tokens.css 已定義"],
    ["--border", "#cfd4dc／#e3e6eb／#9aa3b2", "border-default；淡的用 border-subtle、hover 用 border-hover", "三個 fallback 對三個 token"],
    ["--muted", "#eef1f5", "surface-tertiary", "表頭、chip 底"],
    ["--muted-foreground", "#5b6472", "text-secondary", ""],
    ["--accent", "#fff7e6", "sandbox-background-warning", "差異高亮底"],
    ["--primary", "#2563eb", "text-primary", "主要按鈕改 ink"],
    ["--ring", "#2563eb", "focus-ring", ""],
    ["--destructive", "#b91c1c", "sandbox-text-danger", ""],
    ["--cmp-action", "#b91c1c", "sandbox-text-danger", "合規：需處置"],
    ["--cmp-warn", "#d97706", "sandbox-text-warning", "合規：注意"],
    ["--cmp-info", "#2563eb", "sandbox-text-info", "合規：資訊"],
    ["--cmp-legal", "#7c3aed", "ramp-purple-text", "合規：需法務確認；lilac-dark 對白底不足 3:1 所以用九色階的 purple 文字色"],
    ["--diff-added", "#16a34a", "sandbox-text-success", "差異：新增"],
    ["--diff-moved", "#d97706", "sandbox-text-warning", "差異：移動"],
    ["--diff-renamed", "#7c3aed", "ramp-purple-text", "差異：更名"],
  ])}

\`\`\`css
:root {
  --border: var(--border-default);
  --muted: var(--surface-tertiary);
  --muted-foreground: var(--text-secondary);
  --accent: var(--sandbox-background-warning);
  --primary: var(--text-primary);
  --ring: var(--focus-ring);
  --destructive: var(--sandbox-text-danger);
  --cmp-action: var(--sandbox-text-danger);
  --cmp-warn: var(--sandbox-text-warning);
  --cmp-info: var(--sandbox-text-info);
  --cmp-legal: var(--ramp-purple-text);
  --diff-added: var(--sandbox-text-success);
  --diff-moved: var(--sandbox-text-warning);
  --diff-renamed: var(--ramp-purple-text);
}
\`\`\`

沙箱（生成式 UI）那側維持原名：${code("--color-background-primary")} 等於本系統的 ${code("sandbox-background-primary")}，依此類推；${code("--p")}、${code("--s")}、${code("--t")}、${code("--bg2")}、${code("--b")} 對應 ${code("sandbox-svg-p")} 等五個別名。

## 新增項目（原始碼沒有）

- token：${code("on-brand")}（淡品牌色上的字）、${code("scale-mint-1…7")} 與 ${code("scale-diverge-1…7")}（由 ${code("color-mint-dark")}、${code("color-lilac-dark")} 以 OKLCH 生成）、字體家族 ${code("mono")}（原始碼只在樣式表寫死堆疊，沒有變數）。
- 元件：Toolbar、Pager、StatusBadge、KeyValueList、EmptyState、Skeleton、AppHeader、Drawer、Tabs、OrgChartNode 是為 DOOPING 的資料密集畫面新增；其餘元件從 OpenIntelligentUI 的樣式表與沙箱表單樣式重現。
- 沙箱 token 全部加 ${code("sandbox-")} 前綴（原名 ${code("--color-*")} 與 app 那套重名、值不同）。

## Not synced

- 字型：Plus Jakarta Sans 與 Spline Sans Mono 由 Google Fonts 託管，沒有字型檔；${code("type.fonts")} 為空。
- 元件：React 元件沒有建置（唯讀路線）；每個元件是依原始碼手寫的靜態預覽與 CSS，README 標明來源路徑。
- 略過：${set.skipped.join("；") || "無"}。
`;
}

/* ───────────────────────── 章節 ───────────────────────── */

function section01(): string {
  const layers = DESIGN_LAYERS.map((layer) => `## ${layer.title}

${layer.summary}

${table(["規則", "原始碼", "備註"], layer.rules.map((r) => [r.rule, r.source, r.note ?? ""]))}`).join("\n\n");
  return `# 設計方法：三層設計觀

介面不是被「設計」出來的，是被三層機制產生的：決策層決定要不要畫、畫哪一型；約束層把設計系統壓成模型能遵守的數字與契約；交付層把串流的六個欄位變成瀏覽器裡的畫面。每條規則標出原始碼位置，拿來對照自己的系統時逐條問「我們這層是誰在做」。

${layers}

## 交付層的三段渲染

${RENDER_STAGES.map((s) => `- **${s.title}**（${s.condition}）：${s.detail}`).join("\n")}

## 模型拿到的材料集合

${table(["集合", "數量", "誰在什麼時候挑", "接線狀態", "說明"], COLLECTIONS.map((c) => [c.name, c.count, c.picker, WIRED_LABEL[c.wired], c.wiredNote]))}

技能提供的模式（模型從這些模式裡挑，而不是從零設計）：

${SKILL_MATERIALS.map((s) => `- **${s.name}**：${s.description} 模式：${s.patterns.join("、")}。`).join("\n")}

## 評價

強項：
${VERDICT.strengths.map((s) => `- ${s}`).join("\n")}

弱項：
${VERDICT.weaknesses.map((s) => `- ${s}`).join("\n")}
`;
}

function section02(): string {
  const rails = [
    ["預建元件", "開發者", "建置期", "只給資料（props）", "React 渲染，沒有任意程式", "無", "固定流程、精確值、企業主檔畫面（DOOPING 的組織圖、目錄、草稿）"],
    ["宣告式目錄（A2UI v0.9）", "目錄作者定元件；模型組樹", "元件建置期、組合生成期", "挑元件、巢狀、justify／align／weight、資料綁定、action 事件", "無像素無顏色；JSON 可用 schema 驗證", "action → 事件 → 新回合", "結構化但內容多變的表單、卡片、清單"],
    ["當場生成（Open Generative UI）", "模型", "生成期", "css、html、jsFunctions、jsExpressions 全部", "iframe 沙箱、CSP、importmap、橋接白名單、zod schema", "sendPrompt({text}) 開新回合", "開放式探索、計算器、圖解、模擬"],
    ["伺服器 UI（MCP Apps）", "工具提供者", "工具端建置期", "無；模型只呼叫工具", "iframe、JSON-RPC over postMessage、ui:// 資源", "工具呼叫", "第三方工具自帶的畫面"],
  ];
  return `# 呈現方式規則

## 先問題後畫面

說不出「這個畫面回答什麼問題」就不做互動 UI。任務只有三種：理解（清楚的模型加可改的有意義變數）、比較（攤開準則、取捨、假設）、做工具（可用的輸入、經驗證的計算、輸出、重設）。文字優先；靜態圖夠用就不加互動；不為了讓回答看起來厲害而加畫面。

${table(["任務", "回應", "渲染器", "出處"], RESPONSE_MODES.map((m) => [m.task, m.response, m.renderer, m.where]))}

## 13 種呈現型別

分類是封閉的，每種型別附適用條件與渲染路徑；判定後用「只保留允許的工具」強制執行，被剔除的工具：${STRIPPED_TOOLS.map(code).join("、")}。信心值要記也要用：低於門檻回文字加一個澄清問題。

${table(["型別", "渲染路徑", "條件與備註"], JEV_ROUTES.map((r) => [code(r.type), r.renderer, r.note]))}

## 選型決策樹

1. 能一句話或一張表說清楚就不畫：文字或表格。
2. 需要精確值：表格為主（${code("table")}），圖只做輔助且永遠配表。
3. 時間變化用折線（${code("line_chart")}）；類別比較用長條（${code("bar_chart")}）；兩個變數的關係用散佈（${code("scatter_plot")}）；分佈用 ${code("distribution")}，模擬值與理論值分開標示；整體與部分用 ${code("part_to_whole")}，五類以內。
4. 流程與步驟用 ${code("flowchart")}；結構與關係用 ${code("static_diagram")}；需要操作才懂的機制用 ${code("interactive_diagram")}。
5. 空間用 ${code("map")}；有順序的地點用 ${code("animated_route")}。外部圖磚與函式庫可能載不到，先設計可見的失敗狀態。
6. 可調參數看結果用 ${code("calculator")}：輸入驗證、重設、輸出用 role=status。
7. 要送出或確認：表單與人機確認卡，走預建元件或宣告式目錄，不當場生成。
8. 以上都不確定：回文字，問一個澄清問題。

## 四條交付軌道

${table(["軌道", "誰定版面", "何時定", "模型能動什麼", "安全邊界", "往返", "適用"], rails)}

同一系統可以同時有三條，但每個需求只走一條，由路由決定；混用的代價是兩套視覺語言並存（本系統以 ${code("sandbox-")} 前綴把沙箱那套收進同一份 token）。

## 呈現建議卡

每個新畫面先填這張卡，再開工：

- 需求一句話：
- 資料形狀：筆數、欄位數、是否時間序列、是否地理、是否需要精確值
- 互動需求：唯讀、篩選排序、調參數看結果、填表送出、人機確認
- 建議型別（主、備）與理由：
- 交付軌道與取捨：
- 必要元素：空狀態、載入、錯誤、文字替代、資料來源標示
- 驗收條目：
- 交接：配色、圖面

## 反模式

圖表取代精確表格；每個需求一個新元件；讓模型自由決定但沒有契約；沒有萬用出口的分類；失敗留白；把示意資料當真；互動只為了互動；行動裝置後補；信心值記了不用。
`;
}

function section03(): string {
  return `# 守則：不分軌道都要有的約束

## 串流契約

六個欄位有固定順序，順序本身就是設計：樣式先到才顯示、標記逐段、行為最後。

${table(["順序", "欄位", "產生端規則", "渲染端行為"], STREAM_FIELDS.map((f) => [f.order, code(f.field), f.agentRule, f.rendererBehaviour]))}

從模型 token 到瀏覽器反應的實際路徑：

${table(["欄位", "何時解析", "事件", "瀏覽器"], STREAM_PIPELINE.map((p) => [code(p.field), p.when, p.event, p.browser]))}

- ${code("css")} 裡只用 token 變數與 400／500 字重；${code("html")} 不含 ${code("<style>")} 與 ${code("<script>")}；${code("jsFunctions")} 是具名函式宣告；${code("jsExpressions")} 是小型同步敘述。這兩個 JavaScript 通道以 classic script 執行，頂層不可 ${code("await")}，動態 ${code("import")} 要包在 async 函式裡。
- 每個產出都要有 ${code('role="status"')} 的輸出元素；失敗（函式庫載不到、WebGL 不可用、圖磚被擋）寫進那個元素，不留白。

## 沙箱

- iframe 沙箱加 CSP：script 與 connect 只允許四個 CDN 來源（cdnjs、esm.sh、jsDelivr、unpkg）；圖片只允許 self、data、blob 與 USGS、Wikimedia；其餘全擋。
- importmap 由設計系統套件提供：three、gsap、d3、chart.js 經 esm.sh；要用別的套件先改 importmap，不在產出裡硬寫 URL。
- 高度由沙箱回報（ResizeObserver，前 3 秒每 200ms），父頁夾在 50–4000px。

## 橋接白名單

只有兩個函式：${code("Websandbox.connection.remote.sendPrompt({ text })")}（zod 驗證、有回應與錯誤）與 ${code("openLink({ url })")}（只開 https）。不放開 postMessage 到 ${code("*")}；追問永遠是新回合，沒有跨回合的 patch API，也不假設 iframe 狀態能跨重渲染保留。

同一套設計系統的兩條軌道刻意不互通：

${table(["面向", "Web 渲染器", "MCP 組裝"], MCP_DIFF.map((d) => [d.aspect, d.web, d.mcp]))}

## 輸入驗證

- 數值用 ${code("valueAsNumber")} 加 ${code("Number.isFinite")} 再檢查範圍；NaN、負數、超過上限都要顯示可操作的錯誤（NumberField）。
- 追問按鈕先 disable、await sendPrompt、catch 顯示錯誤、finally 復原。
- 計算要精確：金額分攤到分且總和相等；模擬值與理論值分開標示。

## 可見失敗

- 函式庫載入失敗、地圖留白、WebGL 不可用、非同步逾時都要有文字說明與替代（文字表格、靜態圖）。
- 企業畫面同理：API 失敗用 ErrorBanner 給重試；權限不足用 EmptyState 的「沒有權限」，不顯示空表。

## 無障礙與窄版

- 鍵盤可達、焦點環可見（${code("focus-ring")}）、tablist 與 radio 群用方向鍵、Dialog 與 Drawer 用 Esc。
- 顏色不是唯一編碼：狀態＝顏色＋圖示＋文字；圖表配表格或摘要。
- 480px 不橫向捲動；reduced-motion 停止輪播與閃爍。
- 資料來源四分（使用者輸入、取得、計算、示意）在畫面上標示。
`;
}

function section04(): string {
  const gaps = FINDINGS.filter((f) => ["placeholder-messages", "stripped-tools", "dark-mode-mismatch", "seed-rules", "a2ui-format", "token-overlap"].includes(f.id));
  return `# 情境覆蓋驗收

規則與真實產出之間要有自動驗收；讀碼不算覆蓋。

## 情境矩陣

列是型別，欄是任務與失敗情境；每格至少一個 golden prompt 與一個快照。

${table(["型別 ＼ 情境", "理解", "比較", "做工具", "資料缺", "外部服務掛", "窄版"], [
    ["table", "✓", "✓", "—", "空表 EmptyState", "—", "容器水平捲動"],
    ["bar_chart／line_chart", "✓", "✓", "—", "No data available", "chart.js 載不到 → 文字表格", "圖寬 100%"],
    ["calculator", "—", "✓", "✓", "NaN 顯示錯誤", "—", "輸入直排"],
    ["flowchart／static_diagram", "✓", "—", "—", "—", "—", "viewBox 縮放"],
    ["map／animated_route", "✓", "—", "—", "無座標 → 清單", "圖磚被擋 → 文字行程", "高度固定"],
    ["表單／確認卡", "—", "—", "✓", "必填錯誤", "送出失敗 → 重試", "單欄"],
  ])}

## 產出自動檢查（每個樣本）

- 通過 schema（六欄位型別、initialHeight 50–4000）。
- ${code("html")} 不含 ${code("<style>")}／${code("<script>")}；${code("css")} 只用 token 變數、沒有 raw hex。
- ${code("jsFunctions")} 與每條 ${code("jsExpressions")} 可被 ${code("new Function")} 解析（頂層 await／import 會失敗）。
- 存在 ${code('role="status"')} 元素；錯誤路徑可見；沒有 NaN；480px 不溢出。
- 追問按鈕走橋接白名單；外部 URL 只在允許清單內。

## Golden prompt 與快照

每格一個固定 prompt，產出存成快照；視覺回歸容忍 1%。快照不是用來鎖死像素，是用來讓規則改變時看得見影響。

## 真實代理端到端

契約測試（文件彼此不矛盾）不等於情境測試。至少每週跑一次真實代理：固定 prompt 集、記錄型別判定與信心值、比對快照；信心值低於門檻的回答要落到文字加澄清問題，否則算失敗。

## 信心門檻與降級

- 判定信心 < 0.6：回文字加一個澄清問題。
- 0.6–0.8：允許型別但強制「圖配表」。
- > 0.8：照型別。
- 連續兩次同型別失敗（schema 或檢查）：降級到表格或文字。

## OpenIntelligentUI 的缺口（案例）

${gaps.map((f) => `- **${f.title}**：${f.detail}（${f.paths.join("、")}）`).join("\n")}

這些缺口的共同點：規則寫在提示與技能裡，但沒有任何測試拿真實產出對照規則。本系統把規則寫成 token 與元件狀態，驗收清單寫成可執行的檢查。
`;
}

function section05(set: TokenSet, report: ContrastRow[]): string {
  const chart = evaluateCategorical([...CHART_COLORS]);
  const okabe = evaluateCategorical([...OKABE_ITO]);
  const pair = (p: { i: number; j: number; value: number }, prefix: string, scale = 100, digits = 1) => (Number.isFinite(p.value) ? `${prefix}${p.i + 1} ↔ ${prefix}${p.j + 1}：${(p.value * scale).toFixed(digits)}` : "—");
  const lightSurface = painted(set, "surface-primary", "light");
  const darkSurface = painted(set, "surface-primary", "dark");
  const chartRows = CHART_COLORS.map((hex, i) => {
    const rgb = parseColor(hex)!;
    const l = contrastRatio(rgb, lightSurface);
    const d = contrastRatio(rgb, darkSurface);
    return [code(`chart-${i + 1}`), hex.toLowerCase(), formatOklch(rgbToOklch(rgb)), `${formatRatio(l)}${l >= 3 ? "" : "（未達）"}`, `${formatRatio(d)}${d >= 3 ? "" : "（未達）"}`];
  });
  const adjacent = CHART_COLORS.slice(0, -1).map((hex, i) => {
    const r = classifyPair(hex, CHART_COLORS[i + 1]);
    return [`${code(`chart-${i + 1}`)} ↔ ${code(`chart-${i + 2}`)}`, r.risk, r.reason];
  });
  const semantic = Object.entries(SEMANTIC_HUE_CONVENTION).map(([sem, conv]) => {
    const light = rgbToOklch(parseColor(resolve(set, `sandbox-text-${sem}`, "light"))!);
    const dark = rgbToOklch(parseColor(resolve(set, `sandbox-text-${sem}`, "dark"))!);
    const dl = hueDistance(light.h, conv.hue);
    const dd = hueDistance(dark.h, conv.hue);
    return [sem, `${conv.label} ${conv.hue}° ±15°`, `${light.h.toFixed(0)}°${dl <= 15 ? "" : "（偏離）"}`, `${dark.h.toFixed(0)}°${dd <= 15 ? "" : "（偏離）"}`];
  });
  const lilacDarkOnWhite = formatRatio(contrastRatio(parseColor(resolve(set, "color-lilac-dark", "light"))!, parseColor("#ffffff")!));
  const recommendations: Array<[string, string]> = [
    ["拆 brand 與 primary", `${code("color-lilac-dark")} 對白底只有 ${lilacDarkOnWhite}，當 CopilotKit primary 的文字與圖示色不達 3:1。保留它當品牌色（字標、品牌按鈕漸層），互動主色改 ink（${code("text-primary")}）；若要有色的互動主色，另生 OKLCH L≈0.45、C≈0.10、H 281° 的 token。代價：多一個 token、按鈕沒那麼「淡紫」。`],
    ["統一一套 semantic 命名", `刪掉 globals.css 與 design-system 重名的 ${code("--color-text-*")}；app 側用 ${code("surface-*")}／${code("text-*")}／${code("border-*")} 一套角色名，沙箱側維持 ${code("--color-*")}（本系統以 ${code("sandbox-")} 前綴並存）。代價：一次性搬 CSS。`],
    ["中性色帶主色調", "app 的 Tailwind 灰偏冷藍（H≈260°）、design-system 灰偏暖（H≈90°），兩套看起來像拼裝。選一個 hue（建議 brand 的 281°），chroma 壓到 0.01–0.02 重生灰階。代價：灰階全換、視覺回歸要重拍。"],
    ["圖表色 token 化並固定順序", `${code("chart-1…7")} 已成 token；index % 7 循環改成「第 8 類折成 Other」或 highlight+mute；藍／紫相鄰對 ΔE 只有 ${chart.minDeltaE.value.toFixed(1)}，要重新排序或換色；深色主題可另生降 chroma 的一套。代價：三處複製要合併。`],
    ["警示色補 high-contrast 層", "以 text 色當底、反白字（深色主題反深字），只給 modal 與 critical；聊天錯誤橫幅與 QR 狀態改用語意 token。代價：橘框顏色會變。"],
    ["硬編碼改 token、CI 擋 raw hex", `${HARDCODED_TOTAL} 處字面中，globals.css 之外約 ${HARDCODED_TOTAL - 121} 處可逐步改成 var()；a2ui-theme.css 未引用可刪。CI 在 token build 時算對比，低於門檻 fail。代價：lint 初期會紅一片。`],
    ["沙箱深色跟 app 一致", `THEME_CSS 除了 media query 再加 ${code(":root[data-theme=dark]")} 選擇器；渲染器建立 iframe 時把 app 的主題寫進去。代價：design-system 多一個選擇器、frame-content 多一行。`],
  ];
  return `# 色彩治理

數字全部由產生器用專案的色彩函式算出（WCAG 2.x 相對亮度、OKLab／OKLCH、Machado 2009 色覺模擬）。

## 對比驗收

${contrastTable(report)}

未達的配對保留原值並在 token 的 usage 註明；元件不使用這些配對。${code("text-tertiary")} 與 ${code("sandbox-text-tertiary")} 兩主題都不到 4.5:1，只能給停用態與裝飾。

## 語意色色相是否落在慣例範圍

${table(["語意", "慣例", "淺色實際", "深色實際"], semantic)}

## 圖表分類色

${table(["token", "值", "OKLCH", "對淺色 surface（≥3:1）", "對深色 surface（≥3:1）"], chartRows)}

可辨性（OKLab 歐氏距離 ×100 的 ΔE，愈大愈好；一般視覺建議 ≥15）：

${table(["指標", "chart-1…7", "Okabe-Ito 八色"], [
    ["原色最小 ΔE", pair(chart.minDeltaE, "chart-"), pair(okabe.minDeltaE, "#")],
    ["protan 模擬後最小 ΔE", pair(chart.cvd.protan, "chart-"), pair(okabe.cvd.protan, "#")],
    ["deutan 模擬後最小 ΔE", pair(chart.cvd.deutan, "chart-"), pair(okabe.cvd.deutan, "#")],
    ["tritan 模擬後最小 ΔE", pair(chart.cvd.tritan, "chart-"), pair(okabe.cvd.tritan, "#")],
    ["最小相對亮度差 |ΔY|", pair(chart.minLuminanceGap, "chart-", 1, 3), pair(okabe.minLuminanceGap, "#", 1, 3)],
    ["灰階順序單調", chart.grayscaleMonotonic ? "是" : "否", okabe.grayscaleMonotonic ? "是" : "否"],
    ["相鄰色相最小間距", `${chart.minAdjacentHueGap.toFixed(0)}°`, `${okabe.minAdjacentHueGap.toFixed(0)}°`],
  ])}

相鄰配對的色盲風險：

${table(["配對", "風險", "原因"], adjacent)}

dataviz 驗證器在解析當時的結果（靜態紀錄）：

${VALIDATOR_RESULTS.map((v) => `**${v.palette}**\n\n${table(["檢查", "結果", "說明"], v.rows)}`).join("\n\n")}

規則：分類色順序固定、不循環、第 8 類起改 highlight+mute；連續數值用 ${code("scale-mint-*")}，偏差用 ${code("scale-diverge-*")}；圖永遠配表或摘要；紅綠不當唯一對比。

## 硬編碼色統計（原始碼）

${table(["檔案", "筆數", "備註"], HARDCODED_COUNTS.map((h) => [h.file, h.count, h.note ?? ""]))}

合計 ${HARDCODED_TOTAL} 處。

## 建議清單（附取捨）

${recommendations.map(([t, d]) => `- **${t}**：${d}`).join("\n")}
`;
}

export function renderSections(set: TokenSet, report: ContrastRow[]): Record<string, string> {
  return {
    "01-design-method.md": section01(),
    "02-presentation-rules.md": section02(),
    "03-guardrails.md": section03(),
    "04-coverage-acceptance.md": section04(),
    "05-color-governance.md": section05(set, report),
  };
}
