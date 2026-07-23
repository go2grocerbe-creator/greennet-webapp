# Changelog

Format loosely follows [Keep a Changelog](https://keepachangelog.com/). Dates are commit dates, not calendar-day batches.

## Unreleased — `migration/nextjs-supabase`

### Changed — Public website redesign: "The Sun Is the Interface"

- Rebuilt the public homepage as one scroll-driven solar day: Morning, Noon, Golden Hour, Sunset, and Night. A single accessible sun control tracks progress, supports desktop pointer dragging and keyboard phase navigation, and transforms into the final quotation action.
- Added a lightweight CSS-variable motion controller plus layered SVG/CSS perspective scene (panel field, energy path, battery, horizon, shadows, house, stars). No WebGL, animation framework, or runtime dependency added.
- Redesigned Services, Products, Contact, Header, Footer, loading, error, empty/unavailable, and 404 states around the same time-of-day visual system. About and Projects remain absent from public navigation until their routes exist.
- Added static reduced-motion scenes, a no-JavaScript solar phase navigation, global/story skip links, 44px public controls, mobile direct-contact-first ordering, and explicit 320px layout handling.
- Replaced the public typography pairing with Archivo + Instrument Sans and extended the confirmed GreenNet palette into First Light, Daylight, and Night Canopy scene tokens.
- Expanded Playwright coverage for the solar control, final CTA transition, reduced motion, mobile navigation, route visibility, and horizontal overflow.

### Added — Public Services/Products pages, Products/Projects management

- Public `/services` and `/products` pages — title, short/full description, optional icon/image, sorted by display order then title/name. Published-only via RLS, reusing the exact same `list()` call the admin tables use (`listServicesForPublic`/`listProductsForPublic`), not a duplicate query. Metadata title/description/canonical on both.
- Products management (`/admin/products`, `/admin/products/new`, `/admin/products/[id]/edit`) and Projects management (`/admin/projects`, `/admin/projects/new`, `/admin/projects/[id]/edit`) — same shape as Services (`docs/decision-log.md` ADR-012/013): list/create/edit/publish/unpublish, no delete, draft/published only.
- Migration `20260722000001` — additive `summary`/`sort_order`/`image_url` on `products`, `summary`/`sort_order`/`completion_date`/`cover_image_url` on `projects`. No RLS changes.
- `PublishStatusBadge`/`PublishStatusButton` generalized from the services-only status components to serve all three content types.
- Fixed a pre-existing dead nav link: "Solar Solutions" now points at `/services` (was `/solar-solutions`, a route that was never built).

### Added — Services management

- Services list (`/admin/services`) — service name, status, last updated; Create/Edit/Publish/Unpublish actions, no delete yet.
- Create (`/admin/services/new`) and edit (`/admin/services/[id]/edit`) forms — Title, Short Description, Full Description required; Icon, Display Order optional. Shared Zod schema (`src/lib/validation/service.ts`), server-side validation authoritative.
- Publish/unpublish as a single-purpose toggle per row (`src/components/admin/service-status-button.tsx`) — draft/published only, no scheduling.
- Reuses the existing `services` table as-is — no migration. `src/lib/admin/{services,services-data-source,service-actions,slug}.ts` follow the same adapter + pure-logic + fail-closed pattern as quotations (`docs/decision-log.md` ADR-012). `DataResult<T>` extracted to a shared module.
- Data is publish-ready for a future public Services page: RLS already restricts anonymous reads to `status = 'published'`. The public page itself is not built yet.

### Added — Admin authentication and dashboard

- Admin sign-in at `/login` — Supabase Auth email/password only (no registration/OAuth/magic-link/reset), owner/editor only (a Supabase account with no `profiles` row is rejected and signed back out) — `src/lib/auth/{authenticate,session,actions}.ts`, `src/components/auth/login-form.tsx`.
- `/admin/*` protected at both middleware (session presence) and layout (session + role) — both fail closed (redirect to `/login`) if Supabase isn't reachable, rather than crashing.
- Admin dashboard shell: responsive sidebar + topbar (current page title, signed-in identity, logout), mobile drawer navigation — `src/components/admin/{admin-shell,sidebar,topbar,mobile-nav-drawer,nav-list}.tsx`.
- Dashboard home (`/admin`) — quotation summary cards (total/new/contacted/closed), real zero counts shown as zero, never faked when the database is unreachable.
- Quotations list (`/admin/quotations`) — accessible table (name/email/phone/interested solution/submitted/status), view-only action, capped at 200 rows (see `docs/technical-debt.md`).
- Quotation detail (`/admin/quotations/[id]`) — contact info, project info, message, and a status-only update form (new/contacted/closed) via a server action, RLS-authorized through the session-bound client (no service-role key).
- Placeholder pages for Services/Products/Projects/Site settings — real routes, no functionality yet, so the nav is complete without dead links.
- `src/lib/admin/quotations-data-source.ts` + `src/lib/admin/quotations.ts` — small adapter over Supabase plus pure mapping/aggregation logic, unit-testable without a live project — see `docs/decision-log.md` ADR-011.

### Added — Contact / Quotation enquiry flow

- Public `/contact` page supporting both general contact and quotation requests (single form, no separate calculator/pricing flow) — `src/app/(marketing)/contact/page.tsx`, `src/components/contact/quote-form.tsx`.
- `quote_requests` schema extended (migration `20260721000001`) with `company_name`, `property_type`, `electricity_usage`, `preferred_contact_method`, `project_timeline`, `privacy_consent` (DB-enforced via a check constraint) — see `docs/decision-log.md` ADR-010.
- Shared Zod validation (`src/lib/validation/quote-request.ts`) used by both the client form (React Hook Form + `zodResolver`) and the server — client validation is usability-only, server validation is authoritative.
- `POST /api/quote-requests` route handler: parses only expected fields, re-validates server-side, checks an accessibly-hidden honeypot field, verifies Cloudflare Turnstile, applies an in-memory rate limit keyed on a hashed IP, inserts via the Supabase anon-key client (no service-role key involved), then attempts notification + acknowledgement emails best-effort (their failure never loses a stored lead).
- Provider abstractions, each swappable and testable without live credentials: `src/lib/turnstile/verify.ts` (explicit dev/test bypass, never faked when a secret is configured), `src/lib/rate-limit/` (in-memory `RateLimiter`), `src/lib/email/` (console dev provider + Resend adapter + escaped notification/acknowledgement templates).
- `.env.example` — documents every variable this flow can use, no real values.
- Vitest coverage for the shared schema and the full submission pipeline (mocked dependencies — no network). Playwright coverage for the `/contact` page's accessibility, validation, mocked success/error states, duplicate-submission prevention, and a mobile-viewport smoke test.

### Added

- Documentation set establishing confirmed production architecture, requirements, data model, security model, migration strategy, and risk register (`docs/`).
- `legacy/static-demo` branch preserving the pre-migration static prototype.
- Next.js App Router + TypeScript + Tailwind CSS + shadcn/ui scaffold at the repository root.
- Foundation layer: root layout, `(marketing)` and `(admin)` route groups, not-found/loading/error boundaries, typed site config, environment validation module, Supabase browser/server clients, auth middleware foundation, `Container`/`SectionHeading`/`Button` primitives, header/footer placeholders, metadata, sitemap, robots, GreenNet design tokens migrated into `globals.css`.
- Tooling: Vitest + React Testing Library, Playwright, Prettier, `npm run check`, GitHub Actions CI (no production secrets).
- Supabase foundation: initial schema migration, RLS policies, storage bucket policy plan, seed data limited to confirmed facts and draft-only assumption-grade content (`supabase/`).

### Changed

- Legacy static demo (`index.html`, `styles.css`, `script.js`) moved to `legacy-demo/`, unmodified.

## Prior state

Static single-page demo at the repository root, no framework, no backend. See `docs/current-demo-audit.md`.
