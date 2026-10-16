# /gallery 的盤點與設計

這份是建 `/gallery` 前的探索結論與設計，包含色彩盤點、各區塊內容、重用的程式、守衛與驗證方式。實作見 `apps/app/src/components/ui-gallery/`。


### Context

使用者要「深度解析這個專案，把裡面設計的 UI 展開來展示，讓我可以直接在網頁操作、一目了然所有 UI」，並選擇以**專案內新增 `/gallery` 路由**交付，推到分支 `claude/serene-shannon-z0fh1s`。

探索結論：
- 正式畫面只有一頁聊天（`apps/app/src/app/page.tsx`）。約三分之二已設計的元件**沒有掛載**：`DemoGallery`、`CategoryFilter`、`DemoCard`、`TemplateLibrary`、`TemplateCard`、`TemplateChip`、`QrModal`、`QrButton`、`DesktopTipModal`、`ExplainerCards`、`ExampleLayout`；`/pick` 頁與 OG image 路由存在但無入口。
- 沒有 Storybook／Playwright／gallery；`.chalk/plans/demo-gallery.md` 的 gallery 計畫從未實作。
- 視覺語言分兩套：沙箱用 `packages/design-system/src/index.ts`（`THEME_CSS`、`SVG_CLASSES_CSS`、`FORM_STYLES_*`，深色靠 `prefers-color-scheme`）；app 用 `globals.css`（lilac/mint 品牌 token、`--surface-*`、glass、CTA，深色靠 `:root.dark`）。
- 可直接渲染的生成式 UI 樣本只有：3 份 seed template（`template-library/seed-templates.ts`）、svg-diagrams 技能的三步流程 SVG（`apps/agent/skills/svg-diagrams/SKILL.md` L223-265）、`form.py` 的 A2UI 登入卡。launch film 的 3D 飛機、帳單分攤、海岸地圖**沒有輸出留在 repo**，只有 prompt（`demo-gallery/demo-data.ts`）。
- 真實串流渲染器 `OpenGenUIActivityRenderer` 不需代理即可驅動：包在 `SandboxFunctionsContext.Provider`，依序餵 `OpenGenUIContent`（作法見 `open-generative-ui/__tests__/open-generative-ui-renderer.test.tsx` L89-102）。
- 建置時的雲端環境阻擋 esm.sh／jsdelivr（403），npm registry 可達。依 CDN 的樣本（Three.js、Leaflet、Chart.js）在這裡只能驗證「載入失敗的可見 fallback」；實際載入要在使用者本機看。
- A2UI：`form.py` 輸出 0.8 風格 `surfaceUpdate/beginRendering` 巢狀物件；app 用的 `@copilotkit/a2ui-renderer` 走 0.9 的 `createSurface/updateComponents` 扁平格式，且 app 目錄只註冊 `Table` → 登入卡以靜態複刻呈現並註明。

使用者補充：要涵蓋**色彩學、圖表配色、系統配色等色彩應用**。採用 color-system-advisor 技能的方法論（三層 token、OKLCH 定位與衍生、WCAG 2.2 AA 嚴格門檻、警示色雙強度、圖表色與 UI 色分家、60-30-10 配額），做成獨立的「色彩學與配色」區塊，所有數值在頁面 runtime 由純函式計算，不手抄。

色彩盤點（實際來源）：
- design-system `THEME_CSS`：background／text／border × primary/secondary/tertiary + info/danger/success/warning，light 與 dark 兩套（dark 是重新生成：bg `#1a1a18` 帶暖調，非反轉）。
- `SVG_CLASSES_CSS` 九色階（purple/teal/coral/pink/gray/blue/green/amber/red），每階 fill/stroke/text 三值 × light/dark；與 `svg-diagrams/SKILL.md` 表格一致。
- app `globals.css`：品牌 lilac `#BEC2FF`/`#9599CC`、mint `#85E0CE`/`#1B936F`、`--surface-*`、`--text-*`（Tailwind 灰 `#374151/#6b7280/#9ca3af`）、`--border-*`、glass、chart tooltip/axis、`:root.dark` 整套；並與 design-system 重名的 `--color-text-primary` 定義衝突（`#010507` vs `#1a1a1a`）。
- `charts/config.ts` `CHART_COLORS` 七色（Tailwind 500 系：blue/purple/pink/amber/emerald/cyan/orange），在 `template-card.tsx` 與 `export-utils.ts` 各複製一份；用法 `index % length` 循環。
- 散落硬編碼：`#189370` focus ring／OG、`#ffac4d` 錯誤橫幅、`#e6a817`/`#1b936f` QR 狀態、indigo/emerald 漸層 `#6366f1`/`#10b981`（TemplateCard、TemplateChip、CategoryFilter fallback）、`DemoCard` CATEGORY_COLORS 五個 rgba、seed dashboard 漸層、pick 頁深色漸層、MeetingTimePicker/PlanCard/ToolReasoning 的 Tailwind gray/blue/green class。非測試檔共 369 處 hex/rgba 字面（19 檔；`lib/a2ui-theme.css` 112 處且未引用，`globals.css` 115 處）。

