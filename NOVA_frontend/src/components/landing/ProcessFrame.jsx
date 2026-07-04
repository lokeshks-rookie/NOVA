import { FileText, Search, ShieldCheck } from "lucide-react"
import { ScrollReveal } from "@/components/ui/ScrollReveal"

/*
  ProcessFrame — Frame 3: How NOVA Works (Section 5)
  Static grid layout, yellow cards, black background.
*/

const CARDS = [
  {
    step: "01",
    title: "Report",
    icon: FileText,
    description:
      "File a lost or found report in under a minute. Add the category, location, a photo, and a short description — then set private challenge questions only the real owner would know. That detail is never shown publicly; it's how we prevent false claims.",
  },
  {
    step: "02",
    title: "Search",
    icon: Search,
    description:
      "Search the campus feed without logging in. Type what you're looking for in plain language — no filters to fight with. The search is built to get smarter over time, matching descriptions even when the exact words don't line up.",
  },
  {
    step: "03",
    title: "Claim",
    icon: ShieldCheck,
    description:
      "Found your item? Submit a claim by answering the private challenge questions. Every claim goes through a human admin review before any handover — never auto-approved. You'll get a pickup notification once it's verified.",
  },
]

export function ProcessFrame() {
  return (
    <section id="process" className="bg-cf-black py-24 sm:py-32 overflow-hidden">
      <div className="mx-auto max-w-[1280px] px-6">
        
        {/* Header */}
        <ScrollReveal className="mb-16 text-center">
          <span className="cf-eyebrow text-cf-yellow">HOW NOVA WORKS</span>
          <h2 className="cf-h1 mt-4 text-cf-white">
            Three steps from lost to found.
          </h2>
        </ScrollReveal>

        {/* Static Grid Layout for Cards */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {CARDS.map((card, idx) => (
            <ScrollReveal
              key={card.step}
              delay={0.1 * (idx + 1)}
              className="relative flex flex-col justify-between border-2 border-cf-yellow bg-cf-yellow p-8 sm:p-10 transition-transform duration-300 hover:-translate-y-2"
              style={{
                boxShadow: "8px 8px 0px 0px #ffffff",
              }}
            >
              <div>
                <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-full bg-cf-black text-base font-bold text-cf-white shadow-sm">
                  {card.step}
                </div>
                <card.icon
                  className="mb-6 h-10 w-10 text-cf-black"
                  strokeWidth={2}
                />
                <h3 className="cf-h2 mb-4 font-bold text-cf-black">
                  {card.title}
                </h3>
                <p className="text-[15px] font-medium leading-relaxed text-cf-black/80">
                  {card.description}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  )
}
