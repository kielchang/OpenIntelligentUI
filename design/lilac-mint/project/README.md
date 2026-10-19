企業資料密集系統的視覺語言：答案要能操作，畫面克制，每個狀態都看得見。品牌色 lilac 與 mint 只做識別，工作畫面以中性表面、角色化文字與語意色為主；深色主題是重新生成的一套值，不是反轉。

## 內容原則

- 每張表、每張圖、每個計算結果都標示資料來源的四種身分：使用者輸入、取得的資料、計算值、示意資料。示意資料在 caption 寫「示意資料」（沙箱內用原文 "Illustrative sample values (not live data)"）。
- 錯誤訊息說明怎麼修，不只說錯了：「生效日不能早於單位成立日 2024-01-01」而不是「輸入無效」。空值寫「—」，沒有資料用 EmptyState 的「沒有資料」（原文 "No data available"）。
- 不得暗示示範表單會驗證或儲存；按鈕文案寫實際會發生的事（「驗證草稿」「排程生效」），不寫「送出」。
- 合規發現只建議、不擋操作、不判定合規：每條都帶「需法務確認」，用 Alert 的低強度 info，不用 danger。
- 文案繁體中文、祈使句、句號收尾，沒有驚嘆號、沒有 emoji；識別字、token、操作代碼（OP-ORG-01、ORG-EX-01）與系統代號（SMERP、SMFLOW、DOOPING）保持英文。任何範例資料都是合成的：姓名「樣本·」開頭、員工編號 ZZ- 開頭、信箱 example.invalid。
- 載入期間的字句可以有一點個性但要短：原文輪播 "Sketching pixels" "Wiring up nodes" "Painting gradients"；中文版「正在讀取組織圖」「正在計算匯報線」「正在套用草稿」，每 1.8 秒換一句，reduced-motion 時停在第一句。

## 色彩

三層：品牌層（`color-lilac`、`color-lilac-dark`、`color-mint`、`color-mint-dark`）只在識別與一顆品牌按鈕出現；角色層（`background`、`surface-primary`…`surface-quaternary`、`text-primary`、`text-secondary`、`border-default`…）是元件唯一能用的名稱；沙箱那套以 `sandbox-` 前綴並存，語意色（info／success／warning／danger）統一從沙箱那套取。

- 頁面底色用 `background`；卡片、表格、面板用 `surface-primary`；hover 列與側欄用 `surface-secondary`；表頭、chip、程式碼底用 `surface-tertiary`；徽章底與分段按鈕軌道用 `surface-quaternary`。深色主題的表面是半透明白疊在 `background` 上，層次靠亮度，不靠陰影（`shadow-card` 系列在深色為 none）。
- 內文與標題用 `text-primary`；說明、路徑、meta 用 `text-secondary`；`text-tertiary` 兩主題都不到 4.5:1，只給停用態與純裝飾。body 的預設字色 `foreground` 只用在 body，內文一律改 `text-primary`。
- 邊框用 `border-default`，hover 與 focus 前換 `border-hover`，極淡分隔線用 `border-subtle`。鍵盤焦點一律 `focus-ring` 2px 實線、offset 3px，對 `surface-primary` 淺色 3.85:1、深色 4.78:1。
- 品牌色：lilac 是 L 0.83 · C 0.09 · H 281°、mint 是 L 0.84 · C 0.09 · H 180°，兩者都是高明度低彩度的淡色，放在它們上面的文字與圖示一律 `on-brand`。`color-lilac-dark` 對白底只有 2.72:1，不得當文字或有意義的圖形色；`color-mint-dark` 對白底 3.85:1，可當圖示、大字、選中底線與主管標記，不當內文。主要按鈕是 ink：`text-primary` 底配 `background` 字；品牌按鈕用 `color-lilac` 到 `color-mint` 的漸層配 `on-brand` 字，一頁最多一顆。
- 語意色雙強度。低強度：`sandbox-background-<sem>` 底、`sandbox-text-<sem>` 字與圖示、1px `sandbox-border-<sem>` 框，用在 Alert、StatusBadge、環境徽章、表格內的狀態。高強度：`sandbox-text-<sem>` 當底、`sandbox-background-primary` 當字，只給 modal、danger 按鈕與必須打斷的訊息。狀態永遠是顏色加圖示加文字，三者缺一不可。
- 圖表色與 UI 色分家：分類用 `chart-1`…`chart-7`，順序固定、不循環；第 8 個類別起或要強調時改 highlight+mute（一個類別用它的 chart 色，其餘 `surface-quaternary` 加 `border-default`）。連續數值用 `scale-mint-1`…`scale-mint-7`；偏差、正負、前後對比用 `scale-diverge-1`…`scale-diverge-7`，第 4 階永遠是零或基準。軸線與刻度文字用 `chart-axis`，tooltip 用 `chart-tooltip-bg` 與 `chart-tooltip-border`。精確值永遠配表格，圖只做輔助。
- 配額約 60／30／10：中性表面與文字佔六成，結構（邊框、表頭、分隔）三成，強調（品牌、語意、圖表）一成；toast、banner、選中態、品牌按鈕共用那一成。
- SVG 圖解用九色階 `ramp-<name>-fill`／`-stroke`／`-text`／`-text-small`（purple、teal、coral、pink、gray、blue、green、amber、red），淺深各一套值，由 DiagramClasses 綁定；圖解不用 chart 色。

