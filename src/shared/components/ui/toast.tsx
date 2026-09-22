"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { AlertTriangle, CheckCircle2, Info, X } from "lucide-react";

type ToastTone = "success" | "error" | "info";
type ToastOptions = {
  title: string;
  description?: string;
  tone?: ToastTone;
  duration?: number;
  action?: { label: string; onClick: () => void };
};
type ToastItem = ToastOptions & { id: string; tone: ToastTone };
type ToastContextValue = {
  toast: (options: ToastOptions) => string;
  dismiss: (id: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);
  const timers = useRef(new Map<string, ReturnType<typeof setTimeout>>());

  const dismiss = useCallback((id: string) => {
    const timer = timers.current.get(id);
    if (timer) clearTimeout(timer);
    timers.current.delete(id);
    setItems((current) => current.filter((item) => item.id !== id));
  }, []);

  const toast = useCallback(
    (options: ToastOptions) => {
      const id = crypto.randomUUID();
      const item: ToastItem = {
        ...options,
        id,
        tone: options.tone ?? "info",
      };
      setItems((current) => [...current, item].slice(-4));
      if (options.duration !== 0) {
        const timer = setTimeout(
          () => dismiss(id),
          options.duration ?? (item.tone === "error" ? 6500 : 4500),
        );
        timers.current.set(id, timer);
      }
      return id;
    },
    [dismiss],
  );

  useEffect(
    () => () => {
      for (const timer of timers.current.values()) clearTimeout(timer);
      timers.current.clear();
    },
    [],
  );

  useEffect(() => {
    const syncTarget = () =>
      setPortalTarget(
        document.querySelector<HTMLElement>("dialog[open]") ?? document.body,
      );
    syncTarget();
    const observer = new MutationObserver(syncTarget);
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["open"],
      childList: true,
      subtree: true,
    });
    return () => observer.disconnect();
  }, []);

  const viewport = (
    <div
      aria-label="Notifications"
      className="pointer-events-none fixed inset-x-3 bottom-3 z-[100] flex flex-col items-end gap-3 sm:inset-x-auto sm:bottom-5 sm:right-5 sm:w-[380px]"
    >
      {items.map((item) => {
        const Icon =
          item.tone === "success"
            ? CheckCircle2
            : item.tone === "error"
              ? AlertTriangle
              : Info;
        return (
          <div
            key={item.id}
            role={item.tone === "error" ? "alert" : "status"}
            className={`toast-item pointer-events-auto flex w-full items-start gap-3 rounded-2xl border bg-white p-4 shadow-[0_18px_55px_rgba(32,66,56,0.18)] ${item.tone === "error" ? "border-red-200" : item.tone === "success" ? "border-emerald-200" : "border-border"}`}
          >
            <span
              className={`mt-0.5 grid size-8 shrink-0 place-items-center rounded-full ${item.tone === "error" ? "bg-red-50 text-red-700" : item.tone === "success" ? "bg-emerald-50 text-emerald-700" : "bg-secondary text-primary"}`}
            >
              <Icon size={17} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-foreground">
                {item.title}
              </p>
              {item.description && (
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  {item.description}
                </p>
              )}
              {item.action && (
                <button
                  type="button"
                  className="mt-2 text-xs font-semibold text-primary underline underline-offset-4"
                  onClick={() => {
                    dismiss(item.id);
                    item.action?.onClick();
                  }}
                >
                  {item.action.label}
                </button>
              )}
            </div>
            <button
              type="button"
              aria-label="Dismiss notification"
              className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
              onClick={() => dismiss(item.id)}
            >
              <X size={16} />
            </button>
          </div>
        );
      })}
    </div>
  );

  return (
    <ToastContext.Provider value={{ toast, dismiss }}>
      {children}
      {portalTarget && createPortal(viewport, portalTarget)}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within ToastProvider.");
  return context;
}
