# 這個專案怎麼設計介面

對 OpenIntelligentUI 介面設計的四段解析，依提問順序。原始碼路徑以 repo 根目錄為準。

## 一、生成式 UI 的輸出為什麼不在 repo，與重建的取捨

我把「為什麼 repo 沒有輸出」「重建怎麼做」「四條路線的取捨」分開談。

### 為什麼 repo 裡沒有那些輸出

**輸出在架構上就不落地。** 一則回答的流程是：prompt → Jev 判型別 → 模型呼叫 `generateSandboxedUi`。這個工具不是代理定義的，是 `@copilotkit/runtime` 的 open-generative-ui 中介層定義後，以「前端工具」隨每次 run 的 `request.tools` 送進代理（剛確認過 `visualization_router.py` 就是在這份清單上過濾）。模型串流出的六欄位參數被中介層解析成 activity message，只存在兩個地方：

- 瀏覽器裡 CopilotKit 的 thread 記憶體，重新整理就沒了。
- 代理的 `BoundedMemorySaver`，程序記憶體、200 條 thread，重啟即失。

唯一的持久化路徑是使用者自己按 ExportOverlay 下載。`templates.py` 的 `save_template` 本來是「把輸出存成範本」的設計，但改版時沒有註冊進 `main.py`，所以那條路也斷了。

**而且「真實輸出」本身不是固定物。** 預設模型是 `chat-latest` 這個會移動的別名，同一個 prompt 每次結果都不同。README 自己也寫 launch 片段是「rendered launch scenes」。所以就算 repo 有存，也只是某一次的樣本，不是規格。

### 重建是怎麼做的，哪些地方是刻意的取捨

共同作法：每筆是一個 `GallerySample`，六欄位分開；CSS 只用 `--color-*`／`--font-*`／`--border-radius-*`；html 不含 `<style>`／`<script>`；`jsFunctions` 只放具名函式、`jsExpressions` 只放呼叫；輸入用 `valueAsNumber` + `Number.isFinite` + 範圍檢查；`role=status` 輸出；追問按鈕照 master-playbook 的「停用 → await sendPrompt → catch → finally」。測試用 `new Function` 解析每段 JS 擋頂層 `await`／`import`，並強制 `RECONSTRUCTED_LABEL` 出現在說明裡。

| 樣本 | 關鍵決定 | 取捨或替代方案 |
| --- | --- | --- |
| Bill splitter | 總額先取整數分，餘數分給前 k 人，保證分攤總和精確 | 另一做法是每份四捨五入，但會差一兩分；prompt 明說要精確，所以選前者 |
| Weekend compare | 示意費用放在 `data-*` 屬性當單一來源，權重正規化後加權 | 沒有真實價格，只能明標 illustrative；平手時推薦「並列」而不是硬選 |
| Monty Hall | 用未加種子的 `Math.random` | 每次數字不同，截圖不可重現；可改 mulberry32 之類的可種子 PRNG，技能沒規定 |
| Bicycle gears | SVG 用 `.c-teal`／`.c-gray`，齒輪轉動靠 JS 設 transform | 700c 輪徑是假設並標示；reduced-motion 時直接跳到終態 |
| Chart.js bar | 經 importmap 從 esm.sh 載 `chart.js/auto`，失敗時留下同數字的表格 | 依賴 CDN；替代是純 SVG 長條（零網路），但就展示不到 importmap 這條路。可做漸進增強：SVG 為底、Chart.js 為加強 |
| 3D airplane | 手寫拖曳軌道，不 import OrbitControls | `three/` 前綴有對應，匯入其實可行，但會多載一個模組且更接近 12 KB 上限；WebGL 失敗顯示可讀訊息 |
| Coastal trip | Leaflet 的 CSS 用 fetch 取回再塞進 `<style>`；圖磚只用 USGS；釘子動畫交給宿主裝的 `createTripAnimator` | 沙箱 CSP 只允許 `style-src 'unsafe-inline'`，遠端樣式表一定擋；照片需要 `get_trip_stop_images` 工具，靜態樣本拿不到，所以用文字卡 |

