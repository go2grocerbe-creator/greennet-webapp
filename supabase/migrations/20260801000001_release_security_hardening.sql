-- Release security hardening for the client-handover build.
--
-- 1. Quotation inserts now use the server-only service-role client after
--    Zod, rate-limit, honeypot, and Turnstile checks. Anonymous callers no
--    longer have a direct PostgREST insert path that bypasses those checks.
-- 2. Project media attached to published records must have confirmed rights.
-- 3. Editors can change only quotation status fields.
-- 4. Content and status changes write append-only audit records by trigger.

-- Quotation writes must pass through POST /api/quote-requests.
drop policy if exists "quote_requests_public_insert" on public.quote_requests;

-- Shared, atomic quotation rate limits. RLS is enabled with no client policy;
-- only the server-held service role can execute the narrowly scoped RPC.
create table if not exists public.quote_request_rate_limits (
  identifier_hash text primary key,
  window_started_at timestamptz not null,
  request_count integer not null check (request_count >= 0),
  updated_at timestamptz not null default now()
);

alter table public.quote_request_rate_limits enable row level security;
revoke all on table public.quote_request_rate_limits from anon, authenticated;
grant select, insert, update, delete on table public.quote_request_rate_limits to service_role;

create index if not exists quote_request_rate_limits_updated_at_idx
  on public.quote_request_rate_limits (updated_at);

