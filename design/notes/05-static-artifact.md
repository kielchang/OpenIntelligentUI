# 靜態重製版的設計與交付


當時產生器放在雲端暫存區；現在已搬進 `design/gallery-static/generator/`，輸出在 `design/gallery-static/dist/`，本機入口是 `dist/local.html`。

### Context

使用者要「用 Artifact 完整展示」。/gallery 目前只能在本機 `pnpm dev:app` 看；這裡要把它變成 claude.ai 上直接開得了的頁面。使用者選「靜態重製版」：不打包專案的 React／CopilotKit，另產一份自包含頁面，內容與 /gallery 的 11 個區塊一一對應，互動樣本改成純 iframe 重播，CopilotKit 與 A2UI 元件以複刻或截圖呈現。

Artifact 頁面契約（quickstart 已讀，重點）：
- 檔案是 fragment（不寫 doctype／html／head／body），`<title>` 放最前；多檔案用 `files` 一起發布，頁內可用相對路徑 fetch／iframe 自己的檔案。
- CSP：外部 script 只允許 cdnjs、cdn.jsdelivr.net/npm、unpkg、tailwind CDN、jquery；**esm.sh 被擋**；外部圖片、字型（Google Fonts 除外）、fetch 全擋，且 srcdoc／同源 iframe 會繼承。→ Chart.js、Three.js 樣本（esm.sh importmap）在 Artifact 裡只會看到各自的錯誤狀態；Leaflet 的 CSS fetch 與 USGS 圖磚也被擋。
- 主題三態：`data-theme="dark|light"` 或無屬性跟系統；token 先定義在 `:root`，深色在 `@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) }` 與 `:root[data-theme="dark"]` 各重定義一次；body 要有明確背景。
- 頁面 ≤ 16MB；單次發布 ≤ 255 檔、64MB；下載連結與 `window.print` 無效；手機寬度不得橫向捲動。

已確認可用：Node 22、esbuild 0.27（透過 vite 的 createRequire 可解析）、專案的內容模組都是純資料／純函式（`analysis-content.ts`、`design-method-content.ts`、`catalog-content.ts`、`a2ui-catalog-samples.ts`、`color/*.ts`、`design-tokens.ts`、`gallery-fixtures.ts`、`sample-payloads/*`、`split-leading-style.ts`），`@repo/design-system` 的 dist 存在。既有截圖仍在 scratchpad：`pw/shots`（56）、`pw/review`（62）、`pw/review-catalogs`（16），`flow.svg`（請求流程圖，1.9KB）也在。

## 作法：產生器 + 多檔案 Artifact

不動 repo。在 scratchpad 建 `artifact-gen/`：
- `generate.ts`：用 esbuild 打包（`absWorkingDir = apps/app`，`alias {"@": apps/app/src}`，platform node，format esm）後以 node 執行；匯入上面的內容模組與 `@repo/design-system`，**所有色彩數字在產生期用專案的純函式算出**（`parseThemeTokens`、`rgbToOklch`、`buildContrastMatrix`、`simulateCvd`、`sequential`／`diverging`、`evaluateCategorical`、`contrastRatio`、`passesWcag`），不手抄。
- 輸出 `dist/index.html`（fragment）與 `dist/assets/**`，再用 Artifact 工具發布：`file_path = dist/index.html`、`files = { "assets/...": ... }`、`icon: "gallery"`、`description` 一句。
- 產生器自帶一段 Playwright 驗證（沿用 scratchpad `pw/` 的 playwright-core + `/opt/pw-browsers/chromium-1194`）：用 `python3 -m http.server` 起 dist，開 index 與每個樣本頁收集 console／pageerror。

### 頁面骨架
- `<title>Open Intelligent UI Gallery</title>`；Google Fonts `<link>` 與 layout.tsx 相同（Plus Jakarta Sans、Spline Sans Mono，含 fallback stack）。
- `<style>`：token 從 `globals.css` 的 `:root` 與 `:root.dark` 兩段抽出，改寫成三態模式；`gallery.css` 整份帶入，產生器把 `:root.dark X` 改寫為 `:root[data-theme="dark"] X` 並複製一份到 `@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) X }`；另加 `body { background: var(--surface-primary); color: var(--text-primary) }`、16px 側邊 gutter、`padding-block`。
- 頂列：標題、主題切換（淺色／深色／跟隨系統 → 設定或移除 `html[data-theme]`，localStorage 包 try/catch）、「GitHub 分支」連結。左側 sticky 導覽（≤900px 改成頂部橫向 chips），IntersectionObserver 標示目前區塊；hash 深連結只用純 token（`#color`、`#item-…`）。
- 區塊卡片沿用 `.gal-item` 結構：名稱、export、路徑、狀態徽章（已掛載／未掛載／代理端定義／純 CSS，另加「複刻」「截圖」兩個徽章標示呈現方式）、demo 槽、註記。

