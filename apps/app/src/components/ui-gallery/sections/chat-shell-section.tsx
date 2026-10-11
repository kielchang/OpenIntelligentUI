"use client";

import Image from "next/image";
import { useState } from "react";
import { CopilotChat, useAgent } from "@copilotkit/react-core/v2";
import { KeyGatedChatView } from "@/components/chat/key-gated-chat-view";
import { ReaderScrollView } from "@/components/chat/reader-scroll-view";
import { AnswerMarkdown } from "@/components/chat/answer-markdown";
import { ProviderKeysDialog } from "@/components/chat/provider-keys-dialog";
import { useProviderKeys } from "@/components/chat/provider-keys";
import { ChatErrorBanner } from "@/components/chat/error-banner";
import { useExampleSuggestions } from "@/hooks/use-example-suggestions";
import { useTheme } from "@/hooks/use-theme";
import { GallerySection } from "../gallery-section";
import { GalleryItem } from "../gallery-item";
import { useGalleryToast } from "../gallery-toast";

/** 與 app/page.tsx 相同的標頭標記；按鈕行為一致（New chat、API keys） */
function ChatHeaderReplica() {
  const { agent } = useAgent();
  const { newChat, hasKeys, setKeysOpen } = useProviderKeys();
  return (
    <header className="chat-header">
      <span className="chat-name">Open Intelligent UI</span>
      <nav aria-label="Main navigation">
        <button type="button" onClick={newChat} disabled={agent.isRunning}>
          New chat
        </button>
        <button type="button" onClick={() => setKeysOpen(true)} disabled={agent.isRunning} aria-haspopup="dialog">
          API keys{hasKeys ? " •" : ""}
        </button>
        <a href="https://github.com/CopilotKit/OpenIntelligentUI" target="_blank" rel="noopener noreferrer">
          GitHub ↗
        </a>
        <a className="chat-brand" href="https://copilotkit.ai" target="_blank" rel="noopener noreferrer">
          <Image src="/copilotkit-logo.svg" alt="CopilotKit" width={125} height={28} />
        </a>
      </nav>
    </header>
  );
}

function EmbeddedChat() {
  useExampleSuggestions();
  const { hasKeys } = useProviderKeys();
  return (
    <CopilotChat
      chatView={KeyGatedChatView}
      autoScroll={false}
      scrollView={ReaderScrollView}
      messageView={{ assistantMessage: { markdownRenderer: AnswerMarkdown } }}
      labels={{
        welcomeMessageText: "What would you like to explore?",
        chatInputPlaceholder: "Ask anything…",
        chatDisclaimerText: hasKeys
          ? "AI can make mistakes. Check important details."
          : "Add your OpenAI and Jev API keys to start. Keys clear when you refresh.",
      }}
    />
  );
}

function ThemeSwitch() {
  const { theme, setTheme } = useTheme();
  return (
    <div className="gal-seg" role="group" aria-label="app 主題">
      {(["light", "dark", "system"] as const).map((item) => (
        <button key={item} type="button" aria-pressed={theme === item} onClick={() => setTheme(item)}>
          {item}
        </button>
      ))}
    </div>
  );
}

