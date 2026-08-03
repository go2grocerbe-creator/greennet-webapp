# GreenNet Energy handover

Date: 2026-08-01
Release state: client-review ready; production cutover blocked by external configuration and client approvals

## Delivered website

The release includes the complete Phase 1 public route set: Home, About, Solar Solutions, Products,
Projects, and Contact/Quotation. It also includes restricted owner/editor administration for
quotations and service/product/project publication.

The public experience remains coherent without CMS connectivity: verified editorial content stays
available and optional catalogues remain hidden instead of exposing backend errors. No draft CMS
record renders publicly. No product price, testimonial, certification, warranty duration, service
area, performance result, or unverified project photograph has been invented.

## Route inventory

| Route                 | Access       | Purpose                                                       |
| --------------------- | ------------ | ------------------------------------------------------------- |
| `/`                   | Public       | Solar-day brand story and quotation CTA                       |
| `/about`              | Public       | Approved positioning and working principles                   |
| `/services`           | Public       | Confirmed solution architecture and published service records |
| `/products`           | Public       | Category guidance and published product records               |
| `/projects`           | Public       | Capability pathways and published project records             |
| `/contact`            | Public       | Verified direct contacts and quotation/general enquiry form   |
| `/login`              | Public       | Admin sign-in only; no registration                           |
| `/admin`              | Owner/editor | Lead overview                                                 |
| `/admin/quotations/*` | Owner/editor | Lead review and status updates                                |
| `/admin/services/*`   | Owner/editor | Service create/edit/publish                                   |
| `/admin/products/*`   | Owner/editor | Product create/edit/publish                                   |
| `/admin/projects/*`   | Owner/editor | Project create/edit/publish                                   |
| `/admin/settings`     | Owner/editor | Verified public identity review                               |
| `/api/quote-requests` | Public POST  | Validated, rate-limited, Turnstile-protected lead intake      |

## Services and ownership

- Vercel: application hosting, preview, production, and rollback.
- Supabase: Postgres, Auth, Storage policies, and RLS.
- Cloudflare Turnstile: production form challenge and server verification.
- Resend: notification and acknowledgement email provider through an adapter.
- Google Analytics: configuration point only; keep disabled pending privacy/cookie approval.
- Sentry: configuration point only; SDK/project activation remains an operational decision.

The client must confirm who owns each account, billing relationship, recovery email, and production
access. Do not place credentials in this repository or this document.

## Environment contract

Use `.env.example` as the canonical list. Production requires the site URL, Supabase URL/anon key,
Supabase service-role key, and both Turnstile keys. Real email delivery requires the Resend key,
verified from-address, and an approved notification recipient.

The service-role key is imported only by the server route used after the quotation validation
pipeline. Anonymous RLS has no quotation INSERT policy, so callers cannot bypass the website route
through Supabase REST.

## Database and admin bootstrap

1. Create separate Supabase Preview and Production projects.
2. Apply `supabase/migrations/*.sql` in filename order to the matching project.
3. Review and optionally apply `supabase/seed.sql`; all service rows remain draft.
4. Create the first administrator through Supabase Auth.
5. Create the matching `public.profiles` row as `owner` through the secure Supabase dashboard.
6. Sign in at `/login`; confirm every `/admin/*` route redirects when signed out.
7. Create any editor profiles only after the named users are approved.

The 2026-08 release migration is not applied to any live project from this repository because no
project credentials are present. It must be applied before production form testing.

## Quotation flow

The form posts to `POST /api/quote-requests`; it never writes to Supabase from browser code. The
server re-validates with Zod, checks the honeypot, applies a shared atomic IP-hash rate limit through
Supabase, verifies Turnstile, then inserts with the server-only credential. Email is best-effort
after the database insert; a provider failure does not discard a stored lead.

The current field set is a documented working assumption. The client must approve the required
fields, consent wording, recipient, acknowledgement copy, and operational follow-up owner before
go-live.

## Branding and assets

- Public palette and typography follow `.agents/skills/greennet-release/references/brand-system.md`.
- The header uses a clean text wordmark because no approved standalone SVG/PNG logo exists.
- `src/app/favicon.ico` is the existing favicon and requires final client logo approval.
- `src/app/opengraph-image.tsx` produces the text-led social sharing image without project photography.
- `Greennet Energy.jpeg` and `docs/source-materials/Greennet Energy.jpeg` are source references only.
- Flyer, stock, and generated photography is not rendered as GreenNet project evidence.

Supply an official vector logo and rights-cleared project/product media before the final brand/media
rollout. The database migration prevents direct image URLs from being published, requires confirmed
rights for media attached to published projects/products, and blocks later rights revocation while
that attachment remains public.

## Deployment runbook

1. Complete every blocking item in `CLIENT_APPROVAL_CHECKLIST.md`.
2. Configure Preview environment values in Vercel and apply migrations to Preview Supabase.
3. Run `npm ci`, `npm run check`, and `npm run test:e2e` on the release commit.
4. Test a real Preview quotation: Turnstile pass, database row, admin visibility, notification email, acknowledgement email, and status update.
5. Verify metadata, sitemap, robots, favicon, structured data, security headers, and canonical URLs on Preview.
6. Configure Production values separately and apply migrations to Production Supabase.
7. Create a Vercel production deployment without moving DNS; obtain final client approval.
8. Connect the approved domain and confirm HTTPS, redirects, sitemap origin, form delivery, analytics consent state, and monitoring.

## Backup and rollback

- Preserve the Vercel deployment immediately preceding cutover; use Vercel rollback if the app fails.
- Treat Supabase migrations as forward-only. Take a database backup before production migration and
  write a corrective migration rather than editing applied SQL.
- The original demo is recoverable from the `legacy/static-demo` branch and `legacy-demo/` directory.
- Do not delete or rewrite the legacy reference during cutover.

## Known limitations and blockers

- No live Vercel, Supabase, Turnstile, Resend, Sentry, GA, domain, or DNS configuration was available in the repository.
- Legal/privacy/cookie wording is not client-approved; GA must remain disabled.
- Official logo source and final favicon approval are missing.
- Project photography and case-study facts are missing or unverified; public photography is withheld.
- Product brands, specifications, permissions, warranties, and prices are unconfirmed.
- Service areas, certifications, partnerships, response times, maintenance SLAs, and warranty terms are unconfirmed and not claimed.
- Notification recipient and quotation field set need client approval.
- Authenticated admin flows need one real Preview verification after account provisioning.
- Sentry and GA are configuration points, not active SDK integrations in this release.

## Post-launch checks

Confirm HTTPS and canonical host, submit and receive a real enquiry, confirm admin access and RLS,
review logs without exposing personal data, verify backups, test mobile navigation, validate the
sitemap in search tooling, and schedule a 24-hour and seven-day operational review.
