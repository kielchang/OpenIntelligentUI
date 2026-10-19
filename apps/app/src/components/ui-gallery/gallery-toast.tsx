"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from "react";

interface GalleryToastValue {
  toast: (message: string) => void;
}

const GalleryToastContext = createContext<GalleryToastValue>({ toast: () => {} });

/** 頁內回饋：模擬送出、Try it、Apply 等動作都用它顯示結果，四秒後自動消失。 */
export function GalleryToastProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const toast = useCallback((next: string) => {
    if (timer.current) clearTimeout(timer.current);
    setMessage(next);
    timer.current = setTimeout(() => {
      timer.current = null;
      setMessage(null);
    }, 4000);
  }, []);

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <GalleryToastContext.Provider value={value}>
      {children}
      <div className="gal-toast-region" role="status" aria-live="polite">
        {message && (
          <div className="gal-toast" key={message}>
            {message}
          </div>
        )}
      </div>
    </GalleryToastContext.Provider>
  );
}

export function useGalleryToast() {
  return useContext(GalleryToastContext);
}
