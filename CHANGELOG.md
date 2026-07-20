# Changelog

Format loosely follows [Keep a Changelog](https://keepachangelog.com/). Dates are commit dates, not calendar-day batches.

## Unreleased — `migration/nextjs-supabase`

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
