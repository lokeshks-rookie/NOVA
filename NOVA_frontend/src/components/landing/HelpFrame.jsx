import { ScrollFrame } from "./ScrollFrame"
import { Accordion } from "@/components/ui/Accordion"
import { Mail, Phone, MapPin } from "lucide-react"
import { ScrollReveal } from "@/components/ui/ScrollReveal"

/*
  HelpFrame — Frame 6: Help (Section 8)

  Contact section + FAQ accordion.
*/

// TODO: replace with real contact info
const CONTACT_ITEMS = [
  {
    icon: Mail,
    label: "Email",
    value: "lostandfound@campus.edu",
  },
  {
    icon: Phone,
    label: "Phone",
    value: "+91 98765 43210",
  },
  {
    icon: MapPin,
    label: "Office",
    value: "Lost & Found Desk, Admin Block, Ground Floor",
  },
]

const FAQ_ITEMS = [
  {
    id: "faq-1",
    question: "How do I report a lost item?",
    answer:
      "Sign in, tap 'Report an item', and select 'Lost'. Fill in the category, a short description, add a photo if you have one, and mark the approximate location. You'll also set 1–2 private challenge questions (e.g. 'what sticker is on the back?') — these are never shown publicly and are how we verify ownership during claims.",
  },
  {
    id: "faq-2",
    question: "How does claim verification work?",
    answer:
      "When you claim an item, you answer the private challenge questions the reporter set. If your answers are plausible, the claim goes to a campus admin for human review — they may ask for additional proof like a purchase receipt or an old photo with the item. No claim is ever auto-approved. Once approved, you'll receive a pickup notification with a PIN to present at the lost-and-found counter.",
  },
  {
    id: "faq-3",
    question: "Is my personal data safe?",
    answer:
      "Your campus email and phone number are only used for account verification and notifications (SMS/WhatsApp/email). Challenge question answers are hashed before storage. The full audit trail of claims is accessible only to campus admins, not other users.",
  },
  {
    id: "faq-4",
    question: "How long does a claim review take?",
    answer:
      "Most claims are reviewed within 24–48 hours during working days. The speed depends on admin availability at your campus lost-and-found desk. You'll receive a notification as soon as a decision is made.",
  },
  {
    id: "faq-5",
    question: "Do I need to log in to search?",
    answer:
      "No. Searching the campus feed is fully open — you don't need an account to look for items. You only need to log in to report an item or submit a claim.",
  },
]

export function HelpFrame() {
  return (
    <ScrollFrame id="help" className="bg-cf-black overflow-hidden">
      <div className="mx-auto max-w-[1280px] px-6 py-24 sm:py-32">

        <div className="grid gap-16 md:grid-cols-2 md:gap-12">

          {/* ── Contact section ── */}
          <ScrollReveal>
            <span className="cf-eyebrow text-cf-yellow">GET IN TOUCH</span>
            <h2 className="cf-h1 mt-5 text-cf-white">
              Can&apos;t find what you need?
            </h2>
            <p className="mt-4 max-w-md text-[15px] leading-relaxed text-cf-white/70">
              If the FAQ doesn&apos;t cover your question, reach out directly. The
              campus lost-and-found desk handles all physical pickups and can help
              with anything the platform can&apos;t.
            </p>

            <div className="mt-10 flex flex-col gap-6">
              {CONTACT_ITEMS.map((item, idx) => (
                <ScrollReveal key={item.label} delay={0.1 * (idx + 1)} className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-cf-white/10 bg-cf-white/[0.04]">
                    <item.icon className="h-5 w-5 text-cf-white/50" strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-[0.08em] text-cf-white/50">
                      {item.label}
                    </p>
                    <p className="mt-1 text-[15px] font-medium text-cf-white">
                      {item.value}
                    </p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </ScrollReveal>

          {/* ── FAQ section ── */}
          <ScrollReveal delay={0.2}>
            <span className="cf-eyebrow text-cf-yellow">COMMON QUESTIONS</span>
            <h2 className="cf-h1 mt-5 mb-8 text-cf-white">
              Everything you might ask.
            </h2>
            <div className="theme-dark">
              <Accordion items={FAQ_ITEMS} defaultOpen="faq-1" variant="dark" />
            </div>
          </ScrollReveal>

        </div>

      </div>
    </ScrollFrame>
  )
}
