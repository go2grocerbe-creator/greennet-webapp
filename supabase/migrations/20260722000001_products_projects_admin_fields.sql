-- Additive fields needed for Products/Projects admin management.
--
-- Why this migration exists: the confirmed Products/Projects admin forms
-- (docs/decision-log.md ADR-013) need a short "summary" distinct from the
-- existing rich `description`, an explicit display order, and simple
-- image references — none of which existed on these two tables. This is
-- additive only (no renames, no drops, no RLS changes — the existing
-- `products_public_read_published` / `projects_public_read_published`
-- and `*_editor_owner_all` policies already cover every new column since
-- RLS is row-level, not column-level). `services` already had everything
-- needed (see ADR-011/012) and required no migration.

alter table public.products
  add column summary text,
  add column sort_order integer not null default 0,
  add column image_url text;

alter table public.projects
  add column summary text,
  add column sort_order integer not null default 0,
  add column completion_date date,
  add column cover_image_url text;

-- No new indexes: existing `products_status_idx` / `projects_status_idx`
-- (status only) already cover the query shapes this milestone adds —
-- small expected row counts don't justify a composite index yet.
