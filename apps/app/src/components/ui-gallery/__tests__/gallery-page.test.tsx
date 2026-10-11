import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { Providers } from "@/app/providers";
import { UiGalleryPage } from "..";
import { GALLERY_SECTIONS } from "../section-list";
import { SEND_PROMPT_EVENT, type SendPromptRequest } from "@/lib/sandbox/sandbox-functions";

// 與 open-generative-ui-renderer.test.tsx 相同的 seam：不載入真正的 @jetbrains/websandbox
vi.mock("@/components/generative-ui/open-generative-ui/websandbox-loader", () => ({
  loadWebsandbox: async () => ({
    create: (_api: unknown, options: { frameContainer: HTMLElement }) => {
      const iframe = document.createElement("iframe");
      options.frameContainer.appendChild(iframe);
      return { iframe, promise: new Promise(() => {}), run: vi.fn(), destroy: vi.fn() };
    },
  }),
}));

function stubBrowserApis() {
  HTMLDialogElement.prototype.showModal = function () {
    this.setAttribute("open", "");
  };
  HTMLDialogElement.prototype.close = function () {
    this.removeAttribute("open");
  };
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
      takeRecords() {
        return [];
      }
    },
  );
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url: RequestInfo | URL, init?: RequestInit) => {
      const body = typeof init?.body === "string" ? JSON.parse(init.body) : {};
      if (body.method === "info" || String(url).endsWith("/info")) {
        return Response.json({ version: "1.55.2-next.1", agents: { default: { description: "Test agent" } } });
      }
      const input = body.body ?? body;
      const events = [
        { type: "RUN_STARTED", threadId: input.threadId, runId: input.runId },
        { type: "MESSAGES_SNAPSHOT", messages: [] },
        { type: "RUN_FINISHED", threadId: input.threadId, runId: input.runId },
      ];
      return new Response(events.map((event) => `data: ${JSON.stringify(event)}\n\n`).join(""), {
        headers: { "Content-Type": "text/event-stream" },
      });
    }),
  );
}

describe("UiGalleryPage", () => {
  beforeEach(stubBrowserApis);
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("renders every section with its navigation entry and the four badge states", () => {
    render(
      <Providers>
        <UiGalleryPage />
      </Providers>,
    );
    GALLERY_SECTIONS.forEach((section) => {
      expect(screen.getByRole("heading", { level: 2, name: section.label })).toBeInTheDocument();
    });
    const nav = screen.getByRole("navigation", { name: "區塊導覽" });
    expect(within(nav).getAllByRole("link")).toHaveLength(GALLERY_SECTIONS.length);
    ["已掛載", "未掛載", "代理端定義", "純 CSS"].forEach((label) => {
      expect(screen.getAllByText(label).length).toBeGreaterThan(0);
    });
    expect(screen.getAllByRole("button", { name: "開始串流重播" }).length).toBeGreaterThanOrEqual(11);
  });

  it("claims sandbox sendPrompt requests before the chat bridge can run the agent", () => {
    render(
      <Providers>
        <UiGalleryPage />
      </Providers>,
    );
    const resolve = vi.fn();
    const reject = vi.fn();
    let claimed = false;
    const request: SendPromptRequest = {
      text: "Explain this split",
      claim: () => {
        if (claimed) return false;
        claimed = true;
        return true;
      },
      resolve,
      reject,
    };
    act(() => {
      window.dispatchEvent(new CustomEvent(SEND_PROMPT_EVENT, { detail: request }));
    });
    expect(resolve).toHaveBeenCalledTimes(1);
    expect(reject).not.toHaveBeenCalled();
    expect(screen.getByText(/模擬送出（未連接代理）：Explain this split/)).toBeInTheDocument();
  });

  it("links every design-method rule to an element that exists on the page", () => {
    render(
      <Providers>
        <UiGalleryPage />
      </Providers>,
    );
    const anchors = Array.from(document.querySelectorAll<HTMLAnchorElement>('#method a[href^="#"], #catalogs a[href^="#"]'));
    expect(anchors.length).toBeGreaterThan(40);
    anchors.forEach((anchor) => {
      const target = anchor.getAttribute("href")!.slice(1);
      expect(document.getElementById(target), `#${target}`).not.toBeNull();
    });
  });

  it("renders the A2UI basic catalog live and reports button actions as toasts", async () => {
    render(
      <Providers>
        <UiGalleryPage />
      </Providers>,
    );
    expect(await screen.findByRole("heading", { level: 1, name: "A2UI 基本目錄 h1 標題" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "方案 A" })).toBeInTheDocument();
    expect(screen.getByText(/formatString：Sample Lee/)).toBeInTheDocument();
    expect(screen.getByRole("slider", { name: /Volume/ })).toHaveValue("40");
    fireEvent.click(screen.getByRole("button", { name: "Primary：送出 action" }));
    expect(await screen.findByText(/A2UI action：submit（來自 btn-primary）/)).toBeInTheDocument();
  });

  it("opens the real provider keys dialog from the chat-shell section", () => {
    render(
      <Providers>
        <UiGalleryPage />
      </Providers>,
    );
    fireEvent.click(screen.getByRole("button", { name: "開啟對話框" }));
    expect(screen.getByRole("heading", { name: "Add API keys to start" })).toBeInTheDocument();
  });
});
