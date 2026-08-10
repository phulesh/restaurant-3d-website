import { ShieldCheck, Star, ThumbsUp, Clock3 } from 'lucide-react'
import { BUSINESS } from '../lib/business'
import Reveal from './Reveal'

const PILLARS = [
  {
    icon: ShieldCheck,
    title: 'Authorized, not just a shop',
    text: 'Direct dealership of six leading AC brands with full manufacturer warranties.',
  },
  {
    icon: Star,
    title: 'Rated by customers',
    text: '4.0★ across 39 reviews on Google — real feedback from Raipur homes and businesses.',
  },
  {
    icon: ThumbsUp,
    title: 'Genuine everything',
    text: 'Branded units, original spares and documented installations. No grey-market stock.',
  },
  {
    icon: Clock3,
    title: 'Available when you need us',
    text: 'Open Monday–Saturday, 10 AM to 10 PM. AMC clients get priority breakdown support.',
  },
]

export default function Trust() {
  const stars = [0, 1, 2, 3]

  return (
    <section id="trust" className="section-pad relative overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
        style={{
          background:
            'radial-gradient(700px 420px at 50% 0%, rgba(14,116,144,0.14), transparent 60%)',
        }}
      />
      <div className="container-x relative">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="kicker justify-center">
            <span className="eyebrow-line" />
            Trust &amp; Ratings
            <span className="eyebrow-line" />
          </p>
          <h2 className="section-title">Why Raipur trusts us with <span className="text-gradient-blue">its comfort</span></h2>
        </Reveal>

        <div className="mx-auto mt-12 max-w-md">
          <Reveal>
            <div className="glass-strong relative overflow-hidden rounded-3xl p-8 text-center">
              <div
                className="pointer-events-none absolute -top-16 left-1/2 h-40 w-72 -translate-x-1/2 rounded-full bg-cyan-500/15 blur-3xl"
                aria-hidden="true"
              />
              <div className="relative flex justify-center gap-1" aria-label="4 out of 5 stars">
                {stars.map((i) => (
                  <Star
                    key={i}
                    className={`h-7 w-7 ${i < 4 ? 'fill-cyan-300 text-cyan-300' : 'fill-slate-600 text-slate-600'}`}
                    aria-hidden="true"
                  />
                ))}
              </div>
              <p className="relative mt-3 font-display text-4xl font-extrabold text-white">
                {BUSINESS.rating.toFixed(1)}
                <span className="text-lg text-slate-400"> / 5</span>
              </p>
              <p className="relative mt-1 text-sm text-slate-400">
                {BUSINESS.reviewCount} Google reviews · Sharda Chowk, Raipur
              </p>
              <p className="relative mt-5 inline-flex items-center gap-2 rounded-full border border-cyan-400/25 bg-cyan-400/10 px-4 py-1.5 text-xs font-semibold text-cyan-200">
                <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                Customer rating as shown on Google
              </p>
            </div>
          </Reveal>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {PILLARS.map((p, i) => (
            <Reveal key={p.title} delay={i * 90}>
              <div className="glass h-full rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:border-cyan-400/40">
                <p.icon className="h-6 w-6 text-cyan-300" aria-hidden="true" />
                <h3 className="mt-4 font-display text-base font-bold text-white">{p.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">{p.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
