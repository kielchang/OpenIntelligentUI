# 色彩治理

數字全部由產生器用專案的色彩函式算出（WCAG 2.x 相對亮度、OKLab／OKLCH、Machado 2009 色覺模擬）。

## 對比驗收

| 前景 | 底色 | 門檻 | 淺色 | 深色 |
| --- | --- | --- | --- | --- |
| `text-primary` | `surface-primary` | 4.5:1 | 10.30:1 | 14.90:1 |
| `text-primary` | `background` | 4.5:1 | 9.63:1 | 15.99:1 |
| `text-secondary` | `surface-primary` | 4.5:1 | 4.83:1 | 7.26:1 |
| `text-secondary` | `background` | 4.5:1 | 4.51:1 | 7.79:1 |
| `text-tertiary` | `surface-primary` | 4.5:1 | 2.53:1（未達） | 3.81:1（未達） |
| `foreground` | `background` | 4.5:1 | 19.12:1 | 16.91:1 |
| `chart-axis` | `surface-primary` | 4.5:1 | 4.83:1 | 7.20:1 |
| `color-lilac-dark` | `surface-primary` | 3:1 | 2.72:1（未達） | 6.77:1 |
| `color-mint-dark` | `surface-primary` | 3:1 | 3.85:1 | 4.78:1 |
| `focus-ring` | `surface-primary` | 3:1 | 3.85:1 | 4.78:1 |
| `on-brand` | `color-lilac` | 4.5:1 | 12.03:1 | 12.03:1 |
| `on-brand` | `color-mint` | 4.5:1 | 13.20:1 | 13.20:1 |
| `background` | `text-primary` | 4.5:1 | 9.63:1 | 15.99:1 |
| `sandbox-text-primary` | `sandbox-background-primary` | 4.5:1 | 17.40:1 | 13.94:1 |
| `sandbox-text-secondary` | `sandbox-background-primary` | 4.5:1 | 4.82:1 | 6.18:1 |
| `sandbox-text-tertiary` | `sandbox-background-primary` | 4.5:1 | 2.81:1（未達） | 3.61:1（未達） |
| `sandbox-text-primary` | `sandbox-background-secondary` | 4.5:1 | 16.10:1 | 11.19:1 |
| `sandbox-text-info` | `sandbox-background-info` | 4.5:1 | 5.69:1 | 4.67:1 |
| `sandbox-text-danger` | `sandbox-background-danger` | 4.5:1 | 6.13:1 | 6.53:1 |
| `sandbox-text-success` | `sandbox-background-success` | 4.5:1 | 5.43:1 | 6.77:1 |
| `sandbox-text-warning` | `sandbox-background-warning` | 4.5:1 | 5.86:1 | 6.53:1 |
| `sandbox-border-info` | `sandbox-background-primary` | 3:1 | 6.52:1 | 8.27:1 |
| `sandbox-border-danger` | `sandbox-background-primary` | 3:1 | 7.06:1 | 7.83:1 |
| `sandbox-border-success` | `sandbox-background-primary` | 3:1 | 6.21:1 | 8.59:1 |
| `sandbox-border-warning` | `sandbox-background-primary` | 3:1 | 6.72:1 | 8.01:1 |

未達的配對保留原值並在 token 的 usage 註明；元件不使用這些配對。`text-tertiary` 與 `sandbox-text-tertiary` 兩主題都不到 4.5:1，只能給停用態與裝飾。

## 語意色色相是否落在慣例範圍

| 語意 | 慣例 | 淺色實際 | 深色實際 |
| --- | --- | --- | --- |
| info | 藍 250° ±15° | 252° | 250° |
| danger | 紅 25° ±15° | 25° | 20° |
| success | 綠 140° ±15° | 135° | 128° |
| warning | 橙／琥珀 70° ±15° | 64° | 71° |

## 圖表分類色

