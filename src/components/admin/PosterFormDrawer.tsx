import { ImagePlus, Loader2, Upload, X } from 'lucide-react'
import { useEffect, useState, type FormEvent } from 'react'
import { uploadPosterImage } from '../../services/posterSlides'
import { emptyPosterSlide, type PosterSlide, type PosterSlideFormValues } from '../../types/posterSlide'
import { useToast } from '../ui/toast'

export function PosterFormDrawer({ open, slide, saving, onClose, onSave }: { open: boolean; slide: PosterSlide | null; saving: boolean; onClose: () => void; onSave: (values: PosterSlideFormValues) => Promise<void> }) {
  const [values, setValues] = useState<PosterSlideFormValues>(emptyPosterSlide)
  const [uploading, setUploading] = useState(false)
  const { toast } = useToast()

  useEffect(() => { if (open) setValues(slide ? stripSlide(slide) : emptyPosterSlide) }, [open, slide])
  useEffect(() => {
    if (!open) return
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const listener = (event: KeyboardEvent) => { if (event.key === 'Escape' && !saving) onClose() }
    window.addEventListener('keydown', listener)
    return () => { document.body.style.overflow = overflow; window.removeEventListener('keydown', listener) }
  }, [open, onClose, saving])

  if (!open) return null
  const set = <K extends keyof PosterSlideFormValues>(key: K, value: PosterSlideFormValues[K]) => setValues((current) => ({ ...current, [key]: value }))
  const upload = async (file?: File) => {
    if (!file) return
    if (file.size > 5_000_000) { toast('Ukuran poster maksimal 5 MB.', 'error'); return }
    setUploading(true)
    try { set('image_url', await uploadPosterImage(file)); toast('Gambar poster berhasil ditambahkan.') }
    catch (cause) { toast(cause instanceof Error ? cause.message : 'Gambar poster gagal diunggah.', 'error') }
    finally { setUploading(false) }
  }
  const submit = async (event: FormEvent) => {
    event.preventDefault()
    const ctaLabel = values.cta_label?.trim() || null
    const ctaUrl = values.cta_url?.trim() || null
    if (Boolean(ctaLabel) !== Boolean(ctaUrl)) { toast('Label dan tautan tombol harus diisi bersama.', 'error'); return }
    await onSave({ ...values, title: values.title.trim(), subtitle: values.subtitle.trim(), alt_text: values.alt_text.trim(), cta_label: ctaLabel, cta_url: ctaUrl })
  }

  return <div className="fixed inset-0 z-[60]" role="dialog" aria-modal="true" aria-labelledby="poster-form-title"><button className="absolute inset-0 bg-slate-950/45 backdrop-blur-[2px]" onClick={onClose} aria-label="Tutup formulir" /><section className="animate-slide-in absolute inset-y-0 right-0 flex w-full max-w-3xl flex-col bg-[#f8faf9] shadow-2xl sm:inset-y-3 sm:right-3 sm:rounded-3xl">
    <header className="flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4 sm:rounded-t-3xl sm:px-7"><div><p className="text-[10px] font-extrabold uppercase tracking-wider text-[#71318f]">Manajemen Poster</p><h2 id="poster-form-title" className="mt-1 text-xl font-black tracking-tight text-slate-900">{slide ? 'Edit Poster' : 'Tambah Poster'}</h2></div><button onClick={onClose} disabled={saving} className="grid size-9 place-items-center rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50"><X className="size-4" /></button></header>
    <form onSubmit={submit} className="no-scrollbar flex-1 overflow-y-auto px-5 py-6 sm:px-7">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6"><h3 className="text-sm font-black text-slate-900">Gambar poster</h3><p className="mt-1 text-xs leading-5 text-slate-400">Gunakan gambar portrait rasio 4:5, idealnya 1080 × 1350 piksel.</p>
        <div className="mt-5 grid gap-5 sm:grid-cols-[180px_1fr]"><div className="aspect-[4/5] overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-[#102a63] to-[#963eb1]">{values.image_url ? <img src={values.image_url} alt="Pratinjau poster" className="size-full object-cover" /> : <div className="grid size-full place-items-center p-5 text-center text-xs font-bold text-white/65"><ImagePlus className="mx-auto mb-2 size-7" />Pratinjau poster</div>}</div><div><Field label="URL gambar" type="url" value={values.image_url || ''} onChange={(value) => set('image_url', value || null)} placeholder="https://..." /><label className="mt-3 flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-3 text-xs font-bold text-slate-600 transition hover:border-[#9b55b7] hover:bg-[#f8effb]"><span className="grid size-9 place-items-center rounded-lg bg-white text-[#71318f] shadow-sm">{uploading ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}</span><span><span className="block text-slate-800">Unggah gambar poster</span><span className="mt-0.5 block font-medium text-slate-400">PNG, JPG, atau WebP · Maks. 5 MB</span></span><input type="file" className="hidden" accept="image/png,image/jpeg,image/webp" disabled={uploading} onChange={(event) => void upload(event.target.files?.[0])} /></label><div className="mt-4"><Field label="Teks alternatif" required value={values.alt_text} onChange={(value) => set('alt_text', value)} placeholder="Jelaskan isi poster secara singkat" /></div></div></div>
      </section>

      <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6"><h3 className="text-sm font-black text-slate-900">Konten slide</h3><p className="mt-1 text-xs leading-5 text-slate-400">Teks akan tampil di bagian bawah poster.</p><div className="mt-5 space-y-4"><Field label="Judul" required value={values.title} onChange={(value) => set('title', value)} placeholder="Judul utama poster" /><TextArea label="Deskripsi" value={values.subtitle} onChange={(value) => set('subtitle', value)} placeholder="Deskripsi singkat poster" /><div className="grid gap-4 sm:grid-cols-2"><Field label="Label tombol" value={values.cta_label || ''} onChange={(value) => set('cta_label', value || null)} placeholder="Lihat Lowongan" /><Field label="Tautan tombol" value={values.cta_url || ''} onChange={(value) => set('cta_url', value || null)} placeholder="#lowongan atau https://..." /></div></div></section>

      <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6"><h3 className="text-sm font-black text-slate-900">Publikasi</h3><div className="mt-5 grid gap-4 sm:grid-cols-2"><label><span className="mb-1.5 block text-xs font-extrabold text-slate-600">Urutan</span><input type="number" min="0" value={values.sort_order} onChange={(event) => set('sort_order', Math.max(0, Number(event.target.value)))} className={fieldClass} /></label><label className="flex cursor-pointer items-center justify-between rounded-xl border border-slate-200 p-3.5"><span><span className="block text-xs font-extrabold text-slate-800">Aktif</span><span className="mt-1 block text-[10px] text-slate-400">Tampilkan di portal publik</span></span><input type="checkbox" checked={values.is_active} onChange={(event) => set('is_active', event.target.checked)} className="size-4 accent-[#71318f]" /></label></div></section>
      <div className="h-20" />
    </form>
    <footer className="absolute inset-x-0 bottom-0 flex items-center justify-end gap-2 border-t border-slate-200 bg-white/95 px-5 py-4 backdrop-blur sm:rounded-b-3xl sm:px-7"><button type="button" onClick={onClose} disabled={saving} className="rounded-xl border border-slate-200 px-5 py-3 text-xs font-extrabold text-slate-600 hover:bg-slate-50">Batal</button><button type="submit" onClick={() => document.querySelector<HTMLFormElement>('[aria-labelledby="poster-form-title"] form')?.requestSubmit()} disabled={saving || uploading} className="inline-flex min-w-36 items-center justify-center gap-2 rounded-xl bg-[#71318f] px-5 py-3 text-xs font-extrabold text-white hover:bg-[#5d2877] disabled:opacity-60">{saving && <Loader2 className="size-4 animate-spin" />}{saving ? 'Menyimpan…' : slide ? 'Simpan Perubahan' : 'Tambahkan Poster'}</button></footer>
  </section></div>
}

function stripSlide(slide: PosterSlide): PosterSlideFormValues { const { id: _id, created_at: _created, updated_at: _updated, ...values } = slide; return values }
const fieldClass = 'focus-ring w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm font-semibold text-slate-800 outline-none transition placeholder:font-normal placeholder:text-slate-400 focus:border-[#9b55b7]'
function Field({ label, value, onChange, placeholder, required, type = 'text' }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string; required?: boolean; type?: string }) { return <label className="block"><span className="mb-1.5 block text-xs font-extrabold text-slate-600">{label}{required && <span className="text-red-500"> *</span>}</span><input className={fieldClass} type={type} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} required={required} /></label> }
function TextArea({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string }) { return <label className="block"><span className="mb-1.5 block text-xs font-extrabold text-slate-600">{label}</span><textarea className={`${fieldClass} resize-y leading-6`} rows={3} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} /></label> }