**串流重播也是一種重建。** `buildReplaySteps` 以標籤邊界切 html 段並用固定時間推進；真實串流是 token 級的參數增量，中介層逐段發 delta，渲染器再以 1 秒節流。視覺上接近，時間曲線不同。

### 四條路線

**A. 錄製真實輸出（golden snapshot）。** 最小做法是在 ExportOverlay 的選單加一個開發用的「Copy payload JSON」，把 css／html／jsFunctions／jsExpressions 連同 prompt、Jev 型別、模型名、日期一起存進 `sample-payloads/recorded/`。你在本機帶 OpenAI 與 TypeSafe 金鑰跑一次就能錄；不需要寫 Python 錄製器去重現前端工具的 schema。取捨：保真度最高，也會把模型的毛病一起錄進來，這對「深度解析」反而有價值。代價是不可重現、需要人工挑選、prompt 或技能一改就過時、每筆約 10 到 30 KB。一個細節：本地 `OpenGenUIContentSchema` 沒有 `placeholderMessages`，錄下來的也不會有這欄。

**B. 維持重建（現狀）。** 可重現、可審查、展示的是「規格想要的樣子」。弱點是它是我對技能的詮釋，可能比模型做得更理想化，也可能漏掉模型的習慣。

**C. 重建與錄製並列對照。** 兩種都放，再加一個自動規則檢查清單（只用 token、字重 400／500、有驗證、有 status、有橋接模式），同時對兩邊跑。這會直接顯示「規格 vs 模型實際行為」的落差。成本是 A 加一個小檢查器。

**D. 即時生成。** 在 gallery 放「用代理產生」按鈕。這等於首頁，只是多了一個比較入口，又帶回金鑰與網路依賴。優先級最低。

**我的建議是 C 的精簡版。** 先做錄製入口與 `recorded` 來源徽章，重建樣本留著當規格基準。這是一個小改動，錄製工作在你本機完成。

另外三個獨立的小取捨，與路線無關：Chart.js 樣本加純 SVG 底圖讓它離線也完整；Monty Hall 改可種子 PRNG 讓截圖可重現；CI 若要跑 `/gallery` 的瀏覽器煙霧測試，repo 目前沒有 Playwright，要新增開發相依與工作流程，而且 CI 必須擋外網，只能驗到 fallback。
## 二、元件呈現與額外模組的取捨

好，先把焦點放在「元件要怎麼呈現」和「要不要為此多接模組、多串工具」這兩件事的取捨。

### 元件呈現：三種做法

| 做法 | 新增相依 | 能用真實 provider | props 操控 | 視覺回歸 | 適合誰 |
| --- | --- | --- | --- | --- | --- |
| 專案內 `/gallery` 路由（現狀） | 無 | 是，CopilotKit、ThemeProvider、Tailwind v4 全都是正式管線 | 要自己寫控制項 | 要另接 Playwright | 想看「元件在這個 app 裡長什麼樣」 |
| Storybook | 重，另一套建置與設定；Next 16 與 React 19 的支援要先驗證 | 要寫 decorator 模擬 CopilotKit | 內建 controls、a11y addon | Chromatic 或自架 | 多人維護元件庫、元件要被其他專案重用 |
| 混合：stories 當資料、route 當殼 | 無 | 是 | 一組共用的 state 選擇器 | 同上 | 現在這個規模 |

我的判斷是維持 route，不裝 Storybook。這個專案的元件只有一個消費者，且一半的價值在「在真實 provider 底下的行為」（金鑰閘門、A2UI catalog、沙箱橋接），Storybook 要靠 mock 才能重現，反而失真。

呈現細節上還有幾個值得決定的點：

- **狀態矩陣 vs. 單一 fixture。** ToolReasoning、PlanCard、MeetingTimePicker、ChatErrorBanner 的狀態都是有限枚舉，把每個狀態並排比一個可切換的 demo 更一目了然。目前是混用，可以統一成「有限狀態一律矩陣，連續輸入才給控制項」。
- **真實元件 vs. 複刻。** ExplainerCards 加了 export 就能用真的；Todo 卡與 A2UI 登入卡只能複刻，但 A2UI 用 basicCatalog 真的畫出來了。原則可以定成「能 export 就不複刻，複刻一定標來源 commit 或檔案」。
- **會蓋全頁的元件。** DesktopTipModal 那次就是教訓：固定定位的遮罩不能預設掛載，要按鈕觸發。DemoGallery 抽屜、QrModal 也是同一類。
- **沙箱按需建立。** 11 個 Websandbox 同時開會吃記憶體；現在前兩筆自動、其餘手動，這個取捨我會保留。