export function ChatShellSection() {
  const { agent } = useAgent();
  const { keysOpen, setKeysOpen } = useProviderKeys();
  const { toast } = useGalleryToast();
  const [bannerVisible, setBannerVisible] = useState(true);

  return (
    <GallerySection
      id="chat-shell"
      intro={
        <>
          <p>
            正式畫面 <code>apps/app/src/app/page.tsx</code> 只有這幾樣東西：固定標頭、<code>CopilotChat</code>（歡迎畫面、四顆建議、輸入框）、金鑰對話框與錯誤橫幅。
            下面嵌的是<strong>同一個 CopilotKit provider 與同一條對話 thread</strong>，不是截圖。
          </p>
          <p>
            沒有金鑰時，送出訊息或點建議會被 <code>KeyGatedChatView</code> 攔下並打開對話框、保留草稿；這正是正式流程。沒有代理後端時，「Test connection」會回真實的錯誤訊息。
          </p>
        </>
      }
    >
      {keysOpen && <ProviderKeysDialog onClose={() => setKeysOpen(false)} disabled={agent.isRunning} />}

      <GalleryItem
        id="item-chat-shell" name="聊天外殼（標頭 + CopilotChat）"
        exportName="HomePage"
        path="apps/app/src/app/page.tsx"
        state="mounted"
        demo="plain"
        wide
        propsSummary="CopilotChat props：chatView=KeyGatedChatView、scrollView=ReaderScrollView、autoScroll=false、markdownRenderer=AnswerMarkdown、labels 三則"
        note={
          <p>
            歡迎標題 <code>h1</code> 由 chat.css 降為字重 500；建議 pill 上方的「Try these Prompts」是 globals.css 用 <code>::before</code> 加的；免責聲明被 CSS 隱藏。
            <code>ReaderScrollView</code> 拿掉自動捲動，只有送出新問題時才把問題捲到頂端。
          </p>
        }
      >
        <div className="gal-chat-shell chat-app" style={{ height: 640 }}>
          <ChatHeaderReplica />
          <main className="chat-main">
            {bannerVisible && (
              <ChatErrorBanner
                message="The agent is unavailable. Check your connection or local agent configuration, then retry."
                busy={agent.isRunning}
                onRetry={() => {
                  toast("示範：正式版會重新執行 copilotkit.runAgent()");
                  setBannerVisible(false);
                }}
                onOpenKeys={() => setKeysOpen(true)}
              />
            )}
            <div className="chat-content">
              <EmbeddedChat />
            </div>
          </main>
        </div>
      </GalleryItem>

      <div className="gal-grid">
        <GalleryItem
          name="API 金鑰對話框"
          exportName="ProviderKeysDialog"
          path="apps/app/src/components/chat/provider-keys-dialog.tsx"
          state="mounted"
          propsSummary="{ onClose, disabled? }；原生 <dialog>.showModal()；狀態：未驗證 / 檢查中 / 兩把都可用 / 已啟用"
          note={<p>金鑰只放在記憶體（ProviderKeysProvider），儲存或清除都會換新的 session key 重新掛載 CopilotKit。</p>}
        >
          <div className="gal-actions">
            <button type="button" className="gal-btn gal-btn--primary" onClick={() => setKeysOpen(true)}>
              開啟對話框
            </button>
            <span className="gal-meta">輸入任意兩個值按 Test connection，可看到錯誤狀態。</span>
          </div>
        </GalleryItem>

        <GalleryItem
          name="錯誤橫幅"
          exportName="ChatErrorBanner"
          path="apps/app/src/components/chat/error-banner.tsx"
          state="mounted"
          propsSummary="{ message, busy?, onRetry, onOpenKeys }；原本是 page.tsx 內的 JSX，為了共用抽成元件"
        >
          <div className="gal-stack">
            <ChatErrorBanner
              message="Something interrupted the answer. Try again or send another message."
              onRetry={() => toast("示範：Retry answer")}
              onOpenKeys={() => setKeysOpen(true)}
            />
            <ChatErrorBanner message="（busy 狀態：代理執行中，按鈕停用）" busy onRetry={() => {}} onOpenKeys={() => {}} />
            {!bannerVisible && (
              <button type="button" className="gal-btn gal-btn--small" onClick={() => setBannerVisible(true)}>
                把外殼裡的橫幅放回去
              </button>
            )}
          </div>
        </GalleryItem>

        <GalleryItem
          name="主題切換"
          exportName="ThemeProvider / useTheme"
          path="apps/app/src/hooks/use-theme.tsx"
          state="mounted"
          propsSummary="theme: light | dark | system；在 <html> 切 .light/.dark class；預設 light"
          note={<p>正式 UI 沒有任何切換鈕，只有代理可呼叫的 <code>toggleTheme</code> 前端工具；沙箱 iframe 不跟這個 class 走。</p>}
        >
          <ThemeSwitch />
        </GalleryItem>

        <GalleryItem
          name="閱讀模式捲動容器"
          exportName="ReaderScrollView"
          path="apps/app/src/components/chat/reader-scroll-view.tsx"
          state="mounted"
          propsSummary="取代 CopilotChatView.ScrollView；role=region、tabIndex=0、overflow-anchor:none"
        >
          <ReaderScrollView>
            <div style={{ height: 160, padding: 12, fontSize: 13, color: "var(--text-secondary)" }}>
              這個容器自己不捲動到底部；串流中的文字與長高的視覺不會搶走閱讀位置。<br />
              <span style={{ display: "block", height: 200 }} />
              捲到這裡表示 overflow-y:auto 生效。
            </div>
          </ReaderScrollView>
        </GalleryItem>
      </div>
    </GallerySection>
  );
}
