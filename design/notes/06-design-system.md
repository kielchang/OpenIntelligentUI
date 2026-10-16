# Lilac Mint 設計系統的設計與交付

產生器與成品現在在 `design/lilac-mint/`。下面是建立時的計畫、交付結果，以及元件撰寫時偏離來源的地方。


### Context

使用者否決了「做成顧問技能」，改為：**把這一輪的全部設計帶到自己的設計系統上，協助前端開發**。釐清後的決定：
- 形式：只做 claude.ai 的 **Design System Artifact**（type `https://claude.ai/artifact/5M7UeXXcx16TP3vzVFNDzd`），不動任何 repo。
- 品牌色：沿用 OpenIntelligentUI 的 lilac／mint 與其兩套 token（globals.css 的 app token、packages/design-system 的沙箱 token），值一律從原始碼取，不手抄。
- 範圍：企業資料密集系統的核心套件 + 呈現方式規則（/gallery 的三層設計觀、13 型別路由、四條交付軌道、守則、情境覆蓋驗收、色彩治理結論）。

DOOPING 現況（供 README 的 Consuming 段落）：`apps/web/src/app.css` 已用 `var(--foreground, #1c1f26)`、`var(--background, #fff)`、`var(--border, #cfd4dc)`、`var(--muted-foreground, #5b6472)`、`var(--accent, #fff7e6)` 當 fallback 但從未定義 token；沒有 Tailwind／shadcn；用色是 Tailwind 600 系藍紫琥珀綠紅。README 要寫「這套 token 怎麼對映到那五個變數名」，之後接線只要定義變數。

Design System type 的規則（已讀 SKILL.md）：只寫 `project/` 之下；`tokens.json` 每個家族是 `{"tokens":[{name,value,usage}]}` 的清單（color 另有 `themes`，值可為 hex／rgba／oklch，不可 var()／named color／color-mix；缺主題值繼承第一主題，所以 light 放前面；名稱跨家族唯一）；`type` 是 `fonts／families／groups` 結構；`README.md` 必備；其他 `*.md` 是品牌書的章節（≤24）；元件在 `components/<Comp>/README.md` + `preview.html`（第一行 `<!-- @dsCard group="…" height=NN -->`，預覽頁已預載 tokens.css、字型、bundle.css、bundle.js）；`components/bundle.js` 是單一 classic script 指派 `window.<namespace>`；`components/Cover/preview.html` 依 `cover.md` 最後寫；索引 `project/design-system.json`（`createdOnFiles` 標記、title、namespace、libraries、groups、assetGroups、lastChange）**最後一個呼叫才寫**；`api/…`、`tokens.css`、`manifest.json` 由頁面產生不可寫。型別的參考檔（`artifact-type/reference/format.md`、`cover.md`、`craft.md`、`from-code.md`、`demo.json`）要在系統建立後用該系統的 url `read`，型別 url 本身讀不到（已試，回 not found）。

### 作法

### 第 1 步：建立系統
`Artifact publish { type_url, title: "Lilac Mint Design System", auto_open: "after_first_write" }`，不帶檔案。取得 url 後 `read` 上述五份參考檔（`paths`），依 `format.md` 校正下面的檔案形狀（tokens.css 變數命名、預覽契約、bundle 要求、cover 規格），再動手寫。

### 第 2 步：產生器 `scratchpad/ds-gen/`
沿用 `artifact-gen/build.mjs` 的 esbuild 打包方式（alias `@` 與 `@repo/design-system`、nodePaths），`generate.ts` 匯入專案純模組，把所有值算出來寫到 `ds-gen/project/**`：

