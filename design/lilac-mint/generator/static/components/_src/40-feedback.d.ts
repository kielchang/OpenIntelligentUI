/* ── 40 feedback：Alert、ErrorBanner、Toast、EmptyState、LoadingPlaceholder、Skeleton ───────── */
/* 純文件型別：描述消費者要寫的標記、class 與屬性；不編譯、不對應任何框架元件。 */

/** 語意色（Alert、Toast 共用） */
export type LmTone = "info" | "success" | "warning" | "danger";

/**
 * Alert — 頁內提示區塊。
 * 標記：`div.lm-alert.lm-alert--<tone>[.lm-alert--high][role]` > `svg[aria-hidden]`（16px 語意圖示）+
 * `div.lm-alert__body`（`strong.lm-alert__title` + `p.lm-alert__text` + 可選 `a.lm-alert__action`）+ 可選 `button.lm-alert__close[aria-label="關閉"]`。
 * `role`：danger 用 `alert`，其餘 `status`。
 */
export interface AlertProps {
  tone: LmTone;
  /** 高強度（實色底反白字）：只給 modal／critical；合規建議永遠低強度 info */
  high?: boolean;
  title: string;
  /** 內文；合規建議必須含「需法務確認」 */
  text: string;
  /** 可選動作連結（最多一個） */
  action?: { label: string; href: string };
  /** 是否渲染關閉鈕；modal 內的通常不給 */
  dismissible?: boolean;
}

/**
 * ErrorBanner — 聊天頁回答失敗的橫幅。
 * 標記：`div.lm-error-banner[role="alert"][aria-busy?]` > `svg.lm-error-banner__icon` + `p.lm-error-banner__msg` +
 * `span.lm-error-banner__actions`（`button.lm-error-banner__btn`「重試」+ `button.lm-error-banner__btn.lm-error-banner__btn--secondary`「開啟 API 金鑰設定」）。
 * busy：重試鈕內放 `span.lm-error-banner__spinner[aria-hidden]`、文字「重試中」、兩顆按鈕 `disabled`、重試鈕與容器 `aria-busy="true"`。
 */
export interface ErrorBannerProps {
  /** 錯誤訊息（一句，說明原因與可做的事） */
  message: string;
  /** 重試進行中 */
  busy?: boolean;
  /** 重試鈕文字；預設「重試」，busy 時「重試中」 */
  retryLabel?: string;
  /** 次要按鈕文字；預設「開啟 API 金鑰設定」；傳 `null` 不渲染 */
  secondaryLabel?: string | null;
}

/**
 * Toast — 短暫回饋（樣式在 00-base.css，行為在 bundle.js）。
 * 觸發：`LilacMint.toast(message, tone)` 或任何元素加 `data-lm-toast="訊息" data-lm-tone="<tone>"`。
 * 區域由 bundle.js 自建：`#lm-toast-region.lm-toast-region[role=status][aria-live=polite]`；
 * 文件展示可用 `.lm-toast-region.lm-toast-region--static` 靜態擺放 `.lm-toast.lm-toast--<tone>`。
 */
export interface ToastProps {
  /** 一句話，不超過一行；不放連結或按鈕 */
  message: string;
  tone?: LmTone;
  /** 固定 4000ms 自清、同時最多 3 則（bundle.js 決定，不可覆寫） */
  readonly durationMs?: 4000;
}

/**
 * EmptyState — 置中空狀態。
 * 標記：`div.lm-empty` > `svg.lm-empty__icon[aria-hidden]`（48px）+ `h2|h3.lm-empty__title` + `p.lm-empty__text` +
 * 可選 `div.lm-empty__actions`（`button.lm-empty__btn` 主要 + `a.lm-empty__link` 次要）。
 */
export interface EmptyStateProps {
  /** 情境：決定圖示與預設文案；`forbidden` 不渲染動作 */
  variant: "empty" | "filtered" | "forbidden";
  title: string;
  /** 說明：為什麼空 + 可以做什麼 */
  text: string;
  /** 主要動作（`empty`：新增草稿；`filtered`：清除篩選） */
  primary?: { label: string };
  /** 次要連結（例如「了解匯入流程」） */
  secondary?: { label: string; href: string };
  /** 標題層級，依頁面結構決定 */
  headingLevel?: 2 | 3;
}

/**
 * LoadingPlaceholder — 生成／讀取中的佔位框。
 * 標記：`div.lm-loading[.lm-loading--compact][role="status"][aria-busy="true"][aria-live="polite"]` >
 * `span.lm-loading__spinner[aria-hidden]` + `span.lm-loading__phrase[id]`；
 * 啟動輪播：`LilacMint.rotate(document.getElementById(id), phrases, 1800)`，尾端「...」由 CSS `::after` 加。
 */
export interface LoadingPlaceholderProps {
  /** 輪播短句；英文可直接用來源的 LOADING_PHRASES，中文用「正在…」句型 */
  phrases: string[];
  /** 輪播間隔，預設 1800ms */
  intervalMs?: number;
  /** `.lm-loading--compact`：高 50px；預設 120px */
  compact?: boolean;
}

/**
 * Skeleton — 載入骨架。
 * 色塊：`span.lm-skeleton[.lm-skeleton--heading|--circle][.lm-skeleton--long|--medium|--short]`；
 * 組合：`div.lm-skeleton-group`（直排）、`div.lm-skeleton-row`（頭像＋群組）、`div.lm-skeleton-table`（4 欄 grid，第一列用 `.lm-skeleton--head`）。
 * 容器 `aria-hidden="true"`，旁邊放 `span.lm-sr-only`「載入中」。
 */
export interface SkeletonProps {
  /** 形狀：`text`（標題 + 數行）、`avatar`（圓 + 兩行）、`table`（表頭 + N 列 × 4 欄） */
  shape: "text" | "avatar" | "table";
  /** `text` 的行數或 `table` 的列數；預設 3／4 */
  lines?: number;
  /** 螢幕閱讀器文字，預設「載入中」 */
  srLabel?: string;
}
