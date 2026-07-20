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

## Superseded decisions

None yet.
