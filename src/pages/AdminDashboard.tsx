import type { User } from '@supabase/supabase-js'
import { ArrowUpRight, BriefcaseBusiness, Building2, CalendarDays, ChevronDown, CircleAlert, Eye, FilePenLine, Images, LayoutDashboard, Link2, LogOut, Menu, MoreHorizontal, Plus, RefreshCw, Save, Search, Settings2, Sparkles, Trash2, X } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AdminLogin } from '../components/admin/AdminLogin'
import { ConfirmDialog } from '../components/admin/ConfirmDialog'
import { JobFormDrawer } from '../components/admin/JobFormDrawer'
import { PosterFormDrawer } from '../components/admin/PosterFormDrawer'
import { PosterSlidesPanel } from '../components/admin/PosterSlidesPanel'
import { JobDetailDrawer } from '../components/jobs/JobDetailDrawer'
import { LogoAvatar } from '../components/ui/LogoAvatar'
import { useToast } from '../components/ui/toast'
import { demoModeEnabled, isSupabaseConfigured, supabase } from '../lib/supabase'
import { formatRelativeDate } from '../lib/utils'
import { createJob, deleteJob, listAdminJobs, updateJob } from '../services/jobs'
import { createPosterSlide, deletePosterSlide, listAdminPosterSlides, updatePosterSlide } from '../services/posterSlides'
import { getSiteSettings, saveSiteSettings } from '../services/siteSettings'
import type { Job, JobFormValues } from '../types/job'
import type { PosterSlide, PosterSlideFormValues } from '../types/posterSlide'
import { defaultSiteSettings, type SiteSettings, type SiteSettingsForm } from '../types/siteSettings'

type Section = 'overview' | 'jobs' | 'posters' | 'settings'

