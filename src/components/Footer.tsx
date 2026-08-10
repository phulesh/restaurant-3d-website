import { Mail, MapPin, Phone } from 'lucide-react'
import { BUSINESS, NAV_LINKS } from '../lib/business'
import { SERVICES } from '../data/content'
import { Logo } from './Logo'

export default function Footer() {
  return (
    <footer className="relative border-t border-white/10 bg-[#04070b]">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent"
        aria-hidden="true"
      />
      <div className="container-x grid gap-12 px-5 py-16 sm:px-8 md:grid-cols-2 lg:grid-cols-4 lg:px-14">
        {/* Brand */}
        <div>
          <a href="#home" className="flex items-center gap-2.5" aria-label="Samrat Electronics – back to top">
            <Logo />
            <span className="flex flex-col leading-none">
              <span className="font-display text-sm font-extrabold tracking-[0.14em] text-white">
                SAMRAT <span className="text-cyan-400">ELECTRONICS</span>
              </span>
              <span className="mt-1 text-[9px] font-semibold uppercase tracking-[0.3em] text-slate-400">HVAC Solutions</span>
            </span>
          </a>
          <p className="mt-5 max-w-xs text-sm leading-relaxed text-slate-400">
            {BUSINESS.tagline}
          </p>
          <p className="mt-4 inline-flex items-center gap-2 rounded-full border border-cyan-400/25 bg-cyan-400/10 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-wider text-cyan-300">
            Authorized Dealer · 6 Leading Brands
          </p>
        </div>

        {/* Quick links */}
        <nav aria-label="Footer navigation">
          <h3 className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500">Quick Links</h3>
          <ul className="mt-5 space-y-2.5">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <a href={link.href} className="text-sm text-slate-300 transition-colors hover:text-cyan-300">
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* Services */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500">Services</h3>
          <ul className="mt-5 grid grid-cols-1 gap-2.5">
            {SERVICES.map((s) => (
              <li key={s.title}>
                <a href="#solutions" className="text-sm text-slate-300 transition-colors hover:text-cyan-300">
                  {s.title}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500">Contact</h3>
          <ul className="mt-5 space-y-4 text-sm text-slate-300">
            <li>
              <a href={BUSINESS.phoneHref} className="flex items-start gap-3 transition-colors hover:text-cyan-300">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-cyan-400" aria-hidden="true" />
                {BUSINESS.phoneDisplay}
              </a>
            </li>
            <li>
              <a href={`mailto:${BUSINESS.email}`} className="flex items-start gap-3 break-all transition-colors hover:text-cyan-300">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-cyan-400" aria-hidden="true" />
                {BUSINESS.email}
              </a>
            </li>
            <li className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-cyan-400" aria-hidden="true" />
              <span>
                {BUSINESS.addressLines[0]}
                <br />
                {BUSINESS.addressLines[1]}
              </span>
            </li>
          </ul>
          <p className="mt-5 text-xs text-slate-500">
            Mon–Sat: 10:00 AM – 10:00 PM
            <br />
            Sunday: Closed
          </p>
        </div>
      </div>

      <div className="border-t border-white/5">
        <div className="container-x flex flex-col items-center justify-between gap-3 px-5 pb-24 pt-6 text-xs text-slate-500 sm:flex-row sm:px-8 sm:py-6 lg:px-14">
          <p>© {new Date().getFullYear()} Samrat Electronics, Raipur. All rights reserved.</p>
          <p>Brand names and trademarks belong to their respective owners.</p>
        </div>
      </div>
    </footer>
  )
}
