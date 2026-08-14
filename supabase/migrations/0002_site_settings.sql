create table if not exists public.site_settings (
  id text primary key check (id = 'main'),
  post_job_url text not null,
  instagram_url text not null,
  threads_url text not null,
  telegram_url text not null,
  whatsapp_url text not null,
  updated_at timestamptz not null default now()
);

drop trigger if exists site_settings_set_updated_at on public.site_settings;
create trigger site_settings_set_updated_at before update on public.site_settings
for each row execute function public.set_updated_at();

alter table public.site_settings enable row level security;

grant select on table public.site_settings to anon, authenticated;
grant insert, update on table public.site_settings to authenticated;

drop policy if exists "Public can read site settings" on public.site_settings;
create policy "Public can read site settings" on public.site_settings
for select to anon, authenticated using (true);

drop policy if exists "Authenticated admins can create site settings" on public.site_settings;
create policy "Authenticated admins can create site settings" on public.site_settings
for insert to authenticated with check (id = 'main');

drop policy if exists "Authenticated admins can update site settings" on public.site_settings;
create policy "Authenticated admins can update site settings" on public.site_settings
for update to authenticated using (id = 'main') with check (id = 'main');

insert into public.site_settings (
  id, post_job_url, instagram_url, threads_url, telegram_url, whatsapp_url
) values (
  'main',
  'https://wa.me/?text=Halo%20Careerhub.indonesia%2C%20saya%20ingin%20memasang%20lowongan%20pekerjaan.',
  'https://www.instagram.com/parttimehubindonesia/',
  'https://www.threads.net/@parttimehubindonesia',
  'https://t.me/parttimehubindonesia',
  'https://wa.me/?text=Halo%20Careerhub.indonesia%2C%20saya%20ingin%20memasang%20lowongan%20pekerjaan.'
)
on conflict (id) do nothing;