### 額外模組：值得與不值得

- **Playwright 進 repo。** 目前 repo 沒有任何瀏覽器測試，我這次的驗證腳本只在 scratchpad。放進 repo 的代價是一個開發相依、一個 CI 工作、以及 CI 必須擋外網所以 CDN 樣本只能驗到 fallback。好處是 `/gallery` 和首頁都有煙霧測試。建議放進來但先不當 CI 門檻，用 `pnpm e2e` 手動跑。
- **色彩驗證進 CI。** 色彩數學已經是純函式，寫成 vitest 很便宜。問題是 CHART_COLORS 今天就會被擋，所以要先決定是「擋」還是「只回報」。建議先回報，等色盤換掉再轉成門檻。
- **Style Dictionary 或 DTCG token 工具鏈。** 只有在真的要把兩套 token 合併時才值得；單純展示用不到。
- **Storybook、Chromatic、props 控制套件。** 理由同上一段，先不要。
- **payload 模組延遲載入。** `/gallery` 的字串約 90 KB，是開發用頁面，不值得為此加 `next/dynamic` 的複雜度。

### 工具串接：每條線的取捨

| 線 | 改動量 | 取捨 | 建議 |
| --- | --- | --- | --- |
| 沙箱主題跟 app 同步 | 小：THEME_CSS 加 `:root[data-theme="dark"]` 選擇器，renderer 建 iframe 時寫入主題 | 修掉「OS 深色、app 淺色」的真實問題；design-system 多一個選擇器 | 做 |
| 顯示代理的 `placeholderMessages` | 小：本地 schema 加欄位，renderer 有值時優先於 LOADING_PHRASES | 讓 prompt 的要求真的有畫面；需要補 renderer 測試 | 做 |
| 讓 `barChart`／`pieChart` 可達 | 中：Jev 允許集合要多一個「native」renderer，agent 與測試都要改 | 原生圖表快、token 一致、可匯出；但表達力不如沙箱，且多一條渲染路徑 | 看產品方向，先不要 |
| 註冊 `templates.py` 五個工具 | 中：agent state 要加 templates，前端 TemplateLibrary 要掛回去 | 與現在「每次回答是快照、沒有 patch API」的定位衝突 | 不做；反而該刪死碼 |
| `generate_form` 升到 0.9 + basicCatalog | 小 | 已證明能渲染，但文件明說它只是示範且不得暗示登入 | 刪掉比修好更乾淨 |
| 海岸地圖加照片 | 小：預先取好的 Wikimedia 網址與授權寫死 | CSP 允許；要維護授權文字；離線仍顯示不出來 | 可選 |
| MCP `assemble_document` 對照展示 | 小 | 兩條橋接刻意分開，只有資訊價值 | 低優先 |
| 錄製真實輸出 | 小 | 前一輪討論過 | 依你排序往後放 |

推薦順序是：主題同步與 placeholderMessages 這兩個小修先做，接著把呈現統一成狀態矩陣，Playwright 以手動腳本形式進 repo。Storybook、templates、原生圖表路由都先不碰。
## 三、三層設計觀：決策、約束、交付

這個專案其實不是在「設計一組介面」，而是在設計**一套讓模型在幾秒內生成介面的規則系統**。介面設計被拆成三層：決策層決定該出哪種介面，約束層規定介面必須長怎樣、怎麼動，交付層決定它怎麼在串流中出現。外面再包一層刻意極簡的聊天外殼。下面逐層講它怎麼設計、為什麼這樣設計、代價是什麼。

### 決策層：介面類型怎麼被選出來

**任務先於介面。** 系統提示把所有請求收斂成三種任務，每種任務對應一種介面原則：

