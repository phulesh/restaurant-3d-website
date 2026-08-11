import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, Check, ChevronDown, LockKeyhole, Quote, ShieldCheck, Sparkles, Star } from 'lucide-react'
import { faqs, footerGroups, pricingPlans, testimonials } from '../data/siteData'
import { Button, Icon, Logo, Reveal, SectionHeading } from './UI'

const securityFeatures = [
  ['KeyRound', 'Secure API connections'], ['UsersRound', 'Role-based access'], ['Database', 'CRM data protection'], ['SlidersHorizontal', 'Admin controls'], ['History', 'Conversation history'], ['BadgeCheck', 'Reliable automation'],
]

export function Security() {
  return (
    <section className="section security-section">
      <div className="shell security-layout">
        <Reveal className="security-visual">
          <div className="shield-scene">
            <div className="shield-rings"><i /><i /><i /></div>
            <div className="shield-body"><ShieldCheck size={76} strokeWidth={1.1} /><span>SECURE</span></div>
            <span className="security-particle p1" /><span className="security-particle p2" /><span className="security-particle p3" /><span className="security-particle p4" />
            <div className="encrypted-chip"><LockKeyhole size={13} /> Connection encrypted</div>
          </div>
        </Reveal>
        <Reveal className="security-copy">
          <SectionHeading align="left" eyebrow="Enterprise-grade foundation" title="Built for Business" text="Your customer conversations and sales data deserve a system designed around control, reliability and responsible access." />
          <div className="security-grid">
            {securityFeatures.map(([icon, label]) => <div key={label}><span><Icon name={icon} size={17} /></span>{label}<Check size={14} /></div>)}
          </div>
          <div className="security-note"><ShieldCheck size={18} /><p><b>Your data stays under your control.</b><span>Defined access, transparent workflows and protected business context.</span></p></div>
        </Reveal>
      </div>
    </section>
  )
}

export function Pricing() {
  return (
    <section className="section pricing-section section-grid" id="pricing">
      <div className="shell">
        <Reveal><SectionHeading eyebrow="Plans that grow with you" title="Start Simple. Scale Without Limits." text="Choose the capabilities you need now. Every implementation is scoped to your channels, volume and workflow." /></Reveal>
        <Reveal className="pricing-control"><span>All plans include secure onboarding and guided setup</span><i /><b>No surprise fees</b></Reveal>
        <div className="pricing-grid">
          {pricingPlans.map((plan, index) => (
            <Reveal className={`pricing-card ${plan.featured ? 'featured' : ''}`} delay={index * .08} key={plan.name}>
              {plan.featured && <div className="popular"><Sparkles size={13} /> MOST POPULAR</div>}
              <div className="plan-head"><span>{plan.name}</span><p>{plan.description}</p></div>
              <div className="plan-price"><strong>{plan.price}</strong><span>{plan.period}</span></div>
              <a href={plan.href} className={`plan-cta ${plan.featured ? 'primary' : ''}`}>{plan.cta}<ArrowRight size={16} /></a>
              <div className="plan-divider" /><span className="includes">WHAT'S INCLUDED</span>
              <ul>{plan.features.map((feature) => <li key={feature}><i><Check size={13} /></i>{feature}</li>)}</ul>
            </Reveal>
          ))}
        </div>
        <p className="pricing-footnote">Need a tailored rollout? <a href="mailto:sales@aisalesflow.app?subject=Custom%20AI%20SalesFlow%20rollout">Talk to our solutions team <ArrowRight size={14} /></a></p>
      </div>
    </section>
  )
}

export function Testimonials() {
  return (
    <section className="section testimonials-section">
      <div className="shell">
        <Reveal><SectionHeading eyebrow="Built for real operators" title="Built to Help Businesses Sell Smarter" text="Less inbox administration. More context, faster follow-up and a pipeline your team can trust." /></Reveal>
        <div className="testimonials-grid">
          {testimonials.map((testimonial, index) => (
            <Reveal className="testimonial-card" delay={index * .08} key={testimonial.name}>
              <div className="testimonial-top"><Quote size={28} /><div>{[1,2,3,4,5].map((star) => <Star key={star} size={13} fill="currentColor" />)}</div></div>
              <blockquote>“{testimonial.quote}”</blockquote>
              <div className="testimonial-person"><div className={`portrait portrait-${testimonial.avatarPosition}`} role="img" aria-label={`Portrait of ${testimonial.name}`} /><span><b>{testimonial.name}</b><small>{testimonial.role}</small></span></div>
            </Reveal>
          ))}
        </div>
        <Reveal className="customer-strip"><span>TRUSTED WORKFLOWS FOR</span>{['Agencies', 'Consulting', 'Real Estate', 'Education', 'B2B Services'].map((name) => <b key={name}><i />{name}</b>)}</Reveal>
      </div>
    </section>
  )
}

