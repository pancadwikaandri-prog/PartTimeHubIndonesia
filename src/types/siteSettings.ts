export interface SiteSettings {
  id: 'main'
  post_job_url: string
  instagram_url: string
  threads_url: string
  telegram_url: string
  whatsapp_url: string
  careerhub_instagram_url: string
  careerhub_threads_url: string
  careerhub_telegram_url: string
  careerhub_whatsapp_url: string
  updated_at: string
}

export type SiteSettingsForm = Omit<SiteSettings, 'id' | 'updated_at'>

const whatsappMessage = encodeURIComponent('Halo Careerhub.indonesia, saya ingin memasang lowongan pekerjaan.')

export const defaultSiteSettings: SiteSettings = {
  id: 'main',
  post_job_url: `https://wa.me/?text=${whatsappMessage}`,
  instagram_url: 'https://www.instagram.com/parttimehubindonesia/',
  threads_url: 'https://www.threads.net/@parttimehubindonesia',
  telegram_url: 'https://t.me/parttimehubindonesia',
  whatsapp_url: `https://wa.me/?text=${whatsappMessage}`,
  careerhub_instagram_url: '',
  careerhub_threads_url: '',
  careerhub_telegram_url: '',
  careerhub_whatsapp_url: '',
  updated_at: new Date(0).toISOString(),
}
