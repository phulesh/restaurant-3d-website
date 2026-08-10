import { lazy, Suspense, useMemo } from 'react'
import { ChevronDown, Phone } from 'lucide-react'
import { BUSINESS } from '../lib/business'

const Hero3D = lazy(() => import('./three/Hero3D'))

interface HeroProps {
  reducedMotion?: boolean
}

export default function Hero({ reducedMotion = false }: HeroProps) {
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' })
  }

  const scene = useMemo(() => (reducedMotion ? null : <Hero3D />), [reducedMotion])

  return (
    <section id="home" className="relative flex min-h-[100svh] flex-col overflow-hidden">
      {/* Background layers */}
      <div className="absolute inset-0 bg-[#05080c]" aria-hidden="true" />
      <div
        className="absolute inset-0 opacity-60"
        aria-hidden="true"
        style={{
          background:
            'radial-gradient(1100px 600px at 70% 20%, rgba(14,116,144,0.22), transparent 60%), radial-gradient(800px 500px at 20% 90%, rgba(59,130,246,0.12), transparent 60%), linear-gradient(180deg, #05080c 0%, #070d15 60%, #05080c 100%)',
        }}
      />

      {/* 3D scene (lazy + WebGL guarded) */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <Suspense fallback={null}>{scene}</Suspense>
      </div>

      {/* Foreground overlays */}
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
        style={{
          background:
            'linear-gradient(180deg, rgba(5,8,12,0.55) 0%, rgba(5,8,12,0.15) 30%, transparent 55%, rgba(5,8,12,0.35) 82%, #05080c 100%)',
        }}
      />

      {/* Content */}
      <div className="container-x relative z-10 flex flex-1 flex-col justify-end px-5 pb-24 pt-32 sm:px-8 md:justify-center md:pb-32 lg:px-14">
        <div className="max-w-3xl">
          <p className="animate-[fade-in_0.7s_ease] font-display text-xs font-extrabold uppercase tracking-[0.34em] text-white/90 sm:text-sm">
            Samrat Electronics <span className="mx-2 text-cyan-400">·</span>
            <span className="text-cyan-300"> HVAC Solutions</span>
          </p>
          <p className="kicker mt-4 animate-[fade-in_0.8s_ease]">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-400" />
            </span>
            Authorized Dealer for Leading HVAC Brands
          </p>

          <h1 className="font-display text-4xl font-extrabold leading-[1.08] tracking-tight text-white sm:text-6xl lg:text-7xl">
            Advanced HVAC Solutions for <span className="text-gradient-blue">Modern Spaces</span>
          </h1>

          <p className="mt-5 max-w-xl text-base text-slate-300 sm:text-lg md:text-xl">
            {BUSINESS.tagline}
          </p>

          <div className="mt-9 flex flex-col gap-4 sm:flex-row sm:items-center">
            <a href={BUSINESS.phoneHref} className="btn-primary px-8! py-4! text-base">
              <Phone className="h-5 w-5" aria-hidden="true" />
              Call Now
            </a>
            <button type="button" onClick={() => scrollTo('solutions')} className="btn-ghost px-8! py-4! text-base">
              Explore Solutions
              <ChevronDown className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          <dl className="mt-12 grid max-w-xl grid-cols-3 gap-4 border-t border-white/10 pt-6">
            {[
              { k: '4.0★', v: 'Google Rating' },
              { k: '8+', v: 'HVAC Services' },
              { k: '6', v: 'Authorized Brands' },
            ].map((item) => (
              <div key={item.v}>
                <dt className="sr-only">{item.v}</dt>
                <dd className="font-display text-xl font-extrabold text-white sm:text-2xl">{item.k}</dd>
                <dd className="mt-0.5 text-[11px] font-medium uppercase tracking-wider text-slate-400 sm:text-xs">{item.v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      {/* Scroll cue */}
      <div className="absolute bottom-6 left-1/2 z-10 hidden -translate-x-1/2 md:block" aria-hidden="true">
        <div className="flex h-10 w-6 items-start justify-center rounded-full border border-white/25 p-1.5">
          <div className="h-2 w-1 animate-[scroll-cue_1.8s_ease-in-out_infinite] rounded-full bg-cyan-300" />
        </div>
      </div>
    </section>
  )
}
