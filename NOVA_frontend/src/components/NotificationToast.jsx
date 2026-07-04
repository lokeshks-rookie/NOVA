import { createPortal } from "react-dom"
import { Check, X, Info, AlertTriangle } from "lucide-react"
import { useApp } from "@/context/AppContext"
import { cn } from "@/lib/utils"

/*
  NotificationToast host — renders active toasts bottom-right.
  Each toast auto-dismisses after 4s (handled in AppContext).
*/
const ICONS = { success: Check, error: AlertTriangle, info: Info }

export function NotificationToast() {
  const { toasts, removeToast } = useApp()

  return createPortal(
    <div className="pointer-events-none fixed bottom-4 right-4 z-[200] flex w-full max-w-sm flex-col gap-2 px-4 sm:px-0">
      {toasts.map((t) => {
        const Icon = ICONS[t.variant] || Info
        return (
          <div
            key={t.id}
            role="status"
            className="cf-slide-up pointer-events-auto flex items-start gap-3 rounded-xl border border-cf-line bg-cf-black p-4 text-cf-white"
          >
            <span
              className={cn(
                "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full",
                t.variant === "error" ? "bg-cf-danger text-cf-white" : "bg-cf-yellow text-cf-black",
              )}
            >
              <Icon className="h-3.5 w-3.5" />
            </span>
            <div className="flex-1">
              {t.title && <p className="text-sm font-medium">{t.title}</p>}
              {t.message && <p className="mt-0.5 text-sm text-cf-white/70">{t.message}</p>}
            </div>
            <button
              onClick={() => removeToast(t.id)}
              aria-label="Dismiss notification"
              className="cf-focus-ring -mr-1 -mt-1 rounded-full p-1 text-cf-white/60 hover:text-cf-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )
      })}
    </div>,
    document.body,
  )
}
