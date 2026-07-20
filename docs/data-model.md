# Data Model

Status: DRAFT — planning only, no migrations written yet
Last updated: 2026-07-17

All tables live in Supabase Postgres. Every table below carries RLS policies defined in `docs/security-model.md` — do not treat this document as sufficient on its own for access-control decisions.

## Entity summary

| Entity           | Purpose                                                    |
| ---------------- | ---------------------------------------------------------- |
| `profiles`       | Extends `auth.users` with role and display info            |
| `services`       | Solar Solutions page content                               |
| `products`       | Products page content                                      |
| `projects`       | Projects page content, including `featured` flag           |
| `quote_requests` | Leads submitted via the Contact / Request a Quotation form |
| `media`          | Metadata for Supabase Storage uploads (photos, documents)  |
| `site_settings`  | Singleton-style key/value store for global site config     |
| `audit_log`      | Append-only record of administrative actions               |

## `profiles`

Extends Supabase's built-in `auth.users`; one row per authenticated admin/editor user (public site visitors do not get a profile row — there are no customer accounts, per explicit out-of-scope).

| Column       | Type                    | Notes                                    |
| ------------ | ----------------------- | ---------------------------------------- |
| `id`         | uuid, PK                | References `auth.users.id`               |
| `full_name`  | text                    |                                          |
| `role`       | enum(`owner`, `editor`) | Confirmed two-role model, no other tiers |
| `created_at` | timestamptz             |                                          |

## `services`

| Column                     | Type                       | Notes                                                          |
| -------------------------- | -------------------------- | -------------------------------------------------------------- |
| `id`                       | uuid, PK                   |                                                                |
| `slug`                     | text, unique               |                                                                |
| `title`                    | text                       |                                                                |
| `summary`                  | text                       |                                                                |
| `body`                     | text/jsonb                 | Rich content                                                   |
| `icon`                     | text                       | Icon identifier, replaces duplicated inline SVGs from the demo |
| `sort_order`               | int                        |                                                                |
| `status`                   | enum(`draft`, `published`) | Confirmed requirement                                          |
| `created_by`, `updated_by` | uuid, FK → `profiles.id`   |                                                                |
| `created_at`, `updated_at` | timestamptz                |                                                                |

## `products`

| Column                                                 | Type                            | Notes                                                                                                       |
| ------------------------------------------------------ | ------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `id`                                                   | uuid, PK                        |                                                                                                             |
| `slug`                                                 | text, unique                    |                                                                                                             |
| `name`                                                 | text                            |                                                                                                             |
| `brand`                                                | text                            | MISSING confirmed brand list — schema supports it, content is pending (see requirements register §5)        |
| `category`                                             | text or enum                    | e.g. panels / inverters / batteries / accessories — matches demo services list, pending client confirmation |
| `description`                                          | text/jsonb                      |                                                                                                             |
| `spec_sheet_media_id`                                  | uuid, FK → `media.id`, nullable | Optional downloadable spec sheet                                                                            |
| `status`                                               | enum(`draft`, `published`)      |                                                                                                             |
| `created_by`, `updated_by`, `created_at`, `updated_at` | as above                        |                                                                                                             |
| `summary`                                              | text, nullable                  | "Short description" — added in migration `20260722000001` (docs/decision-log.md ADR-013)                    |
| `sort_order`                                           | integer, default 0              | "Display order" — added in migration `20260722000001`                                                       |
| `image_url`                                            | text, nullable                  | Optional product image, staff-supplied URL — added in migration `20260722000001`                            |

No `price` field in Phase 1 core schema — pricing display is an unconfirmed, distinct question (see requirements register §5) and automated pricing is explicitly out of scope. If simple static price display is later confirmed, add a nullable `display_price` field rather than building pricing logic.

## `projects`

| Column                                                 | Type                                            | Notes                                                                                                                                                                         |
| ------------------------------------------------------ | ----------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `id`                                                   | uuid, PK                                        |                                                                                                                                                                               |
| `slug`                                                 | text, unique                                    |                                                                                                                                                                               |
| `title`                                                | text                                            |                                                                                                                                                                               |
| `location`                                             | text, nullable                                  | Per workbook: "projects can be described with location, project type and equipment"                                                                                           |
| `project_type`                                         | enum(`residential`, `commercial`, `industrial`) | Matches demo categorization                                                                                                                                                   |
| `equipment_summary`                                    | text, nullable                                  |                                                                                                                                                                               |
| `description`                                          | text/jsonb                                      |                                                                                                                                                                               |
| `featured`                                             | boolean, default false                          | Confirmed requirement                                                                                                                                                         |
| `status`                                               | enum(`draft`, `published`)                      | Confirmed requirement — critical here, since no real project photos exist yet (see content register); everything stays `draft` until real, rights-cleared content is supplied |
| `created_by`, `updated_by`, `created_at`, `updated_at` | as above                                        |                                                                                                                                                                               |
| `summary`                                              | text, nullable                                  | "Short description" (distinct from `equipment_summary`) — added in migration `20260722000001`                                                                                 |
| `sort_order`                                           | integer, default 0                              | "Display order" — added in migration `20260722000001`                                                                                                                         |
| `completion_date`                                      | date, nullable                                  | Added in migration `20260722000001`                                                                                                                                           |
| `cover_image_url`                                      | text, nullable                                  | Optional cover image, staff-supplied URL — added in migration `20260722000001`                                                                                                |

