# 守則：不分軌道都要有的約束

## 串流契約

六個欄位有固定順序，順序本身就是設計：樣式先到才顯示、標記逐段、行為最後。

| 順序 | 欄位 | 產生端規則 | 渲染端行為 |
| --- | --- | --- | --- |
| 1 | `initialHeight` | 預估完成後的高度（px） | 作為框架初始高度；之後由沙箱回報的 __ogui_resize 取代，限 50–4000px |
| 2 | `placeholderMessages` | 2–4 則簡短進度訊息 | 不在本地 schema 內，從未顯示；渲染器改用自己的 LOADING_PHRASES 每 1.8 秒輪播 |
| 3 | `css` | 所有樣式一次給齊 | cssComplete 之前只顯示 placeholder；完成後才建立預覽 iframe |
| 4 | `html` | body 標記，不含 <style>/<script> | 逐段用 Idiomorph morph 進預覽 iframe（1 秒節流）；htmlComplete 後建立最終 Websandbox |
| 5 | `jsFunctions` | 具名函式宣告 | 最終沙箱就緒後注入一次 |
| 6 | `jsExpressions` | 小型同步敘述 | 依到達順序逐條 await 執行；generating:false 後顯示匯出選單 |

從模型 token 到瀏覽器反應的實際路徑：

| 欄位 | 何時解析 | 事件 | 瀏覽器 |
| --- | --- | --- | --- |
| `initialHeight` | 數值一到 | 唯一一次 ACTIVITY_SNAPSHOT：{initialHeight, generating:true} | 建一個該高度的 placeholder 框 |
| `placeholderMessages` | 陣列開啟與每個元素 | /placeholderMessages 與逐項 append | 被本地 zod schema 剝掉，從未到渲染器 |
| `css` | 整串字串結束後 | /css，再 /cssComplete:true | 之前只顯示 placeholder；之後才建預覽 iframe |
| `html` | 每次 write 後讀 clarinet 的 textNode 緩衝，有新字就發 | /html = [] 再逐段 append；結束時 /htmlComplete:true | 預覽 iframe 逐段 morph；完成後建最終沙箱 |
| `jsFunctions` | 整串結束後 | /jsFunctions，再 /jsFunctionsComplete | 注入最終沙箱一次 |
| `jsExpressions` | 每個元素 | 逐項 append；陣列關閉時 /jsExpressionsComplete | 依序 await sandbox.run() |
| `TOOL_CALL_END` | 工具呼叫結束 | /generating:false | 顯示匯出選單 |

- `css` 裡只用 token 變數與 400／500 字重；`html` 不含 `<style>` 與 `<script>`；`jsFunctions` 是具名函式宣告；`jsExpressions` 是小型同步敘述。這兩個 JavaScript 通道以 classic script 執行，頂層不可 `await`，動態 `import` 要包在 async 函式裡。
- 每個產出都要有 `role="status"` 的輸出元素；失敗（函式庫載不到、WebGL 不可用、圖磚被擋）寫進那個元素，不留白。

## 沙箱

- iframe 沙箱加 CSP：script 與 connect 只允許四個 CDN 來源（cdnjs、esm.sh、jsDelivr、unpkg）；圖片只允許 self、data、blob 與 USGS、Wikimedia；其餘全擋。
- importmap 由設計系統套件提供：three、gsap、d3、chart.js 經 esm.sh；要用別的套件先改 importmap，不在產出裡硬寫 URL。
- 高度由沙箱回報（ResizeObserver，前 3 秒每 200ms），父頁夾在 50–4000px。

## 橋接白名單

只有兩個函式：`Websandbox.connection.remote.sendPrompt({ text })`（zod 驗證、有回應與錯誤）與 `openLink({ url })`（只開 https）。不放開 postMessage 到 `*`；追問永遠是新回合，沒有跨回合的 patch API，也不假設 iframe 狀態能跨重渲染保留。

同一套設計系統的兩條軌道刻意不互通：

| 面向 | Web 渲染器 | MCP 組裝 |
| --- | --- | --- |
| 輸入 | 六欄位分開串流 | 只收一個 html 字串 |
| 橋接 | Websandbox RPC，Zod 驗證，有回應與錯誤 | 全域 window.sendPrompt 用 postMessage 送到 '*'，無驗證無回應 |
| 連結 | openLink 只允許 https，可設白名單 | 攔截所有 http 開頭的 a[href] 點擊 |
| 高度 | ResizeObserver，前 3 秒每 200ms，父頁夾 50–4000 | #content.offsetHeight，15 秒內每 200ms |
| 注入 | CSP、importmap、createTripAnimator、design-system、css | CSP、design-system；無 importmap、無 trip animator |
| CSP 圖片 | self、data、blob、USGS、Wikimedia | self、data、blob（地圖圖磚會被擋） |
| 入場動畫 | 只在 initial-render 與 morph-enter | #content 子元素永遠 stagger |

## 輸入驗證

- 數值用 `valueAsNumber` 加 `Number.isFinite` 再檢查範圍；NaN、負數、超過上限都要顯示可操作的錯誤（NumberField）。
- 追問按鈕先 disable、await sendPrompt、catch 顯示錯誤、finally 復原。
- 計算要精確：金額分攤到分且總和相等；模擬值與理論值分開標示。

## 可見失敗

- 函式庫載入失敗、地圖留白、WebGL 不可用、非同步逾時都要有文字說明與替代（文字表格、靜態圖）。
- 企業畫面同理：API 失敗用 ErrorBanner 給重試；權限不足用 EmptyState 的「沒有權限」，不顯示空表。

## 無障礙與窄版

- 鍵盤可達、焦點環可見（`focus-ring`）、tablist 與 radio 群用方向鍵、Dialog 與 Drawer 用 Esc。
- 顏色不是唯一編碼：狀態＝顏色＋圖示＋文字；圖表配表格或摘要。
- 480px 不橫向捲動；reduced-motion 停止輪播與閃爍。
- 資料來源四分（使用者輸入、取得、計算、示意）在畫面上標示。
