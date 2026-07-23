-- Extends quote_requests with the confirmed Contact/Quotation form backbone.
-- Field list is still ASSUMPTION-grade pending the client answer to
-- "information required to prepare a useful quotation" — see
-- docs/requirements-register.md §5 and docs/data-model.md.
--
-- `service_interest` (from the initial schema) is reused for "interested
-- solution" rather than adding a new column — see docs/content-register.md
-- for why its values are neutral placeholders, not the unapproved draft
-- service names.

create type public.contact_method as enum ('phone', 'email', 'whatsapp');
create type public.project_timeline as enum (
  'immediately',
  'within_3_months',
  'within_6_months',
  'researching'
);

alter table public.quote_requests
  add column company_name text,
  -- Reuses public.project_type (residential/commercial/industrial) — same
  -- three values describe a property just as well as a project.
  add column property_type public.project_type,
  add column electricity_usage text,
  add column preferred_contact_method public.contact_method,
  add column project_timeline public.project_timeline,
  add column privacy_consent boolean not null default false;

-- Consent is mandatory to submit at all — enforced here as a second,
-- independent layer beneath the application-level Zod check (see
-- src/lib/validation/quote-request.ts), matching this project's "neither
-- layer relied on alone" principle.
alter table public.quote_requests
  add constraint quote_requests_privacy_consent_required check (privacy_consent = true);
