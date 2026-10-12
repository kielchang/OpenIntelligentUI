# Lilac Mint Design System — 元件撰寫規約（給元件作者）

這是 claude.ai「Design System」型別的 Artifact。你負責寫 **元件資料夾**，其他（tokens、README、章節、bundle 組裝、Cover、發布）由產生器與主線處理。**不得修改任何 repo**；只在 `static/` 之下寫檔。

## 你要產出的檔案
每個元件一個資料夾（名稱是 PascalCase 的 ASCII 識別字）：
```
static/components/<Comp>/README.md      ← 使用準則（繁體中文）
static/components/<Comp>/preview.html   ← 實況預覽（完整小 HTML 文件）
```
另外，每個群組一份 CSS 與型別片段（檔名前綴決定串接順序，群組編號見下）：
```
static/components/_src/<NN>-<group>.css   ← 這群元件的全部樣式（之後串成 components/bundle.css）
static/components/_src/<NN>-<group>.d.ts  ← 每個元件一個 `export interface <Comp>Props { … }`（純文件，不編譯）
```
群組編號：`10-actions`、`20-inputs`、`30-data`、`40-feedback`、`50-layout`、`60-charts`、`70-diagram`、`80-orgchart`。
`_src/00-base.css` 已有焦點環、`.lm-sr-only`、toast 樣式，**不要重複寫**。

## preview.html 契約（嚴格）
- **第一行**一定是標記：`<!-- @dsCard group="Actions" height=220 -->`。`group` 用群組英文名（Actions／Inputs／Data／Feedback／Layout／Charts／Diagram／OrgChart），`height` 是卡片列高度（px，40–4000），估計內容實際高度再加 24px；過高會留白、過低會被撐開但先以 height 顯示。
- 第二行起是完整文件：`<!doctype html>`、`<html lang="zh-Hant">`、`<meta charset>`、`<meta name="viewport">`、`<title>`。**不要寫 `data-theme`**（預覽框會設定，深色時改成 dark）。
- 預覽框已預載 `tokens.css`（所有 `--<token>` 變數、`--font-sans`、`--font-mono`、`.body` 等字級 class）、`bundle.css`（你的 `.lm-*` 樣式）、`bundle.js`（`window.LilacMint`）。**不要自己 link 這三個檔**。
- 要自己載 Google Fonts（允許的唯一外部來源）：
  ```html
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Spline+Sans+Mono:wght@400;500&display=swap" rel="stylesheet">
  ```
- 頁內 `<style>` 只放版面（body margin／padding、展示用的 flex／grid、標註文字）；**元件本身的樣式一律寫在 `_src/<NN>-<group>.css`**，不得寫在 preview 裡（消費者載 bundle.css 時要能得到同樣外觀）。
- **最多一個 `<script>`**，放在 body 最後；不用框架；不得 `import`、不得 fetch、不得載其他 CDN。可以呼叫 `window.LilacMint`。
- 禁止：`<iframe>`、`<object>`、`<embed>`、`<portal>`、`<noscript>`、外部圖片、`data:` 大圖。圖示用 inline SVG（`currentColor`、16px、stroke 1.75）。
- 一個 preview 只展示 **一個元件的幾種狀態**（例如 Button 的五種變體一列，再一列尺寸／停用／載入）。狀態旁可用 `.lm-demo-label`（caption 字級、text-secondary）標註狀態名。
- 窄版：在 480px 寬不得橫向捲動（預覽框會縮放，但內容本身要能 wrap）。

### 骨架範本
```html
<!-- @dsCard group="Actions" height=200 -->
<!doctype html>
<html lang="zh-Hant">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Button</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Spline+Sans+Mono:wght@400;500&display=swap" rel="stylesheet">
<style>
  html, body { margin: 0; }
  body { background: var(--background); color: var(--text-primary); font-family: var(--font-sans); padding: var(--space-4); }
  .demo-row { display: flex; flex-wrap: wrap; gap: var(--space-3); align-items: center; margin-bottom: var(--space-4); }
  .lm-demo-label { font: 400 12px/1.4 var(--font-sans); color: var(--text-secondary); width: 100%; }
</style>
</head>
<body>
  <div class="demo-row"><span class="lm-demo-label">變體</span> … </div>
  <script>/* 需要時 */</script>
</body>
</html>
```

