import { SEED_TEMPLATES } from "@/components/template-library/seed-templates";
import { splitLeadingStyle } from "../split-leading-style";
import type { GallerySample } from "./types";

interface SeedMeta {
  id: string;
  /** Jev 視覺化型別（visualization_router.py）中最接近的一種 */
  visualization: string;
  initialHeight: number;
  description: string;
}

/** 以 template-library 的 seed id 為鍵；範本本身的 html 不在這裡重複。 */
const SEED_META: Record<string, SeedMeta> = {
  "seed-weather-001": {
    id: "seed-weather",
    visualization: "static_diagram",
    initialHeight: 260,
    description:
      "專案內建範本 Weather（template-library/seed-templates.ts），原為 <style>+標記格式，這裡拆成 css／html 兩欄位。靜態資訊卡：城市、日期、溫度與三個細項，全部使用設計系統代幣。",
  },
  "seed-invoice-001": {
    id: "seed-invoice",
    visualization: "static_diagram",
    initialHeight: 330,
    description:
      "專案內建範本 Invoice Card（template-library/seed-templates.ts），原為 <style>+標記格式，這裡拆成 css／html 兩欄位。兩顆按鈕透過 Websandbox.connection.remote.sendPrompt 回傳提示，展示區提供替身橋接。",
  },
  "seed-dashboard-001": {
    id: "seed-dashboard",
    visualization: "bar_chart",
    initialHeight: 430,
    description:
      "專案內建範本 Dashboard（template-library/seed-templates.ts），原為 <style>+標記格式，這裡拆成 css／html 兩欄位。三張 KPI 卡加一組以 div 高度畫出的月營收長條。",
  },
};

/**
 * 把三個 seed 範本轉成渲染器契約：開頭的 <style> 區塊抽到 css，其餘標記留在 html。
 * 缺少對應中繼資料的 seed 不會進展示區，避免靜默產生沒有說明的範例。
 */
export const SEED_SAMPLES: GallerySample[] = SEED_TEMPLATES.flatMap((template) => {
  const meta = SEED_META[template.id];
  if (!meta) return [];
  const { css, html } = splitLeadingStyle(template.html);
  const sample: GallerySample = {
    id: meta.id,
    title: template.name,
    description: meta.description,
    provenance: "seed",
    visualization: meta.visualization,
    initialHeight: meta.initialHeight,
    css,
    html,
  };
  return [sample];
});
