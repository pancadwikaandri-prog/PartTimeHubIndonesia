-- Careerhub.indonesia development schema
create extension if not exists "pgcrypto";

create table if not exists public.jobs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  company_name text not null,
  company_logo_url text,
  company_description text not null default '',
  location text not null,
  category text not null,
  work_type text not null check (work_type in ('Full-Time', 'Part-Time', 'Freelance', 'Temporary', 'Internship')),
  work_mode text not null default 'On-site' check (work_mode in ('On-site', 'Hybrid', 'Remote')),
  short_description text not null,
  description text not null,
  requirements text[] not null default '{}',
  responsibilities text[] not null default '{}',
  salary_min numeric check (salary_min is null or salary_min >= 0),
  salary_max numeric check (salary_max is null or salary_max >= 0),
  salary_display text,
  salary_period text,
  application_method text not null check (application_method in ('whatsapp', 'email', 'url')),
  application_email text,
  application_whatsapp text,
  application_url text,
  is_active boolean not null default true,
  is_featured boolean not null default false,
  is_urgent boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint application_contact_required check (
    (application_method = 'whatsapp' and application_whatsapp is not null)
    or (application_method = 'email' and application_email is not null)
    or (application_method = 'url' and application_url is not null)
  )
);

create index if not exists jobs_public_listing_idx on public.jobs (is_active, is_featured desc, created_at desc);
create index if not exists jobs_location_idx on public.jobs (location);
create index if not exists jobs_category_idx on public.jobs (category);

create or replace function public.set_updated_at()
returns trigger language plpgsql security invoker set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists jobs_set_updated_at on public.jobs;
create trigger jobs_set_updated_at before update on public.jobs for each row execute function public.set_updated_at();

alter table public.jobs enable row level security;

grant select on table public.jobs to anon, authenticated;
grant insert, update, delete on table public.jobs to authenticated;

drop policy if exists "Public can read active jobs" on public.jobs;
create policy "Public can read active jobs" on public.jobs for select to anon using (is_active = true);

drop policy if exists "Authenticated admins can read all jobs" on public.jobs;
create policy "Authenticated admins can read all jobs" on public.jobs for select to authenticated using (true);

drop policy if exists "Authenticated admins can create jobs" on public.jobs;
create policy "Authenticated admins can create jobs" on public.jobs for insert to authenticated with check (true);

drop policy if exists "Authenticated admins can update jobs" on public.jobs;
create policy "Authenticated admins can update jobs" on public.jobs for update to authenticated using (true) with check (true);

drop policy if exists "Authenticated admins can delete jobs" on public.jobs;
create policy "Authenticated admins can delete jobs" on public.jobs for delete to authenticated using (true);

-- Public company logo bucket. Create via migration so local and hosted development match.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('company-logos', 'company-logos', true, 2000000, array['image/png', 'image/jpeg', 'image/webp'])
on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public can view company logos" on storage.objects;
create policy "Public can view company logos" on storage.objects for select to public using (bucket_id = 'company-logos');

drop policy if exists "Authenticated admins can upload company logos" on storage.objects;
create policy "Authenticated admins can upload company logos" on storage.objects for insert to authenticated with check (bucket_id = 'company-logos');

drop policy if exists "Authenticated admins can update company logos" on storage.objects;
create policy "Authenticated admins can update company logos" on storage.objects for update to authenticated using (bucket_id = 'company-logos') with check (bucket_id = 'company-logos');

drop policy if exists "Authenticated admins can delete company logos" on storage.objects;
create policy "Authenticated admins can delete company logos" on storage.objects for delete to authenticated using (bucket_id = 'company-logos');
