import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const migration = readFileSync('supabase/migrations/0006_admin_authorization.sql', 'utf8')
const authConfig = readFileSync('supabase/config.toml', 'utf8')
const vercelConfig = JSON.parse(readFileSync('vercel.json', 'utf8')) as { headers?: Array<{ headers: Array<{ key: string; value: string }> }> }

describe('security configuration', () => {
  it('authorizes administrators using an immutable Supabase user ID allowlist', () => {
    expect(migration).toContain('user_id uuid primary key references auth.users (id)')
    expect(migration).toContain('where user_id = (select auth.uid())')
    expect(migration.match(/select public\.is_admin\(\)/g)?.length).toBeGreaterThanOrEqual(16)
  })

  it('disables global, email, and SMS sign-up in local Supabase', () => {
    expect(authConfig.match(/enable_signup = false/g)?.length).toBeGreaterThanOrEqual(3)
  })

  it('ships browser hardening headers', () => {
    const headers = new Map(vercelConfig.headers?.[0]?.headers.map(({ key, value }) => [key, value]))
    expect(headers.get('Content-Security-Policy')).toContain("frame-ancestors 'none'")
    expect(headers.get('X-Content-Type-Options')).toBe('nosniff')
    expect(headers.get('X-Frame-Options')).toBe('DENY')
  })
})
