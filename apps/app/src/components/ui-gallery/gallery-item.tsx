import type { ReactNode } from "react";

export type GalleryItemState = "mounted" | "unmounted" | "agent" | "css";

const STATE_LABEL: Record<GalleryItemState, string> = {
  mounted: "已掛載",
  unmounted: "未掛載",
  agent: "代理端定義",
  css: "純 CSS",
};

export interface GalleryItemProps {
  /** 頁內深連結用的錨點 */
  id?: string;
  name: string;
  exportName?: string;
  path: string;
  state: GalleryItemState;
  propsSummary?: string;
  note?: ReactNode;
  /** demo 區塊的樣式變體 */
  demo?: "boxed" | "plain" | "center";
  wide?: boolean;
  children: ReactNode;
}

/** 每一個被展示的 UI 單元：名稱、export、檔案路徑、掛載狀態、props 摘要與 demo 槽 */
export function GalleryItem({
  id,
  name,
  exportName,
  path,
  state,
  propsSummary,
  note,
  demo = "boxed",
  wide = false,
  children,
}: GalleryItemProps) {
  return (
    <article id={id} className={`gal-item${wide ? " gal-item--wide" : ""}`} data-state={state}>
      <header className="gal-item-head">
        <h3>{name}</h3>
        <span className="gal-badge" data-state={state}>
          {STATE_LABEL[state]}
        </span>
      </header>
      <p className="gal-meta">
        {exportName && (
          <>
            <code>{exportName}</code>
            <span aria-hidden="true"> · </span>
          </>
        )}
        <span className="gal-path">{path}</span>
      </p>
      {propsSummary && <p className="gal-props">{propsSummary}</p>}
      <div className={`gal-demo gal-demo--${demo}`}>{children}</div>
      {note && <div className="gal-note">{note}</div>}
    </article>
  );
}
