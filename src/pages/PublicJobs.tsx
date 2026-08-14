import { ArrowRight, ArrowUpRight, BadgeCheck, BriefcaseBusiness, Building2, CheckCircle2, ChevronDown, CircleAlert, Clock3, Filter, GraduationCap, HeartHandshake, MapPin, MessageCircleMore, Moon, MousePointer2, Search, ShieldCheck, SlidersHorizontal, Sparkles, Sun, UsersRound, WalletCards, X, Zap } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { FaInstagram, FaTelegram, FaThreads, FaWhatsapp } from 'react-icons/fa6'
import { Link } from 'react-router-dom'
import { JobCard } from '../components/jobs/JobCard'
import { JobDetailDrawer } from '../components/jobs/JobDetailDrawer'
import { JobSkeleton } from '../components/jobs/JobSkeleton'
import { PosterCarousel } from '../components/posters/PosterCarousel'
import { Brand } from '../components/ui/Brand'
import { listPublicJobs } from '../services/jobs'
import { listPublicPosterSlides } from '../services/posterSlides'
import { getSiteSettings } from '../services/siteSettings'
import type { Job, JobFilters } from '../types/job'
import type { PosterSlide } from '../types/posterSlide'
import { defaultSiteSettings } from '../types/siteSettings'
import { filterJobs } from '../utils/jobFilters'

const initialFilters: JobFilters = { query: '', location: '', category: '', workType: '', latestOnly: false }

