import type { ReactNode } from "react";
import { GALLERY_SECTIONS } from "./section-list";

interface GallerySectionProps {
  id: string;
  children: ReactNode;
  /** 區塊導讀（可選，多段） */
  intro?: ReactNode;
}

/** 頁面區塊外框：編號、標題、簡介來自 section-list，導覽與錨點共用 */
export function GallerySection({ id, intro, children }: GallerySectionProps) {
  const index = GALLERY_SECTIONS.findIndex((section) => section.id === id);
  const meta = GALLERY_SECTIONS[index];
  return (
    <section id={id} className="gal-section" aria-labelledby={`${id}-title`}>
      <header className="gal-section-head">
        <span className="gal-section-index">{String(index + 1).padStart(2, "0")}</span>
        <div>
          <h2 id={`${id}-title`}>{meta?.label ?? id}</h2>
          {meta?.blurb && <p className="gal-section-blurb">{meta.blurb}</p>}
        </div>
      </header>
      {intro && <div className="gal-section-intro">{intro}</div>}
      {children}
    </section>
  );
}
