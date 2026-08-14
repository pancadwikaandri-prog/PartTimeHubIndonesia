create table if not exists public.poster_slides (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  subtitle text not null default '',
  image_url text,
  alt_text text not null,
  cta_label text,
  cta_url text,
  is_active boolean not null default true,
  sort_order integer not null default 0 check (sort_order >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint poster_cta_complete check (
    (cta_label is null and cta_url is null)
    or (cta_label is not null and cta_url is not null)
  )
);

create index if not exists poster_slides_public_idx on public.poster_slides (is_active, sort_order, created_at);

drop trigger if exists poster_slides_set_updated_at on public.poster_slides;
create trigger poster_slides_set_updated_at before update on public.poster_slides
for each row execute function public.set_updated_at();

alter table public.poster_slides enable row level security;

grant select on table public.poster_slides to anon, authenticated;
grant insert, update, delete on table public.poster_slides to authenticated;

drop policy if exists "Public can read active poster slides" on public.poster_slides;
create policy "Public can read active poster slides" on public.poster_slides
for select to anon using (is_active = true);

drop policy if exists "Authenticated admins can read all poster slides" on public.poster_slides;
create policy "Authenticated admins can read all poster slides" on public.poster_slides
for select to authenticated using (true);

drop policy if exists "Authenticated admins can create poster slides" on public.poster_slides;
create policy "Authenticated admins can create poster slides" on public.poster_slides
for insert to authenticated with check (true);

drop policy if exists "Authenticated admins can update poster slides" on public.poster_slides;
create policy "Authenticated admins can update poster slides" on public.poster_slides
for update to authenticated using (true) with check (true);

drop policy if exists "Authenticated admins can delete poster slides" on public.poster_slides;
create policy "Authenticated admins can delete poster slides" on public.poster_slides
for delete to authenticated using (true);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('poster-images', 'poster-images', true, 5000000, array['image/png', 'image/jpeg', 'image/webp'])
on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public can view poster images" on storage.objects;
create policy "Public can view poster images" on storage.objects for select to public using (bucket_id = 'poster-images');

drop policy if exists "Authenticated admins can upload poster images" on storage.objects;
create policy "Authenticated admins can upload poster images" on storage.objects for insert to authenticated with check (bucket_id = 'poster-images');

drop policy if exists "Authenticated admins can update poster images" on storage.objects;
create policy "Authenticated admins can update poster images" on storage.objects for update to authenticated using (bucket_id = 'poster-images') with check (bucket_id = 'poster-images');

drop policy if exists "Authenticated admins can delete poster images" on storage.objects;
create policy "Authenticated admins can delete poster images" on storage.objects for delete to authenticated using (bucket_id = 'poster-images');

insert into public.poster_slides (
  id, title, subtitle, image_url, alt_text, cta_label, cta_url, is_active, sort_order
) values (
  'd3b317f8-9a51-4f8c-b0e9-72bd90e40f01',
  'Peluang kerja yang mengikuti ritmemu.',
  'Temukan lowongan part-time, freelance, internship, dan pekerjaan fleksibel bersama Careerhub.indonesia.',
  null,
  'Poster Careerhub.indonesia tentang peluang kerja fleksibel',
  'Jelajahi Lowongan',
  '#lowongan',
  true,
  0
)
on conflict (id) do nothing;
