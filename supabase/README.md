# Supabase security and development setup

Use a development-only Supabase project or the Supabase CLI local stack. Do not reuse production credentials.

1. Apply every file in `migrations/` in numeric order. Migration `0006_admin_authorization.sql` is security-critical.
2. Optionally apply `seed.sql` for sample vacancies.
3. In Authentication settings, disable public sign-ups globally and for the Email provider.
4. Create administrator accounts manually in Authentication > Users with a unique, password-manager-generated password.
5. Allowlist the account's immutable user ID. Migration `0006` does this automatically for the existing production administrator. For a local account created after migrations, run this in the SQL editor:

   ```sql
   insert into public.admin_users (user_id)
   select id from auth.users where lower(email) = lower('your-admin@example.com')
   on conflict (user_id) do nothing;
   ```

6. Put only the project URL and public publishable/anon key in the root `.env`.
7. Set `VITE_ENABLE_DEMO_MODE=false` when verifying real authentication and CRUD. Production builds disable demo admin access regardless of this variable.

## Authorization model

- Anonymous visitors may read active jobs, active posters, public images, and public site settings.
- Being authenticated is not enough for administration. Every admin table and storage mutation calls `public.is_admin()`, which checks `auth.uid()` against `public.admin_users`.
- `admin_users` is not readable or writable through the public API. Add or remove administrators only through a trusted SQL/Admin workflow.
- The browser uses only the public publishable key. Never put a service-role key, database password, or Supabase secret key in a `VITE_` variable.

## Hosted-project checklist

Repository `config.toml` settings configure local Supabase. Confirm these separately in the hosted Supabase dashboard:

- Public sign-ups disabled.
- Minimum password length of at least 12 and the strongest character requirements enabled.
- Leaked-password protection enabled when the plan supports it.
- Sign-in rate limits reduced for this single-admin application; CAPTCHA enabled if login abuse appears.
- A short inactivity timeout and a bounded session lifetime configured.
- TOTP multi-factor authentication enabled and enrolled for the administrator when the hosted plan supports it.

After applying migrations, run `pnpm test:supabase`. Optional `LOCAL_NON_ADMIN_EMAIL` and `LOCAL_NON_ADMIN_PASSWORD` variables add a negative test proving that an authenticated but non-allowlisted account cannot write.