假設：頁面說明文字用繁體中文；產品名、元件名、識別字、既有英文 UI 字串維持英文。實作圖表示範前先載入 `dataviz` 技能。

### 新增檔案

```
apps/app/src/app/gallery/page.tsx                 server component：export metadata（title、robots noindex），回傳 <UiGalleryPage/>
apps/app/src/components/chat/error-banner.tsx     NEW：ChatErrorBanner({message,busy,onRetry,onOpenKeys})，從 page.tsx 抽出的 .chat-error 原樣 markup
apps/app/src/components/ui-gallery/
  index.tsx                 "use client" UiGalleryPage：Toast provider > Sandbox stub provider > 頂列 + 左側導覽 + 9 個 section（總覽、設計系統、色彩學與配色、聊天外殼、回應內容元件、生成式 UI 範例、已設計未掛載、代理端定義的 UI、解析發現）
  gallery.css               所有 .gal-* 樣式；只用 globals.css 既有 token（--surface-*、--text-*、--border-default、--radius-*、--shadow-card、--color-lilac-dark、--color-mint-dark、--font-family）
  gallery-nav.tsx           頂列（標題「UI 展示」、主題切換 light/dark/system、<Link href="/">回到聊天</Link>）+ sticky 錨點導覽（IntersectionObserver 標示目前區塊）
  gallery-item.tsx          GalleryItem({name, exportName, path, state: "mounted"|"unmounted"|"agent"|"css", propsSummary?, note?, children})：卡片、徽章、<code>export、路徑、demo 槽
  gallery-toast.tsx         GalleryToastProvider / useGalleryToast：固定底部 role="status" aria-live，4 秒自清（timer 內 setState）
  gallery-sandbox.tsx       GallerySandboxProvider：SandboxFunctionsContext.Provider value=[stub sendPrompt → toast, openLinkFunction]；另加 window capture-phase 監聽 SEND_PROMPT_EVENT 先 claim+resolve，保證不打到代理
  split-leading-style.ts    splitLeadingStyle(html) → {css, html}（抽掉開頭 <style>…</style>）
  chunk-html.ts             chunkHtml(html, n)：以標籤邊界切段
  design-tokens.ts          parseThemeTokens(THEME_CSS) → light/dark token 表；forceDarkScheme(css)：把 @media dark 區塊展開成無條件規則（純字串運算，不得出現 token 定義字面）
  design-system-frame.tsx   <iframe sandbox srcDoc> 注入 THEME+SVG+FORM css + 示範 markup，light/dark 切換
  streaming-replay.ts       useStreamingReplay(sample)：{content, stage, runId, start, finish, replay}；所有 setState 都在 setTimeout callback 內；timers 用 ref 管理、unmount 清除
  generative-sample.tsx     海報態（標題、說明、來源徽章、「開始串流重播」「直接顯示完成版」）→ 真實 OpenGenUIActivityRenderer key={runId} + ReplayControls + SourceTabs + 下載 HTML
  replay-controls.tsx       播放／立即完成／重播 + 六欄位階段指示條
  source-tabs.tsx           css / html / jsFunctions / jsExpressions 分頁（<pre><code>）
  gallery-fixtures.ts       所有已掛載元件的 props fixture（PLAN_FIXTURE、QUARTERLY_SALES_TABLE、INVALID_TABLE、BAR/PIE_CHART_FIXTURE、MEETING_FIXTURE、TOOL_REASONING_FIXTURES、MARKDOWN_SAMPLE、TODO_FIXTURES、PICK_PROMPTS 複製自 pick/page.tsx 並註明）
  analysis-content.ts       靜態表：RESPONSE_MODES、STREAM_FIELDS（六欄位 × 渲染階段）、JEV_ROUTES（13 型別 → renderer、被剔除的工具）、REPO_MAP、TOOLS、FINDINGS
  color/
    color-math.ts           純函式：parseColor(hex/rgb/rgba) → sRGB；sRGB↔linear；→ OKLab → OKLCH {l,c,h}；relativeLuminance；contrastRatio(fg,bg)（WCAG 2.x，不四捨五入）；wcagLevel(ratio,{text:"normal"|"large"|"ui"})；alpha 合成 composite(fg,bg)；simulateCvd(rgb,"protan"|"deutan"|"tritan")（Machado 2009 severity 1.0 線性 RGB 矩陣）；toGrayscale；deltaEOk（OKLab 歐氏距離）
    color-inventory.ts      ColorFamily[]：{id, name, source(path), role, usage[], swatches:[{token/name, light, dark?, note?}]}；design-system 兩組用 regex 從 THEME_CSS / SVG_CLASSES_CSS 解析；CHART_COLORS 直接 import；globals.css 與散落硬編碼為靜態清單（有測試對照原始檔）
    palette-generation.ts   OKLCH 生成：sequential(baseHex, steps)（固定 hue、L 由 0.95→0.35、chroma 拋物線收斂）；diverging(leftHex, rightHex, steps)（中性中點 L 0.95 C 0.01，兩極 L 對稱）；categoricalFromBrand（示範，不替換 CHART_COLORS）；clampToSrgb（gamut 內縮）；toHex
    contrast-matrix.ts      buildContrastMatrix(family, mode) → 文字×背景格子，含 ratio、等級、需求門檻（正文 4.5／大字 3／非文字 3）
    cvd-palette.ts          evaluateCategorical(hexes)：相鄰與兩兩 deltaEOk 最小值、亮度差、三種 CVD 模擬後最小距離、灰階單調性；對照 OKABE_ITO 八色常數
  color-components/
    swatch.tsx              色票（hex、OKLCH 三值、可選 dark 值）
    hue-wheel.tsx           inline SVG 極座標圖：角度 = hue、半徑 = chroma、點明度 = L；依家族描邊；hover 顯示名稱與座標
    contrast-grid.tsx       對比矩陣表格（pass/fail 徽章、light/dark 切換）
    cvd-strip.tsx           色盤條：原色／protan／deutan／tritan／灰階五列
    palette-preview.tsx     inline SVG 小圖：分類長條、sequential 熱力條、diverging 偏差條、highlight+mute 示範
    alert-tiers.tsx         四種語意 × low-contrast（現有 token）／high-contrast（由 text 色當底、反白字，示範）
    budget-bar.tsx          60-30-10 配額示意條
  sample-payloads/
    types.ts                GallerySample {id,title,description,provenance:"seed"|"skill"|"reconstructed",prompt?,initialHeight,css,html,jsFunctions?,jsExpressions?,needsNetwork?}；toContent(sample) → 完成態 OpenGenUIContent
    index.ts                SAMPLE_PAYLOADS（必做在前）
    seed-templates.ts       3 份 seed 經 splitLeadingStyle 轉成 css+html
    svg-three-step-flow.ts  SKILL.md L223-265 原文
    bill-splitter.ts        重建：subtotal/tip/people 驗證、分攤到分且總和精確、「請代理說明這個分攤」follow-up 按鈕（disable→await sendPrompt→catch→finally）
    weekend-compare.ts      重建：海岸/城市/山區三方案、預算與車程權重滑桿、即時重算推薦、標示 illustrative estimates
    monty-hall.ts           重建：stay vs switch 多次試驗，模擬值與理論值分開標示、試驗數驗證
    bicycle-gears.ts        重建：前後齒數滑桿 → 踏板/輪轉比，互動 SVG（.c-teal/.c-gray），reduced-motion
    chartjs-bar.ts          重建：方案比較 → 每席成本長條圖，`await import("chart.js/auto")`、#status 錯誤路徑、文字表格替代
    airplane-3d.ts          stretch：Three.js 經 importmap、三軸滑桿+示範按鈕+Reset、拖曳軌道、reduced-motion、WebGL 失敗訊息；needsNetwork ["esm.sh"]
    coastal-trip.ts         stretch：Leaflet 1.9.4（script + fetch css 內嵌）+ USGS tiles + 5 個 L.divIcon 編號釘 + window.createTripAnimator + Pause/Replay + 可點站卡（無照片）；needsNetwork ["jsdelivr","usgs"]
  sections/
    overview-section.tsx            總覽與架構
    design-system-section.tsx       設計系統
    color-section.tsx               色彩學與配色（新增）
    chat-shell-section.tsx          聊天外殼
    response-components-section.tsx 回應內容元件
    generative-section.tsx          生成式 UI 範例
    unmounted-section.tsx           已設計未掛載
    agent-defined-section.tsx       代理端定義的 UI
    findings-section.tsx            解析發現
  __tests__/
    sample-payloads.test.ts   每筆 toContent 通過 OpenGenUIContentSchema；html 不含 <style/<script；css 不含 token 定義字面（needle 用 join 組）；jsFunctions 與每條 jsExpression 可被 new Function 解析（頂層 await/import 會丟錯）；id 唯一；initialHeight 50–4000；reconstructed 的 description 含重建標示
    streaming-replay.test.ts  renderHook + fake timers：階段順序 placeholder→css→html 段數遞增→htmlComplete→jsFunctions→expressions 遞增→generating:false；finish() 等於 toContent；replay() runId+1 且 unmount 後無 timer
    split-leading-style.test.ts、design-tokens.test.ts
    color-math.test.ts        已知值：#fff/#000 = 21:1；#1a1a1a on #fff ≈ 16.7；#ffffff OKLCH L=1；#ff0000 hue ≈ 29°；rgba 合成；4.49 判定不達 4.5；CVD 矩陣對純紅/純綠模擬後距離明顯縮小；灰階單調
    color-inventory.test.ts   THEME_CSS 解析出 light/dark 各 21 個色 token、SVG 九色階各 3 值 × 2 模式；globals.css 靜態清單用 node:fs 讀原檔 regex 對照（名稱與值一致）；散落硬編碼清單裡每個值都能在對應檔案找到
    palette-generation.test.ts sequential L 嚴格遞減、所有輸出在 sRGB 內、hue 偏差 < 2°；diverging 兩極 L 對稱、中點為中性；contrast-matrix 對 design-system light 的 text-primary/background-primary 為 pass
    gallery-page.test.tsx     mock @copilotkit/react-core/v2 與 renderer（比照 shared-thread.test.tsx / renderer test），render <ThemeProvider><ProviderKeysProvider><UiGalleryPage/></…>；斷言 9 個區塊標題與導覽、四種徽章、stub provider 會吞掉 dispatch 的 SEND_PROMPT_EVENT
```