**`project/tokens.json`**（名稱一律小寫 kebab，跨家族唯一）
- `color.themes`：`light`、`dark`。
- 品牌：`lilac`、`lilac-light`、`lilac-dark`、`mint`、`mint-light`、`mint-dark`（globals.css `:root`／`:root.dark`）。
- app 表面與文字：`background`、`foreground`、`surface-primary…quaternary`、`container`、`text-primary／secondary／tertiary`、`border-default／hover／subtle`、`glass`、`glass-subtle`、`border-glass`、`focus-ring`（`#189370`）、`copilot-primary`（light `lilac-dark`、dark `lilac`，用 alias `"{lilac-dark}"`）。
- 沙箱語意（`parseThemeTokens(THEME_CSS)`，名稱加 `sandbox-` 前綴避免與 app 重名）：`sandbox-background-primary…`、`sandbox-text-*`、`sandbox-border-*`、四組 info／danger／success／warning 的 background／text／border，light 與 dark。
- 圖表：`chart-1…chart-7`（`CHART_COLORS`，兩主題同值），usage 註明固定順序、不循環、超過改 highlight+mute；`chart-axis`、`chart-tooltip-bg／border`。
- SVG 九色階：`ramp-<name>-fill／stroke／text`（從 `SVG_CLASSES_CSS` 解析，light／dark）。
- `type`：`fonts: []`（Google 託管，無檔案）；`families`：`sans`＝Plus Jakarta Sans 堆疊、`mono`＝Spline Sans Mono 堆疊、`sandbox-sans／serif／mono`＝design-system 的三組；`groups`：Display（28px/600，globals 337 行）、Title（16px/600/-0.4px，chat.css 標頭）、Body（14px/1.6/400）、Body small（13px）、Caption（12px）、Code（13px mono）。
- `spacing`：`space-1…8`（globals 47–53 行）；`radius`：`radius-sm…2xl`（globals）、`sandbox-radius-md／lg／xl`；`shadow`：`shadow-sm／md／lg／card／card-hover／compact／glass／glow-lilac／glow-mint`（light／dark 兩套，dark 的 card 為 none）。
- 每個 token 都有 usage；文字 token 的 usage 指明它所在的底色（craft 清單要求在每個主題達 4.5:1，產生器用 `contrastRatio` 驗算，不合格的保留但在 usage 標「未達 4.5:1（來源如此）」）。

**`project/README.md`**（品牌書，約 120 行）：定位（資料密集、克制、答案要能操作）；內容原則（資料來源四分：使用者輸入／取得／計算／示意，一律標示；錯誤說清楚怎麼修；不暗示假表單會存）；視覺基礎（色彩角色與三層 token、深色是重生成不是反轉、60-30-10、警示雙強度、圖表色與 UI 色分家；附產生器算出的 text×surface 對比表）；字體與字級；間距與圓角；圖示（沒有 logo：純文字字標並註明；狀態一律顏色＋圖示＋文字三重編碼）；元件使用規則（只准用 semantic 名稱）；Consuming（DOOPING app.css 五個變數的對映表：`--background`→`background`、`--foreground`→`text-primary`、`--border`→`border-default`、`--muted-foreground`→`text-secondary`、`--accent`→`sandbox-background-warning`，以及沙箱用的 `--color-*` 對映）。

**章節 `project/*.md`**（5 份，從既有內容模組移植，文字繁中）：
- `01-design-method.md`：三層設計觀與規則表（`DESIGN_LAYERS` 三層、`RENDER_STAGES`、`VERDICT`）。
- `02-presentation-rules.md`：先問題後畫面；13 型別表（`JEV_ROUTES`＋型別描述）；選型決策樹（能一句話或表格說清楚就不畫 → 精確值配表格 → 時間／關係／空間／可調參數／要送出確認）；四條交付軌道對照（預建元件／宣告式目錄／當場生成／伺服器 UI：誰定版面、何時定、模型能動什麼、安全邊界、往返、適用）；「呈現建議卡」格式。
- `03-guardrails.md`：串流契約（`STREAM_FIELDS`、`STREAM_PIPELINE`）、沙箱 CSP 與 importmap、橋接白名單、輸入驗證、可見失敗、無障礙與窄版。
- `04-coverage-acceptance.md`：情境矩陣範本、產出自動檢查清單、golden prompt 與快照、真實代理端到端、信心門檻降級；OpenIntelligentUI 只測契約不測情境的案例。
- `05-color-governance.md`：對比矩陣結果（`buildContrastMatrix` light／dark）、`CHART_COLORS` 的 CVD 評估（`evaluateCategorical`、Okabe-Ito 對照）、建議清單（移植 color-section 的八條）、硬編碼統計。