export function AdminDashboard() {
  const [user, setUser] = useState<User | null>(null)
  const [demoAuthenticated, setDemoAuthenticated] = useState(false)
  const [authLoading, setAuthLoading] = useState(true)
  const [jobs, setJobs] = useState<Job[]>([])
  const [jobsLoading, setJobsLoading] = useState(false)
  const [jobsError, setJobsError] = useState('')
  const [section, setSection] = useState<Section>('overview')
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('all')
  const [mobileMenu, setMobileMenu] = useState(false)
  const [formOpen, setFormOpen] = useState(false)
  const [editingJob, setEditingJob] = useState<Job | null>(null)
  const [viewingJob, setViewingJob] = useState<Job | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Job | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(defaultSiteSettings)
  const [settingsLoading, setSettingsLoading] = useState(false)
  const [settingsSaving, setSettingsSaving] = useState(false)
  const [posterSlides, setPosterSlides] = useState<PosterSlide[]>([])
  const [postersLoading, setPostersLoading] = useState(false)
  const [postersError, setPostersError] = useState('')
  const [posterFormOpen, setPosterFormOpen] = useState(false)
  const [editingPoster, setEditingPoster] = useState<PosterSlide | null>(null)
  const [posterDeleteTarget, setPosterDeleteTarget] = useState<PosterSlide | null>(null)
  const [posterSaving, setPosterSaving] = useState(false)
  const [posterDeleting, setPosterDeleting] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (!supabase) { setAuthLoading(false); return }
    void supabase.auth.getSession().then(({ data }) => { setUser(data.session?.user ?? null); setAuthLoading(false) })
    const { data } = supabase.auth.onAuthStateChange((_event, session) => setUser(session?.user ?? null))
    return () => data.subscription.unsubscribe()
  }, [])

  const authenticated = Boolean(user || demoAuthenticated)
  const loadJobs = useCallback(async () => {
    setJobsLoading(true); setJobsError('')
    try { setJobs(await listAdminJobs()) }
    catch { setJobsError('Data lowongan tidak dapat dimuat. Pastikan tabel dan kebijakan Supabase sudah diterapkan.') }
    finally { setJobsLoading(false) }
  }, [])
  useEffect(() => { if (authenticated) void loadJobs() }, [authenticated, loadJobs])
  const loadPosters = useCallback(async () => {
    setPostersLoading(true); setPostersError('')
    try { setPosterSlides(await listAdminPosterSlides()) }
    catch { setPostersError('Poster tidak dapat dimuat. Pastikan migrasi poster Supabase sudah diterapkan.') }
    finally { setPostersLoading(false) }
  }, [])
  useEffect(() => { if (authenticated) void loadPosters() }, [authenticated, loadPosters])
  useEffect(() => {
    if (!authenticated) return
    setSettingsLoading(true)
    void getSiteSettings().then(setSiteSettings).catch(() => toast('Pengaturan tautan belum dapat dimuat.', 'error')).finally(() => setSettingsLoading(false))
  }, [authenticated, toast])

  const login = async (email: string, password: string) => {
    if (!supabase) throw new Error('Supabase belum dikonfigurasi di lingkungan lokal.')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw new Error(error.message === 'Invalid login credentials' ? 'Email atau kata sandi tidak valid.' : error.message)
  }
  const logout = async () => { if (supabase && user) await supabase.auth.signOut(); setDemoAuthenticated(false); setUser(null) }
  const saveJob = async (values: JobFormValues) => {
    setSaving(true)
    try {
      const saved = editingJob ? await updateJob(editingJob.id, values) : await createJob(values)
      setJobs((current) => editingJob ? current.map((job) => job.id === saved.id ? saved : job) : [saved, ...current])
      setFormOpen(false); setEditingJob(null); toast(editingJob ? 'Perubahan lowongan berhasil disimpan.' : 'Lowongan baru berhasil diterbitkan.')
    } catch (cause) { toast(cause instanceof Error ? cause.message : 'Lowongan gagal disimpan.', 'error') } finally { setSaving(false) }
  }
  const confirmDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try { await deleteJob(deleteTarget.id); setJobs((current) => current.filter((job) => job.id !== deleteTarget.id)); setDeleteTarget(null); toast('Lowongan berhasil dihapus.') }
    catch (cause) { toast(cause instanceof Error ? cause.message : 'Lowongan gagal dihapus.', 'error') } finally { setDeleting(false) }
  }
  const toggleActive = async (job: Job) => {
    try { const updated = await updateJob(job.id, { is_active: !job.is_active }); setJobs((current) => current.map((item) => item.id === job.id ? updated : item)); toast(updated.is_active ? 'Lowongan berhasil diaktifkan.' : 'Lowongan dinonaktifkan.') }
    catch { toast('Status lowongan gagal diubah.', 'error') }
  }
  const openCreate = () => { setEditingJob(null); setFormOpen(true) }
  const openEdit = (job: Job) => { setEditingJob(job); setFormOpen(true) }
  const saveLinks = async (values: SiteSettingsForm) => {
    setSettingsSaving(true)
    try { setSiteSettings(await saveSiteSettings(values)); toast('Tautan publik berhasil diperbarui.') }
    catch (cause) { toast(cause instanceof Error ? cause.message : 'Pengaturan tautan gagal disimpan.', 'error') }
    finally { setSettingsSaving(false) }
  }
  const openPosterCreate = () => { setEditingPoster(null); setPosterFormOpen(true) }
  const openPosterEdit = (slide: PosterSlide) => { setEditingPoster(slide); setPosterFormOpen(true) }
  const savePoster = async (values: PosterSlideFormValues) => {
    setPosterSaving(true)
    try {
      const saved = editingPoster ? await updatePosterSlide(editingPoster.id, values) : await createPosterSlide(values)
      setPosterSlides((current) => (editingPoster ? current.map((slide) => slide.id === saved.id ? saved : slide) : [...current, saved]).sort((a, b) => a.sort_order - b.sort_order || a.created_at.localeCompare(b.created_at)))
      setPosterFormOpen(false); setEditingPoster(null); toast(editingPoster ? 'Poster berhasil diperbarui.' : 'Poster berhasil ditambahkan.')
    } catch (cause) { toast(cause instanceof Error ? cause.message : 'Poster gagal disimpan.', 'error') }
    finally { setPosterSaving(false) }
  }
  const togglePoster = async (slide: PosterSlide) => {
    try { const updated = await updatePosterSlide(slide.id, { is_active: !slide.is_active }); setPosterSlides((current) => current.map((item) => item.id === updated.id ? updated : item)); toast(updated.is_active ? 'Poster diaktifkan.' : 'Poster dijeda.') }
    catch { toast('Status poster gagal diubah.', 'error') }
  }
  const confirmPosterDelete = async () => {
    if (!posterDeleteTarget) return
    setPosterDeleting(true)
    try { await deletePosterSlide(posterDeleteTarget.id); setPosterSlides((current) => current.filter((slide) => slide.id !== posterDeleteTarget.id)); setPosterDeleteTarget(null); toast('Poster berhasil dihapus.') }
    catch (cause) { toast(cause instanceof Error ? cause.message : 'Poster gagal dihapus.', 'error') }
    finally { setPosterDeleting(false) }
  }

  if (authLoading) return <div className="grid min-h-screen place-items-center bg-[#f7f9f8]"><div className="text-center"><div className="mx-auto size-9 animate-spin rounded-full border-2 border-slate-200 border-t-brand-700" /><p className="mt-3 text-xs font-bold text-slate-400">Menyiapkan dashboard…</p></div></div>
  if (!authenticated) return <AdminLogin configured={isSupabaseConfigured} onSubmit={login} onDemo={!isSupabaseConfigured && demoModeEnabled ? () => setDemoAuthenticated(true) : undefined} />

  const filteredJobs = jobs.filter((job) => {
    const matchesQuery = `${job.title} ${job.company_name} ${job.location}`.toLowerCase().includes(query.toLowerCase())
    return matchesQuery && (status === 'all' || (status === 'active' ? job.is_active : !job.is_active))
  })
  const activeCount = jobs.filter((job) => job.is_active).length
  const inactiveCount = jobs.length - activeCount
  const companyCount = new Set(jobs.map((job) => job.company_name)).size
  const displayName = user?.email || 'Admin Demo'
  const today = new Intl.DateTimeFormat('id-ID', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date())
  const activePercentage = jobs.length ? Math.round((activeCount / jobs.length) * 100) : 0

  return (
    <div className="min-h-screen bg-[#f1eee7] text-[#19191f] lg:grid lg:grid-cols-[264px_1fr]">
      <aside className="hidden bg-[#18181d] text-white lg:fixed lg:inset-y-0 lg:flex lg:w-[264px] lg:flex-col">
        <div className="px-6 pb-7 pt-6"><AdminMark /><div className="mt-8 rounded-2xl border border-white/10 bg-white/[.055] p-4"><p className="text-[9px] font-black uppercase tracking-[.18em] text-white/35">Workspace</p><div className="mt-3 flex items-center gap-3"><div className="grid size-9 place-items-center rounded-full bg-[#ffcf4a] text-xs font-black text-[#18181d]">CI</div><div className="min-w-0"><p className="truncate text-xs font-extrabold text-white">Careerhub.indonesia</p><p className="mt-0.5 text-[10px] text-white/40">Hiring control room</p></div></div></div></div>
        <nav className="flex-1 px-4"><p className="px-3 pb-2 text-[9px] font-black uppercase tracking-[.2em] text-white/25">Menu utama</p><div className="space-y-1.5"><SidebarButton icon={<LayoutDashboard />} label="Dashboard" active={section === 'overview'} onClick={() => setSection('overview')} /><SidebarButton icon={<BriefcaseBusiness />} label="Lowongan" active={section === 'jobs'} onClick={() => setSection('jobs')} count={jobs.length} /><SidebarButton icon={<Images />} label="Poster Instagram" active={section === 'posters'} onClick={() => setSection('posters')} count={posterSlides.length} /><SidebarButton icon={<Settings2 />} label="Pengaturan Tautan" active={section === 'settings'} onClick={() => setSection('settings')} /></div></nav>
        {!isSupabaseConfigured && <div className="mx-4 mb-3 rounded-2xl border border-[#ffcf4a]/25 bg-[#ffcf4a]/10 p-3.5"><p className="text-[9px] font-black uppercase tracking-[.16em] text-[#ffcf4a]">Mode demo lokal</p><p className="mt-1.5 text-[10px] leading-4 text-white/45">Perubahan aktif selama sesi berjalan.</p></div>}
        <div className="p-4"><Link to="/" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-bold text-white/45 transition hover:bg-white/5 hover:text-white"><Eye className="size-4" /> Lihat portal publik</Link><button onClick={() => void logout()} className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-bold text-white/45 transition hover:bg-[#ff6b5f]/10 hover:text-[#ff8b82]"><LogOut className="size-4" /> Keluar</button></div>
      </aside>

      <div className="lg:col-start-2">
        <header className="sticky top-0 z-30 flex h-[76px] items-center justify-between border-b border-[#d9d5cd] bg-[#f1eee7]/90 px-4 backdrop-blur-xl sm:px-7 lg:px-10">
          <div className="flex items-center gap-3"><button onClick={() => setMobileMenu(true)} className="grid size-10 place-items-center rounded-full bg-[#18181d] text-white lg:hidden" aria-label="Buka menu"><Menu className="size-4" /></button><div className="lg:hidden"><AdminMark dark /></div><div className="hidden lg:block"><p className="text-[9px] font-black uppercase tracking-[.18em] text-[#7d7a75]">{section === 'overview' ? 'Overview' : section === 'jobs' ? 'Vacancy library' : section === 'posters' ? 'Poster manager' : 'Public links'}</p><h1 className="mt-1 text-sm font-black text-[#19191f]">{section === 'overview' ? 'Control Board' : section === 'jobs' ? 'Kelola Lowongan' : section === 'posters' ? 'Poster Instagram' : 'Pengaturan Tautan'}</h1></div></div>
          <div className="flex items-center gap-3 rounded-full border border-[#d9d5cd] bg-[#f8f6f1] py-1.5 pl-4 pr-1.5"><div className="hidden text-right sm:block"><p className="max-w-44 truncate text-[11px] font-extrabold text-[#29282e]">{displayName}</p><p className="mt-0.5 text-[9px] text-[#8a877f]">Administrator</p></div><div className="grid size-8 place-items-center rounded-full bg-[#5a61f6] text-[10px] font-black text-white">AD</div></div>
        </header>

        <main className="mx-auto max-w-[1480px] p-4 sm:p-7 lg:p-10">
          {section === 'overview' ? <>
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[.16em] text-[#77736c]"><CalendarDays className="size-3.5 text-[#5a61f6]" /> {today}</div><h2 className="mt-3 max-w-2xl text-[32px] font-black leading-[1.05] tracking-[-.045em] text-[#18181d] sm:text-[42px]">Halo, siap buka<br className="hidden sm:block" /> peluang baru?</h2></div><button onClick={openCreate} className="focus-ring inline-flex items-center justify-center gap-2 rounded-full bg-[#18181d] px-5 py-3.5 text-xs font-extrabold text-white shadow-[0_8px_0_#d3cec4] transition hover:-translate-y-0.5 hover:bg-[#5a61f6]"><Plus className="size-4" /> Tambah Lowongan</button></div>

            <div className="mt-8 grid gap-4 xl:grid-cols-12">
              <section className="relative min-h-[310px] overflow-hidden rounded-[28px] bg-[#5962f4] p-6 text-white sm:p-8 xl:col-span-8">
                <div className="absolute -right-16 -top-20 size-72 rounded-full border-[42px] border-white/10" /><div className="absolute bottom-8 right-10 grid grid-cols-4 gap-2 opacity-25">{Array.from({ length: 16 }).map((_, index) => <span key={index} className="size-1.5 rounded-full bg-white" />)}</div>
                <div className="relative flex h-full flex-col"><div className="flex items-center justify-between"><span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-[10px] font-black uppercase tracking-[.13em]"><Sparkles className="size-3.5" /> Live workspace</span><button onClick={() => setSection('jobs')} className="grid size-10 place-items-center rounded-full bg-white text-[#252632] transition hover:rotate-45" aria-label="Kelola lowongan"><ArrowUpRight className="size-4" /></button></div>
                  <div className="mt-8"><p className="text-[11px] font-bold text-white/65">Lowongan yang sedang tayang</p><div className="mt-1 flex items-end gap-3"><span className="text-[84px] font-black leading-none tracking-[-.08em]">{activeCount}</span><span className="mb-2 rounded-full bg-[#ffcf4a] px-2.5 py-1 text-[10px] font-black text-[#27251c]">{activePercentage}% aktif</span></div></div>
                  <div className="mt-auto grid grid-cols-2 gap-3 border-t border-white/20 pt-5"><div><p className="text-[10px] font-bold uppercase tracking-[.12em] text-white/50">Total arsip</p><p className="mt-1 text-2xl font-black">{jobs.length}</p></div><div><p className="text-[10px] font-bold uppercase tracking-[.12em] text-white/50">Sedang jeda</p><p className="mt-1 text-2xl font-black">{inactiveCount}</p></div></div>
                </div>
              </section>

              <section className="relative min-h-[310px] overflow-hidden rounded-[28px] border-2 border-[#18181d] bg-[#ffcf4a] p-6 sm:p-8 xl:col-span-4"><div className="absolute -bottom-14 -right-12 size-52 rounded-full bg-[#ff8a65]" /><div className="relative flex h-full flex-col"><div className="flex items-center justify-between"><div className="grid size-11 place-items-center rounded-full bg-[#18181d] text-white"><Building2 className="size-5" /></div><span className="text-[10px] font-black uppercase tracking-[.14em] text-[#665114]">Partner aktif</span></div><div className="mt-8"><p className="text-6xl font-black tracking-[-.07em] text-[#18181d]">{companyCount}</p><p className="mt-2 max-w-[190px] text-sm font-extrabold leading-5 text-[#4f421c]">perusahaan membuka peluang bersama kita.</p></div><div className="mt-auto flex -space-x-2">{jobs.slice(0, 5).map((job) => <div key={job.company_name} className="rounded-full border-2 border-[#ffcf4a] bg-white"><LogoAvatar name={job.company_name} url={job.company_logo_url} size="sm" /></div>)}</div></div></section>

              <section className="overflow-hidden rounded-[28px] border border-[#d6d1c8] bg-[#faf8f3] xl:col-span-8"><div className="flex items-end justify-between px-5 pb-4 pt-6 sm:px-7"><div><p className="text-[10px] font-black uppercase tracking-[.16em] text-[#5a61f6]">Baru masuk</p><h3 className="mt-1 text-xl font-black tracking-[-.03em] text-[#18181d]">Papan lowongan terbaru</h3></div><button onClick={() => setSection('jobs')} className="inline-flex items-center gap-1 text-[11px] font-extrabold text-[#4d51c7]">Semua <ArrowUpRight className="size-3.5" /></button></div><div className="px-2 pb-2">{jobsLoading ? Array.from({ length: 4 }).map((_, index) => <RecentSkeleton key={index} />) : jobs.slice(0, 5).map((job, index) => <RecentJob key={job.id} job={job} index={index} onView={() => setViewingJob(job)} />)}{!jobsLoading && jobs.length === 0 && <p className="p-8 text-center text-sm text-[#8a877f]">Belum ada lowongan.</p>}</div></section>

              <section className="rounded-[28px] bg-[#202026] p-6 text-white sm:p-7 xl:col-span-4"><p className="text-[10px] font-black uppercase tracking-[.16em] text-white/35">Kesehatan listing</p><h3 className="mt-2 text-xl font-black tracking-[-.03em]">Status publikasi</h3><div className="mt-7 flex items-center gap-6"><div className="relative grid size-28 shrink-0 place-items-center rounded-full" style={{ background: `conic-gradient(#ffcf4a ${activePercentage}%, rgba(255,255,255,.1) 0)` }}><div className="grid size-[78px] place-items-center rounded-full bg-[#202026]"><div className="text-center"><p className="text-2xl font-black">{activePercentage}%</p><p className="text-[8px] font-bold uppercase tracking-wider text-white/35">aktif</p></div></div></div><div className="min-w-0 flex-1 space-y-4"><StatusLine color="bg-[#ffcf4a]" label="Tayang" value={activeCount} /><StatusLine color="bg-[#73727d]" label="Nonaktif" value={inactiveCount} /></div></div><button onClick={() => setSection('jobs')} className="mt-8 flex w-full items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-[11px] font-extrabold text-white/70 transition hover:bg-white/10 hover:text-white"><span>Rapikan status lowongan</span><ArrowUpRight className="size-4" /></button></section>
            </div>
          </> : section === 'jobs' ? <>
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-[10px] font-black uppercase tracking-[.16em] text-[#5a61f6]">Vacancy library</p><h2 className="mt-2 text-[32px] font-black leading-none tracking-[-.045em] text-[#18181d] sm:text-[42px]">Semua lowongan,<br />satu tempat.</h2><p className="mt-3 text-sm text-[#77736c]">Tambah, perbarui, dan atur status publikasi.</p></div><button onClick={openCreate} className="focus-ring inline-flex items-center justify-center gap-2 rounded-full bg-[#18181d] px-5 py-3.5 text-xs font-extrabold text-white shadow-[0_8px_0_#d3cec4] transition hover:-translate-y-0.5 hover:bg-[#5a61f6]"><Plus className="size-4" /> Tambah Lowongan</button></div>
            <section className="mt-8 overflow-hidden rounded-[28px] border border-[#d6d1c8] bg-[#faf8f3]">
              <div className="flex flex-col gap-3 border-b border-[#dedad2] p-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-5"><label className="flex w-full items-center gap-2.5 rounded-full border border-[#d6d1c8] bg-white px-4 py-3 sm:max-w-sm"><Search className="size-4 text-[#5a61f6]" /><span className="sr-only">Cari lowongan</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cari pekerjaan, perusahaan…" className="min-w-0 flex-1 bg-transparent text-xs font-semibold outline-none placeholder:text-[#aaa69d]" />{query && <button onClick={() => setQuery('')}><X className="size-3.5 text-[#8a877f]" /></button>}</label><div className="flex gap-2"><label className="relative flex-1 sm:flex-none"><span className="sr-only">Filter status</span><select value={status} onChange={(event) => setStatus(event.target.value)} className="h-full appearance-none rounded-full border border-[#d6d1c8] bg-white py-2.5 pl-4 pr-10 text-xs font-extrabold text-[#444249]"><option value="all">Semua status</option><option value="active">Aktif</option><option value="inactive">Nonaktif</option></select><ChevronDown className="pointer-events-none absolute right-4 top-1/2 size-3.5 -translate-y-1/2 text-[#8a877f]" /></label><button onClick={() => void loadJobs()} className="grid size-11 place-items-center rounded-full bg-[#ffcf4a] text-[#18181d] hover:bg-[#f4be28]" aria-label="Muat ulang"><RefreshCw className={`size-4 ${jobsLoading ? 'animate-spin' : ''}`} /></button></div></div>
              {jobsError ? <div className="m-5 flex items-start gap-3 rounded-xl border border-red-100 bg-red-50 p-4 text-xs leading-5 text-red-700"><CircleAlert className="mt-0.5 size-4 shrink-0" />{jobsError}</div> : <JobTable jobs={filteredJobs} loading={jobsLoading} onView={setViewingJob} onEdit={openEdit} onDelete={setDeleteTarget} onToggle={(job) => void toggleActive(job)} />}
            </section>
          </> : section === 'posters' ? <PosterSlidesPanel slides={posterSlides} loading={postersLoading} error={postersError} onCreate={openPosterCreate} onEdit={openPosterEdit} onDelete={setPosterDeleteTarget} onToggle={(slide) => void togglePoster(slide)} onReload={() => void loadPosters()} /> : <LinkSettingsPanel settings={siteSettings} loading={settingsLoading} saving={settingsSaving} onSave={saveLinks} />}
        </main>
      </div>

      {mobileMenu && <div className="fixed inset-0 z-50 lg:hidden"><button className="absolute inset-0 bg-[#111116]/55" onClick={() => setMobileMenu(false)} aria-label="Tutup menu" /><aside className="animate-slide-in absolute inset-y-0 left-0 flex w-[290px] flex-col bg-[#18181d] text-white shadow-2xl"><div className="flex h-[76px] items-center justify-between px-5"><AdminMark /><button onClick={() => setMobileMenu(false)} className="grid size-9 place-items-center rounded-full bg-white/10 text-white"><X className="size-4" /></button></div><nav className="flex-1 space-y-1.5 p-4"><SidebarButton icon={<LayoutDashboard />} label="Dashboard" active={section === 'overview'} onClick={() => { setSection('overview'); setMobileMenu(false) }} /><SidebarButton icon={<BriefcaseBusiness />} label="Lowongan" active={section === 'jobs'} onClick={() => { setSection('jobs'); setMobileMenu(false) }} count={jobs.length} /><SidebarButton icon={<Images />} label="Poster Instagram" active={section === 'posters'} onClick={() => { setSection('posters'); setMobileMenu(false) }} count={posterSlides.length} /><SidebarButton icon={<Settings2 />} label="Pengaturan Tautan" active={section === 'settings'} onClick={() => { setSection('settings'); setMobileMenu(false) }} /></nav><div className="p-4"><Link to="/" className="flex items-center gap-3 rounded-xl px-3 py-3 text-xs font-extrabold text-white/50"><Eye className="size-4" /> Lihat portal publik</Link><button onClick={() => void logout()} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-xs font-extrabold text-[#ff8b82]"><LogOut className="size-4" /> Keluar</button></div></aside></div>}
      <JobFormDrawer open={formOpen} job={editingJob} saving={saving} onClose={() => { setFormOpen(false); setEditingJob(null) }} onSave={saveJob} />
      <PosterFormDrawer open={posterFormOpen} slide={editingPoster} saving={posterSaving} onClose={() => { setPosterFormOpen(false); setEditingPoster(null) }} onSave={savePoster} />
      <JobDetailDrawer job={viewingJob} onClose={() => setViewingJob(null)} />
      <ConfirmDialog open={Boolean(deleteTarget)} title="Hapus lowongan ini?" description={deleteTarget ? `Lowongan “${deleteTarget.title}” dari ${deleteTarget.company_name} akan dihapus permanen. Tindakan ini tidak dapat dibatalkan.` : ''} loading={deleting} onConfirm={() => void confirmDelete()} onClose={() => setDeleteTarget(null)} />
      <ConfirmDialog open={Boolean(posterDeleteTarget)} title="Hapus poster ini?" description={posterDeleteTarget ? `Poster “${posterDeleteTarget.title}” akan dihapus permanen. Tindakan ini tidak dapat dibatalkan.` : ''} loading={posterDeleting} onConfirm={() => void confirmPosterDelete()} onClose={() => setPosterDeleteTarget(null)} />
    </div>
  )
}

function LinkSettingsPanel({ settings, loading, saving, onSave }: { settings: SiteSettings; loading: boolean; saving: boolean; onSave: (values: SiteSettingsForm) => Promise<void> }) {
  const [values, setValues] = useState<SiteSettingsForm>(() => siteSettingsToForm(settings))
  useEffect(() => { setValues(siteSettingsToForm(settings)) }, [settings])
  const update = (key: keyof SiteSettingsForm, value: string) => setValues((current) => ({ ...current, [key]: value }))

  return <div className="animate-fade-up">
    <div><p className="text-[10px] font-black uppercase tracking-[.16em] text-[#5a61f6]">Public link manager</p><h2 className="mt-2 text-[32px] font-black leading-none tracking-[-.045em] text-[#18181d] sm:text-[42px]">Atur tautan<br />tanpa ubah kode.</h2><p className="mt-3 max-w-xl text-sm leading-6 text-[#77736c]">Perubahan yang disimpan langsung digunakan oleh tombol Post a Job dan ikon sosial di footer portal publik.</p></div>
    <div className="mt-8 grid gap-4 xl:grid-cols-[1fr_320px]">
      <form onSubmit={(event) => { event.preventDefault(); void onSave(values) }} className="rounded-[28px] border border-[#d6d1c8] bg-[#faf8f3] p-5 sm:p-7">
        <div className="flex items-center gap-3 border-b border-[#dedad2] pb-5"><div className="grid size-11 place-items-center rounded-full bg-[#5962f4] text-white"><Link2 className="size-5" /></div><div><h3 className="text-sm font-black text-[#222127]">Tautan footer</h3><p className="mt-1 text-[11px] text-[#8a877f]">Gunakan URL lengkap yang dimulai dengan https://</p></div></div>
        {loading ? <div className="space-y-4 py-7">{Array.from({ length: 9 }).map((_, index) => <div key={index} className="h-[70px] animate-pulse rounded-2xl bg-[#e9e5dd]" />)}</div> : <div className="space-y-6 py-7">
          <SettingsUrlField label="Post a Job" hint="Tautan tombol untuk perusahaan yang ingin memasang lowongan." value={values.post_job_url} onChange={(value) => update('post_job_url', value)} />
          <CommunitySettingsGroup title="Parttimehub Indonesia" description="Tautan komunitas Parttimehub yang sudah digunakan saat ini."><SettingsUrlField label="Instagram" hint="Profil Instagram Parttimehub." value={values.instagram_url} onChange={(value) => update('instagram_url', value)} /><SettingsUrlField label="Threads" hint="Profil Threads Parttimehub." value={values.threads_url} onChange={(value) => update('threads_url', value)} /><SettingsUrlField label="Telegram Channel" hint="Channel Telegram Parttimehub." value={values.telegram_url} onChange={(value) => update('telegram_url', value)} /><SettingsUrlField label="WhatsApp Channel" hint="Channel atau komunitas WhatsApp Parttimehub." value={values.whatsapp_url} onChange={(value) => update('whatsapp_url', value)} /></CommunitySettingsGroup>
          <CommunitySettingsGroup title="Careerhub Indonesia" description="Isi tautan resmi Careerhub; kolom kosong tidak akan menjadi tautan aktif."><SettingsUrlField required={false} label="Instagram" hint="Profil Instagram Careerhub." value={values.careerhub_instagram_url} onChange={(value) => update('careerhub_instagram_url', value)} /><SettingsUrlField required={false} label="Threads" hint="Profil Threads Careerhub." value={values.careerhub_threads_url} onChange={(value) => update('careerhub_threads_url', value)} /><SettingsUrlField required={false} label="Telegram Channel" hint="Channel Telegram Careerhub." value={values.careerhub_telegram_url} onChange={(value) => update('careerhub_telegram_url', value)} /><SettingsUrlField required={false} label="WhatsApp Channel" hint="Channel atau komunitas WhatsApp Careerhub." value={values.careerhub_whatsapp_url} onChange={(value) => update('careerhub_whatsapp_url', value)} /></CommunitySettingsGroup>
        </div>}
        <div className="flex flex-col-reverse gap-3 border-t border-[#dedad2] pt-5 sm:flex-row sm:items-center sm:justify-between"><p className="text-[10px] leading-5 text-[#918d84]">Terakhir diperbarui {formatRelativeDate(settings.updated_at)}</p><button disabled={saving || loading} className="focus-ring inline-flex items-center justify-center gap-2 rounded-full bg-[#18181d] px-5 py-3 text-xs font-extrabold text-white transition hover:bg-[#5962f4] disabled:opacity-50"><Save className="size-4" />{saving ? 'Menyimpan…' : 'Simpan Tautan'}</button></div>
      </form>
      <aside className="relative overflow-hidden rounded-[28px] bg-[#202026] p-6 text-white"><div className="absolute -right-14 -top-14 size-40 rounded-full border-[28px] border-[#5962f4]/50" /><div className="relative"><div className="grid size-11 place-items-center rounded-full bg-[#ffcf4a] text-[#18181d]"><Settings2 className="size-5" /></div><p className="mt-7 text-[10px] font-black uppercase tracking-[.16em] text-white/35">Cara kerjanya</p><h3 className="mt-2 text-2xl font-black leading-tight tracking-[-.04em]">Simpan sekali,<br />footer langsung ikut.</h3><ol className="mt-7 space-y-4">{['Tempel URL lengkap', 'Simpan perubahan', 'Cek portal publik'].map((item, index) => <li key={item} className="flex items-center gap-3 text-xs font-bold text-white/60"><span className="grid size-7 place-items-center rounded-full border border-white/15 text-[10px] text-[#ffcf4a]">{index + 1}</span>{item}</li>)}</ol><Link to="/" className="mt-8 inline-flex items-center gap-2 text-xs font-extrabold text-[#ffcf4a] hover:text-white">Lihat footer publik <ArrowUpRight className="size-4" /></Link></div></aside>
    </div>
  </div>
}

function siteSettingsToForm(settings: SiteSettings): SiteSettingsForm { const { id: _id, updated_at: _updatedAt, ...values } = { ...defaultSiteSettings, ...settings }; return values }
function CommunitySettingsGroup({ title, description, children }: { title: string; description: string; children: React.ReactNode }) { return <section className="rounded-2xl border border-[#dedad2] bg-white/60 p-4 sm:p-5"><div className="border-b border-[#e5e1da] pb-4"><h4 className="text-sm font-black text-[#25242a]">{title}</h4><p className="mt-1 text-[10px] leading-5 text-[#8a877f]">{description}</p></div><div className="mt-5 grid gap-5 sm:grid-cols-2">{children}</div></section> }
function SettingsUrlField({ label, hint, value, onChange, className = '', required = true }: { label: string; hint: string; value: string; onChange: (value: string) => void; className?: string; required?: boolean }) { return <label className={className}><span className="flex items-center justify-between"><span className="text-xs font-black text-[#302f35]">{label}</span><span className="text-[9px] font-bold uppercase tracking-[.12em] text-[#9a968d]">URL</span></span><span className="relative mt-2 block"><Link2 className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[#7773df]" /><input type="url" required={required} value={value} onChange={(event) => onChange(event.target.value)} placeholder="https://..." className="focus-ring w-full rounded-2xl border border-[#d6d1c8] bg-white py-3.5 pl-11 pr-4 text-xs font-semibold text-[#302f35] outline-none transition focus:border-[#5962f4]" /></span><span className="mt-1.5 block text-[10px] leading-4 text-[#918d84]">{hint}</span></label> }

function AdminMark({ dark = false }: { dark?: boolean }) { return <img src="/careerhub-logo.jpg" alt="Careerhub.indonesia" className={`size-12 rounded-full object-cover shadow-sm ${dark ? 'ring-1 ring-[#d6d1c8]' : 'ring-1 ring-white/20'}`} /> }
function SidebarButton({ icon, label, active, onClick, count }: { icon: React.ReactNode; label: string; active: boolean; onClick: () => void; count?: number }) { return <button onClick={onClick} className={`flex w-full items-center gap-3 rounded-2xl px-3.5 py-3 text-xs font-extrabold transition ${active ? 'bg-[#5962f4] text-white shadow-[0_8px_22px_rgba(89,98,244,.28)]' : 'text-white/45 hover:bg-white/5 hover:text-white'}`}><span className={`grid size-8 place-items-center rounded-xl [&>svg]:size-4 ${active ? 'bg-white/15' : 'bg-white/5'}`}>{icon}</span>{label}{count !== undefined && <span className={`ml-auto rounded-full px-2 py-0.5 text-[10px] ${active ? 'bg-[#ffcf4a] text-[#201f25]' : 'bg-white/10 text-white/55'}`}>{count}</span>}</button> }
function StatusLine({ color, label, value }: { color: string; label: string; value: number }) { return <div className="flex items-center gap-2.5"><span className={`size-2 rounded-full ${color}`} /><span className="flex-1 text-[11px] font-bold text-white/50">{label}</span><span className="text-sm font-black">{value}</span></div> }
function RecentJob({ job, onView, index }: { job: Job; onView: () => void; index: number }) { return <button onClick={onView} className="group flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition hover:bg-[#efebe3] sm:px-5"><span className="w-5 text-[10px] font-black text-[#b1ada5]">{String(index + 1).padStart(2, '0')}</span><LogoAvatar name={job.company_name} url={job.company_logo_url} size="sm" /><div className="min-w-0 flex-1"><p className="truncate text-xs font-extrabold text-[#27262c] group-hover:text-[#4c53d8]">{job.title}</p><p className="mt-1 truncate text-[10px] text-[#8a877f]">{job.company_name} · {job.location}</p></div><StatusBadge active={job.is_active} /><p className="hidden w-20 text-right text-[10px] font-semibold text-[#9c988f] sm:block">{formatRelativeDate(job.created_at)}</p><ArrowUpRight className="hidden size-4 text-[#b1ada5] transition group-hover:rotate-45 group-hover:text-[#5a61f6] sm:block" /></button> }
function RecentSkeleton() { return <div className="flex items-center gap-3 px-6 py-4"><div className="size-9 animate-pulse rounded-full bg-[#e4e0d8]" /><div className="flex-1"><div className="h-3 w-36 animate-pulse rounded bg-[#e4e0d8]" /><div className="mt-2 h-2.5 w-24 animate-pulse rounded bg-[#e4e0d8]" /></div></div> }
function StatusBadge({ active }: { active: boolean }) { return <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[9px] font-black uppercase tracking-[.08em] ${active ? 'border-[#b9e4c6] bg-[#dcf5e3] text-[#176b37]' : 'border-[#d6d1c8] bg-[#ebe7df] text-[#77736c]'}`}><span className={`size-1.5 rounded-full ${active ? 'bg-[#22a454]' : 'bg-[#8e8a82]'}`} />{active ? 'Aktif' : 'Jeda'}</span> }
function JobTable({ jobs, loading, onView, onEdit, onDelete, onToggle }: { jobs: Job[]; loading: boolean; onView: (job: Job) => void; onEdit: (job: Job) => void; onDelete: (job: Job) => void; onToggle: (job: Job) => void }) {
  if (loading) return <div className="divide-y divide-[#dedad2]">{Array.from({ length: 5 }).map((_, index) => <RecentSkeleton key={index} />)}</div>
  if (!jobs.length) return <div className="grid min-h-64 place-items-center p-8 text-center"><div><div className="mx-auto grid size-12 place-items-center rounded-full bg-[#ffcf4a] text-[#18181d]"><Search className="size-5" /></div><p className="mt-4 text-sm font-black text-[#242329]">Lowongan tidak ditemukan</p><p className="mt-1 text-xs text-[#8a877f]">Coba gunakan kata kunci atau status lain.</p></div></div>
  return <><div className="hidden overflow-x-auto md:block"><table className="w-full min-w-[940px] border-collapse text-left"><thead><tr className="border-b border-[#dedad2] bg-[#efebe3] text-[9px] font-black uppercase tracking-[.14em] text-[#77736c]"><th className="px-6 py-4">Pekerjaan</th><th className="px-4 py-4">Lokasi</th><th className="px-4 py-4">Kategori</th><th className="px-4 py-4">Tipe</th><th className="px-4 py-4">Status</th><th className="px-4 py-4">Diposting</th><th className="px-6 py-4 text-right">Aksi</th></tr></thead><tbody className="divide-y divide-[#e3dfd7]">{jobs.map((job) => <tr key={job.id} className="group transition hover:bg-[#f0ece4]"><td className="px-6 py-4"><div className="flex items-center gap-3"><LogoAvatar name={job.company_name} url={job.company_logo_url} size="sm" /><div className="min-w-0"><p className="max-w-52 truncate text-xs font-extrabold text-[#26252b] group-hover:text-[#4d54db]">{job.title}</p><p className="mt-1 max-w-52 truncate text-[10px] text-[#918d84]">{job.company_name}</p></div></div></td><td className="px-4 py-4 text-xs font-semibold text-[#656169]">{job.location}</td><td className="px-4 py-4 text-xs text-[#77736c]">{job.category}</td><td className="px-4 py-4"><span className="rounded-full border border-[#cac6ff] bg-[#e9e8ff] px-2.5 py-1 text-[9px] font-black uppercase tracking-wider text-[#4d54c8]">{job.work_type}</span></td><td className="px-4 py-4"><button onClick={() => onToggle(job)} title={job.is_active ? 'Nonaktifkan' : 'Aktifkan'}><StatusBadge active={job.is_active} /></button></td><td className="px-4 py-4 text-[10px] font-semibold text-[#8f8b83]">{formatRelativeDate(job.created_at)}</td><td className="px-6 py-4"><div className="flex justify-end gap-1"><ActionButton label="Lihat" icon={<Eye />} onClick={() => onView(job)} /><ActionButton label="Edit" icon={<FilePenLine />} onClick={() => onEdit(job)} /><ActionButton label="Hapus" danger icon={<Trash2 />} onClick={() => onDelete(job)} /></div></td></tr>)}</tbody></table></div><div className="divide-y divide-[#dedad2] md:hidden">{jobs.map((job) => <div key={job.id} className="p-4"><div className="flex items-start gap-3"><LogoAvatar name={job.company_name} url={job.company_logo_url} /><div className="min-w-0 flex-1"><p className="truncate text-sm font-extrabold text-[#26252b]">{job.title}</p><p className="mt-1 text-xs text-[#8a877f]">{job.company_name} · {job.location}</p><div className="mt-2 flex flex-wrap items-center gap-2"><StatusBadge active={job.is_active} /><span className="rounded-full bg-[#e9e8ff] px-2.5 py-1 text-[9px] font-black uppercase text-[#4d54c8]">{job.work_type}</span></div></div><button className="text-[#8a877f]"><MoreHorizontal className="size-5" /></button></div><div className="mt-4 grid grid-cols-4 gap-1.5"><button onClick={() => onView(job)} className="rounded-full bg-[#e9e8ff] py-2 text-[10px] font-extrabold text-[#4d54c8]">Lihat</button><button onClick={() => onEdit(job)} className="rounded-full bg-[#ebe7df] py-2 text-[10px] font-extrabold text-[#555159]">Edit</button><button onClick={() => onToggle(job)} className="rounded-full bg-[#ebe7df] py-2 text-[10px] font-extrabold text-[#555159]">{job.is_active ? 'Jeda' : 'Aktifkan'}</button><button onClick={() => onDelete(job)} className="rounded-full bg-[#ffe3df] py-2 text-[10px] font-extrabold text-[#bf473b]">Hapus</button></div></div>)}</div></>
}
function ActionButton({ label, icon, onClick, danger }: { label: string; icon: React.ReactNode; onClick: () => void; danger?: boolean }) { return <button onClick={onClick} title={label} aria-label={label} className={`grid size-8 place-items-center rounded-full transition [&>svg]:size-3.5 ${danger ? 'text-[#918d84] hover:bg-[#ffe3df] hover:text-[#bf473b]' : 'text-[#918d84] hover:bg-[#dedcfb] hover:text-[#4d54c8]'}`}>{icon}</button> }
