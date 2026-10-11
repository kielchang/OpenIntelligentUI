"use client";

/** 聊天頁的錯誤橫幅：重試或開啟 API keys 對話框。首頁與 /gallery 共用同一份標記。 */
export function ChatErrorBanner({
  message,
  busy = false,
  onRetry,
  onOpenKeys,
}: {
  message: string;
  busy?: boolean;
  onRetry: () => void;
  onOpenKeys: () => void;
}) {
  return (
    <div className="chat-error" role="alert">
      <p>{message}</p>
      <button type="button" onClick={onRetry} disabled={busy}>
        Retry answer
      </button>
      <button type="button" className="provider-keys-recover" disabled={busy} onClick={onOpenKeys}>
        API keys
      </button>
    </div>
  );
}
