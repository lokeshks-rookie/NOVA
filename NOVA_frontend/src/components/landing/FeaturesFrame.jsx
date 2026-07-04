import { useEffect, useRef, useState, useCallback } from "react"
import { Sparkles, Bookmark, Bell } from "lucide-react"

/*
  FeaturesFrame — Frame 4: Features (Section 6)

  Two sub-scenes inside one pinned frame:
  A) AI Assistance — full-screen bold statement
  B) Saved Search Alerts — left-then-right staged entrance

  Pinned-scroll driven. Vertical scroll through 350vh wrapper
  controls scene transitions.
*/

export function FeaturesFrame() {
  const wrapperRef = useRef(null)
  const [progress, setProgress] = useState(0)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener("resize", check, { passive: true })
    return () => window.removeEventListener("resize", check)
  }, [])

  const handleScroll = useCallback(() => {
    const el = wrapperRef.current
    if (!el) return

    const rect = el.getBoundingClientRect()
    const scrolled = -rect.top
    const scrollableRange = el.offsetHeight - window.innerHeight
    setProgress(Math.max(0, Math.min(1, scrolled / scrollableRange)))
  }, [])

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener("scroll", handleScroll)
  }, [handleScroll])

  // Scene A: 0–0.45, Scene B: 0.45–1.0
  const showSceneA = progress < 0.5
  const sceneAOpacity = progress < 0.4 ? 1 : Math.max(0, 1 - (progress - 0.4) / 0.1)
  const sceneBOpacity = progress < 0.4 ? 0 : Math.min(1, (progress - 0.4) / 0.1)

  // Scene B sub-stages: left col at 0.5, right col at 0.7
  const leftVisible = progress > 0.5
  const rightVisible = progress > 0.7

  if (isMobile) {
    return <FeaturesFrameMobile />
  }

  return (
    <div
      ref={wrapperRef}
      id="features"
      className="lnd-pinned bg-cf-black"
      style={{ height: "350vh" }}
    >
      <div className="lnd-pinned-inner flex items-center justify-center">
        <div className="mx-auto w-full max-w-[1280px] px-6">

          {/* ═══ Sub-scene A — AI Assistance ═══ */}
          <div
            className="absolute inset-0 flex items-center justify-center px-6"
            style={{
              opacity: sceneAOpacity,
              transform: showSceneA ? "translateY(0)" : "translateY(-20px)",
              transition: "opacity 0.4s ease, transform 0.4s ease",
              pointerEvents: showSceneA ? "auto" : "none",
            }}
          >
            <div className="mx-auto max-w-3xl text-center">
              <span className="cf-eyebrow text-cf-yellow">INTELLIGENT ASSISTANCE</span>

              <div className="mx-auto mt-8 mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-cf-yellow/10">
                <Sparkles className="h-8 w-8 text-cf-yellow" strokeWidth={1.5} />
              </div>

              <h2
                className="cf-h1 text-balance text-cf-white"
                style={{ fontSize: "clamp(1.75rem, 4vw, 2.75rem)" }}
              >
                AI that works across your entire flow — not a chatbot in a corner.
              </h2>

              <p className="mx-auto mt-6 max-w-2xl text-[15px] leading-relaxed text-cf-white/50">
                When you upload a photo, NOVA suggests the right category automatically.
                When you search, it goes beyond exact keywords to find descriptions that
                actually match what you&apos;re looking for. When you report, it checks for
                duplicate listings so the feed stays clean. One consistent intelligence
                layer helping at every step.
              </p>
            </div>
          </div>

          {/* ═══ Sub-scene B — Saved Search Alerts ═══ */}
          <div
            className="absolute inset-0 flex items-center justify-center px-6"
            style={{
              opacity: sceneBOpacity,
              pointerEvents: !showSceneA ? "auto" : "none",
            }}
          >
            <div className="mx-auto w-full max-w-[1080px]">
              <div className="mb-10 text-center">
                <span className="cf-eyebrow text-cf-yellow">NEVER MISS A MATCH</span>
                <h2 className="cf-h1 mt-4 text-cf-white">
                  Your search keeps working after you leave.
                </h2>
              </div>

              <div className="grid gap-8 md:grid-cols-2">
                {/* Left — Save a Search */}
                <div
                  className="lnd-feature-col lnd-feature-col--left rounded-2xl border border-cf-white/10 bg-cf-white/[0.04] p-8"
                  style={{
                    opacity: leftVisible ? 1 : 0,
                    transform: leftVisible ? "translateX(0)" : "translateX(-30px)",
                    transition: "opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1), transform 0.7s cubic-bezier(0.16, 1, 0.3, 1)",
                  }}
                >
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-cf-yellow/10">
                    <Bookmark className="h-6 w-6 text-cf-yellow" strokeWidth={1.5} />
                  </div>
                  <h3 className="cf-h2 mb-3 text-cf-white">Save a search</h3>
                  <p className="text-[14px] leading-relaxed text-cf-white/50">
                    If your search comes up empty, save it. NOVA remembers what
                    you&apos;re looking for so you don&apos;t have to keep checking back
                    manually. No repeated searches, no missed windows.
                  </p>
                </div>

                {/* Right — Instant Match Alerts */}
                <div
                  className="lnd-feature-col rounded-2xl border border-cf-white/10 bg-cf-white/[0.04] p-8"
                  style={{
                    opacity: rightVisible ? 1 : 0,
                    transform: rightVisible ? "translateX(0)" : "translateX(30px)",
                    transition: "opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.15s, transform 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.15s",
                  }}
                >
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-cf-yellow/10">
                    <Bell className="h-6 w-6 text-cf-yellow" strokeWidth={1.5} />
                  </div>
                  <h3 className="cf-h2 mb-3 text-cf-white">Instant match alerts</h3>
                  <p className="text-[14px] leading-relaxed text-cf-white/50">
                    Every new item reported is automatically checked against saved
                    searches. If there&apos;s a match, you get a notification —
                    SMS, WhatsApp, or email — right away. The gap between
                    &ldquo;searched too early&rdquo; and &ldquo;reported later&rdquo;
                    is closed automatically.
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

/*
  Mobile version — simple stacked layout, no pinning
*/
function FeaturesFrameMobile() {
  const [aiVisible, setAiVisible] = useState(false)
  const [alertsVisible, setAlertsVisible] = useState(false)
  const aiRef = useRef(null)
  const alertsRef = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (entry.target === aiRef.current) setAiVisible(true)
            if (entry.target === alertsRef.current) setAlertsVisible(true)
          }
        })
      },
      { threshold: 0.2 },
    )

    if (aiRef.current) observer.observe(aiRef.current)
    if (alertsRef.current) observer.observe(alertsRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <section id="features" className="bg-cf-black py-20">
      <div className="mx-auto max-w-[1280px] px-6">

        {/* AI Assistance */}
        <div
          ref={aiRef}
          className="mb-16 text-center"
          style={{
            opacity: aiVisible ? 1 : 0,
            transform: aiVisible ? "translateY(0)" : "translateY(20px)",
            transition: "opacity 0.6s ease, transform 0.6s ease",
          }}
        >
          <span className="cf-eyebrow text-cf-yellow">INTELLIGENT ASSISTANCE</span>
          <div className="mx-auto mt-6 mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-cf-yellow/10">
            <Sparkles className="h-7 w-7 text-cf-yellow" strokeWidth={1.5} />
          </div>
          <h2 className="cf-h1 text-balance text-cf-white">
            AI that works across your entire flow.
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-[14px] leading-relaxed text-cf-white/50">
            Photo categorization, smart search beyond exact keywords, and automatic
            duplicate detection — one consistent intelligence layer at every step.
          </p>
        </div>

        {/* Saved Search Alerts */}
        <div ref={alertsRef}>
          <div className="mb-8 text-center">
            <span className="cf-eyebrow text-cf-yellow">NEVER MISS A MATCH</span>
            <h2 className="cf-h1 mt-4 text-cf-white">
              Your search keeps working after you leave.
            </h2>
          </div>

          <div
            className="flex flex-col gap-5"
            style={{
              opacity: alertsVisible ? 1 : 0,
              transform: alertsVisible ? "translateY(0)" : "translateY(20px)",
              transition: "opacity 0.6s ease 0.1s, transform 0.6s ease 0.1s",
            }}
          >
            <div className="rounded-2xl border border-cf-white/10 bg-cf-white/[0.04] p-6">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-cf-yellow/10">
                <Bookmark className="h-5 w-5 text-cf-yellow" strokeWidth={1.5} />
              </div>
              <h3 className="cf-h2 mb-2 text-cf-white">Save a search</h3>
              <p className="text-[13px] leading-relaxed text-cf-white/50">
                Save an empty search and let NOVA watch for matches so you don&apos;t
                have to keep checking back.
              </p>
            </div>
            <div className="rounded-2xl border border-cf-white/10 bg-cf-white/[0.04] p-6">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-cf-yellow/10">
                <Bell className="h-5 w-5 text-cf-yellow" strokeWidth={1.5} />
              </div>
              <h3 className="cf-h2 mb-2 text-cf-white">Instant match alerts</h3>
              <p className="text-[13px] leading-relaxed text-cf-white/50">
                Every new report is checked against saved searches. Matches trigger
                instant SMS, WhatsApp, or email notifications.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
