"use client";

import "./gallery.css";
import { GalleryToastProvider } from "./gallery-toast";
import { GallerySandboxProvider } from "./gallery-sandbox";
import { GalleryNav, GalleryTopBar } from "./gallery-nav";
import { OverviewSection } from "./sections/overview-section";
import { DesignMethodSection } from "./sections/design-method-section";
import { DesignSystemSection } from "./sections/design-system-section";
import { ColorSection } from "./sections/color-section";
import { ChatShellSection } from "./sections/chat-shell-section";
import { ResponseComponentsSection } from "./sections/response-components-section";
import { GenerativeSection } from "./sections/generative-section";
import { UnmountedSection } from "./sections/unmounted-section";
import { AgentDefinedSection } from "./sections/agent-defined-section";
import { CatalogSection } from "./sections/catalog-section";
import { FindingsSection } from "./sections/findings-section";

/** /gallery 頁面本體：所有已設計的 UI 都在這裡攤開可操作 */
export function UiGalleryPage() {
  return (
    <GalleryToastProvider>
      <GallerySandboxProvider>
        <div className="gal-page">
          <GalleryTopBar />
          <div className="gal-layout">
            <GalleryNav />
            <main className="gal-main" id="gallery-main">
              <OverviewSection />
              <DesignMethodSection />
              <DesignSystemSection />
              <ColorSection />
              <ChatShellSection />
              <ResponseComponentsSection />
              <GenerativeSection />
              <UnmountedSection />
              <AgentDefinedSection />
              <CatalogSection />
              <FindingsSection />
            </main>
          </div>
        </div>
      </GallerySandboxProvider>
    </GalleryToastProvider>
  );
}
