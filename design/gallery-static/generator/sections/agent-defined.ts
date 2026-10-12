/**
 * 09 代理端定義的 UI。登入卡依 form.py 結構靜態複刻（basicCatalog 真渲染用本機截圖）、
 * 待辦卡片依刪除前的 todo-card 重建並以小段腳本保留互動、工具對照表由 AGENT_TOOLS 產生。
 */
import { AGENT_TOOLS } from "@/components/ui-gallery/analysis-content";
import { TODO_FIXTURES, type TodoFixture } from "@/components/ui-gallery/gallery-fixtures";
import { badge, codeBlock, details, esc, item, section, shot, table } from "../html";

/** form.py 的登入卡，改寫成 A2UI v0.9 的扁平元件格式（與 React 區塊餵給 basicCatalog 的同一份） */
const LOGIN_COMPONENTS = [
  { id: "root", component: "Card", child: "main-column" },
  { id: "main-column", component: "Column", children: ["header", "email-field", "password-field", "login-btn", "divider", "signup-text"], gap: "medium" },
  { id: "header", component: "Column", children: ["title", "subtitle"], alignment: "center" },
  { id: "title", component: "Text", text: "Welcome back", variant: "h2" },
  { id: "subtitle", component: "Text", text: "Sign in to your account", variant: "caption" },
  { id: "email-field", component: "TextField", label: "Email", placeholder: "Email address", value: { path: "/email" } },
  { id: "password-field", component: "TextField", label: "Password", variant: "obscured", value: { path: "/password" } },
  { id: "login-btn-text", component: "Text", text: "Sign in" },
  { id: "login-btn", component: "Button", child: "login-btn-text", action: { name: "login" } },
  { id: "divider", component: "Divider" },
  { id: "signup-text", component: "Row", children: ["no-account", "signup-link"], distribution: "center", gap: "small" },
  { id: "no-account", component: "Text", text: "Don't have an account?", variant: "caption" },
  { id: "signup-link-text", component: "Text", text: "Sign up" },
  { id: "signup-link", component: "Button", child: "signup-link-text", action: { name: "signup" } },
];

const EMOJI_OPTIONS = ["✅", "🔥", "🎯", "💡", "🚀"];

/** 與 form.py 結構一一對應的靜態複刻（Card → Column → …） */
function loginReplica(): string {
  return `<div class="rp-login">
  <div class="rp-login-head"><h4>Welcome back</h4><small>Sign in to your account</small></div>
  <label>Email<input type="text" placeholder="Email address" readonly></label>
  <label>Password<input type="password" placeholder="Password" readonly></label>
  <button type="button" class="gal-btn gal-btn--primary" style="justify-content:center" data-toast="示範：basicCatalog 真渲染時會觸發 onAction（action.name = login）">Sign in</button>
  <hr>
  <div class="rp-login-foot">Don&#39;t have an account?<button type="button" class="gal-btn gal-btn--small" data-toast="示範：basicCatalog 真渲染時會觸發 onAction（action.name = signup）">Sign up</button></div>
</div>`;
}

/** 依 commit df2a78f 刪除前的 example-canvas/todo-card.tsx 精簡重建；狀態由區塊尾端的小段腳本維護 */
function todoCard(todo: TodoFixture): string {
  const done = todo.status === "completed";
  return `<div class="rp-todo" data-id="${esc(todo.id)}" data-done="${done}">
  <button type="button" class="rp-todo-del" aria-label="Delete todo"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg></button>
  <div class="rp-todo-emoji-wrap">
    <button type="button" class="rp-todo-emoji" aria-label="Change emoji">${esc(todo.emoji)}</button>
    <div class="rp-todo-picker" hidden>${EMOJI_OPTIONS.map((emoji) => `<button type="button" data-emoji="${esc(emoji)}" aria-label="${esc(emoji)}">${esc(emoji)}</button>`).join("")}</div>
  </div>
  <div class="rp-todo-title-wrap">
    <button type="button" class="rp-todo-title" title="點一下行內編輯">${esc(todo.title)}</button>
    <input class="rp-todo-edit" type="text" value="${esc(todo.title)}" aria-label="Todo title" hidden>
  </div>
  <p class="rp-todo-desc">${esc(todo.description)}</p>
  <label class="rp-todo-status"><input type="checkbox" class="rp-todo-check"${done ? " checked" : ""}> <span>${done ? "completed" : "pending"}</span></label>
</div>`;
}

