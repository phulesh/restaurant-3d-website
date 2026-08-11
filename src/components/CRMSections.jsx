import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, Bell, Check, ChevronDown, Clock3, ExternalLink, Mail, MessageCircle, MoreHorizontal, Phone, Plus, Search, Send, Sparkles } from 'lucide-react'
import { analytics, pipeline, workflow } from '../data/siteData'
import { Button, Counter, Icon, Reveal, SectionHeading } from './UI'

const overviewStats = [
  ['Total Leads', 1248, 'UsersRound', '+24.8%'], ['New Leads', 184, 'UserRoundPlus', '+18 today'], ['Hot Leads', 76, 'Flame', '+12.4%'], ['Contacted', 412, 'PhoneCall', '+8.2%'], ['Closed', 236, 'BadgeCheck', '+15.1%'], ['Conversion', 18.9, 'ChartNoAxesCombined', '+3.2%'],
]

export function CRMDashboard() {
  const [view, setView] = useState('Pipeline')
  return (
    <section className="section crm-section section-grid" id="crm">
      <div className="shell">
        <Reveal><SectionHeading eyebrow="Visual CRM, zero data entry" title="A Pipeline That Updates Itself" text="See every lead, message and next action—from first contact to closed deal." /></Reveal>
        <Reveal className="crm-perspective">
          <div className="crm-window">
            <aside className="crm-sidebar">
              <div className="crm-mini-brand"><span><Sparkles size={15} /></span><b>SalesFlow</b></div>
              <nav aria-label="CRM demo navigation">
                {['Overview', 'Pipeline', 'Conversations', 'Contacts', 'Automation', 'Analytics'].map((item) => <button key={item} type="button" className={view === item ? 'active' : ''} onClick={() => setView(item)}><Icon name={{ Overview: 'LayoutDashboard', Pipeline: 'Columns3', Conversations: 'MessagesSquare', Contacts: 'UsersRound', Automation: 'Workflow', Analytics: 'ChartNoAxesCombined' }[item]} size={16} />{item}</button>)}
              </nav>
              <div className="crm-user"><div>AM</div><span><b>Arjun Mehta</b><small>Administrator</small></span><MoreHorizontal size={15} /></div>
            </aside>
            <div className="crm-main">
              <div className="crm-header">
                <div><span>Workspace / CRM</span><h3>{view === 'Pipeline' ? 'Sales Pipeline' : view}</h3></div>
                <div className="crm-actions"><button type="button" aria-label="Search leads"><Search size={16} /></button><button type="button" aria-label="Notifications"><Bell size={16} /><i /></button><a href="#lead-details"><Plus size={15} /> Add lead</a></div>
              </div>
              <div className="crm-stats">
                {overviewStats.map(([label, value, icon, trend]) => (
                  <div key={label}><span><Icon name={icon} size={15} />{label}</span><strong>{label === 'Conversion' ? <><Counter value={value} />%</> : <Counter value={value} />}</strong><small>{trend}</small></div>
                ))}
              </div>
              <div className="pipeline-head"><div><b>Pipeline board</b><span>1,248 total leads</span></div><div><button type="button">All sources <ChevronDown size={13} /></button><button type="button">This month <ChevronDown size={13} /></button></div></div>
              <div className="pipeline-board">
                {pipeline.map((column, colIndex) => (
                  <div className="pipeline-column" key={column.stage}>
                    <div className="column-head"><span><i />{column.stage}</span><em>{column.count}</em></div>
                    {column.cards.map((card, cardIndex) => (
                      <motion.a href="#lead-details" className="pipeline-card" key={card.name} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: .15 + colIndex * .08 + cardIndex * .05 }}>
                        <div><span>{card.initials}</span><b>{card.name}</b><MoreHorizontal size={14} /></div><p>{colIndex === 0 ? 'Interested in AI automation' : 'WhatsApp sales workflow'}</p><footer><span><Icon name={card.channel === 'WhatsApp' ? 'MessageCircle' : 'Send'} size={12} />{card.channel}</span><b>{card.value}</b></footer>
                      </motion.a>
                    ))}
                    <button className="add-card" type="button"><Plus size={13} /> Add lead</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

export function LeadDetails() {
  const stages = ['New Lead', 'Contacted', 'Qualified', 'Proposal', 'Won']
  const [stageIndex, setStageIndex] = useState(2)
  const [notice, setNotice] = useState('')
  const action = (message) => {
    setNotice(message)
    window.setTimeout(() => setNotice(''), 2200)
  }
  const moveStage = () => {
    setStageIndex((current) => Math.min(current + 1, stages.length - 1))
    action('Lead moved to the next stage')
  }
  return (
    <section className="section lead-details-section" id="lead-details">
      <div className="shell lead-detail-layout">
        <Reveal className="lead-detail-copy">
          <SectionHeading align="left" eyebrow="Every detail, in context" title="Know the Lead Before You Make the Call" text="AI summarizes the person, their needs, buying signals and full conversation history for a faster, more relevant follow-up." />
          <div className="context-points"><span><Check /> Complete customer context</span><span><Check /> Explainable lead score</span><span><Check /> One-click next actions</span></div>
        </Reveal>
        <Reveal className="lead-profile">
          <div className="lead-profile-top"><div className="profile-avatar">RS<i /></div><div><h3>Rahul Sharma</h3><span>Added from WhatsApp · 12 min ago</span></div><button type="button" aria-label="More options"><MoreHorizontal /></button></div>
          <div className="profile-tags"><span className="qualified-tag"><i />{stages[stageIndex]}</span><span>AI Automation</span></div>
          <div className="profile-grid">
            <div><span><Phone size={14} /> Phone</span><b>+91 XXXXX XXXXX</b></div><div><span><MessageCircle size={14} /> Source</span><b>WhatsApp</b></div><div><span><Icon name="IndianRupee" size={14} /> Budget</span><b>₹50,000</b></div><div><span><Icon name="Gauge" size={14} /> Lead Score</span><b className="green-text">92/100</b></div>
          </div>
          <div className="profile-message"><span>Last message <small>10:43 AM</small></span><p>“I want to automate my WhatsApp sales process.”</p></div>
          <div className="profile-score"><div><span>High purchase intent</span><b>92%</b></div><div><i /></div><small>AI detected strong product fit, confirmed budget, and an implementation timeline under 30 days.</small></div>
          <div className="profile-actions"><a href="tel:+910000000000"><Phone size={15} />Contact</a><button type="button" onClick={() => action('Follow-up reminder created')}><Clock3 size={15} />Follow Up</button><button type="button" onClick={moveStage}><ArrowRight size={15} />Move Stage</button><button className="close-action" type="button" onClick={() => { setStageIndex(4); action('Lead marked as won') }}><Check size={15} />Close Lead</button></div>
          <AnimatePresence>{notice && <motion.div className="action-toast" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}><Check size={14} />{notice}</motion.div>}</AnimatePresence>
        </Reveal>
      </div>
    </section>
  )
}

export function AutomationWorkflow() {
  return (
    <section className="section workflow-section section-grid" id="workflow">
      <div className="shell">
        <Reveal><SectionHeading eyebrow="One continuous workflow" title="From Message to Customer — Automatically" text="Eight connected steps remove friction without removing the human touch." /></Reveal>
        <div className="workflow-scroll">
          <div className="workflow-track">
            {workflow.map((step, index) => (
              <Reveal className="workflow-step" delay={index * .05} key={step.title}>
                <span className="step-number">{String(index + 1).padStart(2, '0')}</span><div className="step-icon"><Icon name={step.icon} size={21} /></div><h3>{step.title}</h3>
                {index < workflow.length - 1 && <div className="workflow-connector"><i /><ArrowRight size={14} /></div>}
              </Reveal>
            ))}
          </div>
        </div>
        <Reveal className="workflow-summary"><span><i /> ACTIVE AUTOMATION</span><p>Avg. processing time <b>2.8 seconds</b></p><p>Manual actions saved <b>8 per lead</b></p><Button href="/signup" variant="small">Build your flow</Button></Reveal>
      </div>
    </section>
  )
}

export function SheetsIntegration() {
  const headers = ['Date', 'Name', 'Phone', 'Service', 'Budget', 'Source', 'Status']
  const rows = [
    ['11 Aug 2026', 'Rahul Sharma', '+91 XXXXX', 'AI Automation', '₹50,000', 'WhatsApp', 'New Lead'],
    ['11 Aug 2026', 'Priya Mehta', '+91 XXXXX', 'WhatsApp Bot', '₹20,000', 'Telegram', 'Qualified'],
    ['10 Aug 2026', 'Amit Verma', '+91 XXXXX', 'General Inquiry', '—', 'WhatsApp', 'Nurture'],
  ]
  return (
    <section className="section sheets-section" id="automation">
      <div className="shell">
        <Reveal><SectionHeading eyebrow="Structured by default" title="From Chat to Organized Data Automatically" text="Transform natural conversation into clean, ready-to-use CRM and Google Sheets records." /></Reveal>
        <Reveal className="data-transform">
          <div className="data-chat-card"><div className="data-chat-head"><span><MessageCircle size={17} /></span><div><b>Rahul Sharma</b><small>WhatsApp · now</small></div><i /></div><div className="data-bubble">Hi, I need AI automation for our sales team. Budget is around ₹50k.</div><div className="data-processing"><Sparkles size={14} /> Extracting 7 fields<span><i /></span></div></div>
          <div className="transform-arrow"><span><ArrowRight /></span><small>AI structures data</small></div>
          <div className="sheet-window"><div className="sheet-bar"><div><Icon name="Sheet" size={18} /><b>Sales Leads — August 2026</b></div><span>Saved to Drive <Check size={13} /></span></div><div className="sheet-formula"><span>fx</span><p>Rahul Sharma</p></div><div className="sheet-scroll"><table><thead><tr>{headers.map((header, index) => <th key={header}><span>{String.fromCharCode(65 + index)}</span>{header}</th>)}</tr></thead><tbody>{rows.map((row, rowIndex) => <motion.tr key={rowIndex} className={rowIndex === 0 ? 'new-sheet-row' : ''} initial={rowIndex === 0 ? { opacity: 0, x: -20 } : false} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: .55 }}>{row.map((cell, index) => <td key={`${rowIndex}-${index}`}><span>{cell}</span></td>)}</motion.tr>)}</tbody></table></div></div>
        </Reveal>
      </div>
    </section>
  )
}