### 修改檔案（最小）

- `apps/app/src/app/page.tsx`：改用 `<ChatErrorBanner/>`（純搬移，不改行為）。
- `apps/app/src/components/explainer-cards.tsx`：內部 `ExplainerCards` 加 `export`。
- `README.md` Development 段加一行 `/gallery` 說明。
- 不碰 `providers.tsx`、`layout.tsx`、design-system、agent、CI。

### 區塊內容

### a. 總覽與架構（靜態）
- 繁中導讀：產品定位（answers you can interact with）、Understand／Compare／Make a tool。
- 請求流程 inline SVG（viewBox 680 寬）：使用者 → CopilotChat → `/api/copilotkit` → LangGraphHttpAgent/FastAPI → Jev 路由 → 模型+工具+技能 → text / A2UI Table / generateSandboxedUi → activity stream → 瀏覽器渲染器。用 app token（`var(--surface-primary)`、`var(--border-default)`、`currentColor`、`var(--color-mint-dark)`）。
- 表格：三種回應模式；六欄位串流契約 × 渲染階段（placeholder → cssComplete 才顯示 → 串流預覽 iframe + Idiomorph morph → htmlComplete 建最終 Websandbox → jsFunctions 注入一次 → jsExpressions 依序 await → generating:false 顯示 ExportOverlay；`placeholderMessages` 不在本地 schema，渲染器顯示 `LOADING_PHRASES`）；Jev 13 型別 → renderer；repo 地圖。