### 11 個區塊（與 /gallery 一一對應）
1. **總覽與架構**：`flow.svg` 內嵌；RESPONSE_MODES、STREAM_FIELDS、JEV_ROUTES、STRIPPED_TOOLS、REPO_MAP 表格。
2. **設計方法**：DESIGN_LAYERS 三層規則表（demo 欄連到本頁對應錨點，產生器檢查每個錨點存在）、STREAM_PIPELINE、RENDER_STAGES（配 `review/03-stream-1/2/3.png` 三張截圖）、MCP_DIFF、VERDICT。
3. **設計系統**：`parseThemeTokens(THEME_CSS)` 色票（light／dark 並列，依群組）；`assets/design-system/light.html`、`dark.html` 以 `buildFrameDocument` 同邏輯產生（THEME＋SVG＋FORM CSS＋DESIGN_SYSTEM_MARKUP，dark 用 `forceDarkScheme`），`<iframe sandbox="">` 切換；globals.css 第二套 token 表。
4. **色彩學與配色**（8 小節照 color-section.tsx）：五個家族色票（hex＋OKLCH）、硬編碼統計表；色相環由產生器畫成 inline SVG（角＝hue、半徑＝chroma、點明度＝L，依家族描邊、圖例可勾選）；三層 token 對照、品牌色 vs 互動主色（算對比）；五張對比矩陣（light／dark 各算一次，pass／fail 徽章、比值兩位小數不四捨五入）；CHART_COLORS 的 CVD 條（原色／protan／deutan／tritan／灰階）與 Okabe-Ito 對照、相鄰 ΔE 最小值；BarChart 複刻 inline SVG、highlight+mute 示範；Sequential／Diverging 色階；九色階表；警示色兩種強度；60-30-10 配額條；建議清單（文字從 color-section.tsx 移植）。
5. **聊天外殼**：標頭複刻（chat.css 的 `.chat-header`）、錯誤橫幅複刻（error-banner.tsx 標記）；CopilotChat、金鑰對話框、主題切換用截圖（`shots/light-1280-chat-shell.png`、`dark-1280-chat-shell.png`、`light-390-chat-shell.png`、`review/06-keys-dialog.png`），並註明「真品需要 CopilotKit runtime」。
6. **回應內容元件**：Markdown 範例（靜態 HTML）、ToolReasoning ×4／PlanCard ×2 複刻、載入 placeholder 複刻（LOADING_PHRASES 輪播用 JS）、匯出選單複刻、A2UI 表格複刻（table-catalog 標記＋無效資料的 alert）、BarChart／PieChart 以 fixture 畫 inline SVG、排程卡兩態複刻；附 `review/01-section-response.png` 對照。
7. **生成式 UI 範例**（核心）：11 個樣本各一張卡，`assets/samples/<id>.html` 由 `assembleStandaloneHtmlFromActivity` 同邏輯產生（importmap、TRIP_ANIMATOR、三段 design-system CSS、css、html、jsFunctions＋jsExpressions 的 async IIFE、Websandbox stub 改成在框內顯示「模擬送出：<文字>」的狀態列），卡內 `<iframe sandbox="allow-scripts" loading="lazy">`；「重播串流」按鈕做三階段：placeholder 文字 → srcdoc 只有 css＋html → 換成完整頁；原始碼分頁 css／html／jsFunctions／jsExpressions；`needsNetwork` 徽章並註明 Artifact CSP 會擋 esm.sh／USGS，這些樣本只看得到各自的錯誤狀態（附本機截圖 `review/04-sample-*.png` 當對照）。
8. **已設計未掛載**：DemoGallery、CategoryFilter／DemoCard、TemplateCard ×5、TemplateChip、QrModal、DesktopTipModal、ExplainerCards 以靜態複刻＋截圖（`review/06-demo-drawer.png`、`06-qr-modal.png`、`06-template-chip*.png`）；CSS-only 樣式由產生器從 globals.css 以選擇器抽出原始規則（`.abstract-bg`、`.blob-*`、`.glass*`、`.brand-glass-container`、`.text-gradient`、`.border-gradient`、`.branded-header-*`、`.cta-banner`）真實套用；/pick 與 OG 圖用截圖（`shots/light-390-unmounted.png` 區域、`review/01-section-unmounted.png`）。
9. **代理端定義的 UI**：登入卡複刻（LoginReplica 標記移植）＋ `review/06-a2ui-live.png`；待辦卡複刻（可切換完成、編輯標題，純 JS）；AGENT_TOOLS 表。
10. **材料集合**：COLLECTIONS 索引表；A2UI 三個 surface 用截圖（`review-catalogs/02、03、12`）＋元件／旋鈕表＋ `<details>` 內附 surface JSON；函式表、icon chips、0.8／0.9 對照、沙箱材料、技能、Controlled 表。
11. **解析發現**：FINDINGS 卡片。