## Token（只能用這些，不得寫死色碼）
完整清單在 `.local/token-names.md`（名稱、淺／深值、用途、對比報告）。在 CSS 裡用 `var(--<name>)`。重點：
- 底色：`--background`（頁）、`--surface-primary`（卡片／表格／面板）、`--surface-secondary`（hover 列、側欄）、`--surface-tertiary`（表頭、chip、程式碼底）、`--surface-quaternary`（徽章底、分段按鈕軌道）、`--surface-dialog`、`--backdrop`。
- 文字：`--text-primary`、`--text-secondary`。**`--text-tertiary` 兩主題都不到 4.5:1，只能用在停用態或純裝飾**。
- 邊框：`--border-default`、`--border-hover`、`--border-subtle`。焦點環：`--focus-ring`（00-base.css 已套到所有 `.lm-*` 的 `:focus-visible`）。
- 品牌：`--color-lilac`、`--color-mint`（淡）、`--color-lilac-dark`、`--color-mint-dark`（深）。**放在淡品牌色上的文字一律 `--on-brand`**。`--color-lilac-dark` 在淺色主題對白底只有 2.72:1，不得當文字或有意義的圖形色；`--color-mint-dark` 3.85:1，可當圖形／大字，不當內文。
- 語意（info／success／warning／danger）：底 `--sandbox-background-<sem>`、字 `--sandbox-text-<sem>`、框 `--sandbox-border-<sem>`。
  - **低強度**：`background: var(--sandbox-background-<sem>); color: var(--sandbox-text-<sem>); border: 1px solid var(--sandbox-border-<sem>)`（兩主題都 ≥4.67:1）。
  - **高強度**：`background: var(--sandbox-text-<sem>); color: var(--sandbox-background-primary)`（淺色＝白字，深色＝深字，兩主題都過）。
- 主要按鈕（ink）：`background: var(--text-primary); color: var(--background)`（淺 10.3:1、深 16:1）。品牌 CTA：`background: linear-gradient(135deg, var(--color-lilac), var(--color-mint)); color: var(--on-brand)`。
- 圖表：`--chart-1`…`--chart-7`（順序固定、不循環）、`--chart-axis`、`--chart-tooltip-bg`、`--chart-tooltip-border`。SVG 圖解九色階：`--ramp-<name>-fill／-stroke／-text／-text-small`（name ∈ purple teal coral pink gray blue green amber red；淺深兩套值已在 token 裡）。
- 間距：`--space-1`(4) `--space-2`(8) `--space-3`(12) `--space-4`(16) `--space-5`(20) `--space-6`(24) `--space-8`(32)。圓角：`--radius-sm`(6) `--radius-md`(8) `--radius-lg`(12) `--radius-xl`(16) `--radius-2xl`(24)。陰影：`--shadow-sm／md／lg／card／card-hover`（深色主題 card 系列為 none，靠表面亮度分層）。
- 字體：`--font-sans`、`--font-mono`。字級直接寫 px：display 28/700、heading 16/600/-0.4px、subheading 15/600、body 14/1.6、body-small 13/1.5、label 13/600、caption 12。字重只用 400／500／600／700。

**對比底線（craft 規則）**：預覽與 bundle.css 畫出來的每一對文字／底色，在淺色與深色主題都要 ≥4.5:1（大字 ≥3:1；邊框、圖示、焦點環等有意義的非文字 ≥3:1）。只用上面列出的配對就一定過；想用別的配對先在 `.local/token-names.md` 的對比報告確認。

## CSS 命名與寫法
- 前綴 `lm-`，BEM：`.lm-btn`、`.lm-btn--primary`、`.lm-btn--sm`、`.lm-field__label`、`.lm-table__row.is-selected`。狀態用 `.is-*` 或 ARIA 屬性選擇器（`[aria-selected="true"]`、`[aria-invalid="true"]`、`:disabled`）。
- 每個群組檔案開頭一行註解 `/* ── NN group ── */`，每個元件前一行 `/* <Comp> */`。
- 只用 token 變數；不得出現 `#xxxxxx`、`rgb(`、`rgba(`（唯一例外：`transparent`、`currentColor`）。
- 尺寸照 OpenIntelligentUI 原始碼（見下方「來源」）：例如 chat 標頭按鈕 `padding: 6px 12px; border-radius: var(--radius-md); font-size: 13px; font-weight: 500`；輸入框 `padding: 8px 12px; border: 1px solid var(--border-default); border-radius: var(--radius-md); font-size: 14px`；表格儲存格 `padding: 8px 12px; font-size: 13px`；卡片 `padding: var(--space-4); border: 1px solid var(--border-default); border-radius: var(--radius-lg); background: var(--surface-primary); box-shadow: var(--shadow-card)`。拿不準就照 chat.css／globals.css／gallery.css／FORM_STYLES_CSS 的值，不要「對齊到網格」。
- 不要：裝飾性漸層（品牌 CTA 除外）、emoji、左側彩色粗邊的卡片、無意義動畫。動畫只在 `@media (prefers-reduced-motion: no-preference)` 內。
- 文字不得只靠顏色表達狀態：**顏色＋圖示（或形狀）＋文字** 三重編碼。

