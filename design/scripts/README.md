# 驗收腳本

用 Playwright 檢查 `/gallery`、靜態重製版與設計系統預覽。這個資料夾不是 workspace 套件，第一次用先安裝：

```bash
cd design/scripts
npm install
export CHROMIUM_PATH=/path/to/chrome   # 沒設就用 playwright-core 預設的瀏覽器
```

截圖一律寫到 `design/.local/screenshots/`，已被 `.gitignore` 排除。

| 腳本 | 前提 | 做什麼 |
| --- | --- | --- |
| `verify.mjs` | `pnpm --filter @repo/app start`（或設 `BASE_URL`） | 逐區塊截 `/gallery`：1280 與 390 寬、淺深兩主題，收集 console 與頁面錯誤 |
| `review.mjs` | 同上 | 互動驗收：串流重播三階段、樣本完成態、對話框、抽屜、QR、TemplateChip |
| `review2.mjs` | 同上 | `review.mjs` 的補拍 |
| `verify-method.mjs` | 同上 | 「設計方法」區塊與錨點捲動 |
| `verify-cdn.mjs` | 同上 | 需要 CDN 的樣本（Chart.js、Three.js、Leaflet）顯示的狀態 |
| `review-catalogs.mjs` | 同上 | 「材料集合」區塊與 A2UI 基本目錄實渲染，最後回首頁確認 |
| `verify-artifact.mjs` | 無（自己起 `python3 -m http.server`） | 靜態重製版：1280 淺深、390 寬、錨點、樣本頁、帳單分攤互動 |
| `local-check.mjs` | 無（自己起伺服器） | `design/` 兩個本機入口頁在淺深兩主題下零錯誤 |

設計系統每個元件的預覽檢查在 `design/lilac-mint/scripts/preview-check.mjs`，用法見 `design/README.md`。
