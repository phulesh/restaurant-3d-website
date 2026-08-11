import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Menu, X, ArrowUpRight } from 'lucide-react'
import { navigation } from '../data/siteData'
import { Logo } from './UI'
import { useAuth } from '../context/AuthContext'

export default function Navigation() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const onKey = (event) => event.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    document.body.classList.toggle('menu-open', open)
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.classList.remove('menu-open')
    }
  }, [open])

  const handleNavClick = (href) => {
    if (href.startsWith('#')) {
      const el = document.querySelector(href)
      if (el) { el.scrollIntoView({ behavior: 'smooth' }); setOpen(false); return; }
    }
    setOpen(false)
  }

  return (
    <header className={`navbar ${scrolled ? 'is-scrolled' : ''}`}>
      <div className="nav-inner shell">
        <Logo />
        <nav className="desktop-nav" aria-label="Primary navigation">
          {navigation.map((item) => <a key={item.label} href={item.href} onClick={(e) => { e.preventDefault(); handleNavClick(item.href); }}>{item.label}</a>)}
        </nav>
        <div className="nav-actions">
          {user ? (
            <Link className="nav-cta" to="/dashboard">Dashboard <ArrowUpRight size={16} /></Link>
          ) : (
            <>
              <Link className="nav-login" to="/login">Login</Link>
              <Link className="nav-cta" to="/signup">Get Started <ArrowUpRight size={16} /></Link>
            </>
          )}
          <button className="menu-button" onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-controls="mobile-menu" aria-label={open ? 'Close menu' : 'Open menu'}>
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </div>
      <AnimatePresence>
        {open && (
          <motion.nav id="mobile-menu" className="mobile-nav" aria-label="Mobile navigation" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.25 }}>
            <div className="shell">
              {navigation.map((item, index) => (
                <motion.a key={item.label} href={item.href} onClick={(e) => { e.preventDefault(); handleNavClick(item.href); }} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.035 }}>
                  <span>0{index + 1}</span>{item.label}<ArrowUpRight size={17} />
                </motion.a>
              ))}
              {user ? (
                <Link className="mobile-login" to="/dashboard" onClick={() => setOpen(false)}>Dashboard</Link>
              ) : (
                <Link className="mobile-login" to="/login" onClick={() => setOpen(false)}>Client login</Link>
              )}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  )
}
