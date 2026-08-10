import { lazy, Suspense, useEffect, useMemo, useState } from 'react'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import About from './components/About'
import Brands from './components/Brands'
import Solutions from './components/Solutions'
import Applications from './components/Applications'
import Experience from './components/Experience'
import Process from './components/Process'
import Gallery from './components/Gallery'
import Trust from './components/Trust'
import Hours from './components/Hours'
import Location from './components/Location'
import Contact from './components/Contact'
import Footer from './components/Footer'
import StickyCall from './components/StickyCall'
import ScrollProgress from './components/ScrollProgress'
import { WebGLFallback } from './components/WebGLSupport'
import { useLenis } from './hooks/useLenis'
import type { DeviceProfile } from './lib/types'

const Experience3D = lazy(() => import('./components/three/Experience3D'))

function App() {
  // Tracks when the user reaches the 3D room section (so the scene can lazy-load).
  const [experienceInView, setExperienceInView] = useState(false)
  const [experienceActive, setExperienceActive] = useState(false)
  const [webgl, setWebgl] = useState<boolean | null>(null)
  const [profile, setProfile] = useState<DeviceProfile>({
    isMobile: false,
    isLowEnd: false,
    prefersReducedMotion: false,
  })

  useLenis()

  useEffect(() => {
    const canvas = document.createElement('canvas')
    const gl =
      canvas.getContext('webgl2') ||
      (canvas.getContext('webgl') as WebGLRenderingContext | null)
    setWebgl(!!gl)

    const mqReduced = window.matchMedia('(prefers-reduced-motion: reduce)')
    const mqMobile = window.matchMedia('(pointer: coarse) and (max-width: 768px)')
    const nav = (typeof navigator !== 'undefined' ? navigator : null) as
      | (Navigator & { deviceMemory?: number; hardwareConcurrency?: number })
      | null
    const isLowEnd = (nav?.deviceMemory ?? 8) <= 4 || (nav?.hardwareConcurrency ?? 8) <= 4

    const update = () => {
      setProfile({
        isMobile: mqMobile.matches || window.innerWidth < 768,
        isLowEnd,
        prefersReducedMotion: mqReduced.matches,
      })
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  useEffect(() => {
    const target = document.getElementById('experience')
    if (!target) return
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setExperienceInView(true)
          setExperienceActive(entry.isIntersecting)
        }
      },
      { rootMargin: '600px 0px', threshold: 0 },
    )
    io.observe(target)
    return () => io.disconnect()
  }, [])

  const reduced = profile.prefersReducedMotion

  const scene = useMemo(() => {
    if (!webgl) return <WebGLFallback />
    return (
      <Experience3D
        quality={profile.isLowEnd ? 'low' : profile.isMobile ? 'medium' : 'high'}
        active={experienceActive}
      />
    )
  }, [webgl, profile, experienceActive])

  return (
    <div className="min-h-screen bg-[#05080c] text-white antialiased selection:bg-cyan-400/30">
      <ScrollProgress />
      <Navbar />

      <main>
        <Hero reducedMotion={reduced} />
        <About />
        <Brands />
        <Solutions />
        <Applications />
        <Experience>
          <Suspense fallback={<ExperienceFallback />}>
            {experienceInView ? scene : <ExperienceFallback />}
          </Suspense>
        </Experience>
        <Process />
        <Gallery />
        <Trust />
        <Hours />
        <Location />
        <Contact />
      </main>

      <Footer />
      <StickyCall />
    </div>
  )
}

function ExperienceFallback() {
  return (
    <div className="flex min-h-[480px] items-center justify-center bg-[#070b10]">
      <div className="flex flex-col items-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-cyan-400/30 border-t-cyan-400" />
        <p className="text-sm text-slate-400">Preparing the 3D experience…</p>
      </div>
    </div>
  )
}

export default App
