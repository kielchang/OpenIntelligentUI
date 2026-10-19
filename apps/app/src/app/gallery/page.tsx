import type { Metadata } from "next";
import { UiGalleryPage } from "@/components/ui-gallery";

export const metadata: Metadata = {
  title: "UI 展示 — Open Intelligent UI",
  description:
    "把 Open Intelligent UI 專案裡設計過的每一個介面元件、設計系統、色彩系統與生成式 UI 範例攤開來操作與解析。",
  robots: { index: false, follow: false },
};

export default function GalleryPage() {
  return <UiGalleryPage />;
}