對比（WCAG 2.x，文字 4.5:1、大字與有意義的非文字 3:1；深色主題的半透明表面先與 `background` 合成再算）：

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

未達門檻的 5 對保持原始碼的值，usage 註明；元件與預覽不使用這些配對。

## 字體與字級

- 一個 sans 家族 `sans`（Plus Jakarta Sans 堆疊）與一個 mono 家族 `mono`（Spline Sans Mono 堆疊），兩者由 Google Fonts 載入，每個預覽自己放 link。
- 字級八個：`display` 28px/1.2/700 只給歡迎畫面與區塊大標；`heading` 16px/1.25/600/-0.4px 給標頭與卡片標題；`subheading` 15px/600 給區塊小標；`body` 14px/1.6 是內文、儲存格、表單文字；`body-small` 13px/1.5 給密集表格、meta、註記；`label` 13px/600 給表單標籤、表頭、徽章；`caption` 12px 給說明、資料來源、路徑；`code` 13px mono 給程式碼、token、識別字、員工編號與 uuid。
- 字重只用 400、500、600、700；數值欄用 mono 並右對齊。

## 間距、圓角、陰影

- 間距七階 `space-1`（4px）到 `space-8`（32px）：圖示與文字 space-1；chip 與徽章內距 space-2；欄位之間 space-3；卡片內距、工具列水平內距、網格 gap space-4；區塊內大段距 space-5；區塊之間與對話框內距 space-6；頁面區段之間 space-8。
- 圓角：`radius-sm` 6px 給 chip、徽章、輸入框；`radius-md` 8px 給按鈕、表格外框、導覽項；`radius-lg` 12px 給卡片與對話框內區塊；`radius-xl` 16px 給大卡片與抽屜；`radius-2xl` 24px 只給歡迎畫面大容器。沙箱內容用 `border-radius-md`／`-lg`／`-xl`。
- 陰影：`shadow-card` 卡片靜止、`shadow-card-hover` 卡片 hover、`shadow-compact` 緊湊卡片、`shadow-sm` 分段按鈕選中態、`shadow-md` 下拉選單、`shadow-lg` toast、popover 與對話框；深色主題 card 與 compact 系列為 none。`shadow-glass`、`shadow-glow-lilac`、`shadow-glow-mint` 只給玻璃卡與品牌區。

## 圖示

- 沒有 logo：字標以純文字排 `heading` 字級（「DOOPING」加模組名），不畫標誌。
- 圖示一律 inline SVG，16px，stroke 1.75，`currentColor`，跟著文字色走；放在語意色上時用 `sandbox-text-<sem>`。
- 沒有 emoji；狀態的圖示來自固定對照（草稿鉛筆、已驗證勾、排程時鐘、已套用勾、取消叉、凍結鎖、合併箭頭、派遣虛線）。

## 版面與狀態

