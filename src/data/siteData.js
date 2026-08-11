// Central content configuration — update product copy, plans, navigation and social proof here.
export const navigation = [
  { label: 'Home', href: '#home' },
  { label: 'Features', href: '#features' },
  { label: 'How It Works', href: '#workflow' },
  { label: 'CRM', href: '#crm' },
  { label: 'Automation', href: '#automation' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'FAQ', href: '#faq' },
]

export const hero = {
  eyebrow: 'AI-native revenue operations',
  title: 'Turn Every Conversation Into a Customer',
  subtitle: 'AI-powered Telegram & WhatsApp Sales Assistant that talks to customers, qualifies leads, and manages your entire sales pipeline automatically.',
  primaryCta: { label: 'Start Free', href: '#pricing' },
  secondaryCta: { label: 'View Live Demo', href: '#ai-demo' },
  trust: ['AI Sales Automation', 'Lead Generation', 'CRM', 'WhatsApp', 'Telegram'],
}

export const integrations = [
  { name: 'WhatsApp', icon: 'MessageCircle', color: 'green' },
  { name: 'Telegram', icon: 'Send', color: 'cyan' },
  { name: 'AI Agent', icon: 'Sparkles', color: 'purple' },
  { name: 'CRM', icon: 'PanelsTopLeft', color: 'blue' },
  { name: 'Google Sheets', icon: 'Sheet', color: 'green' },
  { name: 'Automation', icon: 'Workflow', color: 'orange' },
]

export const impactMetrics = [
  { value: '24/7', label: 'AI Response' },
  { value: '100%', label: 'Automatic Lead Capture' },
  { value: 'AI', label: 'Smart Lead Qualification' },
  { value: '1', label: 'Centralized CRM' },
]

export const problems = [
  { number: '01', icon: 'TimerOff', title: 'Slow Responses', text: "Customers don't want to wait for manual replies." },
  { number: '02', icon: 'MessageSquareOff', title: 'Lost Leads', text: 'Important customer information gets buried inside conversations.' },
  { number: '03', icon: 'CalendarClock', title: 'Manual Follow-ups', text: 'Sales teams waste time manually tracking prospects and follow-ups.' },
]

export const features = [
  { icon: 'Bot', title: 'AI Customer Support', text: 'Answer customer questions instantly using your approved business knowledge.' },
  { icon: 'UserRoundPlus', title: 'AI Lead Generation', text: 'Turn unstructured conversations into complete, structured lead profiles.' },
  { icon: 'ScanSearch', title: 'Smart Lead Qualification', text: 'Detect requirements, service interest, intent and available budget.' },
  { icon: 'MessageCircleMore', title: 'WhatsApp Automation', text: 'Manage customer conversations and sales automation through WhatsApp.' },
  { icon: 'Send', title: 'Telegram Automation', text: 'Connect Telegram conversations directly with your AI sales system.' },
  { icon: 'PanelsTopLeft', title: 'Automatic CRM', text: 'Store every qualified lead automatically, with its full conversation context.' },
  { icon: 'Gauge', title: 'Lead Scoring', text: 'Automatically identify hot, warm and cold prospects in real time.' },
  { icon: 'BellRing', title: 'Follow-up Automation', text: 'Keep every opportunity moving with timely reminders and next actions.' },
  { icon: 'Headphones', title: 'Human Handoff', text: 'Transfer any conversation to a teammate with one click whenever required.' },
]

export const qualificationLeads = [
  { tone: 'hot', tag: 'HOT LEAD', icon: 'Flame', name: 'Rahul Sharma', service: 'AI Automation', budget: '₹50,000', intent: 'High', status: 'New Lead', score: 92 },
  { tone: 'warm', tag: 'WARM LEAD', icon: 'SunMedium', name: 'Priya Mehta', service: 'WhatsApp Bot', budget: '₹20,000', intent: 'Medium', status: 'Follow-up', score: 71 },
  { tone: 'cold', tag: 'COLD LEAD', icon: 'Snowflake', name: 'Amit Verma', service: 'General Inquiry', budget: 'Not provided', intent: 'Low', status: 'Nurture', score: 34 },
]

export const pipeline = [
  { stage: 'New Lead', count: 184, cards: [{ initials: 'RS', name: 'Rahul Sharma', value: '₹50k', channel: 'WhatsApp' }, { initials: 'NM', name: 'Neha Mehta', value: '₹32k', channel: 'Telegram' }] },
  { stage: 'Contacted', count: 112, cards: [{ initials: 'AK', name: 'Anil Kumar', value: '₹25k', channel: 'WhatsApp' }] },
  { stage: 'Qualified', count: 76, cards: [{ initials: 'PM', name: 'Priya Mehta', value: '₹80k', channel: 'Telegram' }] },
  { stage: 'Proposal', count: 41, cards: [{ initials: 'SK', name: 'Sanjay Kapur', value: '₹1.2L', channel: 'WhatsApp' }] },
  { stage: 'Won', count: 236, cards: [{ initials: 'DP', name: 'Divya Patel', value: '₹95k', channel: 'WhatsApp' }] },
]

