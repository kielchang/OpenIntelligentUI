"use client";

import { useMemo, useState } from "react";
import { CHART_COLORS } from "@/components/generative-ui/charts/config";
import { BarChart } from "@/components/generative-ui/charts/bar-chart";
import { GallerySection } from "../gallery-section";
import { GalleryItem } from "../gallery-item";
import { Swatch } from "../color-components/swatch";
import { HueWheel } from "../color-components/hue-wheel";
import { ContrastGrid } from "../color-components/contrast-grid";
import { CvdStrip } from "../color-components/cvd-strip";
import { CategoricalBars, HeatRow, RampStrip } from "../color-components/palette-preview";
import { AlertTiers, type SemanticSet } from "../color-components/alert-tiers";
import { BudgetBar } from "../color-components/budget-bar";
import {
  contrastRatio,
  formatOklch,
  formatRatio,
  hueDistance,
  parseColor,
  passesWcag,
  rgbToOklch,
} from "../color/color-math";
import { diverging, OKABE_ITO, sequential } from "../color/palette-generation";
import { classifyPair } from "../color/cvd-palette";
import type { NamedColor } from "../color/contrast-matrix";
import {
  allFamilies,
  APP_TOKENS,
  designSystemFamily,
  HARDCODED_COUNTS,
  HARDCODED_TOTAL,
  SEMANTIC_HUE_CONVENTION,
  svgRamps,
  VALIDATOR_RESULTS,
} from "../color/color-inventory";
import { BAR_CHART_FIXTURE } from "../gallery-fixtures";

type Mode = "light" | "dark";

const CHART_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"];
const CHART_VALUES = [120, 148, 171, 165, 199, 176, 188];
const CHART_NAMES = ["blue", "purple", "pink", "amber", "emerald", "cyan", "orange"];

function pick(swatches: { name: string; light: string; dark?: string }[], names: string[], mode: Mode): NamedColor[] {
  return names.flatMap((name) => {
    const swatch = swatches.find((item) => item.name === name);
    if (!swatch) return [];
    return [{ name, hex: mode === "dark" ? swatch.dark ?? swatch.light : swatch.light }];
  });
}

function RatioLine({ label, fg, bg, use }: { label: string; fg: string; bg: string; use: "normal" | "ui" | "large" }) {
  const a = parseColor(fg);
  const b = parseColor(bg);
  if (!a || !b) return null;
  const ratio = contrastRatio(a, b);
  const pass = passesWcag(ratio, use);
  return (
    <li>
      <span className="gal-contrast-sample" style={{ background: bg, color: fg, border: "1px solid var(--border-subtle)" }}>Aa</span>{" "}
      {label}：{formatRatio(ratio)}（需 {use === "normal" ? "4.5" : "3"}:1）
      <span className="gal-badge" data-state={pass ? "pass" : "fail"} style={{ marginLeft: 6 }}>{pass ? "PASS" : "FAIL"}</span>
    </li>
  );
}

