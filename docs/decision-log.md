# Decision Log

Status: LIVE — append new ADRs, do not edit history
Last updated: 2026-07-17

Format: one entry per architecturally significant decision. Never delete or rewrite a prior entry — supersede it with a new dated entry that references the old one.

## ADR-001 — Production stack: Next.js App Router + Supabase

**Date:** 2026-07-17
**Status:** Confirmed
**Decision:** Production application built with Next.js (App Router), TypeScript, Tailwind CSS, shadcn/ui, Supabase (Postgres/Auth/Storage/RLS), React Hook Form + Zod, Resend (abstracted), Cloudflare Turnstile, deployed to Vercel, tested with Vitest + Playwright, Sentry and Google Analytics as integration points.
**Rationale:** Explicit client/stakeholder instruction, not a team recommendation. Superseded the previously-recommended "stay static, add a lightweight SSG" option once actual production requirements (auth, admin dashboard, lead storage, roles) were confirmed — those requirements need a real backend, which a static-site generator does not provide.
**Alternatives considered:** Static-site generator (11ty/Astro) with a form backend — rejected because the confirmed scope includes an authenticated admin dashboard with owner/editor roles, RLS-backed data, and audit logging, which is backend-dependent functionality a static generator cannot own.

## ADR-002 — Build alongside, not destructive rewrite

**Date:** 2026-07-17
**Status:** Confirmed
**Decision:** The current static demo is preserved (branch and/or tag) and not deleted or overwritten in place. Production work happens on a dedicated migration branch. Legacy files are removed from `main` only after production functionality is verified.
**Rationale:** Explicit instruction. Also sound practice independent of instruction: the demo is the only existing reference for approved visual direction, and deleting it before the new build reaches parity would destroy the one artifact needed to verify that parity.

## ADR-003 — Two-role model only (owner, editor)

**Date:** 2026-07-17
**Status:** Confirmed
**Decision:** `profiles.role` is a two-value enum: `owner`, `editor`. No additional role tiers in Phase 1.
**Rationale:** Explicit confirmed requirement ("Owner and editor roles"). No source material suggests a need for more granular roles (e.g. viewer-only, content-approver) — if that need emerges, it is a new ADR, not an assumption baked in now.

## ADR-004 — Draft/published as a first-class schema concern

**Date:** 2026-07-17
**Status:** Confirmed
**Decision:** `services`, `products`, `projects` all carry a `status` enum (`draft`/`published`), enforced by unconditional filtering in the public data-access layer and by RLS.
**Rationale:** Explicit confirmed requirement, and directly necessary given that Projects content in particular has no confirmed real photography yet (see `docs/content-register.md`) — draft state is how "content exists but isn't publishable yet" is represented, rather than leaving unverified content live by omission.

## ADR-005 — Media provenance tracking (`source_type`, `rights_confirmed`)

**Date:** 2026-07-17
**Status:** Confirmed
**Decision:** Every `media` row records `source_type` (`client_supplied`/`stock_licensed`/`placeholder`) and a `rights_confirmed` boolean gate before attachment to published content.
**Rationale:** Direct response to explicit instruction not to represent stock/AI-generated images as real GreenNet projects, and to the discovery workbook's unanswered "do you have real photographs of completed installations" question. This makes the constraint enforceable in schema, not just a documentation reminder.

## ADR-006 — Quotation form submits via server action, not direct client insert

**Date:** 2026-07-17
**Status:** Confirmed
**Decision:** Public quotation submissions go through a server-side route handler/server action that re-validates with Zod and verifies Turnstile server-side, rather than the client inserting into Supabase directly (even under RLS).
**Rationale:** Confirmed requirements for server-side validation and spam protection are only meaningfully enforced server-side. RLS alone does not verify a Turnstile token or apply custom business validation.

## ADR-007 — Repository structure: single Next.js app, no monorepo

**Date:** 2026-07-17
**Status:** Proposed, not yet finalized
**Decision:** Flat repository with `app/`, `components/`, `lib/`, `supabase/`, `tests/`, `docs/` at the root, per `docs/architecture.md`. Legacy demo preserved via branch, not a co-located directory.
**Rationale:** Phase 1 scope is one application, one Supabase project, no other deployable services — monorepo tooling overhead is unjustified. Recommend branch-only preservation of the legacy demo so its static files can never be accidentally served by the Next.js app.
**Open question:** whether a co-located `legacy-demo/` directory is wanted for easier side-by-side visual comparison during migration, despite the routing-collision risk. Revisit if the team requests it.

## ADR-008 — Migration branch opened

