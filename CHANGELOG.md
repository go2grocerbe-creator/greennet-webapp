# Changelog

Format loosely follows [Keep a Changelog](https://keepachangelog.com/). Dates are commit dates, not calendar-day batches.

## Unreleased — `migration/nextjs-supabase`

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
