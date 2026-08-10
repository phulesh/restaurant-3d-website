import { useRef } from 'react'
import { BadgeCheck } from 'lucide-react'
import { BRAND_COLORS } from '../lib/business'
import Reveal from './Reveal'

interface Brand {
  name: string
  category: string
}

const BRANDS: Brand[] = [
  { name: 'Mitsubishi Electric', category: 'VRF · Splits · Inverters' },
  { name: 'Voltas', category: 'Splits · Cassette · Ductable' },
  { name: 'Blue Star', category: 'Ductable · Cassette · VRF' },
  { name: 'Daikin', category: 'VRF · Splits · Cassette' },
  { name: 'O General', category: 'Hi-Wall · Cassette · Ductable' },
  { name: 'LG', category: 'Splits · Ductable · Multi-Split' },
]

function BrandCard({ brand, index }: { brand: Brand; index: number }) {
  const cardRef = useRef<HTMLDivElement>(null)

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const card = cardRef.current
    if (!card) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const rect = card.getBoundingClientRect()
    const px = (e.clientX - rect.left) / rect.width - 0.5
    const py = (e.clientY - rect.top) / rect.height - 0.5
    card.style.transform = `perspective(900px) rotateX(${(-py * 8).toFixed(2)}deg) rotateY(${(px * 10).toFixed(2)}deg) translateY(-4px)`
  }

  const onLeave = () => {
    const card = cardRef.current
    if (!card) return
    card.style.transform = ''
  }

  return (
    <Reveal delay={index * 80}>
      <div
        ref={cardRef}
        onPointerMove={onMove}
        onPointerLeave={onLeave}
        className="glass group relative h-full overflow-hidden rounded-3xl p-7 transition-transform duration-200 will-change-transform"
      >
        {/* Brand accent gradient */}
        <div
          className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${BRAND_COLORS[brand.name] ?? 'from-cyan-400/30 to-transparent'} opacity-70 transition-opacity duration-300 group-hover:opacity-100`}
          aria-hidden="true"
        />
        <div className="relative">
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/15 bg-white/5">
            <BadgeCheck className="h-6 w-6 text-cyan-300" aria-hidden="true" />
          </span>
          <h3 className="mt-5 font-display text-lg font-extrabold tracking-tight text-white sm:text-xl">
            {brand.name}
          </h3>
          <p className="mt-1.5 text-xs font-medium uppercase tracking-wider text-slate-400">{brand.category}</p>
          <span className="mt-5 inline-flex items-center gap-1.5 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-300">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" aria-hidden="true" />
            Authorized Dealer
          </span>
        </div>
      </div>
    </Reveal>
  )
}

export default function Brands() {
  return (
    <section id="brands" className="section-pad relative overflow-hidden bg-[#070b11]">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent"
        aria-hidden="true"
      />
      <div className="container-x">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="kicker justify-center">
            <span className="eyebrow-line" />
            Authorized Brands
            <span className="eyebrow-line" />
          </p>
          <h2 className="section-title">India&apos;s leading AC brands, <span className="text-gradient-blue">one trusted dealer</span></h2>
          <p className="mt-4 text-slate-400">
            Every unit we sell comes with the manufacturer&apos;s warranty and our own installation
            guarantee — because we are authorized dealers, not just resellers.
          </p>
        </Reveal>

        <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {BRANDS.map((brand, i) => (
            <BrandCard key={brand.name} brand={brand} index={i} />
          ))}
        </div>

        <Reveal delay={120}>
          <p className="mt-8 text-center text-xs text-slate-500">
            Official brand names and trademarks belong to their respective owners and are used for identification only.
          </p>
        </Reveal>
      </div>
    </section>
  )
}
