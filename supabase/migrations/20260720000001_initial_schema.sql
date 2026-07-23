-- Initial schema for GreenNet Energy production site.
-- Entities and column decisions per docs/data-model.md. Not applied to any
-- live project yet — see docs/migration-strategy.md.

create extension if not exists pgcrypto;

-- ── Enums ──────────────────────────────────────────────────────────────

create type public.user_role as enum ('owner', 'editor');
create type public.content_status as enum ('draft', 'published');
create type public.project_type as enum ('residential', 'commercial', 'industrial');
create type public.media_source_type as enum ('client_supplied', 'stock_licensed', 'placeholder');
create type public.quote_request_status as enum ('new', 'contacted', 'closed');

-- ── profiles ───────────────────────────────────────────────────────────
-- Extends auth.users. One row per authenticated admin/editor user only —
-- there are no customer accounts (explicitly out of scope).

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  role public.user_role not null default 'editor',
  created_at timestamptz not null default now()
);

-- ── services ───────────────────────────────────────────────────────────

create table public.services (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  summary text,
  body jsonb,
  icon text,
  sort_order integer not null default 0,
  status public.content_status not null default 'draft',
  created_by uuid references public.profiles (id),
  updated_by uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ── products ───────────────────────────────────────────────────────────

create table public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  brand text,
  category text,
  description jsonb,
  spec_sheet_media_id uuid,
  status public.content_status not null default 'draft',
  created_by uuid references public.profiles (id),
  updated_by uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ── projects ───────────────────────────────────────────────────────────

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  location text,
  project_type public.project_type,
  equipment_summary text,
  description jsonb,
  featured boolean not null default false,
  status public.content_status not null default 'draft',
  created_by uuid references public.profiles (id),
  updated_by uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ── media ──────────────────────────────────────────────────────────────
-- source_type + rights_confirmed directly enforce "never represent
-- stock/AI imagery as real GreenNet projects" — see ADR-005.

create table public.media (
  id uuid primary key default gen_random_uuid(),
  storage_path text not null,
  alt_text text,
  source_type public.media_source_type not null,
  rights_confirmed boolean not null default false,
  uploaded_by uuid references public.profiles (id),
  created_at timestamptz not null default now()
);

alter table public.products
  add constraint products_spec_sheet_media_id_fkey
  foreign key (spec_sheet_media_id) references public.media (id) on delete set null;

-- ── project_media (join table) ────────────────────────────────────────

create table public.project_media (
  project_id uuid not null references public.projects (id) on delete cascade,
  media_id uuid not null references public.media (id) on delete cascade,
  sort_order integer not null default 0,
  primary key (project_id, media_id)
);

-- ── quote_requests ─────────────────────────────────────────────────────
-- Field list is an ASSUMPTION pending client confirmation — see
-- docs/data-model.md and docs/requirements-register.md §5.

create table public.quote_requests (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  service_interest text,
  location text,
  message text not null,
  status public.quote_request_status not null default 'new',
  turnstile_verified boolean not null default false,
  created_at timestamptz not null default now()
);

-- ── site_settings ──────────────────────────────────────────────────────

create table public.site_settings (
  key text primary key,
  value jsonb not null,
  updated_by uuid references public.profiles (id),
  updated_at timestamptz not null default now()
);

-- ── audit_log ──────────────────────────────────────────────────────────
-- Append-only — no update/delete grants for any role (see migration
-- 20260720000002_rls_policies.sql).

create table public.audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles (id),
  action text not null,
  entity_type text,
  entity_id uuid,
  diff jsonb,
  created_at timestamptz not null default now()
);

-- ── updated_at maintenance ────────────────────────────────────────────

create function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_updated_at before update on public.services
  for each row execute function public.set_updated_at();

create trigger set_updated_at before update on public.products
  for each row execute function public.set_updated_at();

create trigger set_updated_at before update on public.projects
  for each row execute function public.set_updated_at();

-- ── indexes ────────────────────────────────────────────────────────────

create index services_status_idx on public.services (status);
create index products_status_idx on public.products (status);
create index projects_status_idx on public.projects (status, featured);
create index quote_requests_status_idx on public.quote_requests (status);
create index audit_log_entity_idx on public.audit_log (entity_type, entity_id);