### 截圖子集（放 `assets/shots/`，≤ 30MB）
只放靜態無法重現的畫面：聊天外殼 3 張、金鑰對話框、回應區塊、串流三階段、A2UI live 4 張、抽屜／QR／chip 4 張、11 個樣本在本機的完成態（`review/04-sample-*`）、深色與手機各 3 張。不放全頁截圖。

## 驗證
1. 產生器輸出報告：檔案數、各檔大小、index.html 大小 < 16MB、總量 < 64MB、無 `<html>`／`<body>` 標籤、所有 `href="#…"` 與 nav 錨點都存在、所有 `assets/` 引用都存在。
2. Playwright 對 `http.server` 開 index（1280 淺色、深色屬性、390 寬）：零 pageerror；開每個樣本頁：非 CDN 樣本零錯誤且可操作（帳單分攤輸入後結果更新）；CDN 樣本顯示自己的錯誤狀態；切換主題後 body 背景變化；390 寬無橫向捲動（`document.documentElement.scrollWidth <= innerWidth`）。
3. 發布 Artifact，回報連結；完成訊息明列哪些是真品（iframe 樣本、設計系統框、色彩計算）、哪些是複刻、哪些是截圖，以及 CSP 擋掉的樣本。

---


## 交付結果

靜態重製版已發布：**https://claude.ai/artifact/95z4dFNaPvAhnVC5qPaGMn**

這是 /gallery 的完整重製，不載入 React 與 CopilotKit，直接在 claude.ai 開就能看。目前為私人連結，要給別人看需從頁面的 Share 選單分享。

**頁面內容**：11 個區塊與 /gallery 一一對應，含頂列主題切換（淺色／深色／跟隨系統）、左側導覽與頁內深連結。每張卡片右上角有標籤說明它在這裡是真品、複刻、截圖還是產生期計算。

| 呈現方式 | 內容 |
|---|---|
| 真品 | 11 個生成式樣本各組成獨立 HTML 在 sandbox iframe 裡執行，有「重播串流」三階段與「直接顯示完成版」，沙箱內的送出按鈕會顯示「模擬送出」；設計系統表單控制項與 SVG 類別的淺色／深色 iframe；主題切換 |
| 產生期計算 | 設計系統 token 色票、色彩區的全部數字（OKLCH、十張對比矩陣、CVD 模擬、色階生成、ΔE）、A2UI 目錄表、工具表，全部用專案的純函式從原始碼算出 |
| 複刻 | 聊天標頭與錯誤橫幅（用 chat.css 真實規則）、Markdown 回答、工具狀態、規劃卡、載入 placeholder、匯出選單、A2UI 表格、長條圖與圓餅圖、排程卡（可點選）、示範卡、範本卡、QR 狀態列、手機提示、說明卡、CSS-only 樣式（globals.css 真實規則）、投票頁、OG 圖、登入卡、待辦卡（可編輯） |
| 截圖 | CopilotChat 歡迎畫面、金鑰對話框、抽屜、QR 視窗、範本 chip、A2UI 三個 surface 的 basicCatalog 實渲染與 Modal、串流三階段、CDN 樣本在本機的完成態 |

**Artifact 的 CSP 造成的差異**：Chart.js 與 3D 飛機樣本用的 esm.sh、海岸地圖的 USGS 圖磚與 Leaflet 的 CSS fetch 都會被擋，這三個樣本只會顯示自己的錯誤狀態，卡片上有說明並附本機完成態截圖；其餘八個樣本正常執行。

**驗證**：產生器報告 44 個附檔共 2.5 MB、index 0.6 MB，無文件層級標籤，所有頁內錨點與資產引用都存在；Playwright 在 1280 淺色與深色、390 手機皆零 console 與 page error，無橫向捲動，重播流程、帳單分攤 iframe 輸入、模擬送出、toast、主題切換都實測通過。

產生器放在 session 的 scratchpad，沒有動到 repo；若要收進專案當作 `gallery:static` 指令，我可以另外提交。