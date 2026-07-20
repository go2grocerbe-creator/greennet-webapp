# Security Model

Status: DRAFT — planning only, no policies implemented yet
Last updated: 2026-07-17

## Roles

Two authenticated roles only, per confirmed scope — no customer accounts, no other tiers:

- **owner** — full read/write on all tables, including `profiles` role management and `site_settings`.
- **editor** — read/write on content tables (`services`, `products`, `projects`, `project_media`, `media`, `quote_requests` status updates), no access to `profiles` role changes or destructive account administration.

Public/anonymous visitors have no authenticated identity — there are no customer accounts (explicitly out of scope).

## Authentication

Supabase Auth. Admin dashboard routes (`app/(admin)/**`) are gated at the layout level by session presence, then by role check against `profiles.role`. Session check happens server-side (Next.js server component / middleware), never trusted from client state alone.

## Row Level Security — table-by-table boundaries

| Table            | Public (anon)                                                                             | Editor                                                 | Owner                                                  |
| ---------------- | ----------------------------------------------------------------------------------------- | ------------------------------------------------------ | ------------------------------------------------------ |
| `services`       | SELECT where `status = 'published'` only                                                  | full CRUD                                              | full CRUD                                              |
| `products`       | SELECT where `status = 'published'` only                                                  | full CRUD                                              | full CRUD                                              |
| `projects`       | SELECT where `status = 'published'` only                                                  | full CRUD                                              | full CRUD                                              |
| `project_media`  | SELECT joined only via published project                                                  | full CRUD                                              | full CRUD                                              |
| `media`          | no direct access (accessed only via published project/product joins)                      | full CRUD, INSERT requires `rights_confirmed` workflow | full CRUD                                              |
| `quote_requests` | INSERT only (via server-validated route, not direct client insert — see below), no SELECT | SELECT, UPDATE `status`                                | full CRUD                                              |
| `site_settings`  | SELECT for public-safe keys only (e.g. contact info surfaced on the public site)          | UPDATE                                                 | full CRUD                                              |
| `profiles`       | no access                                                                                 | SELECT own row only                                    | full CRUD                                              |
| `audit_log`      | no access                                                                                 | INSERT (system-triggered), SELECT own actions          | full SELECT, no UPDATE/DELETE for anyone (append-only) |

RLS policies are the enforcement backstop — application-level checks (route guards, server actions) are the first line of defense, but RLS must independently prevent unauthorized access even if application logic has a bug. Neither layer is relied on alone.

## Quotation form submission path (public-facing, highest-risk surface)

Implemented (`/contact`, `POST /api/quote-requests`, `src/lib/quote-requests/submit.ts` — see `docs/decision-log.md` ADR-010):

1. Client-side: React Hook Form + `zodResolver(quoteRequestSchema)` validate shape/required fields (usability only); the Turnstile widget (when configured) collects a challenge token; an accessibly-hidden honeypot field is included in the payload.
2. Submission goes to **`POST /api/quote-requests`**, a route handler — never a direct client-side Supabase insert. The handler parses only the expected fields (`quoteSubmissionSchema.safeParse`, unknown keys stripped, not trusted) and independently re-validates with the same Zod schema server-side.
3. Honeypot check runs first (cheapest, no external calls): a non-empty honeypot value short-circuits to a spam result before any rate-limit/Turnstile/database work happens.
4. Rate limiting (`src/lib/rate-limit/`) runs next, keyed on a **hashed** IP (SHA-256, truncated — the raw IP is never logged or stored). Single-instance in-memory implementation for now; not distributed-safe — see `docs/architecture.md` "Rate limiting".
5. Turnstile verification (`src/lib/turnstile/verify.ts`) runs server-side against Cloudflare's siteverify endpoint. If `TURNSTILE_SECRET_KEY` is unset, an explicit, logged dev/test bypass returns success — this can never happen once the secret is actually configured, so it cannot silently mask a misconfigured production deployment.
6. Only after all of the above pass does the handler insert into `quote_requests`. This uses the **anon-key Supabase client** (`src/lib/supabase/anon-server-client.ts`), not the service-role key — the existing `quote_requests_public_insert` RLS policy (`with check (true)`) already permits exactly this anonymous insert, so no broader-privileged key is needed for this operation.
7. Notification (to `QUOTE_NOTIFICATION_EMAIL`, falling back to the confirmed GreenNet contact email) and acknowledgement (to the submitter) emails are sent server-side via the abstracted email provider (`src/lib/email/`) after a successful insert, using `Promise.allSettled` — **the database insert is the authoritative business event; email failure is logged but never rolls back or fails the response**, so a successfully stored lead is never lost to a flaky email provider.
8. All error responses returned to the browser are generic and typed (`validation` / `rate_limited` / `verification_failed` / `server_error`); no raw database or provider error text, and no stack trace, ever reaches the client.

## Media upload restrictions

- Uploads only permitted through authenticated editor/owner sessions — no anonymous upload path.
- Supabase Storage bucket policies mirror the `media` table RLS: authenticated write, restricted read (public bucket only for assets attached to `published` content; unpublished/draft media stays in a non-public bucket or path).
- File-type and size validation enforced server-side before accepting an upload, not just via client `accept` attributes.
- `media.rights_confirmed` must be explicitly set before an asset can be attached to a `published` project or product — this is the schema-level enforcement of "never represent stock/AI imagery as real GreenNet projects."

## Secrets and environment variables

- `SUPABASE_SERVICE_ROLE_KEY` is server-only, never bundled into client code, never committed to the repository.
- All provider keys (Resend, Turnstile secret, Sentry DSN if treated as sensitive, GA measurement ID is not sensitive) live in Vercel project environment variables, separated by preview/production environment.
- No `.env` file is created in this phase — see `docs/architecture.md`; secrets don't exist until the corresponding accounts are provisioned.

## Audit logging

Append-only `audit_log` table, populated via database triggers or server-side write-through on every content mutation (create/update/delete/publish/unpublish) and authentication-relevant event (role change). No delete or update grant exists on this table for any role, including owner, at the RLS level — corrections are new log entries, not edits to history.

## Threats explicitly considered

- **Spam/abuse of the public quotation form** — mitigated by Turnstile + server-side rate limiting + server-side re-validation.
- **Privilege escalation via client-trusted role checks** — mitigated by RLS as an independent enforcement layer, not just UI/route guards.
- **Leaking draft content publicly** — mitigated by unconditional `status = 'published'` filtering in the public data-access layer, not per-query discipline.
- **Misrepresenting stock/AI images as real projects** — mitigated by `media.source_type` + `rights_confirmed` schema fields gating what can attach to published content.
- **Secret leakage** — mitigated by service-role key never touching client bundles, environment separation between preview/production.
- **Unaudited administrative actions** — mitigated by append-only `audit_log`.

## Explicitly not addressed in Phase 1 (per confirmed out-of-scope)

Customer account security, payment/PCI concerns, CRM data-sharing agreements, multi-tenant isolation — none apply, as none of those subsystems exist in this scope.
