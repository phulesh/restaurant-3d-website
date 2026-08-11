import { useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import {
  BadgeCheck, BellRing, Bot, BotMessageSquare, BrainCircuit, CalendarClock,
  ChartNoAxesCombined, Columns3, Database, DatabaseZap, Flame, Gauge,
  Headphones, History, IndianRupee, Instagram, KeyRound, LayoutDashboard,
  Linkedin, MessageCircle, MessageCircleMore, MessageSquareOff,
  MessageSquareText, MessagesSquare, PanelsTopLeft, PhoneCall, RefreshCw,
  ScanSearch, ScanText, Send, Sheet, SlidersHorizontal, Snowflake, Sparkles,
  SunMedium, TimerOff, UserRoundPlus, UsersRound, Workflow,
} from 'lucide-react'

const iconMap = {
  BadgeCheck, BellRing, Bot, BotMessageSquare, BrainCircuit, CalendarClock,
  ChartNoAxesCombined, Columns3, Database, DatabaseZap, Flame, Gauge,
  Headphones, History, IndianRupee, Instagram, KeyRound, LayoutDashboard,
  Linkedin, MessageCircle, MessageCircleMore, MessageSquareOff,
  MessageSquareText, MessagesSquare, PanelsTopLeft, PhoneCall, RefreshCw,
  ScanSearch, ScanText, Send, Sheet, SlidersHorizontal, Snowflake, Sparkles,
  SunMedium, TimerOff, UserRoundPlus, UsersRound, Workflow,
}

export function Icon({ name, size = 20, strokeWidth = 1.8, ...props }) {
  const Component = iconMap[name] || Sparkles
  return <Component size={size} strokeWidth={strokeWidth} aria-hidden="true" {...props} />
}

export function Logo({ compact = false }) {
  return (
    <a className="brand" href="#home" aria-label="AI SalesFlow home">
      <span className="brand-mark" aria-hidden="true"><span>AI</span><i /></span>
      {!compact && <span className="brand-name">AI Sales<span>Flow</span></span>}
    </a>
  )
}

export function Button({ href, children, variant = 'primary', icon = 'ArrowUpRight', className = '', ...props }) {
  const arrowIcons = {
    ArrowUpRight: () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M7 17 17 7M7 7h10v10" /></svg>,
    CalendarDays: () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M8 2v4m8-4v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14H3V6a2 2 0 0 1 2-2Z" /></svg>,
  }
  const ButtonIcon = arrowIcons[icon]
  return (
    <a href={href} className={`button button-${variant} ${className}`} {...props}>
      <span>{children}</span>{ButtonIcon && <ButtonIcon />}
    </a>
  )
}

export function SectionHeading({ eyebrow, title, text, align = 'center' }) {
  return (
    <div className={`section-heading align-${align}`}>
      {eyebrow && <div className="eyebrow"><span />{eyebrow}</div>}
      <h2>{title}</h2>
      {text && <p>{text}</p>}
    </div>
  )
}

export function Reveal({ children, className = '', delay = 0, y = 28, as = 'div' }) {
  const Component = motion[as] || motion.div
  return (
    <Component
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{ duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </Component>
  )
}

export function Counter({ value, suffix = '', duration = 1200 }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    if (!isInView) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setDisplay(value)
      return
    }
    let frame
    const started = performance.now()
    const tick = (now) => {
      const progress = Math.min(1, (now - started) / duration)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(value * eased)
      if (progress < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [duration, isInView, value])

  const formatted = Number.isInteger(value)
    ? Math.round(display).toLocaleString('en-IN')
    : display.toFixed(1)
  return <span ref={ref}>{formatted}{suffix}</span>
}
