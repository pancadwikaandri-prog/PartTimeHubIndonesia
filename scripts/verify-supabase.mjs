import { createClient } from '@supabase/supabase-js'

const url = process.env.VITE_SUPABASE_URL
const anonKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? process.env.VITE_SUPABASE_ANON_KEY
const email = process.env.LOCAL_ADMIN_EMAIL
const password = process.env.LOCAL_ADMIN_PASSWORD
const nonAdminEmail = process.env.LOCAL_NON_ADMIN_EMAIL
const nonAdminPassword = process.env.LOCAL_NON_ADMIN_PASSWORD

if (!url || !anonKey || !email || !password) {
  throw new Error('Missing local Supabase test environment variables.')
}

const anon = createClient(url, anonKey, { auth: { persistSession: false } })
const admin = createClient(url, anonKey, { auth: { persistSession: false } })
const nonAdmin = nonAdminEmail && nonAdminPassword ? createClient(url, anonKey, { auth: { persistSession: false } }) : null
const assert = (condition, message) => { if (!condition) throw new Error(message) }

const { data: publicBefore, error: publicReadError } = await anon.from('jobs').select('id,is_active')
assert(!publicReadError, `Anonymous read failed: ${publicReadError?.message}`)
assert(publicBefore.every((job) => job.is_active), 'Anonymous users received an inactive vacancy.')

const { error: anonymousWriteError } = await anon.from('jobs').insert({ title: 'Unauthorized test' })
assert(Boolean(anonymousWriteError), 'Anonymous vacancy creation should be rejected.')

const { data: publicSettings, error: publicSettingsError } = await anon.from('site_settings').select('*').eq('id', 'main').single()
assert(!publicSettingsError && publicSettings, `Public settings read failed: ${publicSettingsError?.message}`)
const { data: anonymousSettingsWrite, error: anonymousSettingsWriteError } = await anon.from('site_settings').update({ telegram_url: 'https://example.com/not-allowed' }).eq('id', 'main').select()
assert(Boolean(anonymousSettingsWriteError) || anonymousSettingsWrite?.length === 0, 'Anonymous site-settings update should be rejected.')

const { error: loginError } = await admin.auth.signInWithPassword({ email, password })
assert(!loginError, `Admin login failed: ${loginError?.message}`)

const { data: adminAllowed, error: adminCheckError } = await admin.rpc('is_admin')
assert(!adminCheckError && adminAllowed === true, `Configured account is not allowlisted: ${adminCheckError?.message}`)

if (nonAdmin) {
  const { error: nonAdminLoginError } = await nonAdmin.auth.signInWithPassword({ email: nonAdminEmail, password: nonAdminPassword })
  assert(!nonAdminLoginError, `Non-admin control account login failed: ${nonAdminLoginError?.message}`)
  const { data: nonAdminAllowed, error: nonAdminCheckError } = await nonAdmin.rpc('is_admin')
  assert(!nonAdminCheckError && nonAdminAllowed === false, 'Non-admin control account was incorrectly allowlisted.')
  const { data: nonAdminWrite, error: nonAdminWriteError } = await nonAdmin.from('jobs').insert({ title: 'Unauthorized authenticated test' }).select()
  assert(Boolean(nonAdminWriteError) || nonAdminWrite?.length === 0, 'A non-admin authenticated account could create a vacancy.')
}

const { data: updatedSettings, error: settingsUpdateError } = await admin.from('site_settings').update({ telegram_url: publicSettings.telegram_url }).eq('id', 'main').select().single()
assert(!settingsUpdateError && updatedSettings, `Admin settings update failed: ${settingsUpdateError?.message}`)

const now = Date.now()
const payload = {
  title: `Integration Test ${now}`,
  company_name: 'Careerhub.indonesia QA',
  company_description: 'Temporary local integration record.',
  location: 'Jakarta',
  category: 'Quality Assurance',
  work_type: 'Part-Time',
  work_mode: 'Remote',
  short_description: 'Temporary record for local CRUD verification.',
  description: 'This vacancy is created and removed automatically by the local verification script.',
  requirements: ['Local test'],
  responsibilities: ['Verify CRUD'],
  salary_display: 'Rp30.000 / jam',
  salary_period: 'jam',
  application_method: 'email',
  application_email: email,
  is_active: false,
  is_featured: false,
  is_urgent: false,
}

let createdId
let logoPath
try {
  const { data: created, error: createError } = await admin.from('jobs').insert(payload).select().single()
  assert(!createError && created, `Admin create failed: ${createError?.message}`)
  createdId = created.id

  const { data: hiddenPublic } = await anon.from('jobs').select('id').eq('id', createdId)
  assert(hiddenPublic?.length === 0, 'Inactive vacancy was visible to an anonymous user.')

  const { data: updated, error: updateError } = await admin.from('jobs').update({ is_active: true, title: `${payload.title} Updated` }).eq('id', createdId).select().single()
  assert(!updateError && updated?.is_active, `Admin update failed: ${updateError?.message}`)

  const { data: visiblePublic, error: visibleError } = await anon.from('jobs').select('id').eq('id', createdId)
  assert(!visibleError && visiblePublic?.length === 1, 'Active vacancy was not visible to an anonymous user.')

  logoPath = `integration/${crypto.randomUUID()}.png`
  const onePixelPng = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Wl2nWQAAAAASUVORK5CYII=', 'base64')
  const { error: uploadError } = await admin.storage.from('company-logos').upload(logoPath, onePixelPng, { contentType: 'image/png' })
  assert(!uploadError, `Authenticated logo upload failed: ${uploadError?.message}`)

  const publicLogoUrl = admin.storage.from('company-logos').getPublicUrl(logoPath).data.publicUrl
  const logoResponse = await fetch(publicLogoUrl)
  assert(logoResponse.ok, 'Uploaded company logo was not publicly readable.')

  console.log('Supabase local verification passed: auth, public RLS, admin CRUD, site settings, and logo storage.')
} finally {
  if (logoPath) await admin.storage.from('company-logos').remove([logoPath])
  if (createdId) await admin.from('jobs').delete().eq('id', createdId)
  if (nonAdmin) await nonAdmin.auth.signOut()
  await admin.auth.signOut()
}
