import { cn } from "@/lib/utils"

// Section eyebrow label with square marker (§3 brand convention: "■ LABEL")
export function Eyebrow({ children, className }) {
  return <span className={cn("cf-eyebrow text-cf-muted", className)}>{children}</span>
}
