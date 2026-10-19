# ChartPalette
圖表的分類色盤與基礎元素：七個固定順序的類別色 `--chart-1…7`、軸線與刻度、網格、圖例、tooltip，以及類別超過七個或要強調時的 highlight+mute 用法；給儀表板與報表的長條、折線、圓餅圖使用。

## 何時用
- 類別型資料（部門、法人、任職種類）最多七類，依資料順序取 `--chart-1…7`，不重排、不循環。
- 第 8 類起，或要把一類從其他類中突顯出來：只有那一類用它的 `--chart-N`，其餘一律 `--surface-quaternary` 底加 1px `--border-default`（highlight+mute）。
- 比較同一度量在不同類別的大小（長條）、隨時間的變化（折線）。

## 不要用
- 連續數值（人數多寡、比率深淺）不用分類色，改用 SequentialDiverging 的連續或發散色階。
- 不要用 `--chart-N` 表達語意（成功／危險），語意色走 `--sandbox-*`。
- 不要靠顏色區分超過七類；超過就 highlight+mute 或改表格。
- 不要在圖表上加漸層、陰影或 3D。

## 狀態
- 長條：`fill` 綁 `--chart-N`，4px 圓角，無描邊。
- muted：`--surface-quaternary` + 1px `--border-default`（兩主題都看得到形狀）。
- 軸線與刻度字：`--chart-axis`（淺色對 `--surface-primary` 4.8:1、深色 7.2:1）；網格 `--border-subtle`。
- 數值標籤：`--text-primary`、11px/500、tabular-nums。
- 圖例：10px 色塊（muted 色塊帶邊框）＋ `--text-secondary` 文字。
- tooltip：`--chart-tooltip-bg` 底、1px `--chart-tooltip-border`、`--radius-md`、padding 8px 12px、`--shadow-md`；文字 `--text-primary`。
- caption 固定寫「示意資料」與單位。

## 無障礙
- SVG 加 `role="img"` 與 `aria-label`，把每個類別的數值寫進去；或在圖下方提供同一份資料的表格。
- 數值一律以文字標在長條上或圖例中，不只靠高度與顏色。
- highlight+mute 時，被強調的類別同時以文字（標題、tooltip、圖例）點名。
- 不依賴 hover 才看得到的資訊：tooltip 的內容也要在數值標籤或表格中。
- 色塊之間不保證色盲可辨，所以類別順序固定、圖例必帶文字、長條必帶數值。

## Token
- `--chart-1`…`--chart-7` 類別色（兩主題同值）
- `--surface-quaternary` + `--border-default` muted 長條與圖例色塊
- `--chart-axis` 軸線與刻度字；`--border-subtle` 網格
- `--chart-tooltip-bg`／`--chart-tooltip-border`／`--shadow-md`／`--radius-md` tooltip
- `--surface-primary`／`--border-default`／`--radius-lg` 圖表容器
- `--text-primary` 標題與數值；`--text-secondary` 圖例與 caption

## 來源
- hand-written from apps/app/src/components/generative-ui/charts/config.ts（`CHART_COLORS` 七色順序、tooltip 的 `--chart-tooltip-bg`／`border`、radius 8、padding 8px 12px）。
- highlight+mute 與固定順序的規則取自 apps/app/src/components/ui-gallery/color-components/palette-preview.tsx（`CategoricalBars` 的 `highlightIndex`、4px 圓角、標籤用文字 token）；muted 色由來源的 `--border-hover` 改為 `--surface-quaternary` + `--border-default`，讓深色主題也看得到形狀。