## `project_media` (join table)

| Column       | Type                     | Notes |
| ------------ | ------------------------ | ----- |
| `project_id` | uuid, FK → `projects.id` |       |
| `media_id`   | uuid, FK → `media.id`    |       |
| `sort_order` | int                      |       |

Separate join table rather than an array column, so each image's provenance/rights metadata (in `media`) stays independently auditable — directly addressing the stock/AI-image misrepresentation risk flagged in `docs/content-register.md`.

## `media`

| Column             | Type                                                     | Notes                                                                                                         |
| ------------------ | -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `id`               | uuid, PK                                                 |                                                                                                               |
| `storage_path`     | text                                                     | Path within Supabase Storage bucket                                                                           |
| `alt_text`         | text                                                     | Accessibility — carries forward the demo's existing a11y discipline                                           |
| `source_type`      | enum(`client_supplied`, `stock_licensed`, `placeholder`) | Explicit provenance tracking, directly enforcing "never represent stock/AI imagery as real GreenNet projects" |
| `rights_confirmed` | boolean, default false                                   | Must be true before a `media` row can be attached to a `published` project                                    |
| `uploaded_by`      | uuid, FK → `profiles.id`                                 |                                                                                                               |
| `created_at`       | timestamptz                                              |                                                                                                               |

## `quote_requests`

| Column                     | Type                                                                     | Notes                                                                                                                                                         |
| -------------------------- | ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `id`                       | uuid, PK                                                                 | Also serves as the quotation reference (first 8 chars, uppercased, shown to the user and in emails)                                                           |
| `name`                     | text, not null                                                           | "Full name"                                                                                                                                                   |
| `email`                    | text, not null                                                           | Always required — the one channel guaranteed reachable regardless of `preferred_contact_method`                                                               |
| `phone`                    | text, nullable                                                           | Optional at the schema/validation layer — not everyone prefers phone contact                                                                                  |
| `company_name`             | text, nullable                                                           | Added in migration `20260721000001`                                                                                                                           |
| `location`                 | text, nullable                                                           |                                                                                                                                                               |
| `property_type`            | enum(`residential`, `commercial`, `industrial`)                          | Reuses `public.project_type` — added in migration `20260721000001`                                                                                            |
| `service_interest`         | text, nullable                                                           | Holds "interested solution" — a small set of neutral, non-branded category values, not the unapproved draft `services` names. See `docs/content-register.md`. |
| `electricity_usage`        | text, nullable                                                           | Free text (unit/currency unconfirmed — see requirements register §5). Added in migration `20260721000001`                                                     |
| `preferred_contact_method` | enum(`phone`, `email`, `whatsapp`)                                       | Added in migration `20260721000001`                                                                                                                           |
| `project_timeline`         | enum(`immediately`, `within_3_months`, `within_6_months`, `researching`) | Added in migration `20260721000001`                                                                                                                           |
| `message`                  | text, not null                                                           |                                                                                                                                                               |
| `privacy_consent`          | boolean, not null, `check (privacy_consent = true)`                      | Must be explicitly true to insert at all — added in migration `20260721000001`                                                                                |
| `status`                   | enum(`new`, `contacted`, `closed`)                                       | Lead-handling workflow state                                                                                                                                  |
| `turnstile_verified`       | boolean                                                                  | Recorded outcome of spam-protection check                                                                                                                     |
| `created_at`               | timestamptz                                                              |                                                                                                                                                               |

**Exact field list is still an ASSUMPTION** pending the MISSING answer to "what information is required before GreenNet can prepare a useful quotation" (requirements register §5) — this is the working backbone implemented in the Contact/Quotation milestone (see `docs/decision-log.md` ADR-010), not a client-confirmed final list. No honeypot value is persisted — it's checked and discarded before any database write, see `docs/security-model.md`.

## `site_settings`

| Column       | Type                     | Notes                                                            |
| ------------ | ------------------------ | ---------------------------------------------------------------- |
| `key`        | text, PK                 | e.g. `contact_phone`, `contact_email`, `address`, `social_links` |
| `value`      | jsonb                    |                                                                  |
| `updated_by` | uuid, FK → `profiles.id` |                                                                  |
| `updated_at` | timestamptz              |                                                                  |

Replaces the demo's hardcoded-in-4-places contact info with a single editable source of truth — directly resolves the duplication problem flagged in `docs/current-demo-audit.md`.

## `audit_log`

| Column                     | Type                     | Notes                                                       |
| -------------------------- | ------------------------ | ----------------------------------------------------------- |
| `id`                       | uuid, PK                 |                                                             |
| `actor_id`                 | uuid, FK → `profiles.id` |                                                             |
| `action`                   | text                     | e.g. `service.publish`, `project.delete`, `settings.update` |
| `entity_type`, `entity_id` | text, uuid               |                                                             |
| `diff`                     | jsonb, nullable          | Before/after snapshot where practical                       |
| `created_at`               | timestamptz              |                                                             |

Append-only — no update/delete policy grants exist for this table (see `docs/security-model.md`).

## Open schema questions (do not resolve without client input)

- Whether `products` needs a `brand` reference table (normalized) versus a free-text field — depends on confirmed brand count/complexity, currently unknown.
- Whether `quote_requests` needs a `preferred_appointment_date` field — depends on the MISSING answer about site-assessment booking.
- Whether multiple notification-email recipients need their own settings row or a fixed env-configured list — depends on the MISSING answer about email copying.
