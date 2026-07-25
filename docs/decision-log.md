# Decision Log

Status: LIVE — append new ADRs, do not edit history
Last updated: 2026-07-25

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

## ADR-011 — Admin dashboard: data-source adapter pattern, tri-state reads, full nav with placeholder pages

**Date:** 2026-07-21
**Status:** Confirmed
**Decision:**

- Admin data reads/writes (`quote_requests`) go through a small purpose-built `QuotationsDataSource` interface (`src/lib/admin/quotations-data-source.ts`) — `list()`, `getById()`, `countByStatus()`, `updateStatus()` — rather than typing business logic directly against the raw Supabase client. The one function that touches the real client (`createSupabaseQuotationsDataSource`) is intentionally small and isolated; everything else (`src/lib/admin/quotations.ts`) depends only on the flat interface. This is a direct fix for the `TS2589: Type instantiation is excessively deep` error hit in ADR-010's `authenticate()` — casting around it there was a workaround; wrapping the client in a narrow adapter here avoids the problem at the source and is more testable besides.
- All admin reads use the **session-bound client** (`src/lib/supabase/server.ts`), never the service-role key — RLS (`quote_requests_editor_read`, `quote_requests_editor_update_status`) is what actually authorizes access, per `docs/security-model.md`.
- Every admin data read returns a `DataResult<T> = {status:"ok", data:T} | {status:"unavailable"}`. "Unavailable" covers both "Supabase isn't configured" (data source is `null`) and "the query itself errored" identically — the UI shows one friendly notice either way, never a fake number or a fabricated empty table. A query that succeeds with zero rows is a distinct, genuine `{status:"ok", data:[]}` / `{total:0,...}` — visibly different from "unavailable" in the UI copy.
- The admin sidebar lists the full planned IA (Dashboard, Quotations, Services, Products, Projects, Site settings) now, with Services/Products/Projects/Site settings as real placeholder pages (static "not built yet" content) rather than disabled/dead links — each becomes a working page in its own future milestone without any nav restructuring.
- Quotations list is capped at 200 rows, no pagination yet (see `docs/technical-debt.md`) — acceptable at current expected volume, revisit if needed.

**Rationale:** Matches the confirmed objective (staff can log in, view/read/update quotation status, nothing more) while keeping the data layer testable without a live Supabase project — same dependency-injection discipline as ADR-010, refined to avoid its TypeScript rough edge.
**Not built:** pagination, notes/assignment/internal comments/email-sending on quotations (explicitly out of scope), any functionality behind the Services/Products/Projects/Site settings placeholders.

## ADR-012 — Services management: reuse the ADR-011 pattern, no schema change, stable slugs

**Date:** 2026-07-21
**Status:** Confirmed
**Decision:**

- Services CRUD follows ADR-011's shape exactly: `ServicesDataSource` adapter (`src/lib/admin/services-data-source.ts`), pure logic + mapping (`src/lib/admin/services.ts`), server actions (`src/lib/admin/service-actions.ts`). `DataResult<T>` was extracted to `src/lib/admin/data-result.ts` so both features share one definition instead of two copies.
- No migration. The existing `services` table (`docs/data-model.md`) already has every field this milestone needs: `title`, `summary` (Short Description), `body` (Full Description), `icon`, `sort_order` (Display Order), `status` (draft/published only, matching schema — no scheduling/versioning columns exist and none were added).
- `body` is a `jsonb` column but is treated as plain text end to end (the form is a `<textarea>`, not a rich-text editor) — Postgres/PostgREST accept and return a bare JSON string for a `jsonb` column, so no schema or serialization change was needed. Revisit if/when rich content is actually required.
- `slug` is generated from the title on create (`src/lib/admin/slug.ts`) and never regenerated on edit, so a future public service URL stays stable even if the title changes later. A unique-constraint collision (Postgres error `23505`) triggers exactly one retry with a short random suffix — not a lookup-then-insert dance — since this is a low-volume, staff-only tool where a second collision in the same request is not worth engineering around.
- Publish/unpublish is a single-purpose toggle button per row (`ServiceStatusButton`), not a status `<select>` — there are only two states and no scheduling, so a toggle is the simpler, more honest control (`docs/decision-log.md` follows the "don't over-engineer" instruction for this milestone).