export function NotificationAndMemory() {
  const [returning, setReturning] = useState(false)
  return (
    <section className="section intelligence-section">
      <div className="shell intelligence-grid">
        <Reveal className="notification-block">
          <div className="small-section-heading"><span>INSTANT ADMIN ALERTS</span><h2>Your team knows the moment a lead is ready.</h2></div>
          <div className="telegram-notification">
            <div className="telegram-head"><div><Send size={20} /></div><span><b>AI SalesFlow Bot</b><small>Telegram · just now</small></span><i>•••</i></div>
            <div className="notification-title"><Bell size={17} /> <b>NEW LEAD</b></div>
            <dl><div><dt>Name</dt><dd>Rahul Sharma</dd></div><div><dt>Phone</dt><dd>+91 XXXXX XXXXX</dd></div><div><dt>Service</dt><dd>AI Automation</dd></div><div><dt>Budget</dt><dd>₹50,000</dd></div><div><dt>Source</dt><dd>WhatsApp</dd></div><div><dt>Lead Score</dt><dd className="green-text">92/100</dd></div><div><dt>Status</dt><dd>New Lead</dd></div></dl>
            <a href="#lead-details">View Lead <ExternalLink size={14} /></a>
          </div>
        </Reveal>
        <Reveal className="memory-block">
          <div className="small-section-heading"><span>CONVERSATIONAL MEMORY</span><h2>AI That Remembers the Conversation</h2><p>When customers return, the context returns with them.</p></div>
          <div className="memory-visual">
            <div className="memory-path"><div>Previous Conversation</div><ArrowRight /><div className="memory-core"><Icon name="BrainCircuit" size={25} /><i /><i /><i /></div><ArrowRight /><div>Personalized Response</div></div>
            <div className="memory-tags"><span>Pricing</span><span>AI chatbot</span><span>WhatsApp automation</span></div>
            <button type="button" className="memory-toggle" onClick={() => setReturning(!returning)}><span><i className={returning ? 'active' : ''} /></span> Simulate returning customer</button>
            <AnimatePresence mode="wait">
              <motion.div key={String(returning)} className="memory-response" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                <Sparkles size={15} /><p>{returning ? 'Welcome back, Rahul! Last time you were exploring our WhatsApp automation plan. Would you like to continue with implementation options?' : 'Memory ready. Turn on the simulation to see a personalized returning-customer response.'}</p>
              </motion.div>
            </AnimatePresence>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

export function Analytics() {
  const bars = [38, 52, 44, 67, 58, 76, 72, 93, 82, 100, 88, 112]
  return (
    <section className="section analytics-section">
      <div className="shell">
        <Reveal><SectionHeading eyebrow="Revenue intelligence" title="See What Your Sales Team Can't See" text="Turn thousands of messages into clear trends, channel performance and next actions." /></Reveal>
        <Reveal className="analytics-window">
          <div className="analytics-top"><div><span>Performance overview</span><h3>Revenue Intelligence</h3></div><div><button type="button">Last 30 days <ChevronDown size={14} /></button><button type="button"><Icon name="SlidersHorizontal" size={14} /> Filters</button></div></div>
          <div className="analytics-stats">
            {analytics.map((stat) => <div key={stat.label}><span>{stat.label}<i>{stat.trend}</i></span><strong><Counter value={stat.value} suffix={stat.suffix} /></strong></div>)}
          </div>
          <div className="analytics-grid">
            <div className="revenue-chart chart-card"><div className="chart-title"><div><span>Leads generated</span><b>Channel activity</b></div><div><span><i className="cyan-dot" />WhatsApp</span><span><i className="purple-dot" />Telegram</span></div></div><div className="bar-chart"><div className="axis"><span>120</span><span>80</span><span>40</span><span>0</span></div><div className="bars">{bars.map((height, index) => <motion.div key={index} initial={{ height: 0 }} whileInView={{ height }} viewport={{ once: true }} transition={{ duration: .55, delay: index * .03 }}><i style={{ height: `${Math.max(20, height * .6)}%` }} /></motion.div>)}</div></div><div className="chart-labels"><span>Week 1</span><span>Week 2</span><span>Week 3</span><span>Week 4</span></div></div>
            <div className="source-chart chart-card"><div className="chart-title"><div><span>Source performance</span><b>Lead distribution</b></div></div><div className="donut-wrap"><div className="donut"><span><b>1,248</b>Total leads</span></div><div className="donut-legend"><span><i className="cyan-dot" />WhatsApp <b>68%</b></span><span><i className="purple-dot" />Telegram <b>24%</b></span><span><i className="green-dot" />Other <b>8%</b></span></div></div></div>
            <div className="response-chart chart-card"><div className="chart-title"><div><span>AI performance</span><b>Response time</b></div><em>−42% faster</em></div><svg viewBox="0 0 520 120" preserveAspectRatio="none" aria-label="Average response time improved throughout the month"><defs><linearGradient id="area" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#20d9ff" stopOpacity=".35"/><stop offset="1" stopColor="#20d9ff" stopOpacity="0"/></linearGradient></defs><path className="area" d="M0,14 C50,15 60,35 110,37 S170,56 220,54 S290,76 340,71 S410,96 520,98 L520,120 L0,120Z"/><path className="line" d="M0,14 C50,15 60,35 110,37 S170,56 220,54 S290,76 340,71 S410,96 520,98"/></svg><div className="response-labels"><span>12.1s</span><span>Aug 1</span><span>7.0s</span></div></div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
