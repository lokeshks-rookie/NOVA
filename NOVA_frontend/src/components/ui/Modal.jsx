import { useEffect } from "react"
import { createPortal } from "react-dom"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

/*
  Centered, backdropped modal with slide-up entry (translateY 16px → 0).
  Closes on Escape and backdrop click. Locks body scroll while open.
*/
export function Modal({ open, onClose, title, children, className }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === "Escape" && onClose()
    document.addEventListener("keydown", onKey)
    document.body.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", onKey)
      document.body.style.overflow = ""
    }
  }, [open, onClose])

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-cf-black/50"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn(
          "cf-slide-up relative z-10 w-full max-w-lg rounded-2xl border border-cf-line bg-cf-white p-6",
          className,
        )}
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          {title && <h2 className="cf-h2">{title}</h2>}
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="cf-focus-ring -mr-1 -mt-1 rounded-full p-1.5 text-cf-muted hover:bg-cf-cream hover:text-cf-black"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body,
  )
}
