# Technical Debt

Status: LIVE — append as discovered, don't fix on discovery unless blocking
Last updated: 2026-07-21

Non-blocking issues: don't break the build, don't fail tests, don't affect security, don't affect the user in a way that matters right now. Recorded here instead of fixed inline, per project working style.

## Admin dashboard / quotation management (this milestone)

- **No pagination on the quotations list.** `listQuotations` caps at 200 rows (`.limit(200)` in `src/lib/admin/quotations-data-source.ts`). Fine at current/expected volume; revisit if the table needs to show more than 200 open enquiries at once.
- **No optimistic UI on status update.** `QuotationStatusForm` submits, waits for the server action, then `revalidatePath` refreshes the page — a brief stale-then-updated flash is possible instead of an instant UI update. Not incorrect, just not maximally snappy.
- **Small duplicated label-lookup helpers.** `interestedSolutionLabel`/`labelFor` exist locally in `src/components/admin/quotations-table.tsx`, `src/app/(admin)/admin/quotations/[id]/page.tsx`, and `src/lib/email/templates/quote-notification.ts` rather than one shared helper. Each is a 1–2 line array `.find()`; consolidating would mean touching already-shipped Milestone 1 code for marginal benefit. Revisit if a fourth call site appears.
- **Playwright cannot exercise authenticated `/admin/*` flows.** No live Supabase project is connected in this environment (explicit project constraint — see `docs/decision-log.md` ADR-010/011), so a real session cookie can't be created for e2e tests. Covered instead by: Vitest with an injected fake `QuotationsDataSource` for all data-layer logic (`tests/unit/quotations-logic.test.ts`, `tests/unit/quotations-mapping.test.ts`), React Testing Library for the presentational components' empty/unavailable/data states (`tests/unit/quotations-table.test.tsx`, `tests/unit/quotation-summary-cards.test.tsx`), and Playwright only for the unauthenticated-redirect security property (`tests/e2e/admin-dashboard.spec.ts`). See `docs/testing-plan.md`.

## Pre-existing (carried over, not introduced this milestone)

- **`middleware.ts` naming deprecation.** Next.js 16 warns `The "middleware" file convention is deprecated. Please use "proxy" instead.` on every build/dev start. Functionally correct today; rename to `proxy.ts` in a dedicated pass once Next's migration guidance is confirmed stable, not mid-feature-milestone.
- **Dev-time console noise when Supabase env vars are unset.** `[auth] failed to resolve admin session`, `[middleware] failed to resolve session`, `[admin] failed to create quotations data source` all log a full `ZodError` in this environment (no `.env.local` exists, by design). These are the intended fail-closed error path, not bugs — see `docs/security-model.md`. Noisy in the Next.js dev overlay but harmless; will disappear once a real Supabase project is configured.
