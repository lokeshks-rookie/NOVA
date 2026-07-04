import { forwardRef } from "react"
import { ArrowUpRight } from "lucide-react"
import { cn } from "@/lib/utils"

/*
  Brand buttons (§5):
  - primary: black pill, white text, trailing circular yellow arrow badge that rotates 45° on hover
  - secondary: outline (black border), transparent fill
  - ghost: text-only
  - On dark/yellow backgrounds pass `invert` to flip primary colors.
*/
export const Button = forwardRef(function Button(
  {
    variant = "primary",
    size = "md",
    className,
    children,
    badge = false,
    invert = false,
    as: Comp = "button",
    ...props
  },
  ref,
) {
  const base =
    "cf-cta group inline-flex items-center justify-center gap-2 rounded-full font-medium transition-transform disabled:opacity-50 disabled:pointer-events-none select-none"

  const sizes = {
    sm: "text-sm px-4 py-2",
    md: "text-sm px-5 py-2.5",
    lg: "text-[15px] px-6 py-3",
  }

  const variants = {
    primary: invert
      ? "bg-cf-white text-cf-black hover:scale-[1.02]"
      : "bg-cf-black text-cf-white hover:scale-[1.02]",
    yellow: "bg-cf-yellow text-cf-black hover:scale-[1.02]",
    secondary: invert
      ? "border border-cf-white/60 text-cf-white hover:bg-cf-white/10"
      : "border border-cf-black text-cf-black hover:bg-cf-black/[0.04]",
    ghost: invert ? "text-cf-white hover:bg-cf-white/10" : "text-cf-black hover:bg-cf-black/[0.05]",
    danger: "bg-cf-danger text-cf-white hover:scale-[1.02]",
  }

  return (
    <Comp ref={ref} className={cn(base, sizes[size], variants[variant], className)} {...props}>
      <span>{children}</span>
      {badge && (
        <span
          className={cn(
            "cf-cta-badge flex h-6 w-6 items-center justify-center rounded-full",
            variant === "yellow" ? "bg-cf-black text-cf-yellow" : "bg-cf-yellow text-cf-black",
          )}
        >
          <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={2} />
        </span>
      )}
    </Comp>
  )
})