### b. 設計系統
- `parseThemeTokens` 色票（light／dark 並列，依 background/text/border/font/radius 分組）。
- `DesignSystemFrame`：sandbox iframe srcDoc = THEME + SVG + FORM css + 示範 markup（button、text/number/email/search input、textarea、select、range、checkbox/radio、link、info/danger/success/warning 徽章、九個 `.c-*` 色階、`.box .node .arr .leader`、`.t .ts .th`）。深色用 `forceDarkScheme` 轉換後注入；註明「實際沙箱只跟隨作業系統色彩偏好」。
- 並列 app 端第二套 token（globals.css），標註兩套並存。

### b2. 色彩學與配色（新增，核心之一）
所有數字由 `color/*` 純函式於 runtime 計算，頁面不手抄數值；light/dark 切換影響整區。

1. **色彩家族盤點**：五個家族（design-system 語意 token、SVG 九色階、app 品牌 lilac/mint + Tailwind 灰階、CHART_COLORS、散落硬編碼）各一張卡：來源路徑、角色、使用處、色票（hex + OKLCH L/C/H），light/dark 並列。附硬編碼統計表（檔案 × 筆數，由 `color-inventory.test.ts` 對照原檔）。
2. **色相環／OKLCH 散佈**（`hue-wheel.tsx`）：把全部色票打在極座標（角 = hue、半徑 = chroma、點明度 = L），依家族描邊、可勾選家族。一眼看出：lilac ≈ 290°、mint ≈ 165°、design-system info 藍 ≈ 255°、CHART blue ≈ 262°、purple ≈ 293°… 三套系統色相彼此不對齊；中性色是否帶主色調（design-system 灰偏暖 vs Tailwind 灰偏冷藍）。
3. **系統配色診斷（token 架構）**：三層對照表——現況：design-system 只有 semantic 層（角色命名，正確）無 primitive；app globals.css 混用外觀命名（`--color-lilac`、`--surface-*`）與角色命名；`--color-text-primary` 兩套定義衝突；深色模式兩條機制（media query vs `.dark`）。表面層級：design-system 3 層 background、app 4 層 surface；深色是否「重生成而非反轉」（是：`#1a1a18` 帶暖調、dark 的 text-info `#85B7EB` 比 light `#185FA5` 亮且降 chroma——由計算顯示 L/C 差）。品牌色 vs 互動主色：`--copilot-kit-primary-color` 直接用 `--color-lilac-dark`（計算其對白底對比、是否可作文字/圖示色）。
4. **對比驗收矩陣（WCAG 2.2 AA，嚴格閾值）**（`contrast-grid.tsx`）：
   - design-system：text {primary,secondary,tertiary} × background {primary,secondary,tertiary}，light 與 dark 各一張；semantic text on semantic bg（info/danger/success/warning）；semantic border on background（非文字 3:1）。
   - app：`--text-*` × `--surface-*`（dark 的 surface 是半透明 rgba → 先與 `--background` 合成再算）；`--copilot-kit-primary-color`、`#189370` focus ring、`#ffac4d` 邊框對 surface 的非文字 3:1；`.cta-btn--primary` 白字對 lilac-dark/mint-dark 漸層兩端。
   - CHART_COLORS 七色對 light/dark 背景（非文字 3:1）與彼此相鄰對比。
   - 每格顯示 ratio（兩位小數，不四捨五入判定）、所需門檻、pass/fail；表頭說明 1.4.3 / 1.4.11。
