import { Link } from "react-router-dom"
import { Linkedin, Instagram, Twitter, MessageCircle } from "lucide-react"
import { ScrollReveal } from "@/components/ui/ScrollReveal"

/*
  LandingFooter — Section 9: Footer
*/

const FOOTER_COLS = [
  {
    title: "Product",
    links: [
      { label: "Report an item", to: "/report" },
      { label: "Search", to: "/search" },
      { label: "How claims work", href: "#process" },
      { label: "Safety & trust", href: "#about" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "FAQ", href: "#help" },
      { label: "Contact", href: "#help" },
      // TODO: replace with real campus safety link
      { label: "Campus safety office", href: "#" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy policy", to: "/privacy" },
      { label: "Terms of service", to: "/terms" },
      // TODO: add data retention policy page
      { label: "Data retention", href: "#" },
    ],
  },
]

// Social links — hrefs as placeholders for now
const SOCIALS = [
  { icon: Linkedin, label: "LinkedIn", href: "#" },
  { icon: Instagram, label: "Instagram", href: "#" },
  { icon: Twitter, label: "X (Twitter)", href: "#" },
  { icon: MessageCircle, label: "WhatsApp", href: "#" },
]

export function LandingFooter() {
  return (
    <footer className="bg-cf-black py-16 text-cf-white overflow-hidden">
      <div className="mx-auto max-w-[1280px] px-6">

        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">

          {/* Brand column */}
          <ScrollReveal className="lg:col-span-2">
            {/* Wordmark */}
            <div className="inline-flex items-center gap-2.5 text-lg font-semibold tracking-tight">
              <span className="inline-block h-4 w-4 bg-cf-yellow" aria-hidden="true" />
              NOVA
            </div>

            <p className="mt-4 max-w-xs text-sm leading-relaxed text-cf-white/50">
              Network for Ownership Verification and Asset recovery.
              The campus-scoped lost and found platform — report, match, reclaim.
            </p>

            {/* Social icons */}
            <div className="mt-6 flex items-center gap-3">
              {SOCIALS.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-cf-white/10 text-cf-white/50 transition-colors hover:border-cf-white/30 hover:text-cf-white"
                >
                  <social.icon className="h-4 w-4" strokeWidth={1.5} />
                </a>
              ))}
            </div>
          </ScrollReveal>

          {/* Link columns */}
          {FOOTER_COLS.map((col, idx) => (
            <ScrollReveal key={col.title} delay={0.1 * (idx + 1)}>
              <p className="text-sm font-medium">{col.title}</p>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    {link.to ? (
                      <Link
                        to={link.to}
                        className="text-sm text-cf-white/50 transition-colors hover:text-cf-white"
                      >
                        {link.label}
                      </Link>
                    ) : (
                      <a
                        href={link.href}
                        className="text-sm text-cf-white/50 transition-colors hover:text-cf-white"
                      >
                        {link.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </ScrollReveal>
          ))}

        </div>

        {/* Bottom bar */}
        <ScrollReveal delay={0.4} className="mt-12 flex flex-col items-start justify-between gap-3 border-t border-cf-white/10 pt-6 text-sm text-cf-white/40 sm:flex-row sm:items-center">
          <span>© {new Date().getFullYear()} NOVA. All rights reserved.</span>
          {/* TODO: replace with actual institutional affiliation */}
          <span className="text-xs text-cf-white/25">
            Built for campus, by campus.
          </span>
        </ScrollReveal>

      </div>
    </footer>
  )
}
