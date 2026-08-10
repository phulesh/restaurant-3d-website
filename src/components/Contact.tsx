import { Mail, MapPin, Navigation, Phone } from 'lucide-react'
import { BUSINESS } from '../lib/business'
import Reveal from './Reveal'

const CHANNELS = [
  {
    icon: Phone,
    label: 'Call us',
    value: BUSINESS.phoneDisplay,
    href: BUSINESS.phoneHref,
    cta: 'CALL NOW',
  },
  {
    icon: Mail,
    label: 'Email us',
    value: BUSINESS.email,
    href: `mailto:${BUSINESS.email}`,
    cta: 'SEND EMAIL',
  },
  {
    icon: MapPin,
    label: 'Visit us',
    value: 'Shop No. C-4, Sharda Chowk, Raipur',
    href: BUSINESS.mapsUrl,
    cta: 'GET DIRECTIONS',
    external: true,
  },
]

export default function Contact() {
  return (
    <section id="contact" className="section-pad relative overflow-hidden bg-[#070b11]">
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
        style={{
          background:
            'radial-gradient(900px 500px at 50% 100%, rgba(14,116,144,0.22), transparent 65%), linear-gradient(180deg, #05080c 0%, #070b11 100%)',
        }}
      />
      <div className="container-x relative">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="kicker justify-center">
            <span className="eyebrow-line" />
            Get In Touch
            <span className="eyebrow-line" />
          </p>
          <h2 className="section-title">
            Let&apos;s design your <span className="text-gradient-blue">perfect climate</span>
          </h2>
          <p className="mt-4 text-slate-400">
            New project, replacement unit, or a system that needs servicing — one call is all it takes.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {CHANNELS.map((c, i) => (
            <Reveal key={c.label} delay={i * 100}>
              <a
                href={c.href}
                {...(c.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                className="glass group flex h-full flex-col items-center rounded-3xl p-8 text-center transition-all duration-300 hover:-translate-y-1.5 hover:border-cyan-400/40 hover:shadow-[0_24px_60px_-24px_rgba(34,211,238,0.4)]"
              >
                <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-400/30 bg-cyan-400/10 transition-transform duration-300 group-hover:scale-110">
                  <c.icon className="h-7 w-7 text-cyan-300" aria-hidden="true" />
                </span>
                <h3 className="mt-5 font-display text-lg font-bold text-white">{c.label}</h3>
                <p className="mt-1.5 break-all text-sm text-slate-300">{c.value}</p>
                <span className="mt-5 inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-[0.18em] text-cyan-300">
                  {c.cta}
                  <Navigation className="h-3.5 w-3.5 rotate-45" aria-hidden="true" />
                </span>
              </a>
            </Reveal>
          ))}
        </div>

        {/* Business card strip */}
        <Reveal delay={160}>
          <div className="glass-strong mx-auto mt-14 flex max-w-3xl flex-col items-center gap-4 rounded-3xl p-8 text-center sm:flex-row sm:justify-between sm:text-left">
            <div>
              <h3 className="font-display text-xl font-extrabold text-white">Samrat Electronics</h3>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-300">HVAC Solutions</p>
              <p className="mt-2 text-xs text-slate-400">{BUSINESS.addressShort}</p>
            </div>
            <a href={BUSINESS.phoneHref} className="btn-primary shrink-0 px-8! py-4!">
              <Phone className="h-5 w-5" aria-hidden="true" />
              Call Now
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
