import { ArrowLeft, Eye, EyeOff, LockKeyhole, Mail, ShieldCheck } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'

export function AdminLogin({ onSubmit, onDemo, configured }: { onSubmit: (email: string, password: string) => Promise<void>; onDemo?: () => void; configured: boolean }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const submit = async (event: FormEvent) => {
    event.preventDefault(); setError(''); setLoading(true)
    try { await onSubmit(email, password) } catch (cause) { setError(cause instanceof Error ? cause.message : 'Email atau kata sandi tidak valid.') } finally { setLoading(false) }
  }
  return (
    <main className="grid min-h-screen bg-[#f1eee7] lg:grid-cols-[1.05fr_.95fr]">
      <section className="relative hidden overflow-hidden bg-[#18181d] p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute -right-24 -top-24 size-[430px] rounded-full border-[78px] border-[#5962f4]/70" /><div className="absolute -bottom-52 -left-20 size-[520px] rounded-full bg-[#ffcf4a]" /><div className="absolute bottom-24 right-16 grid grid-cols-5 gap-3 opacity-20">{Array.from({ length: 25 }).map((_, index) => <span key={index} className="size-2 rounded-full bg-white" />)}</div>
        <div className="relative"><LoginMark /></div>
        <div className="relative max-w-lg"><span className="inline-flex items-center gap-2 rounded-full bg-[#5962f4] px-3 py-1.5 text-[10px] font-black uppercase tracking-[.13em] text-white"><ShieldCheck className="size-4" /> Area administrator</span><h1 className="mt-7 text-[56px] font-black leading-[1.02] tracking-[-.06em]">Peluang besar<br />dimulai di sini.</h1><p className="mt-5 max-w-md text-sm leading-7 text-white/50">Kendalikan setiap lowongan, jaga informasinya tetap akurat, dan bantu talenta menemukan tempatnya.</p></div>
        <p className="relative text-[10px] font-bold uppercase tracking-[.16em] text-[#18181d]/45">Careerhub.indonesia · Hiring Control Room</p>
      </section>
      <section className="flex min-h-screen flex-col px-5 py-6 sm:px-10 lg:px-16">
        <div className="flex items-center justify-between lg:justify-end"><div className="lg:hidden"><LoginMark dark /></div><Link to="/" className="focus-ring inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-bold text-[#77736c] hover:bg-white hover:text-[#4d54c8]"><ArrowLeft className="size-4" /> Kembali ke portal</Link></div>
        <div className="mx-auto flex w-full max-w-[430px] flex-1 flex-col justify-center py-10">
          <p className="text-[10px] font-black uppercase tracking-[.16em] text-[#5962f4]">Selamat datang kembali</p><h2 className="mt-3 text-[40px] font-black leading-none tracking-[-.055em] text-[#18181d]">Masuk ke<br />control room.</h2><p className="mt-4 text-sm leading-6 text-[#77736c]">Gunakan akun admin Supabase yang telah terdaftar.</p>
          {!configured && <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-3.5 text-xs leading-5 text-amber-800"><strong>Mode pratinjau lokal.</strong> Supabase belum dihubungkan. Isi variabel di <code className="font-bold">.env</code> untuk mengaktifkan login nyata.</div>}
          <form className="mt-7 space-y-4" onSubmit={submit}>
            <FieldIcon icon={<Mail />}><label className="sr-only" htmlFor="admin-email">Email admin</label><input id="admin-email" type="email" required autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="admin@perusahaan.co.id" className="w-full bg-transparent text-sm font-semibold text-slate-800 outline-none placeholder:font-medium placeholder:text-slate-400" /></FieldIcon>
            <FieldIcon icon={<LockKeyhole />}><label className="sr-only" htmlFor="admin-password">Kata sandi</label><input id="admin-password" type={showPassword ? 'text' : 'password'} required autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Kata sandi" className="w-full bg-transparent text-sm font-semibold text-slate-800 outline-none placeholder:font-medium placeholder:text-slate-400" /><button type="button" onClick={() => setShowPassword((value) => !value)} className="focus-ring rounded text-slate-400 hover:text-slate-700" aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}>{showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}</button></FieldIcon>
            {error && <p role="alert" className="rounded-xl bg-red-50 px-3.5 py-3 text-xs font-semibold text-red-700">{error}</p>}
            <button disabled={loading || !configured} className="focus-ring flex w-full items-center justify-center rounded-full bg-[#18181d] py-3.5 text-sm font-extrabold text-white shadow-[0_7px_0_#d3cec4] transition hover:-translate-y-0.5 hover:bg-[#5962f4] disabled:bg-[#b9b5ad]">{loading ? 'Memverifikasi…' : 'Masuk ke Dashboard'}</button>
          </form>
          {onDemo && <div className="mt-5"><div className="flex items-center gap-3"><div className="h-px flex-1 bg-[#d9d5cd]" /><span className="text-[9px] font-black uppercase tracking-[.15em] text-[#9b978f]">Pratinjau lokal</span><div className="h-px flex-1 bg-[#d9d5cd]" /></div><button onClick={onDemo} className="focus-ring mt-5 w-full rounded-full border-2 border-[#18181d] bg-[#ffcf4a] py-3 text-sm font-extrabold text-[#18181d] transition hover:bg-[#f4be28]">Buka Dashboard Demo</button></div>}
        </div>
      </section>
    </main>
  )
}

function LoginMark({ dark = false }: { dark?: boolean }) { return <img src="/careerhub-logo.jpg" alt="Careerhub.indonesia" className={`size-14 rounded-full object-cover shadow-sm ${dark ? 'ring-1 ring-[#d6d1c8]' : 'ring-1 ring-white/20'}`} /> }
function FieldIcon({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) { return <div className="flex items-center gap-3 rounded-2xl border border-[#d6d1c8] bg-[#faf8f3] px-4 py-4 transition focus-within:border-[#5962f4] focus-within:ring-4 focus-within:ring-[#5962f4]/10"><span className="text-[#8a877f] [&>svg]:size-4">{icon}</span>{children}</div> }
