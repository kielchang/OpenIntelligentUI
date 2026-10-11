"use client";

import { useEffect, useState } from "react";
import { A2UIProvider, A2UIRenderer, basicCatalog, useA2UIActions } from "@copilotkit/a2ui-renderer";
import { GallerySection } from "../gallery-section";
import { GalleryItem } from "../gallery-item";
import { RenderBoundary } from "../render-boundary";
import { useGalleryToast } from "../gallery-toast";
import { AGENT_TOOLS } from "../analysis-content";
import { TODO_FIXTURES, type TodoFixture } from "../gallery-fixtures";

const LOGIN_SURFACE = "gallery-login";

/** form.py 的登入卡，改寫成 A2UI v0.9 的扁平元件格式餵給 basicCatalog */
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

function LoginSurface() {
  const { processMessages } = useA2UIActions();
  useEffect(() => {
    processMessages([
      { createSurface: { surfaceId: LOGIN_SURFACE, catalogId: "https://a2ui.org/specification/v0_9/basic_catalog.json" } },
      { updateComponents: { surfaceId: LOGIN_SURFACE, components: LOGIN_COMPONENTS } },
    ]);
  }, [processMessages]);
  return <A2UIRenderer surfaceId={LOGIN_SURFACE} />;
}

/** 與 form.py 結構一一對應的靜態複刻（Card → Column → …） */
function LoginReplica() {
  return (
    <div style={{ maxWidth: 360, margin: "0 auto", padding: 20, border: "1px solid var(--border-default)", borderRadius: 12, background: "var(--surface-primary)", display: "grid", gap: 12 }}>
      <div style={{ textAlign: "center" }}>
        <h4 style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>Welcome back</h4>
        <small style={{ color: "var(--text-secondary)" }}>Sign in to your account</small>
      </div>
      <label style={{ display: "grid", gap: 4, fontSize: 13, fontWeight: 600 }}>
        Email
        <input type="text" placeholder="Email address" readOnly style={{ padding: 8, border: "1px solid var(--border-default)", borderRadius: 6, fontWeight: 400 }} />
      </label>
      <label style={{ display: "grid", gap: 4, fontSize: 13, fontWeight: 600 }}>
        Password
        <input type="password" placeholder="Password" readOnly style={{ padding: 8, border: "1px solid var(--border-default)", borderRadius: 6, fontWeight: 400 }} />
      </label>
      <button type="button" className="gal-btn gal-btn--primary" style={{ justifyContent: "center" }}>Sign in</button>
      <hr style={{ border: 0, borderTop: "1px solid var(--border-default)", margin: 0 }} />
      <div style={{ display: "flex", justifyContent: "center", gap: 8, fontSize: 12, color: "var(--text-secondary)", alignItems: "center" }}>
        Don&apos;t have an account?
        <button type="button" className="gal-btn gal-btn--small">Sign up</button>
      </div>
    </div>
  );
}

const EMOJI_OPTIONS = ["✅", "🔥", "🎯", "💡", "🚀"];

/** 依 commit df2a78f 刪除前的 example-canvas/todo-card.tsx 精簡重建 */
function TodoCardReplica({ todo, onChange, onDelete }: { todo: TodoFixture; onChange: (next: TodoFixture) => void; onDelete: () => void }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(todo.title);
  const [picker, setPicker] = useState(false);
  const done = todo.status === "completed";
  return (
    <div className={`group relative rounded-2xl p-5 border transition-all ${done ? "bg-neutral-100 border-neutral-200 dark:bg-neutral-800/50 dark:border-neutral-700" : "bg-white border-neutral-300 dark:bg-neutral-800 dark:border-neutral-700"}`}>
      <button type="button" onClick={onDelete} aria-label="Delete todo" className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 rounded-full p-1 text-neutral-400 hover:text-neutral-600 dark:text-neutral-500">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
      </button>
      <div className="relative inline-block mb-3">
        <button type="button" aria-label="Change emoji" onClick={() => setPicker((open) => !open)} className={`block text-3xl leading-none rounded-xl p-2 ${done ? "bg-neutral-200 dark:bg-neutral-700" : "bg-neutral-100 dark:bg-neutral-700/50"}`}>
          {todo.emoji}
        </button>
        {picker && (
          <div className="absolute top-0 left-full ml-2 z-10 flex gap-1 p-1.5 rounded-full bg-white border border-neutral-300 shadow-lg dark:bg-neutral-800 dark:border-neutral-600">
            {EMOJI_OPTIONS.map((emoji) => (
              <button key={emoji} type="button" className="text-lg w-8 h-8 flex items-center justify-center rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-700" onClick={() => { onChange({ ...todo, emoji }); setPicker(false); }}>
                {emoji}
              </button>
            ))}
          </div>
        )}
      </div>
      {editing ? (
        <input
          autoFocus
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onBlur={() => { onChange({ ...todo, title: draft.trim() || todo.title }); setEditing(false); }}
          onKeyDown={(event) => { if (event.key === "Enter") (event.target as HTMLInputElement).blur(); if (event.key === "Escape") { setDraft(todo.title); setEditing(false); } }}
          className="w-full text-base font-semibold bg-transparent border-b border-neutral-300 outline-none dark:text-neutral-100"
        />
      ) : (
        <button type="button" onClick={() => setEditing(true)} className={`text-left text-base font-semibold ${done ? "line-through text-neutral-500" : "text-neutral-900 dark:text-neutral-100"}`}>
          {todo.title}
        </button>
      )}
      <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">{todo.description}</p>
      <label className="mt-3 flex items-center gap-2 text-xs text-neutral-500">
        <input type="checkbox" checked={done} onChange={(event) => onChange({ ...todo, status: event.target.checked ? "completed" : "pending" })} />
        {done ? "completed" : "pending"}
      </label>
    </div>
  );
}

