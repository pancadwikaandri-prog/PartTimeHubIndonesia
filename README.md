# Careerhub.indonesia

Portal lowongan kerja part-time Indonesia dengan dua antarmuka: portal publik dan dashboard administrator.

## Menjalankan secara lokal

1. Jalankan `pnpm install`.
2. Pastikan Docker Desktop aktif, lalu jalankan `pnpm supabase:start`.
3. Isi `.env` menggunakan URL API dan publishable/anon key lokal yang ditampilkan Supabase. Gunakan port standar `http://127.0.0.1:54321`.
4. Buat akun admin lokal melalui Admin API atau Supabase Studio, nonaktifkan public sign-up, lalu tambahkan UUID akun ke `public.admin_users` seperti dijelaskan di `supabase/README.md`.
5. Jalankan `pnpm dev`.
6. Buka portal publik di `/` dan dashboard di `/admin`.

Migrasi dan seed diterapkan otomatis oleh Supabase CLI. Tanpa kredensial Supabase, aplikasi dapat berjalan dalam mode demo lokal dengan data realistis dan CRUD dalam memori. Build produksi tidak pernah mengaktifkan akses admin demo. Jangan masukkan service-role/secret key ke variabel Vite.

## Verifikasi lokal

- `pnpm typecheck`
- `pnpm test`
- `pnpm test:supabase` (memerlukan `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`/`VITE_SUPABASE_ANON_KEY`, `LOCAL_ADMIN_EMAIL`, dan `LOCAL_ADMIN_PASSWORD`; akun kontrol non-admin bersifat opsional)
- `pnpm lint`
- `pnpm build`

Tidak ada konfigurasi deployment atau domain di repository ini pada tahap pengembangan lokal.