5. **圖表配色**（`cvd-strip.tsx`、`palette-preview.tsx`）：
   - CHART_COLORS 分析：色相間距、L 分佈、兩兩 deltaEOk 最小值、protan/deutan/tritan 模擬後最小距離、灰階單調性；與 Okabe-Ito 八色同欄對照。指出：`index % length` 循環 → 第 8 類與第 1 類同色（違反「固定順序永不循環」）、紅/橙與 danger 語意可能衝突、同一色盤在三處複製（config.ts / template-card.tsx / export-utils.ts）。
   - 真實 `BarChart`（CHART_COLORS）與 inline SVG 複刻（建議色盤）並排；highlight+mute 示範（1 色飽和其餘灰）。
   - Sequential：以 mint-dark `#1B936F` 為 hue 用 `sequential()` 生 7 階熱力條；Diverging：lilac-dark ↔ mint-dark 經中性中點生 7 階；都附 OKLCH 參數與「連續數值不套分類色盤」說明。
   - 色盲安全/危險配對檢查表（藍+橙安全；紅+綠、綠+棕、藍+紫危險）對照專案色盤實際組合。
6. **警示／狀態色**（`alert-tiers.tsx`）：design-system info/danger/success/warning 的 bg+text+border 正是 Carbon low-contrast tint 結構（示範卡：tint 底、左 5px 邊框、icon、同色系深字）；缺 high-contrast 層 → 以 text 色為底、白字示範並算對比；`.chat-error` 用獨立 `#ffac4d` 不走 token、QrModal 狀態色硬編碼；語意 hue 是否落在慣例範圍（紅 ~25°、綠 ~140°、橙 ~70°、藍 ~250° ±15°）由計算標示；三重編碼檢查（DataTable alert 只有文字、MeetingTimePicker 用 emoji、QrModal 有點+文字）。
7. **60-30-10 配額**（`budget-bar.tsx`）：以首頁與 seed dashboard 為例估算中性/結構/強調比例示意；說明 lilac/mint 漸層 CTA、CategoryFilter 作用態、TemplateCard Apply、chart 共用同一份 10% 預算；toast 4 秒自清、banner 同時一個。
8. **色彩建議清單**（具體數字由 runtime 算出並顯示）：拆 `--brand`/`--primary`；中性色改帶主色調灰（給 OKLCH 目標 C≈0.01–0.02）；統一一套 semantic 命名並刪除 globals.css 與 design-system 的重名衝突；CHART_COLORS 改為 `--chart-1..7` token、固定順序、超過改 highlight+mute；警示色補 high-contrast 層；硬編碼色改 token（列出 369 處分佈）；a2ui-theme.css 未引用可刪或接入；CI 加 token 對比檢查與 raw hex lint。每條附取捨。

### c. 聊天外殼
- Header 複刻（同 class `.chat-header .chat-name .chat-brand`；New chat／API keys 綁 `useProviderKeys`，`agent.isRunning` 來自 `useAgent`），包在 `.gal-chat-shell`（固定高 640px、flex column）讓 `.chat-main/.chat-content` 規則生效。
- 真實 `<CopilotChat>`，props 與 HomePage 完全相同（`KeyGatedChatView`、`ReaderScrollView`、`AnswerMarkdown`、labels）；在本區塊呼叫 `useExampleSuggestions()` 讓四顆建議 pill 出現；不呼叫 `useGenerativeUIExamples()`。本頁也渲染 `{keysOpen && <ProviderKeysDialog/>}`，所以送出／點建議會走真實的金鑰閘門流程。
- `ProviderKeysDialog` 獨立開啟按鈕（Test connection 無代理會得到真實錯誤訊息，本身就是一個狀態）。
- `ChatErrorBanner` fixture。
- 主題切換（`useTheme`），註明正式 UI 無切換鈕、只有 `toggleTheme` 前端工具。

