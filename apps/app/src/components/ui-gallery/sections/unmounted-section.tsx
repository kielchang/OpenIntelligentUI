"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useAgent } from "@copilotkit/react-core/v2";
import { DemoGallery } from "@/components/demo-gallery";
import { DemoCard } from "@/components/demo-gallery/demo-card";
import { CategoryFilter } from "@/components/demo-gallery/category-filter";
import { DEMO_EXAMPLES, type DemoCategory } from "@/components/demo-gallery/demo-data";
import { TemplateCard } from "@/components/template-library/template-card";
import { TemplateChip } from "@/components/template-library/template-chip";
import { SEED_TEMPLATES } from "@/components/template-library/seed-templates";
import { QrButton, QrModal } from "@/components/qr-modal";
import { DesktopTipModal } from "@/components/desktop-tip-modal";
import { ExplainerCards, ExplainerCardsPortal } from "@/components/explainer-cards";
import { ExampleLayout } from "@/components/example-layout";
import { GallerySection } from "../gallery-section";
import { GalleryItem } from "../gallery-item";
import { useGalleryToast } from "../gallery-toast";
import { BAR_CHART_FIXTURE, PICK_PROMPTS, PIE_CHART_FIXTURE } from "../gallery-fixtures";

type ScanStatus = "waiting" | "scanned" | "picked";