export function PublicJobs() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filters, setFilters] = useState<JobFilters>(() => ({ ...initialFilters, workType: new URLSearchParams(window.location.search).get('workType') || '' }))
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const [posterSlides, setPosterSlides] = useState<PosterSlide[]>([])
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
  const [siteSettings, setSiteSettings] = useState(defaultSiteSettings)
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('careerhub-theme') === 'dark' || (!localStorage.getItem('careerhub-theme') && window.matchMedia('(prefers-color-scheme: dark)').matches))

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode)
    localStorage.setItem('careerhub-theme', darkMode ? 'dark' : 'light')
  }, [darkMode])

  const loadJobs = useCallback(async () => {
    setLoading(true); setError('')
    try { setJobs(await listPublicJobs()) }
    catch { setError('Lowongan belum dapat dimuat. Periksa koneksi lalu coba kembali.') }
    finally { setLoading(false) }
  }, [])
  useEffect(() => { void loadJobs() }, [loadJobs])
  useEffect(() => { void getSiteSettings().then(setSiteSettings).catch(() => setSiteSettings(defaultSiteSettings)) }, [])
  useEffect(() => { void listPublicPosterSlides().then(setPosterSlides).catch(() => setPosterSlides([])) }, [])

  const visibleJobs = useMemo(() => filterJobs(jobs, filters), [jobs, filters])
  const locations = useMemo(() => [...new Set(jobs.map((job) => job.location))].sort(), [jobs])
  const categories = useMemo(() => [...new Set(jobs.map((job) => job.category))].sort(), [jobs])
  const companyCount = new Set(jobs.map((job) => job.company_name)).size
  const cityCount = new Set(jobs.map((job) => job.location)).size
  const activeFilterCount = [filters.location, filters.category, filters.workType, filters.latestOnly].filter(Boolean).length
  const updateFilter = <K extends keyof JobFilters>(key: K, value: JobFilters[K]) => setFilters((current) => ({ ...current, [key]: value }))

  return (
    <div id="top" className="min-h-screen bg-[#f7f9f8] transition-colors duration-300 dark:bg-[#0a1020] dark:text-slate-100">
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl transition-colors dark:border-white/10 dark:bg-[#0a1020]/90">
        <div className="mx-auto flex h-[70px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Brand />
          <nav className="hidden items-center gap-7 md:flex" aria-label="Navigasi utama">
            <a href="#lowongan" className="focus-ring rounded text-sm font-bold text-slate-700 hover:text-brand-700 dark:text-slate-200 dark:hover:text-brand-300">Lowongan</a>
            <Link to="/full-time" className="focus-ring rounded text-sm font-bold text-slate-500 hover:text-brand-700 dark:text-slate-400 dark:hover:text-brand-300">Full-Time</Link>
            <a href="#cara-kerja" className="focus-ring rounded text-sm font-bold text-slate-500 hover:text-brand-700 dark:text-slate-400 dark:hover:text-brand-300">Cara kerja</a>
            <a href="#tentang" className="focus-ring rounded text-sm font-bold text-slate-500 hover:text-brand-700 dark:text-slate-400 dark:hover:text-brand-300">Tentang kami</a>
          </nav>
          <div className="flex items-center gap-2">
            <button onClick={() => setDarkMode((value) => !value)} className="focus-ring grid size-10 place-items-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:border-brand-300 hover:text-brand-700 dark:border-white/10 dark:bg-white/5 dark:text-amber-300 dark:hover:bg-white/10" aria-label={darkMode ? 'Gunakan mode terang' : 'Gunakan mode malam'} title={darkMode ? 'Mode terang' : 'Mode malam'}>{darkMode ? <Sun className="size-[18px]" /> : <Moon className="size-[18px]" />}</button>
            <a href="#lowongan" className="focus-ring inline-flex items-center gap-2 rounded-xl bg-slate-900 px-3.5 py-2.5 text-xs font-extrabold text-white transition hover:bg-brand-800 dark:bg-brand-500 dark:text-brand-950 dark:hover:bg-brand-400 sm:px-4"><span className="sm:hidden">Cari</span><span className="hidden sm:inline">Lihat Lowongan</span><ArrowRight className="size-3.5" /></a>
          </div>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden border-b border-slate-200/70 bg-white transition-colors dark:border-white/10 dark:bg-[#0a1020]">
          <div className="pointer-events-none absolute left-1/2 top-0 h-[420px] w-[900px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(178,237,219,.48),transparent_65%)]" />
          <div className="relative mx-auto max-w-7xl px-4 pb-10 pt-12 sm:px-6 sm:pb-14 sm:pt-16 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-[.1em] text-brand-800"><Sparkles className="size-3.5" /> Peluang baru setiap minggu</div>
              <h1 className="mt-5 text-[38px] font-black leading-[1.08] tracking-[-.045em] text-slate-950 sm:text-5xl lg:text-[58px] dark:text-white">Cari kerja part-time<br className="hidden sm:block" /> jadi <span className="text-brand-700 dark:text-brand-300">lebih mudah.</span></h1>
              <p className="mx-auto mt-5 max-w-2xl text-[15px] leading-7 text-slate-500 sm:text-base dark:text-slate-400">Temukan peluang kerja fleksibel dari berbagai perusahaan di Indonesia dan hubungi perusahaan secara langsung.</p>
            </div>

            <form className="mx-auto mt-8 flex max-w-4xl flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-[0_22px_55px_rgba(15,23,42,.11)] sm:flex-row dark:border-white/10 dark:bg-[#121a2c] dark:shadow-black/30" onSubmit={(event) => { event.preventDefault(); document.querySelector('#lowongan')?.scrollIntoView() }}>
              <label className="flex min-w-0 flex-1 items-center gap-3 rounded-xl px-3.5 py-2.5 transition focus-within:bg-slate-50 dark:focus-within:bg-white/5">
                <Search className="size-5 shrink-0 text-brand-700" />
                <span className="sr-only">Cari posisi, perusahaan, atau kota</span>
                <input value={filters.query} onChange={(event) => updateFilter('query', event.target.value)} className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-slate-800 outline-none placeholder:font-medium placeholder:text-slate-400 dark:text-slate-100 dark:placeholder:text-slate-500" placeholder="Posisi, perusahaan, atau kota" />
                {filters.query && <button type="button" onClick={() => updateFilter('query', '')} className="focus-ring rounded text-slate-400 hover:text-slate-700" aria-label="Hapus pencarian"><X className="size-4" /></button>}
              </label>
              <div className="hidden w-px bg-slate-200 dark:bg-white/10 sm:block" />
              <label className="relative flex items-center gap-3 rounded-xl px-3.5 py-2.5 transition focus-within:bg-slate-50 dark:focus-within:bg-white/5 sm:w-[220px]">
                <MapPin className="size-5 shrink-0 text-brand-700" /><span className="sr-only">Pilih lokasi</span>
                <select value={filters.location} onChange={(event) => updateFilter('location', event.target.value)} className="w-full appearance-none bg-transparent pr-5 text-sm font-semibold text-slate-700 outline-none dark:text-slate-200"><option value="">Semua lokasi</option>{locations.map((location) => <option key={location}>{location}</option>)}</select><ChevronDown className="pointer-events-none absolute right-3.5 size-4 text-slate-400" />
              </label>
              <button className="focus-ring inline-flex items-center justify-center gap-2 rounded-xl bg-brand-700 px-6 py-3 text-sm font-extrabold text-white transition hover:bg-brand-800">Cari Lowongan <ArrowRight className="size-4" /></button>
            </form>

            <div className="mx-auto mt-8 grid max-w-2xl grid-cols-3 divide-x divide-slate-200 dark:divide-white/10">
              <Stat value={jobs.length} label="Lowongan aktif" />
              <Stat value={companyCount} label="Perusahaan" />
              <Stat value={cityCount} label="Kota & area" />
            </div>
            <div className="mx-auto mt-8 flex max-w-2xl flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[11px] font-bold text-slate-500 dark:text-slate-400 sm:text-xs">
              <span className="inline-flex items-center gap-1.5"><BadgeCheck className="size-4 text-brand-600 dark:text-brand-300" /> Gratis untuk pencari kerja</span>
              <span className="inline-flex items-center gap-1.5"><MessageCircleMore className="size-4 text-brand-600 dark:text-brand-300" /> Hubungi perusahaan langsung</span>
              <span className="inline-flex items-center gap-1.5"><Zap className="size-4 text-brand-600 dark:text-brand-300" /> Proses lebih ringkas</span>
            </div>
          </div>
        </section>

        <PosterCarousel slides={posterSlides} />

        <section id="lowongan" className="mx-auto max-w-7xl scroll-mt-24 px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <div className="flex items-end justify-between gap-4">
            <div><p className="text-xs font-extrabold uppercase tracking-[.13em] text-brand-700 dark:text-brand-300">Lowongan terbaru</p><h2 className="mt-2 text-2xl font-black tracking-[-.035em] text-slate-900 sm:text-3xl dark:text-white">Pilih peluang yang cocok untukmu</h2></div>
            <button onClick={() => setMobileFiltersOpen(true)} className="focus-ring relative inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-extrabold text-slate-700 shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-slate-200 lg:hidden"><Filter className="size-4" /> Filter {activeFilterCount > 0 && <span className="grid size-5 place-items-center rounded-full bg-brand-700 text-[10px] text-white">{activeFilterCount}</span>}</button>
          </div>

          <div className="mt-7 grid gap-7 lg:grid-cols-[230px_1fr]">
            <aside className="hidden self-start rounded-2xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-[#121a2c] lg:sticky lg:top-24 lg:block">
              <div className="flex items-center gap-2 text-sm font-extrabold text-slate-900 dark:text-white"><SlidersHorizontal className="size-4 text-brand-700 dark:text-brand-300" /> Filter lowongan</div>
              <FilterFields filters={filters} locations={locations} categories={categories} onUpdate={updateFilter} />
              {activeFilterCount > 0 && <button onClick={() => setFilters((current) => ({ ...initialFilters, query: current.query }))} className="focus-ring mt-5 w-full rounded-xl border border-slate-200 py-2.5 text-xs font-extrabold text-slate-600 transition hover:bg-slate-50 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5">Reset filter</button>}
            </aside>
            <div>
              <div className="mb-4 flex items-center justify-between"><p className="text-sm text-slate-500 dark:text-slate-400"><strong className="font-extrabold text-slate-800 dark:text-white">{visibleJobs.length}</strong> lowongan ditemukan</p><span className="hidden items-center gap-1.5 text-xs font-semibold text-slate-400 sm:flex"><ShieldCheck className="size-4 text-brand-600 dark:text-brand-300" /> Hubungi perusahaan langsung</span></div>
              {loading ? <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{Array.from({ length: 6 }).map((_, index) => <JobSkeleton key={index} />)}</div>
                : error ? <StateCard icon={<CircleAlert />} title="Terjadi kendala" description={error} action={<button onClick={() => void loadJobs()} className="rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-extrabold text-white">Coba lagi</button>} />
                : visibleJobs.length === 0 ? <StateCard icon={<Search />} title="Tidak ada lowongan yang ditemukan" description="Coba ubah kata kunci atau filter pencarian Anda." action={<button onClick={() => setFilters(initialFilters)} className="rounded-xl bg-brand-700 px-4 py-2.5 text-xs font-extrabold text-white">Hapus semua filter</button>} />
                : <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{visibleJobs.map((job, index) => <JobCard key={job.id} job={job} index={index} onOpen={setSelectedJob} />)}</div>}
            </div>
          </div>
        </section>

        <section className="overflow-hidden border-y border-slate-200 bg-white transition-colors dark:border-white/10 dark:bg-[#0d1526]">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
            <Reveal>
              <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
                <div className="max-w-2xl"><p className="text-xs font-extrabold uppercase tracking-[.13em] text-brand-700 dark:text-brand-300">Pilih ritme kerjamu</p><h2 className="mt-3 text-3xl font-black tracking-[-.04em] text-slate-900 sm:text-4xl dark:text-white">Peluang yang mengikuti hidupmu.</h2><p className="mt-4 max-w-xl text-sm leading-7 text-slate-500 dark:text-slate-400">Cari pengalaman pertama, penghasilan tambahan, atau proyek yang bisa dikerjakan dari mana saja.</p></div>
                <a href="#lowongan" className="focus-ring inline-flex w-fit items-center gap-2 rounded-xl text-sm font-extrabold text-brand-700 transition hover:text-brand-900 dark:text-brand-300 dark:hover:text-brand-200">Lihat semua lowongan <ArrowRight className="size-4" /></a>
              </div>
            </Reveal>
            <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              <Reveal delay={0}><WorkStyle href="/full-time" icon={<BriefcaseBusiness />} title="Full-Time" text="Bangun karier jangka panjang dengan ritme kerja yang konsisten." count={jobs.filter((job) => job.work_type === 'Full-Time').length} /></Reveal>
              <Reveal delay={60}><WorkStyle icon={<Clock3 />} title="Part-Time" text="Tambah pengalaman tanpa mengorbankan jadwal utama." count={jobs.filter((job) => job.work_type === 'Part-Time').length} onClick={() => { updateFilter('workType', 'Part-Time'); document.querySelector('#lowongan')?.scrollIntoView() }} /></Reveal>
              <Reveal delay={120}><WorkStyle icon={<WalletCards />} title="Freelance" text="Ambil proyek sesuai keahlian dan kapasitas waktumu." count={jobs.filter((job) => job.work_type === 'Freelance').length} onClick={() => { updateFilter('workType', 'Freelance'); document.querySelector('#lowongan')?.scrollIntoView() }} /></Reveal>
              <Reveal delay={180}><WorkStyle icon={<GraduationCap />} title="Internship" text="Bangun portofolio dan kenali dunia kerja lebih awal." count={jobs.filter((job) => job.work_type === 'Internship').length} onClick={() => { updateFilter('workType', 'Internship'); document.querySelector('#lowongan')?.scrollIntoView() }} /></Reveal>
              <Reveal delay={240}><WorkStyle icon={<Zap />} title="Temporary" text="Temukan pekerjaan singkat untuk momen yang tepat." count={jobs.filter((job) => job.work_type === 'Temporary').length} onClick={() => { updateFilter('workType', 'Temporary'); document.querySelector('#lowongan')?.scrollIntoView() }} /></Reveal>
            </div>
          </div>
        </section>

        <section id="cara-kerja" className="scroll-mt-20 overflow-hidden">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
            <Reveal className="text-center">
              <p className="text-xs font-extrabold uppercase tracking-[.13em] text-brand-700 dark:text-brand-300">Dari cari sampai melamar</p>
              <h2 className="mx-auto mt-3 max-w-2xl text-3xl font-black tracking-[-.04em] text-slate-900 sm:text-4xl dark:text-white">Tiga langkah. Tanpa proses yang bikin bingung.</h2>
            </Reveal>
            <div className="relative mt-11 grid gap-4 md:grid-cols-3">
              <div className="pointer-events-none absolute left-[16%] right-[16%] top-8 hidden border-t border-dashed border-brand-300/70 md:block dark:border-brand-500/30" />
              <Reveal delay={0}><StepCard number="01" icon={<Search />} title="Temukan yang pas" text="Gunakan pencarian dan filter untuk menyaring kota, kategori, serta tipe kerja." /></Reveal>
              <Reveal delay={90}><StepCard number="02" icon={<MousePointer2 />} title="Pelajari detailnya" text="Lihat deskripsi, kualifikasi, tanggung jawab, dan kompensasi dalam satu tampilan." /></Reveal>
              <Reveal delay={180}><StepCard number="03" icon={<MessageCircleMore />} title="Hubungi langsung" text="Kirim lamaran ke kanal resmi perusahaan tanpa biaya dan tanpa perantara." /></Reveal>
            </div>
          </div>
        </section>

        <section id="tentang" className="scroll-mt-20 border-y border-slate-200 bg-white transition-colors dark:border-white/10 dark:bg-[#0d1526]">
          <div className="mx-auto grid max-w-7xl gap-5 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[1.05fr_.95fr] lg:px-8">
            <Reveal className="h-full">
              <div className="relative h-full overflow-hidden rounded-[28px] bg-[#0b342e] p-7 text-white sm:p-9">
                <div className="pointer-events-none absolute -right-20 -top-20 size-72 rounded-full border-[46px] border-brand-400/10" />
                <div className="relative">
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-wider text-brand-100"><HeartHandshake className="size-4" /> Dibuat untuk langkah pertamamu</span>
                  <h2 className="mt-6 max-w-xl text-3xl font-black tracking-[-.04em] sm:text-4xl">Lebih sedikit menebak.<br />Lebih yakin melamar.</h2>
                  <p className="mt-5 max-w-lg text-sm leading-7 text-brand-100/75">Kami merapikan informasi penting agar kamu bisa membandingkan peluang dan mengambil keputusan dengan lebih tenang.</p>
                  <div className="mt-10 grid grid-cols-2 gap-3">
                    <MiniMetric value={`${jobs.length}+`} label="peluang aktif" />
                    <MiniMetric value={`${companyCount}+`} label="perusahaan" />
                  </div>
                </div>
              </div>
            </Reveal>
            <div className="grid gap-3">
              <Reveal delay={60}><Benefit icon={<CheckCircle2 />} title="Informasi yang lebih jelas" text="Detail pekerjaan dirangkum agar cepat dipindai sebelum kamu melamar." /></Reveal>
              <Reveal delay={120}><Benefit icon={<Building2 />} title="Koneksi tanpa perantara" text="Lamaran dikirim langsung melalui kanal perusahaan yang dicantumkan." /></Reveal>
              <Reveal delay={180}><Benefit icon={<BriefcaseBusiness />} title="Fleksibel untuk berbagai tujuan" text="Mulai dari part-time, freelance, temporary, sampai kesempatan internship." /></Reveal>
              <Reveal delay={240}><Benefit icon={<ShieldCheck />} title="Tetap aman saat mencari kerja" text="Jangan pernah membayar biaya rekrutmen dan selalu verifikasi identitas perusahaan." /></Reveal>
            </div>
          </div>
        </section>

        <section className="overflow-hidden">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
            <Reveal>
              <div className="relative overflow-hidden rounded-[30px] border border-brand-200 bg-brand-50 px-6 py-10 sm:px-10 lg:flex lg:items-center lg:justify-between lg:gap-10 dark:border-brand-400/20 dark:bg-brand-950/70">
                <div className="pointer-events-none absolute -bottom-24 right-16 size-64 rounded-full bg-brand-300/25 blur-3xl" />
                <div className="relative max-w-2xl">
                  <div className="flex -space-x-2"><span className="grid size-10 place-items-center rounded-full border-2 border-brand-50 bg-brand-700 text-white dark:border-brand-950"><UsersRound className="size-4" /></span><span className="grid size-10 place-items-center rounded-full border-2 border-brand-50 bg-amber-300 text-sm font-black text-amber-950 dark:border-brand-950">+</span></div>
                  <p className="mt-5 text-xs font-extrabold uppercase tracking-[.13em] text-brand-700 dark:text-brand-300">Untuk perusahaan & komunitas</p>
                  <h2 className="mt-2 text-3xl font-black tracking-[-.04em] text-slate-900 sm:text-4xl dark:text-white">Punya peluang untuk talenta muda?</h2>
                  <p className="mt-4 text-sm leading-7 text-slate-600 dark:text-brand-100/70">Bagikan kebutuhan timmu dan jangkau kandidat yang sedang mencari pekerjaan fleksibel di Indonesia.</p>
                </div>
                <a href={siteSettings.post_job_url} target="_blank" rel="noreferrer" className="focus-ring relative mt-7 inline-flex shrink-0 items-center gap-3 rounded-2xl bg-slate-950 px-6 py-4 text-sm font-extrabold text-white shadow-xl shadow-slate-950/10 transition hover:-translate-y-0.5 hover:bg-brand-800 dark:bg-brand-400 dark:text-brand-950 dark:hover:bg-brand-300 lg:mt-0">Pasang Lowongan <ArrowUpRight className="size-4" /></a>
              </div>
            </Reveal>
          </div>
        </section>
      </main>

      <footer className="bg-[#080f2a] text-slate-300">
        <div className="mx-auto max-w-7xl px-5 py-10 sm:px-6 sm:py-12 lg:px-8">
          <div className="h-1 w-full bg-amber-400" />
          <div className="grid gap-11 py-10 text-center md:grid-cols-[1.3fr_.8fr_1fr] md:text-left">
            <div>
              <h2 className="text-2xl font-bold tracking-[-.02em] text-white">Careerhub.indonesia</h2>
              <p className="mx-auto mt-4 max-w-sm text-sm leading-7 text-slate-400 md:mx-0">Kerja fleksibel, rekrutmen cepat, peluang lokal terverifikasi.</p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[.22em] text-amber-400">Navigasi</p>
              <nav className="mt-5 flex flex-col items-center gap-3 text-xs font-semibold uppercase tracking-[.16em] text-slate-300 md:items-start" aria-label="Navigasi footer"><a href="#top" className="transition hover:text-amber-300">Home</a><a href="#lowongan" className="transition hover:text-amber-300">Vacancies</a><a href={siteSettings.post_job_url} target="_blank" rel="noreferrer" className="transition hover:text-amber-300">Post a Job</a><a href="#tentang" className="transition hover:text-amber-300">About</a></nav>
            </div>
            <div>
              <p className="text-xs font-bold tracking-[.18em] text-amber-400">Hubungi Kami</p>
              <a href="mailto:official@parttimehubindonesia.com" className="mt-5 block text-sm text-white transition hover:text-amber-300">official@parttimehubindonesia.com</a>
              <p className="mt-3 text-sm text-slate-300">Jakarta & Seluruh Indonesia</p>
            </div>
          </div>
          <div className="grid gap-4 border-t border-white/15 py-8 md:grid-cols-2">
            <CommunityColumn brand="Parttimehub Indonesia" description="Komunitas peluang kerja fleksibel dan part-time di Indonesia." tone="amber" links={[{ label: 'Instagram', href: siteSettings.instagram_url, icon: <FaInstagram /> }, { label: 'Threads', href: siteSettings.threads_url, icon: <FaThreads /> }, { label: 'Telegram Channel', href: siteSettings.telegram_url, icon: <FaTelegram /> }, { label: 'WhatsApp Channel', href: siteSettings.whatsapp_url, icon: <FaWhatsapp /> }]} />
            <CommunityColumn brand="Careerhub Indonesia" description="Komunitas pengembangan karier dan kesempatan kerja jangka panjang." tone="purple" links={[{ label: 'Instagram', href: siteSettings.careerhub_instagram_url, icon: <FaInstagram /> }, { label: 'Threads', href: siteSettings.careerhub_threads_url, icon: <FaThreads /> }, { label: 'Telegram Channel', href: siteSettings.careerhub_telegram_url, icon: <FaTelegram /> }, { label: 'WhatsApp Channel', href: siteSettings.careerhub_whatsapp_url, icon: <FaWhatsapp /> }]} />
          </div>
          <div className="border-t border-white/25 pt-7"><div className="flex flex-col gap-5 text-center md:flex-row md:items-end md:justify-between md:text-left"><p className="max-w-xl text-xs leading-6 text-slate-400">© {new Date().getFullYear()} Careerhub.indonesia — Menghubungkan mahasiswa dan pekerja lepas Indonesia dengan lowongan lokal terpercaya.</p><p className="text-[10px] font-bold uppercase tracking-[.24em] text-amber-400">Kerja fleksibel & rekrutmen cepat</p></div></div>
        </div>
      </footer>
      <JobDetailDrawer job={selectedJob} onClose={() => setSelectedJob(null)} />

      {mobileFiltersOpen && <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Filter lowongan"><button className="absolute inset-0 bg-slate-950/40" onClick={() => setMobileFiltersOpen(false)} aria-label="Tutup filter" /><div className="absolute inset-x-0 bottom-0 rounded-t-3xl bg-white p-5 shadow-2xl dark:bg-[#121a2c]"><div className="mx-auto mb-4 h-1 w-10 rounded-full bg-slate-200 dark:bg-white/15" /><div className="flex items-center justify-between"><h2 className="text-lg font-black text-slate-900 dark:text-white">Filter lowongan</h2><button onClick={() => setMobileFiltersOpen(false)} className="grid size-9 place-items-center rounded-xl border border-slate-200 dark:border-white/10"><X className="size-4" /></button></div><FilterFields filters={filters} locations={locations} categories={categories} onUpdate={updateFilter} /><div className="mt-6 flex gap-2"><button onClick={() => setFilters((current) => ({ ...initialFilters, query: current.query }))} className="flex-1 rounded-xl border border-slate-200 py-3 text-sm font-extrabold text-slate-600 dark:border-white/10 dark:text-slate-300">Reset</button><button onClick={() => setMobileFiltersOpen(false)} className="flex-[1.5] rounded-xl bg-brand-700 py-3 text-sm font-extrabold text-white">Lihat {visibleJobs.length} Lowongan</button></div></div></div>}
    </div>
  )
}

function Stat({ value, label }: { value: number; label: string }) { return <div className="px-2 text-center"><p className="text-xl font-black tracking-tight text-slate-900 dark:text-white sm:text-2xl">{value}+</p><p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 sm:text-xs">{label}</p></div> }
function FilterFields({ filters, locations, categories, onUpdate }: { filters: JobFilters; locations: string[]; categories: string[]; onUpdate: <K extends keyof JobFilters>(key: K, value: JobFilters[K]) => void }) {
  return <div className="mt-5 space-y-4"><FilterSelect label="Kota / Area" value={filters.location} options={locations} onChange={(value) => onUpdate('location', value)} /><FilterSelect label="Kategori" value={filters.category} options={categories} onChange={(value) => onUpdate('category', value)} /><FilterSelect label="Tipe kerja" value={filters.workType} options={['Full-Time', 'Part-Time', 'Freelance', 'Temporary', 'Internship']} onChange={(value) => onUpdate('workType', value)} /><label className="flex cursor-pointer items-center justify-between rounded-xl bg-slate-50 p-3 text-xs font-bold text-slate-700 dark:bg-white/5 dark:text-slate-300"><span>Tampilkan terbaru</span><input type="checkbox" checked={filters.latestOnly} onChange={(event) => onUpdate('latestOnly', event.target.checked)} className="size-4 accent-brand-700" /></label></div>
}
function FilterSelect({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (value: string) => void }) { return <label className="block"><span className="mb-1.5 block text-[11px] font-extrabold uppercase tracking-wider text-slate-400">{label}</span><span className="relative block"><select value={value} onChange={(event) => onChange(event.target.value)} className="focus-ring w-full appearance-none rounded-xl border border-slate-200 bg-white px-3 py-2.5 pr-8 text-xs font-bold text-slate-700 outline-none dark:border-white/10 dark:bg-[#182136] dark:text-slate-200"><option value="">Semua</option>{options.map((option) => <option key={option}>{option}</option>)}</select><ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-3.5 -translate-y-1/2 text-slate-400" /></span></label> }
function StateCard({ icon, title, description, action }: { icon: React.ReactNode; title: string; description: string; action: React.ReactNode }) { return <div className="grid min-h-[390px] place-items-center rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center dark:border-white/15 dark:bg-[#121a2c]"><div><div className="mx-auto grid size-12 place-items-center rounded-2xl bg-slate-100 text-slate-500 dark:bg-white/5 dark:text-slate-400 [&>svg]:size-5">{icon}</div><h3 className="mt-4 font-black text-slate-900 dark:text-white">{title}</h3><p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500 dark:text-slate-400">{description}</p><div className="mt-5">{action}</div></div></div> }
function Reveal({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const elementRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const element = elementRef.current
    if (!element) return
    if (!('IntersectionObserver' in window)) { setIsVisible(true); return }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setIsVisible(true); observer.unobserve(element) }
    }, { rootMargin: '0px 0px -48px', threshold: 0.12 })
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  return <div ref={elementRef} className={`reveal-on-scroll ${isVisible ? 'is-visible' : ''} ${className}`} style={{ transitionDelay: `${delay}ms` }}>{children}</div>
}
function WorkStyle({ icon, title, text, count, onClick, href }: { icon: React.ReactNode; title: string; text: string; count: number; onClick?: () => void; href?: string }) { const className = "focus-ring group flex h-full w-full flex-col rounded-[22px] border border-slate-200 bg-slate-50 p-5 text-left transition duration-300 hover:-translate-y-1 hover:border-brand-300 hover:bg-white hover:shadow-[0_18px_40px_rgba(15,23,42,.08)] dark:border-white/10 dark:bg-white/[.035] dark:hover:border-brand-500/50 dark:hover:bg-white/[.06]"; const content = <><span className="grid size-11 place-items-center rounded-2xl bg-white text-brand-700 shadow-sm transition group-hover:bg-brand-700 group-hover:text-white dark:bg-white/10 dark:text-brand-300 [&>svg]:size-5">{icon}</span><span className="mt-5 flex w-full items-center justify-between gap-3"><strong className="text-base font-black text-slate-900 dark:text-white">{title}</strong><span className="text-xs font-extrabold text-brand-700 dark:text-brand-300">{count} peluang</span></span><span className="mt-2 text-xs leading-5 text-slate-500 dark:text-slate-400">{text}</span><span className="mt-5 inline-flex items-center gap-1.5 text-xs font-extrabold text-slate-700 dark:text-slate-200">{href ? 'Pelajari' : 'Jelajahi'} <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" /></span></>; return href ? <Link to={href} className={className}>{content}</Link> : <button onClick={onClick} className={className}>{content}</button> }
function StepCard({ number, icon, title, text }: { number: string; icon: React.ReactNode; title: string; text: string }) { return <article className="relative h-full rounded-[24px] border border-slate-200 bg-white p-6 shadow-[0_12px_35px_rgba(15,23,42,.045)] dark:border-white/10 dark:bg-[#121a2c] dark:shadow-black/10"><div className="relative z-10 flex items-center justify-between"><span className="grid size-14 place-items-center rounded-2xl bg-brand-100 text-brand-800 dark:bg-brand-400/10 dark:text-brand-300 [&>svg]:size-6">{icon}</span><span className="text-4xl font-black tracking-[-.06em] text-slate-100 dark:text-white/[.06]">{number}</span></div><h3 className="mt-7 text-lg font-black tracking-tight text-slate-900 dark:text-white">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">{text}</p></article> }
function MiniMetric({ value, label }: { value: string; label: string }) { return <div className="rounded-2xl border border-white/10 bg-white/[.07] p-4"><p className="text-2xl font-black">{value}</p><p className="mt-1 text-[11px] font-bold uppercase tracking-wider text-brand-100/60">{label}</p></div> }
function Benefit({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) { return <div className="flex h-full gap-4 rounded-[22px] border border-slate-200 bg-slate-50 p-5 transition duration-300 hover:border-brand-200 hover:bg-brand-50/40 dark:border-white/10 dark:bg-white/[.035] dark:hover:border-brand-500/30 dark:hover:bg-brand-400/[.04]"><div className="grid size-11 shrink-0 place-items-center rounded-2xl bg-white text-brand-700 shadow-sm dark:bg-white/10 dark:text-brand-300 [&>svg]:size-5">{icon}</div><div><p className="text-sm font-extrabold text-slate-900 dark:text-white">{title}</p><p className="mt-1.5 text-xs leading-5 text-slate-500 dark:text-slate-400">{text}</p></div></div> }
function CommunityColumn({ brand, description, tone, links }: { brand: string; description: string; tone: 'amber' | 'purple'; links: Array<{ label: string; href: string; icon: React.ReactNode }> }) { const accent = tone === 'amber' ? 'text-amber-300' : 'text-fuchsia-300'; const hover = tone === 'amber' ? 'hover:border-amber-300/60 hover:bg-amber-300/10' : 'hover:border-fuchsia-300/60 hover:bg-fuchsia-300/10'; return <section className="relative overflow-hidden rounded-[24px] border border-white/10 bg-white/[.045] p-5 text-left sm:p-6"><div className={`absolute -right-12 -top-14 size-32 rounded-full border-[22px] ${tone === 'amber' ? 'border-amber-300/10' : 'border-fuchsia-300/10'}`} /><div className="relative"><p className={`text-[10px] font-black uppercase tracking-[.18em] ${accent}`}>Community</p><h3 className="mt-2 text-xl font-black tracking-[-.03em] text-white">{brand}</h3><p className="mt-2 max-w-md text-xs leading-5 text-slate-400">{description}</p><div className="mt-5 grid gap-2 sm:grid-cols-2">{links.map((link) => link.href ? <a key={link.label} href={link.href} target="_blank" rel="noreferrer" className={`focus-ring group flex items-center gap-3 rounded-xl border border-white/10 bg-white/[.035] px-3.5 py-3 text-xs font-extrabold text-slate-200 transition duration-300 hover:-translate-y-0.5 ${hover}`}><span className={`text-lg ${accent}`}>{link.icon}</span><span>{link.label}</span><ArrowUpRight className="ml-auto size-3.5 text-white/30 transition group-hover:rotate-45 group-hover:text-white" /></a> : <span key={link.label} className="flex items-center gap-3 rounded-xl border border-dashed border-white/10 px-3.5 py-3 text-xs font-bold text-slate-600"><span className="text-lg">{link.icon}</span><span>{link.label}</span><span className="ml-auto text-[8px] uppercase tracking-wider">Belum diatur</span></span>)}</div></div></section> }
