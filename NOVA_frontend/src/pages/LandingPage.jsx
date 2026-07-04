import { LandingNavbar } from "@/components/landing/LandingNavbar"
import { HomeFrame } from "@/components/landing/HomeFrame"
import { AboutFrame } from "@/components/landing/AboutFrame"
import { ProcessFrame } from "@/components/landing/ProcessFrame"
import { FeaturesFrame } from "@/components/landing/FeaturesFrame"
import { TestimonialsFrame } from "@/components/landing/TestimonialsFrame"
import { HelpFrame } from "@/components/landing/HelpFrame"
import { LandingFooter } from "@/components/landing/LandingFooter"
import "@/components/landing/landing.css"

/*
  NewLandingPage — NOVA full scrollytelling landing page

  Eight sections composed with the global transition system:
  1. Home (hero)
  2. About (typographic)
  3. Process (pinned card sequence)
  4. Features (AI + alerts, pinned)
  5. Testimonials (horizontal carousel, pinned)
  6. Help (contact + FAQ)
  7. Footer

  Alternating section backgrounds per brand guidelines §4:
  black → cream → white → black → cream → white → black
*/

export default function LandingPage() {
  return (
    <div className="landing-root">
      <LandingNavbar />
      <main>
        <HomeFrame />
        <AboutFrame />
        <ProcessFrame />
        <FeaturesFrame />
        <TestimonialsFrame />
        <HelpFrame />
      </main>
      <LandingFooter />
    </div>
  )
}
