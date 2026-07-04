import { Logo } from "./Logo"
import { Eyebrow } from "./Eyebrow"

/*
  AuthLayout — split-panel wrapper for Login and Signup.
  Left: black brand side. Right: white form side.
  On mobile the brand panel collapses to a compact header.
*/
export function AuthLayout({ children, eyebrow, headline, sub }) {
  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      {/* Brand side (black) */}
      <div className="flex flex-col justify-between bg-cf-black p-8 text-cf-white lg:w-[42%] lg:p-12">
        <Logo light />
        <div className="hidden lg:block">
          <Eyebrow className="text-cf-yellow">■ CAMPUS LOST &amp; FOUND</Eyebrow>
          <h1 className="cf-h1 mt-6 max-w-md text-balance text-cf-white">
            Reunite the campus with what it lost.
          </h1>
          <p className="mt-4 max-w-sm text-[15px] leading-relaxed text-cf-white/60">
            One place to report, match, and reclaim lost belongings across your campus — fast,
            verified, and community-driven.
          </p>
          <div className="mt-10 flex gap-8">
            <div>
              <p className="text-2xl font-semibold">247</p>
              <p className="text-xs text-cf-white/50">Items returned</p>
            </div>
            <div>
              <p className="text-2xl font-semibold">94%</p>
              <p className="text-xs text-cf-white/50">Success rate</p>
            </div>
            <div>
              <p className="text-2xl font-semibold">48h</p>
              <p className="text-xs text-cf-white/50">Avg resolution</p>
            </div>
          </div>
        </div>
        <p className="hidden text-xs text-cf-white/40 lg:block">Built for campus, by campus</p>
      </div>

      {/* Form side (white) */}
      <div className="flex flex-1 items-center justify-center bg-cf-white px-6 py-12 sm:px-10">
        <div className="w-full max-w-md cf-fade-in">
          {eyebrow && <Eyebrow className="text-cf-muted">{eyebrow}</Eyebrow>}
          <h2 className="cf-h1 mt-4 text-balance">{headline}</h2>
          {sub && <p className="mt-2 text-[15px] leading-relaxed text-cf-muted">{sub}</p>}
          <div className="mt-8">{children}</div>
        </div>
      </div>
    </div>
  )
}