- 密度以表格為準：儲存格 8px 12px、13px 字；工具列按鈕 6px 12px、13px/500；輸入框 8px 12px、14px；卡片內距 16px、1px `border-default`、`radius-lg`。
- 每個資料畫面有四個狀態：載入（Skeleton 或 LoadingPlaceholder）、空（EmptyState，分沒有資料、沒有結果、沒有權限）、錯誤（ErrorBanner 或 Alert，能重試就給重試）、有資料。沒有一個狀態留白。
- 所有互動元件可鍵盤操作：tab 到得了、Enter／Space 觸發、方向鍵在 tablist 與 radio 群內移動、Esc 關閉 Dialog 與 Drawer；焦點環永遠可見。
- 480px 寬不得橫向捲動：工具列換行、表格水平捲動（容器上）、抽屜改全寬。
- 動畫只在 `prefers-reduced-motion: no-preference` 內，且只做 160ms 以內的進場與 skeleton 閃爍。

## 元件

只用角色層 token，class 以 `lm-` 開頭，狀態用 `is-*` 或 ARIA 屬性；行為在 `window.LilacMint`（toast、tabs、dialog、drawer、rotate），沒有框架。

**Actions**
- `Button`：primary（ink）、secondary、ghost、danger、brand；一頁一顆 brand。
- `SegmentedControl`：二到五個互斥選項的切換（主題、檢視模式）。

**Inputs**
- `TextField`：單行文字；錯誤訊息說怎麼修。
- `NumberField`：數值；valueAsNumber + Number.isFinite + 範圍。
- `Select`：有限選項（≤ 12）。
- `CheckboxRadio`：多選與單選群組，fieldset/legend。
- `RangeSlider`：可調參數看結果時才用。
- `Textarea`：多行文字與字數上限。
- `SearchBox`：搜尋與結果數 role=status。

**Data**
- `Toolbar`：篩選列 + 狀態槽 + 動作區。
- `DataTable`：精確值的主要容器：排序、選取、派遣／凍結列、數值右對齊。
- `Pager`：分頁與每頁筆數。
- `StatusBadge`：有限狀態枚舉（DOOPING 草稿、單位、職位、人員）。
- `Tag`：標籤、篩選 chip、可移除。
- `KeyValueList`：一筆資料的屬性清單。

**Feedback**
- `Alert`：四語意 × 低／高強度；合規建議永遠低強度 info。
- `ErrorBanner`：可重試的錯誤。
- `Toast`：4 秒自清的操作回饋。
- `EmptyState`：沒有資料／沒有結果／沒有權限。
- `LoadingPlaceholder`：固定高度的載入框與輪播字句。
- `Skeleton`：已知形狀的載入。

**Layout**
- `AppHeader`：字標、導覽、環境徽章、主題切換。
- `Card`：預設、緊湊、可點擊、玻璃。
- `Drawer`：看細節、編輯一筆。
- `Dialog`：確認與短表單。
- `Tabs`：同一物件的幾個面向。

**Charts**
- `ChartPalette`：chart-1…7 固定順序；highlight+mute。
- `SequentialDiverging`：連續與發散色階。

**Diagram**
- `DiagramClasses`：SVG 圖解的 box／node／arr／leader 與九色階。

**OrgChart**
- `OrgChartNode`：組織圖節點：主管、派遣、折疊、空缺、凍結、草稿、虛線匯報。

## 呈現方式速查

先問要回答什麼問題，再選畫面；說不出問題就不做互動 UI。能一句話或表格說清楚就不畫圖；要精確值就表格，圖只做輔助；時間用折線、關係用流程圖、空間用地圖、分佈與比例用對應圖型；可調參數看結果才用計算器與滑桿；要送出或確認才用表單與對話框；判斷信心不足就回文字加一個澄清問題。四條交付軌道（預建元件、宣告式目錄、當場生成、伺服器 UI）每個需求只走一條，由誰定版面、改版頻率與安全邊界決定。細則見章節「呈現方式規則」「守則」「情境覆蓋驗收」。

DOOPING 的對應：組織圖用預建元件（React Flow 畫布）配 OrgChartNode 的狀態語彙；人員目錄與職位清單用 Toolbar + DataTable + Pager；草稿用 KeyValueList + StatusBadge + Dialog（驗證、排程兩步各自確認）；合規發現用低強度 info Alert 與 DataTable；版本差異用 Tag（新增／移動／更名）與 `scale-diverge` 色階，不用紅綠對比。