### d. 回應內容元件
- `AnswerMarkdown`（安裝後確認 `MarkdownRenderer` props 是否為 `{content}`，否則靜態 `.answer-markdown` 區塊並註明）。
- `ToolReasoning` ×4（executing 含 args、inProgress、complete 含／不含 args）。
- `PlanCard` ×2（executing、complete，fixture 取自 `plan-card.test.tsx`）。
- Loading placeholder：renderer content `{initialHeight:160, generating:true}`。
- `ExportOverlay` 包 weather seed 的 standalone html（hover 右上角 ⋯）。
- `DataTable`：A2UI 真實路徑（比照 `table-catalog.test.tsx` 的 `A2UIProvider catalog={tableCatalog}` + `processMessages`）+ 直接 `<DataTable props={INVALID_TABLE}/>` 顯示 alert。
- `BarChart`／`PieChart` fixture（標 illustrative）+ 一個空資料「No data available」。
- `MeetingTimePicker`：executing + `respond→toast`（可點出 Scheduled／Declined 畫面）；另一張 complete。

### e. 生成式 UI 範例（核心）
- `SAMPLE_PAYLOADS.map(s => <GenerativeSample/>)` 包在 `GallerySandboxProvider`。
- 重播時程（ms）：0 placeholder → 1200 css 完成 → 1500 起每 180ms 推一段 html（`chunkHtml(html,12)`，每次新陣列）→ +250 htmlComplete → +400 jsFunctions → 每條 jsExpression +350 → +300 generating:false。`finish()` 一次設完成態；`replay()` runId+1 讓 renderer 重掛（Effect 4 清沙箱）。
- 每筆：原始 prompt、六欄位分頁、下載（`assembleStandaloneHtmlFromActivity` + `triggerDownload` + `slugify`，與 ExportOverlay 同路徑）、`needsNetwork` 徽章。
- 不自動掛載；使用者按「開始」才建沙箱（前兩筆可用 IntersectionObserver 自動開始）。
- 樣本規則：css 只用 `var(--color-*)`/`--font-sans`/`--border-radius-*`，字重 400/500；html 無 `<style>`/`<script>`；輸入用 `valueAsNumber` + `Number.isFinite` + 範圍檢查；`role="status"` 輸出；`textContent`；follow-up 依 master-playbook 模式；每檔 <12KB。
- 必做：seed×3、SVG 流程、bill-splitter、weekend-compare、monty-hall、bicycle-gears、chartjs-bar。Stretch：airplane-3d、coastal-trip。全部重建樣本標「依技能規範重建的示範，非代理實際輸出」。

### f. 已設計未掛載
- `DemoGallery` 抽屜（onTryDemo → toast prompt）；`CategoryFilter`+`DemoCard` 鋪在頁上，註明 `CATEGORY_COLORS` 鍵不符→徽章永遠灰。
- `TemplateCard` ×5（3 seed + barChart + pieChart componentType；onApply/onDelete → toast）。
- `TemplateChip`：按鈕用 `useAgent().agent.setState({...state, pending_template:{id,name}})` 觸發；有 textarea 時 portal、否則 inline，兩者皆真實行為；註明只寫本地 state。
- `QrModal`（scanStatus 三段切換、sessionId `"gallery-demo"`）+ `QrButton`。
- `DesktopTipModal`：按鈕清 `sessionStorage` 後以新 key 重掛；註明 `sm:hidden`。
- `ExplainerCards`（export 後直接渲染）+ 切換掛 `ExplainerCardsPortal` 注入 c 區塊的歡迎畫面，註明 DOM 耦合。
- CSS-only：`.abstract-bg`+`.blob-3`（容器內 override `position:absolute`）、`.glass*`、`.brand-glass-container`、`.text-gradient`、`.border-gradient`、`.branded-header-*`、`.cta-banner` 複刻。
- `/pick`：`next/link` + `<iframe src="/pick?session=gallery-demo">`（375×640）。
- OG image：`next/image unoptimized` 載 `/opengraph-image`。
- `ExampleLayout` 放一個佔位子元素。

