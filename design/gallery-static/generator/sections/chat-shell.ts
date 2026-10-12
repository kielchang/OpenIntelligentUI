/**
 * 05 聊天外殼。標頭、錯誤橫幅、閱讀容器用 chat.css 的真實規則靜態複刻；
 * CopilotChat 本體與金鑰對話框需要 CopilotKit runtime，改用本機 /gallery 與正式首頁 / 的截圖。
 */
import { DEMO_EXAMPLES } from "@/components/demo-gallery/demo-data";
import { addAsset, esc, item, readRepo, section, seg, shot } from "../html";
import { extractThemedCss } from "./replica-css";

/** 與 hooks/use-example-suggestions.ts 相同的四顆建議（保留 DEMO_EXAMPLES 的順序） */
const SUGGESTION_IDS = ["demo-pitch-roll-yaw", "trip", "split", "map"];
const GITHUB_URL = "https://github.com/CopilotKit/OpenIntelligentUI";
const KEYS_TOAST = "示範：onOpenKeys → setKeysOpen(true) 開啟 ProviderKeysDialog（見「API 金鑰對話框」截圖）";

const REPLICA_CSS = `
.rp-chat [hidden] { display: none !important; }
.rp-chat .chat-header button, .rp-chat .chat-header nav > a { background: none; border: 0; padding: 0; color: inherit; font-family: inherit; font-size: 12px; }
.rp-chat .chat-header button:disabled { opacity: 0.5; cursor: not-allowed; }
.rp-chat .chat-header nav > a.chat-brand { background: #fff; padding: 14px; border-radius: 8px; }
.rp-chat .chat-name, .rp-chat .chat-header nav > * { white-space: nowrap; }
.rp-chat .chat-header nav { flex-wrap: wrap; justify-content: flex-end; row-gap: 4px; }
#item-chat-shell .gal-seg { flex-wrap: wrap; }
.rp-chat .chat-error p { margin: 0; }
.rp-chat .chat-error button { background: none; border: 0; padding: 0; color: inherit; font: inherit; margin-right: 16px; }
.rp-chat .chat-content { display: flex; flex-direction: column; }
.rp-welcome { flex: 1; min-height: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 24px 16px; }
.rp-welcome h1 { font-size: 28px; font-weight: 500; letter-spacing: -1px; margin: 0 0 24px; color: var(--text-primary); }
.rp-welcome-input { width: min(100%, 770px); display: flex; align-items: center; gap: 14px; padding: 14px 14px 14px 20px; border: 1px solid var(--border-default); border-radius: 32px; background: var(--surface-primary); box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05); color: var(--text-tertiary); font-size: 16px; text-align: left; }
.rp-welcome-plus { display: inline-flex; color: var(--text-tertiary); }
.rp-welcome-placeholder { flex: 1; }
.rp-welcome-send { width: 36px; height: 36px; border-radius: 50%; background: var(--surface-quaternary); display: inline-flex; align-items: center; justify-content: center; color: var(--text-secondary); flex-shrink: 0; }
.rp-welcome-disclaimer { margin: 12px 0 28px; font-size: 12px; color: var(--text-secondary); }
.rp-welcome-try { margin: 0 0 8px; font-size: 12px; font-weight: 500; color: var(--text-tertiary); letter-spacing: 0.02em; }
.rp-welcome-pills { display: flex; flex-wrap: wrap; justify-content: center; gap: 10px; }
.rp-welcome-pills button { padding: 7px 14px; border-radius: 999px; border: 1px solid var(--border-default); background: var(--surface-primary); color: var(--text-primary); font: 500 13px/1.2 var(--font-family); cursor: pointer; }
.rp-welcome-pills button:hover { background: var(--surface-tertiary); }
.rp-reader-demo { padding: 12px; font-size: 13px; color: var(--text-secondary); }
`;

