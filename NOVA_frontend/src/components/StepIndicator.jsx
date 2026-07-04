import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

/*
  StepIndicator — numbered progress bar (§9 numbered pattern) for report + claim flows.
  Animated fill from left on step change. Numbers shown as 01, 02, ...
*/
export function StepIndicator({ steps, current }) {
  return (
    <div className="w-full">
      <ol className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-2">
        {steps.map((label, i) => {
          const num = String(i + 1).padStart(2, "0")
          const isDone = i < current
          const isActive = i === current
          return (
            <li key={label} className="flex flex-1 items-center gap-3">
              <div className="flex items-center gap-3">
                <span
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors",
                    isDone && "bg-cf-black text-cf-white",
                    isActive && "bg-cf-yellow text-cf-black",
                    !isDone && !isActive && "border border-cf-line text-cf-muted",
                  )}
                >
                  {isDone ? <Check className="h-4 w-4" /> : num}
                </span>
                <span
                  className={cn(
                    "text-sm font-medium",
                    isActive ? "text-cf-black" : "text-cf-muted",
                  )}
                >
                  {label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div className="hidden h-px flex-1 overflow-hidden bg-cf-line sm:block">
                  <div
                    className="h-full bg-cf-black transition-all duration-500"
                    style={{ width: isDone ? "100%" : "0%" }}
                  />
                </div>
              )}
            </li>
          )
        })}
      </ol>
    </div>
  )
}
