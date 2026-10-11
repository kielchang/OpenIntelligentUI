export interface GallerySectionMeta {
  id: string;
  label: string;
  blurb: string;
}

/** 頁面區塊順序；導覽、頁內錨點與測試都以此為準 */
export const GALLERY_SECTIONS: GallerySectionMeta[] = [
  { id: "overview", label: "總覽與架構", blurb: "產品定位、請求流程、串流契約與 Jev 路由" },
  { id: "design-system", label: "設計系統", blurb: "沙箱用的 token、表單控制項與 SVG 類別" },
  { id: "color", label: "色彩學與配色", blurb: "色彩家族、OKLCH、WCAG 對比、圖表與警示色" },
  { id: "chat-shell", label: "聊天外殼", blurb: "正式畫面：標頭、CopilotChat、金鑰對話框、錯誤橫幅" },
  { id: "response", label: "回應內容元件", blurb: "工具狀態、計畫卡、A2UI 表格、圖表、排程卡" },
  { id: "generative", label: "生成式 UI 範例", blurb: "真實串流渲染器重播六欄位 payload" },
  { id: "unmounted", label: "已設計未掛載", blurb: "寫好但沒有任何入口的元件與樣式" },
  { id: "agent-defined", label: "代理端定義的 UI", blurb: "A2UI 登入卡、待辦型別、工具與渲染器對照" },
  { id: "findings", label: "解析發現", blurb: "程式碼層面的不一致與建議" },
];
