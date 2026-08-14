import { Link } from 'react-router-dom'

export function Brand() {
  return (
    <Link to="/" className="focus-ring inline-flex items-center gap-2.5 rounded-lg" aria-label="Careerhub.indonesia — Beranda">
      <img src="/careerhub-logo.jpg" alt="Careerhub.indonesia" className="size-12 rounded-full object-cover shadow-sm" />
      <span className="text-sm font-black tracking-[-.025em] text-slate-900 sm:text-lg dark:text-white">Careerhub<span className="text-[#8b3bb5]">.indonesia</span></span>
    </Link>
  )
}
