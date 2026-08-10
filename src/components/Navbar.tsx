import { useEffect, useState } from 'react'
import { Menu, Phone, X } from 'lucide-react'
import { BUSINESS, NAV_LINKS } from '../lib/business'
import { Logo } from './Logo'

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [active, setActive] = useState('#home')

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 24)
      const sections = NAV_LINKS.map((l) => l.href.slice(1))
      let current = '#home'
      for (const id of sections) {
        const el = document.getElementById(id)
        if (el && el.getBoundingClientRect().top <= 120) current = `#${id}`
      }
      setActive(current)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled || open
          ? 'border-b border-white/10 bg-[#05080c]/85 backdrop-blur-xl'
          : 'bg-transparent'
      }`}
    >
      <nav className="container-x flex h-16 items-center justify-between px-5 sm:px-8 lg:px-14" aria-label="Main navigation">
        <a href="#home" className="flex items-center gap-2.5" aria-label="Samrat Electronics – home">
          <Logo />
          <span className="flex flex-col leading-none">
            <span className="font-display text-sm font-extrabold tracking-[0.14em] text-white">
              SAMRAT <span className="text-cyan-400">ELECTRONICS</span>
            </span>
            <span className="mt-1 text-[9px] font-semibold uppercase tracking-[0.3em] text-slate-400">
              HVAC Solutions
            </span>
          </span>
        </a>

        {/* Desktop links */}
        <ul className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                aria-current={active === link.href ? 'page' : undefined}
                className={`relative rounded-full px-3.5 py-2 text-sm font-semibold transition-colors ${
                  active === link.href ? 'text-cyan-300' : 'text-slate-300 hover:text-white'
                }`}
              >
                {link.label}
                {active === link.href && (
                  <span className="absolute inset-x-3 -bottom-0.5 h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />
                )}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-3">
          <a href={BUSINESS.phoneHref} className="btn-primary hidden px-5! py-2.5! text-sm sm:inline-flex">
            <Phone className="h-4 w-4" aria-hidden="true" />
            Call Now
          </a>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? 'Close menu' : 'Open menu'}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white backdrop-blur lg:hidden"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div id="mobile-menu" className="fixed inset-x-0 top-16 bottom-0 z-40 overflow-y-auto bg-[#05080c]/95 backdrop-blur-2xl lg:hidden">
          <div className="flex flex-col px-6 pt-8">
            <ul className="flex flex-col gap-1">
              {NAV_LINKS.map((link, i) => (
                <li key={link.href} style={{ transitionDelay: `${i * 40}ms` }}>
                  <a
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className={`block rounded-2xl px-5 py-4 text-lg font-bold transition-colors ${
                      active === link.href ? 'bg-cyan-400/10 text-cyan-300' : 'text-white hover:bg-white/5'
                    }`}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
            <a href={BUSINESS.phoneHref} className="btn-primary mt-8 w-full py-4! text-base">
              <Phone className="h-5 w-5" aria-hidden="true" />
              Call Now · {BUSINESS.phoneDisplay}
            </a>
            <div className="mt-8 space-y-3 rounded-2xl glass p-5 text-sm text-slate-300">
              <p className="font-semibold text-white">Samrat Electronics</p>
              <p>{BUSINESS.addressShort}</p>
              <p className="text-cyan-300">{BUSINESS.phoneDisplay}</p>
              <p>{BUSINESS.email}</p>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
