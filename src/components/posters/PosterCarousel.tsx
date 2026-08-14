import { ArrowUpRight, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { PosterSlide } from '../../types/posterSlide'

const autoplayMs = 7200
type CardPosition = 'far-left' | 'left' | 'center' | 'right' | 'far-right'

export function PosterCarousel({ slides }: { slides: PosterSlide[] }) {
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)

  useEffect(() => { if (active >= slides.length) setActive(0) }, [active, slides.length])
  useEffect(() => {
    if (slides.length < 2 || paused || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const timer = window.setInterval(() => setActive((current) => (current + 1) % slides.length), autoplayMs)
    return () => window.clearInterval(timer)
  }, [slides.length, active, paused])

  if (!slides.length) return null
  const previous = () => setActive((current) => (current - 1 + slides.length) % slides.length)
  const next = () => setActive((current) => (current + 1) % slides.length)

  return (
    <section className="relative overflow-hidden border-b border-[#d9d4ea] bg-[#f0edf8] px-4 py-8 sm:px-6 sm:py-10 dark:border-white/10 dark:bg-[#11172a]" aria-label="Poster terbaru Careerhub.indonesia">
      <div className="poster-ambient pointer-events-none absolute inset-0 opacity-70" />
      <div className="pointer-events-none absolute -left-24 top-12 size-72 rounded-full bg-[#162b64]/10 blur-3xl dark:bg-brand-400/10" />
      <div className="pointer-events-none absolute -right-20 bottom-8 size-72 rounded-full bg-[#9a3fbd]/15 blur-3xl" />
      <div className="relative mx-auto max-w-7xl">
        <div className="mb-4 flex items-end justify-between gap-4 sm:mb-5">
          <div><p className="text-[10px] font-black uppercase tracking-[.18em] text-[#7d389d] dark:text-[#efa8ff]">Poster terbaru</p><h2 className="mt-1.5 text-xl font-black tracking-[-.035em] text-slate-950 sm:text-2xl dark:text-white">Sorotan Careerhub.indonesia</h2></div>
          {slides.length > 1 && <p className="text-xs font-extrabold tabular-nums text-slate-500 dark:text-slate-400">{String(active + 1).padStart(2, '0')} / {String(slides.length).padStart(2, '0')}</p>}
        </div>

        <div className="poster-stage relative mx-auto h-[380px] w-full sm:h-[490px] lg:h-[540px]" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocusCapture={() => setPaused(true)} onBlurCapture={() => setPaused(false)}>
          {slides.map((slide, index) => { const position = getCardPosition(index, active, slides.length); return <PosterCard key={slide.id} slide={slide} position={position} active={position === 'center'} onActivate={() => setActive(index)} /> })}

          {slides.length > 1 && <>
            <button onClick={previous} className="focus-ring absolute bottom-1 left-1/2 z-40 grid size-10 -translate-x-[52px] place-items-center rounded-full border border-white/20 bg-slate-950/65 text-white shadow-xl backdrop-blur-md transition duration-300 hover:scale-110 hover:bg-[#71318f] sm:bottom-auto sm:left-2 sm:top-1/2 sm:-translate-y-1/2 sm:translate-x-0 lg:left-5" aria-label="Poster sebelumnya"><ChevronLeft className="size-5" /></button>
            <button onClick={next} className="focus-ring absolute bottom-1 left-1/2 z-40 grid size-10 translate-x-[12px] place-items-center rounded-full border border-white/20 bg-slate-950/65 text-white shadow-xl backdrop-blur-md transition duration-300 hover:scale-110 hover:bg-[#71318f] sm:bottom-auto sm:left-auto sm:right-2 sm:top-1/2 sm:-translate-y-1/2 sm:translate-x-0 lg:right-5" aria-label="Poster berikutnya"><ChevronRight className="size-5" /></button>
          </>}
        </div>

        {slides.length > 1 && <div className="mx-auto mt-3 max-w-[420px]"><div className="h-0.5 overflow-hidden rounded-full bg-[#b7afc5]/35 dark:bg-white/10"><span key={active} className="poster-progress block h-full origin-left rounded-full bg-gradient-to-r from-[#733291] via-[#c052d3] to-[#23a98f]" style={{ animationDuration: `${autoplayMs}ms`, animationPlayState: paused ? 'paused' : 'running' }} /></div><div className="mt-4 flex justify-center gap-2" aria-label="Pilih poster">{slides.map((item, index) => <button key={item.id} onClick={() => setActive(index)} className={`h-2 rounded-full transition-all duration-500 ${index === active ? 'w-8 bg-[#733291] shadow-[0_0_14px_rgba(150,62,177,.55)]' : 'w-2 bg-[#bbb4cb] hover:scale-125 hover:bg-[#8e849e] dark:bg-white/25'}`} aria-label={`Tampilkan poster ${index + 1}`} aria-current={index === active ? 'true' : undefined} />)}</div></div>}
      </div>
    </section>
  )
}

function PosterCard({ slide, position, active, onActivate }: { slide: PosterSlide; position: CardPosition; active: boolean; onActivate: () => void }) {
  const positionClass = position === 'center'
    ? 'z-30 -translate-x-1/2 scale-100 opacity-100 rotate-0 sm:scale-[1.04]'
    : position === 'left'
      ? 'z-10 -translate-x-[82%] translate-y-6 -rotate-[5deg] scale-[.76] opacity-60 sm:-translate-x-[105%] sm:translate-y-8 sm:scale-[.78] lg:-translate-x-[115%]'
      : position === 'right'
        ? 'z-10 -translate-x-[18%] translate-y-6 rotate-[5deg] scale-[.76] opacity-60 sm:translate-x-[5%] sm:translate-y-8 sm:scale-[.78] lg:translate-x-[15%]'
        : position === 'far-left'
          ? 'pointer-events-none z-0 -translate-x-[145%] translate-y-12 -rotate-[9deg] scale-[.58] opacity-0 blur-sm'
          : 'pointer-events-none z-0 translate-x-[45%] translate-y-12 rotate-[9deg] scale-[.58] opacity-0 blur-sm'

  const concealed = position === 'far-left' || position === 'far-right'
  return <article className={`poster-card-motion absolute left-1/2 top-1 w-[76vw] max-w-[400px] transform-gpu overflow-hidden rounded-[28px] bg-gradient-to-br from-[#0b2255] via-[#273a81] to-[#9b3db6] text-white sm:rounded-[32px] ${positionClass} ${active ? 'poster-active-card shadow-[0_34px_90px_rgba(55,35,100,.42)]' : 'cursor-pointer brightness-[.62] saturate-[.75] blur-[.4px] hover:brightness-[.78] hover:saturate-100'}`} aria-live={active ? 'polite' : undefined} aria-hidden={concealed || undefined}>
    <div className="relative aspect-[4/5] overflow-hidden">
      {slide.image_url ? <img src={slide.image_url} alt={active ? slide.alt_text : ''} className={`absolute inset-0 size-full object-cover transition-transform duration-[1600ms] ease-[cubic-bezier(.16,1,.3,1)] ${active ? 'poster-active-image' : 'scale-100'}`} /> : <FallbackPoster />}
      <div className={`pointer-events-none absolute inset-0 bg-gradient-to-b from-[#11172a]/20 to-[#11172a]/55 transition-opacity duration-[1400ms] ease-out ${active ? 'opacity-0' : 'opacity-100'}`} />
      {!active && !concealed && <button onClick={onActivate} className="absolute inset-0 z-20" aria-label={`Tampilkan poster ${slide.title}`} />}
      {active && <div className="poster-shine pointer-events-none absolute -inset-y-20 left-0 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/18 to-transparent" />}
      <div className={`absolute inset-x-0 bottom-0 p-5 transition-[opacity,transform,filter] duration-[1200ms] ease-[cubic-bezier(.16,1,.3,1)] sm:p-7 ${slide.image_url ? 'bg-gradient-to-t from-slate-950/95 via-slate-950/55 to-transparent pt-24' : ''} ${active ? 'poster-content-enter translate-y-0 opacity-100 blur-0' : 'pointer-events-none translate-y-5 opacity-0 blur-sm'}`}>
        <p className="max-w-sm text-2xl font-black leading-[1.05] tracking-[-.045em] sm:text-[30px]">{slide.title}</p>
        {slide.subtitle && <p className="mt-3 max-w-sm text-xs font-medium leading-5 text-white/80 sm:text-sm sm:leading-6">{slide.subtitle}</p>}
        {slide.cta_label && slide.cta_url && <a href={slide.cta_url} target={slide.cta_url.startsWith('http') ? '_blank' : undefined} rel={slide.cta_url.startsWith('http') ? 'noreferrer' : undefined} className="focus-ring mt-5 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-xs font-extrabold text-[#172556] shadow-lg transition duration-300 hover:-translate-y-1 hover:scale-105 hover:bg-[#f2d9fb]">{slide.cta_label}<ArrowUpRight className="size-3.5" /></a>}
      </div>
    </div>
  </article>
}

function getCardPosition(index: number, active: number, total: number): CardPosition {
  if (index === active) return 'center'
  if (total === 2) return active === 0 ? 'right' : 'left'
  const previous = (active - 1 + total) % total
  const next = (active + 1) % total
  if (index === previous) return 'left'
  if (index === next) return 'right'
  const forwardDistance = (index - active + total) % total
  return forwardDistance < total / 2 ? 'far-right' : 'far-left'
}

function FallbackPoster() {
  return <div className="absolute inset-0 overflow-hidden p-7 sm:p-9"><div className="absolute -right-20 -top-16 size-72 rounded-full border-[46px] border-white/10" /><div className="absolute -bottom-28 -left-24 size-72 rounded-full bg-[#b64cc7]/60" /><div className="absolute right-8 top-1/3 grid grid-cols-4 gap-2 opacity-25">{Array.from({ length: 20 }).map((_, index) => <span key={index} className="size-1.5 rounded-full bg-white" />)}</div><div className="relative"><img src="/careerhub-logo.jpg" alt="" className="size-16 rounded-full object-cover ring-2 ring-white/70" /><span className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[9px] font-black uppercase tracking-[.14em]"><Sparkles className="size-3.5" /> Careerhub.indonesia</span></div></div>
}
