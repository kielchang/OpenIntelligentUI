# SequentialDiverging
兩條給連續數值用的色階：單色連續 `--scale-mint-1…7`（淺→深，一個度量的多寡）與發散 `--scale-diverge-1…7`（第 4 階是基準／零，兩端是偏差方向）；給熱力圖、地圖、偏差條與差異比較使用。

## 何時用
- 單一度量的深淺（人數、時數、比率）：用連續色階，值越大越深。
- 相對於基準的偏差（在職 − 編制、本期 − 上期、正負）：用發散色階，中點永遠代表零或基準。
- 熱力圖、表格底色、地圖填色、偏差條。

## 不要用
- 連續數值永遠不用分類色盤 `--chart-1…7`。
- 沒有自然基準的資料不用發散色階（只有「多少」沒有「正負」時用連續）。
- 不要把 7 階當成 7 個類別；階數只表示大小。
- 不要只用顏色傳達數值：數值要同時以文字（數值標籤、tooltip）或表格可讀。

## 狀態
- 連續：`.lm-seq-1`（最淺，`--scale-mint-1`）到 `.lm-seq-7`（最深）；最淺一階加 1px `--border-default` 內框，否則在表面上看不到格子。
- 發散：`.lm-div-1`（lilac-dark 極）… `.lm-div-4`（中性中點，標「0」）… `.lm-div-7`（mint-dark 極）；中點加 1px `--border-default` 內框。
- 色階格 28px 高、2px 間距、兩端 `--radius-sm`；格下 caption 標階數，發散標 −3…0…+3。
- 熱力格 22px 高、3px 圓角，數值放 `title` 與旁邊的表格；不在深色格內放小字（第 5 階起沒有任何 token 文字色能達 4.5:1）。
- 偏差條：中線 `--chart-axis`，正向右、負向左，階數依偏差大小取 `.lm-div-N`，右側以 `--text-primary` 標數值。

## 無障礙
- 色階格 `<ul aria-label>` 說明方向；階數標籤 `aria-hidden`（純裝飾重複）。
- 熱力圖 `role="img" aria-label` 指向資料表；同一份數值以 `<table>` 列在旁邊，`th scope` 齊全。
- 偏差條用 `role="list"`，每列有文字標籤與數值，不只靠長度與顏色。
- 色階兩主題同值；放在 `--surface-primary` 或 `--background` 上都可辨。
- 發散色階的兩極（lilac-dark 與 mint-dark）在色盲模擬下仍可由明度分辨，但仍須標「0」與方向文字。

## Token
- `--scale-mint-1`…`--scale-mint-7` 連續色階（`.lm-seq-N`）
- `--scale-diverge-1`…`--scale-diverge-7` 發散色階（`.lm-div-N`）
- `--border-default` 最淺階與中點的內框
- `--chart-axis` 偏差條中線
- `--text-primary` 數值與中點標籤；`--text-secondary` 階數、軸文字、表頭
- `--border-subtle` 數值表分隔線
- `--radius-sm` 色階條兩端圓角

## 來源
- hand-written from apps/app/src/components/ui-gallery/color-components/palette-preview.tsx（`RampStrip` 的色階條與兩端標籤、`HeatRow` 的「連續數值用單色相淺→深」規則）。
- 色階值由 tokens 的 `--scale-mint-*`／`--scale-diverge-*` 提供（OKLCH 生成，兩主題同值）；格內不放數值為 Intentional deviation：來源 `HeatRow` 以寫死的黑／白字放在格內，本系統沒有主題恆定的白色 token，改以 `title` 與表格呈現數值。
- 偏差條為 Intentional addition：依 DOOPING「在職 − 編制」的需求新增發散色階示範。