- 理解：給一個清楚的模型，讓使用者改動「有意義的變數」。
- 比較：把準則、取捨、假設攤開；簡單的用表格，只有在幫助決策時才給可調權重。
- 做工具：可用的輸入、經驗證的計算、輸出、重設。

**選型不交給回答模型，交給分類器。** 每則新訊息先送 Jev 做一次型別判斷，型別只有 13 種，每種都附適用條件，這份清單本身就是一張介面型錄：

| 型別 | 適用條件的原文重點 | 介面形式 |
| --- | --- | --- |
| text | 事實、散文、程式碼、澄清，不需要視覺 | Markdown 回答 |
| table | 精確值、紀錄、簡單並排比較，沒有自訂互動 | A2UI 語意表格 |
| static_diagram | 空間結構或關係，互動加不了價值 | SVG 圖解 |
| interactive_diagram | 改變有意義的變數來解釋機制 | 沙箱，可含 Three.js |
| calculator | 從可調輸入算輸出，要有公式與單位 | 沙箱工具 |
| map 與 animated_route | 真實地點探索；多站旅程用序列釘圖 | Leaflet + USGS |

判斷完就用「只留允許的工具」強制執行：表格輪只剩 A2UI 工具，沙箱輪只剩 `generateSandboxedUi`。這是把設計決策從「請模型自律」改成「模型根本拿不到別的工具」。

**反過來也有克制規則。** 靜態圖夠用就不加互動；不為了讓回答看起來厲害而呼叫工具；一次回答可以是幾段文字加幾個不同的視覺段落；「UI generated」代表已經畫好，不要重做。

代價是沒有 Jev 就整輪失敗，設計上刻意不做 fallback，寧可報錯也不要讓模型自己猜型別。

### 約束層：每種介面必須遵守的規則

這一層是真正的「視覺與互動設計」，但它不是用 Figma 畫的，是用文字契約寫的，而且刻意寫成模型能遵守的形式。

**視覺語言：只給 token 與元素預設，不給元件。** design-system 只定義三階背景、三階文字、三階邊框、四組語意色、三種字體、三種圓角，再把 button、input、select、range、checkbox 的預設樣式做好。字體是 system-ui 16px、行高 1.7；控制項 14px、36px 高、0.5px 邊框、8px 圓角；按鈕是透明底加細框。設計說明直接告訴模型「不要重新樣式化基本控制項」「css 參數只放這個 widget 專屬的樣式」。結果是一種極低裝飾的語言，視覺張力全留給內容本身，也讓所有生成物看起來像同一個產品。

**圖解有幾何規格。** svg-diagrams 技能把一張圖的版面寫成數字：viewBox 寬 680、安全區 40 到 640、單行箱 44 高、兩行箱 56 高、箱距至少 60、每列最多 4 到 5 個節點、字只有 14 與 12 兩種、字重只有 400 與 500、箭頭不得穿過箱子、太複雜就拆成多張 3 到 5 節點的圖。連「怎麼算 viewBox 高度」都有公式。它還有一條很有意思的串流規則：SVG 由上往下渲染，所以元素要由上往下排，串流時自然形成建構動畫。

**色彩有語意規則。** 九個色階是「淡底、深框、深字」三件組；一張圖只用 2 到 3 階；顏色對應意義而不是順序，暖色代表主動或高溫、冷色代表被動、灰色代表結構。淺深兩套值都給，深色是重新生成的而不是反轉。

**互動是契約而不是建議。** 每個啟用的控制都必須真的運作；數字輸入要用 `valueAsNumber`、`Number.isFinite`、範圍與零除檢查；錯誤要能行動，不能顯示 NaN 或過期結果；單位、假設、公式要寫在介面裡；重設要同時重設結果；排序要保留篩選；外部文字只能走 `textContent`。

**無障礙寫進同一份契約。** label 綁定、鍵盤可操作、可見 focus、對比、reduced motion、SVG 與 canvas 要有文字替代、不以顏色單獨傳意、不自動播放、手機寬度要能換行。dev 文件的 launch checklist 還要求真機檢查鍵盤、焦點、數值邊界與重設。