create or replace function public.check_quote_request_rate_limit(
  p_identifier_hash text,
  p_limit integer,
  p_window_seconds integer
)
returns table (allowed boolean, retry_after_seconds integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  current_time timestamptz := clock_timestamp();
  current_window_started_at timestamptz;
  current_request_count integer;
begin
  if p_identifier_hash is null or length(p_identifier_hash) < 8 then
    raise exception 'Invalid rate-limit identifier';
  end if;
  if p_limit < 1 or p_limit > 100 or p_window_seconds < 1 or p_window_seconds > 86400 then
    raise exception 'Invalid rate-limit configuration';
  end if;

  delete from public.quote_request_rate_limits
  where updated_at < current_time - interval '1 day';

  insert into public.quote_request_rate_limits (
    identifier_hash,
    window_started_at,
    request_count,
    updated_at
  ) values (
    p_identifier_hash,
    current_time,
    1,
    current_time
  )
  on conflict (identifier_hash) do update set
    window_started_at = case
      when quote_request_rate_limits.window_started_at
        <= current_time - make_interval(secs => p_window_seconds)
        then current_time
      else quote_request_rate_limits.window_started_at
    end,
    request_count = case
      when quote_request_rate_limits.window_started_at
        <= current_time - make_interval(secs => p_window_seconds)
        then 1
      else quote_request_rate_limits.request_count + 1
    end,
    updated_at = current_time
  returning quote_request_rate_limits.window_started_at, quote_request_rate_limits.request_count
  into current_window_started_at, current_request_count;

  return query select
    current_request_count <= p_limit,
    case
      when current_request_count <= p_limit then null
      else greatest(
        0,
        ceil(extract(epoch from (
          current_window_started_at
          + make_interval(secs => p_window_seconds)
          - current_time
        )))::integer
      )
    end;
end;
$$;

revoke all on function public.check_quote_request_rate_limit(text, integer, integer) from public;
grant execute on function public.check_quote_request_rate_limit(text, integer, integer)
  to service_role;

-- Site settings: editors may update existing approved keys; only owners may
-- insert or delete rows.
drop policy if exists "site_settings_editor_owner_all" on public.site_settings;

create policy "site_settings_editor_owner_update" on public.site_settings
  for update using (public.is_editor_or_owner())
  with check (public.is_editor_or_owner());

create policy "site_settings_owner_all" on public.site_settings
  for all using (public.is_owner())
  with check (public.is_owner());

-- Audit rows are written by trusted triggers, not directly by an editor.
drop policy if exists "audit_log_editor_owner_insert" on public.audit_log;

create or replace function public.enforce_quote_request_update_scope()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.is_owner() then
    return new;
  end if;

  if (to_jsonb(new) - 'status') is distinct from (to_jsonb(old) - 'status') then
    raise exception 'Editors may update quotation status only';
  end if;

  return new;
end;
$$;

revoke all on function public.enforce_quote_request_update_scope() from public;

drop trigger if exists enforce_quote_request_update_scope on public.quote_requests;
create trigger enforce_quote_request_update_scope
  before update on public.quote_requests
  for each row execute function public.enforce_quote_request_update_scope();

create or replace function public.enforce_project_publication_rights()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status = 'published' then
    if new.cover_image_url is not null then
      raise exception 'Direct cover image URLs cannot be published; use rights-confirmed media';
    end if;

    if exists (
      select 1
      from public.project_media pm
      join public.media m on m.id = pm.media_id
      where pm.project_id = new.id
        and m.rights_confirmed is not true
    ) then
      raise exception 'Every published project media item must have confirmed rights';
    end if;
  end if;

  return new;
end;
$$;

revoke all on function public.enforce_project_publication_rights() from public;

drop trigger if exists enforce_project_publication_rights on public.projects;
create trigger enforce_project_publication_rights
  before insert or update of status, cover_image_url on public.projects
  for each row execute function public.enforce_project_publication_rights();

create or replace function public.enforce_project_media_attachment_rights()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if exists (
    select 1
    from public.projects p
    join public.media m on m.id = new.media_id
    where p.id = new.project_id
      and p.status = 'published'
      and m.rights_confirmed is not true
  ) then
    raise exception 'Unverified media cannot be attached to a published project';
  end if;

  return new;
end;
$$;

revoke all on function public.enforce_project_media_attachment_rights() from public;

drop trigger if exists enforce_project_media_attachment_rights on public.project_media;
create trigger enforce_project_media_attachment_rights
  before insert or update on public.project_media
  for each row execute function public.enforce_project_media_attachment_rights();

-- Direct image URLs pre-date the auditable media model. Keep them on draft
-- records for migration/review, but do not permit them on published products.
create or replace function public.enforce_product_publication_rights()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status = 'published' then
    if new.image_url is not null then
      raise exception 'Direct product image URLs cannot be published; use rights-confirmed media';
    end if;

    if new.spec_sheet_media_id is not null and not exists (
      select 1
      from public.media m
      where m.id = new.spec_sheet_media_id
        and m.rights_confirmed is true
    ) then
      raise exception 'Published product media must have confirmed rights';
    end if;
  end if;
  return new;
end;
$$;

revoke all on function public.enforce_product_publication_rights() from public;

drop trigger if exists enforce_product_publication_rights on public.products;
create trigger enforce_product_publication_rights
  before insert or update of status, image_url, spec_sheet_media_id on public.products
  for each row execute function public.enforce_product_publication_rights();

-- Rights cannot be revoked while the media remains attached to published
-- content. Unpublish or detach the record first so the public gate cannot be
-- invalidated after publication.
create or replace function public.enforce_media_rights_revocation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if old.rights_confirmed is true and new.rights_confirmed is not true and (
    exists (
      select 1
      from public.project_media pm
      join public.projects p on p.id = pm.project_id
      where pm.media_id = new.id
        and p.status = 'published'
    )
    or exists (
      select 1
      from public.products p
      where p.spec_sheet_media_id = new.id
        and p.status = 'published'
    )
  ) then
    raise exception 'Rights cannot be revoked while media is attached to published content';
  end if;

  return new;
end;
$$;

revoke all on function public.enforce_media_rights_revocation() from public;

drop trigger if exists enforce_media_rights_revocation on public.media;
create trigger enforce_media_rights_revocation
  before update of rights_confirmed on public.media
  for each row execute function public.enforce_media_rights_revocation();

create or replace function public.capture_admin_audit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  record_id uuid;
  change jsonb;
  action_name text;
begin
  if tg_table_name = 'site_settings' then
    record_id := null;
    action_name := lower(tg_op);
    change := jsonb_build_object(
      'key', case when tg_op = 'DELETE' then old.key else new.key end,
      'before', case when tg_op in ('UPDATE', 'DELETE') then to_jsonb(old.value) else null end,
      'after', case when tg_op in ('INSERT', 'UPDATE') then to_jsonb(new.value) else null end
    );
  elsif tg_table_name = 'quote_requests' then
    record_id := new.id;
    action_name := 'status_update';
    change := jsonb_build_object('status', jsonb_build_object('from', old.status, 'to', new.status));
  elsif tg_table_name = 'project_media' then
    record_id := case when tg_op = 'DELETE' then old.project_id else new.project_id end;
    action_name := lower(tg_op);
    change := jsonb_build_object(
      'before', case when tg_op in ('UPDATE', 'DELETE') then to_jsonb(old) else null end,
      'after', case when tg_op in ('INSERT', 'UPDATE') then to_jsonb(new) else null end
    );
  else
    record_id := case when tg_op = 'DELETE' then old.id else new.id end;
    action_name := lower(tg_op);
    change := jsonb_build_object(
      'before', case when tg_op in ('UPDATE', 'DELETE') then to_jsonb(old) else null end,
      'after', case when tg_op in ('INSERT', 'UPDATE') then to_jsonb(new) else null end
    );
  end if;

  insert into public.audit_log (actor_id, action, entity_type, entity_id, diff)
  values (auth.uid(), action_name, tg_table_name, record_id, change);

  return null;
end;
$$;

revoke all on function public.capture_admin_audit() from public;

drop trigger if exists audit_services_mutation on public.services;
create trigger audit_services_mutation
  after insert or update or delete on public.services
  for each row execute function public.capture_admin_audit();

drop trigger if exists audit_products_mutation on public.products;
create trigger audit_products_mutation
  after insert or update or delete on public.products
  for each row execute function public.capture_admin_audit();

drop trigger if exists audit_projects_mutation on public.projects;
create trigger audit_projects_mutation
  after insert or update or delete on public.projects
  for each row execute function public.capture_admin_audit();

drop trigger if exists audit_media_mutation on public.media;
create trigger audit_media_mutation
  after insert or update or delete on public.media
  for each row execute function public.capture_admin_audit();

drop trigger if exists audit_project_media_mutation on public.project_media;
create trigger audit_project_media_mutation
  after insert or update or delete on public.project_media
  for each row execute function public.capture_admin_audit();

drop trigger if exists audit_site_settings_mutation on public.site_settings;
create trigger audit_site_settings_mutation
  after insert or update or delete on public.site_settings
  for each row execute function public.capture_admin_audit();

drop trigger if exists audit_quote_status_update on public.quote_requests;
create trigger audit_quote_status_update
  after update of status on public.quote_requests
  for each row
  when (old.status is distinct from new.status)
  execute function public.capture_admin_audit();

drop trigger if exists set_updated_at on public.site_settings;
create trigger set_updated_at before update on public.site_settings
  for each row execute function public.set_updated_at();