export const workflow = [
  { icon: 'MessageSquareText', title: 'Customer Sends Message' },
  { icon: 'BrainCircuit', title: 'AI Understands Intent' },
  { icon: 'BotMessageSquare', title: 'AI Answers Customer' },
  { icon: 'ScanText', title: 'Lead Information Extracted' },
  { icon: 'Gauge', title: 'Lead Scored Automatically' },
  { icon: 'DatabaseZap', title: 'CRM Updated' },
  { icon: 'BellRing', title: 'Sales Team Notified' },
  { icon: 'RefreshCw', title: 'Follow-up Automated' },
]

export const analytics = [
  { value: 1248, suffix: '', label: 'Leads generated', trend: '+24.8%' },
  { value: 18.9, suffix: '%', label: 'Conversion rate', trend: '+3.2%' },
  { value: 76, suffix: '', label: 'Hot leads', trend: '+18 today' },
  { value: 7, suffix: 's', label: 'Avg. response', trend: '−42%' },
]

// Plan price labels are intentionally configuration-driven. Replace without editing UI components.
export const pricingPlans = [
  {
    name: 'Starter', price: 'Custom', period: 'for small businesses', description: 'Start capturing every conversation.',
    features: ['AI customer support', 'Telegram automation', 'Basic lead generation', 'Basic CRM', 'Lead notifications'],
    cta: 'Start Starter', href: 'mailto:hello@aisalesflow.app?subject=AI%20SalesFlow%20Starter', featured: false,
  },
  {
    name: 'Professional', price: 'Custom', period: 'for growing businesses', description: 'One intelligent system for your sales team.',
    features: ['WhatsApp + Telegram', 'Advanced AI Agent', 'Lead qualification', 'Lead scoring', 'CRM pipeline', 'Follow-up automation', 'Analytics'],
    cta: 'Start Professional', href: 'mailto:hello@aisalesflow.app?subject=AI%20SalesFlow%20Professional', featured: true,
  },
  {
    name: 'Enterprise', price: 'Let’s talk', period: 'for advanced sales teams', description: 'Built around your process and scale.',
    features: ['Everything in Professional', 'Custom AI workflows', 'Advanced automation', 'Custom CRM', 'Team management', 'API integration', 'Priority support'],
    cta: 'Contact Sales', href: 'mailto:sales@aisalesflow.app?subject=AI%20SalesFlow%20Enterprise', featured: false,
  },
]

export const testimonials = [
  { quote: 'Instead of manually checking every message, our AI assistant automatically captures and qualifies leads.', name: 'Arjun Malhotra', role: 'Founder, Northstar Digital', avatarPosition: 'left' },
  { quote: 'WhatsApp conversations are now directly connected to our sales pipeline. The team has context from the first call.', name: 'Meera Shah', role: 'Revenue Lead, AxisWorks', avatarPosition: 'center' },
  { quote: 'We stopped losing leads because every important conversation is tracked automatically.', name: 'Vikram Rao', role: 'Director, Orbit Labs', avatarPosition: 'right' },
]

export const faqs = [
  { q: 'What is an AI Sales Assistant?', a: 'An AI Sales Assistant is a conversational system trained on your business information. It answers customer questions, identifies buying intent, collects lead details and moves qualified opportunities into your sales process.' },
  { q: 'Can it work with WhatsApp?', a: 'Yes. AI SalesFlow can connect to an approved WhatsApp Business setup to manage conversations, collect lead information and trigger your configured workflows.' },
  { q: 'Can it work with Telegram?', a: 'Yes. Connect a Telegram bot or business workflow and let the same AI agent answer, qualify and route enquiries to your CRM.' },
  { q: 'How does AI capture leads?', a: 'The AI recognizes useful details inside the conversation—such as name, contact, requirement, budget and timing—and maps them into structured CRM fields.' },
  { q: 'Can AI qualify leads automatically?', a: 'Yes. Qualification rules can evaluate intent, budget, service fit and urgency, creating a transparent score your sales team can review.' },
  { q: 'Can leads be stored in a CRM?', a: 'Yes. Leads can be stored in the built-in visual CRM or sent to your connected system through supported integrations and APIs.' },
  { q: 'Can I connect Google Sheets?', a: 'Yes. Structured lead data can be synchronized to a Google Sheets workflow for reporting, backup or operations.' },
  { q: 'Can a human take over the conversation?', a: 'Absolutely. Your team can step in at any point, with the full conversation, extracted fields and lead score available for context.' },
  { q: 'Can I customize the AI responses?', a: 'Yes. You control the business knowledge, tone, qualification questions, escalation rules and response guardrails.' },
  { q: 'Is the system suitable for small businesses?', a: 'Yes. The Starter setup focuses on essential support, lead capture and CRM tools, while larger plans support more channels and custom workflows.' },
]

export const footerGroups = [
  { title: 'Product', links: [{ label: 'Features', href: '#features' }, { label: 'CRM', href: '#crm' }, { label: 'Automation', href: '#automation' }, { label: 'Integrations', href: '#channels' }, { label: 'Pricing', href: '#pricing' }] },
  { title: 'Company', links: [{ label: 'About', href: '#home' }, { label: 'Contact', href: 'mailto:hello@aisalesflow.app' }, { label: 'Privacy', href: 'mailto:legal@aisalesflow.app?subject=Privacy' }, { label: 'Terms', href: 'mailto:legal@aisalesflow.app?subject=Terms' }] },
]
