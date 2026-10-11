"use client";

import { useEffect, useMemo } from "react";
import { A2UIProvider, A2UIRenderer, useA2UIActions } from "@copilotkit/a2ui-renderer";
import { AnswerMarkdown } from "@/components/chat/answer-markdown";
import { ToolReasoning } from "@/components/tool-rendering";
import { PlanCard } from "@/components/generative-ui/plan-card";
import { DataTable, tableCatalog } from "@/components/generative-ui/table-catalog";
import { BarChart } from "@/components/generative-ui/charts/bar-chart";
import { PieChart } from "@/components/generative-ui/charts/pie-chart";
import { MeetingTimePicker } from "@/components/generative-ui/meeting-time-picker";
import { ExportOverlay } from "@/components/generative-ui/export-overlay";
import { assembleStandaloneHtmlFromActivity } from "@/components/generative-ui/export-utils";
import { OpenGenUIActivityRenderer, LOADING_PHRASES } from "@/components/generative-ui/open-generative-ui";
import { SEED_TEMPLATES } from "@/components/template-library/seed-templates";
import { GallerySection } from "../gallery-section";
import { GalleryItem } from "../gallery-item";
import { DesignSystemFrame } from "../design-system-frame";
import { splitLeadingStyle } from "../split-leading-style";
import { useGalleryToast } from "../gallery-toast";
import {
  BAR_CHART_FIXTURE,
  INVALID_TABLE,
  MARKDOWN_SAMPLE,
  MEETING_FIXTURE,
  MEETING_SLOTS,
  PIE_CHART_FIXTURE,
  PLAN_FIXTURE,
  QUARTERLY_SALES_TABLE,
  TOOL_REASONING_FIXTURES,
} from "../gallery-fixtures";

const TABLE_SURFACE = "gallery-table";

/** 走真實 A2UI 路徑：createSurface + updateComponents → tableCatalog 的 Table */
function TableSurface() {
  const { processMessages } = useA2UIActions();
  useEffect(() => {
    processMessages([
      { createSurface: { surfaceId: TABLE_SURFACE, catalogId: "copilotkit://open-generative-ui-tables" } },
      {
        updateComponents: {
          surfaceId: TABLE_SURFACE,
          components: [{ id: "root", component: "Table", ...QUARTERLY_SALES_TABLE }],
        },
      },
    ]);
  }, [processMessages]);
  return <A2UIRenderer surfaceId={TABLE_SURFACE} />;
}

