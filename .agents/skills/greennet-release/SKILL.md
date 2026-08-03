---
name: greennet-release
description: Complete, audit, validate, and prepare the GreenNet Energy website for client review, deployment, or handover. Use when working in a GreenNet website repository on branding, pages, product assets, forms, Supabase integration, responsiveness, accessibility, testing, release documentation, or handover readiness. Do not use for unrelated projects or for inventing unverified business facts.
---

# GreenNet Release

Bring the existing GreenNet website to a coherent, defensible, handover-ready release without creating a parallel prototype.

## Operating rules

1. Work in the current repository and current branch unless the user explicitly directs otherwise.
2. Inspect `git status`, the project structure, package scripts, environment example, routes, assets, data sources, tests, and deployment configuration before editing.
3. Preserve valid uncommitted work. Never reset, delete, or overwrite it to simplify the task.
4. Prefer completing the existing implementation over redesigning or rebuilding.
5. Use actual repository assets. Never invent a new logo, client, project result, certification, warranty, address, contact detail, partnership, product specification, or performance claim.
6. When a fact is unavailable, hide the optional public element or centralize it as a review-required configuration value. Record the gap in the client approval checklist.
7. Keep public product prices absent unless the user supplies and approves them.
8. Run the available checks after implementation and report exact results.

## Required workflow

### 1. Establish the source of truth

- Read the nearest `AGENTS.md` files.
- Read `references/brand-system.md`.
- Read `references/content-guardrails.md`.
- Read `references/handover-definition.md` when the task includes release, client review, deployment, or handover.
- Inspect repository documentation before relying on assumptions.

### 2. Audit before editing

Run or reproduce the checks in `scripts/audit-project.ps1`.

Determine:

- framework and package manager;
- current branch and working-tree state;
- development, lint, type-check, test, and build commands;
- route inventory;
- logo and brand-asset inventory;
- product and project-image inventory;
- environment variables and backend integrations;
- mock data and placeholders;
- broken imports, dead links, missing assets, and visible unfinished states;
- deployment target and current readiness.

Write a short working plan ordered by release risk. Then implement it; do not stop at the audit.

### 3. Complete the release vertically

Prioritize this order:

1. Build and runtime blockers.
2. Incorrect or inconsistent branding and logo usage.
3. Broken navigation, routes, forms, and data flows.
4. Missing core-page content supported by project sources.
5. Responsive and accessibility failures.
6. Metadata, favicon, sitemap, robots, and social sharing.
7. Performance and image optimization.
8. Admin functionality already supported by the architecture.
9. Handover documentation and approval gaps.

Do not expand scope into e-commerce, CRM, payment processing, customer accounts, booking, multilingual support, advanced analytics, or a new CMS unless explicitly requested.

### 4. Validate the implementation

Run the project’s real commands. Prefer scripts declared in `package.json` or repository documentation.

At minimum verify, where supported:

- development server starts;
- lint passes;
- type-check passes;
- focused tests pass;
- full tests pass;
- production build passes;
- no obvious horizontal overflow at approximately 390, 768, 1024, and desktop widths;
- keyboard navigation and focus states work;
- forms validate and show success/error states;
- missing optional contact data does not expose placeholders;
- no secrets are committed;
- public claims are source-supported.

Use `scripts/validate-release.ps1` as a supplemental static check, not as a replacement for project tests.

### 5. Prepare handover artifacts

Create or update:

- `README.md`;
- `HANDOVER.md`;
- `.env.example`;
- `CLIENT_APPROVAL_CHECKLIST.md`;
- `RELEASE_CHECKLIST.md`.

Do not include passwords, tokens, private keys, or unverified public facts.

### 6. Finish with evidence

Report:

1. what was completed;
2. routes completed;
3. logo and asset files used;
4. tests and checks run, including failures;
5. files changed;
6. remaining client-verification items;
7. deployment status;
8. exact next command, if any;
9. `git status` summary;
10. recommended commit message.

If the repository cannot be made fully ready, state the exact blocker and leave the working tree in a recoverable, documented state.