export function AgentDefinedSection() {
  const { toast } = useGalleryToast();
  const [tryLive, setTryLive] = useState(false);
  const [todos, setTodos] = useState<TodoFixture[]>(TODO_FIXTURES);

  return (
    <GallerySection
      id="agent-defined"
      intro={
        <>
          <p>
            有些 UI 不是 React 元件，而是代理端用資料描述的：<code>generate_form</code> 回傳一份 A2UI 登入卡 JSON，<code>manage_todos</code> 維護待辦狀態（對應的 React 卡片已在 commit df2a78f 刪除）。
            這裡把它們渲染出來，並列出代理註冊的工具與前端渲染器的對照。
          </p>
        </>
      }
    >
      <div className="gal-grid gal-grid--two">
        <GalleryItem
          name="A2UI 登入卡（generate_form）"
          exportName="generate_form"
          path="apps/agent/src/form.py"
          state="agent"
          propsSummary="Card → Column → [header(Text h2 + caption), TextField×2, Button, Divider, Row(caption + Button)]；工具文件註明不會驗證或儲存任何東西"
          note={
            <div>
              <p>代理輸出的是 0.8 風格 <code>surfaceUpdate／beginRendering</code> 與巢狀 <code>{"{Card:{…}}"}</code>；app 的 @copilotkit/a2ui-renderer 走 0.9 的 <code>createSurface／updateComponents</code>，且 app 目錄只註冊 Table，所以正式對話裡它不會被畫出來（前端也刻意忽略這個工具）。</p>
              <p>左邊是依結構靜態複刻；按鈕可試著用套件內建的 basicCatalog 以 0.9 格式真實渲染。</p>
            </div>
          }
        >
          <div className="gal-stack">
            <LoginReplica />
            <div className="gal-actions">
              <button type="button" className="gal-btn gal-btn--small" onClick={() => setTryLive((on) => !on)}>
                {tryLive ? "關閉 basicCatalog 渲染" : "用 basicCatalog 真實渲染（0.9 格式）"}
              </button>
            </div>
            {tryLive && (
              <RenderBoundary fallback={<p className="gal-note">basicCatalog 渲染時丟出例外；這個版本的 renderer 不接受這份元件定義。</p>}>
                <A2UIProvider catalog={basicCatalog} onAction={(action) => toast(`A2UI action：${JSON.stringify(action).slice(0, 120)}`)}>
                  <LoginSurface />
                </A2UIProvider>
              </RenderBoundary>
            )}
          </div>
        </GalleryItem>

        <GalleryItem
          name="待辦卡片（manage_todos 的 Todo 型別）"
          exportName="Todo { id, title, description, emoji, status }"
          path="apps/agent/src/todos.py · 已刪除的 apps/app/src/components/example-canvas/todo-card.tsx"
          state="agent"
          propsSummary="重建自 df2a78f 之前的 todo-card：emoji 選擇（5 個）、標題行內編輯、完成切換、hover 刪除"
          note={<p>代理仍保留 manage_todos／get_todos 工具並寫入 state.todos，但前端已沒有任何元件讀它；這是重建版，本地 state。</p>}
        >
          <div className="gal-stack">
            {todos.map((todo) => (
              <TodoCardReplica
                key={todo.id}
                todo={todo}
                onChange={(next) => setTodos((list) => list.map((item) => (item.id === next.id ? next : item)))}
                onDelete={() => setTodos((list) => list.filter((item) => item.id !== todo.id))}
              />
            ))}
            {todos.length === 0 && (
              <button type="button" className="gal-btn gal-btn--small" onClick={() => setTodos(TODO_FIXTURES)}>
                重設待辦
              </button>
            )}
          </div>
        </GalleryItem>
      </div>

      <GalleryItem name="代理工具與前端渲染器對照" path="apps/agent/main.py · apps/app/src/hooks/use-generative-ui-examples.tsx" state="agent" demo="plain" wide>
        <div className="gal-table-wrap">
          <table className="gal-table gal-table--dense">
            <thead>
              <tr>
                <th>工具</th>
                <th>定義位置</th>
                <th>有註冊</th>
                <th>前端渲染</th>
              </tr>
            </thead>
            <tbody>
              {AGENT_TOOLS.map((tool) => (
                <tr key={tool.name}>
                  <td><code>{tool.name}</code></td>
                  <td><span className="gal-path">{tool.file}</span></td>
                  <td>{tool.registered ? "是" : <span className="gal-badge" data-state="fail">否</span>}</td>
                  <td>{tool.frontend}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GalleryItem>
    </GallerySection>
  );
}
