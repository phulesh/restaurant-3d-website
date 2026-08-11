import { lazy, Suspense } from 'react'
import { ArrowDown, CheckCircle2, Play } from 'lucide-react'
import { motion } from 'framer-motion'
import { hero } from '../data/siteData'
import { Button } from './UI'

const HeroScene = lazy(() => import('./HeroScene'))

export default function Hero() {
  return (
    <main className="hero section-grid" id="home">
      <div className="hero-radial hero-radial-a" /><div className="hero-radial hero-radial-b" />
      <div className="shell hero-shell">
        <motion.div className="hero-copy" initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}>
          <div className="hero-eyebrow"><span className="live-dot" />{hero.eyebrow}<i>v2.0</i></div>
          <h1 id="hero-title">Turn Every<br />Conversation Into <span>a Customer</span></h1>
          <p>{hero.subtitle}</p>
          <div className="hero-actions">
            <Button href={hero.primaryCta.href}>{hero.primaryCta.label}</Button>
            <Button href={hero.secondaryCta.href} variant="secondary" icon={null}><Play size={16} fill="currentColor" /> {hero.secondaryCta.label}</Button>
          </div>
          <div className="hero-proof"><span className="avatar-stack"><i>RS</i><i>PM</i><i>AK</i></span><span><b>Built for revenue teams</b><small><CheckCircle2 size={13} /> No credit card required</small></span></div>
        </motion.div>
        <motion.div className="hero-visual" initial={{ opacity: 0, scale: 0.93 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}>
          <Suspense fallback={<div className="scene-fallback"><i /><span>Initializing AI network…</span></div>}><HeroScene /></Suspense>
        </motion.div>
        <div className="hero-trust">
          {hero.trust.map((item, index) => <span key={item}>{index > 0 && <i />} {item}</span>)}
        </div>
      </div>
      <a href="#social-proof" className="scroll-cue" aria-label="Scroll to overview"><span>Explore platform</span><ArrowDown size={16} /></a>
    </main>
  )
}