**Date:** 2026-07-20
**Status:** Confirmed
**Decision:** Preservation branch `legacy/static-demo` cut from commit `a0abf1c` (docs commit, includes full planning set). Migration branch `migration/nextjs-supabase` created from the same commit `a0abf1c` and is now the active working branch for all Next.js/Supabase scaffolding, per `docs/migration-strategy.md`.
**Rationale:** Confirmed sequence — preserve reference point, then branch for scaffolding, before any application code is written. `main` stays frozen at `a0abf1c` until cutover.

## ADR-009 — Foundation scaffold landed on migration branch

**Date:** 2026-07-20
**Status:** Confirmed
**Decision:** Next.js App Router + TypeScript + Tailwind CSS + shadcn/ui scaffolded at the repository root on `migration/nextjs-supabase`, built on top of the ADR-008 branch state. Legacy demo moved to `legacy-demo/` (unmodified). Foundation layer built per `docs/architecture.md` §"Proposed repository structure": root layout, `(marketing)`/`(admin)` route groups, not-found/loading/error boundaries, environment validation, Supabase browser/server clients, auth middleware foundation, typed site config, `Container`/`SectionHeading`/`Button` primitives, header/footer placeholders, metadata/sitemap/robots, and GreenNet design tokens migrated into `globals.css` from `legacy-demo/styles.css`. Tooling added: Vitest + React Testing Library, Playwright, Prettier, `npm run check`, GitHub Actions CI. Supabase foundation added under `supabase/`: initial schema + RLS + storage policy migrations, `storage-policy-plan.md`, and `seed.sql` limited to confirmed facts (Tier 1) plus draft-only assumption-grade service names (Tier 2) — no Tier 3 (photography) content, per `docs/migration-strategy.md` "Content migration approach".
**Validation:** `npm run check` (lint, typecheck, format:check, unit tests, build) and a local Playwright smoke run against the built app both pass. No live Supabase project connected; no secrets committed; legacy demo untouched beyond the move.
**Rationale:** Executes the confirmed migration sequence (`docs/migration-strategy.md` steps 2–7) up through a working, tested foundation, without deleting the legacy demo or touching `main`. This is scope-bounded to structure/plumbing — no approved marketing copy was written (see placeholder content in `src/app/(marketing)/page.tsx`), and Products/Projects seed data stays empty per the BLOCKED items in `docs/requirements-register.md` §6.
**Not done in this ADR:** live Supabase project connection, applying migrations anywhere, real content, deployment, cutover. These remain gated on client-confirmed facts and an explicit go-ahead.

## ADR-010 — Quotation enquiry flow: field backbone, insert path, provider abstractions

**Date:** 2026-07-21
**Status:** Confirmed
**Decision:**

- `quote_requests` extended (migration `20260721000001`) with `company_name`, `property_type`, `electricity_usage`, `preferred_contact_method`, `project_timeline`, `privacy_consent` (DB-level `check (privacy_consent = true)`). `service_interest` (existing column) is reused for "interested solution," populated only from a small neutral, non-branded set of values — never the unapproved draft `services` names. `phone` stays nullable; `email` stays the only always-required contact channel.
- The insert path uses the **anon-key Supabase client with no user session**, relying on the existing `quote_requests_public_insert` RLS policy (`with check (true)`) — not the service-role key. This is the "narrowly-scoped RLS-permitted insert path" option from `docs/security-model.md` §"Quotation form submission path" step 3, chosen over service-role to keep the public form's blast radius to exactly what RLS already allows anonymous users to do.
- Turnstile verification, rate limiting, and email delivery are each an injected interface (`src/lib/turnstile`, `src/lib/rate-limit`, `src/lib/email`) so the core `submitQuoteRequest()` pipeline is unit-testable without network calls and swappable per environment. Turnstile's dev/test bypass activates only when `TURNSTILE_SECRET_KEY` is absent (logged clearly); if the secret is configured, verification is always real — the bypass can never silently mask a misconfigured production secret.
- Email is best-effort and non-blocking: the database insert is the authoritative business event; notification/acknowledgement emails are attempted afterward via `Promise.allSettled` and their failure is logged but never rolls back or fails the user-facing response — see `docs/security-model.md` §"Quotation form submission path".
- Rate-limit identifier is a hashed IP (SHA-256, truncated), never the raw address, in line with "no personal data in analytics / logged."

**Rationale:** Matches the confirmed requirement (server-side authoritative validation, Turnstile, rate limiting, secure lead storage) while minimizing new privileged surface area (no service-role key needed for this one insert) and keeping the pipeline testable in isolation.
**Not resolved here:** the exact quotation form field list remains an ASSUMPTION (requirements register §5) and the neutral `service_interest` values are explicitly placeholders pending client-approved service naming — see `docs/content-register.md`.

## Superseded decisions

None yet.
