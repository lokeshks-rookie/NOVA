import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"

/*
  ScrollFrame — Global Transition System (Section 1 of landing prompt)

  Wraps each landing page "frame" (full-viewport section). As the frame
  scrolls into view it rises in with translateY(40px→0) + opacity(0→1).
  The outgoing frame slightly scales down (1→0.97) and dims.

  Driven by IntersectionObserver, feels tied to the scroll gesture.
  prefers-reduced-motion: simple opacity crossfade, no translate/scale.
*/
export function ScrollFrame({ children, className, id, ...props }) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
        }
      },
      {
        threshold: 0.08,
        rootMargin: "0px 0px -60px 0px",
      },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <section
      ref={ref}
      id={id}
      className={cn(
        "lnd-frame",
        visible ? "lnd-frame--visible" : "lnd-frame--hidden",
        className,
      )}
      {...props}
    >
      {children}
    </section>
  )
}