**Rationale:** Delivers exactly the objective (staff can create/edit/publish/unpublish services) by reusing a pattern already proven correct and testable in ADR-011, rather than inventing a generic CMS abstraction ahead of Products/Projects needing the same shape in later milestones.
**Not built:** delete, scheduling, revisions/version history, rich text, public Services page (data is publish-ready — RLS already filters to `status = 'published'` for anonymous reads — but no public route reads it yet).

## ADR-013 — Public Services/Products pages, Products/Projects management: reuse over duplication

**Date:** 2026-07-22
**Status:** Confirmed
**Decision:**

- **One data-source `list()` call serves both the admin table and the public page.** `ServicesDataSource.list()` / `ProductsDataSource.list()` already select every column and order by `sort_order, then title/name` — exactly the order the public pages need. RLS (`*_editor_owner_all` for an authenticated editor/owner vs. `*_public_read_published` for anonymous) is what actually restricts the result set, not the query shape. `listServicesForPublic()` / `listProductsForPublic()` are thin mappers over that same call (raw row → full detail shape) sitting next to `listServices()` / `listProducts()` (raw row → slim list-item shape) in the same file — not a second repository, not a duplicate query, per this milestone's explicit instruction.
- **Migration `20260722000001`** adds `summary`, `sort_order`, `image_url` to `products` and `summary`, `sort_order`, `completion_date`, `cover_image_url` to `projects` — additive only, no renames or drops. Required because neither table had a short-description-distinct-from-full-description field, a display order, or an image reference; `services` already had everything (ADR-011/012) and needed no migration. No RLS changes — policies are row-level, unaffected by new columns.
- **`PublishStatusBadge` / `PublishStatusButton`** (`src/components/admin/publish-status-*.tsx`) replace the services-only `ServiceStatusBadge` / `ServiceStatusButton` from ADR-012, generalized to `"draft" | "published"` with an injected server action. Services/Products/Projects all share the exact same two-state model — reusing one component three times is the "reuse existing components" instruction applied literally, not a speculative abstraction. `quote_requests`' new/contacted/closed status keeps its own separate `StatusBadge` (different states, different meaning).
- **Products/Projects admin (`products.ts`/`products-data-source.ts`/`product-actions.ts`, and the `projects.ts` equivalents) mirror `services.ts` file-for-file.** A generic "content type" abstraction over all three was deliberately not built — the fields genuinely differ (Projects has Location + Completion Date, Products has Image, Services has Icon) and a config-driven generic form/table was judged more complex than three small, obviously-correct files, per this milestone's explicit "no CMS abstractions" instruction.
- **`siteConfig.nav`'s "Solar Solutions" entry now points at `/services`** (was `/solar-solutions`, a route that was never built — a pre-existing dead link, not something this milestone introduced). The confirmed page name "Solar Solutions" (`docs/requirements-register.md`) is kept as the nav label; only the route it points to changed, to the one this milestone actually built, per the milestone's own explicit repeated instruction to create the page at `/services`.
- **No public Projects page this round** — not requested in this milestone. `ProjectsDataSource.list()` follows the identical shape to Services/Products so a future `listProjectsForPublic()` is a small addition, not a redesign, when that page is actually needed.
- **Image/Cover Image fields are plain URL text inputs**, not a Supabase Storage upload flow — no upload UI was requested, and building one would need bucket/RLS wiring not in scope here. Public pages render them with a plain `<img>` (not `next/image`) since these are arbitrary staff-supplied URLs, not Storage-hosted assets — `next/image` would need an open-ended `remotePatterns` allowlist for no real benefit yet.

**Rationale:** Delivers all four milestones' stated objectives while maximizing reuse of the ADR-011/012 pattern and the actual RLS-backed data layer, avoiding both duplicate queries and a premature generic CMS layer.
**Not built:** public Projects page, image upload/Storage integration, delete, scheduling, revisions on any of the three content types.

