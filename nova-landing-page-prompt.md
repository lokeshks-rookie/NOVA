# Build Prompt: NOVA Landing Page (for Antigravity)

Paste everything below into Antigravity as a single task. Attach `campus-lost-and-found-spec.md` and `campus_brand_guidelines.md` alongside it.

---

## 0. Context (read first, do not skip)

You are building **one standalone, full scrollytelling landing page** for **NOVA** — *Network for Ownership Verification and Asset recovery* — the campus-scoped platform where students and staff report lost/found items, search for matches, and claim items through a verified, admin-approved process. The underlying product spec is in `campus-lost-and-found-spec.md` — read it before writing any copy, so every feature claim on this page is true to how the product actually works. NOVA is the brand name for that system; don't contradict the spec's mechanics anywhere.

This page will later be merged into an existing v0-generated Next.js project, so match v0's conventions exactly:

- Next.js (App Router), TypeScript, functional components only
- Tailwind CSS for all styling — no CSS modules, no styled-components
- `shadcn/ui` primitives where they fit (Button, Sheet for mobile nav, Accordion for FAQ)
- `framer-motion` for every animation described below
- `lucide-react` for icons
- Component split: `page.tsx` composing section components from `components/landing/`: `Navbar.tsx`, `HomeFrame.tsx`, `AboutFrame.tsx`, `ProcessFrame.tsx`, `FeaturesFrame.tsx`, `TestimonialsFrame.tsx`, `HelpFrame.tsx`, `Footer.tsx`
- `'use client'` only where interactivity/animation requires it

**For all design requirements — colors, typography, spacing, imagery style, corner radii, everything — refer to the `campus_brand_guidelines.md` file attached here.** Do not invent a visual identity in this prompt. Where a token this page needs isn't defined there, use an obviously-neutral placeholder and leave a `// TODO: not defined in campus_brand_guidelines.md` comment rather than guessing.

There is **no 3D asset in this version** — do not scaffold Spline or any 3D embed anywhere on this page.

---

## 1. Global transition system (use this everywhere "a smooth transition" is mentioned)

The page is a sequence of full-viewport **frames**. Moving between frames should never feel like a hard cut — build one reusable transition primitive and apply it at every frame boundary named below:

- Each frame boundary crossfades and parallaxes: as the next frame's top edge approaches, it rises in with `translateY` from ~40px to `0` while fading `opacity 0 → 1`, and the outgoing frame very slightly scales down (`1 → 0.97`) and dims (`opacity 1 → 0.85`) as it exits — a gentle depth cue, not a jump cut.
- Drive this off actual scroll position with `useScroll` (`framer-motion`) targeting each frame's wrapper with `offset: ["start end", "start start"]`, and map the resulting progress through `useTransform` into the `opacity`/`translateY`/`scale` values above. This must feel tied to the user's scroll gesture (buttery, interruptible, reversible if they scroll back up), not a fixed-duration animation that plays regardless of scroll speed.
- Timing/easing: expo-out feel, nothing bouncy or springy at this transition layer — it should read as premium and calm, satisfying rather than flashy.
- Respect `prefers-reduced-motion`: fall back to a simple opacity crossfade with no scale/translate.

Three of the frames (Process, Features, Testimonials) additionally need **pinned, scroll-driven internal sequences** — the frame's outer wrapper is taller than the viewport (e.g. `250–300vh`), its visual content is `position: sticky; top: 0; height: 100vh`, and scroll progress through that wrapper (via `useScroll` with the wrapper as target) drives the internal card/content choreography described in each section below, before the page releases into the next frame's own entrance transition. This is what makes the "flash cards" and "pop up one by one" behavior scroll-driven rather than autoplaying.

---

## 2. Navigation bar