| token | 值 | OKLCH | 對淺色 surface（≥3:1） | 對深色 surface（≥3:1） |
| --- | --- | --- | --- | --- |
| `chart-1` | #3b82f6 | L 0.62 · C 0.19 · H 260° | 3.67:1 | 5.01:1 |
| `chart-2` | #8b5cf6 | L 0.61 · C 0.22 · H 293° | 4.23:1 | 4.35:1 |
| `chart-3` | #ec4899 | L 0.66 · C 0.21 · H 354° | 3.52:1 | 5.23:1 |
| `chart-4` | #f59e0b | L 0.77 · C 0.16 · H 70° | 2.14:1（未達） | 8.59:1 |
| `chart-5` | #10b981 | L 0.70 · C 0.15 · H 162° | 2.53:1（未達） | 7.27:1 |
| `chart-6` | #06b6d4 | L 0.71 · C 0.13 · H 215° | 2.42:1（未達） | 7.60:1 |
| `chart-7` | #f97316 | L 0.70 · C 0.19 · H 48° | 2.80:1（未達） | 6.58:1 |

可辨性（OKLab 歐氏距離 ×100 的 ΔE，愈大愈好；一般視覺建議 ≥15）：

| 指標 | chart-1…7 | Okabe-Ito 八色 |
| --- | --- | --- |
| 原色最小 ΔE | chart-4 ↔ chart-7：9.6 | #1 ↔ #6：15.6 |
| protan 模擬後最小 ΔE | chart-1 ↔ chart-2：5.7 | #5 ↔ #7：9.6 |
| deutan 模擬後最小 ΔE | chart-1 ↔ chart-2：1.3 | #3 ↔ #7：7.6 |
| tritan 模擬後最小 ΔE | chart-5 ↔ chart-6：3.4 | #1 ↔ #7：8.5 |
| 最小相對亮度差 \|ΔY\| | chart-1 ↔ chart-3：0.012 | #1 ↔ #2：0.011 |
| 灰階順序單調 | 否 | 否 |
| 相鄰色相最小間距 | 33° | 14° |

相鄰配對的色盲風險：

| 配對 | 風險 | 原因 |
| --- | --- | --- |
| `chart-1` ↔ `chart-2` | risky | 藍／紫配對且亮度相近（\|ΔY\| ≈ 0.04），紅色盲與綠色盲看不出紫色中的紅成分。 |
| `chart-2` ↔ `chart-3` | neutral | 未命中常見混淆帶（\|ΔY\| ≈ 0.05），請以模擬結果與灰階預覽確認。 |
| `chart-3` ↔ `chart-4` | neutral | 未命中常見混淆帶（\|ΔY\| ≈ 0.19），請以模擬結果與灰階預覽確認。 |
| `chart-4` ↔ `chart-5` | neutral | 未命中常見混淆帶（\|ΔY\| ≈ 0.07），請以模擬結果與灰階預覽確認。 |
| `chart-5` ↔ `chart-6` | risky | 在藍色盲（tritan）模擬下兩色幾乎重疊（ΔE ≈ 0.034），且亮度相近（\|ΔY\| ≈ 0.02）。 |
| `chart-6` ↔ `chart-7` | neutral | 未命中常見混淆帶（\|ΔY\| ≈ 0.06），請以模擬結果與灰階預覽確認。 |

dataviz 驗證器在解析當時的結果（靜態紀錄）：

**CHART_COLORS（淺色 surface）**

| 檢查 | 結果 | 說明 |
| --- | --- | --- |
| Lightness band | PASS | 7 色都在 L 0.43–0.77 |
| Chroma floor | PASS | 都 ≥ 0.1 |
| CVD separation | FAIL | #8b5cf6 ↔ #3b82f6 deutan ΔE 1.3、tritan 3.4 |
| Normal-vision floor | FAIL | 同一對 ΔE 12.0，低於 15 |
| Contrast vs surface | WARN | amber 2.09、emerald 2.47、cyan 2.36、orange 2.73 皆 < 3:1 |

**CHART_COLORS（深色 surface）**

| 檢查 | 結果 | 說明 |
| --- | --- | --- |
| Lightness band | FAIL | amber 0.77、emerald 0.70、cyan 0.72、orange 0.71 超出 |
| CVD separation | FAIL | 同上，藍／紫相鄰對 |
| Contrast vs surface | PASS | 都 ≥ 3:1 |

**SVG 九色階 stroke（淺色）**

