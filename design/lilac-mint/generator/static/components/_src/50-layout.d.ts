/* ── 50 layout ── 純文件型別：描述每個元件的資料與行為，不編譯、不綁框架 */

/** 主題選項（AppHeader 的三顆 aria-pressed 按鈕） */
export type ThemeChoice = "light" | "dark" | "system";

/** AppHeader：模組頁頂端的應用標頭（純文字字標、模組名、導覽、環境徽章、使用者、主題切換） */
export interface AppHeaderProps {
  /** 模組名稱，顯示在字標「DOOPING」右側的分隔線後，例如「組織與人員」 */
  module: string;
  /** 字標的連結目的地；省略則為模組首頁 */
  homeHref?: string;
  /** 主導覽連結；current 為 true 的那一筆加 `aria-current="page"`（只能有一筆） */
  nav: Array<{ label: string; href: string; current?: boolean }>;
  /** 環境徽章文字（例如「測試環境」）；正式環境省略，不顯示徽章 */
  environment?: string;
  /** 使用者按鈕：顯示名與頭像縮寫（一個字） */
  user: { name: string; initial: string };
  /** 使用者按鈕按下（開選單） */
  onUserMenu?: () => void;
  /** 目前主題；對應的按鈕 `aria-pressed="true"` */
  theme: ThemeChoice;
  /** 主題切換 */
  onThemeChange?: (theme: ThemeChoice) => void;
}

/** Card：相關內容的表面容器 */
export interface CardProps {
  /** 外觀變體：default（預設）、compact（padding space-3、shadow-compact）、glass（只用在歡迎／品牌區） */
  variant?: "default" | "compact" | "glass";
  /** 給了 href 就輸出 `<a class="lm-card">`，整張卡是一個連結；不可再放其他可點元素 */
  href?: string;
  /** 標題（subheading 15/600）；有標頭分區時放在 `__header` */
  title?: string;
  /** 標題下的 meta（caption、text-secondary） */
  meta?: string;
  /** 標頭右側的動作（有則輸出 `lm-card--sectioned` 的 `__header`） */
  headerAction?: { label: string; onClick: () => void };
  /** 頁尾動作列（有則輸出 `__footer`）；primary 的那顆為 ink 按鈕 */
  footerActions?: Array<{ label: string; onClick: () => void; primary?: boolean }>;
  /** 內容 */
  children?: unknown;
}

/** Drawer：右側 420px 抽屜，看細節或編輯一筆 */
export interface DrawerProps {
  /** 容器 id；`data-lm-drawer-open="id"` 與 `LilacMint.drawer.open(id)` 用它 */
  id: string;
  /** 是否開啟（切 `.is-open` 與 `aria-hidden`） */
  open: boolean;
  /** 關閉要求（關閉鈕、遮罩、Esc）；呼叫端負責把焦點還給開啟按鈕 */
  onClose: () => void;
  /** 標題（`aria-labelledby` 的目標） */
  title: string;
  /** 副標（例如「ZZ-000123 · 在職」） */
  subtitle?: string;
  /** 頁尾動作列；primary 的那顆為 ink 按鈕 */
  actions?: Array<{ label: string; onClick: () => void; primary?: boolean; disabled?: boolean }>;
  /** 可捲動內容 */
  children?: unknown;
  /** 內嵌展示（static、固定高 260px）；只用於文件與預覽 */
  inline?: boolean;
}

/** Dialog：原生 `<dialog>` 的確認／短表單對話框 */
export interface DialogProps {
  /** `<dialog id>`；`data-lm-dialog-open="id"` 與 `LilacMint.dialog.open(id)` 用它 */
  id: string;
  /** 標題，要說明動作與對象（「取消草稿 D-0042？」） */
  title: string;
  /** 說明文字（text-secondary 13px）；可含 `<strong>` 強調 */
  description?: string;
  /** 破壞性動作：確認鈕改為 danger 高強度、標題旁顯示 danger 圖示、預設焦點放在取消 */
  destructive?: boolean;
  /** 取消鈕文字（ghost）；預設「取消」 */
  cancelLabel?: string;
  /** 確認鈕文字（ink 或 danger） */
  confirmLabel: string;
  /** 確認 */
  onConfirm: () => void;
  /** 取消或 Esc */
  onCancel?: () => void;
  /** 確認鈕停用（例如短表單尚未填完） */
  confirmDisabled?: boolean;
  /** 短表單內容（放在說明與動作列之間） */
  children?: unknown;
}

/** Tabs：底線式分頁 */
export interface TabsProps {
  /** tab 清單；id 用來產生 `aria-controls`／`aria-labelledby` */
  tabs: Array<{
    id: string;
    label: string;
    /** 計數 chip（只放切換前就該知道的數字） */
    count?: number;
    disabled?: boolean;
  }>;
  /** 目前選中的 tab id */
  selectedId: string;
  /** 切換（click 或鍵盤 ← → Home End） */
  onChange?: (id: string) => void;
  /** tablist 的 `aria-label`（這組分頁是什麼） */
  label: string;
  /** 每個 tab 的面板內容，以 tab id 為鍵 */
  panels: Record<string, unknown>;
}
