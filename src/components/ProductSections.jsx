import { motion } from 'framer-motion'
import { ArrowDown, ArrowRight, Check, CircleCheck, MoreHorizontal } from 'lucide-react'
import { features, impactMetrics, integrations, problems, qualificationLeads } from '../data/siteData'
import { Button, Icon, Reveal, SectionHeading } from './UI'

export function SocialProof() {
  return (
    <section className="section social-proof" id="social-proof">
      <div className="shell">
        <Reveal><SectionHeading eyebrow="One connected system" title="One AI Assistant. Every Sales Conversation." text="Bring your busiest customer channels into one intelligent revenue workflow." /></Reveal>
        <div className="integration-grid">
          {integrations.map((item, index) => (
            <Reveal className={`integration-card integration-${item.color}`} delay={index * 0.055} key={item.name}>
              <div className="integration-icon"><Icon name={item.icon} size={26} /></div>
              <span>{item.name}</span><i className="status-dot" />
            </Reveal>
          ))}
        </div>
        <div className="impact-grid">
          {impactMetrics.map((item, index) => (
            <Reveal className="impact-item" delay={index * 0.07} key={item.label}>
              <strong>{item.value}</strong><span>{item.label}</span>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

export function Problems() {
  return (
    <section className="section problems-section">
      <div className="shell">
        <Reveal><SectionHeading eyebrow="The hidden revenue leak" title="Stop Losing Leads in Chat" text="Every slow reply and missed follow-up gives a ready-to-buy customer another reason to leave." /></Reveal>
        <div className="problem-grid">
          {problems.map((problem, index) => (
            <Reveal className="problem-card glass-card" delay={index * 0.09} key={problem.number}>
              <div className="problem-top"><span>{problem.number}</span><div className="problem-orbit"><Icon name={problem.icon} size={25} /></div></div>
              <h3>{problem.title}</h3><p>{problem.text}</p>
              <div className="warning-line"><i /><i /><i /></div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

const extractionFields = [
  ['Name', 'Rahul'], ['Service', 'AI Chatbot'], ['Budget', '₹15,000'], ['Source', 'WhatsApp'], ['Status', 'New Lead'],
]

export function AISolution() {
  return (
    <section className="section solution-section section-grid" id="ai-demo">
      <div className="shell">
        <Reveal><SectionHeading eyebrow="Your always-on sales rep" title="Your AI Sales Assistant Works 24/7" text="Natural conversations in. Qualified, organized opportunities out—without manual data entry." /></Reveal>
        <Reveal className="solution-stage">
          <div className="solution-topbar">
            <div><span className="window-dots"><i /><i /><i /></span><b>Live conversation</b></div>
            <span className="ai-online"><i /> AI agent online</span>
          </div>
          <div className="solution-body">
            <div className="conversation-pane">
              <div className="chat-header"><div className="chat-avatar">RS</div><div><b>Rahul</b><span>WhatsApp customer</span></div><MoreHorizontal size={20} /></div>
              <div className="chat-body">
                <motion.div className="message customer" initial={{ opacity: 0, x: -15 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: .25 }}>Hello, mujhe AI chatbot chahiye.<small>10:42</small></motion.div>
                <motion.div className="message ai" initial={{ opacity: 0, x: 15 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: .65 }}>Bilkul! Main aapko AI chatbot solution ke baare mein help karta hoon. Aapka naam kya hai?<small>AI · 10:42 <Check size={12} /></small></motion.div>
                <motion.div className="message customer short" initial={{ opacity: 0, x: -15 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 1.05 }}>Rahul<small>10:43</small></motion.div>
                <motion.div className="message ai" initial={{ opacity: 0, x: 15 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 1.45 }}>Thanks Rahul. Aapka preferred budget kya hai?<small>AI · 10:43 <Check size={12} /></small></motion.div>
                <div className="typing-indicator"><i /><i /><i /><span>AI is extracting lead data</span></div>
              </div>
            </div>
            <div className="processing-spine"><span>UNDERSTAND</span><div><i /><ArrowRight size={16} /><i /></div><span>STRUCTURE</span></div>
            <div className="extract-pane">
              <div className="extract-header"><div className="extract-icon"><Icon name="ScanText" size={20} /></div><div><b>Lead extracted</b><span>Updated in real time</span></div><CircleCheck size={20} /></div>
              <div className="confidence"><span>AI confidence</span><b>96%</b><div><i /></div></div>
              <div className="extract-fields">
                {extractionFields.map(([label, value], index) => (
                  <motion.div key={label} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 1.2 + index * .15 }}>
                    <span>{label}</span><b>{value}</b>{label === 'Status' ? <em>NEW</em> : <Check size={14} />}
                  </motion.div>
                ))}
              </div>
              <motion.div className="crm-sync" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 2 }}><i><Check size={13} /></i><span><b>Synced to CRM</b> just now</span></motion.div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

export function Features() {
  return (
    <section className="section features-section" id="features">
      <div className="shell">
        <Reveal><SectionHeading eyebrow="Everything connected" title="A Complete AI Revenue Engine" text="Nine powerful capabilities. One focused system for faster, more consistent sales." /></Reveal>
        <div className="feature-grid">
          {features.map((feature, index) => (
            <Reveal className={`feature-card glass-card ${index === 0 || index === 5 ? 'feature-accent' : ''}`} delay={(index % 3) * 0.06} key={feature.title}>
              <div className="feature-icon"><Icon name={feature.icon} size={23} /></div>
              <span className="feature-index">0{index + 1}</span>
              <h3>{feature.title}</h3><p>{feature.text}</p>
              <div className="feature-link">Explore capability <ArrowRight size={15} /></div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

export function Channels() {
  return (
    <section className="section channels-section section-grid" id="channels">
      <div className="shell channel-layout">
        <Reveal className="channel-copy">
          <SectionHeading align="left" eyebrow="Omnichannel by design" title="Connect Your Favorite Messaging Channels" text="Your customers stay where they are. AI SalesFlow brings every conversation, intent signal and lead into one place." />
          <div className="mini-flow-list">
            {['AI understands intent', 'AI responds naturally', 'Lead information extracted', 'CRM and admin updated'].map((item) => <div key={item}><CircleCheck size={17} />{item}</div>)}
          </div>
          <Button href="mailto:hello@aisalesflow.app?subject=Connect%20my%20channels">Connect Your Channels</Button>
        </Reveal>
        <Reveal className="network-stage">
          <div className="network-ring ring-one" /><div className="network-ring ring-two" />
          <div className="network-lines"><i className="line-tl" /><i className="line-tr" /><i className="line-b" /></div>
          <div className="network-node node-center"><div><Icon name="BrainCircuit" size={28} /></div><b>AI Sales Agent</b><span>Intent engine</span></div>
          <div className="network-node node-whatsapp"><div><Icon name="MessageCircle" size={25} /></div><b>WhatsApp</b><span>Message received</span></div>
          <div className="network-node node-telegram"><div><Icon name="Send" size={24} /></div><b>Telegram</b><span>Message received</span></div>
          <div className="network-node node-crm"><div><Icon name="PanelsTopLeft" size={24} /></div><b>CRM</b><span>Lead updated</span></div>
          <span className="travel-dot dot-one" /><span className="travel-dot dot-two" /><span className="travel-dot dot-three" />
          <div className="message-chip chip-one">Need AI automation <ArrowDown size={12} /></div>
          <div className="message-chip chip-two"><Check size={12} /> Lead scored 92</div>
        </Reveal>
      </div>
    </section>
  )
}

export function Qualification() {
  return (
    <section className="section qualification-section">
      <div className="shell">
        <Reveal><SectionHeading eyebrow="Prioritize with precision" title="AI That Knows Which Leads Matter" text="Give your team a clear, explainable signal for who to contact first." /></Reveal>
        <div className="lead-score-grid">
          {qualificationLeads.map((lead, index) => (
            <Reveal className={`score-card score-${lead.tone}`} delay={index * .08} key={lead.name}>
              <div className="score-head"><span><Icon name={lead.icon} size={16} />{lead.tag}</span><em>{lead.status}</em></div>
              <div className="score-person"><div>{lead.name.split(' ').map((n) => n[0]).join('')}</div><h3>{lead.name}</h3></div>
              <div className="score-details"><span>Service <b>{lead.service}</b></span><span>Budget <b>{lead.budget}</b></span><span>Intent <b>{lead.intent}</b></span></div>
              <div className="score-value"><span>Lead score</span><strong>{lead.score}<small>/100</small></strong></div>
              <div className="score-bar"><motion.i initial={{ width: 0 }} whileInView={{ width: `${lead.score}%` }} viewport={{ once: true }} transition={{ duration: 1, delay: .25 + index * .1 }} /></div>
              <a className="score-open" href="#lead-details">Open lead <ArrowRight size={15} /></a>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
