# Architecture

Status: IMPLEMENTED — external services and production cutover pending
Last updated: 2026-08-01

## Stack (confirmed, see `docs/decision-log.md` ADR-001)

Next.js (App Router) + TypeScript + Tailwind CSS + shadcn/ui, backed by Supabase (Postgres, Auth, Storage, RLS). Forms via React Hook Form + Zod. Email via Resend behind an abstracted provider interface. Cloudflare Turnstile as the spam-protection integration point. Deployed to Vercel. Tested with Vitest (unit) and Playwright (E2E). Sentry and Google Analytics as integration points, not necessarily fully configured at Phase 1 launch.

## Rendering strategy

- **Public marketing pages**: Home and About are static server components. Services, Products, and Projects are dynamic server components because they read Supabase on request. Every public mapper applies an explicit published-only filter in addition to RLS; optional CMS failures do not replace the verified editorial page with an error state.
- **Contact / Request a Quotation**: server component shell with a client-side form (React Hook Form + Zod), submitting to a server action / route handler that re-validates with the same Zod schema server-side before writing to Supabase.
- **Admin dashboard**: fully authenticated, server-rendered, not statically generated, gated by Supabase Auth session + role check at the layout level, with RLS as the defense-in-depth backstop (never trust client-side role checks alone).

## Draft/published content states

Every content table that feeds a public page (`services`, `products`, `projects`, and optionally `pages` for About/Home copy blocks) carries a `status` enum (`draft` | `published`). Public queries filter `status = 'published'` unconditionally at the data-access layer, not per-call, to eliminate the risk of an admin query path accidentally leaking drafts to the public site.

## Repository structure

Phase 1 uses one Next.js app and one Supabase project, so the implemented repository remains a flat application rather than a monorepo. See `README.md` for the current route and directory inventory.

```
/
├── app/                        # Next.js App Router
│   ├── (marketing)/            # public route group
│   │   ├── page.tsx             # Home
│   │   ├── about/
│   │   ├── solar-solutions/
│   │   ├── products/
│   │   ├── projects/
│   │   └── contact/
│   ├── (admin)/                 # restricted route group
│   │   └── admin/
│   │       ├── layout.tsx        # auth + role gate
│   │       ├── services/
│   │       ├── products/
│   │       ├── projects/
│   │       ├── leads/
│   │       ├── settings/
│   │       └── audit-log/
│   └── api/                     # route handlers (form submit, webhooks)
├── components/
│   ├── ui/                      # shadcn/ui generated components
│   └── marketing/                # ported/rebuilt demo patterns (accordion, sticky CTA, etc.)
├── lib/
│   ├── supabase/                 # client/server Supabase helpers
│   ├── email/                    # abstracted email provider interface + Resend adapter
│   ├── validation/                # Zod schemas (shared client/server)
│   └── auth/                      # role/session helpers
├── supabase/
│   ├── migrations/                # SQL migrations
│   └── seed.sql
├── tests/
│   ├── unit/                      # Vitest
│   └── e2e/                       # Playwright
├── docs/                          # this planning set + future handover docs
└── legacy-demo/ (or a separate archived branch — see docs/migration-strategy.md)
```

The tree above records the original design shape. The implemented app uses `src/app`, `src/components`, and `src/lib`; the public route is `/services`, admin leads are `/admin/quotations`, and audit logging is database-triggered rather than a separate UI route. The legacy demo is preserved both in `legacy-demo/` and on `legacy/static-demo`.

## Integration points (confirmed as points, not necessarily "live" at Phase 1 launch)

| Integration                        | Purpose                                                   | Notes                                                                                                                                                                                                                   |
| ---------------------------------- | --------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Resend / abstracted email provider | Notification + acknowledgement emails on quotation submit | Implemented behind `EmailProvider` (`src/lib/email/`) — console dev provider by default, real Resend adapter only when both `RESEND_API_KEY` and `EMAIL_FROM_ADDRESS` are set. Not exercised with real credentials yet. |
| Cloudflare Turnstile               | Spam protection on the quotation form                     | Implemented in `src/lib/turnstile/verify.ts` — real siteverify call when configured, logged bypass only outside production, and production fail-closed when the secret is missing.                                      |
| Sentry                             | Error monitoring                                          | Wire the SDK and DSN env var; alerting/thresholds are a later operational decision                                                                                                                                      |
| Google Analytics                   | Analytics readiness                                       | Respect any confirmed cookie/privacy requirements (currently MISSING, see requirements register) before enabling by default                                                                                             |

## Rate limiting

The quotation form's route handler (`src/app/api/quote-requests/route.ts`) applies a shared, atomic Supabase-backed `RateLimiter` keyed on a hashed IP address (SHA-256, truncated — the raw IP is never logged or stored). Migration `20260801000001` creates the RLS-protected counter table and service-role-only RPC, so the five-requests-per-ten-minutes window is consistent across Vercel instances. The in-memory adapter remains only for isolated local/unit use.

## Environment variables

None of these have real values in this repository — copy `.env.example` to `.env.local` once the corresponding accounts exist; see `docs/security-model.md`.

- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (server-only, never exposed client-side; required by the validated quotation route after ADR-018)
- `RESEND_API_KEY`, `EMAIL_FROM_ADDRESS`, `QUOTE_NOTIFICATION_EMAIL` (email — see "Integration points" above)
- `NEXT_PUBLIC_TURNSTILE_SITE_KEY` (public — needed client-side to render the widget), `TURNSTILE_SECRET_KEY` (server-only)
- `SENTRY_DSN`
- `NEXT_PUBLIC_GA_MEASUREMENT_ID`
- `NEXT_PUBLIC_SITE_URL`

## Deployment model

- **Preview**: every migration-branch push gets a Vercel preview deployment against a Supabase development/staging project (not production data).
- **Production**: `main` (post-cutover) deploys to the production Vercel project against the production Supabase project. Domain cutover is a client-approved, documented step (see `docs/migration-strategy.md` §"Cutover").

Full preview/production deployment runbook is a Phase 1 deliverable, written once the app is scaffolded (not fabricated here ahead of an actual Vercel project existing).

## Component reuse strategy

Existing demo interaction patterns (FAQ accordion, scroll-reveal, mobile drawer with focus trap, sticky CTA, nav scroll-spy) are **reimplemented as React components** using the new stack's idioms (e.g. `IntersectionObserver` behavior wrapped in a hook, shadcn/ui `Accordion` in place of the hand-rolled FAQ toggle) rather than copy-pasted as vanilla JS bolted onto React. This preserves the _behavior and accessibility properties_ audited in `docs/current-demo-audit.md` without carrying forward imperative DOM code that fights React's rendering model.