export function ResponseComponentsSection() {
  const { toast } = useGalleryToast();
  const weatherSeed = useMemo(() => splitLeadingStyle(SEED_TEMPLATES[0].html), []);
  const weatherStandalone = useMemo(
    () => assembleStandaloneHtmlFromActivity({ css: weatherSeed.css, html: [weatherSeed.html] }, "Weather card"),
    [weatherSeed],
  );

  return (
    <GallerySection
      id="response"
      intro={
        <>
          <p>
            代理回答進到對話時會經過這些 React 元件：工具呼叫的狀態列、規劃卡、A2UI 表格、Recharts 圖表、人機協作的排程卡，以及自訂 UI 完成後的匯出選單。
            下面每一張都用 fixture props 直接掛載，可以互動。
          </p>
        </>
      }
    >
      <div className="gal-grid">
        <GalleryItem
          name="Markdown 回答（逐段顯現）"
          exportName="AnswerMarkdown"
          path="apps/app/src/components/chat/answer-markdown.tsx"
          state="mounted"
          propsSummary="CopilotChatAssistantMessage.MarkdownRenderer 的 props；每個區塊進入視窗時淡入上移 6px（reveal-blocks.ts）"
        >
          <div className="chat-content">
            <AnswerMarkdown content={MARKDOWN_SAMPLE} />
          </div>
        </GalleryItem>

        <GalleryItem
          name="工具呼叫狀態"
          exportName="ToolReasoning"
          path="apps/app/src/components/tool-rendering.tsx"
          state="mounted"
          propsSummary="{ name, args?, status: executing | inProgress | complete }；執行中自動展開 <details>，完成自動收合"
        >
          <div className="gal-stack">
            {TOOL_REASONING_FIXTURES.map((fixture) => (
              <ToolReasoning key={`${fixture.name}-${fixture.status}`} name={fixture.name} status={fixture.status} args={fixture.args} />
            ))}
          </div>
        </GalleryItem>

        <GalleryItem
          name="視覺化規劃卡"
          exportName="PlanCard"
          path="apps/app/src/components/generative-ui/plan-card.tsx"
          state="mounted"
          propsSummary="{ status, approach?, technology?, keyElements? }；對應 plan_visualization 工具（useRenderTool）"
        >
          <div className="gal-stack">
            <PlanCard status="executing" />
            <PlanCard status="complete" {...PLAN_FIXTURE} />
          </div>
        </GalleryItem>

        <GalleryItem
          name="自訂 UI 載入中 placeholder"
          exportName="OpenGenUIActivityRenderer（generating:true）"
          path="apps/app/src/components/generative-ui/open-generative-ui/renderer.tsx"
          state="mounted"
          propsSummary={`content = { initialHeight: 160, generating: true }；每 1.8 秒輪播 LOADING_PHRASES：${LOADING_PHRASES.join("、")}`}
          note={<p>代理輸出的 placeholderMessages 不會出現在這裡；渲染器只認得自己的七句。</p>}
        >
          <OpenGenUIActivityRenderer activityType="open-generative-ui" content={{ initialHeight: 160, generating: true }} message={{}} agent={{}} />
        </GalleryItem>

        <GalleryItem
          name="匯出選單"
          exportName="ExportOverlay"
          path="apps/app/src/components/generative-ui/export-overlay.tsx"
          state="mounted"
          propsSummary="{ title, html?, componentData?, componentType, ready?, children }；滑鼠移入右上角出現 ⋯ → Copy to clipboard / Download file"
        >
          <ExportOverlay title="Weather card" html={weatherStandalone} componentType="openGenUI" ready>
            <DesignSystemFrame markup={weatherSeed.html} extraCss={weatherSeed.css} mode="light" title="Weather seed inside ExportOverlay" height={300} />
          </ExportOverlay>
        </GalleryItem>

        <GalleryItem
          name="A2UI 表格（真實 catalog 路徑）"
          exportName="DataTable · tableCatalog"
          path="apps/app/src/components/generative-ui/table-catalog.tsx"
          state="mounted"
          propsSummary="{ title ≤300, columns 1–12, rows ≤200×≤12, source }；列寬不符時顯示 role=alert"
        >
          <div className="gal-stack">
            <A2UIProvider catalog={tableCatalog}>
              <TableSurface />
            </A2UIProvider>
            <DataTable props={INVALID_TABLE} />
          </div>
        </GalleryItem>

        <GalleryItem
          name="長條圖"
          exportName="BarChart"
          path="apps/app/src/components/generative-ui/charts/bar-chart.tsx"
          state="mounted"
          propsSummary="{ title, description, data: {label, value}[] }；Recharts；顏色依 CHART_COLORS 循環"
          note={<p>註冊成 useComponent(&quot;barChart&quot;)，但 Jev 路由每一輪都把它剔除，正式對話中不會出現。</p>}
        >
          <div className="gal-stack">
            <BarChart {...BAR_CHART_FIXTURE} />
            <BarChart title="Empty state" description="data: []" data={[]} />
          </div>
        </GalleryItem>

        <GalleryItem
          name="圓餅圖"
          exportName="PieChart"
          path="apps/app/src/components/generative-ui/charts/pie-chart.tsx"
          state="mounted"
          propsSummary="同 BarChart schema；兩欄圖例"
        >
          <PieChart {...PIE_CHART_FIXTURE} />
        </GalleryItem>

        <GalleryItem
          name="排程卡（human-in-the-loop）"
          exportName="MeetingTimePicker"
          path="apps/app/src/components/generative-ui/meeting-time-picker.tsx"
          state="mounted"
          propsSummary="{ status, respond?, reasonForScheduling?, meetingDuration?, timeSlots? }；只有 status=executing 才顯示時段按鈕"
        >
          <div className="gal-stack">
            <MeetingTimePicker status="executing" respond={(response) => toast(`respond(): ${response}`)} timeSlots={MEETING_SLOTS} {...MEETING_FIXTURE} />
            <MeetingTimePicker status="complete" title="（complete 狀態：只剩標題）" />
          </div>
        </GalleryItem>
      </div>
    </GallerySection>
  );
}