const REPLICA_CSS = `
.rp-agent [hidden] { display: none !important; }
.rp-login { max-width: 360px; margin: 0 auto; padding: 20px; border: 1px solid var(--border-default); border-radius: 12px; background: var(--surface-primary); display: grid; gap: 12px; color: var(--text-primary); }
.rp-login-head { text-align: center; }
.rp-login-head h4 { font-size: 18px; font-weight: 600; margin: 0; }
.rp-login-head small { color: var(--text-secondary); }
.rp-login label { display: grid; gap: 4px; font-size: 13px; font-weight: 600; }
.rp-login input { padding: 8px; border: 1px solid var(--border-default); border-radius: 6px; font: inherit; font-weight: 400; background: var(--surface-secondary); color: var(--text-primary); }
.rp-login hr { border: 0; border-top: 1px solid var(--border-default); margin: 0; }
.rp-login-foot { display: flex; justify-content: center; gap: 8px; font-size: 12px; color: var(--text-secondary); align-items: center; }
.rp-todo { position: relative; border-radius: 16px; padding: 20px; border: 1px solid var(--border-hover); background: var(--surface-primary); color: var(--text-primary); transition: background 150ms, border-color 150ms; }
.rp-todo[data-done="true"] { background: var(--surface-quaternary); border-color: var(--border-default); }
.rp-todo-del { position: absolute; top: 12px; right: 12px; opacity: 0; border-radius: 999px; padding: 4px; border: 0; background: none; color: var(--text-tertiary); cursor: pointer; line-height: 0; transition: opacity 150ms; }
.rp-todo:hover .rp-todo-del, .rp-todo:focus-within .rp-todo-del { opacity: 1; }
.rp-todo-del:hover { color: var(--text-secondary); }
.rp-todo-emoji-wrap { position: relative; display: inline-block; margin-bottom: 12px; }
.rp-todo-emoji { display: block; font-size: 30px; line-height: 1; border-radius: 12px; padding: 8px; border: 0; background: var(--surface-quaternary); cursor: pointer; }
.rp-todo[data-done="true"] .rp-todo-emoji { background: var(--surface-tertiary); }
.rp-todo-picker { position: absolute; top: 0; left: 100%; margin-left: 8px; z-index: 10; display: flex; gap: 4px; padding: 6px; border-radius: 999px; background: var(--surface-primary); border: 1px solid var(--border-hover); box-shadow: 0 10px 25px -3px rgba(0, 0, 0, 0.15); backdrop-filter: blur(12px); }
.rp-todo-picker button { font-size: 18px; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; border-radius: 999px; border: 0; background: none; cursor: pointer; }
.rp-todo-picker button:hover { background: var(--surface-quaternary); }
.rp-todo-title { display: block; text-align: left; font-size: 16px; font-weight: 600; border: 0; background: none; padding: 0; color: var(--text-primary); cursor: text; font-family: inherit; }
.rp-todo[data-done="true"] .rp-todo-title { text-decoration: line-through; color: var(--text-secondary); }
.rp-todo-edit { width: 100%; font-size: 16px; font-weight: 600; background: transparent; border: 0; border-bottom: 1px solid var(--border-hover); outline: none; color: var(--text-primary); font-family: inherit; padding: 0; }
.rp-todo-desc { margin: 4px 0 0; font-size: 14px; color: var(--text-secondary); }
.rp-todo-status { margin-top: 12px; display: flex; align-items: center; gap: 8px; font-size: 12px; color: var(--text-tertiary); }
`;