export function ColorSection() {
  const [mode, setMode] = useState<Mode>("light");
  const families = useMemo(() => allFamilies(), []);
  const designSystem = useMemo(() => designSystemFamily(), []);
  const ramps = useMemo(() => svgRamps(), []);

  const dsText = pick(designSystem.swatches, ["--color-text-primary", "--color-text-secondary", "--color-text-tertiary"], mode);
  const dsBg = pick(designSystem.swatches, ["--color-background-primary", "--color-background-secondary", "--color-background-tertiary"], mode);
  const dsBgPrimary = dsBg[0]?.hex ?? "#ffffff";
  const semanticSets: SemanticSet[] = ["info", "success", "warning", "danger"].map((role) => ({
    role,
    bg: pick(designSystem.swatches, [`--color-background-${role}`], mode)[0]?.hex ?? "",
    text: pick(designSystem.swatches, [`--color-text-${role}`], mode)[0]?.hex ?? "",
    border: pick(designSystem.swatches, [`--color-border-${role}`], mode)[0]?.hex ?? "",
  }));
  const semanticText: NamedColor[] = semanticSets.map((set) => ({ name: `text-${set.role}`, hex: set.text }));
  const semanticBg: NamedColor[] = semanticSets.map((set) => ({ name: `bg-${set.role}`, hex: set.bg }));

  const appBackground = pick(APP_TOKENS, ["--background"], mode)[0]?.hex ?? "#ffffff";
  const appText = pick(APP_TOKENS, ["--text-primary", "--text-secondary", "--text-tertiary"], mode);
  const appSurface = pick(APP_TOKENS, ["--surface-primary", "--surface-secondary", "--surface-quaternary", "--background"], mode);
  const chartColors: NamedColor[] = CHART_COLORS.map((hex, index) => ({ name: CHART_NAMES[index], hex }));
  const surfaces: NamedColor[] = [{ name: "--surface-primary", hex: appSurface[0]?.hex ?? "#ffffff" }, { name: "sandbox bg-primary", hex: dsBgPrimary }];

  const sequentialRamp = useMemo(() => sequential("#1b936f", 7), []);
  const divergingRamp = useMemo(() => diverging("#9599cc", "#1b936f", 7), []);
  const riskyPairs = useMemo(() => {
    const pairs: string[] = [];
    for (let i = 0; i < CHART_COLORS.length; i += 1) {
      for (let j = i + 1; j < CHART_COLORS.length; j += 1) {
        const verdict = classifyPair(CHART_COLORS[i], CHART_COLORS[j]);
        if (verdict.risk === "risky") pairs.push(`${CHART_NAMES[i]} ↔ ${CHART_NAMES[j]}：${verdict.reason}`);
      }
    }
    return pairs;
  }, []);

  const lilacDark = "#9599CC";
  const mintDark = "#1B936F";
  const lilacOklch = parseColor(lilacDark) ? rgbToOklch(parseColor(lilacDark)!) : null;
  const dsNeutral = parseColor(mode === "dark" ? "#2c2c2a" : "#f7f6f3");
  const appNeutral = parseColor(mode === "dark" ? "#9ca3af" : "#6b7280");

  return (
    <GallerySection
      id="color"
      intro={
        <>
          <p>
            這個專案同時存在<strong>五個色彩家族</strong>：沙箱用的 design-system 語意 token、SVG 九色階、app 的品牌 lilac／mint 與 Tailwind 灰階、七色 CHART_COLORS，以及散落在十幾個檔案裡的硬編碼值。
            下面用 OKLCH 把它們放到同一個座標系，用 WCAG 2.2 AA 的嚴格門檻算對比，再用色盲模擬與 dataviz 驗證腳本檢查圖表色。所有數字都在頁面上即時計算。
          </p>
          <p>
            方法論：三層 token（primitive → semantic → component，應用程式只碰 semantic）、主色用公式延伸而不是憑感覺、對比是生成參數不是事後檢查、色彩疲勞管的是 60-30-10 配額、警示色與圖表色在 semantic 層分家。
          </p>
        </>
      }
    >
      <div className="gal-actions">
        <div className="gal-seg" role="group" aria-label="分析的色彩模式">
          {(["light", "dark"] as Mode[]).map((item) => (
            <button key={item} type="button" aria-pressed={mode === item} onClick={() => setMode(item)}>
              {item === "light" ? "淺色值" : "深色值"}
            </button>
          ))}
        </div>
        <span className="gal-meta">切換後色相環、對比矩陣與警示色都重算。</span>
      </div>

      <h3 className="gal-subhead">1 · 色彩家族盤點</h3>
      <div className="gal-stack">
        {families.map((family) => (
          <GalleryItem key={family.id} name={family.name} path={family.source} state={family.id === "adhoc" ? "css" : "mounted"} demo="plain" wide propsSummary={family.description} note={family.usage.length > 0 ? <p>用在：{family.usage.join("；")}</p> : undefined}>
            <div className="gal-swatch-grid">
              {family.swatches.map((swatch) => (
                <Swatch key={swatch.name} name={swatch.name} light={swatch.light} dark={swatch.dark} note={swatch.note} />
              ))}
            </div>
          </GalleryItem>
        ))}
        <GalleryItem name="硬編碼色值統計" path="apps/app/src（非測試檔）" state="css" demo="plain" wide propsSummary={`以 /#[0-9a-fA-F]{3,8}\\b|rgba?\\(/ 逐一計數，共 ${HARDCODED_TOTAL} 處；globals.css 是 token 定義本身，a2ui-theme.css 從未被引用。`}>
          <div className="gal-table-wrap">
            <table className="gal-table gal-table--dense">
              <thead>
                <tr>
                  <th>檔案</th>
                  <th>筆數</th>
                  <th>備註</th>
                </tr>
              </thead>
              <tbody>
                {HARDCODED_COUNTS.map((entry) => (
                  <tr key={entry.file}>
                    <td><span className="gal-path">{entry.file}</span></td>
                    <td>{entry.count}</td>
                    <td>{entry.note ?? ""}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GalleryItem>
      </div>

      <h3 className="gal-subhead">2 · 色相環：三套系統彼此不對齊</h3>
      <GalleryItem name="OKLCH 極座標分佈" path="color-components/hue-wheel.tsx（即時計算）" state="mounted" demo="plain" wide
        note={
          <p>
            品牌 lilac 在 281°、mint 在 167°–180°；design-system 的 info 藍在 255° 附近、CHART_COLORS 的 blue 在 262°、purple 在 293°——同一個「藍」有三種角度。
            design-system 的灰（{mode === "dark" ? "#2c2c2a" : "#f7f6f3"}，{dsNeutral ? formatOklch(rgbToOklch(dsNeutral)) : ""}）是帶暖調的灰；app 的 Tailwind 灰（{mode === "dark" ? "#9ca3af" : "#6b7280"}，{appNeutral ? formatOklch(rgbToOklch(appNeutral)) : ""}）偏冷藍，兩套中性色方向相反。
          </p>
        }
      >
        <HueWheel families={families} mode={mode} />
      </GalleryItem>

      <h3 className="gal-subhead">3 · 系統配色診斷（token 架構）</h3>
      <div className="gal-grid gal-grid--two">
        <GalleryItem name="三層 token 對照" path="packages/design-system · apps/app/src/app/globals.css" state="mounted" demo="plain">
          <div className="gal-table-wrap">
            <table className="gal-table gal-table--dense">
              <thead>
                <tr>
                  <th>層</th>
                  <th>design-system（沙箱）</th>
                  <th>app（globals.css）</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Primitive</td>
                  <td>無；hex 直接寫在 semantic 裡</td>
                  <td>部分：lilac／mint 色階（外觀命名）、Tailwind 灰</td>
                </tr>
                <tr>
                  <td>Semantic</td>
                  <td>有，角色命名正確：background／text／border × 3 階 + 4 語意</td>
                  <td>混用：--surface-*、--text-* 是角色，--color-lilac 是外觀，還有一組同名的 --color-text-*</td>
                </tr>
                <tr>
                  <td>Component</td>
                  <td>無（元素選擇器直接套 token）</td>
                  <td>--surface-btn、--surface-dialog、--chart-* 等，散在 :root</td>
                </tr>
                <tr>
                  <td>深色機制</td>
                  <td>@media (prefers-color-scheme) 重新生成</td>
                  <td>:root.dark 換值；ThemeProvider 預設 light</td>
                </tr>
                <tr>
                  <td>表面層級</td>
                  <td>3 層 background</td>
                  <td>4 層 surface（深色用 2–6% 白色透明度）</td>
                </tr>
              </tbody>
            </table>
          </div>
        </GalleryItem>
        <GalleryItem name="品牌色 vs 互動主色" path="apps/app/src/app/globals.css（--copilot-kit-primary-color）" state="mounted" demo="plain"
          note={<p>品牌色 lilac-dark 直接當 CopilotKit 的 primary；它的 chroma 低、明度高，做大面積很舒服，但當文字或圖示色不夠對比。建議拆成 --brand（少量高調）與 --primary（由 brand 降 chroma、調 tone 後重新生成）。</p>}
        >
          <ul className="gal-lede" style={{ margin: 0, paddingLeft: 18, display: "grid", gap: 6 }}>
            <li>--color-lilac-dark {lilacDark}：{lilacOklch ? formatOklch(lilacOklch) : ""}</li>
            <RatioLine label="lilac-dark 當文字 on #ffffff" fg={lilacDark} bg="#ffffff" use="normal" />
            <RatioLine label="lilac-dark 當圖示／邊框 on #ffffff" fg={lilacDark} bg="#ffffff" use="ui" />
            <RatioLine label="mint-dark 當文字 on #ffffff" fg={mintDark} bg="#ffffff" use="normal" />
            <RatioLine label="白字 on lilac-dark（.cta-btn--primary 漸層起點）" fg="#ffffff" bg={lilacDark} use="normal" />
            <RatioLine label="白字 on mint-dark（漸層終點）" fg="#ffffff" bg={mintDark} use="normal" />
            <RatioLine label="focus ring #189370 on --surface-primary" fg="#189370" bg={appSurface[0]?.hex ?? "#ffffff"} use="ui" />
            <RatioLine label=".chat-error 邊框 #ffac4d on --surface-primary" fg="#ffac4d" bg={appSurface[0]?.hex ?? "#ffffff"} use="ui" />
          </ul>
        </GalleryItem>
      </div>

      <h3 className="gal-subhead">4 · 對比驗收矩陣（WCAG 2.2 AA）</h3>
      <div className="gal-stack">
        <ContrastGrid title={`design-system 文字 × 背景（${mode}）`} fgs={dsText} bgs={dsBg} use="normal" />
        <ContrastGrid title={`design-system 語意文字 × 語意底（${mode}）`} fgs={semanticText} bgs={semanticBg} use="normal" />
        <ContrastGrid title={`design-system 語意邊框 × 背景，非文字 3:1（${mode}）`} fgs={semanticSets.map((set) => ({ name: `border-${set.role}`, hex: set.border }))} bgs={dsBg} use="ui" sampleText="■" />
        <ContrastGrid title={`app --text-* × --surface-*（${mode}；半透明表面先合成到 --background ${appBackground}）`} fgs={appText} bgs={appSurface} use="normal" base={appBackground} />
        <ContrastGrid title={`CHART_COLORS 對表面，非文字 3:1（${mode}）`} fgs={chartColors} bgs={surfaces} use="ui" sampleText="▇" base={appBackground} />
        <div className="gal-callout">
          <strong>怎麼讀：</strong>比值截斷到兩位小數顯示，判定用原始值，所以顯示 4.49 的一定不過。設計系統的次要文字對次要背景在淺色模式剛好差一點；app 的 --text-tertiary 當任何正文都不過，只能當裝飾或大字。
        </div>
      </div>

      <h3 className="gal-subhead">5 · 圖表配色</h3>
      <div className="gal-stack">
        <GalleryItem id="item-chart-cvd" name="CHART_COLORS 的色盲與灰階檢查" path="apps/app/src/components/generative-ui/charts/config.ts" state="mounted" demo="plain" wide
          note={
            <div>
              <p>dataviz 驗證腳本（validate_palette.js）結論：</p>
              {VALIDATOR_RESULTS.map((result) => (
                <table key={result.palette} className="gal-table gal-table--dense" style={{ marginBottom: 8 }}>
                  <caption style={{ textAlign: "left", fontWeight: 600, padding: "4px 0" }}>{result.palette}</caption>
                  <tbody>
                    {result.rows.map((row) => (
                      <tr key={row[0]}>
                        <td>{row[0]}</td>
                        <td><span className="gal-badge" data-state={row[1] === "PASS" ? "pass" : row[1] === "FAIL" ? "fail" : "unmounted"}>{row[1]}</span></td>
                        <td>{row[2]}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ))}
            </div>
          }
        >
          <div className="gal-stack">
            <CvdStrip label="CHART_COLORS（固定順序 index % 7）" hexes={[...CHART_COLORS]} names={CHART_NAMES} />
            <CvdStrip label="對照：Okabe-Ito 八色（色盲黃金標準）" hexes={[...OKABE_ITO]} />
            {riskyPairs.length > 0 && (
              <div className="gal-callout">
                <strong>危險配對（classifyPair）：</strong>
                <ul style={{ margin: "4px 0 0", paddingLeft: 18 }}>
                  {riskyPairs.map((pair) => (
                    <li key={pair}>{pair}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </GalleryItem>

        <div className="gal-grid gal-grid--two">
          <GalleryItem name="真實 BarChart（CHART_COLORS 逐根換色）" path="apps/app/src/components/generative-ui/charts/bar-chart.tsx" state="mounted" demo="plain"
            note={<p>同一個度量的每一根長條換不同色相，顏色沒有承載任何資訊（dataviz 反模式：顏色跟位置走）；第 8 筆資料會循環回第 1 色。</p>}
          >
            <BarChart {...BAR_CHART_FIXTURE} />
          </GalleryItem>
          <GalleryItem name="建議：單一度量用單色，重點用 highlight + mute" path="color-components/palette-preview.tsx（示範）" state="mounted" demo="plain"
            note={<p>一個度量一個顏色；要強調某一筆就只讓它飽和、其餘灰。超過 6–8 類不加新色相，改 small multiples 或「Other」。</p>}
          >
            <div className="gal-stack">
              <CategoricalBars title="單一度量：mint-dark 一色" hexes={[mintDark]} labels={CHART_LABELS} values={CHART_VALUES} />
              <CategoricalBars title="highlight + mute：只強調 May" hexes={[...CHART_COLORS]} labels={CHART_LABELS} values={CHART_VALUES} highlightIndex={4} />
            </div>
          </GalleryItem>
        </div>

        <div className="gal-grid gal-grid--two">
          <GalleryItem name="Sequential：以 mint-dark 為 hue 生成" path="color/palette-generation.ts" state="mounted" demo="plain"
            note={<p>固定 hue、明度 0.95 → 0.35 線性、chroma 隨明度拋物線收斂（避免極亮極暗處 gamut clipping）。連續數值（金額、計數）用這種，不套分類色盤。</p>}
          >
            <div className="gal-stack">
              <RampStrip title="sequential('#1b936f', 7)" hexes={sequentialRamp} startLabel="低" endLabel="高" />
              <HeatRow title="月度數值熱力列（等距資料 = 等距感知）" hexes={sequentialRamp} values={CHART_VALUES} labels={CHART_LABELS} />
            </div>
          </GalleryItem>
          <GalleryItem name="Diverging：lilac-dark ↔ mint-dark，中性中點" path="color/palette-generation.ts" state="mounted" demo="plain"
            note={<p>兩個 sequential 在中性中點（L 0.95、C 0.01）交會，兩極明度對稱；正負、超標／未達用這種，中點對齊零。</p>}
          >
            <RampStrip title="diverging('#9599cc', '#1b936f', 7)" hexes={divergingRamp} startLabel="− lilac" midLabel="0 中性" endLabel="+ mint" />
          </GalleryItem>
        </div>

        <GalleryItem id="item-svg-ramps" name="SVG 九色階在兩種模式的 fill / stroke / text" path="packages/design-system/src/index.ts（SVG_CLASSES_CSS）" state="mounted" demo="plain" wide
          note={<p>這組是「淡底、深框、深字」的圖解色，不是圖表分類色；技能文件規定一張圖 2–3 階、顏色對應類別。驗證腳本指出 amber／green 與 pink／coral 相鄰時色盲難分，所以圖解要靠標籤與形狀而不是只靠色階。</p>}
        >
          <div className="gal-swatch-grid">
            {ramps.map((ramp) => (
              <div key={ramp.name} className="gal-swatch">
                <div className="gal-swatch-chip gal-swatch-chip--split" style={{ height: 64 }}>
                  <span style={{ background: ramp.light.fill, borderRight: `3px solid ${ramp.light.stroke}`, display: "flex", alignItems: "center", justifyContent: "center", color: ramp.light.text, fontSize: 11, fontWeight: 500 }}>Aa</span>
                  <span style={{ background: ramp.dark.fill, borderLeft: `3px solid ${ramp.dark.stroke}`, display: "flex", alignItems: "center", justifyContent: "center", color: ramp.dark.text, fontSize: 11, fontWeight: 500 }}>Aa</span>
                </div>
                <span className="gal-swatch-name">.c-{ramp.name}</span>
                <span className="gal-swatch-value">淺 {ramp.light.fill} / {ramp.light.stroke}</span>
                <span className="gal-swatch-value">深 {ramp.dark.fill} / {ramp.dark.stroke}</span>
              </div>
            ))}
          </div>
        </GalleryItem>
      </div>

      <h3 className="gal-subhead">6 · 警示／狀態色：用強度分級，不用更多色相</h3>
      <GalleryItem id="item-alert-tiers" name="四種語意色的兩種強度" path="packages/design-system/src/index.ts（--color-*-info/success/warning/danger）" state="mounted" demo="plain" wide
        note={
          <div>
            <p>專案的 bg + text + border 三件組正是 Carbon 的 low-contrast tint 結構，但沒有 high-contrast 層；錯誤橫幅用自己的 #ffac4d、QrModal 用 #e6a817／#1b936f，都沒走這組 token。</p>
            <p>語意 hue 是否落在慣例範圍（±15°）：
              {semanticSets.map((set) => {
                const rgb = parseColor(set.text);
                if (!rgb) return null;
                const hue = rgbToOklch(rgb).h;
                const convention = SEMANTIC_HUE_CONVENTION[set.role];
                const ok = hueDistance(hue, convention.hue) <= 15;
                return (
                  <span key={set.role} style={{ marginLeft: 8 }}>
                    {set.role} {Math.round(hue)}°（慣例 {convention.label} {convention.hue}°）<span className="gal-badge" data-state={ok ? "pass" : "fail"}>{ok ? "在範圍內" : `偏 ${Math.round(hueDistance(hue, convention.hue))}°`}</span>
                  </span>
                );
              })}
            </p>
            <p>三重編碼檢查：DataTable 的無效列只有文字（缺 icon）；MeetingTimePicker 用 emoji 當 icon；QrModal 有色點 + 文字但色點太小。</p>
          </div>
        }
      >
        <AlertTiers sets={semanticSets} surface={dsBgPrimary} />
      </GalleryItem>

      <h3 className="gal-subhead">7 · 色彩疲勞：60-30-10 配額</h3>
      <GalleryItem name="配額與頻率" path="方法論：references/04-alerts-and-dataviz" state="mounted" demo="plain" wide>
        <BudgetBar />
      </GalleryItem>

      <h3 className="gal-subhead">8 · 色彩建議清單（附取捨）</h3>
      <div className="gal-stack">
        {[
          ["拆 --brand 與 --primary", `lilac-dark 對白底只有 ${formatRatio(contrastRatio(parseColor(lilacDark)!, parseColor("#ffffff")!))}，當 CopilotKit primary 的文字／圖示色不達 3:1。保留它當品牌色（logo、CTA 漸層），另生一個 OKLCH L≈0.45、C≈0.10、H 281° 的互動主色。代價：多一個 token、按鈕沒那麼「淡紫」。`],
          ["統一一套 semantic 命名", "刪掉 globals.css 與 design-system 重名的 --color-text-*；app 側改成 --surface-*／--text-*／--border-* 一套角色名，沙箱側維持 --color-*。代價：一次性搬 CSS。"],
          ["中性色帶主色調", "app 的 Tailwind 灰偏冷藍（H≈260°）、design-system 灰偏暖（H≈90°），兩套看起來像拼裝。選一個 hue（建議 brand 的 281°），chroma 壓到 0.01–0.02 重生灰階。代價：灰階全換、視覺回歸要重拍。"],
          ["圖表色 token 化並固定順序", `CHART_COLORS 改成 --chart-1..7 token、淺深兩套（深色降 chroma）；index % 7 循環改成「第 8 類折成 Other」；藍／紫相鄰對 ΔE 只有 ${(12).toFixed(0)} 要重新排序或換色。代價：三處複製要合併。`],
          ["警示色補 high-contrast 層", "以 text 色當底、反白字，只給 modal／critical；.chat-error 與 QrModal 改用語意 token。代價：橘框顏色會變。"],
          ["硬編碼改 token、CI 擋 raw hex", `${HARDCODED_TOTAL} 處字面中，globals.css 之外約 ${HARDCODED_TOTAL - 121} 處可逐步改成 var()；a2ui-theme.css 未引用可刪。CI 在 token build 時算對比，低於門檻 fail。代價：lint 初期會紅一片。`],
          ["沙箱深色跟 app 一致", "THEME_CSS 除了 media query，再加 :root[data-theme=dark] 選擇器；渲染器建立 iframe 時把 app 的主題寫進去。代價：design-system 多一個選擇器、frame-content 多一行。"],
        ].map(([title, detail]) => (
          <article key={title} className="gal-finding">
            <span className="gal-badge gal-severity-medium">建議</span>
            <h3>{title}</h3>
            <p>{detail}</p>
          </article>
        ))}
      </div>
    </GallerySection>
  );
}
