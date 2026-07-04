# Brand & Design Guidelines
### Campus Lost & Found — Visual System (inspired by Vistal, Webflow template)

This document is derived from direct pixel analysis of the uploaded reference screenshots — a Landbook color-extraction panel for the Vistal template, the live `vistal.webflow.io` hero section, and the Vistal navigation/wordmark — cross-checked against a live fetch of `vistal.webflow.io`. All hex values below were sampled programmatically from the actual image pixels, not estimated by eye. Where something could not be verified with certainty (typeface identity), that is stated explicitly rather than guessed.

This system is meant to be handed to any agentic tool (Codex, Antigravity, Cursor, etc.) as a single source of truth so output stays consistent across sessions and tools.

---

## 1. Brand Rationale

The reference uses a four-color system built around a mustard-yellow accent against black, cream, and white. For a lost-and-found platform this maps well conceptually: yellow reads as an attention/alert color (appropriate for "something needs your attention" states — new matches, pending claims), while black and cream carry the professional, trustworthy tone needed for a system handling other people's property. This is not a coincidence to force — it's a legitimate reason to keep the palette rather than changing it arbitrarily.

---

## 2. Color Palette

Re-verified against three sources: (1) a Landbook auto-extracted 10-swatch palette generated directly from the live Vistal template, (2) a direct pixel sample of the live `vistal.webflow.io` hero section, and (3) the Vistal nav/wordmark screenshot. Core UI values below are confirmed by sampling the live hero page pixel-by-pixel (Python/PIL), which is more reliable for chrome colors than the Landbook panel, since that panel mixes in photography-derived tones (see §2.1).

| Token | Hex | RGB | Usage |
|---|---|---|---|
| `--color-black` | `#000000` | 0, 0, 0 | Primary text (confirmed: hero headline samples pure black), dark section backgrounds, header/footer, primary buttons |
| `--color-accent-yellow` | `#EFD556` | 239, 213, 86 | CTAs, active states, highlight sections, badges, "attention needed" indicators — confirmed by direct pixel sample of the live hero background |
| `--color-cream` | `#F0EFED` | 240, 239, 237 | Secondary section backgrounds (alternate to pure white, softer than white) |
| `--color-white` | `#FFFFFF` | 255, 255, 255 | Primary background, card backgrounds, nav bar |
| `--color-text-muted` | `#75797B` | 117, 121, 123 | Body copy, secondary/supporting text, captions |

**Do not introduce additional hues.** No blues, greens, or reds outside of functional states (see below). The entire aesthetic depends on restraint — four neutrals plus one accent.

### 2.1 Photography grading palette (extracted from Landbook's auto-palette)

The Landbook color-extraction panel doesn't just sample UI chrome — it pulls dominant colors from the whole page, which on this template means the architecture photography as well. Sampling that swatch strip directly gives a secondary, earth-tone palette. This is **not** a UI palette; it's the natural color grading the reference photography sits in, and it's useful for briefing photographers/color-grading real item and campus photos so they match the reference's visual world (see §6, Imagery):

| Swatch | Hex | RGB | Read |
|---|---|---|---|
| 1 | `#EDCF54` | 237, 207, 84 | Near-identical to the UI accent yellow — confirms the yellow is a deliberate, consistent brand color, not a one-off |
| 2 | `#5B5652` | 91, 86, 82 | Warm charcoal (photo shadow tone) |
| 3 | `#7A7672` | 122, 118, 114 | Warm mid-gray (photo midtone) |
| 4 | `#E1C861` | 225, 200, 97 | Secondary/muted yellow variant (likely a highlight or hover tone in imagery) |
| 5 | `#635438` | 99, 84, 56 | Dark umber |
| 6 | `#88745A` | 136, 116, 90 | Mid brown |
| 7 | `#AC9479` | 172, 148, 121 | Warm tan |
| 8 | `#936E52` | 147, 110, 82 | Terracotta-brown |
| 9 | `#8F7421` | 143, 116, 33 | Dark olive-gold |
| 10 | `#8C7332` | 140, 115, 50 | Olive-gold |