## 接到 DOOPING

DOOPING 的 `apps/web/src/app.css` 已用這些變數名加 fallback，尚未定義；載入 tokens.css 後只要在 `:root` 補下面的別名（`--background` 與 `--foreground` 與本系統同名，直接生效）：

| DOOPING 變數 | 目前 fallback | 對映 token | 說明 |
| --- | --- | --- | --- |
| --background | #fff | background | 同名，tokens.css 已定義 |
| --foreground | #1c1f26 | foreground（內文改 text-primary） | 同名，tokens.css 已定義 |
| --border | #cfd4dc／#e3e6eb／#9aa3b2 | border-default；淡的用 border-subtle、hover 用 border-hover | 三個 fallback 對三個 token |
| --muted | #eef1f5 | surface-tertiary | 表頭、chip 底 |
| --muted-foreground | #5b6472 | text-secondary |  |
| --accent | #fff7e6 | sandbox-background-warning | 差異高亮底 |
| --primary | #2563eb | text-primary | 主要按鈕改 ink |
| --ring | #2563eb | focus-ring |  |
| --destructive | #b91c1c | sandbox-text-danger |  |
| --cmp-action | #b91c1c | sandbox-text-danger | 合規：需處置 |
| --cmp-warn | #d97706 | sandbox-text-warning | 合規：注意 |
| --cmp-info | #2563eb | sandbox-text-info | 合規：資訊 |
| --cmp-legal | #7c3aed | ramp-purple-text | 合規：需法務確認；lilac-dark 對白底不足 3:1 所以用九色階的 purple 文字色 |
| --diff-added | #16a34a | sandbox-text-success | 差異：新增 |
| --diff-moved | #d97706 | sandbox-text-warning | 差異：移動 |
| --diff-renamed | #7c3aed | ramp-purple-text | 差異：更名 |

```css
:root {
  --border: var(--border-default);
  --muted: var(--surface-tertiary);
  --muted-foreground: var(--text-secondary);
  --accent: var(--sandbox-background-warning);
  --primary: var(--text-primary);
  --ring: var(--focus-ring);
  --destructive: var(--sandbox-text-danger);
  --cmp-action: var(--sandbox-text-danger);
  --cmp-warn: var(--sandbox-text-warning);
  --cmp-info: var(--sandbox-text-info);
  --cmp-legal: var(--ramp-purple-text);
  --diff-added: var(--sandbox-text-success);
  --diff-moved: var(--sandbox-text-warning);
  --diff-renamed: var(--ramp-purple-text);
}
```

沙箱（生成式 UI）那側維持原名：`--color-background-primary` 等於本系統的 `sandbox-background-primary`，依此類推；`--p`、`--s`、`--t`、`--bg2`、`--b` 對應 `sandbox-svg-p` 等五個別名。

## 新增項目（原始碼沒有）

- token：`on-brand`（淡品牌色上的字）、`scale-mint-1…7` 與 `scale-diverge-1…7`（由 `color-mint-dark`、`color-lilac-dark` 以 OKLCH 生成）、字體家族 `mono`（原始碼只在樣式表寫死堆疊，沒有變數）。
- 元件：Toolbar、Pager、StatusBadge、KeyValueList、EmptyState、Skeleton、AppHeader、Drawer、Tabs、OrgChartNode 是為 DOOPING 的資料密集畫面新增；其餘元件從 OpenIntelligentUI 的樣式表與沙箱表單樣式重現。
- 沙箱 token 全部加 `sandbox-` 前綴（原名 `--color-*` 與 app 那套重名、值不同）。

## Not synced

- 字型：Plus Jakarta Sans 與 Spline Sans Mono 由 Google Fonts 託管，沒有字型檔；`type.fonts` 為空。
- 元件：React 元件沒有建置（唯讀路線）；每個元件是依原始碼手寫的靜態預覽與 CSS，README 標明來源路徑。
- 略過：--border-card: transparent（頁面不接受的值，未納入）。