**元件 `project/components/`**（CSS-only，`libraries: []`，`bundle.js` 只指派 `window.LilacMint = { toast, tabs }` 供預覽互動；`bundle.css` 用 tokens.css 的變數；`index.d.ts` 當文件）。每個元件 `README.md`（第一句摘要、何時用、不要用、必要狀態、無障礙、對應 token）+ `preview.html`（`@dsCard group`，高度依內容）：
| 群組 | 元件 |
|---|---|
| Actions | Button（primary／secondary／ghost／danger／disabled）、SegmentedControl |
| Inputs | TextField、NumberField（含驗證錯誤）、Select、CheckboxRadio、RangeSlider、Textarea、SearchBox |
| Data | Toolbar（篩選列＋狀態槽）、DataTable（排序、選取列、contingent 列、空狀態、分頁）、StatusBadge（有限枚舉：draft／pending／approved／rejected／void）、Tag、KeyValueDrawer |
| Feedback | Alert（info／success／warning／danger × low／high 強度）、ErrorBanner（含 busy 態）、Toast、EmptyState、LoadingPlaceholder（LOADING_PHRASES 輪播）、Skeleton |
| Layout | AppHeader、Card、Drawer、Dialog、Tabs |
| Charts | ChartPalette（長條＋highlight+mute）、SequentialDiverging（兩條色階） |
| Diagram | DiagramClasses（`.box .node .arr .leader` 與九色階 SVG） |
| OrgChart | OrgChartNode（姓名／職稱／主管標記／折疊計數／虛線匯報，對應 DOOPING 組織圖） |
最後寫 `components/Cover/preview.html`（依 cover.md）。

**索引 `project/design-system.json`**：`{"v":3,"layout":"files","createdOnFiles":{"v":1,"at":now},"title":"Lilac Mint Design System","namespace":"LilacMint","libraries":[],"sections":{},"groups":[],"assetGroups":{},"blobs":{},"docs":{"readme":"project/README.md","sections":[]},"lastChange":{"by":"Kiel","at":now,"via":"Claude Code","note":"initial build from OpenIntelligentUI sources"}}`。

### 第 3 步：發布
一次 `Artifact publish { url, root: ds-gen, file_path: ds-gen/project/design-system.json, files: {"project/…": "project/…"} }`；超過 255 路徑就分兩次，索引留在最後一次。沒有圖片或字型要上傳（無 logo）。

### 驗證
1. 產生器自檢：tokens.json 每家族為清單、名稱唯一且符合 `[A-Za-z0-9][A-Za-z0-9_.-]{0,63}`、色值只用 hex／rgba／alias 且 alias 目標存在、light 在前；每個文字 token 對其 usage 指定的底色算對比（light／dark），列出未達 4.5:1 的清單；章節 ≤24；每個元件資料夾都有 README 與 preview 且 preview 第一行是 `@dsCard`；bundle.js 無 `import`、無 `</script`。
2. Playwright：用產生器仿照 format.md 產生的暫時 tokens.css + bundle.css 開每個 preview.html（淺、深），零 console／page error、無溢出。
3. 發布後 `read` 該 url 的 `project/README.md` 與 `project/tokens.json` 確認被服務；用 `open` 讓使用者看到。
4. 完成訊息：連結、從哪些原始碼建、假設（無 logo、字型託管、沙箱 token 加前綴）、未達對比的 token 清單、下一步（接 DOOPING 只要定義五個變數）。

---


## 交付結果

設計系統已發布並驗證完成：**https://claude.ai/artifact/8ZQhJbxwijv5cudiMXGSUR**（名稱「Lilac Mint」，目前只有你能開，分享從頁面的 Share 選單設定）。

**裡面有什麼**
- Token 128 色（淺／深兩主題）、7 階間距、8 階圓角、10 組陰影、2 個字體家族、8 個字級；值全部從 OpenIntelligentUI 的 `globals.css`、`packages/design-system`、`charts/config.ts` 取出，commit `6117c2a`。
- 品牌書 README：內容原則、色彩規則、對比驗收表、字體、間距、圖示、版面與狀態、元件清單、呈現方式速查、DOOPING 對映、新增項目、Not synced。
- 五個章節：設計方法三層、呈現方式規則（13 型別、決策樹、四條交付軌道、建議卡）、守則（串流契約、沙箱、橋接、驗證、可見失敗）、情境覆蓋驗收、色彩治理（對比、語意色相、圖表色 CVD 評估、硬編碼統計、建議）。
- 30 個元件各有 README 與實況預覽（Actions 2、Inputs 7、Data 6、Feedback 6、Layout 5、Charts 2、Diagram 1、OrgChart 1），加 Cover；`bundle.css` 只用 token 變數，`bundle.js` 是 `window.LilacMint`（toast、tabs、dialog、drawer、rotate），無框架。
- 全部 31 個預覽在本機模擬預覽框跑過淺深兩主題：零 console／page error、480px 無橫向溢出。