**資料誠實是介面元素。** 使用者提供、工具取回、計算得出、示意假設四種來源要分開標示，而且要標在 UI 裡，不只在聊天裡。A2UI 表格的 `source` 欄位是必填的，這是把 provenance 做成介面的一部分。mock 表單不得暗示登入或儲存。

**動態有節奏規格。** 入場動畫 0.4 秒淡入上移 8px，子元素每個錯開 60ms；串流中 morph 進來的新元素才動，舊元素不閃；3D 只允許一個動畫迴圈，示範動作約 1.5 秒；旅程釘圖固定 6 秒序列，相機不動、聊天不自動捲動；reduced-motion 時全部直接到終態。

**對外互動只有一條窄門。** 本地的篩選、滑桿、計算都在 iframe 內跑；只有使用者點了一個明確標示「會送訊息」的按鈕，才能透過 `sendPrompt` 開新的一輪，而且要帶目前選擇的值、停用按鈕、等待、失敗可重試、最後恢復。載入、計時器、一般輸入變化都不得送。外部連結只能 https。

### 交付層與外殼：介面怎麼被呈現

**串流本身就是設計決策。** 六個參數的順序是為了觀感：CSS 先到所以永遠不會出現無樣式的畫面；html 必須在腳本到達前就可讀；行為放最後讓使用者看著功能逐一生效。渲染器用「CSS 完成前只顯示 placeholder」當門檻，中間用 Idiomorph 把每段 html morph 進預覽 iframe 避免閃爍，html 完成後才換成有橋接的 Websandbox，高度由沙箱回報並限制在 50 到 4000px。唯一的斷點是 placeholderMessages：提示要求模型寫，渲染器卻只顯示自己的七句。

**隔離決定了介面的形狀。** 沙箱沒有儲存、沒有 fetch、沒有父頁面存取，腳本只能來自四個 CDN，圖片只能來自 USGS 與 Wikimedia。所以每個介面必須自足：資料寫在 UI 裡，狀態只活在 iframe 裡，每次回答是一張快照，沒有跨回合的 patch API，追問永遠是新的一輪。這就是為什麼生成物都長得像一張完整的卡片。

**原生元件走另一套語言。** A2UI 表格是語意 table 加 caption、可聚焦的橫向捲動、必填來源。Recharts 圖表、排程卡、計畫卡用的是 Tailwind 的灰與藍，和沙箱的 token 不是同一套視覺語言，這是前面色彩分析指出的雙軌問題。

**外殼刻意退到最低。** 只有一頁聊天：76px 標頭、歡迎句、四顆建議、輸入框。歡迎標題字重壓到 500，免責聲明被 CSS 隱藏，複製鈕 hover 才出現。閱讀位置是設計重點：關掉自動捲動，只在送出新問題時把問題捲到頂端，Markdown 逐段淡入 6px。金鑰閘門會先攔下送出、保留草稿、開對話框，不讓使用者的輸入消失。品牌 lilac 到 mint 的漸層只用在 CTA，不進內容區。

**一致性靠三個機制維持。** 設計說明以 App Context 注入每次對話；pytest 檢查提示與技能文件彼此不矛盾、六欄位順序一致、html 範例不含 style；launch checklist 要求用真實模型跑一次理解、比較、工具三種回答再上線。

**我的評價。** 強項是把設計系統壓縮成模型能遵守的數字與契約，串流優先，誠實標示與無障礙都進了契約而不是附錄。弱項是規則與真實輸出之間沒有自動驗收，只驗文件不驗產物；兩套視覺語言並存；連專案自己的 seed 範本都違反字重與硬編色規則，證明靠自律的部分仍然不少。
## 四、交付層細節

交付層的原始碼全部對過了，包括 CopilotKit runtime 裡實際切串流的中介層。下面照資料流的順序講：模型 token 怎麼變成事件、瀏覽器怎麼分三段畫、橋接與原生元件怎麼接、外殼怎麼交付，最後是和 MCP 那條舊軌道的差異。

### 從模型 token 到 activity 事件

`generateSandboxedUi` 的參數是模型以 JSON 串流吐出的。runtime 的 `OpenGenerativeUIMiddleware` 用 clarinet 這個串流 JSON parser 逐個 `TOOL_CALL_ARGS` delta 餵進去，每個欄位的處理時機都不一樣：

