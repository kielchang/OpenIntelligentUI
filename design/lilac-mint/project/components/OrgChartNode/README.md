# OrgChartNode
組織圖上的一個節點卡：姓名、職稱、單位、主管標記、派遣計數、折疊鈕，以及空缺／凍結／搜尋命中／草稿變更四種狀態與虛線匯報的樣式；給 DOOPING 組織圖（React Flow 自訂節點）與任何要畫匯報線的靜態圖使用。

## 何時用
- 組織圖、匯報線圖、草稿預覽圖上的人員或職位節點。
- 列表或抽屜裡要「長得和圖上一樣」的節點縮圖。
- 連線語意固定：實線＝正式匯報（`manager_position_of` 推導），虛線＝虛線匯報（`dottedTo`）。

## 不要用
- 不要在節點上放操作按鈕以外的互動（編輯一律經草稿，節點只回報意圖）。
- 不要用節點表達合規結論；合規只建議，另用角標或 Alert。
- 不要把節點當卡片用在非圖的版面（用 Card）。
- 不要自己 join 推導主管或階層；節點只顯示契約函式給的欄位。

## 狀態
- 一般：`--surface-primary` 底、1px `--border-default`、`--radius-md`、`--shadow-compact`；姓名 13px/600、職稱 13px、單位 12px `--text-secondary`。
- 主管標記：皇冠圖示 `--color-mint-dark` ＋ 文字「主管」`--text-primary`。
- 派遣計數 chip：`--color-lilac` 底 + `--on-brand` 字（「派遣 2」）。
- 折疊鈕：22px 圓形、`--background` 底、`aria-expanded`；折疊時顯示「+N」直屬人數，展開時顯示「−」。
- `.is-vacant` 空缺：虛線框、`--surface-secondary` 底、文字 `--text-secondary`、姓名位置寫「空缺」＋人形標籤。
- `.is-frozen` 凍結：文字與圖示 `--text-secondary`、姓名前鎖圖示、標籤「凍結，不可指派」。
- `.is-highlighted` 搜尋命中：2px `--focus-ring` 外框（outline，offset 2px）。
- `.is-draft` 草稿變更：1px `--sandbox-border-warning` 框、左上角「草稿」小標（warning 低強度＋鉛筆圖示）。
- `.lm-org-node--dotted` 虛線匯報：虛線框、文字與底色不變（與空缺的差別在底色與文字），meta 放「虛線匯報」標籤。
- 連線 `.lm-org-tree`：`--text-secondary` 1.5px；`__child--dotted` 的接線為虛線；≤560px 改為左側軌道直列。

## 無障礙
- 折疊鈕是真正的 `<button aria-expanded aria-label="展開 N 位直屬">`，顯示文字只有「+N」或「−」。
- 每個狀態都有文字（空缺、凍結、草稿）或形狀（虛線框、外框）與顏色同時表達，不只靠顏色。
- 節點 `data-code` 放業務編號供搜尋高亮，不放個資。
- 圖示一律 `aria-hidden`，意義由旁邊的文字提供。
- 文字對比：`--text-primary`／`--text-secondary` 在 `--surface-primary`／`--surface-secondary` 上 ≥4.5:1；`--focus-ring` 外框、`--sandbox-border-warning` 框 ≥3:1。

## Token
- `--surface-primary` 節點底；`--surface-secondary` 空缺底；`--surface-quaternary` 標籤底；`--background` 折疊鈕底
- `--border-default` 外框與標籤框；`--border-hover` 折疊鈕 hover
- `--radius-md` 節點圓角；`--shadow-compact` 陰影（深色為 none）
- `--text-primary` 姓名與職稱；`--text-secondary` 單位、凍結、空缺、連線
- `--color-mint-dark` 主管圖示；`--color-lilac` + `--on-brand` 派遣 chip
- `--focus-ring` 搜尋命中外框
- `--sandbox-border-warning`／`--sandbox-background-warning`／`--sandbox-text-warning` 草稿框與角落小標

## 來源
- hand-written from doooping-orgchart-platform packages/org-chart/src/org-chart.css（`.org-card` min-width 168、max-width 240、padding 10px 14px、radius 8、13px/1.4；`.org-card__name` 600；`.org-card__unit` 12px；`.org-card__toggle` 22px 圓形右上角；`.org-card--vacant` 虛線＋次要文字；`.org-badge` 11px/18px、radius 9；`.org-edge--dotted` 4 4 虛線）與 OrgChart.tsx（折疊鈕 `+N`／`−` 與 `aria-label`、badges 列、`dottedTo` 只畫線不參與排版）。
- 姓名由來源的 14px 改為型階 label 13px/600；顏色由來源的 `--border`／`--card`／`--muted-foreground` 改綁本系統 token。
- 主管標記、派遣 chip、凍結／搜尋命中／草稿狀態為 Intentional addition：來源以 `holders`／`workerType`／`org-hl-focus`／`org-card--added` 等 class 表達，這裡統一為 `.is-*` 狀態。
- 連線以 CSS 偽元素畫（不用 React Flow）；來源的 `.org-edge` 為 SVG 路徑。
