import { useEffect, useRef, useState } from 'react'
import IconGrid3D, { type IconItem } from './three/IconGrid3D'
import { SERVICES } from '../data/content'
import Reveal from './Reveal'

export default function Solutions() {
  const [items, setItems] = useState<IconItem[]>([])
  const elsRef = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    const timer = requestAnimationFrame(() => {
      setItems(SERVICES.map((s, i) => ({ type: s.icon, el: elsRef.current[i] ?? null })))
    })
    return () => cancelAnimationFrame(timer)
  }, [])

  return (
    <section id="solutions" className="section-pad relative overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
        style={{
          background:
            'radial-gradient(900px 500px at 50% 0%, rgba(14,116,144,0.16), transparent 60%), linear-gradient(180deg, #05080c 0%, #070c13 100%)',
        }}
      />

      {/* Single shared 3D icon canvas tracking the cards */}
      <IconGrid3D items={items} />

      <div className="container-x relative">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="kicker justify-center">
            <span className="eyebrow-line" />
            HVAC Solutions
            <span className="eyebrow-line" />
          </p>
          <h2 className="section-title">Everything your space needs to <span className="text-gradient-blue">stay cool</span></h2>
          <p className="mt-4 text-slate-400">
            From heavy-duty VRF networks to elegant hi-wall units — plus the design, supply and
            service that make them run flawlessly.
          </p>
        </Reveal>

        <div className="mt-20 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {SERVICES.map((service, i) => (
            <Reveal key={service.title} delay={(i % 4) * 90} className="h-full">
              <div
                ref={(el) => {
                  elsRef.current[i] = el
                }}
                className="glass group relative h-full overflow-hidden rounded-3xl px-6 pb-7 pt-28 transition-all duration-300 hover:-translate-y-1.5 hover:border-cyan-400/40 hover:shadow-[0_20px_60px_-20px_rgba(34,211,238,0.35)]"
              >
                <div
                  className={`pointer-events-none absolute inset-0 bg-gradient-to-b ${service.gradient} opacity-60 transition-opacity duration-500 group-hover:opacity-100`}
                  aria-hidden="true"
                />
                <div className="relative">
                  <h3 className="font-display text-lg font-bold text-white">{service.title}</h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-slate-400">{service.blurb}</p>
                </div>
                {/* Animated corner glow */}
                <span
                  className="pointer-events-none absolute inset-x-8 bottom-0 h-px bg-gradient-to-r from-transparent via-cyan-400/70 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                  aria-hidden="true"
                />
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
