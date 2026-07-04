import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"

/*
  ScrollReveal — Reusable intersection observer wrapper for smooth reveals.
  Relies on .lnd-frame, .lnd-frame--visible, .lnd-frame--hidden in landing.css
*/

export function ScrollReveal({
  children,
  className,
  delay = 0,
  threshold = 0.2,
  triggerOnce = true,
  as: Component = "div",
}) {
  const ref = useRef(null)
  const [revealed, setRevealed] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRevealed(true)
          if (triggerOnce) observer.disconnect()
        } else if (!triggerOnce) {
          setRevealed(false)
        }
      },
      { threshold },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold, triggerOnce])

  return (
    <Component
      ref={ref}
      className={cn(
        "lnd-frame",
        revealed ? "lnd-frame--visible" : "lnd-frame--hidden",
        className
      )}
      style={{ transitionDelay: `${delay}s` }}
    >
      {children}
    </Component>
  )
}