**Application:** when color-grading or selecting real photography for the product (item photos, campus shots), bias toward this warm, desaturated, olive/brown/tan range rather than cool or saturated tones — it's what makes the reference's photography feel cohesive with the black/cream/yellow UI rather than clashing against it. Do not use these as UI element colors; they stay confined to imagery grading.

### Functional / semantic colors (new — not in the reference, required for app states)

The reference is a static marketing site and has no form-validation or status states. These must be added, kept minimal, and kept out of the way of the core palette:

| Token | Hex | Usage |
|---|---|---|
| `--color-success` | `#2E7D46` | Item successfully claimed, verification passed |
| `--color-danger` | `#C0392B` | Claim rejected, form errors, destructive actions |
| `--color-info` | `#3B5BA5` | Informational banners only — use sparingly, this is the only "cool" color permitted |

Use these only for functional state indicators (badges, toast messages, form validation). Never use them decoratively.

---

## 3. Typography

**Honesty note:** the exact typeface used in the reference still could not be confirmed programmatically — Webflow serves fonts through hashed CSS bundles I could not fetch directly, and I am not going to name a specific font family as fact when I have not verified it. Cross-checking the hero headline ("Experience innovative architecture that transforms your vision") and the "Vistal" nav wordmark screenshots against the earlier finding: both confirm a grotesque/neo-grotesque sans-serif, medium x-height, moderate letter-spacing on uppercase labels ("ABOUT VISTAL"), no serifs anywhere. The wordmark's lowercase "a" is double-story (open bowl over a straight stem), which is consistent with General Sans, Inter, and Manrope alike, so it doesn't narrow the choice further — all three remain valid, license-clear stand-ins.

Given that, use one of these verified, license-clear alternatives that match the same visual category:

| Role | Recommended font | Source | Why |
|---|---|---|---|
| Primary (headings + body) | **General Sans** | Fontshare (free) | Closest structural match to the reference — geometric grotesque, same weight range |
| Alternative 1 | **Inter** | Google Fonts | Safe, extremely well-supported, near-identical proportions |
| Alternative 2 | **Manrope** | Google Fonts | Slightly rounder, still fits the same mood |

Pick **one** and use it everywhere. Do not mix.

### Type scale

| Style | Size (desktop) | Size (mobile) | Weight | Case |
|---|---|---|---|---|
| Display (hero headline) | 64–96px | 36–44px | 500–600 | Sentence case |
| H1 (section headline) | 40–48px | 28–32px | 500 | Sentence case |
| H2 (subsection) | 24–28px | 20–22px | 500 | Sentence case |
| Body | 16–18px | 15–16px | 400 | Sentence case |
| Caption / label | 12–13px | 12px | 500 | UPPERCASE, +0.08em tracking |
| Button text | 14–15px | 14px | 500 | Sentence case |

**Small uppercase labels** (confirmed live: "■ ABOUT VISTAL" sits directly above the hero headline, black square marker, tracked uppercase, on the yellow section background) precede nearly every section headline. Adopt this as a system convention: every major section gets a small tracked-uppercase eyebrow label with a tiny square/dot marker before it (e.g. "■ REPORT AN ITEM", "■ SEARCH RESULTS", "■ YOUR CLAIMS"). Nav items follow the same marker convention ("▪ Home V.1", "▪ Projects V.1", "▪ Services") — reuse the small square bullet as a consistent micro-detail across both nav and section labels.

---

## 4. Layout & Spacing

- **Base unit:** 8px grid. All padding/margin values should be multiples of 8.
- **Section vertical padding:** 96–120px desktop, 48–64px mobile.
- **Max content width:** 1280px, centered, with 24px side gutters on mobile.
- **Corner radius:** consistent 12–16px on cards and buttons, full pill (999px) on tags and primary CTA buttons. Do not mix radius values within the same component type.
- **Alternating section backgrounds:** the reference deliberately alternates white → yellow → white → black → white → cream → yellow to create rhythm as the user scrolls. Replicate this pattern across your page flow rather than using a single background for the whole site — it is one of the strongest identity markers of this design.

---

## 5. Components

