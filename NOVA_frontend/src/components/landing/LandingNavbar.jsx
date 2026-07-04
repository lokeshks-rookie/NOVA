import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Sheet } from "@/components/ui/Sheet"
import { cn } from "@/lib/utils"

/*
  LandingNavbar — Fixed nav for the NOVA landing page (Section 2)

  Transparent over the hero → solid black with backdrop-blur after scroll.
  Center-left: smooth-scroll anchor links to each frame.
  Right: Log In (ghost) + Sign Up (yellow primary).
  Mobile: collapses into Sheet drawer.
*/

const NAV_LINKS = [
  { label: "Home", href: "#home" },
  { label: "About", href: "#about" },
  { label: "Process", href: "#process" },
  { label: "Features", href: "#features" },
  { label: "Help", href: "#help" },
]

export function LandingNavbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeSection, setActiveSection] = useState("home")

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  // Track which section is currently in view for active nav link
  useEffect(() => {
    const ids = NAV_LINKS.map((l) => l.href.slice(1))
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id)
          }
        }
      },
      { threshold: 0.3, rootMargin: "-80px 0px -50% 0px" },
    )

    ids.forEach((id) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [])

  const handleAnchorClick = (e, href) => {
    e.preventDefault()
    const el = document.querySelector(href)
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" })
    }
    setMenuOpen(false)
  }

  return (
    <header
      className={cn(
        "lnd-nav fixed inset-x-0 top-0 z-50",
        scrolled ? "lnd-nav--solid" : "lnd-nav--transparent",
      )}
    >
      <div className="mx-auto flex max-w-[1280px] items-center justify-between px-6 py-4">
        {/* Wordmark */}
        <a
          href="#home"
          onClick={(e) => handleAnchorClick(e, "#home")}
          className="inline-flex items-center gap-2.5 text-lg font-semibold tracking-tight text-cf-white focus:outline-none focus-visible:ring-2 focus-visible:ring-cf-yellow"
        >
          <span className="inline-block h-4 w-4 bg-cf-yellow" aria-hidden="true" />
          NOVA
        </a>

        {/* Desktop nav links */}
        <nav className="hidden items-center gap-1 md:flex" aria-label="Main navigation">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => handleAnchorClick(e, link.href)}
              className={cn(
                "lnd-nav-link",
                activeSection === link.href.slice(1) && "lnd-nav-link--active",
              )}
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Desktop auth buttons */}
        <div className="hidden items-center gap-3 md:flex">
          {/* NAV → /login */}
          <Button as={Link} to="/login" variant="ghost" invert>
            Log in
          </Button>
          {/* NAV → /signup */}
          <Button as={Link} to="/signup" variant="yellow" badge>
            Sign up
          </Button>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen(true)}
          aria-label="Open menu"
          className="cf-focus-ring rounded-full p-2 text-cf-white md:hidden"
        >
          <Menu className="h-6 w-6" />
        </button>
      </div>

      {/* Mobile Sheet drawer */}
      <Sheet open={menuOpen} onClose={() => setMenuOpen(false)}>
        <div className="mt-8 flex flex-col gap-3">
          {/* Sign Up stays prominent at top */}
          <Button as={Link} to="/signup" variant="yellow" badge onClick={() => setMenuOpen(false)}>
            Sign up
          </Button>
          <Button as={Link} to="/login" variant="secondary" invert onClick={() => setMenuOpen(false)}>
            Log in
          </Button>

          <div className="my-4 h-px bg-cf-white/10" />

          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => handleAnchorClick(e, link.href)}
              className="block py-2 text-sm font-medium text-cf-white/70 transition-colors hover:text-cf-white"
            >
              {link.label}
            </a>
          ))}
        </div>
      </Sheet>
    </header>
  )
}
