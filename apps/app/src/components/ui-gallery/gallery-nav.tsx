"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useTheme } from "@/hooks/use-theme";
import { GALLERY_SECTIONS } from "./section-list";

const THEMES = [
  { value: "light", label: "淺色" },
  { value: "dark", label: "深色" },
  { value: "system", label: "跟隨系統" },
] as const;

export function GalleryTopBar() {
  const { theme, setTheme } = useTheme();
  return (
    <header className="gal-topbar">
      <div className="gal-topbar-inner">
        <div className="gal-topbar-title">
          <span className="gal-topbar-kicker">Open Intelligent UI</span>
          <span>UI 展示與專案解析</span>
        </div>
        <div className="gal-topbar-actions">
          <div className="gal-seg" role="group" aria-label="主題">
            {THEMES.map((item) => (
              <button
                key={item.value}
                type="button"
                aria-pressed={theme === item.value}
                onClick={() => setTheme(item.value)}
              >
                {item.label}
              </button>
            ))}
          </div>
          <Link className="gal-btn" href="/">
            回到聊天
          </Link>
        </div>
      </div>
    </header>
  );
}

/** 左側錨點導覽；以 IntersectionObserver 標示目前捲到的區塊 */
export function GalleryNav() {
  const [active, setActive] = useState(GALLERY_SECTIONS[0]?.id ?? "");

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    const headings = GALLERY_SECTIONS.map((section) =>
      document.getElementById(section.id),
    ).filter((element): element is HTMLElement => element !== null);
    if (headings.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-20% 0px -70% 0px", threshold: 0 },
    );
    headings.forEach((heading) => observer.observe(heading));
    return () => observer.disconnect();
  }, []);

  return (
    <nav className="gal-nav" aria-label="區塊導覽">
      <ol>
        {GALLERY_SECTIONS.map((section, index) => (
          <li key={section.id}>
            <a href={`#${section.id}`} className={active === section.id ? "is-active" : undefined}>
              <span className="gal-nav-index">{index + 1}</span>
              <span>{section.label}</span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
