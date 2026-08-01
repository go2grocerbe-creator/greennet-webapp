# Testing Plan

Status: LIVE — extend as new features land, don't rewrite history
Last updated: 2026-08-01

## Split of responsibility

- **Vitest (`tests/unit/`)** — pure logic: Zod schemas, the quotation submission pipeline, component-level rendering with React Testing Library. No network calls, no browser, no real Supabase/Turnstile/Resend. External dependencies are injected (see "Dependency injection" below) so business logic is tested in isolation.
- **Playwright (`tests/e2e/`)** — real browser against the built app (`next build && next start`, per `playwright.config.ts`), covering navigation, accessibility, keyboard interaction, and UI states. Server-facing scenarios (success/error responses) are tested by mocking the network boundary (`page.route()`), not by exercising the real API route — see "Why Playwright mocks the network" below.

Vitest runs in `npm run check`; Playwright runs separately through `npm run test:e2e`. CI runs both without production secrets (`.github/workflows/ci.yml`).

## Dependency injection for provider boundaries

`src/lib/quote-requests/submit.ts` — the core quotation pipeline — takes its Turnstile verifier, rate limiter, Supabase client, and email provider as an injected `deps` argument rather than importing concrete implementations directly. This is what makes `tests/unit/submit-quote-request.test.ts` able to cover honeypot short-circuiting, rate-limit rejection, Turnstile failure, database failure, and "email fails but the lead is still stored" — all without a network call, a live Supabase project, or real credentials. The real implementations are wired together only once, in `src/app/api/quote-requests/route.ts`.

## Why Playwright mocks the network for /contact

The Playwright config runs the app as a production build (`NODE_ENV=production`). Production Turnstile verification fails closed when `TURNSTILE_SECRET_KEY` is absent, and a real submission also requires a provisioned Supabase project. `tests/e2e/contact.spec.ts` therefore intercepts `**/api/quote-requests` with `page.route()` for success, duplicate, and server-error scenarios. Those tests verify the client's loading, success, duplicate-submission, and error handling independently of external services. Scenarios that do not need a response exercise the real client-side Zod validation. A real Preview submission remains a required deployment check.

## Why the admin dashboard is tested at the data-layer and component level, not via authenticated Playwright

`/admin/*` (dashboard home, quotations list, quotation detail, status update) is gated by a real Supabase Auth session — see `src/proxy.ts` and `src/app/(admin)/admin/layout.tsx`. There is no live Supabase project in this environment, so Playwright can't obtain a real session cookie and can't exercise these pages as an authenticated user. Faking a session cookie is not an option — it would require the project's JWT signing secret, which doesn't exist here and shouldn't be hardcoded even if it did.

Coverage is split instead:

- **`src/lib/admin/quotations.ts`** (pure mapping + list/get/summary/update-status logic) is unit-tested against an injected fake `QuotationsDataSource` (`tests/unit/quotations-logic.test.ts`, `tests/unit/quotations-mapping.test.ts`) — same dependency-injection pattern as `submitQuoteRequest` and `authenticate`. This is where "does the empty-state logic work", "does a query error map to unavailable, not a crash", and "is the status update rejected for an invalid value" are actually proven.
- **Presentational components** (`QuotationsTable`, `QuotationSummaryCards`) are tested with React Testing Library against literal `DataResult` values (`tests/unit/quotations-table.test.tsx`, `tests/unit/quotation-summary-cards.test.tsx`) — this proves the unavailable/empty/data-with-real-numbers rendering branches without needing a browser or a session.
- **Playwright** (`tests/e2e/admin-dashboard.spec.ts`) covers only what's honestly testable without credentials: every `/admin/*` route redirects an unauthenticated visitor to `/login`. That's a real, security-relevant property (proves the auth gate covers every new route), not a placeholder test.

Services management (`tests/unit/services-logic.test.ts`, `tests/unit/services-table.test.tsx`, `tests/unit/service-schema.test.ts`, `tests/unit/slug.test.ts`, `tests/e2e/admin-services.spec.ts`) follows this exact same split, for the same reason — see `docs/decision-log.md` ADR-012. Products and Projects management repeat it file-for-file (`tests/unit/products-logic.test.ts`, `tests/unit/product-schema.test.ts`, `tests/unit/products-table.test.tsx`, `tests/e2e/admin-products.spec.ts`, and the `projects` equivalents) — see ADR-013.

## Public Services/Products/Projects pages and publication gates

`/services`, `/products`, and `/projects` reuse their admin data source's ordered `list()` call, then apply an explicit `status === "published"` application filter before mapping. Unit tests prove drafts are excluded even when an injected data source returns both statuses, covering the authenticated-editor public-route case that RLS alone cannot distinguish. Without live Supabase, public editorial content remains complete and optional catalogue sections stay hidden; Playwright verifies that no backend-unavailable state leaks into the public experience. Real SQL ordering and RLS behavior still require the documented Preview verification.

## Known gaps (intentional, not oversights)

- No test exercises a live Supabase insert, a real Turnstile verification, or a real Resend send — none of those accounts exist yet, and connecting them is explicitly out of scope for this milestone (see `docs/decision-log.md` ADR-010).
- The Supabase rate-limit adapter is unit-tested for allowed, exhausted, and store-failure responses. Atomic SQL concurrency and expiry still require the documented real Preview database verification.
- No visual regression / screenshot testing is set up. The mobile-viewport Playwright test checks for horizontal overflow, not pixel-level layout.
- No test exercises a real authenticated admin session (login → dashboard → update a quotation's status) end to end — see the section above. Everything reachable without live Supabase is covered instead.
- Authenticated CMS flows are covered at logic/component level but still need one real Preview owner/editor E2E pass after Supabase provisioning. Media upload UI remains intentionally disabled until the rights-confirmation workflow is connected.

## Adding tests for new features

- New Zod schemas: unit-test valid/invalid cases directly against the schema, same pattern as `tests/unit/quote-request-schema.test.ts`.
- New server-side pipelines with external dependencies: take a `deps` argument like `submitQuoteRequest`, so tests can inject fakes — don't reach for `vi.mock()` module mocking unless dependency injection genuinely isn't practical.
- New public pages/flows: at minimum, a Playwright test for page load + one keyboard-accessible interaction. Add mocked-network tests only for scenarios where the client's handling of a specific response shape actually matters (success/error UI states), not as a substitute for the unit-level pipeline tests.

## Public solar-story coverage

`tests/e2e/home.spec.ts` verifies the confirmed homepage tagline, keyboard phase navigation, the Night handoff to the illuminated-house quotation action, reduced-motion static scenes, mobile navigation, live primary routes, 390px horizontal-overflow protection, and the redesigned 404 state. `tests/e2e/public-core-pages.spec.ts` adds responsive coverage for all public interior pages at 390, 768, 1024, and 1440 pixels, plus the project-media withholding gate. Manual Preview QA still covers pointer dragging, 320px layout behavior, no-JavaScript phase navigation, control dimensions, and console/page errors.
