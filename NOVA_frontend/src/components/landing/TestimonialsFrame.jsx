import { StaggerTestimonials } from "@/components/ui/stagger-testimonials"
import { ScrollReveal } from "@/components/ui/ScrollReveal"

export function TestimonialsFrame() {
  return (
    <section id="testimonials" className="bg-cf-black overflow-hidden">
      <div className="py-20 max-w-full">
        <ScrollReveal className="mb-12 text-center px-6">
          <span className="cf-eyebrow text-cf-yellow">WHAT PEOPLE SAY</span>
          <h2 className="cf-h1 mt-4 text-cf-white">
            Real stories from the campus.
          </h2>
        </ScrollReveal>
        <ScrollReveal delay={0.2}>
          <StaggerTestimonials />
        </ScrollReveal>
      </div>
    </section>
  )
}