| 欄位 | 解析時機 | 發出的事件 | 瀏覽器反應 |
| --- | --- | --- | --- |
| initialHeight | 數值一到 | 唯一一次 `ACTIVITY_SNAPSHOT`：`{initialHeight, generating:true}` | 建一個該高度的 placeholder 框 |
| placeholderMessages | 陣列開啟與每個元素 | `/placeholderMessages` 與逐項 append | 被本地 zod schema 當未知欄位剝掉，從未到渲染器 |
| css | 整串字串結束後 | `/css` 再 `/cssComplete:true` | 之前只顯示 placeholder；之後才建預覽 iframe |
| html | 每次 write 後讀 clarinet 內部的 textNode 緩衝，有新字就發 | `/html` = [] 再逐段 append；字串結束時 `/htmlComplete:true` | 預覽 iframe 逐段 morph；完成後建最終沙箱 |
| jsFunctions | 整串結束後 | `/jsFunctions` 再 `/jsFunctionsComplete` | 注入最終沙箱一次 |
| jsExpressions | 每個元素 | 逐項 append；陣列關閉時 `/jsExpressionsComplete` | 依序 `await sandbox.run()` |
| 工具呼叫結束 | `TOOL_CALL_END` | `/generating:false` | 顯示匯出選單 |

三個設計細節值得注意。第一，html 是唯一「逐 token」交付的欄位，切點是任意的，可能停在半個標籤或半個 entity 上，所以瀏覽器端必須有清理步驟；css 與 jsFunctions 則一定整串到齊才發，這就是「CSS 門檻」能成立的前提。第二，中介層會把 `TOOL_CALL_START` 與前面的 args 事件先扣住，等第一個 activity 事件發出後才一起放行，也把 `RUN_FINISHED` 延到下一個事件之後，確保對話裡 activity 先出現、而且在 run 結束前完成。第三，JSON 解析錯誤只記 warning 然後 resume，不中斷串流。

placeholderMessages 的斷線現在可以說得很精確：中介層確實發了這些事件，但前端用 `OpenGenUIContentSchema` 這個 `z.object` 驗證 activity 內容，zod 預設會剝掉未宣告的鍵，所以渲染器永遠只看到自己的 `LOADING_PHRASES`。修法只要在 schema 加一個 optional 欄位，再在 placeholder 有值時優先顯示。

### 瀏覽器端的三段式渲染

**外層節流。** 每個 delta 都會產生新的 content 物件，渲染器外層把更新節流在 1 秒一次，但六種情況立即放行：cssComplete 第一次出現、htmlComplete、generating 轉 false、jsFunctions 第一次出現、jsExpressions 長度增加、第一段 html 到達。所以使用者看到的「串流感」其實是每秒最多一次的預覽更新，加上這幾個關鍵時刻的即時跳轉。

**第一段：placeholder。** 高度用 initialHeight 或 200；12px 旋轉圈加一句每 1.8 秒輪換的詞。只有在 generating 且沒有任何可見沙箱時出現。

**第二段：預覽 iframe。** 條件是 css 已完成而且清理後的 body 不是空白。清理函式 `processPartialHtml` 的順序是：砍掉結尾未閉合的標籤、移除完整的 style、script、head 區塊、移除未閉合的這三種區塊、砍掉結尾未完成的 entity、只取 body 內容。另一個函式會把 html 裡已完整的 `<style>` 區塊抬到預覽的 head，這是對「html 不該含 style」這條契約的防禦性容錯。預覽 iframe 是一個沒有任何 localApi 的 Websandbox，head 寫入 overflow hidden、design-system 樣式、生成的 css；body 用內嵌的 Idiomorph 做 morph，新節點加 `morph-enter` 讓入場動畫只落在新元素上，Idiomorph 失敗就退回 innerHTML。

