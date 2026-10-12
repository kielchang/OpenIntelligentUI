# KeyValueList
「標籤：值」的兩欄描述清單（`<dl>`）：左欄 `dt` 用 `--text-secondary` 標籤字級、右欄 `dd` 用 `--text-primary`；支援分組標題、密集版、mono 值、連結、空值與多行值，給 DOOPING 人員／職位／單位抽屜與詳情卡使用。

## 何時用
- 單一實體的屬性摘要（抽屜、詳情面板、審核摘要）。
- 值的型別混雜：識別碼、日期區間、連結、空值。
- 需要分段（基本／任職／稽核）時用 `.lm-kv__group`。

## 不要用
- 多筆同構資料：用 DataTable。
- 可編輯的表單：用 Inputs 群組的 Field，不要把輸入框塞進 `dd`。
- 長篇說明文字：改用段落，`dd` 只放短值或最多幾行。

## 狀態
- 預設 `.lm-kv`：grid 兩欄（`minmax(96px, 140px) 1fr`）、列距 8px；`dt` 13px/500 `--text-secondary`、`dd` 14px `--text-primary`。
- 密集 `.lm-kv--dense`：每組一列、6px 上下內距、列間 1px `--border-subtle`，字 13px。
- 分組標題 `dt.lm-kv__group`：跨兩欄、12px/600 大寫、下緣 1px `--border-default`。
- mono 值 `.lm-kv__mono`：GPN、uuid 前 8 碼（`0192ab3c…`）、日期區間、FTE。
- 連結 `a.lm-kv__link`：`--sandbox-text-info` 加底線，hover 底線加粗。
- 空值 `.lm-kv__empty`：顯示「—」，`--text-secondary`；不要留白或寫「無」。
- 多行 `.lm-kv__multi`：`white-space: pre-line` 保留換行。
- 窄版（≤480px）：改為單欄，標籤在上、值在下。

## 無障礙
- 必須用 `<dl>`／`<dt>`／`<dd>`，一個 `dt` 對一個 `dd`；分組標題也是 `dt`，放在 `dd` 前。
- uuid 只顯示前 8 碼時，把完整值放在 `title` 或 `aria-label`。
- 連結要有底線，不只靠顏色；空值「—」給螢幕閱讀器可讀（必要時加 `aria-label="未設定"`）。
- 對比：`--text-secondary` 兩主題 ≥4.5:1；連結色兩主題 ≥6.5:1。

## Token
- `--text-secondary` 標籤、分組標題、空值；`--text-primary` 值。
- `--border-subtle` 密集版列線；`--border-default` 分組下緣。
- `--font-mono` 識別碼與數值；`--sandbox-text-info` 連結。
- `--space-2`／`--space-4` 列距與欄距。

## 來源
- hand-written from doooping-orgchart-platform：apps/web/src/app.css（`.directory .drawer dl`：grid `110px 1fr`、gap 2px 8px）；欄寬與列距放寬到設計系統的 140px／8px。
- 字級依 tokens 的 label（13px）與 body（14px）。
