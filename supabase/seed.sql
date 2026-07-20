-- Seed data for local/dev Supabase only. Not applied to any live project.
--
-- Only two tiers of content go in here, per docs/migration-strategy.md
-- "Content migration approach":
--   Tier 1 (CONFIRMED facts, docs/content-register.md)  -> site_settings, published
--   Tier 2 (ASSUMPTION-grade draft copy)                -> services, status = 'draft'
-- Tier 3 (all demo/flyer photography) is excluded entirely — no media,
-- products, or projects rows. Products/projects stay empty until real,
-- rights-cleared content and a confirmed brand list exist (see
-- docs/requirements-register.md §5, §6 BLOCKED work items).

insert into public.site_settings (key, value) values
  ('contact_phone', '"+234 906 312 1247"'),
  ('contact_email', '"oduwaogbeiwi@gmail.com"'),
  ('address', '"No. 12 Imuentinyan Street, Off Arbico Street, Upper Sokponoba, Benin City, Nigeria"'),
  ('social_links', '[]')
on conflict (key) do nothing;

-- Tier 2: draft only, never auto-published. Matches the 6-item list in
-- docs/content-register.md "Services" — classification ASSUMPTION, not a
-- confirmed final launch scope. created_by/updated_by left null: no real
-- profiles row exists until an actual owner/editor account is created.

insert into public.services (slug, title, sort_order, status) values
  ('solar-installation-services', 'Solar Installation Services', 1, 'draft'),
  ('solar-panels-inverters', 'Solar Panels & Inverters', 2, 'draft'),
  ('batteries-solar-accessories', 'Batteries & Solar Accessories', 3, 'draft'),
  ('residential-commercial-solar-solutions', 'Residential & Commercial Solar Solutions', 4, 'draft'),
  ('solar-system-maintenance', 'Solar System Maintenance', 5, 'draft'),
  ('solar-products-distribution', 'Solar Products Distribution', 6, 'draft')
on conflict (slug) do nothing;