export function FAQ() {
  const [open, setOpen] = useState(0)
  return (
    <section className="section faq-section" id="faq">
      <div className="shell faq-layout">
        <Reveal className="faq-copy">
          <SectionHeading align="left" eyebrow="Clear answers" title="Frequently Asked Questions" text="Everything you need to evaluate AI SalesFlow for your sales operation." />
          <div className="faq-help"><div><Icon name="MessagesSquare" size={20} /></div><p><b>Still have a question?</b><span>Talk to a product specialist about your workflow.</span></p><a href="mailto:hello@aisalesflow.app?subject=AI%20SalesFlow%20question">Ask us <ArrowRight size={14} /></a></div>
        </Reveal>
        <Reveal className="faq-list">
          {faqs.map((item, index) => {
            const expanded = open === index
            return (
              <div className={`faq-item ${expanded ? 'open' : ''}`} key={item.q}>
                <button type="button" aria-expanded={expanded} onClick={() => setOpen(expanded ? -1 : index)}><span>{String(index + 1).padStart(2, '0')}</span><b>{item.q}</b><i><ChevronDown size={18} /></i></button>
                <AnimatePresence initial={false}>
                  {expanded && <motion.div className="faq-answer" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: .28 }}><p>{item.a}</p></motion.div>}
                </AnimatePresence>
              </div>
            )
          })}
        </Reveal>
      </div>
    </section>
  )
}

export function FinalCTA() {
  return (
    <section className="section final-cta" id="contact">
      <div className="shell">
        <Reveal className="cta-stage">
          <div className="cta-grid" /><div className="cta-glow" />
          <div className="cta-orb" aria-hidden="true"><i /><i /><i /><div><Sparkles /></div></div>
          <div className="cta-content"><div className="eyebrow"><span /> Your next growth channel is already open</div><h2>Your Next Customer Could Be in Your Next Message.</h2><p>Let AI handle conversations, capture leads, qualify prospects and keep your sales pipeline organized.</p><div><Button href="#pricing">Start Building Your AI Sales System</Button><Button href="mailto:hello@aisalesflow.app?subject=Book%20an%20AI%20SalesFlow%20demo" variant="secondary" icon="CalendarDays">Book a Demo</Button></div><small><Check size={14} /> Guided setup <i /> <Check size={14} /> No credit card required <i /> <Check size={14} /> Human support</small></div>
        </Reveal>
      </div>
    </section>
  )
}

export function Footer() {
  const social = [
    ['Telegram', 'Send', 'https://telegram.org/'], ['WhatsApp', 'MessageCircle', 'https://www.whatsapp.com/'], ['Instagram', 'Instagram', 'https://www.instagram.com/'], ['LinkedIn', 'Linkedin', 'https://www.linkedin.com/'],
  ]
  return (
    <footer className="site-footer">
      <div className="shell footer-grid">
        <div className="footer-brand"><Logo /><p>AI-powered sales automation for WhatsApp, Telegram and modern businesses.</p><div className="footer-status"><i /> All systems operational</div></div>
        {footerGroups.map((group) => <div className="footer-group" key={group.title}><h3>{group.title}</h3>{group.links.map((link) => <a key={link.label} href={link.href}>{link.label}</a>)}</div>)}
        <div className="footer-group footer-connect"><h3>Connect</h3><p>Follow product updates and automation insights.</p><div>{social.map(([label, icon, href]) => <a key={label} href={href} target="_blank" rel="noreferrer" aria-label={label}><Icon name={icon} size={17} /></a>)}</div><a className="footer-email" href="mailto:hello@aisalesflow.app">hello@aisalesflow.app</a></div>
      </div>
      <div className="shell footer-bottom"><span>© 2026 AI SalesFlow. All rights reserved.</span><div><span>Designed for modern revenue teams</span><a href="#home">Back to top ↑</a></div></div>
    </footer>
  )
}