**假設與偏離（都寫在 README 或各元件的來源段）**
- 沒有 logo，字標用純文字；字型由 Google Fonts 託管，沒有字型檔。
- 沙箱那套 token 加 `sandbox-` 前綴（與 app 那套重名、值不同）。
- 新增 token：`on-brand`、`scale-mint-1…7`、`scale-diverge-1…7`、字體家族 `mono`；新增元件：Toolbar、Pager、StatusBadge、KeyValueList、EmptyState、Skeleton、AppHeader、Drawer、Tabs、OrgChartNode。
- 品牌按鈕改成淡 lilac→mint 配深字，因為來源的白字對 lilac-dark 只有 2.72:1。
- 未達對比的 5 對保留原值並在 usage 註明：`text-tertiary`、`sandbox-text-tertiary`（兩主題）、`color-lilac-dark`（淺色）。元件不使用這些配對。

**接到 DOOPING**：README「接到 DOOPING」一節列出 `app.css` 現有 17 個變數到 token 的對映，並附一段可直接貼進 `:root` 的 CSS；`--background` 與 `--foreground` 同名，載入 tokens.css 就生效。這次沒有改任何 repo。
## 建置中的調整

- **新增 token**：`on-brand`（淡品牌色上的字，對 lilac 12.03:1、mint 13.20:1）、`scale-mint-1…7` 與 `scale-diverge-1…7`（由 `color-mint-dark`、`color-lilac-dark` 以 OKLCH 生成）、字體家族 `mono`。
- **SVG 九色階**：解析時改成取第一個符合的區塊，淺色值不再被深色區塊覆蓋。
- **`tokens.css`**：依型別規則由作者先寫第一份，第一行註解結尾固定為「generated from tokens.json」，頁面儲存後接手。
- **`index.d.ts`**：發布時以 `text/plain` 送出（`.ts` 不是可服務的副檔名）。
- **DiagramClasses**：SVG 加 `max-width: 640px`，寬版預覽不再超過卡片高度。

## 元件撰寫時偏離來源的地方

這些都寫進了各元件 README 的「來源」段。

**Actions 與 Inputs**
- Button 的 brand 變體改為淡 lilac→mint 漸層配 `on-brand` 深字，圓角由膠囊改 `radius-md`；來源白字對 lilac-dark 只有 2.72:1。
- SegmentedControl 深色主題的選中態改用 `surface-btn-hover` 加 1px 邊框，否則 4% 白疊在 5% 白上看不出來。
- 輸入框 placeholder 用 `text-secondary`（來源 tertiary 兩主題都不到 4.5:1）；邊框 0.5px 改 1px；深色主題對原生控制項設 `color-scheme: dark`。
- CheckboxRadio 的 accent 用 `color-mint-dark`；RangeSlider 改原生外觀加 `accent-color`。
- SearchBox 的腳本變數改名，避開 classic script 頂層 `window.status` 衝突。

**Data 與 Feedback**
- DataTable 不全欄 `nowrap`，改 `word-break: keep-all` 與期間欄最小寬度；選取列用 `surface-quaternary`，避免凍結列的次要文字掉到 4.27:1。
- KeyValueList 連結色用 `sandbox-text-info`（淺 6.5:1、深 8.9:1）。
- ErrorBanner 的顏色改走 warning token，來源硬編 `#ffac4d`。
- StatusBadge 與 Tag 的圖示用 14px（sm 12px），避免 pill 過高。
- Skeleton 用透明度脈動，不用漸層掃光（中間色沒有 token）。

**Layout、Charts、Diagram、OrgChart**
- AppHeader、Drawer、Dialog 的 sticky 或面板底用「表面色疊在 background 上」，深色主題才不透出底下內容。
- Tabs 改為底線式（來源是方框式）。
- ChartPalette 的 mute 長條用 `surface-quaternary` 加 1px `border-default`（來源 `border-hover` 在深色看不見）。
- SequentialDiverging 的熱力格不放數字：沒有任何 token 文字色在 `scale-mint-5` 上達 4.5:1，數值改放旁邊的表格。
- DiagramClasses 的 `.leader` 改 1px（來源 0.5px 在一般螢幕看不見），箭頭用 `currentColor`。
- OrgChartNode 的虛線匯報只把該子節點的垂直接線畫成虛線；空缺與虛線匯報靠底色與標籤區分。

## 未達對比的來源配對

保留原值並在 usage 註明，元件不使用：

| 前景 | 底色 | 淺色 | 深色 |
| --- | --- | --- | --- |
| `text-tertiary` | `surface-primary` | 2.53:1 | 3.81:1 |
| `sandbox-text-tertiary` | `sandbox-background-primary` | 2.81:1 | 3.61:1 |
| `color-lilac-dark` | `surface-primary` | 2.72:1（門檻 3:1） | 6.77:1 |
