# Storage Policy Plan

Status: DRAFT — planning only, not applied to any live Supabase project.

Companion to `docs/security-model.md` §"Media upload restrictions" and the policies in `supabase/migrations/20260720000003_storage_policies.sql`.

## Buckets

| Bucket          | Public     | Purpose                                                                                                           |
| --------------- | ---------- | ----------------------------------------------------------------------------------------------------------------- |
| `media-public`  | Yes (read) | Assets attached to `published` services/products/projects — the only media the public site ever links to.         |
| `media-private` | No         | Everything else: media awaiting `rights_confirmed`, attached to `draft` content, or not yet attached to anything. |

Two buckets rather than one with mixed visibility, so a public bucket listing can never accidentally expose an unpublished or rights-unconfirmed asset — the bucket boundary itself is the backstop, not per-object policy discipline alone.

## Write access

Both buckets: authenticated `editor`/`owner` sessions only, via `public.is_editor_or_owner()`. No anonymous upload path exists anywhere.

## Read access

- `media-public`: public (anonymous) read allowed at the bucket level.
- `media-private`: `editor`/`owner` only.

## Promotion flow (draft → public)

1. Editor/owner uploads to `media-private`.
2. `media.source_type` and `media.rights_confirmed` are set (see `docs/data-model.md`).
3. Only once `rights_confirmed = true` and the asset is attached to `published` content does the application move/copy the object into `media-public` and update `media.storage_path` accordingly.

This promotion step is an application-layer operation (server action with the editor/owner session), not a storage RLS rule — RLS cannot inspect `media.rights_confirmed` on write to `storage.objects` in a single step reliably, so the gate is enforced where the `media` row is mutated, per `docs/security-model.md`'s "neither layer relied on alone" principle applied here as: storage RLS + application-level promotion logic, both required.

## File-type and size limits

Not yet configured (no live bucket exists). Recommended before go-live: restrict `media-public`/`media-private` to image/PDF MIME types matching real use (project photos, spec sheets) and set a per-object size cap in bucket configuration or a Postgres check via a storage webhook — implementation deferred until Supabase project exists.

## Explicitly not decided yet

- Exact folder/path convention within each bucket (e.g. `projects/{project_id}/...`) — not needed to define the policies above, decide during actual implementation.
- CDN/image-transformation configuration — a Supabase project setting, not a migration.
