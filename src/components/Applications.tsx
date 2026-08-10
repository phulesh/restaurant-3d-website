import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { Check } from 'lucide-react'
import { APPLICATIONS } from '../data/content'
import Reveal from './Reveal'

const AppScene = lazy(() => import('./three/AppScene3D'))

/** Mounts the heavy Canvas only when the card approaches the viewport. */
function LazyScene({ scene }: { scene: string }) {
  const [ever, setEver] = useState(false)
  const [inView, setInView] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const node = ref.current
    if (!node) return
    const io = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting)
        if (entry.isIntersecting) setEver(true)
      },
      { rootMargin: '400px 0px' },
    )
    io.observe(node)
    return () => io.disconnect()
  }, [])

  return (
    <div ref={ref} className="absolute inset-0">
      {ever && (
        <Suspense fallback={null}>
          <AppScene scene={scene} active={inView} />
        </Suspense>
      )}
    </div>
  )
}

export default function Applications() {
  return (
    <section id="projects" className="section-pad relative overflow-hidden bg-[#070b11]">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent"
        aria-hidden="true"
      />
      <div className="container-x">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="kicker justify-center">
            <span className="eyebrow-line" />
            Where We Work
            <span className="eyebrow-line" />
          </p>
          <h2 className="section-title">Cooling built for <span className="text-gradient-blue">every kind of space</span></h2>
          <p className="mt-4 text-slate-400">
            Different spaces demand different systems. We design and install the right one for
            hospitals, commercial buildings and homes.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {APPLICATIONS.map((app, i) => (
            <Reveal key={app.id} delay={i * 110}>
              <article className="group relative h-full overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#080d14] transition-all duration-500 hover:-translate-y-2 hover:border-cyan-400/40 hover:shadow-[0_30px_80px_-30px_rgba(34,211,238,0.45)]">
                <div className="relative h-64 overflow-hidden sm:h-72">
                  <LazyScene scene={app.scene} />
                  <div
                    className={`pointer-events-none absolute inset-0 bg-gradient-to-t ${app.gradient} opacity-80`}
                    aria-hidden="true"
                  />
                  <div
                    className="pointer-events-none absolute inset-0"
                    aria-hidden="true"
                    style={{
                      background:
                        'linear-gradient(180deg, rgba(5,8,12,0.25) 0%, transparent 35%, rgba(5,8,12,0.75) 82%, #080d14 100%)',
                    }}
                  />
                  <span
                    className="absolute left-5 top-5 rounded-full border border-white/15 bg-black/40 px-3.5 py-1.5 text-sm backdrop-blur-md"
                    aria-hidden="true"
                  >
                    {app.emoji}
                  </span>
                </div>

                <div className="relative -mt-6 p-6 sm:p-7">
                  <h3 className="font-display text-2xl font-extrabold text-white">{app.title}</h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-slate-400">{app.description}</p>
                  <ul className="mt-5 space-y-2.5">
                    {app.points.map((point) => (
                      <li key={point} className="flex items-start gap-2.5 text-sm text-slate-300">
                        <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-cyan-400/15">
                          <Check className="h-3 w-3 text-cyan-300" aria-hidden="true" />
                        </span>
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