function CssShowcase() {
  return (
    <div className="gal-stack">
      <div className="gal-bg-frame">
        <div className="abstract-bg">
          <div className="blob-3" />
        </div>
        <div className="gal-bg-content">
          <div className="glass-card">
            <strong className="text-gradient" style={{ fontSize: 16 }}>.glass-card + .text-gradient</strong>
            <p style={{ margin: "6px 0 0", fontSize: 12, color: "var(--text-secondary)" }}>backdrop-filter 12px、玻璃邊框、hover 上浮</p>
          </div>
          <div className="glass-subtle" style={{ padding: 16 }}>
            <strong style={{ fontSize: 13 }}>.glass-subtle</strong>
            <p style={{ margin: "6px 0 0", fontSize: 12, color: "var(--text-secondary)" }}>較輕的玻璃，用在歡迎卡</p>
          </div>
          <div className="border-gradient" style={{ padding: 16, borderRadius: 12 }}>
            <strong style={{ fontSize: 13 }}>.border-gradient</strong>
            <p style={{ margin: "6px 0 0", fontSize: 12, color: "var(--text-secondary)" }}>lilac → mint 漸層邊框</p>
          </div>
        </div>
      </div>
      <div>
        <div className="branded-header-title">.branded-header-title</div>
        <div className="branded-header-subtitle">.branded-header-subtitle — 品牌漸層標題與副標</div>
      </div>
      <div className="cta-banner" style={{ borderRadius: 12, border: "1px solid var(--border-default)" }}>
        <div className="cta-content">
          <div className="cta-text">
            <span className="cta-icon" aria-hidden="true">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
            </span>
            <p className="cta-headline">.cta-banner <span className="cta-subtext">— 帶漸層 icon 與主要按鈕的橫幅</span></p>
          </div>
          <div className="cta-actions">
            <button type="button" className="cta-btn cta-btn--primary">.cta-btn--primary</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function UnmountedSection() {
  const { toast } = useGalleryToast();
  const { agent } = useAgent();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [category, setCategory] = useState<DemoCategory | null>(null);
  const [qrOpen, setQrOpen] = useState(false);
  const [scanStatus, setScanStatus] = useState<ScanStatus>("waiting");
  const [tipKey, setTipKey] = useState(0);
  const [portalOn, setPortalOn] = useState(false);

  const filtered = category ? DEMO_EXAMPLES.filter((demo) => demo.category === category) : DEMO_EXAMPLES;

  const setPendingTemplate = (template: { id: string; name: string } | null) => {
    agent.setState({ ...(agent.state ?? {}), pending_template: template });
    toast(template ? `agent.state.pending_template = ${template.name}` : "已清除 pending_template");
  };

  return (
    <GallerySection
      id="unmounted"
      intro={
        <>
          <p>
            這些元件都在 repo 裡、都能編譯，但<strong>沒有任何檔案 import 它們</strong>：示範抽屜、範本庫、QR 投票、手機提示、歡迎卡，以及一批只存在於 globals.css 的視覺樣式。
            它們反映了專案改版前的產品方向（以 widget 與範本為中心），與現在「answers you can interact with」的定位不同。
          </p>
        </>
      }
    >
      <div className="gal-grid">
        <GalleryItem
          name="示範抽屜"
          exportName="DemoGallery"
          path="apps/app/src/components/demo-gallery/index.tsx"
          state="unmounted"
          propsSummary="{ open, onClose, onTryDemo }；手機為底部全螢幕、桌面為右側 480px 面板；Esc 關閉"
        >
          <div className="gal-actions">
            <button type="button" className="gal-btn gal-btn--primary" onClick={() => setDrawerOpen(true)}>
              開啟 Demo Gallery 抽屜
            </button>
          </div>
          <DemoGallery open={drawerOpen} onClose={() => setDrawerOpen(false)} onTryDemo={(demo) => toast(`onTryDemo → 會送出提示：${demo.prompt.slice(0, 90)}…`)} />
        </GalleryItem>

        <GalleryItem
          name="分類篩選與示範卡"
          exportName="CategoryFilter · DemoCard"
          path="apps/app/src/components/demo-gallery/"
          state="unmounted"
          propsSummary="CategoryFilter { selected, onSelect }；DemoCard { demo, onTry }；資料來自 DEMO_EXAMPLES（7 筆）"
          note={<p>DemoCard 的 CATEGORY_COLORS 鍵是舊分類名（3D / Animation…），對不上 Understand／Compare／Make a tool，所以徽章永遠是灰色。</p>}
        >
          <div className="gal-stack">
            <CategoryFilter selected={category} onSelect={setCategory} />
            <div className="gal-stack">
              {filtered.map((demo) => (
                <DemoCard key={demo.id} demo={demo} onTry={(item) => toast(`onTry → ${item.title}`)} />
              ))}
            </div>
          </div>
        </GalleryItem>

        <GalleryItem
          id="item-template-card" name="範本卡"
          exportName="TemplateCard"
          path="apps/app/src/components/template-library/template-card.tsx"
          state="unmounted"
          propsSummary="{ id, name, description, html, componentType?, componentData?, dataDescription, version, onApply, onDelete? }；HTML 預覽是縮到 0.333 的 sandbox iframe，圖表則是內嵌 SVG 迷你圖"
          wide
        >
          <div className="gal-grid">
            {SEED_TEMPLATES.map((template) => (
              <TemplateCard
                key={template.id}
                id={template.id}
                name={template.name}
                description={template.description}
                html={template.html}
                dataDescription={template.data_description}
                version={template.version}
                onApply={(id) => toast(`onApply(${id}) → 寫入 pending_template 並聚焦輸入框`)}
              />
            ))}
            <TemplateCard id="bar" name="Saved bar chart" description="componentType=barChart 的範本：預覽改用內嵌 SVG" html="" componentType="barChart" componentData={{ data: BAR_CHART_FIXTURE.data }} dataDescription="label/value" version={2} onApply={(id) => toast(`onApply(${id})`)} onDelete={(id) => toast(`onDelete(${id})`)} />
            <TemplateCard id="pie" name="Saved pie chart" description="componentType=pieChart 的範本" html="" componentType="pieChart" componentData={{ data: PIE_CHART_FIXTURE.data }} dataDescription="label/value" version={1} onApply={(id) => toast(`onApply(${id})`)} onDelete={(id) => toast(`onDelete(${id})`)} />
          </div>
        </GalleryItem>

        <GalleryItem
          name="已選範本 chip"
          exportName="TemplateChip"
          path="apps/app/src/components/template-library/template-chip.tsx"
          state="unmounted"
          propsSummary="無 props；讀 agent.state.pending_template，找到 CopilotKit 輸入框就 portal 到它上方，否則就地渲染"
          note={<p>這裡用 agent.setState 寫本地狀態；沒有代理執行。若上方聊天外殼的輸入框在畫面上，chip 會跑到那裡。</p>}
        >
          <div className="gal-stack">
            <div className="gal-actions">
              <button type="button" className="gal-btn gal-btn--small" onClick={() => setPendingTemplate({ id: "seed-invoice-001", name: "Invoice Card" })}>
                設定 pending_template
              </button>
              <button type="button" className="gal-btn gal-btn--small" onClick={() => setPendingTemplate(null)}>
                清除
              </button>
            </div>
            <TemplateChip />
          </div>
        </GalleryItem>

        <GalleryItem
          name="QR 投票視窗"
          exportName="QrModal · QrButton"
          path="apps/app/src/components/qr-modal/index.tsx"
          state="unmounted"
          propsSummary="QrModal { isOpen, onClose, sessionId, scanStatus: waiting | scanned | picked }；localhost 會改用 LAN IP 產生 /pick 連結"
        >
          <div className="gal-stack">
            <div className="gal-actions">
              <QrButton onClick={() => setQrOpen(true)} />
              <div className="gal-seg" role="group" aria-label="scanStatus">
                {(["waiting", "scanned", "picked"] as ScanStatus[]).map((status) => (
                  <button key={status} type="button" aria-pressed={scanStatus === status} onClick={() => setScanStatus(status)}>
                    {status}
                  </button>
                ))}
              </div>
            </div>
            <QrModal isOpen={qrOpen} onClose={() => setQrOpen(false)} sessionId="gallery-demo" scanStatus={scanStatus} />
          </div>
        </GalleryItem>

        <GalleryItem
          name="手機提示視窗"
          exportName="DesktopTipModal"
          path="apps/app/src/components/desktop-tip-modal.tsx"
          state="unmounted"
          propsSummary="無 props；sm:hidden（只在 <640px 顯示）；關閉後寫 sessionStorage"
          note={<p>它是全螢幕遮罩，所以這裡不預設掛載；按「顯示」才掛上，桌面寬度看不到，把視窗縮到 640px 以下或在手機上按。</p>}
        >
          <div className="gal-actions">
            <button
              type="button"
              className="gal-btn gal-btn--small"
              onClick={() => {
                try {
                  sessionStorage.removeItem("desktop-tip-dismissed");
                } catch {
                  /* privacy mode */
                }
                setTipKey((key) => key + 1);
                toast("已清除 sessionStorage 旗標並掛載 DesktopTipModal（僅 <640px 可見）");
              }}
            >
              顯示（僅 &lt;640px）
            </button>
          </div>
          {tipKey > 0 && <DesktopTipModal key={tipKey} />}
        </GalleryItem>

        <GalleryItem
          name="歡迎畫面說明卡"
          exportName="ExplainerCards · ExplainerCardsPortal"
          path="apps/app/src/components/explainer-cards.tsx"
          state="unmounted"
          propsSummary="Portal 會用 MutationObserver 找 [data-testid=copilot-welcome-screen]，把三張卡插在建議列之前"
          wide
        >
          <div className="gal-stack">
            <ExplainerCards />
            <div className="gal-actions">
              <button type="button" className="gal-btn gal-btn--small" onClick={() => setPortalOn((on) => !on)}>
                {portalOn ? "移除注入" : "注入到上方聊天外殼的歡迎畫面"}
              </button>
              <span className="gal-meta">注入後往上捲到「聊天外殼」看效果。</span>
            </div>
            {portalOn && <ExplainerCardsPortal />}
          </div>
        </GalleryItem>

        <GalleryItem
          name="只存在於 CSS 的視覺樣式"
          exportName=".abstract-bg .blob-3 .glass* .text-gradient .border-gradient .branded-header-* .cta-banner"
          path="apps/app/src/app/globals.css"
          state="css"
          wide
          demo="plain"
          note={<p>動態模糊色塊背景原本是 position:fixed 的全頁層，這裡限制在容器內展示。</p>}
        >
          <CssShowcase />
        </GalleryItem>

        <GalleryItem
          name="手機投票頁"
          exportName="PickPage"
          path="apps/app/src/app/pick/page.tsx"
          state="unmounted"
          propsSummary="?session=<id>；隨機抽 3 個提示；載入時 PUT /api/pick、點選後 POST；無 session 顯示 Invalid link"
          demo="center"
          note={
            <p>
              12 個候選提示：{PICK_PROMPTS.map((prompt) => `${prompt.emoji} ${prompt.title}`).join("、")}。
            </p>
          }
        >
          <div className="gal-stack" style={{ alignItems: "center" }}>
            <iframe className="gal-phone-frame" src="/pick?session=gallery-demo" title="/pick 手機投票頁" />
            <Link className="gal-btn gal-btn--small" href="/pick?session=gallery-demo" target="_blank">
              在新分頁開啟 /pick
            </Link>
          </div>
        </GalleryItem>

        <GalleryItem
          name="Open Graph 社群圖"
          exportName="OpenGraphImage"
          path="apps/app/src/app/opengraph-image.tsx"
          state="unmounted"
          propsSummary="1200×630 ImageResponse；讀 public/fonts 與 logo；三顆 Understand / Compare / Make a tool chip"
          demo="center"
        >
          <Image src="/opengraph-image" alt="Open Graph 預覽：Answers you can interact with" width={600} height={315} unoptimized style={{ width: "100%", height: "auto", borderRadius: 12, border: "1px solid var(--border-default)" }} />
        </GalleryItem>

        <GalleryItem
          name="範例版面包裝"
          exportName="ExampleLayout"
          path="apps/app/src/components/example-layout/index.tsx"
          state="unmounted"
          propsSummary="{ chatContent }；只剩一個 flex 包裝，mode-toggle 與 headless-chat 已刪除"
        >
          <ExampleLayout chatContent={<div style={{ padding: 12, border: "1px dashed var(--border-hover)", borderRadius: 8, fontSize: 12 }}>chatContent 槽</div>} />
        </GalleryItem>
      </div>
    </GallerySection>
  );
}
