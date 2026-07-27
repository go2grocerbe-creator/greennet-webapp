# GreenNet Energy — Claude Design Reference

Reference-only design artifacts for the GreenNet Energy sleek-frontend redesign. These are **not** production Next.js code — they are self-contained HTML pages showing the intended visual/UX direction, meant to be translated into `greennet-webapp-v2-front` components (by Antigravity or a developer), not dropped directly into `src/app`.

## What's here

```
claude-reimagination/
  README.md              This file
  handoff-spec.md         Design tokens, page→route mapping, component inventory, placeholders, claims requiring approval
  Header.dc.html          Shared site header (nav, mobile menu, "Request a Quotation" CTA)
  Footer.dc.html           Shared site footer
  Home.dc.html
  Products.dc.html         Catalogue with client-side category filtering
  ProductDetail.dc.html    Representative product detail template
  Solutions.dc.html        Commercial & Industrial / Residential & Estates use cases
  About.dc.html
  Projects.dc.html         Projects & Capabilities (sector capability statements, no fabricated case studies)
  Monitoring.dc.html       Monitoring & Support
  Quote.dc.html            Full consultative quote request form (local state only, no backend)
  Contact.dc.html          Contact details + general enquiry form
  image-slot.js            Drag-and-drop image placeholder component used by every page
  images/                  17 AI-generated placeholder photographs (see below)
```

## How to view

Open any `*.dc.html` file directly in a browser. Each page loads `Header.dc.html` / `Footer.dc.html` and `image-slot.js` from the **same folder** via relative reference — keep all files together to preserve navigation and images.

## Page → production route mapping

| File | Maps to (in `greennet-webapp-v2-front`) |
|---|---|
| `Header.dc.html` / `Footer.dc.html` | `src/components/layout/site-header.tsx`, `site-footer.tsx` |
| `Home.dc.html` | `src/app/(marketing)/page.tsx` |
| `Products.dc.html` | `src/app/(marketing)/products/page.tsx` |
| `ProductDetail.dc.html` | `src/app/(marketing)/products/[slug]/page.tsx` |
| `Solutions.dc.html` | new route, e.g. `src/app/(marketing)/solutions/page.tsx` |
| `About.dc.html` | `src/app/(marketing)/about/page.tsx` |
| `Projects.dc.html` | new route, e.g. `src/app/(marketing)/projects/page.tsx` |
| `Monitoring.dc.html` | new route, e.g. `src/app/(marketing)/monitoring/page.tsx` |
| `Quote.dc.html` | new route, e.g. `src/app/(marketing)/quote/page.tsx` |
| `Contact.dc.html` | `src/app/(marketing)/contact/page.tsx` |

Full design tokens, component inventory, IA rationale, remaining placeholders and claims requiring approval before publishing: see `handoff-spec.md`.

## Images

`images/` holds 17 unique AI-generated placeholder photographs, reused across 31 image slots on the pages where the same visual concept applies (e.g. the same monitoring-dashboard image backs the dashboard feature on Home, Monitoring and the Products/related-systems cards). These are clearly stand-ins for real GreenNet site/installation photography — swap them out before this ships. None are stock photos; no attribution required.

## Flagged as incomplete / requiring approval

Every page marks its own placeholders in-line (e.g. `[Approved specification required]`, `[Phone number pending approval]`). Nothing on these pages should be treated as final copy, contact information, technical specification, warranty term, or certification claim — see `handoff-spec.md` → "Claims requiring approval" for the full list.

## Explicitly not included

No backend, database, authentication, or API code. No production secrets or credentials. No `node_modules` or build output. This folder is presentation-layer reference only.
