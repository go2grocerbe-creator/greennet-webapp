# GreenNet Energy — Production Website

Next.js (App Router) + TypeScript + Tailwind CSS + shadcn/ui + Supabase production site for GreenNet Energy Ltd. See `CLAUDE.md` and `docs/` for full context — this is a foundation scaffold, not the complete site. Read `docs/project-brief.md` first.

## Status

Foundation only. Structural pages, layouts, auth/middleware scaffolding, typed config, and the Supabase schema/RLS plan exist. No approved marketing copy, no live Supabase project, no deployment yet. See `docs/decision-log.md` for the ADR history and `docs/requirements-register.md` §5–6 for what's still MISSING/BLOCKED.

## Repository layout

- `src/app` — Next.js App Router routes (`(marketing)` public group, `(admin)` restricted group)
- `src/components` — `ui/` (shadcn primitives) and `marketing/` (site-specific) components
- `src/lib` — env validation, Supabase clients, typed site config
- `supabase/` — SQL migrations, RLS policies, storage policy plan, seed data (not applied to any live project yet)
- `tests/unit` — Vitest + React Testing Library
- `tests/e2e` — Playwright
- `legacy-demo/` — the original static prototype, preserved for reference only (see `legacy-demo/README.md`)
- `docs/` — planning set: brief, requirements register, architecture, data model, security model, decision log, risk register

## Getting started

```bash
npm install
npm run dev
```

Requires a `.env.local` with Supabase/Resend/Turnstile/Sentry/GA variables once those accounts exist — see `docs/architecture.md` "Environment variables". The app builds and runs without them; only Supabase-backed features (auth, admin, forms) need them at runtime.

## Scripts

| Script                            | Purpose                                                     |
| --------------------------------- | ----------------------------------------------------------- |
| `npm run dev`                     | Local dev server                                            |
| `npm run build`                   | Production build                                            |
| `npm run lint`                    | ESLint                                                      |
| `npm run typecheck`               | `tsc --noEmit`                                              |
| `npm run format` / `format:check` | Prettier                                                    |
| `npm run test`                    | Vitest unit tests                                           |
| `npm run test:e2e`                | Playwright (run `npx playwright install` once first)        |
| `npm run check`                   | lint + typecheck + format:check + test + build, in sequence |

CI runs `npm run check` plus a Playwright smoke job on every push/PR — see `.github/workflows/ci.yml`. No production secrets are used in CI.

## Branches

- `main` — stable; currently at the pre-scaffold docs commit until this migration is verified and cut over.
- `legacy/static-demo` — permanent snapshot of the pre-migration static prototype.
- `migration/nextjs-supabase` — active development branch for this scaffold (current branch).

See `docs/migration-strategy.md` for the full cutover plan.
