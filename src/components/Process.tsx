import { useEffect, useRef, useState } from 'react'
import IconGrid3D, { type IconItem } from './three/IconGrid3D'
import { PROCESS } from '../data/content'
import Reveal from './Reveal'

export default function Process() {
  const [items, setItems] = useState<IconItem[]>([])
  const elsRef = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    const timer = requestAnimationFrame(() => {
      setItems(PROCESS.map((s, i) => ({ type: s.icon, el: elsRef.current[i] ?? null })))
    })
    return () => cancelAnimationFrame(timer)
  }, [])

  return (
    <section id="process" className="section-pad relative overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
        style={{
          background:
            'radial-gradient(800px 450px at 50% 100%, rgba(14,116,144,0.16), transparent 60%), linear-gradient(180deg, #070c13 0%, #05080c 100%)',
        }}
      />
      <IconGrid3D items={items} />

      <div className="container-x relative">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="kicker justify-center">
            <span className="eyebrow-line" />
            How It Works
            <span className="eyebrow-line" />
          </p>
          <h2 className="section-title">From blueprint to <span className="text-gradient-blue">balanced comfort</span></h2>
          <p className="mt-4 text-slate-400">
            A clear, four-step journey — so you always know what happens next and who is doing it.
          </p>
        </Reveal>

        <div className="relative mt-24 grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          {/* Connector line (desktop) */}
          <div
            className="pointer-events-none absolute left-[12%] right-[12%] top-[72px] hidden h-px bg-gradient-to-r from-cyan-400/10 via-cyan-400/50 to-cyan-400/10 lg:block"
            aria-hidden="true"
          />
          {PROCESS.map((step, i) => (
            <Reveal key={step.step} delay={i * 110} className="relative">
              <div
                ref={(el) => {
                  elsRef.current[i] = el
                }}
                className="group relative pt-28 text-center"
              >
                <span className="absolute left-1/2 top-0 z-10 -translate-x-1/2 font-display text-7xl font-extrabold text-white/5 transition-colors duration-300 group-hover:text-cyan-400/15">
                  {step.step}
                </span>
                <h3 className="relative font-display text-xl font-bold text-white">{step.title}</h3>
                <p className="relative mx-auto mt-2.5 max-w-xs text-sm leading-relaxed text-slate-400">
                  {step.blurb}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
