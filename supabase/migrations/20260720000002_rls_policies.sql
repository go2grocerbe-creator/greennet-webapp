-- Row Level Security policies for GreenNet Energy production site.
-- Boundaries per docs/security-model.md. RLS is the independent
-- enforcement layer — application-level checks are the first line of
-- defense, not a substitute for this file.

alter table public.profiles enable row level security;
alter table public.services enable row level security;
alter table public.products enable row level security;
alter table public.projects enable row level security;
alter table public.project_media enable row level security;
alter table public.media enable row level security;
alter table public.quote_requests enable row level security;
alter table public.site_settings enable row level security;
alter table public.audit_log enable row level security;

-- ── Role helpers ──────────────────────────────────────────────────────
-- security definer so the helper itself can read public.profiles even
-- though profiles has no public select policy.

create function public.current_role()
returns public.user_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

create function public.is_editor_or_owner()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.profiles where id = auth.uid());
$$;

create function public.is_owner()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'owner');
$$;

-- ── profiles ───────────────────────────────────────────────────────────
-- No public access. Editors read their own row only. Owners have full CRUD.

create policy "profiles_select_own" on public.profiles
  for select using (id = auth.uid());

create policy "profiles_owner_all" on public.profiles
  for all using (public.is_owner()) with check (public.is_owner());

-- Open item, not resolved here: the very first owner profile has no
-- existing owner to grant it, so RLS alone cannot bootstrap it. Create
-- the first owner via the Supabase dashboard or service-role key outside
-- RLS, then all subsequent profile management goes through this policy.

-- ── services / products / projects ───────────────────────────────────
-- Public read: published only. Editor/owner: full CRUD.

create policy "services_public_read_published" on public.services
  for select using (status = 'published');

create policy "services_editor_owner_all" on public.services
  for all using (public.is_editor_or_owner()) with check (public.is_editor_or_owner());

create policy "products_public_read_published" on public.products
  for select using (status = 'published');

create policy "products_editor_owner_all" on public.products
  for all using (public.is_editor_or_owner()) with check (public.is_editor_or_owner());

create policy "projects_public_read_published" on public.projects
  for select using (status = 'published');

create policy "projects_editor_owner_all" on public.projects
  for all using (public.is_editor_or_owner()) with check (public.is_editor_or_owner());

-- ── project_media ─────────────────────────────────────────────────────
-- Public read only via a join to a published project. Editor/owner full CRUD.

create policy "project_media_public_read_via_published_project" on public.project_media
  for select using (
    exists (
      select 1 from public.projects
      where projects.id = project_media.project_id
        and projects.status = 'published'
    )
  );

create policy "project_media_editor_owner_all" on public.project_media
  for all using (public.is_editor_or_owner()) with check (public.is_editor_or_owner());

-- ── media ──────────────────────────────────────────────────────────────
-- No direct public access — only reachable via published project/product
-- joins at the application query layer. Editor/owner full CRUD; the
-- rights_confirmed gate before attachment to published content is
-- enforced at the application layer (see docs/security-model.md).

create policy "media_editor_owner_all" on public.media
  for all using (public.is_editor_or_owner()) with check (public.is_editor_or_owner());

-- ── quote_requests ────────────────────────────────────────────────────
-- Public: INSERT only, no SELECT (the public quotation form). Insert
-- happens through a server action/route handler that re-validates and
-- verifies Turnstile server-side before this INSERT runs — see
-- docs/security-model.md "Quotation form submission path". Editor: read
-- + update status. Owner: full CRUD.

create policy "quote_requests_public_insert" on public.quote_requests
  for insert with check (true);

create policy "quote_requests_editor_read" on public.quote_requests
  for select using (public.is_editor_or_owner());

create policy "quote_requests_editor_update_status" on public.quote_requests
  for update using (public.is_editor_or_owner()) with check (public.is_editor_or_owner());

create policy "quote_requests_owner_delete" on public.quote_requests
  for delete using (public.is_owner());

-- ── site_settings ─────────────────────────────────────────────────────
-- Public read limited to an explicit allow-list of public-safe keys
-- (contact info surfaced on the public site). Editor/owner full CRUD.

create policy "site_settings_public_read_allowlist" on public.site_settings
  for select using (
    key = any (array['contact_phone', 'contact_email', 'address', 'social_links'])
  );

create policy "site_settings_editor_owner_all" on public.site_settings
  for all using (public.is_editor_or_owner()) with check (public.is_editor_or_owner());

-- ── audit_log ─────────────────────────────────────────────────────────
-- Append-only: no update/delete policy exists for any role, including
-- owner. Editors insert (system-triggered) and read their own actions.
-- Owners read everything.

create policy "audit_log_editor_owner_insert" on public.audit_log
  for insert with check (public.is_editor_or_owner());

create policy "audit_log_editor_read_own" on public.audit_log
  for select using (actor_id = auth.uid());

create policy "audit_log_owner_read_all" on public.audit_log
  for select using (public.is_owner());
