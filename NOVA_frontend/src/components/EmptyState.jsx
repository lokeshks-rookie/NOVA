import { cn } from "@/lib/utils"

/*
  EmptyState — geometric CSS-only illustration (no images) + message + optional CTA.
  Uses brand shapes: black square marker, yellow circle, cream block.
*/
export function EmptyState({ title, message, action, className }) {
  return (
    <div className={cn("flex flex-col items-center justify-center px-6 py-16 text-center", className)}>
      {/* CSS geometric illustration — squares, circle, line (no drop shadows) */}
      <div className="relative mb-8 h-24 w-24" aria-hidden="true">
        <div className="absolute left-0 top-0 h-14 w-14 rounded-lg border-2 border-cf-black" />
        <div className="absolute bottom-0 right-0 h-12 w-12 rounded-full bg-cf-yellow" />
        <div className="absolute bottom-2 left-2 h-3 w-3 bg-cf-black" />
        <div className="absolute right-1 top-2 h-8 w-1.5 rotate-12 rounded-full bg-cf-cream" />
      </div>
      <h3 className="cf-h2 mb-2 max-w-sm text-balance">{title}</h3>
      {message && <p className="mb-6 max-w-md text-pretty text-[15px] leading-relaxed text-cf-muted">{message}</p>}
      {action}
    </div>
  )
}
