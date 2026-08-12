/**
 * Deterministic lead identity.
 * uniqueLeadKey = normalizedName + "|" + normalizedPhone + "|" + normalizedService
 */

export const LEAD_STATUSES = ['New Lead', 'Contacted', 'Qualified', 'Converted', 'Lost'];

export const LEAD_SOURCES = ['Website', 'AI Chat', 'WhatsApp', 'Telegram', 'Manual', 'Webhook', 'Other'];

const SERVICE_CATALOG = [
  {
    slug: 'whatsapp_ai_bot',
    display: 'WhatsApp AI Bot',
    aliases: [
      'whatsapp ai bot', 'whatsapp + ai bot', 'whatsapp+ai bot', 'whatsapp aibot',
      'whatsapp bot', 'whatsapp automation', 'whatsapp ai', 'wa ai bot', 'wa bot',
      'whatsapp sales bot', 'whatsapp ai sales bot', 'whatsapp ai chatbot',
    ],
  },
  {
    slug: 'telegram_ai_bot',
    display: 'Telegram AI Bot',
    aliases: [
      'telegram ai bot', 'telegram + ai bot', 'telegram+ai bot', 'telegram aibot',
      'telegram bot', 'telegram automation', 'telegram ai', 'tg bot',
      'telegram sales bot', 'telegram ai chatbot',
    ],
  },
  {
    slug: 'crm_automation',
    display: 'CRM Automation',
    aliases: [
      'crm automation', 'crm', 'crm auto', 'crm system', 'crm integration',
      'crm setup', 'crm automations',
    ],
  },
  {
    slug: 'sales_automation',
    display: 'Sales Automation',
    aliases: ['sales automation', 'sales auto', 'sales bot', 'sales pipeline automation'],
  },
  {
    slug: 'ai_chatbot',
    display: 'AI Chatbot',
    aliases: ['ai chatbot', 'chatbot', 'ai bot', 'chat bot', 'website chatbot'],
  },
  {
    slug: 'lead_generation',
    display: 'Lead Generation',
    aliases: ['lead generation', 'lead gen', 'lead generation system'],
  },
];

const COUNTRY_CODES = [
  '971', '968', '966', '965', '974', '973', '880', '234',
  '92', '94', '93', '91', '90', '86', '84', '82', '81', '66', '65', '64',
  '63', '62', '61', '60', '55', '54', '52', '49', '48', '47', '46', '45',
  '44', '43', '41', '40', '39', '34', '33', '32', '31', '27', '20', '1',
].sort((a, b) => b.length - a.length);

export function normalizeName(name) {
  return String(name || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');
}

export function normalizePhone(phone) {
  if (phone === null || phone === undefined) return '';
  let digits = String(phone).replace(/[^\d]/g, '');
  if (!digits) return '';

  // International prefix 00
  if (digits.startsWith('00')) digits = digits.slice(2);

  // Local trunk prefix (e.g. 09876543210)
  if (digits.length === 11 && digits.startsWith('0')) {
    digits = digits.slice(1);
  }

  // A 10-digit number is already a national number (e.g. 9123456789).
  // Only strip a country code when the remainder is a full 10-digit number.
  if (digits.length > 10) {
    for (const code of COUNTRY_CODES) {
      if (digits.startsWith(code) && digits.length > code.length) {
        const rest = digits.slice(code.length);
        if (rest.length === 10) {
          digits = rest;
          break;
        }
      }
    }
  }

  return digits;
}

export function normalizeServiceText(service) {
  return String(service || '')
    .toLowerCase()
    .replace(/[+_/,-]+/g, ' ')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function canonicalizeService(service) {
  const normalized = normalizeServiceText(service);
  if (!normalized) {
    return { slug: '', display: '', normalized: '' };
  }

  for (const entry of SERVICE_CATALOG) {
    if (entry.slug === normalized.replace(/\s+/g, '_')) {
      return { slug: entry.slug, display: entry.display, normalized };
    }
    for (const alias of entry.aliases) {
      if (normalized === alias || normalized.replace(/\s+/g, '_') === alias.replace(/\s+/g, '_')) {
        return { slug: entry.slug, display: entry.display, normalized };
      }
    }
  }

  const slug = normalized.replace(/\s+/g, '_');
  const display = normalized.replace(/\b\w/g, (c) => c.toUpperCase());
  return { slug, display, normalized };
}

export function serviceDisplayName(service) {
  return canonicalizeService(service).display;
}

export function buildUniqueLeadKey(name, phone, service) {
  const normalizedName = normalizeName(name);
  const normalizedPhone = normalizePhone(phone);
  const { slug } = canonicalizeService(service);
  if (!normalizedName || !normalizedPhone || !slug) return null;
  return `${normalizedName}|${normalizedPhone}|${slug}`;
}

export function canonicalizeSource(source, fallback = 'Other') {
  if (!source || !String(source).trim()) return fallback;
  const raw = String(source).trim();
  if (LEAD_SOURCES.includes(raw)) return raw;

  const s = raw.toLowerCase();
  const map = {
    website: 'Website',
    web: 'Website',
    'web form': 'Website',
    webform: 'Website',
    'landing page': 'Website',
    'ai chat': 'AI Chat',
    'web ai': 'AI Chat',
    chat: 'AI Chat',
    ai: 'AI Chat',
    assistant: 'AI Chat',
    whatsapp: 'WhatsApp',
    wa: 'WhatsApp',
    telegram: 'Telegram',
    tg: 'Telegram',
    manual: 'Manual',
    direct: 'Manual',
    crm: 'Manual',
    webhook: 'Webhook',
    api: 'Webhook',
    other: 'Other',
    referral: 'Other',
  };
  return map[s] || fallback;
}

export function canonicalizeStatus(status, fallback = 'New Lead') {
  if (!status) return fallback;
  const raw = String(status).trim();
  if (LEAD_STATUSES.includes(raw)) return raw;
  const s = raw.toLowerCase();
  if (s === 'new' || s === 'new_lead') return 'New Lead';
  if (s === 'contacted') return 'Contacted';
  if (s === 'qualified') return 'Qualified';
  if (s === 'converted' || s === 'won') return 'Converted';
  if (s === 'lost') return 'Lost';
  return fallback;
}

export function todayISODate(date = new Date()) {
  const d = date instanceof Date ? date : new Date(date);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function formatLeadCode(n) {
  const num = Number(n);
  if (!Number.isFinite(num) || num < 1) return 'LEAD-001';
  return `LEAD-${String(num).padStart(3, '0')}`;
}

export function parseLeadCodeNumber(code) {
  if (!code) return 0;
  const match = String(code).match(/LEAD-(\d+)/i);
  return match ? parseInt(match[1], 10) : 0;
}
