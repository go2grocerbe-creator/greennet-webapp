# GreenNet Energy — Sleek Redesign: Dev Handoff Spec

Concept files are HTML Design Components (`*.dc.html`) — a visual/UX concept, not a code change to `greennet-webapp-v2-front`. This maps the concept back to that repo's structure so it can be implemented in Next.js.

## Files in this concept
- `Header.dc.html`, `Footer.dc.html` — shared chrome, imported by every page
- `Home.dc.html` → `src/app/(marketing)/page.tsx`
- `Products.dc.html` → `src/app/(marketing)/products/page.tsx`
- `ProductDetail.dc.html` → `src/app/(marketing)/products/[slug]/page.tsx` (one representative template; each real product renders through it)
- `Solutions.dc.html` → new route, e.g. `src/app/(marketing)/solutions/page.tsx`
- `About.dc.html` → `src/app/(marketing)/about/page.tsx`
- `Projects.dc.html` → new route, e.g. `src/app/(marketing)/projects/page.tsx`
- `Monitoring.dc.html` → new route, e.g. `src/app/(marketing)/monitoring/page.tsx`
- `Quote.dc.html` → new route, e.g. `src/app/(marketing)/quote/page.tsx` (replaces/extends current `contact-form.tsx` pattern — full consultative field set)
- `Contact.dc.html` → `src/app/(marketing)/contact/page.tsx`

## Information architecture changes
- Added: Solutions (Commercial & Industrial / Residential & Estates), Projects & Capabilities, Monitoring & Support, and a dedicated Quote route separated from general Contact.
- Products catalogue expanded from 2 categories (Solar, Storage) to 7: Solar Panels, Inverters, Battery Storage, Monitoring Systems, EV Charging, Solar Carports, Commercial Energy Systems.
- Primary header CTA changed from generic nav link to a persistent "Request a Quotation" action.
- Legal/privacy: footer links are placeholders (`href="#"`) — pages not built this pass.

## Design tokens (replace `globals.css` `:root`)
```
--midnight-navy: #0D1B24;
--petrol-teal: #0C5A56;
--petrol-light: #147A74;
--petrol-dark: #084240;
--solar-amber: #F3B23F;
--amber-light: #F5C76A;
--amber-dark: #D99A2A;
--titanium-grey: #69757A;
--warm-white: #F5F2EA;
```
Usage ratio applied: Navy ~55% (header, footer, hero, dark bands), Warm White ~20% (page background), Petrol Teal ~15% (accents, CTA bands, active states), Titanium Grey ~7% (muted text, borders), Solar Amber ~3% (primary buttons, small labels only — never large fills).

Typography: Space Grotesk 600–700 for all headings; Inter 400–600 for body/UI. Loaded via Google Fonts in each page's `<head>`; in the real repo, use `next/font/google` in `layout.tsx` instead.

Border radius: 2px throughout (sharp, engineered feel — not the scaffold's `rounded-3xl`/`rounded-2xl`).

## Component inventory (new/changed vs. scaffold)
- Header: sticky, dark, active-link underline, collapses to a slide-down mobile menu under 880px (was a `<details>` dropdown)
- Footer: 4-column dark footer with tagline, nav groups, legal row (was 2-column light footer)
- Product card: image + category tag + name + eyebrow + short description (was title + short description only)
- Category filter tabs (client-side) on Products
- Consultative quote form: 13 fields across contact/project/message groups, client-side validation, local success state, no backend call
- Capability rows (Projects) replace "case studies" — sector + scope, no fabricated outcomes/numbers
- Support-stage 4-up grid (Monitoring)

## Remaining placeholders (flagged in-page, do not treat as final)
- Logo mark: wordmark only, no brand mark/logo file exists yet
- All photography: `<image-slot>` placeholders (hero, dashboard, applications, capabilities, product images)
- Contact details: phone, WhatsApp, email, office address, business hours
- Product specifications: capacity ranges, battery chemistry, warranty terms, datasheets
- Legal pages: Privacy Policy, Terms of Service (footer links only)

## Claims requiring approval before publishing
- Any specific capacity, output or performance figures
- Warranty terms and certifications
- Named client/project references on the Projects page
- Business hours and office address

## Not done this pass (by design)
- No backend/database/auth/CMS added; quote and contact forms hold state locally only
- Existing mock-now/API-later service pattern (`ProductService`) untouched — real implementation should keep sourcing product data through it, not hardcode it in components
- Separate immersive 3D project not touched
