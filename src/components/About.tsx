import { BadgeCheck, Boxes, Phone, ShieldCheck, Users } from 'lucide-react'
import { BUSINESS } from '../lib/business'
import Reveal from './Reveal'
import { Logo } from './Logo'

const FEATURES = [
  {
    icon: BadgeCheck,
    title: 'Authorized dealer',
    text: 'Direct dealer of Mitsubishi Electric, Voltas, Blue Star, Daikin, O General and LG.',
  },
  {
    icon: Boxes,
    title: 'Genuine products',
    text: 'Branded units, spares and accessories with proper warranty documentation.',
  },
  {
    icon: Users,
    title: 'Trained team',
    text: 'In-house engineers and technicians following manufacturer installation standards.',
  },
  {
    icon: ShieldCheck,
    title: 'End-to-end support',
    text: 'Design, supply, installation and AMC under one roof — with priority after-sales care.',
  },
]

export default function About() {
  return (
    <section id="about" className="section-pad relative overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
        style={{
          background:
            'radial-gradient(700px 400px at 15% 20%, rgba(14,116,144,0.14), transparent 60%), radial-gradient(600px 400px at 90% 80%, rgba(37,99,235,0.1), transparent 60%)',
        }}
      />
      <div className="container-x relative grid gap-14 lg:grid-cols-2 lg:items-center">
        {/* Left: narrative */}
        <Reveal>
          <div>
            <p className="kicker">
              <span className="eyebrow-line" />
              About Samrat Electronics
            </p>
            <h2 className="section-title">
              Raipur&apos;s trusted name in <span className="text-gradient-blue">precision cooling</span>
            </h2>
            <p className="mt-6 text-base leading-relaxed text-slate-300 sm:text-lg">
              Located at Sharda Chowk, Samrat Electronics is an electronics store and HVAC solutions
              company serving hospitals, commercial spaces and homes across Raipur. As an
              authorized dealer for India&apos;s leading air-conditioning brands, we design, supply,
              install and maintain complete climate-control systems.
            </p>
            <p className="mt-4 text-base leading-relaxed text-slate-400">
              From a single hi-wall split to building-wide VRF networks, every project is sized,
              installed and commissioned with the same discipline — {BUSINESS.tagline.toLowerCase()}
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <a href={BUSINESS.phoneHref} className="btn-ghost !px-6 !py-3 text-sm">
                <Phone className="h-4 w-4 text-cyan-300" aria-hidden="true" />
                Talk to us — {BUSINESS.phoneDisplay}
              </a>
            </div>
          </div>
        </Reveal>

        {/* Right: business card + features */}
        <div className="relative">
          <Reveal delay={120}>
            <div className="glass-strong relative overflow-hidden rounded-[2rem] p-8 sm:p-10">
              <div
                className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-cyan-500/15 blur-3xl"
                aria-hidden="true"
              />
              <div className="flex items-center gap-4">
                <Logo />
                <div>
                  <h3 className="font-display text-xl font-extrabold text-white">SAMRAT ELECTRONICS</h3>
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-300">HVAC Solutions</p>
                </div>
              </div>
              <p className="mt-5 font-display text-lg italic text-slate-200">&ldquo;{BUSINESS.tagline}&rdquo;</p>
              <div className="mt-6 space-y-2 border-t border-white/10 pt-6 text-sm text-slate-300">
                <p><span className="font-semibold text-white">Phone:</span> {BUSINESS.phoneDisplay}</p>
                <p><span className="font-semibold text-white">Email:</span> {BUSINESS.email}</p>
                <p><span className="font-semibold text-white">Address:</span> {BUSINESS.addressLines[0]} {BUSINESS.addressLines[1]}</p>
              </div>
            </div>
          </Reveal>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {FEATURES.map((f, i) => (
              <Reveal key={f.title} delay={180 + i * 90}>
                <div className="glass group h-full rounded-2xl p-5 transition-all duration-300 hover:-translate-y-1 hover:border-cyan-400/40">
                  <f.icon className="h-6 w-6 text-cyan-300" aria-hidden="true" />
                  <h4 className="mt-3 font-display text-sm font-bold text-white">{f.title}</h4>
                  <p className="mt-1.5 text-xs leading-relaxed text-slate-400">{f.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
