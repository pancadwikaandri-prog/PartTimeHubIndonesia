import { samplePosterSlides } from '../data/samplePosterSlides'
import { demoModeEnabled, supabase } from '../lib/supabase'
import type { PosterSlide, PosterSlideFormValues } from '../types/posterSlide'

let localPosterSlides = [...samplePosterSlides]

export async function listPublicPosterSlides(): Promise<PosterSlide[]> {
  if (!supabase) return localPosterSlides.filter((slide) => slide.is_active).sort(byOrder)
  const { data, error } = await supabase.from('poster_slides').select('*').eq('is_active', true).order('sort_order').order('created_at')
  if (error) throw error
  if (!data.length && demoModeEnabled) return localPosterSlides.filter((slide) => slide.is_active).sort(byOrder)
  return data as PosterSlide[]
}

export async function listAdminPosterSlides(): Promise<PosterSlide[]> {
  if (!supabase) return [...localPosterSlides].sort(byOrder)
  const { data, error } = await supabase.from('poster_slides').select('*').order('sort_order').order('created_at')
  if (error) throw error
  return data as PosterSlide[]
}

export async function createPosterSlide(values: PosterSlideFormValues): Promise<PosterSlide> {
  if (!supabase) {
    const now = new Date().toISOString()
    const slide: PosterSlide = { ...values, id: crypto.randomUUID(), created_at: now, updated_at: now }
    localPosterSlides = [...localPosterSlides, slide].sort(byOrder)
    return slide
  }
  const { data, error } = await supabase.from('poster_slides').insert(values).select().single()
  if (error) throw error
  return data as PosterSlide
}

export async function updatePosterSlide(id: string, values: Partial<PosterSlideFormValues>): Promise<PosterSlide> {
  if (!supabase) {
    const existing = localPosterSlides.find((slide) => slide.id === id)
    if (!existing) throw new Error('Poster tidak ditemukan.')
    const updated = { ...existing, ...values, updated_at: new Date().toISOString() }
    localPosterSlides = localPosterSlides.map((slide) => slide.id === id ? updated : slide).sort(byOrder)
    return updated
  }
  const { data, error } = await supabase.from('poster_slides').update(values).eq('id', id).select().single()
  if (error) throw error
  return data as PosterSlide
}

export async function deletePosterSlide(id: string) {
  if (!supabase) { localPosterSlides = localPosterSlides.filter((slide) => slide.id !== id); return }
  const { error } = await supabase.from('poster_slides').delete().eq('id', id)
  if (error) throw error
}

export async function uploadPosterImage(file: File) {
  if (!supabase) return fileToDataUrl(file)
  const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg'
  const path = `${crypto.randomUUID()}.${extension}`
  const { error } = await supabase.storage.from('poster-images').upload(path, file, { upsert: false })
  if (error) throw error
  return supabase.storage.from('poster-images').getPublicUrl(path).data.publicUrl
}

function byOrder(a: PosterSlide, b: PosterSlide) { return a.sort_order - b.sort_order || a.created_at.localeCompare(b.created_at) }

function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(new Error('Gambar tidak dapat dibaca.'))
    reader.readAsDataURL(file)
  })
}
