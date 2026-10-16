# design/：設計系統與靜態展示

這個資料夾放三樣可以在本機直接打開的東西。它不在 pnpm workspace 內，不影響 `pnpm lint`、`pnpm test`、`pnpm build`。

| 目錄 | 內容 | 本機入口 |
| --- | --- | --- |
| `lilac-mint/` | Lilac Mint 設計系統：token、品牌書、五個章節、30 個元件（CSS＋少量行為）與封面 | `lilac-mint/preview/index.html` |
| `gallery-static/` | `/gallery` 的靜態重製版：不需要 Next.js 或代理，表格與色彩數字在產生期由原始碼算出 | `gallery-static/dist/local.html` |
| `apps/app` 的 `/gallery` | 真實頁面，掛載專案的 React／CopilotKit 元件 | `pnpm dev:app` 後開 `http://localhost:3000/gallery` |

## 在本機打開

```bash
git fetch origin
git checkout claude/serene-shannon-z0fh1s
git pull

cd design
python3 -m http.server 8000
# 設計系統：http://localhost:8000/lilac-mint/preview/
# 靜態重製版：http://localhost:8000/gallery-static/dist/local.html
```

也可以直接用瀏覽器打開這兩個 HTML 檔。靜態重製版的生成式 UI 樣本用 iframe 載入同資料夾的檔案，部分瀏覽器在 `file://` 下會擋，遇到時改用上面的靜態伺服器。

Chart.js、Three.js、Leaflet 樣本需要連到 esm.sh、jsDelivr 與 USGS 圖磚；離線時會顯示各自的錯誤狀態。

## lilac-mint/

```
project/        設計系統本體，與 claude.ai 上的 Design System Artifact 相同
  README.md     品牌書：內容原則、色彩、字體、間距、元件、呈現方式速查、接到 DOOPING
  01–05-*.md    設計方法、呈現方式規則、守則、情境覆蓋驗收、色彩治理
  tokens.json   token 原始資料（淺／深兩主題）
  tokens.css    由 tokens.json 編譯的 CSS 變數與字級 class
  components/   bundle.css、bundle.js（window.LilacMint）、index.d.ts、每個元件的 README.md 與 preview.html
preview/        本機預覽：每個元件把 tokens.css、bundle.css、bundle.js 內嵌成一頁，index.html 是總覽與主題切換
generator/      產生器：從 apps/app 與 packages/design-system 的原始碼取值，寫出 project/ 與 preview/
scripts/        preview-check.mjs：用 Playwright 在淺深兩主題檢查每個預覽
```

`project/components/<Comp>/preview.html` 是給 Artifact 預覽框用的，單獨打開不會有樣式；本機請看 `preview/`。

在其他專案使用：載入 `project/tokens.css` 與 `project/components/bundle.css`，需要互動時再載入 `bundle.js`。元件的標記寫法看各元件的 `README.md` 與 `preview.html`。

## gallery-static/

```
dist/index.html   給 Artifact 宿主包裝的 fragment
dist/local.html   同內容的完整 HTML，本機入口
dist/assets/      生成式 UI 樣本頁、設計系統框、截圖
generator/        產生器與它使用的截圖（generator/shots/）
```

## 重新產生

需要先在 repo 根目錄 `pnpm install`，並建置 design-system 套件：

```bash
pnpm --filter @repo/design-system build
node design/lilac-mint/generator/build.mjs        # 改寫 lilac-mint/project/ 與 lilac-mint/preview/
node design/gallery-static/generator/build.mjs    # 改寫 gallery-static/dist/
```

改了 `apps/app/src/app/globals.css`、`packages/design-system/src/index.ts`、`charts/config.ts` 或 `ui-gallery/` 的內容模組後重跑，token、對比表與章節會跟著更新。元件的原稿在 `lilac-mint/generator/static/components/`：樣式在 `_src/*.css`，行為在 `bundle.body.js`。

檢查預覽（需要 `playwright-core` 與 Chromium 執行檔）：

```bash
CHROMIUM_PATH=/path/to/chrome node design/lilac-mint/scripts/preview-check.mjs all --project
```

## 其他

- `notes/`：這一輪的分析紀錄與設計決策，索引見 `notes/README.md`。
- `scripts/`：Playwright 驗收腳本，用法見 `scripts/README.md`。