Fixed/sticky top nav, present on every frame, transitioning from transparent (over the Home frame's image) to a solid/blurred bar once scrolled past Home — animate this shift, don't hard-cut it.

- Left: `NOVA` wordmark (text logo, weight/style per brand guidelines)
- Center/left-adjacent nav links, each smooth-scrolling to its frame: `Home` · `About` · `Process` · `Features` · `Help`
- Right: two auth actions — `Log In` (secondary/ghost style) linking to `/login`, and `Sign Up` (primary filled style, strongest visual weight in the nav) linking to `/signup`
- Mobile: collapses into a `Sheet` drawer; Sign Up stays visible or sits at the top of the drawer, never buried

---

## 3. Frame 1 — Home

Full viewport height.

- **Left 30% of the screen**: `NOVA` set in a very large, bold display treatment (this is the single biggest type moment on the page), with a line beneath it reading: *"Network for Ownership Verification and Asset recovery."* — set much smaller than the wordmark, clearly a supporting tagline, not competing with it.
- **Full 100% background**: a full-bleed image behind/around the text — for now, use a clearly-marked placeholder/mock image (a neutral campus- or architecture-style stock placeholder is fine) with a code comment: `// TODO: replace with real hero image`. The left-column text needs to stay legible over it (a scrim/gradient overlay behind the text block is expected — pull the overlay treatment from brand guidelines if specified, otherwise use a simple dark-to-transparent gradient on the left third only).
- On load: wordmark and tagline stagger in (wordmark first, tagline ~150ms after), consistent with the entrance style in Section 1.
- Exit into About using the Global Transition System (Section 1).

---

## 4. Frame 2 — About

Full viewport height, no imagery — the entire frame is typographic/layout space, fully your call within brand guidelines.

Content direction (write real copy, grounded in the spec, not filler): a bold, confident statement of what NOVA actually is and why it exists — e.g. the everyday reality that lost items on a campus usually aren't gone, they're just sitting in the wrong hands or the wrong drawer, and that NOVA exists to close that gap quickly, safely, and with real ownership verification rather than an honor system. Cover, in your own words:
- The problem: physical items, real ownership disputes, a bounded trusted community (one campus)
- The idea: a single place to report, search, and verify — not another lost-property spreadsheet
- The stance: built small and deliberately scoped, not over-engineered — trustworthy over flashy

Enter/exit both via the Global Transition System.

---

## 5. Frame 3 — Process

This entire frame **is** the animation — build it as the pinned scroll-driven sequence described in Section 1.

- Heading, fixed at the top of the frame throughout the sequence: **"How NOVA Works"**
- Initial state (frame first pins): three cards sit stacked/fanned like a hand of playing cards — overlapping, each rotated a few degrees off the others, slightly offset in position (no literal hand imagery, just the fanned-stack arrangement).
- As the user scrolls through this frame's pinned range, the three cards animate out of the stack **one at a time**, each popping up into its own clear position (roughly a 3-up row on desktop, stacked on mobile) with a scale+fade "flash" entrance matching the card-pop style in Section 1's card language (`scale 0.9 → 1`, `opacity 0 → 1`, snappy expo-out). Map scroll progress into three sequential thresholds (~0–33%, 33–66%, 66–100%) so each card is clearly tied to a distinct chunk of the scroll gesture, not all arriving together.
- The three cards, professional in content and tone:
  1. **Report** — icon + short title + one to two sentences: filing a report takes structured details (category, location, description, photo) plus private challenge questions only the true owner would know
  2. **Search** — icon + short title + description: searching needs no login, works off minimal input, and is built to get smarter over time
  3. **Claim** — icon + short title + description: claiming requires answering those private challenge details and passing a human admin review before any handover — never auto-approved
- Once all three cards have popped into place, release the pin and transition into Features via the Global Transition System.

---

## 6. Frame 4 — Features

Two sub-scenes inside one conceptual "Features" frame, connected by an internal transition (same pinned-scroll approach as Process, or a simpler two-stage `AnimatePresence` swap driven by scroll — pick whichever renders more smoothly, but the hand-off between the two sub-scenes must still feel like a deliberate transition, not a jump cut).

**Sub-scene A — AI Assistance**
Full-screen moment making a bold statement about NOVA's AI-based assistance working across the whole flow — reporting, searching, and claiming alike (not a narrow chatbot pitch). Ground this in the spec's real intelligence features: smarter search that goes beyond exact keyword matching, a category suggestion when a photo is uploaded, and a duplicate-listing check on report — framed here as one consistent AI layer helping the user at every step, not three disconnected gimmicks.

Transition to Sub-scene B.

**Sub-scene B — Saved Search Alerts**
Two features from the spec's alerting system, staged sequentially within the same visual frame:
1. **Save a Search** — its details/copy enter and sit on the **left** side of the frame first: if a search comes up empty, or the user wants to keep watching for something, they save it — no repeated manual re-searching.
2. After that first feature has settled in on the left, transition in the **second** feature's details onto the **right** side of the same frame: **Instant Match Alerts** — every new item reported is automatically checked against saved searches, and a match triggers a notification (SMS/WhatsApp/email) right away, closing the gap for someone who searched before their item was ever logged.

End state: a clean two-column layout, Save a Search on the left, Instant Match Alerts on the right, arrived at via that staggered left-then-right entrance rather than both appearing at once.

Exit into Testimonials via the Global Transition System.

---

## 7. Frame 5 — Testimonials

Full viewport height. Client/student satisfaction reviews as circular, avatar-forward flash cards (each card: circular photo up top, name, role/campus affiliation, star rating, short quote — visually consistent with the card-pop language from Section 1 for its entrance, but functioning as an infinite carousel once in view).

- Initial state: **three** testimonial cards visible, arranged in a shallow arc/row.
- Behavior on continued scroll through this frame (implement as a pinned horizontal-scroll carousel: vertical scroll progress through the pinned wrapper maps to horizontal `translateX` of the card track): rather than swapping the whole visible set of three at once, cards advance **one at a time** — the next testimonial (4th, then 5th, and so on) slides in from one side while the oldest visible card exits the other side, so it always reads as a smooth single-card conveyor, never a block-jump.
- Looping: this must be a **seamless infinite loop** — after the last testimonial has cycled through, the sequence continues directly back into the first testimonial rather than stopping or jumping. (Implementation approach: duplicate the testimonial array end-to-end, or use modulo-based index positioning on the track, so the wrap-around point is visually invisible.)
- Populate with a handful of realistic placeholder reviews (5–6 is enough) — student/staff names, a campus-appropriate role label, a short one/two-sentence quote about recovering or returning an item through NOVA, and a star rating. Mark clearly as placeholder content: `// TODO: replace with real testimonials`.
- Exit into Help via the Global Transition System once the user scrolls past this frame (don't let the horizontal carousel fight with the vertical scroll needed to move on — the pinned range should have a clear end after which normal vertical scroll resumes).

---

## 8. Frame 6 — Help

Full viewport height, two clear parts:

- **Contact section**: admin/support contact details — email address, phone number, and physical office/counter location if applicable — presented clearly (icon + label pattern), plus a short line inviting the user to reach out with anything the FAQ doesn't cover. Use clearly-marked placeholder contact details (`// TODO: replace with real contact info`).
- **FAQ**: an accordion (`shadcn/ui` Accordion) with questions grounded in the actual product, e.g.: *How do I report a lost item? How does claim verification work? Is my personal data safe? How long does a claim review take? Do I need to log in to search?* — answer each briefly and accurately per the spec.

Enter via the Global Transition System from Testimonials.

---

## 9. Footer

Classic, professional, multi-column — not an afterthought:

- **Product** — Report an Item, Search, How Claims Work, Safety & Trust
- **Resources** — FAQ, Contact, Campus Safety Office
- **Legal** — Privacy Policy, Terms of Service, Data Retention
- Social icon row using `lucide-react` icons — LinkedIn, Instagram, X, WhatsApp (link hrefs as placeholders, `#` for now)
- NOVA wordmark + a short one-line description
- Copyright line with the year computed at build time, not hardcoded
- Small disclaimer line noting institutional affiliation is a `// TODO` — that's not yours to decide

---

## 10. Copy guidance

Every headline and line of body copy should sound like it's about a real, working campus system — plain verbs, active voice, sentence case, specific rather than clever. No generic SaaS filler ("streamline your workflow", "unlock possibilities"). Where you need placeholder data (testimonials, contact info, hero image), mark it explicitly as a `TODO` so it's trivial to swap later.

---

## 11. Responsiveness & accessibility

- Fully responsive from mobile (375px) up; the Process card-fan, the Features left/right split, and the Testimonials carousel each need a deliberate, deliberate-not-default mobile treatment (e.g. stacked cards instead of a fan, stacked columns instead of left/right, swipeable single-column carousel instead of a wide track)
- Visible keyboard focus states on every interactive element, including nav links, buttons, accordion triggers, and carousel controls
- All scroll-driven animation in Sections 1, 5, 6, and 7 must have a `prefers-reduced-motion` fallback: simple opacity fades, no pinning/scroll-jacking, no parallax
- Semantic HTML throughout (`<nav>`, `<main>`, `<section>` per frame, `<footer>`)

---

## 12. Deliverable

Output a fully working `page.tsx` composing the eight components listed in Section 0, with every transition and scroll-driven sequence in this prompt actually implemented (not stubbed as a static layout). The only unfinished pieces should be the explicitly marked `TODO`s (hero image, testimonial content, contact details, social links, institutional affiliation line). No visual token in this build should be invented outside of `campus_brand_guidelines.md` — where it's silent, mark it, don't guess.