export function renderAgentDefinedSection(): string {
  const loginItem = item({
    name: "A2UI 登入卡（generate_form）",
    exportName: "generate_form",
    path: "apps/agent/src/form.py",
    state: "agent",
    show: "replica",
    propsSummary: "Card → Column → [header(Text h2 + caption), TextField×2, Button, Divider, Row(caption + Button)]；工具文件註明不會驗證或儲存任何東西",
    note: `<div>
<p>代理輸出的是 0.8 風格 <code>surfaceUpdate／beginRendering</code> 與巢狀 <code>{Card:{…}}</code>；app 的 @copilotkit/a2ui-renderer 走 0.9 的 <code>createSurface／updateComponents</code>，且 app 目錄只註冊 Table，所以正式對話裡它不會被畫出來（前端也刻意忽略這個工具）。</p>
<p>上面是依結構靜態複刻；basicCatalog 的 0.9 格式真實渲染需要 @copilotkit/a2ui-renderer，用本機 /gallery 的截圖（截圖裡上半是同一份複刻、下半是真渲染）。</p>
</div>`,
    body: `<div class="gal-stack">
  ${loginReplica()}
  ${shot("a2ui-login.png", "A2UI 登入卡：上半是靜態複刻，下半是 basicCatalog 以 0.9 格式真實渲染出的 Welcome back 表單", "本機 /gallery 按「用 basicCatalog 真實渲染（0.9 格式）」後；底部的 toast 是同一輪截圖裡其他示範留下的", { maxWidth: 480 })}
  ${details("餵給 basicCatalog 的 0.9 格式元件定義（14 個扁平元件）", codeBlock(JSON.stringify(LOGIN_COMPONENTS, null, 2)))}
</div>`,
  });

  const todoItem = item({
    name: "待辦卡片（manage_todos 的 Todo 型別）",
    exportName: "Todo { id, title, description, emoji, status }",
    path: "apps/agent/src/todos.py · 已刪除的 apps/app/src/components/example-canvas/todo-card.tsx",
    state: "agent",
    show: "replica",
    propsSummary: "重建自 df2a78f 之前的 todo-card：emoji 選擇（5 個）、標題行內編輯、完成切換、hover 刪除",
    note: `<p>代理仍保留 manage_todos／get_todos 工具並寫入 state.todos，但前端已沒有任何元件讀它；這是重建版，本地 state。</p><p>點 emoji 換圖示、點標題行內編輯（Enter 確定、Esc 取消）、勾選切換完成、hover 右上角刪除；全部刪光會出現重設。</p>`,
    body: `<div class="gal-stack">
  <div class="gal-stack" id="rp-todos">${TODO_FIXTURES.map(todoCard).join("")}</div>
  <button type="button" class="gal-btn gal-btn--small" id="rp-todos-reset" hidden>重設待辦</button>
</div>`,
  });

  const toolsItem = item({
    name: "代理工具與前端渲染器對照",
    path: "apps/agent/main.py · apps/app/src/hooks/use-generative-ui-examples.tsx",
    state: "agent",
    show: "computed",
    demo: "plain",
    wide: true,
    body: table(
      ["工具", "定義位置", "有註冊", "前端渲染"],
      AGENT_TOOLS.map((tool) => [`<code>${esc(tool.name)}</code>`, `<span class="gal-path">${esc(tool.file)}</span>`, tool.registered ? "是" : badge("否", "fail"), esc(tool.frontend)]),
      { dense: true },
    ),
  });

  const script = `<script>(function(){
var list=document.getElementById('rp-todos');if(!list)return;
var initial=list.innerHTML,reset=document.getElementById('rp-todos-reset');
function card(el){return el.closest('.rp-todo');}
function setDone(c,done){c.dataset.done=String(done);var box=c.querySelector('.rp-todo-check');if(box)box.checked=done;var label=c.querySelector('.rp-todo-status span');if(label)label.textContent=done?'completed':'pending';}
function startEdit(c){var title=c.querySelector('.rp-todo-title'),input=c.querySelector('.rp-todo-edit');input.value=title.textContent.trim();title.hidden=true;input.hidden=false;input.focus();input.select();}
function endEdit(c,commit){var title=c.querySelector('.rp-todo-title'),input=c.querySelector('.rp-todo-edit');if(input.hidden)return;if(commit){var value=input.value.trim();if(value)title.textContent=value;}input.hidden=true;title.hidden=false;}
function checkEmpty(){if(reset)reset.hidden=list.querySelector('.rp-todo')!==null;}
list.addEventListener('click',function(event){var button=event.target.closest('button');if(!button)return;var c=card(button);if(!c)return;
if(button.classList.contains('rp-todo-del')){c.remove();checkEmpty();return;}
if(button.classList.contains('rp-todo-emoji')){var picker=c.querySelector('.rp-todo-picker');picker.hidden=!picker.hidden;return;}
if(button.dataset.emoji){c.querySelector('.rp-todo-emoji').textContent=button.dataset.emoji;c.querySelector('.rp-todo-picker').hidden=true;return;}
if(button.classList.contains('rp-todo-title'))startEdit(c);});
list.addEventListener('change',function(event){if(event.target.classList.contains('rp-todo-check'))setDone(card(event.target),event.target.checked);});
list.addEventListener('focusout',function(event){if(event.target.classList.contains('rp-todo-edit'))endEdit(card(event.target),true);});
list.addEventListener('keydown',function(event){if(!event.target.classList.contains('rp-todo-edit'))return;if(event.key==='Enter')event.target.blur();if(event.key==='Escape')endEdit(card(event.target),false);});
if(reset)reset.addEventListener('click',function(){list.innerHTML=initial;checkEmpty();});
checkEmpty();
})();</script>`;

  const intro = `<p>有些 UI 不是 React 元件，而是代理端用資料描述的：<code>generate_form</code> 回傳一份 A2UI 登入卡 JSON，<code>manage_todos</code> 維護待辦狀態（對應的 React 卡片已在 commit df2a78f 刪除）。這裡把它們渲染出來，並列出代理註冊的工具與前端渲染器的對照。</p>`;

  const body = `<style>${REPLICA_CSS}</style>
<div class="rp-agent">
<div class="gal-grid gal-grid--two">
${loginItem}
${todoItem}
</div>
${toolsItem}
</div>
${script}`;

  return section("agent-defined", intro, body);
}