| 檢查 | 結果 | 說明 |
| --- | --- | --- |
| Chroma floor | FAIL | teal 0.091、gray 0.006 讀起來像灰 |
| CVD separation | FAIL | #854F0B ↔ #3B6D11（amber／green）deutan ΔE 1.1 |
| Normal-vision floor | FAIL | #993556 ↔ #993C1D（pink／coral）ΔE 8.0 |
| Contrast vs surface | PASS | 都 ≥ 3:1 |

規則：分類色順序固定、不循環、第 8 類起改 highlight+mute；連續數值用 `scale-mint-*`，偏差用 `scale-diverge-*`；圖永遠配表或摘要；紅綠不當唯一對比。

## 硬編碼色統計（原始碼）

| 檔案 | 筆數 | 備註 |
| --- | --- | --- |
| apps/app/src/app/globals.css | 121 | token 定義本身 |
| apps/app/src/lib/a2ui-theme.css | 112 | 未被引用 |
| apps/app/src/components/template-library/template-card.tsx | 20 |  |
| apps/app/src/components/qr-modal/index.tsx | 18 |  |
| apps/app/src/components/demo-gallery/demo-card.tsx | 16 |  |
| apps/app/src/components/generative-ui/export-utils.ts | 14 |  |
| apps/app/src/app/pick/page.tsx | 13 |  |
| apps/app/src/components/template-library/index.tsx | 13 |  |
| apps/app/src/components/desktop-tip-modal.tsx | 13 |  |
| apps/app/src/components/generative-ui/export-overlay.tsx | 10 |  |
| apps/app/src/components/demo-gallery/index.tsx | 9 |  |
| apps/app/src/app/opengraph-image.tsx | 7 |  |
| apps/app/src/components/generative-ui/charts/config.ts | 7 | CHART_COLORS |
| apps/app/src/app/chat.css | 6 |  |
| apps/app/src/components/demo-gallery/category-filter.tsx | 6 |  |
| apps/app/src/components/generative-ui/open-generative-ui/renderer.tsx | 5 | var() 的 fallback |
| apps/app/src/components/template-library/template-chip.tsx | 4 |  |
| apps/app/src/components/chat/provider-keys.css | 3 |  |
| apps/app/src/components/template-library/seed-templates.ts | 2 |  |

合計 399 處。

## 建議清單（附取捨）

- **拆 brand 與 primary**：`color-lilac-dark` 對白底只有 2.72:1，當 CopilotKit primary 的文字與圖示色不達 3:1。保留它當品牌色（字標、品牌按鈕漸層），互動主色改 ink（`text-primary`）；若要有色的互動主色，另生 OKLCH L≈0.45、C≈0.10、H 281° 的 token。代價：多一個 token、按鈕沒那麼「淡紫」。
- **統一一套 semantic 命名**：刪掉 globals.css 與 design-system 重名的 `--color-text-*`；app 側用 `surface-*`／`text-*`／`border-*` 一套角色名，沙箱側維持 `--color-*`（本系統以 `sandbox-` 前綴並存）。代價：一次性搬 CSS。
- **中性色帶主色調**：app 的 Tailwind 灰偏冷藍（H≈260°）、design-system 灰偏暖（H≈90°），兩套看起來像拼裝。選一個 hue（建議 brand 的 281°），chroma 壓到 0.01–0.02 重生灰階。代價：灰階全換、視覺回歸要重拍。
- **圖表色 token 化並固定順序**：`chart-1…7` 已成 token；index % 7 循環改成「第 8 類折成 Other」或 highlight+mute；藍／紫相鄰對 ΔE 只有 0.1，要重新排序或換色；深色主題可另生降 chroma 的一套。代價：三處複製要合併。
- **警示色補 high-contrast 層**：以 text 色當底、反白字（深色主題反深字），只給 modal 與 critical；聊天錯誤橫幅與 QR 狀態改用語意 token。代價：橘框顏色會變。
- **硬編碼改 token、CI 擋 raw hex**：399 處字面中，globals.css 之外約 278 處可逐步改成 var()；a2ui-theme.css 未引用可刪。CI 在 token build 時算對比，低於門檻 fail。代價：lint 初期會紅一片。
- **沙箱深色跟 app 一致**：THEME_CSS 除了 media query 再加 `:root[data-theme=dark]` 選擇器；渲染器建立 iframe 時把 app 的主題寫進去。代價：design-system 多一個選擇器、frame-content 多一行。
