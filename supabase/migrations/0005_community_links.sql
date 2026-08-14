alter table public.site_settings
add column if not exists careerhub_instagram_url text not null default '',
add column if not exists careerhub_threads_url text not null default '',
add column if not exists careerhub_telegram_url text not null default '',
add column if not exists careerhub_whatsapp_url text not null default '';
