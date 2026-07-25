# Content Register

Status: DRAFT
Last updated: 2026-07-25

Inventory of every content element currently in the static demo (`index.html`) and the source flyer (`docs/source-materials/Greennet Energy.jpeg`), classified for production reuse.

Classification key: CONFIRMED (verified real fact) / RECOMMENDED (safe to keep as placeholder) / ASSUMPTION (unverified, plausible) / MISSING / BLOCKED (cannot publish as-is).

## Company identity

| Element                                                                        | Value in demo                                                                      | Classification     | Notes                                                                                                                                                                                            |
| ------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------- | ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Company name                                                                   | GreenNet Energy Ltd                                                                | CONFIRMED          | Consistent across demo and flyer                                                                                                                                                                 |
| Director name                                                                  | Ogbeiwi Osagioduwa                                                                 | CONFIRMED          | Consistent across demo and flyer                                                                                                                                                                 |
| Address                                                                        | No. 12 Imuentinyan Street, Off Arbico Street, Upper Sokponoba, Benin City, Nigeria | CONFIRMED          | Consistent across demo and flyer                                                                                                                                                                 |
| Phone                                                                          | +234 906 312 1247                                                                  | CONFIRMED          | Consistent across demo and flyer                                                                                                                                                                 |
| Email                                                                          | oduwaogbeiwi@gmail.com                                                             | CONFIRMED          | Consistent across demo and flyer. Note: a personal Gmail address, not a domain-based business address — flag in `docs/requirements-register.md` §5 (Technical access) as a client decision point |
| Tagline "Powering Homes & Businesses with Clean Solar Energy"                  | present                                                                            | CONFIRMED          | Matches flyer                                                                                                                                                                                    |
| Tagline "Harness the Power of the Sun Today"                                   | present                                                                            | CONFIRMED          | Matches flyer                                                                                                                                                                                    |
| Logo mark (sun + leaf, inline SVG)                                             | present                                                                            | RECOMMENDED reuse  | No vector/source logo file exists beyond the hand-recreated inline SVG and the flattened flyer JPEG. Request official SVG/AI/EPS source before final brand rollout                               |
| Brand colors (deep forest #063F2A, primary green #087A42, accent gold #F5C400) | present                                                                            | CONFIRMED reusable | Matches flyer palette — safe design token to carry forward                                                                                                                                       |

## Services (6 items, demo + flyer match)

Solar Installation Services; Solar Panels & Inverters; Batteries & Solar Accessories; Residential & Commercial Solar Solutions; Solar System Maintenance; Solar Products Distribution.

Classification: **ASSUMPTION**. Matches both demo and flyer consistently, but the discovery workbook's "which services must appear on the website at launch" question is unanswered — treat this list as a strong starting draft, not a confirmed final Solar Solutions / Products scope.

## Solar Solutions direction (July 2026 client confirmation)

The client explicitly supplied and confirmed four editorial solution pillars:

1. Solar Energy Systems
2. Project Delivery
3. Monitoring & System Care
4. EV Charging & Solar Carports

The client also supplied the detailed capability direction represented by Professional Site
Assessment; Sales & Turnkey Installation; Monitoring: Diagnosis & Reporting; High-Grade Cabling
Solutions; Solar Mount & Structural Support; Car Charging Stations / EV Integration; and
Maintenance & Technical Support.

Classification: **CONFIRMED service direction and naming**. This confirmation supersedes the legacy
six-item demo list as the public page's editorial architecture. It does not turn unsupported
operating claims into facts. Exact warranties, service areas, certifications, suppliers,
monitoring-alert/report cadence, structural-engineering sign-off, maintenance SLAs, savings, and
performance guarantees remain **MISSING/BLOCKED for claim-level publication**.

Safe implementation guidance:

- Describe capabilities and customer value neutrally.
- State that specialist structural verification is identified where required; do not claim GreenNet
  provides certification or engineering sign-off.
- Use "warranty coordination where applicable," never an exact warranty promise without
  documentation.
- Sector pathways may describe intended relevance but must not imply completed GreenNet projects.
- The editorial architecture may publish independently of the CMS catalogue. CMS service rows remain
  governed by draft/published status and public RLS filtering.

## "Why choose us" claims (6 items, demo + flyer match)

Quality Solar Products; Professional Installation; Reliable After-Sales Support; Affordable Prices; Energy-Saving Solutions; Expert Technical Support.

Classification: **BLOCKED for verbatim reuse as factual claims**. These are marketing statements, not verified facts. Warranty/after-sales support terms are explicitly MISSING (see requirements register §5) — "Reliable After-Sales Support" and "Affordable Prices" are claims that should be reviewed by the client before publishing on the production site, since they imply commitments (support SLAs, pricing position) that are not documented anywhere.

## Process steps (4 items)

Free Site Assessment → Custom System Design → Professional Installation → Commissioning & Ongoing Support.

Classification: **ASSUMPTION**. Plausible and consistent with solar-industry norms, not confirmed by any client answer. Workbook explicitly asks whether GreenNet offers site assessments (unanswered).

## FAQ content (6 Q&As)

Classification: **ASSUMPTION, written by prior implementation, not client-approved**. One FAQ answer states specific business claims (turnkey full-service, headquartered address, response availability) that should be re-verified against actual client confirmation before production publish. The workbook explicitly flags "who will approve written content and factual claims" as unanswered — no one has signed off on this FAQ copy.

## Projects / portfolio images

| Element                                                                    | Value                                                      | Classification                                                                                                                                                                                                                                                                                                                                                                       |
| -------------------------------------------------------------------------- | ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 3 project images (Unsplash-hosted)                                         | residential rooftop, commercial building, industrial array | **BLOCKED — must not be reused in production.** These are third-party stock photos, explicitly disclosed in the demo footer as "for visual presentation only." Discovery workbook flags this directly: "Do you have real photographs of completed installations?" — unanswered. Per explicit user instruction, stock/AI imagery must never be represented as real GreenNet projects. |
| Flyer photos (installer on roof, battery unit, panel array, house at dusk) | present in `Greennet Energy.jpeg`                          | **BLOCKED — provenance unverified.** No source material confirms these are genuine GreenNet installation photos versus licensed stock/AI-generated marketing imagery. Do not carry into the Projects page without written client confirmation of authenticity and usage rights.                                                                                                      |
| "Why GreenNet" hero image (technician on rooftop)                          | Unsplash-hosted                                            | **BLOCKED**, same reasoning as above                                                                                                                                                                                                                                                                                                                                                 |

Production requirement: Projects page must launch with either (a) confirmed real project photography with case-study metadata (location, type, equipment — per workbook Q), or (b) clearly-labeled illustrative/placeholder content that does not claim to depict real installations, pending client supply.

## Layout, interaction, and accessibility patterns (reusable, non-factual)

These are implementation patterns, not business content — safe to carry forward regardless of discovery-answer status:

- Section structure and information architecture (nav → hero → trust strip → services → why-us → process → projects → assessment CTA → FAQ → contact → footer)
- Design tokens (color, type scale, spacing, radii, shadow, easing) in `styles.css`
- Responsive breakpoint strategy (768/1024/1440 min-width, plus mobile-specific max-width rules)
- Mobile menu drawer pattern with focus trap and `Escape`-to-close
- Scroll-reveal via `IntersectionObserver`, with `prefers-reduced-motion` fallback
- FAQ accordion (one-open-at-a-time) pattern
- Sticky mobile call/email CTA pattern
- Accessibility conventions: `aria-expanded`, `aria-controls`, `aria-hidden`, `role="dialog"`, `inert`, skip-to-content link, visible focus states

Full audit of these is in `docs/current-demo-audit.md`.

## Contact / Quotation page copy (implemented, RECOMMENDED/neutral — not client-approved)

Added building the `/contact` flow (`docs/decision-log.md` ADR-010). All of the following is placeholder-grade, deliberately neutral, and must be reviewed before being treated as final:

| Element                                                                                                    | Value                                                                                                                                                                       | Classification                                                                                                                                                                                                                                              |
| ---------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Page heading/description                                                                                   | "Contact us / Request a quotation" + one neutral sentence                                                                                                                   | RECOMMENDED — no business claims, safe to keep as-is or swap freely                                                                                                                                                                                         |
| `INTERESTED_SOLUTION_OPTIONS` labels (`src/lib/validation/quote-request.ts`)                               | Complete solar system / Site assessment / Solar installation / Monitoring & maintenance / Products & equipment / Cabling & mounting / EV charging / General enquiry / Other | **CONFIRMED direction, neutral form labels.** Values are stable, server-validated and safe for query-string preselection only after allow-list validation. Labels reflect the July 2026 client-confirmed service direction without adding operating claims. |
| Success/acknowledgement-email copy ("we've received your enquiry... someone from our team will follow up") | RECOMMENDED                                                                                                                                                                 | No response-time promise (unconfirmed), no pricing/savings/warranty claim — see requirements register §5                                                                                                                                                    |
| Notification email recipient default (`siteConfig.contact.email` fallback)                                 | CONFIRMED                                                                                                                                                                   | Uses the one verified business email fact already in this register's "Company identity" table — not new content                                                                                                                                             |

## Summary

| Category                                                        | Reuse verdict                                                                                                    |
| --------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Design tokens, layout, interaction patterns, accessibility work | Preserve and port deliberately                                                                                   |
| Contact details, company name, director, address                | Confirmed factual, reuse directly                                                                                |
| Services/process/FAQ copy                                       | Reuse only as an editable draft in the CMS, pending client review — not final copy                               |
| "Why choose us" claims                                          | Hold for client legal/factual review before publishing                                                           |
| All photography (stock and flyer)                               | Do not publish as real project evidence; replace with confirmed real photography or clearly-labeled placeholders |
| Logo                                                            | Request true vector source; current inline SVG is a recreation, not the official asset                           |
