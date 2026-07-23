# Current Demo Audit

Status: FINAL (audit of static prototype as of commit `e2398f1`)
Last updated: 2026-07-17

This formalizes the repository audit already performed for the existing static demo. It is a snapshot, not a living document — re-run if the demo changes materially before migration.

## Repository inventory

- `index.html` (816 lines) — entire page markup, single file
- `styles.css` (~1950 lines) — all styling, CSS custom-property token system
- `script.js` (316 lines) — vanilla JS IIFE, no dependencies
- `README.md` — title only, no content
- `AGENTS.md` — placeholder stub, no content (being revised, see §7)
- `Greennet Energy.jpeg` — marketing flyer image

## Stack

No framework, no build tool, no package manager, no dependencies beyond CDN-loaded Google Fonts and hotlinked Unsplash images. No routing (single page, in-page anchors). No components (framework-level). No backend, no database, no environment variables, no CI/CD, no deployment pipeline configured.

## Architecture

Static HTML/CSS/JS served directly, no bundling or transpilation. Single IIFE handles: sticky nav state, mobile menu with focus trap, smooth-scroll anchors, `IntersectionObserver` scroll-reveal, FAQ accordion, sticky mobile CTA visibility, button/card micro-interactions, scroll-spy active-link highlighting.

## Problems identified

- Contact info (phone/email) hardcoded in 4+ separate locations (nav mobile menu, contact-cta section, footer, sticky CTA) — no single source of truth
- Icon SVGs (phone, mail) duplicated ~5 times with no sprite/symbol reuse
- No content/markup separation — all copy is hand-authored inline HTML, no CMS or data layer
- `README.md` and `AGENTS.md` are empty stubs, no setup/deploy/contribution docs
- No contact form — only `mailto:`/`tel:` links, no lead capture mechanism

## Missing features (relative to production requirements)

Contact/quote form with validation and storage, sitemap.xml/robots.txt/manifest.json, analytics, multi-page structure, image optimization pipeline, CI, tests, favicon PNG fallback, Open Graph/Twitter Card meta tags.

## Risks identified

- Hotlinked third-party images (Unsplash) — availability and provenance risk, explicitly disclosed as non-representative in the demo footer
- Google Fonts loaded externally — no self-hosting, privacy/GDPR exposure for EU visitors
- No CSP or Subresource Integrity on external resources
- No deployment pipeline — deploy mechanism was undefined at audit time
- Single-file scaling ceiling — HTML/CSS files will become unwieldy if extended without componentization

## What is worth preserving (see `docs/content-register.md` for the full breakdown)

Design tokens (color/type/spacing/radius/shadow/easing scales), BEM naming discipline, section/information architecture, responsive breakpoint strategy, accessibility patterns (focus trap, ARIA attributes, reduced-motion handling, skip link), and specific interaction patterns (FAQ accordion, scroll-reveal, sticky CTA, mobile drawer).

## What must not be preserved

One-page architecture, hardcoded duplicated contact information, hotlinked/unverified stock imagery represented as real projects, absence of backend/auth/data model/lead storage/tests/deployment pipeline.

## Disposition

This demo is retained as a **visual and content reference only**. It is not the base for the production codebase. See `docs/migration-strategy.md` for how it will be preserved during the Next.js/Supabase build.
