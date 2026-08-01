# GreenNet Energy production website

Production website and restricted content-management dashboard for GreenNet Energy Ltd. The app is
built with Next.js App Router, TypeScript, Tailwind CSS, shadcn/ui, Supabase, React Hook Form, Zod,
Resend, Cloudflare Turnstile, Vitest, and Playwright, with Vercel as the deployment target.

The implementation is ready for client review. Production cutover remains blocked until the client
approves the items in `CLIENT_APPROVAL_CHECKLIST.md` and the deployment owner configures the external
services listed in `HANDOVER.md`.

## Routes

Public:

- `/` — solar-day homepage and primary quotation journey
- `/about` — verified positioning and working principles
- `/services` — Solar Solutions pillars, capabilities, lifecycle, and published CMS records
- `/products` — category-level product guidance and published CMS records; no public prices
- `/projects` — capability pathways and approved published project records; unverified photography is withheld
- `/contact` — direct contact details and quotation/general enquiry form

Restricted:

- `/login`
- `/admin`
- `/admin/quotations` and `/admin/quotations/[id]`
- `/admin/services`, `/admin/products`, and `/admin/projects`, including create/edit routes
- `/admin/settings` — read-only review of the verified public identity

Server endpoint: `POST /api/quote-requests`.

## Local setup

Requirements: Node.js 22 and npm.

```bash
npm ci
copy .env.example .env.local
npm run dev
```

Open `http://localhost:3000`. Without Supabase credentials the public editorial pages still render,
while authentication, CMS data, and form storage fail closed. Turnstile permits a logged bypass only
outside production. Resend falls back to a non-sending console provider unless both its API key and
verified sender are configured.

## Environment variables

| Variable                         | Production           | Purpose                                                                     |
| -------------------------------- | -------------------- | --------------------------------------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL`           | Required             | Canonical HTTPS origin, sitemap, and structured data                        |
| `NEXT_PUBLIC_SUPABASE_URL`       | Required             | Supabase project URL                                                        |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`  | Required             | Public reads and admin Auth sessions                                        |
| `SUPABASE_SERVICE_ROLE_KEY`      | Required             | Server-only validated quotation insert                                      |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Required             | Public Turnstile widget                                                     |
| `TURNSTILE_SECRET_KEY`           | Required             | Server-side Turnstile verification                                          |
| `RESEND_API_KEY`                 | Required for email   | Resend API access                                                           |
| `EMAIL_FROM_ADDRESS`             | Required with Resend | Verified sender identity                                                    |
| `QUOTE_NOTIFICATION_EMAIL`       | Client decision      | Lead notification recipient; verified contact email is the current fallback |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID`  | Optional/blocked     | Keep unset until analytics and consent wording are approved                 |
| `SENTRY_DSN`                     | Optional             | Reserved error-monitoring integration point                                 |

Copy `.env.example`; never commit `.env.local`, provider keys, or private credentials.

## Supabase setup

Apply every SQL file in `supabase/migrations/` in filename order. The final release migration removes
anonymous quotation inserts, adds the shared server-only quotation rate limiter, enforces rights
checks for published media, restricts editor lead updates to status, and adds trigger-based audit
logging. Apply `supabase/seed.sql` only to a new environment after reviewing it; its service records
remain draft.

Create the first Supabase Auth user through the project dashboard, then create the matching
`public.profiles` row with role `owner`. Do not add public registration. Owner/editor authorization is
enforced by server route guards and database RLS.

## Content editing

Authenticated owner/editor users can create, edit, publish, and unpublish Services, Products, and
Projects. Public loaders apply an explicit `status === "published"` filter in addition to RLS, so an
editor browsing the public site cannot expose drafts through their broader session permissions.

Product and project image references are preserved for review but are not rendered publicly. Use
the `media` and `project_media` rights-confirmation workflow before enabling public photography. The
supplied flyer is a brand/content source only; its photography is not treated as real GreenNet
project evidence.

## Quality commands

```bash
npm run lint
npm run typecheck
npm run format:check
npm run test
npm run build
npm run test:e2e
npm run check
```

`npm run check` runs lint, type-check, formatting, unit tests, and the production build. Playwright is
separate because it builds and starts the production server; install Chromium once with
`npx playwright install chromium` if needed.

## Deployment

Import the repository into Vercel, configure separate Preview and Production environment values,
apply migrations to the matching Supabase projects, and validate a Preview deployment first. Do not
connect the production domain until the client approves legal/privacy wording, project media,
product facts, form routing, account ownership, and the final domain.

See `HANDOVER.md`, `RELEASE_CHECKLIST.md`, and `CLIENT_APPROVAL_CHECKLIST.md` for the operational
runbook and current blockers. The original static demo remains recoverable on `legacy/static-demo`
and in `legacy-demo/`.
