import { useState } from "react"
import { Plus, Minus } from "lucide-react"
import { cn } from "@/lib/utils"

/*
  Accordion (§5): thin horizontal dividers, plus/minus icon on the right,
  generous vertical padding per row. Used for FAQ and claim status details.
  
  variant="dark"  → white text on dark bg (landing page FAQ)
  variant="light" → black text on light bg (profile/settings page)
*/
export function Accordion({ items, className, defaultOpen = null, variant = "light" }) {
  const [openId, setOpenId] = useState(defaultOpen)

  const isDark = variant === "dark"

  return (
    <div className={cn(
      isDark ? "divide-y border-y divide-cf-white/10 border-cf-white/10" : "space-y-4",
      className
    )}>
      {items.map((item) => {
        const isOpen = openId === item.id
        return (
          <div key={item.id} className={cn(!isDark && "bg-cf-white rounded-2xl border border-cf-line overflow-hidden")}>
            <button
              onClick={() => setOpenId(isOpen ? null : item.id)}
              aria-expanded={isOpen}
              className={cn(
                "cf-focus-ring flex w-full items-center justify-between gap-4 text-left",
                isDark ? "py-6" : "p-5"
              )}
            >
              <span className={cn(
                "text-[17px] font-medium",
                isDark ? "text-cf-white" : "text-cf-black"
              )}>{item.question}</span>
              <span className={cn(
                "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border",
                isDark ? "border-cf-white/10 text-cf-white" : "border-cf-black text-cf-black"
              )}>
                {isOpen ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              </span>
            </button>
            {isOpen && (
              <div className={cn(
                "cf-fade-in text-[15px] leading-relaxed",
                isDark ? "pb-6 pr-10 text-cf-white/70" : "px-5 pb-5 text-cf-black/70"
              )}>
                {item.answer}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