### g. 代理端定義的 UI
- A2UI 登入卡靜態複刻（Card→Column→h2/caption、兩個 label 輸入、Sign in、Divider、Row），註明格式不符原因；安裝後若 `@copilotkit/a2ui-renderer` 有內建 catalog 就加「嘗試真實渲染」開關，失敗則只留複刻。
- `TodoCardReplica`（依 `git show df2a78f^:…/todo-card.tsx` 精簡重建：emoji 選擇、完成切換、標題行內編輯、刪除）+ `TODO_FIXTURES`，註明來源 commit。
- 工具表：已註冊（query_data、get_trip_stop_images、plan_visualization、manage_todos、get_todos、generate_form）vs 定義未註冊（templates.py 五個）；對應前端渲染器。

### h. 解析發現
FINDINGS 卡片（title、detail、paths、severity）：未掛載比例；placeholderMessages 從未顯示；Jev 路由下 barChart/pieChart/generate_form 被剔除；沙箱深色跟 OS、app 跟 `.dark`；seed 用 600/700 字重與硬編漸層 hex；CATEGORY_COLORS 不符；`lib/a2ui-theme.css` 未引用；`langgraph.json` 指 `graph` 但匯出 `agent`；CI `--filter app` vs `@repo/app`；未使用依賴（react-rnd、react18-json-view、@copilotkit/react-ui、@copilotkitnext/shared、@ag-ui/a2ui-middleware、@ag-ui/mcp-apps-middleware）；templates.py 工具未註冊；ExplainerCardsPortal/TemplateChip DOM 耦合；globals.css 兩套 token 命名空間重疊；A2UI 格式不符。舊渲染器一律寫「舊版渲染器（已移除）」，不寫其名稱。

### 重用的現有程式

- `OpenGenUIActivityRenderer`、`LOADING_PHRASES`、`THROTTLE_MS`：`components/generative-ui/open-generative-ui/renderer.tsx`
- `OpenGenUIContentSchema`／`OpenGenUIContent`：`open-generative-ui/schema.ts`
- `assembleStandaloneHtmlFromActivity`、`triggerDownload`、`slugify`：`generative-ui/export-utils.ts`
- `openLinkFunction`、`sendPromptParameters`、`SEND_PROMPT_EVENT`、`SendPromptRequest`：`lib/sandbox/sandbox-functions.ts`
- `SEED_TEMPLATES`：`template-library/seed-templates.ts`；`DEMO_EXAMPLES`：`demo-gallery/demo-data.ts`
- `THEME_CSS`、`SVG_CLASSES_CSS`、`FORM_STYLES_CSS`：`@repo/design-system`
- `useTheme`、`useProviderKeys`、`KeyGatedChatView`、`ProviderKeysDialog`、`AnswerMarkdown`、`ReaderScrollView`、`useExampleSuggestions`
- `tableCatalog`／`DataTable`、`BarChart`／`PieChart`、`PlanCard`、`ToolReasoning`、`MeetingTimePicker`、`ExportOverlay`
- `SandboxFunctionsContext`、`type SandboxFunction`：`@copilotkit/react-core/v2`（安裝後確認匯出；若無，只靠 capture-phase 監聽）
- `CHART_COLORS`：`generative-ui/charts/config.ts`（色彩區塊直接 import，不複製）
- 色彩數學自寫純函式（OKLab 公式、WCAG 亮度、Machado CVD 矩陣），不新增執行期依賴

### 守衛與風險

- `no-legacy-rails.test.ts` 掃 `apps/app/src` 所有檔案（含 css、字串、中文）找 `widgetrenderer`／`widget-renderer`；`single-source.test.ts` 禁止 .ts/.tsx 出現 `--color-background-primary:` 字面。測試裡的 needle 用 `.join("")` 組。
- ESLint（eslint-config-next 16 含 React Compiler 規則）：effect 內不 setState（用 timer／observer callback）、render 不讀 ref、不用 `Math.random`；內部連結用 `next/link`；圖片用 `next/image`。
- `app/gallery/page.tsx` 不加 "use client"，只匯出 `metadata` 與 default；其餘 hook 模組都 "use client"；render 期不碰 `window`。
- 第二個 `CopilotChat` 與首頁不同路由、不同時掛載，共用根 provider 與 thread；無代理時 composer 可能顯示連線中，歡迎畫面照常。
- Websandbox 由 `websandbox-loader` 動態載入（正式路徑）；測試照既有方式 mock。若 dev server 解析不到，再把 `@jetbrains/websandbox` 加為直接依賴（已是 transitive 1.2.1）。
- 沙箱 CSP 只允許 cdnjs/esm.sh/jsdelivr/unpkg 與 USGS/Wikimedia 圖片；payload 不得引用其他主機。
- 重播節流：renderer 只節流中間 html 段；用 `key={runId}` 重掛而非依賴 ref 重設。
- 效能：樣本按需掛載；抽屜／modal 開啟才掛。

### 驗證

