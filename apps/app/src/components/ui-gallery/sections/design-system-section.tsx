"use client";

import { useMemo, useState } from "react";
import { THEME_CSS } from "@repo/design-system";
import { GallerySection } from "../gallery-section";
import { GalleryItem } from "../gallery-item";
import { DesignSystemFrame, type FrameMode } from "../design-system-frame";
import { isColorValue, parseThemeTokens, tokenGroup, type TokenEntry, type TokenGroup } from "../design-tokens";
import { DESIGN_SYSTEM_MARKUP } from "../gallery-fixtures";

const GROUP_LABEL: Record<TokenGroup, string> = {
  background: "背景",
  text: "文字",
  border: "邊框",
  font: "字體",
  radius: "圓角",
  alias: "縮寫別名",
  other: "其他",
};

const APP_TOKEN_GROUPS = [
  { label: "品牌", names: ["--color-lilac", "--color-lilac-light", "--color-lilac-dark", "--color-mint", "--color-mint-light", "--color-mint-dark"] },
  { label: "表面", names: ["--background", "--surface-primary", "--surface-secondary", "--surface-tertiary", "--surface-quaternary", "--color-container"] },
  { label: "文字", names: ["--text-primary", "--text-secondary", "--text-tertiary", "--color-text-primary", "--color-text-secondary", "--color-text-tertiary"] },
  { label: "邊框與玻璃", names: ["--border-default", "--border-hover", "--color-border-glass", "--color-glass", "--color-glass-subtle"] },
];

function SwatchGrid({ entries, dark }: { entries: TokenEntry[]; dark?: Map<string, string> }) {
  return (
    <div className="gal-swatch-grid">
      {entries.map((entry) => {
        const darkValue = dark?.get(entry.name);
        const color = isColorValue(entry.value);
        return (
          <div key={entry.name} className="gal-swatch">
            {color ? (
              <div className={`gal-swatch-chip${darkValue ? " gal-swatch-chip--split" : ""}`} style={{ background: entry.value }}>
                {darkValue && (
                  <>
                    <span style={{ background: entry.value }} />
                    <span style={{ background: darkValue }} />
                  </>
                )}
              </div>
            ) : (
              <div className="gal-swatch-chip" style={{ background: "var(--surface-quaternary)", padding: 6, fontSize: 11, alignItems: "center" }}>
                {entry.name.startsWith("--font") ? <span style={{ fontFamily: entry.value }}>Aa 字</span> : <span style={{ width: 28, height: 28, border: "1px solid var(--border-hover)", borderRadius: entry.value, background: "var(--surface-primary)" }} />}
              </div>
            )}
            <span className="gal-swatch-name">{entry.name}</span>
            <span className="gal-swatch-value">{entry.value}{darkValue ? ` / ${darkValue}` : ""}</span>
          </div>
        );
      })}
    </div>
  );
}

/** 讀取頁面上 globals.css 目前模式下的實際值 */
function LiveAppTokens() {
  const [values, setValues] = useState<Record<string, string> | null>(null);
  const read = () => {
    const styles = getComputedStyle(document.documentElement);
    const next: Record<string, string> = {};
    APP_TOKEN_GROUPS.forEach((group) => group.names.forEach((name) => {
      next[name] = styles.getPropertyValue(name).trim();
    }));
    setValues(next);
  };
  return (
    <div className="gal-stack">
      <div className="gal-actions">
        <button type="button" className="gal-btn gal-btn--small" onClick={read}>
          讀取目前模式的實際值
        </button>
        <span className="gal-meta">切換頂列主題後再按一次，可看到 :root.dark 換值。</span>
      </div>
      {values &&
        APP_TOKEN_GROUPS.map((group) => (
          <div key={group.label}>
            <h4 className="gal-swatch-name" style={{ marginBottom: 6 }}>{group.label}</h4>
            <SwatchGrid entries={group.names.map((name) => ({ name, value: values[name] || "(未定義)" }))} />
          </div>
        ))}
    </div>
  );
}

export function DesignSystemSection() {
  const tokens = useMemo(() => parseThemeTokens(THEME_CSS), []);
  const darkMap = useMemo(() => new Map(tokens.dark.map((entry) => [entry.name, entry.value])), [tokens]);
  const groups = useMemo(() => {
    const map = new Map<TokenGroup, TokenEntry[]>();
    tokens.light.forEach((entry) => {
      const group = tokenGroup(entry.name);
      map.set(group, [...(map.get(group) ?? []), entry]);
    });
    return map;
  }, [tokens]);
  const [mode, setMode] = useState<FrameMode>("light");

  return (
    <GallerySection
      id="design-system"
      intro={
        <>
          <p>
            沙箱裡的生成式 UI 只能用 <code>packages/design-system/src/index.ts</code> 提供的 token：背景、文字、邊框各三階，加上 info／danger／success／warning 四組語意色，
            以及字體與圓角。渲染器會把 <code>THEME_CSS + SVG_CLASSES_CSS + FORM_STYLES_WITH_STAGGER_CSS</code> 注入每個 iframe，所以 button、input、select 不用自己寫樣式。
          </p>
          <p>
            這裡的色票與數值都是從匯出的 CSS 字串即時解析出來的，深色欄來自 <code>@media (prefers-color-scheme: dark)</code> 區塊。
          </p>
        </>
      }
    >
      <div className="gal-grid">
        {(["background", "text", "border", "font", "radius", "alias"] as TokenGroup[]).map((group) => (
          <GalleryItem
            key={group}
            name={`${GROUP_LABEL[group]} token`}
            exportName="THEME_CSS"
            path="packages/design-system/src/index.ts"
            state="mounted"
            demo="plain"
            propsSummary={group === "alias" ? "--p --s --t --bg2 --b 是 SVG 類別用的短名" : undefined}
          >
            <SwatchGrid entries={groups.get(group) ?? []} dark={darkMap} />
          </GalleryItem>
        ))}
      </div>

      <GalleryItem
        name="表單控制項與 SVG 類別（沙箱內實際樣式）"
        exportName="FORM_STYLES_CSS · SVG_CLASSES_CSS"
        path="packages/design-system/src/index.ts"
        state="mounted"
        demo="plain"
        wide
        note={
          <p>
            正式沙箱的深色只跟隨作業系統偏好，這裡的「深色」是把 media 區塊展開後強制套用，用來預覽同一份 token 在兩種模式的樣子。
          </p>
        }
      >
        <div className="gal-stack">
          <div className="gal-seg" role="group" aria-label="沙箱色彩模式">
            {(["light", "dark"] as FrameMode[]).map((item) => (
              <button key={item} type="button" aria-pressed={mode === item} onClick={() => setMode(item)}>
                {item === "light" ? "淺色" : "深色"}
              </button>
            ))}
          </div>
          <DesignSystemFrame markup={DESIGN_SYSTEM_MARKUP} mode={mode} title="設計系統控制項與 SVG 類別預覽" height={620} />
        </div>
      </GalleryItem>

      <GalleryItem
        name="app 端第二套 token（globals.css）"
        exportName=":root / :root.dark"
        path="apps/app/src/app/globals.css"
        state="mounted"
        demo="plain"
        wide
        note={
          <p>
            聊天外殼、對話框與未掛載元件用的是這一套（品牌 lilac／mint、<code>--surface-*</code>、<code>--text-*</code>），與沙箱 token 是兩套並存的系統；
            連 <code>--color-text-primary</code> 都各自定義了一次，值不同。
          </p>
        }
      >
        <LiveAppTokens />
      </GalleryItem>
    </GallerySection>
  );
}
