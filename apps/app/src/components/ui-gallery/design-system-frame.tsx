"use client";

import { FORM_STYLES_CSS, SVG_CLASSES_CSS, THEME_CSS } from "@repo/design-system";
import { forceDarkScheme } from "./design-tokens";

export type FrameMode = "light" | "dark";

/** 與正式沙箱相同的樣式組合；深色用字串展開 media 區塊，不依賴作業系統偏好 */
export function buildFrameDocument(markup: string, mode: FrameMode, extraCss = ""): string {
  const theme = mode === "dark" ? forceDarkScheme(THEME_CSS) : THEME_CSS;
  const svg = mode === "dark" ? forceDarkScheme(SVG_CLASSES_CSS) : SVG_CLASSES_CSS;
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<style>${theme}\n${svg}\n${FORM_STYLES_CSS}</style>
<style>html { background: var(--color-background-primary); } body { padding: 16px; } #content > * { animation: none; opacity: 1; }${extraCss}</style>
</head><body><div id="content">${markup}</div></body></html>`;
}

interface DesignSystemFrameProps {
  markup: string;
  mode: FrameMode;
  title: string;
  height?: number;
  extraCss?: string;
}

/** 靜態標記的沙箱預覽；沒有腳本，所以 sandbox 不開放任何權限 */
export function DesignSystemFrame({ markup, mode, title, height = 420, extraCss }: DesignSystemFrameProps) {
  return (
    <iframe
      className="gal-frame"
      title={title}
      sandbox=""
      srcDoc={buildFrameDocument(markup, mode, extraCss)}
      style={{ height }}
    />
  );
}
