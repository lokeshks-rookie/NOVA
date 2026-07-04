/*
  HomeFrame — Frame 1: Hero (Section 3)

  Full viewport height. Centered layout.
  Massive NOVA wordmark + tagline in the center of the screen.
  Full background: placeholder campus image with dark overlay
  for text legibility.
*/

export function HomeFrame() {
  return (
    <section
      id="home"
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-cf-black"
    >
      {/* Background image placeholder with scrim */}
      {/* TODO: replace with real hero image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: "url('/final_bg.png')",
        }}
        aria-hidden="true"
      />

      {/* Dark overlay for text legibility */}
      <div
        className="absolute inset-0 bg-black/40"
        aria-hidden="true"
      />

      {/* Content */}
      <div className="relative z-10 mx-auto w-full max-w-[1280px] px-6 py-32 sm:py-40 flex flex-col items-center justify-center text-center">
        <div className="flex flex-col items-center justify-center">
          {/* Wordmark — single biggest type moment on the page */}
          <h1
            className="lnd-hero-wordmark"
            style={{
              fontSize: "clamp(6rem, 20vw, 20rem)",
              fontWeight: 900,
              lineHeight: 0.95,
              letterSpacing: "-0.04em",
              color: "var(--color-cf-white)",
            }}
          >
            NOVA
          </h1>

          {/* Tagline — much smaller, supporting, not competing */}
          <p
            className="lnd-hero-tagline mt-6 text-cf-white/80"
            style={{
              fontSize: "clamp(1rem, 2vw, 1.5rem)",
              fontWeight: 500,
              lineHeight: 1.6,
              letterSpacing: "0.01em",
              maxWidth: "600px",
              color: "white",
            }}
          >
            Network for Ownership Verification
            <br />
            and Asset recovery.
          </p>
        </div>
      </div>
    </section>
  )
}
