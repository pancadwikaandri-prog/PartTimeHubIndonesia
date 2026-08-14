export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}

export function formatRelativeDate(value: string) {
  const days = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 86_400_000))
  if (days === 0) return 'Hari ini'
  if (days === 1) return 'Kemarin'
  if (days < 7) return `${days} hari lalu`
  return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short' }).format(new Date(value))
}

export function initials(name: string) {
  return name.split(' ').slice(0, 2).map((word) => word[0]).join('').toUpperCase()
}

export function getApplicationHref(method: string, whatsapp: string | null, email: string | null, url: string | null) {
  if (method === 'whatsapp' && whatsapp) return `https://wa.me/${whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent('Halo, saya tertarik dengan lowongan yang tersedia di Careerhub.indonesia.')}`
  if (method === 'email' && email) return `mailto:${email}?subject=${encodeURIComponent('Lamaran melalui Careerhub.indonesia')}`
  return url || '#'
}
