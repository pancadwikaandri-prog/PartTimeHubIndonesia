import { ArrowUpRight, Banknote, Briefcase, Building2, CalendarDays, Check, Globe2, MapPin, X } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { formatRelativeDate, getApplicationHref } from '../../lib/utils'
import type { Job } from '../../types/job'
import { LogoAvatar } from '../ui/LogoAvatar'

export function JobDetailDrawer({ job, onClose }: { job: Job | null; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    if (!job) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.setTimeout(() => closeRef.current?.focus(), 20)
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKeyDown)
    return () => { document.body.style.overflow = previousOverflow; window.removeEventListener('keydown', onKeyDown) }
  }, [job, onClose])
  if (!job) return null
  const applicationHref = getApplicationHref(job.application_method, job.application_whatsapp, job.application_email, job.application_url)
  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-labelledby="job-detail-title">
      <button className="absolute inset-0 cursor-default bg-slate-950/55" aria-label="Tutup detail lowongan" onClick={onClose} />
      <section className="animate-slide-in transform-gpu absolute inset-y-0 right-0 flex w-full max-w-[720px] flex-col bg-white shadow-xl dark:bg-[#0f182a] sm:inset-y-3 sm:right-3 sm:rounded-3xl">
        <div className="no-scrollbar flex-1 overflow-y-auto">
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white px-5 py-3.5 dark:border-white/10 dark:bg-[#0f182a] sm:px-7">
            <p className="text-xs font-extrabold uppercase tracking-[.12em] text-slate-400">Detail lowongan</p>
            <button ref={closeRef} onClick={onClose} className="focus-ring grid size-9 place-items-center rounded-xl border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-slate-900 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5 dark:hover:text-white" aria-label="Tutup"><X className="size-4" /></button>
          </div>
          <div className="px-5 pb-28 pt-7 sm:px-8 sm:pt-9">
            <div className="flex items-start gap-4 sm:gap-5">
              <LogoAvatar name={job.company_name} url={job.company_logo_url} size="lg" />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap gap-2">
                  {job.is_featured && <span className="rounded-md bg-amber-50 px-2 py-1 text-[10px] font-extrabold uppercase tracking-wider text-amber-700">Lowongan pilihan</span>}
                  {job.is_urgent && <span className="rounded-md bg-rose-50 px-2 py-1 text-[10px] font-extrabold uppercase tracking-wider text-rose-700">Butuh segera</span>}
                </div>
                <h2 id="job-detail-title" className="mt-2 text-2xl font-black leading-tight tracking-[-.035em] text-slate-900 dark:text-white sm:text-3xl">{job.title}</h2>
                <p className="mt-1.5 font-bold text-brand-700">{job.company_name}</p>
              </div>
            </div>
            <div className="mt-7 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
              <DetailMeta icon={<MapPin />} label="Lokasi" value={job.location} />
              <DetailMeta icon={<Briefcase />} label="Tipe" value={job.work_type} />
              <DetailMeta icon={<Banknote />} label="Kompensasi" value={job.salary_display || 'Kompetitif'} />
              <DetailMeta icon={<CalendarDays />} label="Diposting" value={formatRelativeDate(job.created_at)} />
            </div>
            <DetailSection title="Tentang pekerjaan"><p className="whitespace-pre-line text-[15px] leading-7 text-slate-600 dark:text-slate-300">{job.description}</p></DetailSection>
            <DetailSection title="Kualifikasi"><BulletList items={job.requirements} /></DetailSection>
            {job.responsibilities.length > 0 && <DetailSection title="Tanggung jawab"><BulletList items={job.responsibilities} /></DetailSection>}
            <DetailSection title="Tentang perusahaan">
              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5 dark:border-white/10 dark:bg-white/5">
                <div className="flex items-center gap-3"><Building2 className="size-5 text-brand-700 dark:text-brand-300" /><p className="font-extrabold text-slate-900 dark:text-white">{job.company_name}</p></div>
                <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">{job.company_description}</p>
                <p className="mt-4 flex items-center gap-2 text-sm font-semibold text-slate-500"><Globe2 className="size-4" />{job.location}, Indonesia</p>
              </div>
            </DetailSection>
          </div>
        </div>
        <div className="absolute inset-x-0 bottom-0 border-t border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-[#0f182a] sm:rounded-b-3xl sm:px-8">
          <div className="flex items-center justify-between gap-4">
            <p className="hidden max-w-[260px] text-xs leading-5 text-slate-500 sm:block">Lamaran dikirim langsung ke perusahaan. Careerhub.indonesia tidak memungut biaya.</p>
            <a href={applicationHref} target={applicationHref.startsWith('http') ? '_blank' : undefined} rel="noreferrer" className="focus-ring inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-700 px-5 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-brand-800/15 transition hover:bg-brand-800 sm:w-auto">Lamar Sekarang <ArrowUpRight className="size-4" /></a>
          </div>
        </div>
      </section>
    </div>
  )
}

function DetailMeta({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return <div className="rounded-xl border border-slate-200 p-3 dark:border-white/10"><div className="size-4 text-brand-600 dark:text-brand-300 [&>svg]:size-4">{icon}</div><p className="mt-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</p><p className="mt-1 text-xs font-extrabold leading-4 text-slate-700 dark:text-slate-200">{value}</p></div>
}
function DetailSection({ title, children }: { title: string; children: React.ReactNode }) { return <section className="mt-9"><h3 className="mb-4 text-lg font-black tracking-tight text-slate-900 dark:text-white">{title}</h3>{children}</section> }
function BulletList({ items }: { items: string[] }) { return <ul className="space-y-3">{items.map((item) => <li key={item} className="flex gap-3 text-[15px] leading-6 text-slate-600 dark:text-slate-300"><span className="mt-1 grid size-5 shrink-0 place-items-center rounded-full bg-brand-50 text-brand-700 dark:bg-brand-400/10 dark:text-brand-300"><Check className="size-3" strokeWidth={3} /></span>{item}</li>)}</ul> }
