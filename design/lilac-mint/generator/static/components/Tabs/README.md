# Tabs
底線式分頁，在同一個頁面區塊內切換幾組同類內容（例如草稿的各種狀態），tab 可帶計數 chip；給列表頁與詳情頁的分區使用。

## 何時用
- 同一資料集的不同切片：草稿狀態（全部／草稿／已排程／已生效）、人員的任職／歷程／合規。
- 每個 tab 的內容份量相近、使用者會來回切換。
- 計數 chip 只放「切換前就該知道」的數字（待處理幾筆）。

## 不要用
- 導覽到另一個頁面：用 AppHeader 的導覽連結，不用 tabs。
- 超過六個 tab 或 tab 文字很長：改用側欄或下拉。
- 不要用 tabs 做步驟流程（步驟有先後順序，tabs 沒有）。

## 狀態
- 未選：`--text-secondary`、500；hover `--text-primary`。
- 選中 `aria-selected="true"`：`--text-primary`、600、2px `--color-mint-dark` 底線（壓在 1px `--border-default` 軌道線上）。
- 停用 `:disabled`：`--text-tertiary`（只用在停用態）、`cursor: not-allowed`。
- 計數 chip：`--surface-quaternary` 底 + `--text-secondary` 字；選中 tab 的 chip 轉 ink（`--text-primary` 底、`--background` 字）。
- 面板 padding `--space-4`；未選面板 `hidden`。
- 窄版：tablist `overflow-x: auto`，tab 不換行。

## 無障礙
- 結構：`div[data-lm-tabs] > [role="tablist"] > button[role="tab"][aria-controls][aria-selected]` 與 `[role="tabpanel"][id][aria-labelledby]`；bundle.js 自動接線（或呼叫 `LilacMint.tabs(root)`）。
- 鍵盤：選中的 tab `tabindex=0`、其餘 `-1`；← → 循環、Home／End 跳到首尾；面板 `tabindex="0"` 可聚焦。
- 選中態同時以字重、底線與 `aria-selected` 表達，不只靠顏色。
- tablist 加 `aria-label` 說明這組分頁是什麼。

## Token
- `--text-primary` 選中 tab 與面板文字；`--text-secondary` 未選 tab 與 chip 字；`--text-tertiary` 停用 tab
- `--color-mint-dark` 選中底線
- `--border-default` tablist 軌道線；`--border-subtle` 面板內列表分隔線
- `--surface-quaternary` 計數 chip 底
- `--space-4` 面板 padding；`--space-1` tab 間距

## 來源
- hand-written from apps/app/src/components/ui-gallery/gallery.css（`.gal-source-tabs` 的 `button[aria-selected="true"]` 選中態與 12px/500 字級；本元件改為底線式、13px，以符合 DOOPING 列表頁）。
- 計數 chip 尺寸參考 gallery.css `.gal-badge`（11px/600、radius 999）。
- 鍵盤行為由 bundle.js `LilacMint.tabs` 提供。
