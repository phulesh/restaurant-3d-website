import { useEffect, useRef, type ReactNode } from 'react'
import { Wind } from 'lucide-react'
import Reveal from './Reveal'

/** The 3D room experience: scrolling animates the cooling airflow. */
export default function Experience({ children }: { children: ReactNode }) {
  const tempRef = useRef<HTMLSpanElement>(null)
  const barRef = useRef<HTMLDivElement>(null)
  const statusRef = useRef<HTMLParagraphElement>(null)

  useEffect(() => {
    let raf = 0
    const update = () => {
      raf = 0
      const el = document.getElementById('experience')
      if (!el) return
      const offsetTop = el.getBoundingClientRect().top + window.scrollY
      const span = Math.max(1, el.offsetHeight - window.innerHeight)
      const p = Math.min(1, Math.max(0, (window.scrollY - offsetTop) / span))

      if (tempRef.current) tempRef.current.textContent = (38 - p * 16).toFixed(1)
      if (barRef.current) barRef.current.style.width = `${(p * 100).toFixed(1)}%`
      if (statusRef.current) {
        statusRef.current.textContent = p < 0.05 ? 'Scroll to activate cooling' : p > 0.9 ? 'Room fully cooled · 22.0°C' : 'Cooling in progress…'
      }
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <section id="experience" className="relative h-[240vh]">
      <div className="sticky top-0 h-screen overflow-hidden bg-[#05080c]">
        {/* The 3D scene is injected here by App (lazy, WebGL-guarded) */}
        <div id="experience-canvas" className="absolute inset-0">
          {children}
        </div>

        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(180deg, rgba(5,8,12,0.7) 0%, transparent 30%, transparent 70%, rgba(5,8,12,0.6) 100%)',
            }}
          />
        </div>

        {/* Overlay content */}
        <div className="container-x relative z-10 flex h-full flex-col justify-between px-5 py-24 sm:px-8 lg:px-14">
          <Reveal>
            <div className="max-w-lg">
              <p className="kicker">
                <span className="eyebrow-line" />
                3D HVAC Experience
              </p>
              <h2 className="font-display text-3xl font-bold leading-tight text-white sm:text-5xl">
                Watch the room <span className="text-gradient-blue">get cool</span>
              </h2>
              <p className="mt-4 text-slate-300">
                An interactive 3D room — indoor unit, outdoor condenser and the airflow between
                them. Keep scrolling to push the cool air through the space.
              </p>
            </div>
          </Reveal>

          <Reveal delay={150}>
            <div className="glass-strong pointer-events-none ml-auto w-full max-w-xs rounded-3xl p-6">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Room Temp</p>
                <Wind className="h-5 w-5 text-cyan-300" aria-hidden="true" />
              </div>
              <p className="mt-2 font-display text-4xl font-extrabold text-white">
                <span ref={tempRef}>38.0</span>
                <span className="text-xl text-cyan-300">°C</span>
              </p>
              <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/10">
                <div ref={barRef} className="h-full w-0 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500" />
              </div>
              <p ref={statusRef} className="mt-3 text-xs font-medium text-cyan-200">
                Scroll to activate cooling
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
