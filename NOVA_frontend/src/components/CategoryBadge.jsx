import { cn } from "@/lib/utils"
import { CATEGORIES } from "@/data/mock"

// Small pill for an item category. Active/selected uses yellow, default is bordered.
export function CategoryBadge({ category, active = false, className }) {
  const cfg = CATEGORIES.find((c) => c.id === category)
  const label = cfg ? cfg.label : category
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
        active ? "bg-cf-yellow text-cf-black" : "border border-cf-line text-cf-muted",
        className,
      )}
    >
      {label}
    </span>
  )
}
