# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Production website for GreenNet Energy Ltd, a solar energy company in Benin City, Nigeria. **Confirmed production stack: Next.js (App Router) + TypeScript + Tailwind CSS + shadcn/ui + Supabase (Postgres, Auth, Storage, RLS) + React Hook Form + Zod + Resend (abstracted) + Cloudflare Turnstile + Vercel + Vitest + Playwright + Sentry + Google Analytics.** This is a client-confirmed architectural decision — see `docs/decision-log.md` ADR-001, not open for renegotiation without a new ADR.

**The application is not yet scaffolded.** As of this writing, the repository root still contains only the legacy static demo (`index.html`, `styles.css`, `script.js`) plus the `docs/` planning set. Do not treat the static demo as the production codebase — it is a visual/content prototype only. Read `docs/project-brief.md` first for full context before writing any application code.

## Required reading before implementation work

In this order:

1. `docs/project-brief.md` — objective, confirmed scope, source materials
2. `docs/requirements-register.md` — every requirement classified CONFIRMED/RECOMMENDED/ASSUMPTION/MISSING/BLOCKED
3. `docs/architecture.md` — stack details, rendering strategy, proposed repository structure, environment variables
4. `docs/data-model.md` — Supabase schema
5. `docs/security-model.md` — roles, RLS boundaries, quotation-form submission path
6. `docs/migration-strategy.md` — how the legacy demo is preserved and the production app is built alongside it
7. `docs/content-register.md` — what existing content/imagery is safe to reuse vs. blocked
8. `docs/decision-log.md` — ADRs, append-only
9. `docs/risk-register.md`

## Non-negotiable rules

- **Never delete or overwrite the legacy demo files in place.** Per `docs/migration-strategy.md` (ADR-002), the demo is preserved via a branch/tag before any scaffolding touches shared paths. Production scaffolding happens on a dedicated migration branch, not directly on `main`, until cutover is verified.
- **Never represent stock or AI-generated imagery as real GreenNet projects.** Every `media` row must carry `source_type` and `rights_confirmed` per `docs/data-model.md` / ADR-005; nothing gets attached to `published` content without that gate.
- **Never invent company facts.** The client discovery workbook in `docs/source-materials/` is blank — most business facts (target customers, brand list, warranty terms, budget, launch date, etc.) are MISSING, not just undocumented. Check `docs/requirements-register.md` §5 before writing any copy that states a fact about GreenNet's business.
- **Draft content never renders on public routes.** `services`, `products`, `projects` all carry a `status` enum; public data-access must unconditionally filter to `published`.
- **RLS is enforced independently of application-level checks**, not as a formality — see `docs/security-model.md`. No new table ships without an explicit policy.
- **Quotation form submissions go through a server action/route handler**, never a direct client-side Supabase insert — server-side Zod re-validation and Turnstile verification are mandatory (ADR-006).

## Legacy static demo (reference only)

`index.html` / `styles.css` / `script.js` at the repository root are the pre-discovery static prototype, audited in `docs/current-demo-audit.md`. Worth porting deliberately (not copy-pasted) into the new stack: design tokens (`--c-*`, `--color-*`, `--text-*`, `--sp-*`, `--r-*`, `--shadow-*`, `--ease-*`/`--t-*` custom properties in `styles.css`), BEM naming discipline, section/information architecture, responsive breakpoint strategy, and accessibility patterns (focus trap, ARIA attributes, `prefers-reduced-motion` handling, skip-to-content link). CSS section banners follow `/* ─── N. NAME ───... */` (numbered, not `=====`); HTML section banners follow `<!-- ===== NAME ===== -->` — the two don't use identical delimiter syntax, match them by section name, not by comment style. Do not port the demo's hardcoded/duplicated contact info, hotlinked stock images, or vanilla-JS imperative DOM patterns — see `docs/content-register.md` for the full reuse/replace breakdown.

## Running / previewing (current state)

No build or install step exists yet — the repo has no `package.json`. Do not run `npm install` or scaffold Next.js without following `docs/migration-strategy.md`'s branch-first sequence. To preview the legacy demo only: open `index.html` directly in a browser, or serve the directory with any static file server.
