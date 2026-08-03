# AGENTS.md

## Project

GreenNet Energy Ltd production website. Confirmed stack: Next.js (App Router), TypeScript, Tailwind CSS, shadcn/ui, Supabase (Postgres/Auth/Storage/RLS), React Hook Form + Zod, Resend (abstracted email provider), Cloudflare Turnstile, Vercel, Vitest, Playwright, Sentry, Google Analytics. See `docs/decision-log.md` ADR-001 — this is a confirmed client decision, not a suggestion.

Repository root currently holds only the legacy static demo (`index.html`, `styles.css`, `script.js`) and the `docs/` planning set. The production app has not been scaffolded yet.

## Before doing anything

Read `docs/project-brief.md`, then `docs/requirements-register.md`. The client discovery document in `docs/source-materials/` is a blank template — most business facts about GreenNet are MISSING, not just undocumented. Do not invent company facts, brand claims, warranty terms, or business details not present in `docs/requirements-register.md` §"CONFIRMED" entries.

## Hard constraints

- Do not delete, move, or overwrite the legacy static demo files in place. Preserve via branch/tag first, per `docs/migration-strategy.md`.
- Do not scaffold or modify the production app directly on `main`. Use a dedicated migration branch until cutover is verified.
- Do not represent stock, flyer, or AI-generated imagery as real GreenNet project photography. See `docs/content-register.md` and the `media.rights_confirmed` schema gate in `docs/data-model.md`.
- Do not render draft content (`status != 'published'`) on public routes.
- Do not let the quotation form write to Supabase directly from the client. Route through a server action/handler with server-side Zod validation and Turnstile verification.
- Do not treat client-side role checks as sufficient. RLS policies (`docs/security-model.md`) are the enforcement backstop for every table.

## Where to look

- `docs/architecture.md` — proposed repository structure, rendering strategy, environment variables
- `docs/data-model.md` — Supabase schema
- `docs/security-model.md` — roles (owner/editor only), RLS boundaries
- `docs/content-register.md` — what legacy-demo content/imagery is reusable vs. blocked
- `docs/decision-log.md` — append-only ADR log; add a new entry for any architecturally significant decision, never edit past entries
- `docs/risk-register.md`

## Out of scope (do not build)

E-commerce, payments, shopping cart, customer accounts/portal, CRM, ERP, inventory management, multilingual content, marketing automation, AI chatbot, solar calculator, automated pricing, drag-and-drop page builder, mobile app, blog (unless a client confirms otherwise via a new decision-log entry).

<!-- GRENNET-CODEX-KIT -->
# GreenNet repository instructions

## Mission

Complete and maintain the existing GreenNet Energy website as a coherent, secure, accessible, responsive, and handover-ready product. Do not create a parallel prototype unless explicitly requested.

## Required skill

For GreenNet branding, content, pages, assets, forms, backend integration, release preparation, deployment, or handover work, use the `greennet-release` skill from `.agents/skills/greennet-release/SKILL.md`.

## Working agreements

- Inspect the repository and `git status` before editing.
- Preserve valid uncommitted changes.
- Use existing architecture and approved assets.
- Do not invent business facts, claims, contacts, projects, specifications, certifications, warranties, partnerships, prices, or testimonials.
- Hide unverifiable optional public content and record it for client approval.
- Keep public product pricing absent unless explicitly approved.
- Prefer a complete vertical release over broad unfinished redesign.
- Run the repository's lint, type-check, tests, and production build after changes.
- Update handover and approval documentation when release behaviour or configuration changes.
- Report exact checks, failures, changed files, remaining blockers, and git status.