1. `pnpm install --frozen-lockfile`。
2. 安裝後唯讀探測：`SandboxFunctionsContext` 是否由 `@copilotkit/react-core/v2` 匯出；`MarkdownRenderer` props；`@copilotkit/a2ui-renderer` 是否有內建 catalog；`@jetbrains/websandbox` 可否從 app 解析；`copilot-welcome-screen` testid 存在。
3. `pnpm --filter @repo/design-system build` → `pnpm --filter @repo/app lint`（零錯誤）→ `pnpm --filter @repo/app test` → 根目錄 `pnpm test`（含 design-system、mcp 守衛）→ `pnpm --filter @repo/app build`。
3b. 色彩區塊抽查：在 Playwright 裡讀取對比矩陣幾個格子的數字，與 Node 端 `color-math` 獨立計算比對；確認 light/dark 切換後矩陣重算。
4. `pnpm --filter @repo/app start`（3000）→ scratchpad 寫 Playwright 腳本（`PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers`，playwright-core 版本對應 chromium-1194）：收集 console/pageerror；開 `/gallery`，逐區塊捲動截圖（1280 與 390 寬、light 與 dark）；對必做樣本按「開始串流重播」等待 iframe；確認除 CDN/USGS 網路失敗外無未捕捉錯誤，CDN 樣本顯示自己的可讀錯誤狀態；再開 `/` 確認首頁與抽出的橫幅正常。截圖用 SendUserFile 給使用者。
5. 完成報告明說：CDN 相依樣本在雲端環境只驗到 fallback，需在本機 `pnpm dev:app` 開 `http://localhost:3000/gallery` 看完整效果。

### 追加：把「三層設計觀」寫進 /gallery（使用者於討論後選定）

目標：新增區塊「設計方法」（id `method`），放在總覽之後，把討論中的三層分析（決策層、約束層、交付層）做成可點的規則表：每條規則標出原始檔案、連到頁內對應的 demo，並附評價。

新增／修改：
- `ui-gallery/section-list.ts`：在 overview 之後插入 `{ id: "method", label: "設計方法", blurb: "決策、約束、交付三層：每條規則對照原始檔案與頁內 demo" }`（共 10 個區塊）。
- `ui-gallery/gallery-item.tsx`：加 `id?: string` prop，渲染到 `<article id>`，供深連結。
- 既有 sections：為被連結的 item 補 `id`（`item-chat-shell`、`item-loading-placeholder`、`item-export-overlay`、`item-data-table`、`item-meeting-picker`、`item-design-frame`、`item-alert-tiers`、`item-svg-ramps`、`item-chart-cvd`、`item-template-card`）。只加屬性，不改內容。
- `ui-gallery/design-method-content.ts`：靜態資料。`DesignLayer[] = { id, title, summary, rules: { rule, source, demo?: string(錨點), note? }[] }` 三層；`STREAM_PIPELINE`（欄位 × 解析時機 × 事件 × 瀏覽器反應）；`RENDER_STAGES`（placeholder / 預覽 / 最終沙箱 三段）；`MCP_DIFF`（web 渲染器 vs MCP assemble_document 對照）；`VERDICT`（強項、弱項）。
- `ui-gallery/sections/design-method-section.tsx`：三個層各一張 `GalleryItem`（wide）內含規則表，`demo` 以 `<a href="#…">` 連到頁內元素；交付層再放串流管線表、三段渲染列表、MCP 對照表；最後強項／弱項兩欄。
- `ui-gallery/index.tsx`：在 OverviewSection 後渲染 `<DesignMethodSection />`。
- 測試 `__tests__/gallery-page.test.tsx`：新增案例「設計方法區塊的每個 `#` 連結都指向頁面上存在的 id」（render 後 querySelectorAll('#method a[href^="#"]') 逐一 `document.getElementById`）。

驗證：`pnpm --filter @repo/app lint`、`test`、`build`；`next start` + Playwright 截 `#method` 區塊與點擊一個錨點確認捲動目標存在；commit `feat(gallery): add design method section linking rules to demos` 並 push。

### 提交（分支 `claude/serene-shannon-z0fh1s`）

1. `refactor(chat): extract ChatErrorBanner and export ExplainerCards`
2. `feat(gallery): add /gallery route with analysis sections and chrome`
3. `feat(gallery): show design-system tokens and sandboxed form controls`
3b. `feat(gallery): add color system analysis with contrast, OKLCH and chart palettes`（color/、color-components/、color-section）
4. `feat(gallery): mount chat shell and response components with fixtures`
5. `feat(gallery): replay generative UI samples through the real renderer`（含必做樣本）
6. `feat(gallery): showcase unmounted and agent-defined UI`
7. `feat(gallery): add stretch generative samples`（3D、地圖；可選）
8. `test(gallery): validate sample payloads and smoke-render the page`
9. `docs: mention the /gallery showcase`

每個 commit 結尾附 session reminder 的兩行署名；`git push -u origin claude/serene-shannon-z0fh1s`。

---

