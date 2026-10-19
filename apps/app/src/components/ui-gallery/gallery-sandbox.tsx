"use client";

import { useEffect, useMemo, type ReactNode } from "react";
import { SandboxFunctionsContext, type SandboxFunction } from "@copilotkit/react-core/v2";
import {
  openLinkFunction,
  SEND_PROMPT_EVENT,
  sendPromptParameters,
  type SendPromptRequest,
} from "@/lib/sandbox/sandbox-functions";
import { useGalleryToast } from "./gallery-toast";

/**
 * 展示頁的沙箱橋接：sendPrompt 不會啟動代理，只把文字顯示成 toast；
 * openLink 沿用正式的 HTTPS 驗證版本。
 * 另外在 window 以 capture 階段先認領 SEND_PROMPT_EVENT，確保即使某個渲染器
 * 拿到正式的 sendPrompt，也不會打到 /api/copilotkit。
 */
export function GallerySandboxProvider({ children }: { children: ReactNode }) {
  const { toast } = useGalleryToast();

  const functions = useMemo<SandboxFunction[]>(
    () => [
      {
        name: "sendPrompt",
        description:
          "Gallery stub: shows the prompt as a toast instead of starting an agent run. Call as: await Websandbox.connection.remote.sendPrompt({ text }).",
        parameters: sendPromptParameters,
        handler: async (args: unknown) => {
          const parsed = sendPromptParameters.safeParse(args);
          if (!parsed.success) {
            throw new Error("sendPrompt: enter a non-empty question of at most 4000 characters.");
          }
          await new Promise((resolve) => setTimeout(resolve, 400));
          toast(`模擬送出（未連接代理）：${parsed.data.text}`);
          return { ok: true };
        },
      },
      openLinkFunction,
    ],
    [toast],
  );

  useEffect(() => {
    const handler = (event: Event) => {
      const request = (event as CustomEvent<Partial<SendPromptRequest>>).detail;
      if (!request || typeof request.claim !== "function" || typeof request.resolve !== "function") return;
      if (!request.claim()) return;
      toast(`模擬送出（未連接代理）：${request.text ?? ""}`);
      request.resolve();
    };
    window.addEventListener(SEND_PROMPT_EVENT, handler, { capture: true });
    return () => window.removeEventListener(SEND_PROMPT_EVENT, handler, { capture: true });
  }, [toast]);

  return (
    <SandboxFunctionsContext.Provider value={functions}>{children}</SandboxFunctionsContext.Provider>
  );
}
