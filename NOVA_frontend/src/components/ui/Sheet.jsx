import { useEffect } from "react"
import { createPortal } from "react-dom"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

// Full-height slide-in panel (mobile nav). Slides in from the right.
export function Sheet({ open, onClose, children, side = "right", className }) {
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
    <div className="fixed inset-0 z-[100]">
      <div className="absolute inset-0 bg-cf-black/50" onClick={onClose} aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          "absolute top-0 flex h-full w-[85%] max-w-sm flex-col bg-cf-black p-6 text-cf-white",
          side === "right" ? "right-0" : "left-0",
          className,
        )}
        style={{
          animation: `cf-sheet-in 240ms ease-out both`,
        }}
      >
        <button
          onClick={onClose}
          aria-label="Close menu"
          className="cf-focus-ring absolute right-5 top-5 rounded-full p-1.5 text-cf-white/80 hover:bg-cf-white/10"
        >
          <X className="h-5 w-5" />
        </button>
        {children}
      </div>
      <style>{`@keyframes cf-sheet-in{from{transform:translateX(${side === "right" ? "100%" : "-100%"});}to{transform:translateX(0);}}`}</style>
    </div>,
    document.body,
  )
}
