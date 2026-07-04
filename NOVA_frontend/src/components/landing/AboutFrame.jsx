import { useEffect, useRef, useState } from "react"
import { ScrollFrame } from "./ScrollFrame"
import { ScrollReveal } from "@/components/ui/ScrollReveal"

/*
  AboutFrame — Frame 2: About (Section 4)

  Full viewport height, no imagery — entirely typographic.
  Bold statement of what NOVA is and why it exists.
  Content grounded in the product spec, not filler.
  Black background, staggered content reveal on scroll.
*/

export function AboutFrame() {
  return (
    <ScrollFrame id="about" className="bg-cf-black">
      <div className="flex min-h-screen items-center">
        <div className="mx-auto w-full max-w-[1280px] px-6 py-24 sm:py-32">
          
          {/* Eyebrow */}
          <ScrollReveal>
            <span className="cf-eyebrow text-cf-yellow">
              ABOUT NOVA
            </span>
          </ScrollReveal>

          {/* Main statement */}
          <ScrollReveal delay={0.1}>
            <h2 className="cf-h1 mt-8 max-w-3xl text-balance text-cf-white">
              Lost items on campus aren&apos;t gone. They&apos;re sitting in the wrong bag,
              the wrong drawer, the wrong office — waiting for a system that can close the gap.
            </h2>
          </ScrollReveal>

          {/* Three content blocks */}
          <div className="mt-16 grid gap-12 sm:gap-16 md:grid-cols-3 md:gap-10">
            {/* The problem */}
            <ScrollReveal delay={0.2}>
              <p className="mb-3 text-xs font-medium uppercase tracking-[0.1em] text-cf-white/50">
                The problem
              </p>
              <p className="text-[15px] leading-relaxed text-cf-white/70">
                Physical items, real ownership disputes, and a bounded community
                of students and staff who all share the same buildings every day.
                The current system — notice boards, WhatsApp groups, a dusty box
                at the admin counter — works by luck, not by design.
              </p>
            </ScrollReveal>

            {/* The idea */}
            <ScrollReveal delay={0.3}>
              <p className="mb-3 text-xs font-medium uppercase tracking-[0.1em] text-cf-white/50">
                The idea
              </p>
              <p className="text-[15px] leading-relaxed text-cf-white/70">
                One place to report a lost or found item, search by description
                or photo, and verify ownership through challenge questions that
                only the real owner can answer — not another lost-property
                spreadsheet, but a system built for how people actually lose and
                find things.
              </p>
            </ScrollReveal>

            {/* The stance */}
            <ScrollReveal delay={0.4}>
              <p className="mb-3 text-xs font-medium uppercase tracking-[0.1em] text-cf-white/50">
                The stance
              </p>
              <p className="text-[15px] leading-relaxed text-cf-white/70">
                Built small and deliberately scoped for a single campus.
                Every claim is verified by a human before any handover.
                Trustworthy over flashy, practical over ambitious — because
                returning someone&apos;s laptop matters more than scaling
                to a million users.
              </p>
            </ScrollReveal>
          </div>
        </div>
      </div>
    </ScrollFrame>
  )
}