## ADR-014 — Public storytelling architecture: one CSS-variable solar environment

**Date:** 2026-07-20
**Status:** Confirmed
**Decision:** The public redesign implements “The Sun Is the Interface” as one server-rendered semantic story with a single client controller (`SolarExperience`). Native scrolling is normalized to solar progress and written to CSS custom properties once per animation frame; React state changes only at five named phase boundaries. The visual scene uses layered CSS, SVG, perspective, transforms, masks, and gradients. No WebGL, Three.js, animation framework, or new runtime dependency is introduced. The sun is an operable progress/navigation control (pointer drag on fine pointers; phase links and arrow/Home/End keys for keyboard users) and becomes the final quotation action at Night. Reduced-motion users receive five complete static scenes; no-JavaScript users retain all narrative content plus a dedicated phase anchor navigation. Services, Products, and Contact keep their existing server data/form paths and inherit Noon, Golden Hour, and Night visual states respectively. About and Projects remain in the confirmed future IA but are filtered from public navigation until their routes exist.

**Rationale:** The approved concept requires the environment, typography, shadows, and interaction to evolve as a single solar day without compromising SSR, accessibility, or performance. One small CSS-variable controller avoids per-frame React rendering and multiple competing animation systems while preserving reverse-scroll behavior and progressive enhancement. Layered SVG/CSS provides the required depth without the bundle, power, and compatibility costs of WebGL for effects that do not need it.

**Validation:** `npm run check` passes (lint, typecheck, format, 131 Vitest tests, production build). All 39 Playwright scenarios pass, including continuous environmental response, mobile overflow, reduced motion, keyboard phase navigation, final sun CTA, contact flow states, and existing admin/auth route gates. The solar client chunk is approximately 2.9 KB gzip and its scene CSS approximately 3.7 KB gzip in the production build.

**Unchanged:** Supabase schema/RLS, authentication, admin CRUD, API routes, quotation validation/submission, migrations, and public published-only data access.

## ADR-017 — Solar Solutions editorial architecture over the published CMS catalogue

**Date:** 2026-07-25
**Status:** Confirmed
**Decision:** `/services` now publishes a server-rendered editorial Solar Solutions architecture
using the four client-confirmed pillars (Solar Energy Systems, Project Delivery, Monitoring & System
Care, EV Charging & Solar Carports), seven detailed capability records, the ordered Discover →
Assess → Specify → Quote → Install → Support lifecycle, neutral sector pathways and assessment/general
enquiry calls to action. Typed content lives in `src/lib/content/solar-solutions.ts` and is rendered
through reusable semantic marketing components. The page continues to obtain CMS service records
through the existing `getServerServicesDataSource()` → `listServicesForPublic()` path; no second query
or hardcoded substitute exists. An unavailable source still renders `PublicDataState`; a successful
empty result leaves the editorial page intact and explains that detailed published service records
are being prepared.

Contact interest values are expanded to a stable allow-list reflecting the confirmed service
direction. `/contact?interest=...` preselection occurs only when the server recognizes an allowed
value; arbitrary query values are ignored, and the shared Zod schema remains authoritative on both
client and server.

**Rationale:** The client explicitly confirmed the service direction and requested a production-ready
public information architecture, while ADR-004/013 require public CMS records to remain
published-only. Separating confirmed editorial architecture from independently published CMS rows
allows the page to explain GreenNet's solution scope without leaking drafts or inventing catalogue
records.

**Claim boundaries:** The page does not claim exact warranties, geographic service coverage,
certifications, supplier authenticity, monitoring/report cadence, structural-engineering sign-off,
maintenance SLAs, guaranteed savings, performance levels, or product-specific climate ratings.
Where specialist structural verification may be needed, the copy states that it is identified
during assessment rather than claiming GreenNet performs or certifies it.

**Accessibility and presentation:** The architecture uses semantic sections, accessible headings,
ordered lists for true sequences, visible focus states, reduced-motion-safe existing page geometry,
and mobile-first single-axis layouts. It extends ADR-014's forest/gold editorial system without a new
runtime dependency, external imagery or a second visual language.

## Superseded decisions

None yet.