function errorBanner(
  message: string,
  opts: { busy?: boolean; id?: string; retryId?: string; retryToast?: string; keysToast?: string } = {},
): string {
  const disabled = opts.busy ? " disabled" : "";
  const retryToast = opts.retryToast && !opts.busy ? ` data-toast="${esc(opts.retryToast)}"` : "";
  const keysToast = opts.keysToast && !opts.busy ? ` data-toast="${esc(opts.keysToast)}"` : "";
  return `<div class="chat-error" role="alert"${opts.id ? ` id="${esc(opts.id)}"` : ""}>
  <p>${esc(message)}</p>
  <button type="button"${disabled}${opts.retryId ? ` id="${esc(opts.retryId)}"` : ""}${retryToast}>Retry answer</button>
  <button type="button" class="provider-keys-recover"${disabled}${keysToast}>API keys</button>
</div>`;
}

function headerReplica(logo: string): string {
  return `<header class="chat-header">
  <span class="chat-name">Open Intelligent UI</span>
  <nav aria-label="Main navigation">
    <button type="button" data-toast="示範：newChat() 會換一把新的 session key，重新掛載 CopilotKit">New chat</button>
    <button type="button" aria-haspopup="dialog" data-toast="${esc(KEYS_TOAST)}">API keys</button>
    <a href="${GITHUB_URL}" target="_blank" rel="noopener noreferrer">GitHub ↗</a>
    <a class="chat-brand" href="https://copilotkit.ai" target="_blank" rel="noopener noreferrer"><img src="${logo}" alt="CopilotKit" width="125" height="28"></a>
  </nav>
</header>`;
}

/** CopilotChat 歡迎畫面的靜態手刻版（標題、輸入框、免責聲明、建議 pill），依本機截圖排版 */
function welcomeReplica(): string {
  const pills = DEMO_EXAMPLES.filter((demo) => SUGGESTION_IDS.includes(demo.id))
    .map(
      (demo) =>
        `<button type="button" data-toast="示範：沒有金鑰時 KeyGatedChatView 會攔下建議、開啟對話框並保留草稿（${esc(demo.title)}）">${esc(demo.title)}</button>`,
    )
    .join("");
  return `<div class="rp-welcome">
  <h1>What would you like to explore?</h1>
  <div class="rp-welcome-input" role="presentation">
    <span class="rp-welcome-plus" aria-hidden="true"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg></span>
    <span class="rp-welcome-placeholder">Ask anything…</span>
    <span class="rp-welcome-send" aria-hidden="true"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg></span>
  </div>
  <p class="rp-welcome-disclaimer">Add your OpenAI and Jev API keys to start. Keys clear when you refresh.</p>
  <p class="rp-welcome-try">Try these Prompts</p>
  <div class="rp-welcome-pills">${pills}</div>
</div>`;
}

