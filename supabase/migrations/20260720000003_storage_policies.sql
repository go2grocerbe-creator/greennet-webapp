-- Storage buckets + policies for GreenNet Energy media uploads.
-- Plan rationale in supabase/storage-policy-plan.md. Mirrors the
-- `media` table RLS: authenticated write, restricted public read — see
-- docs/security-model.md "Media upload restrictions".

insert into storage.buckets (id, name, public)
values
  ('media-public', 'media-public', true),
  ('media-private', 'media-private', false)
on conflict (id) do nothing;

-- media-public: assets attached to published content. Public read,
-- editor/owner write. The application only links a public.media row's
-- storage_path here once media.rights_confirmed = true and it is
-- attached to published content — enforced at the application layer,
-- not by storage RLS alone.

create policy "media_public_read" on storage.objects
  for select using (bucket_id = 'media-public');

create policy "media_public_editor_owner_write" on storage.objects
  for insert with check (bucket_id = 'media-public' and public.is_editor_or_owner());

create policy "media_public_editor_owner_update" on storage.objects
  for update using (bucket_id = 'media-public' and public.is_editor_or_owner())
  with check (bucket_id = 'media-public' and public.is_editor_or_owner());

create policy "media_public_editor_owner_delete" on storage.objects
  for delete using (bucket_id = 'media-public' and public.is_editor_or_owner());

-- media-private: draft/unpublished uploads. No public access at all —
-- editor/owner only, for both read and write.

create policy "media_private_editor_owner_all" on storage.objects
  for all using (bucket_id = 'media-private' and public.is_editor_or_owner())
  with check (bucket_id = 'media-private' and public.is_editor_or_owner());
