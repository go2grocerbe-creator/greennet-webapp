# GreenNet release checklist

Date: 2026-08-01
Scope: urgent client-handover release

## Repository and build

- [x] Work performed on a non-`main` branch.
- [x] Existing uncommitted solar-story work preserved and integrated.
- [x] Legacy demo preserved in `legacy-demo/` and `legacy/static-demo`.
- [x] Dependency lockfile present.
- [x] Lint passes.
- [x] Type-check passes.
- [x] Prettier check passes.
- [x] Vitest suite passes.
- [x] Production build passes.
- [x] Playwright suite passes on the final handover tree (59 tests).
- [x] Development server startup and route smoke pass on the final handover tree.
- [x] Supplemental release validation passes on the final handover tree.

## Public experience

- [x] Home, About, Solar Solutions, Products, Projects, and Contact routes exist.
- [x] Header, mobile menu, footer, CTAs, and sitemap expose only live routes.
- [x] Optional CMS outages do not expose backend/unavailable states publicly.
- [x] Draft content is filtered in application code and RLS remains the backstop.
- [x] Unverified project/product photography is not rendered publicly.
- [x] No public product pricing is present.
- [x] Titles, descriptions, canonicals, favicon, manifest, social image, sitemap, robots, and structured data exist.
- [x] Security headers are configured.
- [ ] Final manual client review at mobile, tablet, laptop, and desktop widths.
- [ ] Final official logo assets supplied and approved.

## Accessibility and forms

- [x] Skip link and semantic main region present.
- [x] Keyboard-operable primary solar navigation covered by Playwright.
- [x] Visible focus states and 44px public controls present.
- [x] Reduced-motion solar experience covered by Playwright.
- [x] Form labels, required states, error summary, success state, and duplicate-submit protection implemented.
- [x] Server-side Zod validation, honeypot, rate limit, and production-fail-closed Turnstile implemented.
- [x] Browser code never writes quotation data directly to Supabase.
- [x] Quotation rate limiting is shared across serverless instances and fails closed.
- [ ] Real Preview Turnstile and form delivery tested.
- [ ] Client-approved privacy/legal text published.

## Backend and security

- [x] Owner/editor route checks implemented server-side.
- [x] RLS migrations cover every application table.
- [x] Anonymous quotation INSERT policy removed by the final migration.
- [x] Editor quotation updates constrained to status by database trigger.
- [x] Project/product media rights gates enforced by database triggers.
- [x] Content/status audit logging implemented by database trigger.
- [x] No credential values added to repository files.
- [ ] Final migration applied to Preview Supabase.
- [ ] RLS verified against real owner, editor, and anonymous sessions.
- [ ] First owner and approved editor accounts created.
- [ ] Storage upload workflow verified before any public media enablement.
- [ ] Production backup taken before migrations.

## Deployment and approval

- [x] Vercel deployment runbook documented.
- [x] Environment contract documented without secrets.
- [x] Backup and rollback approach documented.
- [ ] Preview and Production environment variables configured separately.
- [ ] Resend sender/domain verified and recipient approved.
- [ ] Domain, DNS, HTTPS, and canonical origin approved and configured.
- [ ] Analytics/privacy decision completed; GA remains disabled until then.
- [ ] Sentry activation and alert ownership decided.
- [ ] Client approval checklist signed.
- [ ] Production deployment approved.
