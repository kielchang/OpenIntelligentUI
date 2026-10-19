# DataTable
名冊、職位、草稿等清單的標準表格：`<table>` 帶 `caption`、可排序表頭、第一欄 checkbox 選取、列狀態（一般／派遣／凍結）、右對齊數值欄與狀態徽章；給 DOOPING 所有以列為單位的讀模型使用。

## 何時用
- 每列是一筆同構資料（人員、職位、單位、草稿變更），欄位固定。
- 需要多選後批次操作（加入草稿、匯出）。
- 需要依欄排序或凍結表頭捲動。

## 不要用
- 階層或匯報線：用 OrgChart 或 Tree，不要用縮排的表格列。
- 兩欄的「標籤：值」：用 KeyValueList。
- 空資料或載入中：不要在表格裡放 `colspan` 的提示列；表格外改放 EmptyState（沒有資料／沒有符合篩選）或 Skeleton（表格 4 列骨架），表格本身不渲染。

## 狀態
- 預設列：`--surface-primary` 底、儲存格 `padding: 8px 12px; font-size: 13px`、列間 1px `--border-subtle`。
- 表頭：`thead th` 底 `--surface-tertiary`、12px/600、`position: sticky; top: 0`（在 `.lm-table-wrap--scroll` 的固定高度容器內才會固定）。
- 排序：`th[aria-sort="ascending|descending|none"]` 內放 `button.lm-table__sort`，上下箭頭 SVG 以 `.lm-table__arrow-up/-down` 標示，當前方向不透明、另一方向 0.45。
- hover 列：`--surface-secondary`。
- 選取列：checkbox `checked` 加 `tr.is-selected`，整列底 `--surface-quaternary`；不用左側色條。
- 派遣／約聘列 `tr.is-contingent`：姓名斜體，並在姓名旁放 `.lm-table__tag`「派遣」（虛線人形圖示、`--color-lilac` 底）。
- 凍結列 `tr.is-frozen`：文字 `--text-secondary`，姓名前放鎖頭圖示，狀態欄 `.lm-table__badge--frozen`。
- 數值欄 `.lm-table__num`：右對齊、`--font-mono`、tabular-nums；識別碼與期間 `.lm-table__mono`。
- 狀態欄 `.lm-table__badge--<key>`：色規則與 StatusBadge 相同（`active/applied` success、`validated/merged` info、`scheduled` warning、`cancelled` danger、`draft/frozen/inactive` 灰、`contingent` lilac）。

## 無障礙
- `caption` 必填，寫清楚資料範圍與「示意資料」；`th` 加 `scope="col"`。
- 排序只能靠 `th[aria-sort]` 與表頭內的 `<button>`，不要把 click 綁在 `th` 上。
- 每個列 checkbox 給 `aria-label="選取 <GPN>"`，全選給 `aria-label="全選本頁"`。
- 狀態三重編碼：徽章顏色 + 圖示 + 中文文字；凍結列另有鎖頭圖示，不只變灰。
- 窄螢幕由 `.lm-table-wrap` 橫向捲動，不縮欄；表格外的頁面不得橫向捲動。

## Token
- `--surface-primary` 表格底；`--surface-tertiary` 表頭；`--surface-secondary` hover；`--surface-quaternary` 選取列與灰徽章。
- `--border-default` 外框與表頭下緣；`--border-subtle` 列分隔。
- `--text-primary` 內文；`--text-secondary` caption、凍結列、未排序箭頭。
- `--font-mono` 識別碼、期間、數值。
- `--sandbox-background-<sem>`／`--sandbox-text-<sem>`／`--sandbox-border-<sem>` 狀態徽章；`--color-lilac`＋`--on-brand` 派遣 tag。
- `--radius-lg` 外框圓角。

## 來源
- hand-written from apps/app/src/components/ui-gallery/gallery.css（`.gal-table-wrap`、`.gal-table`、`.gal-table thead th`）：外框 1px + radius-lg、13px、表頭 12px/600；儲存格內距改為 chat 表格的 8px 12px。
- doooping-orgchart-platform：apps/web/src/app.css（`.directory table`、`thead th` sticky、`tr.contingent`、`.tag`）：sticky 表頭、派遣列斜體與小 tag。
- generative-ui/table-catalog.tsx 的無效資料 `role="alert"` 改由 Alert 元件承擔，表格不自帶。