**第三段：最終沙箱。** htmlComplete 一到，預覽 iframe 被銷毀，用 `buildFinalFrameContent` 組出完整文件，順序固定：CSP meta、importmap、`createTripAnimator` 腳本、design-system 三段 CSS、生成的 css，然後才是生成的 html；沒有 head 就補一個。CSP 把 script 與 connect 限制在四個 CDN，圖片只允許 USGS 與 Wikimedia。這次 Websandbox 帶著 localApi 建立，所以 iframe 裡的 `Websandbox.connection.remote.sendPrompt` 與 `openLink` 才存在。就緒後先跑量測腳本：ResizeObserver 觀察 body、監聽 resize 與 load、前 3 秒每 200ms 回報一次，之後只靠 ResizeObserver。父頁只接受來自該 iframe contentWindow 的 `__ogui_resize`，高度夾在 50 到 4000。jsFunctions 只注入一次，就緒前先排隊；jsExpressions 用索引記錄已執行到哪，只跑新增的，逐條 await。

**一個刻意的結構決定。** 渲染器永遠用 ExportOverlay 包住框架，即使還在生成中。理由寫在註解裡：如果完成時才把根節點換成包裝元件，React 會重新掛載容器，正在運作的 iframe 會被無聲銷毀。這種「樹形不能變」的約束是串流 UI 特有的。

### 橋接、原生元件、外殼與第二條軌道

**sendPrompt 的認領機制。** iframe 呼叫經 Zod 驗證後，宿主在 window 上 dispatch 一個自訂事件，事件物件帶 `claim`、`resolve`、`reject`。監聽者必須在 dispatch 的同步期間 `claim()`，沒人認領就立刻拒絕並提示重新載入。正式的 bridge 認領後再驗一次文字、若代理正在跑就拒絕「busy」、訂閱 `RUN_ERROR`、`addMessage` 再 `runAgent`，成功才 resolve；bridge 卸載時把尚未完成的請求一併拒絕。這個設計讓多個 iframe 同時存在也不會重複送出，展示頁的 stub 就是靠同一個 claim 介面在 capture 階段先搶下來。

**原生元件的交付。** A2UI 表格由 runtime 注入工具，前端用 catalog 把 Table 對應到 React；DataTable 在渲染時再用 zod 驗一次，列寬不符就顯示 alert，而且所有值以文字渲染，所以 `<script>` 字串只會被印出來。HITL 的排程卡只在 status 為 executing 時顯示按鈕，使用者的選擇以字串經 `respond` 回到代理當工具結果。匯出走另一個組裝器：importmap、trip animator、design-system、css、一個 Websandbox stub，最後把 jsFunctions 放頂層、jsExpressions 包進 async IIFE，讓下載的檔案在沒有宿主時也能跑；圖表的匯出則改用 jsdelivr 的 Chart.js UMD，而且不帶 CSP。

**外殼怎麼交付文字。** Markdown 每個區塊掛 IntersectionObserver，進入視窗下緣 24px 內才淡入上移，MutationObserver 追蹤串流中新增的區塊，每塊只顯現一次。自動捲動整個關掉，只在使用者送出新問題時用 instant 行為把那則問題捲到頂端，並以 MutationObserver 等它出現。複製鈕 hover 或鍵盤 focus 才顯示，觸控裝置常駐。

**與 MCP 舊軌道的差異。** `assemble_document` 只收 html 一個字串，不分六欄位；橋接是全域 `window.sendPrompt` 用 postMessage 送到 `'*'`，沒有驗證也沒有回應；它還攔截所有 `http` 開頭的連結點擊；高度回報 15 秒內每 200ms 一次；沒有 importmap、沒有 trip animator；CSP 的 img-src 沒有 USGS 與 Wikimedia，所以同一份地圖 payload 搬過去圖磚會被擋；內容包在 `#content` 且入場 stagger 永遠開啟。兩條軌道刻意不互通，提示與技能都明文禁止在 web 宿主用 MCP 的全域函式。

**我對交付層的評價。** 精巧的地方是扣住事件讓 activity 先於工具呼叫顯示、CSS 門檻、Idiomorph 預覽、以及常駐的匯出包裝。脆弱的地方有四個：zod 剝掉 placeholderMessages；1 秒節流讓短回答的預覽只更新一兩次，串流感主要來自那幾個立即放行點；高度量測 3 秒後只剩 ResizeObserver，字型晚載入造成的高度變化靠它補；最終沙箱的深色跟作業系統走，與 app 的主題切換脫節。