## bundle.js（`window.LilacMint`）
已寫好，不要改：
- `LilacMint.toast(message, tone?)`：tone = info｜success｜warning｜danger，4 秒自清；或在元素上寫 `data-lm-toast="訊息" data-lm-tone="success"` 自動接線。
- `LilacMint.tabs(root)`：root 內 `[role="tablist"] > button[role="tab"][aria-controls="panel-id"]` 與 `[role="tabpanel"][id]`；或在容器加 `data-lm-tabs` 自動接線；含鍵盤左右／Home／End。
- `LilacMint.dialog.open(elOrId)／close(el)`：原生 `<dialog class="lm-dialog">`；或 `data-lm-dialog-open="id"`、`data-lm-dialog-close`。
- `LilacMint.drawer.open(elOrId)／close(el)`：`.lm-drawer`（含 `.lm-drawer__panel`），切 `.is-open` 與 `aria-hidden`；或 `data-lm-drawer-open="id"`、`data-lm-drawer-close`。
- `LilacMint.rotate(el, phrases, ms)`：輪播文字（LoadingPlaceholder 用）。

## README.md（每個元件，繁體中文，80–160 字起、依元件複雜度加長）
```
# <Comp>
<第一句就是摘要：這個元件是什麼、給誰用（會被當 summary 顯示）。>

## 何時用
- …
## 不要用
- …
## 狀態
- 列出必要狀態（預設／hover／focus／停用／載入／錯誤／空…）與各狀態用的 token。
## 無障礙
- 角色、鍵盤、aria 屬性、對比。
## Token
- `--text-primary` 文字 … 一列一個 token 與用途。
## 來源
- hand-written from apps/app/src/app/chat.css（.chat-header-btn）… 或「Intentional addition：OpenIntelligentUI 沒有這個元件，依 DOOPING 需求新增」。
```
語氣：祈使句、具體、命名 token；不寫 build 筆記、不寫「下一步」。

## 內容與資料紀律（絕對）
- 介面文案用繁體中文（按鈕、標籤、表頭、空狀態）；識別字、token、程式碼用英文。
- 只用合成資料：人名 `樣本·<兩字>`／`Sample <Name>`、員工編號 `ZZ-000123`、信箱 `name@example.invalid`、單位名「樣本事業群／樣本部」、金額用整數。**不得出現真實公司、廠商、產品名**；舊 ERP 叫 **SMERP**、電子簽核叫 **SMFLOW**、新平台叫 **DOOPING**。
- DOOPING 的狀態詞彙（StatusBadge／DataTable 用）：草稿狀態 `draft／validated／scheduled／applied／cancelled`，單位 `active／frozen`，職位 `open／frozen`，人員 `active／inactive／merged`，另有「派遣／約聘（contingent）」計數。
- 不得暗示假表單會驗證或儲存；示範資料標「示意資料」。

## 來源檔（可讀，只讀）
- `apps/app/src/app/globals.css`（token、`.cta-btn`、`.glass*`）、`apps/app/src/app/chat.css`（`.chat-header`、`.chat-header-btn`、`.chat-error`、composer）
- `apps/app/src/components/ui-gallery/gallery.css`（`.gal-table`、`.gal-badge`、`.gal-item`、`.gal-tabs`、`.gal-topbar`、`.gal-toast`、`.gal-finding`、`.gal-nav`）
- `packages/design-system/src/index.ts`（`FORM_STYLES_CSS` 表單控制項、`SVG_CLASSES_CSS` 圖解類別與九色階、`THEME_CSS`）
- `apps/app/src/components/chat/error-banner.tsx`、`provider-keys.css`（對話框）、`generative-ui/table-catalog.tsx`（DataTable 的 alert）、`generative-ui/open-generative-ui/renderer.tsx`（`LOADING_PHRASES`、placeholder）、`generative-ui/export-overlay.tsx`
- `apps/app/src/components/ui-gallery/color-components/alert-tiers.tsx`、`palette-preview.tsx`、`cvd-strip.tsx`（圖表示範）
- `doooping-orgchart-platform：apps/web/src/app.css`（`.toolbar`、`.toolbar__slot`、`.status`、表格）、`packages/org-chart/src/org-chart.css` 與 `OrgChart.tsx`（組織圖節點：姓名／職稱／主管標記／折疊計數／虛線匯報）

## 自我檢查（寫完每個元件都跑）
```
node design/lilac-mint/scripts/preview-check.mjs Button Alert
```
它會模擬預覽框（注入 tokens.css／bundle.css／bundle.js，淺深各一次），印出 console／pageerror、橫向溢出、內容高度 vs `height=`，截圖到 `design/lilac-mint/.local/shots/<Comp>-<theme>.png`。**用 Read 看截圖**，確認深色主題也正確（沒有白底黑字殘留、沒有看不見的邊框）。全部 `ok` 才算完成。
