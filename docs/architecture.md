# Architecture

Status: DRAFT — planning only, nothing scaffolded yet
Last updated: 2026-07-17

## Stack (confirmed, see `docs/decision-log.md` ADR-001)

Next.js (App Router) + TypeScript + Tailwind CSS + shadcn/ui, backed by Supabase (Postgres, Auth, Storage, RLS). Forms via React Hook Form + Zod. Email via Resend behind an abstracted provider interface. Cloudflare Turnstile as the spam-protection integration point. Deployed to Vercel. Tested with Vitest (unit) and Playwright (E2E). Sentry and Google Analytics as integration points, not necessarily fully configured at Phase 1 launch.

## Rendering strategy

- **Public marketing pages** (Home, About, Solar Solutions, Products, Projects): server-rendered/static-generated where content is published, revalidated on content change (ISR or on-demand revalidation triggered by admin publish actions). Draft content is never rendered on public routes.
- **Contact / Request a Quotation**: server component shell with a client-side form (React Hook Form + Zod), submitting to a server action / route handler that re-validates with the same Zod schema server-side before writing to Supabase.
- **Admin dashboard**: fully authenticated, server-rendered, not statically generated, gated by Supabase Auth session + role check at the layout level, with RLS as the defense-in-depth backstop (never trust client-side role checks alone).

## Draft/published content states

Every content table that feeds a public page (`services`, `products`, `projects`, and optionally `pages` for About/Home copy blocks) carries a `status` enum (`draft` | `published`). Public queries filter `status = 'published'` unconditionally at the data-access layer, not per-call, to eliminate the risk of an admin query path accidentally leaking drafts to the public site.

## Proposed repository structure

Given Phase 1 scope (one Next.js app, one Supabase project, no other services), a monorepo is not justified. Recommended flat structure once the migration branch scaffolds the app:

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

Whether the legacy demo lives as a directory (`legacy-demo/`) versus purely a Git branch is an open decision — recommend **branch-only** (not a co-located directory) to avoid the demo's static assets/routes ever being accidentally served by the Next.js app. Final call recorded in `docs/decision-log.md` once made.

## Integration points (confirmed as points, not necessarily "live" at Phase 1 launch)

| Integration                        | Purpose                                                   | Notes                                                                                                                                                                                                   |
| ---------------------------------- | --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Resend / abstracted email provider | Notification + acknowledgement emails on quotation submit | Implemented behind `EmailProvider` (`src/lib/email/`) — console dev provider by default, real Resend adapter only when `RESEND_API_KEY` is set. Not exercised with a real key yet.                      |
| Cloudflare Turnstile               | Spam protection on the quotation form                     | Implemented in `src/lib/turnstile/verify.ts` — real siteverify call when `TURNSTILE_SECRET_KEY` is set, explicit logged dev/test bypass when it isn't. Never fakes success once a secret is configured. |
| Sentry                             | Error monitoring                                          | Wire the SDK and DSN env var; alerting/thresholds are a later operational decision                                                                                                                      |
| Google Analytics                   | Analytics readiness                                       | Respect any confirmed cookie/privacy requirements (currently MISSING, see requirements register) before enabling by default                                                                             |

## Rate limiting

The quotation form's route handler (`src/app/api/quote-requests/route.ts`) applies an in-memory, per-process `RateLimiter` (`src/lib/rate-limit/memory.ts`) keyed on a hashed IP address (SHA-256, truncated — the raw IP is never logged or stored). This is adequate for a single long-lived server but is **not** safe across multiple serverless invocations or horizontally-scaled instances, since each process holds its own counters. A Redis/Upstash-backed adapter implementing the same `RateLimiter` interface is the documented future swap-in; no new env vars are introduced for it until it's actually built.

## Environment variables

None of these have real values in this repository — copy `.env.example` to `.env.local` once the corresponding accounts exist; see `docs/security-model.md`.

- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (server-only, never exposed client-side; not required by the quotation flow — see ADR-010)
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
