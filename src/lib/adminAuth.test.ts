import { describe, expect, it } from 'vitest'
import { ADMIN_USERNAME, isAdminIdentity, resolveAdminAuthEmail } from './adminAuth'

describe('admin username mapping', () => {
  it('maps the public admin username to the existing Supabase account', () => {
    expect(resolveAdminAuthEmail(ADMIN_USERNAME)).toBe('Pancadwikaandri@gmail.com')
  })

  it('accepts harmless casing and whitespace differences', () => {
    expect(resolveAdminAuthEmail('  admincareerhub  ')).toBe('Pancadwikaandri@gmail.com')
  })

  it('rejects other usernames', () => {
    expect(resolveAdminAuthEmail('another-admin')).toBeNull()
  })

  it('accepts only the configured Supabase identity', () => {
    expect(isAdminIdentity({ email: 'pancadwikaandri@GMAIL.com' })).toBe(true)
    expect(isAdminIdentity({ email: 'attacker@example.com' })).toBe(false)
    expect(isAdminIdentity(null)).toBe(false)
  })
})