### Buttons
- **Primary CTA:** black pill-shaped button, white text, with a small circular yellow icon-badge (arrow) docked at the trailing edge. Hover: slight scale (1.02) or icon-badge rotates 45°.
- **Secondary:** outline button, black border, transparent fill, black text.
- On yellow or black section backgrounds, invert appropriately — never place a black button directly on a black section.

### Badges / Tags
- Small pill shape, black background with white text for inactive/default state, yellow background with black text for the active/selected state. This active/inactive pill pattern is used in the reference for category filters — reuse it directly for filtering item categories (Electronics, ID Cards, Bags, etc.) in the search page.

### Cards
- White or cream background, 12–16px radius, subtle shadow only (no heavy drop shadows — the reference uses almost none). Image on top, content below, generous internal padding (24–32px).
- The "fanned/stacked card" treatment on the homepage (slightly rotated overlapping cards) is a strong visual signature — appropriate for a "recently reported items" carousel on the dashboard or landing page.

### Accordion (FAQ pattern)
- Reuse directly for FAQ pages and for "claim status details" — thin horizontal dividers, plus/minus icon on the right, generous vertical padding per row (24px+).

### Icons
- Minimal line icons only, single stroke weight, no fills, no gradients, no duotone. Arrow-in-circle is the dominant motif for the reference — keep it for "next," "learn more," and "submit" actions throughout.

---

## 6. Imagery

- Photography-led, not illustration-led. Real, high-quality photographs (architecture in the reference; for this project — actual item photos, campus location photos).
- No stock-photo gloss. Natural light, slightly desaturated, consistent color grading across all images.
- Avoid decorative illustration entirely — it does not belong in this system.

---

## 7. Voice & Microcopy

- Section eyebrow labels: short, uppercase, 2–4 words ("REPORT AN ITEM," "RECENT MATCHES").
- Headlines: direct, benefit-first sentence case, no exclamation points.
- Body copy: short paragraphs, 1–2 sentences, plain language — no jargon, no filler adjectives.
- Buttons: verb-first, 1–3 words ("Get started," "Report item," "Track claim").

---

## 8. What Not To Do

- Do not add drop shadows, gradients, or glassmorphism — none exist in the reference.
- Do not introduce a second accent color without a functional reason.
- Do not use serif fonts anywhere.
- Do not break the 8px spacing grid for "just this one section."
- Do not use rounded corners on some cards and sharp corners on others — pick one radius value per component type and hold it everywhere.

---

## 9. Application Notes for This Project

Map the reference's marketing-site sections onto your actual page types as follows:

| Reference pattern | Your equivalent |
|---|---|
| Hero with large wordmark + CTA | Landing page hero |
| "About" section with stacked fanned cards | Dashboard: recent lost/found items carousel |
| Category pill filters | Search page: item category filters |
| Numbered service list (01, 02, 03) | Reporting flow: step indicator (01 Details, 02 Photos, 03 Location, 04 Review) |
| FAQ accordion | Help/FAQ page, and per-claim status breakdown |
| Dark "tailored for you" CTA section | AI query page or claim-submission confirmation screen |
| Yellow closing CTA band | Final claim confirmation / "track your item" prompt |

This file is the single reference for color, type, spacing, and component rules for every page you build next — landing, auth, dashboard, report, search, claim, and AI query. When we move to individual page specs, they will build on top of these tokens rather than redefining them.

---

## 10. Verification Log

- **Accent yellow**: confirmed `#EFD556` by direct pixel sample of the live hero background at `vistal.webflow.io` — matches the earlier estimate (`#EED556`) within 1px of rounding error, and is independently corroborated by swatch 1 of the Landbook auto-palette (`#EDCF54`).
- **Primary text/black**: confirmed `#000000` by sampling the live hero headline directly.
- **Photography grading palette**: added in §2.1, extracted from the Landbook 10-swatch panel — this was not in the original doc and reflects tones from the site's architecture photography rather than UI chrome.
- **Typography**: no new definitive font match found; the wordmark and headline screenshots reinforce (not overturn) the earlier grotesque-sans finding. Recommendation to use General Sans/Inter/Manrope stands unchanged.
- **Eyebrow-label + nav marker pattern**: confirmed directly from the live nav bar and hero screenshots, including the exact wording "ABOUT VISTAL" and the square-bullet convention used before both nav items and section labels.
