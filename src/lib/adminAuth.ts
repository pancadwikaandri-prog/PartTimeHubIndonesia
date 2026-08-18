export const ADMIN_USERNAME = 'AdminCareerHub'

const ADMIN_AUTH_EMAIL = 'Pancadwikaandri@gmail.com'
const normalize = (value: string) => value.trim().toLowerCase()

export function resolveAdminAuthEmail(username: string) {
  return normalize(username) === normalize(ADMIN_USERNAME) ? ADMIN_AUTH_EMAIL : null
}

export function isAdminIdentity(user: { email?: string | null } | null | undefined) {
  return Boolean(user?.email && normalize(user.email) === normalize(ADMIN_AUTH_EMAIL))
}
