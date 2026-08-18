-- Authorization must be independent from the ability to create an Auth account.
-- This allowlist stores immutable Supabase user IDs, not user-editable metadata.
create table if not exists public.admin_users (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

comment on table public.admin_users is 'Supabase users allowed to administer Careerhub.indonesia.';

alter table public.admin_users enable row level security;
revoke all on table public.admin_users from anon, authenticated;

-- Preserve access for the existing administrator when this migration is applied
-- to the linked project. Local administrators created later must be allowlisted
-- using the setup statement documented in supabase/README.md.
insert into public.admin_users (user_id)
select id
from auth.users
where lower(email) = lower('Pancadwikaandri@gmail.com')
on conflict (user_id) do nothing;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.admin_users
    where user_id = (select auth.uid())
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

-- Jobs: public users can still read active records; only allowlisted users can
-- read inactive records or mutate anything.
drop policy if exists "Authenticated admins can read all jobs" on public.jobs;
drop policy if exists "Allowlisted admins can read all jobs" on public.jobs;
create policy "Allowlisted admins can read all jobs" on public.jobs
for select to authenticated using ((select public.is_admin()));

drop policy if exists "Authenticated admins can create jobs" on public.jobs;
drop policy if exists "Allowlisted admins can create jobs" on public.jobs;
create policy "Allowlisted admins can create jobs" on public.jobs
for insert to authenticated with check ((select public.is_admin()));

drop policy if exists "Authenticated admins can update jobs" on public.jobs;
drop policy if exists "Allowlisted admins can update jobs" on public.jobs;
create policy "Allowlisted admins can update jobs" on public.jobs
for update to authenticated
using ((select public.is_admin()))
with check ((select public.is_admin()));

drop policy if exists "Authenticated admins can delete jobs" on public.jobs;
drop policy if exists "Allowlisted admins can delete jobs" on public.jobs;
create policy "Allowlisted admins can delete jobs" on public.jobs
for delete to authenticated using ((select public.is_admin()));

-- Site settings remain publicly readable, but only allowlisted users can write.
drop policy if exists "Authenticated admins can create site settings" on public.site_settings;
drop policy if exists "Allowlisted admins can create site settings" on public.site_settings;
create policy "Allowlisted admins can create site settings" on public.site_settings
for insert to authenticated
with check ((select public.is_admin()) and id = 'main');

drop policy if exists "Authenticated admins can update site settings" on public.site_settings;
drop policy if exists "Allowlisted admins can update site settings" on public.site_settings;
create policy "Allowlisted admins can update site settings" on public.site_settings
for update to authenticated
using ((select public.is_admin()) and id = 'main')
with check ((select public.is_admin()) and id = 'main');

-- Poster content follows the same public-read/admin-write boundary as jobs.
drop policy if exists "Authenticated admins can read all poster slides" on public.poster_slides;
drop policy if exists "Allowlisted admins can read all poster slides" on public.poster_slides;
create policy "Allowlisted admins can read all poster slides" on public.poster_slides
for select to authenticated using ((select public.is_admin()));

drop policy if exists "Authenticated admins can create poster slides" on public.poster_slides;
drop policy if exists "Allowlisted admins can create poster slides" on public.poster_slides;
create policy "Allowlisted admins can create poster slides" on public.poster_slides
for insert to authenticated with check ((select public.is_admin()));

drop policy if exists "Authenticated admins can update poster slides" on public.poster_slides;
drop policy if exists "Allowlisted admins can update poster slides" on public.poster_slides;
create policy "Allowlisted admins can update poster slides" on public.poster_slides
for update to authenticated
using ((select public.is_admin()))
with check ((select public.is_admin()));

drop policy if exists "Authenticated admins can delete poster slides" on public.poster_slides;
drop policy if exists "Allowlisted admins can delete poster slides" on public.poster_slides;
create policy "Allowlisted admins can delete poster slides" on public.poster_slides
for delete to authenticated using ((select public.is_admin()));

-- Public buckets remain readable. Upload, replacement, and deletion require an
-- allowlisted user, even if another authenticated account exists.
drop policy if exists "Authenticated admins can upload company logos" on storage.objects;
drop policy if exists "Allowlisted admins can upload company logos" on storage.objects;
create policy "Allowlisted admins can upload company logos" on storage.objects
for insert to authenticated
with check (bucket_id = 'company-logos' and (select public.is_admin()));

drop policy if exists "Authenticated admins can update company logos" on storage.objects;
drop policy if exists "Allowlisted admins can update company logos" on storage.objects;
create policy "Allowlisted admins can update company logos" on storage.objects
for update to authenticated
using (bucket_id = 'company-logos' and (select public.is_admin()))
with check (bucket_id = 'company-logos' and (select public.is_admin()));

drop policy if exists "Authenticated admins can delete company logos" on storage.objects;
drop policy if exists "Allowlisted admins can delete company logos" on storage.objects;
create policy "Allowlisted admins can delete company logos" on storage.objects
for delete to authenticated
using (bucket_id = 'company-logos' and (select public.is_admin()));

drop policy if exists "Authenticated admins can upload poster images" on storage.objects;
drop policy if exists "Allowlisted admins can upload poster images" on storage.objects;
create policy "Allowlisted admins can upload poster images" on storage.objects
for insert to authenticated
with check (bucket_id = 'poster-images' and (select public.is_admin()));

drop policy if exists "Authenticated admins can update poster images" on storage.objects;
drop policy if exists "Allowlisted admins can update poster images" on storage.objects;
create policy "Allowlisted admins can update poster images" on storage.objects
for update to authenticated
using (bucket_id = 'poster-images' and (select public.is_admin()))
with check (bucket_id = 'poster-images' and (select public.is_admin()));

drop policy if exists "Authenticated admins can delete poster images" on storage.objects;
drop policy if exists "Allowlisted admins can delete poster images" on storage.objects;
create policy "Allowlisted admins can delete poster images" on storage.objects
for delete to authenticated
using (bucket_id = 'poster-images' and (select public.is_admin()));
