# Technical Debt

Status: LIVE — append as discovered, don't fix on discovery unless blocking
Last updated: 2026-07-21

Non-blocking issues: don't break the build, don't fail tests, don't affect security, don't affect the user in a way that matters right now. Recorded here instead of fixed inline, per project working style.

## Admin dashboard / quotation management (this milestone)

- **No pagination on the quotations list.** `listQuotations` caps at 200 rows (`.limit(200)` in `src/lib/admin/quotations-data-source.ts`). Fine at current/expected volume; revisit if the table needs to show more than 200 open enquiries at once.
- **No optimistic UI on status update.** `QuotationStatusForm` submits, waits for the server action, then `revalidatePath` refreshes the page — a brief stale-then-updated flash is possible instead of an instant UI update. Not incorrect, just not maximally snappy.
- **Small duplicated label-lookup helpers.** `interestedSolutionLabel`/`labelFor` exist locally in `src/components/admin/quotations-table.tsx`, `src/app/(admin)/admin/quotations/[id]/page.tsx`, and `src/lib/email/templates/quote-notification.ts` rather than one shared helper. Each is a 1–2 line array `.find()`; consolidating would mean touching already-shipped Milestone 1 code for marginal benefit. Revisit if a fourth call site appears.
- **Playwright cannot exercise authenticated `/admin/*` flows.** No live Supabase project is connected in this environment (explicit project constraint — see `docs/decision-log.md` ADR-010/011), so a real session cookie can't be created for e2e tests. Covered instead by: Vitest with an injected fake `QuotationsDataSource` for all data-layer logic (`tests/unit/quotations-logic.test.ts`, `tests/unit/quotations-mapping.test.ts`), React Testing Library for the presentational components' empty/unavailable/data states (`tests/unit/quotations-table.test.tsx`, `tests/unit/quotation-summary-cards.test.tsx`), and Playwright only for the unauthenticated-redirect security property (`tests/e2e/admin-dashboard.spec.ts`). See `docs/testing-plan.md`.

## Services management (this milestone)

- **No delete.** Explicitly out of scope for this milestone — draft/unpublish is the only way to remove a service from the public-facing set for now.
- **Slug collision handling retries once, not exhaustively.** Two services created with the same title in rapid succession could theoretically both collide on the same retry suffix (extremely unlikely at expected volume — see `docs/decision-log.md` ADR-012). Revisit only if this ever actually happens.
- **`body` is a plain `<textarea>`, not a rich text editor**, even though the underlying column is `jsonb`. Fine for now; would need real handling (sanitization, a proper editor) before allowing formatted/HTML content.
- **`ServiceStatusBadge`/`ServiceStatusButton` are separate from the quotations' `StatusBadge`/status form**, not a shared generic component — the status value sets differ (draft/published vs new/contacted/closed) and forcing them into one generic component was judged more complex than two small ones, per this milestone's explicit "no generic CMS abstractions" instruction. Revisit only if a third status-driven entity needs the exact same two-state toggle shape.

## Public Services/Products, Products/Projects management (this milestone)

- **No public Projects page yet.** Not requested this round — `docs/decision-log.md` ADR-013.
- **No image upload/Storage integration.** Image/Cover Image are plain URL text fields; a real upload flow (Supabase Storage bucket + RLS + UI) is a larger, separate piece of work.
- **Public `/services` and `/products` render dynamically on every request** (no ISR/caching configured) — acceptable at current expected traffic; revisit with `revalidate` if it ever matters.
- **Ordering correctness (`sort_order`, then title/name) lives entirely in the SQL `.order()` call** and isn't verified by a live-database test in this environment — only that the mapping layer preserves whatever order the data source returns. Real ordering behavior needs verification against a live Supabase project.
- **`completion_date`/`sort_order` etc. added to `products`/`projects` are unused by `project_type`/`equipment_summary`/`featured`/`brand`/`category`/`spec_sheet_media_id`** (pre-existing columns not touched by this milestone's forms) — those columns simply stay `null`/default for now; nothing broken, just not yet exposed in the admin UI.

## Pre-existing (carried over, not introduced this milestone)

- **`middleware.ts` naming deprecation.** Next.js 16 warns `The "middleware" file convention is deprecated. Please use "proxy" instead.` on every build/dev start. Functionally correct today; rename to `proxy.ts` in a dedicated pass once Next's migration guidance is confirmed stable, not mid-feature-milestone.
- **Dev-time console noise when Supabase env vars are unset.** `[auth] failed to resolve admin session`, `[middleware] failed to resolve session`, `[admin] failed to create quotations data source` all log a full `ZodError` in this environment (no `.env.local` exists, by design). These are the intended fail-closed error path, not bugs — see `docs/security-model.md`. Noisy in the Next.js dev overlay but harmless; will disappear once a real Supabase project is configured.