export function renderChatShellSection(): string {
  const logo = addAsset("assets/copilotkit-logo.svg", readRepo("apps/app/public/copilotkit-logo.svg"));
  const chatCss = extractThemedCss(readRepo("apps/app/src/app/chat.css"), (s) => s.startsWith(".chat-") || s.startsWith(".reader-scroll-view"));

  const shellReplica = `<div class="gal-chat-shell chat-app rp-chat" style="height:640px">
  ${headerReplica(logo)}
  <main class="chat-main">
    ${errorBanner("The agent is unavailable. Check your connection or local agent configuration, then retry.", {
      id: "rp-shell-banner",
      retryId: "rp-shell-retry",
      retryToast: "示範：正式版會重新執行 copilotkit.runAgent()",
      keysToast: KEYS_TOAST,
    })}
    <div class="chat-content">${welcomeReplica()}</div>
  </main>
</div>`;

  const shellItem = item({
    id: "item-chat-shell",
    name: "聊天外殼（標頭 + CopilotChat）",
    exportName: "HomePage",
    path: "apps/app/src/app/page.tsx",
    state: "mounted",
    show: "replica",
    demo: "plain",
    wide: true,
    propsSummary: "CopilotChat props：chatView=KeyGatedChatView、scrollView=ReaderScrollView、autoScroll=false、markdownRenderer=AnswerMarkdown、labels 三則",
    note: `<p>歡迎標題 <code>h1</code> 由 chat.css 降為字重 500；建議 pill 上方的「Try these Prompts」是 globals.css 用 <code>::before</code> 加的；免責聲明被 CSS 隱藏。<code>ReaderScrollView</code> 拿掉自動捲動，只有送出新問題時才把問題捲到頂端。</p>
<p>CopilotChat 本體需要 CopilotKit runtime：「靜態複刻」分頁裡標頭與橫幅用 chat.css 的真實規則，歡迎畫面是依截圖手刻的標記；其餘分頁是本機 /gallery 與正式首頁 / 的截圖。</p>`,
    body: seg(
      [
        { key: "replica", label: "靜態複刻", panel: shellReplica },
        { key: "home", label: "首頁 / 截圖", panel: shot("home.png", "正式首頁：固定標頭與 CopilotChat 歡迎畫面、輸入框、四顆建議", "本機 / 的截圖（1280×900）：沒有金鑰時的初始畫面") },
        {
          key: "gallery",
          label: "/gallery 截圖",
          panel: shot("06-template-chip-in-chat.png", "/gallery 內嵌的聊天外殼：錯誤橫幅、歡迎畫面，輸入框上方有 TemplateChip portal 進來的 Invoice Card", "本機 /gallery 的截圖：同一個 provider 與 thread；輸入框上方的 Invoice Card chip 是「已選範本 chip」示範 portal 進來的"),
        },
        { key: "dark", label: "深色截圖", panel: shot("07-dark-chat-shell.png", "深色主題下的聊天外殼整節", "本機 /gallery 切到深色後的整節截圖（含下方四張卡）") },
        { key: "mobile", label: "手機 390 截圖", panel: shot("08-mobile-chat-shell.png", "390px 寬的聊天外殼整節", "本機 /gallery 在 390px 寬：標頭收成 64px、品牌 logo 隱藏；畫面下半是示範抽屜在手機上的底部全螢幕形態") },
      ],
      { ariaLabel: "聊天外殼呈現方式" },
    ),
  });

  const keysItem = item({
    name: "API 金鑰對話框",
    exportName: "ProviderKeysDialog",
    path: "apps/app/src/components/chat/provider-keys-dialog.tsx",
    state: "mounted",
    show: "shot",
    propsSummary: "{ onClose, disabled? }；原生 <dialog>.showModal()；狀態：未驗證 / 檢查中 / 兩把都可用 / 已啟用",
    note: `<p>金鑰只放在記憶體（ProviderKeysProvider），儲存或清除都會換新的 session key 重新掛載 CopilotKit。</p>
<p>這是本機 /gallery 的截圖：對話框需要 CopilotKit runtime（ProviderKeysProvider 與 session key）才能掛載，「Test connection」也要有代理後端才會回真實錯誤。</p>`,
    body: `<div class="gal-stack">
  <div class="gal-actions">
    <button type="button" class="gal-btn gal-btn--primary" data-toast="示範：setKeysOpen(true)；靜態頁沒有 ProviderKeysProvider，對話框以下方截圖呈現">開啟對話框</button>
    <span class="gal-meta">輸入任意兩個值按 Test connection，可看到錯誤狀態。</span>
  </div>
  ${shot("06-keys-dialog.png", "ProviderKeysDialog：Add API keys to start，OpenAI 與 Jev 兩個欄位，Cancel / Test connection / Save keys", "本機 /gallery 按「開啟對話框」後的 <dialog>（未驗證狀態：Test connection 與 Save keys 停用）", { maxWidth: 480 })}
</div>`,
  });

  const bannerItem = item({
    name: "錯誤橫幅",
    exportName: "ChatErrorBanner",
    path: "apps/app/src/components/chat/error-banner.tsx",
    state: "mounted",
    show: "replica",
    propsSummary: "{ message, busy?, onRetry, onOpenKeys }；原本是 page.tsx 內的 JSX，為了共用抽成元件",
    body: `<div class="gal-stack rp-chat">
  ${errorBanner("Something interrupted the answer. Try again or send another message.", { retryToast: "示範：Retry answer", keysToast: KEYS_TOAST })}
  ${errorBanner("（busy 狀態：代理執行中，按鈕停用）", { busy: true })}
  <button type="button" class="gal-btn gal-btn--small" id="rp-shell-restore" hidden>把外殼裡的橫幅放回去</button>
</div>`,
  });

  const themeItem = item({
    name: "主題切換",
    exportName: "ThemeProvider / useTheme",
    path: "apps/app/src/hooks/use-theme.tsx",
    state: "mounted",
    show: "live",
    propsSummary: "theme: light | dark | system；在 <html> 切 .light/.dark class；預設 light",
    note: `<p>正式 UI 沒有任何切換鈕，只有代理可呼叫的 <code>toggleTheme</code> 前端工具；沙箱 iframe 不跟這個 class 走。</p>
<p>這組按鈕接的是這份 Artifact 自己的三態主題（light／dark／system，寫在 <code>&lt;html data-theme&gt;</code>），語意與 app 的 ThemeProvider 相同，但切的是這一頁，不是 app。</p>`,
    body: `<div class="gal-seg" role="group" aria-label="app 主題" id="rp-theme-seg">${["light", "dark", "system"]
      .map((theme) => `<button type="button" data-theme-set="${theme}" aria-pressed="${theme === "light"}">${theme}</button>`)
      .join("")}</div>`,
  });

  const readerItem = item({
    name: "閱讀模式捲動容器",
    exportName: "ReaderScrollView",
    path: "apps/app/src/components/chat/reader-scroll-view.tsx",
    state: "mounted",
    show: "replica",
    propsSummary: "取代 CopilotChatView.ScrollView；role=region、tabIndex=0、overflow-anchor:none",
    body: `<div class="reader-scroll-view rp-chat" role="region" aria-label="Conversation" tabindex="0" style="height:160px">
  <div class="rp-reader-demo">這個容器自己不捲動到底部；串流中的文字與長高的視覺不會搶走閱讀位置。<br><span style="display:block;height:200px"></span>捲到這裡表示 overflow-y:auto 生效。</div>
</div>`,
  });

  const script = `<script>(function(){
var banner=document.getElementById('rp-shell-banner'),restore=document.getElementById('rp-shell-restore'),retry=document.getElementById('rp-shell-retry');
if(banner&&restore&&retry){retry.addEventListener('click',function(){banner.hidden=true;restore.hidden=false;});restore.addEventListener('click',function(){banner.hidden=false;restore.hidden=true;});}
var seg=document.getElementById('rp-theme-seg');
if(seg){var buttons=seg.querySelectorAll('button[data-theme-set]');var sync=function(){var current=document.documentElement.getAttribute('data-theme')||'system';buttons.forEach(function(b){b.setAttribute('aria-pressed',String(b.getAttribute('data-theme-set')===current));});};sync();new MutationObserver(sync).observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});}
})();</script>`;

  const intro = `<p>正式畫面 <code>apps/app/src/app/page.tsx</code> 只有這幾樣東西：固定標頭、<code>CopilotChat</code>（歡迎畫面、四顆建議、輸入框）、金鑰對話框與錯誤橫幅。在 /gallery 裡，下面嵌的是<strong>同一個 CopilotKit provider 與同一條對話 thread</strong>，不是截圖；這份靜態版以複刻與本機截圖代替。</p>
<p>沒有金鑰時，送出訊息或點建議會被 <code>KeyGatedChatView</code> 攔下並打開對話框、保留草稿；這正是正式流程。沒有代理後端時，「Test connection」會回真實的錯誤訊息。</p>`;

  const body = `<style>${chatCss}\n${REPLICA_CSS}</style>
${shellItem}
<div class="gal-grid">
${keysItem}
${bannerItem}
${themeItem}
${readerItem}
</div>
${script}`;

  return section("chat-shell", intro, body);
}
