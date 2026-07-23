# Migration Strategy

Status: DRAFT — planning only, no execution yet
Last updated: 2026-07-17

## Governing principle

Build the production application alongside the current static demo. Do not destructively rewrite it. The demo remains fully intact and recoverable until equivalent production functionality is verified and the client has explicitly agreed to cut over.

## Non-negotiable rules for this migration

1. Never delete the current demo without a recoverable Git commit or branch already in place.
2. The demo is preserved in a clearly identified reference location (branch and/or directory) before any scaffolding work touches shared paths.
3. A dedicated migration branch hosts all Next.js/Supabase scaffolding work — `main` is not touched by scaffolding commits until the team is ready to cut over.
4. Visual/content patterns are ported deliberately, one at a time, cross-checked against `docs/content-register.md` — not bulk-copied.
5. The legacy static implementation is removed only after equivalent functionality is verified in the production app (component parity, content parity, accessibility parity).

## Proposed sequence (not yet executed)

1. **Preserve reference point.** Tag or branch the current `main` state (e.g. branch `legacy/static-demo` or a tag `v0-static-demo`) so the static prototype remains permanently retrievable independent of future `main` history.
2. **Create migration branch.** Branch `migration/nextjs-supabase` (or similar) from current `main` as the workspace for all scaffolding.
3. **Scaffold the production application.** Initialize Next.js App Router + TypeScript + Tailwind + shadcn/ui inside the migration branch, per `docs/architecture.md`. Repository layout decision is documented in that file's "Proposed repository structure" section.
4. **Stand up Supabase.** Schema per `docs/data-model.md`, RLS policies per `docs/security-model.md`. Environment variables and secrets management established before any real data is stored.
5. **Port approved visual patterns deliberately.** Design tokens → Tailwind theme config; layout/section structure → App Router page/layout components; interaction patterns (FAQ accordion, scroll-reveal, mobile drawer, sticky CTA) → React components, re-implemented (not copy-pasted vanilla JS) using the new stack's idioms. Cross-reference `docs/content-register.md` for what content is safe to reuse verbatim versus what requires client sign-off first.
6. **Build Phase 1 pages and admin dashboard** per `docs/requirements-register.md` and `docs/architecture.md`.
7. **Automated tests.** Vitest for units (validation schemas, utility logic), Playwright for critical E2E flows (navigation, quotation form submission, admin auth gate).
8. **Preview deployment.** Vercel preview environment wired to the migration branch for stakeholder review before any production DNS/domain change.
9. **Verification gate.** Confirm functional and content parity against the demo (plus all net-new functionality) before touching production DNS/hosting.
10. **Cutover.** Only after client sign-off: point production domain at the new Vercel deployment. Legacy demo branch remains in the repository's history/branch list — it is archived, not deleted.
11. **Remove legacy files from `main`** only after cutover is confirmed stable, as a separate, clearly-labeled commit that references the preserved branch/tag.

## Repository structure decision

See `docs/architecture.md` §"Proposed repository structure" for the concrete directory layout recommendation. This document only fixes the _process_ (branch-first, verify-before-delete); the _structure_ is specified there to avoid duplication.

## Content migration approach

Content ported in three tiers, matching `docs/content-register.md` classifications:

- **Tier 1 (confirmed facts):** company name, director, address, phone, email, brand colors — ported directly into Supabase `site_settings` / seed data.
- **Tier 2 (assumption-grade copy):** services, process steps, FAQ — ported into the CMS as **draft** content (using the confirmed draft/published state requirement), not auto-published, pending client review.
- **Tier 3 (blocked content):** all demo/flyer photography — excluded entirely from seed data. Projects page ships empty or with explicitly-labeled placeholder entries until real, rights-cleared photography is supplied.

## Exit criteria for calling migration "complete"

- All Phase 1 pages live on the production stack with parity or improvement over the demo
- Admin dashboard functional with owner/editor roles enforced via RLS
- Quotation form live with server-side validation, spam protection, and lead storage
- Automated tests passing in CI
- Legacy static files removed from `main`, demo preserved in an archived branch
- Handover/maintenance documentation delivered
