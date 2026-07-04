import { Link } from "react-router-dom"
import { Logo } from "./Logo"

// Minimal shared shell for legal pages (Terms, Privacy)
export function LegalPage({ title, updated, children }) {
  return (
    <div className="min-h-screen bg-white text-black">
      <header className="border-b border-black/10">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-5">
          {/* NAV → / — logo returns to landing */}
          <Link to="/" aria-label="CampusFind home">
            <Logo />
          </Link>
          {/* NAV → / — back link */}
          <Link to="/" className="text-sm font-medium text-black/60 hover:text-black">
            Back to home
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-14">
        <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-black/50">
          <span className="inline-block h-2 w-2 bg-[#EFD556]" aria-hidden="true" />
          Legal
        </p>
        <h1 className="text-4xl font-bold tracking-tight text-balance">{title}</h1>
        <p className="mt-2 text-sm text-black/50">Last updated {updated}</p>
        <div className="mt-10 flex flex-col gap-8 leading-relaxed text-black/70">{children}</div>
      </main>
    </div>
  )
}
