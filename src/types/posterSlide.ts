export interface PosterSlide {
  id: string
  title: string
  subtitle: string
  image_url: string | null
  alt_text: string
  cta_label: string | null
  cta_url: string | null
  is_active: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

export type PosterSlideFormValues = Omit<PosterSlide, 'id' | 'created_at' | 'updated_at'>

export const emptyPosterSlide: PosterSlideFormValues = {
  title: '',
  subtitle: '',
  image_url: null,
  alt_text: '',
  cta_label: 'Lihat Lowongan',
  cta_url: '#lowongan',
  is_active: true,
  sort_order: 0,
}
