import { supabase } from '../lib/supabase'
import { defaultSiteSettings, type SiteSettings, type SiteSettingsForm } from '../types/siteSettings'

export async function getSiteSettings(): Promise<SiteSettings> {
  if (!supabase) return defaultSiteSettings
  const { data, error } = await supabase.from('site_settings').select('*').eq('id', 'main').maybeSingle()
  if (error) throw error
  return data ? { ...defaultSiteSettings, ...data } as SiteSettings : defaultSiteSettings
}

export async function saveSiteSettings(values: SiteSettingsForm): Promise<SiteSettings> {
  if (!supabase) return { ...defaultSiteSettings, ...values, updated_at: new Date().toISOString() }
  const { data, error } = await supabase.from('site_settings').upsert({ id: 'main', ...values }, { onConflict: 'id' }).select().single()
  if (error) throw error
  return data as SiteSettings
}
