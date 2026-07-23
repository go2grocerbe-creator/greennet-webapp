# GreenNet Energy — Production Website Project Brief

Status: DRAFT — pending client discovery completion
Last updated: 2026-07-17

## 1. Purpose of this document

This brief defines the confirmed scope, objectives, and constraints for the GreenNet Energy Ltd production website, replacing the current static single-page demo. It is the top-level reference for `docs/requirements-register.md`, `docs/architecture.md`, and all other planning documents in this set.

## 2. Source materials inspected

Two files exist under `docs/source-materials/`:

1. `03_GreenNet_Client_Discovery_and_Sales_Workbook.docx` — an internal sales/discovery meeting template (GoTwoGrocer authorship, meeting date 7 July 2026). **Every "Client answer / notes" field in this document is blank.** It is a question script, not a record of client answers. It contains zero confirmed business facts beyond the questions themselves.
2. `Greennet Energy.jpeg` — a marketing flyer/poster (identical file also present at repo root). Confirms visual brand identity: logo mark, green/gold palette, tagline, services list, "why choose us" list, director name, and contact details. **Photograph authenticity is unverified** — the flyer contains what appear to be installer/product/rooftop photos, but nothing in the source materials confirms these are genuine GreenNet project photos rather than licensed stock or AI-generated imagery. Per explicit instruction, these must not be represented as real GreenNet project photos until confirmed.

No other source material (no filled questionnaire, no brand guideline PDF, no product spec sheet, no logo source file, no legal text, no domain/hosting credentials) was found in the repository.

## 3. Business objective

Not confirmed. The discovery workbook identifies "main result the website should produce" as a CRITICAL question with no answer on file. Working assumption for Phase 1 (see `docs/requirements-register.md`, marked ASSUMPTION): generate qualified quotation requests for solar installation services, supported by credibility content (services, products, projects, about).

## 4. Confirmed production stack

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui
- Supabase (Postgres, Auth, Storage, Row Level Security)
- React Hook Form + Zod
- Resend or an abstracted email-provider interface
- Cloudflare Turnstile (integration point)
- Vercel (hosting/deployment)
- Playwright (E2E tests)
- Vitest (unit tests)
- Sentry (integration point)
- Google Analytics (integration point)

This stack is a client-confirmed architectural decision, not a recommendation open for renegotiation in this phase. See `docs/decision-log.md`.

## 5. Phase 1 page scope (confirmed)

1. Home
2. About GreenNet
3. Solar Solutions
4. Products
5. Projects
6. Contact / Request a Quotation

Plus a restricted administrator dashboard (not a public page) for managing the above content and quotation leads.

## 6. Explicitly out of scope (confirmed)

E-commerce, payments, shopping cart, customer accounts, customer portal, CRM, ERP, inventory management, multilingual content, advanced marketing automation, AI chatbot, solar calculator, automated pricing, drag-and-drop page builder, mobile application, blog (unless later confirmed).

## 7. Relationship to the existing static demo

The repository's current `index.html` / `styles.css` / `script.js` is a **visual and content prototype**, not the production codebase. It was not built against confirmed client requirements — it predates the discovery process and is treated as a design reference only. See `docs/current-demo-audit.md` and `docs/content-register.md` for what is reusable versus what must be replaced.

## 8. Governing migration principle

Build the production application alongside the current demo. Do not destructively rewrite it. Preserve the demo in a clearly identified, recoverable location (branch or directory) before any scaffolding or deletion work begins. See `docs/migration-strategy.md`.

## 9. Open items blocking full sign-off

See `docs/requirements-register.md` for the complete classified list. Highest-impact blockers: no completed discovery answers exist for business goals, target customer priority, budget, launch date, decision-maker, content/photo ownership, and legal/privacy text.
