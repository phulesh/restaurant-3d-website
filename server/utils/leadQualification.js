/**
 * Real lead qualification — do not treat greetings or one-word replies as leads.
 * A lead requires name + phone + service + genuine business intent.
 */

import { canonicalizeService, normalizeName, normalizePhone } from './leadIdentity.js';

const TRIVIAL_MESSAGES = new Set([
  'hi', 'hello', 'hey', 'hiya', 'yo', 'sup',
  'ok', 'okay', 'k', 'kk', 'yes', 'no', 'yep', 'nope', 'yeah',
  'thanks', 'thank you', 'thankyou', 'thx', 'ty',
  'price', 'price?', 'cost', 'cost?', 'pricing',
  'hmm', 'hm', 'ok thanks', 'okay thanks', 'thanks!',
  'good morning', 'good afternoon', 'good evening', 'good night',
  'bye', 'goodbye', 'see you', 'cool', 'great', 'nice',
]);

const NAME_STOPWORDS = new Set([
  'interested', 'looking', 'calling', 'trying', 'here', 'there', 'good',
  'fine', 'okay', 'available', 'using', 'from', 'the', 'this', 'that',
  'ready', 'just', 'also', 'still', 'really', 'very', 'need', 'want',
  'please', 'help', 'hello', 'today', 'tomorrow', 'someone', 'anyone',
]);

const INTENT_RE = /\b(want|wants|need|needs|looking|interest|interested|quote|pricing|price|cost|buy|purchase|demo|automat|bot|crm|whatsapp|telegram|integrat|service|require|requirement|business|sales|lead|inquiry|enquiry|set ?up|setup|build|implement|deploy)\b/i;

export function isTrivialCustomerText(text) {
  const cleaned = String(text || '')
    .toLowerCase()
    .replace(/[!.?,]+/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  if (!cleaned) return true;
  if (TRIVIAL_MESSAGES.has(cleaned)) return true;
  if (cleaned.length <= 12 && /^(hi|hello|hey|ok|okay|thanks|thank you|price)\b/.test(cleaned)) {
    return true;
  }
  return false;
}

export function extractName(text) {
  const raw = String(text || '');
  const patterns = [
    /(?:my name is|this is|i am|i'm|im)\s+([A-Z][a-zA-Z]{1,30}(?:\s+[A-Z][a-zA-Z]{1,30})?)/i,
    /(?:name\s*[:\-]\s*)([A-Z][a-zA-Z]{1,30}(?:\s+[A-Z][a-zA-Z]{1,30})?)/i,
  ];
  for (const re of patterns) {
    const match = raw.match(re);
    if (match) {
      const candidate = match[1].trim();
      if (!NAME_STOPWORDS.has(candidate.toLowerCase())) return titleCaseName(candidate);
    }
  }

  // Structured lines: a lone 2–3 word capitalized name on its own line
  const lines = raw.split(/\n+/).map((l) => l.trim()).filter(Boolean);
  for (const line of lines) {
    if (/^[A-Z][a-zA-Z]{1,30}(?:\s+[A-Z][a-zA-Z]{1,30}){0,2}$/.test(line)
      && !NAME_STOPWORDS.has(line.toLowerCase())
      && !canonicalizeService(line).slug.includes('bot')
      && line.split(' ').length <= 3) {
      const lower = line.toLowerCase();
      if (!/\b(whatsapp|telegram|crm|automation|bot|service)\b/.test(lower)) {
        return titleCaseName(line);
      }
    }
  }
  return null;
}

export function extractPhone(text) {
  const raw = String(text || '');
  const patterns = [
    /(?:\+|00)?\d{1,3}[-.\s]?\(?\d{2,5}\)?[-.\s]?\d{3,5}[-.\s]?\d{3,5}/,
    /(?:\+?\d{1,3}[-.\s]?)?\d{10,13}/,
  ];
  for (const re of patterns) {
    const match = raw.match(re);
    if (!match) continue;
    const normalized = normalizePhone(match[0]);
    if (normalized.length >= 8 && normalized.length <= 15) return normalized;
  }
  return null;
}

export function extractEmail(text) {
  const match = String(text || '').match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  return match ? match[0].toLowerCase() : null;
}

export function extractBudget(text) {
  const raw = String(text || '');
  const match = raw.match(
    /(?:budget|price|cost|spend|invest|quote)\s*(?:is|of|around|about|upto|up to|:)?\s*(?:₹|rs\.?|inr|usd|\$)?\s*([\d,]+(?:\.\d+)?\s*(?:k|lakh|lac|l)?)/i
  );
  if (match) return match[1].replace(/\s+/g, ' ').trim();

  const currency = raw.match(/(?:₹|rs\.?\s*|inr\s*)([\d,]+(?:\.\d+)?)/i);
  if (currency) return currency[1].replace(/,/g, '');
  return null;
}

export function extractService(text) {
  const normalized = String(text || '').toLowerCase();

  const catalogHints = [
    { test: /whatsapp/, fallback: 'WhatsApp AI Bot' },
    { test: /telegram/, fallback: 'Telegram AI Bot' },
    { test: /\bcrm\b/, fallback: 'CRM Automation' },
    { test: /sales automation|sales bot/, fallback: 'Sales Automation' },
    { test: /lead gen|lead generation/, fallback: 'Lead Generation' },
    { test: /chatbot|ai bot|ai chatbot/, fallback: 'AI Chatbot' },
  ];

  for (const hint of catalogHints) {
    if (hint.test.test(normalized)) {
      return canonicalizeService(hint.fallback);
    }
  }
  return { slug: '', display: '', normalized: '' };
}

export function extractRequirement(text) {
  const raw = String(text || '').replace(/\s+/g, ' ').trim();
  if (!raw || isTrivialCustomerText(raw)) return null;
  if (raw.length < 12) return null;
  // Prefer a sentence that describes what they want
  const want = raw.match(/.{0,40}\b(want|need|looking|require|interested).{10,220}/i);
  if (want) return want[0].trim().slice(0, 500);
  if (raw.length >= 20) return raw.slice(0, 500);
  return null;
}

export function extractLeadFields(messagesOrText) {
  const text = Array.isArray(messagesOrText)
    ? messagesOrText.filter((m) => m && (m.sender === 'customer' || !m.sender)).map((m) => m.content).join('\n')
    : String(messagesOrText || '');

  const name = extractName(text);
  const phone = extractPhone(text);
  const email = extractEmail(text);
  const budget = extractBudget(text);
  const serviceInfo = extractService(text);
  const requirement = extractRequirement(text);

  return {
    name: name || null,
    phone: phone || null,
    email: email || null,
    budget: budget || null,
    service: serviceInfo.display || null,
    serviceSlug: serviceInfo.slug || null,
    requirement: requirement || null,
    rawText: text,
  };
}

export function evaluateQualification({ messages, extracted, alreadyQualified = false } = {}) {
  if (alreadyQualified) {
    const name = extracted?.name;
    const phone = extracted?.phone;
    const service = extracted?.service || extracted?.serviceSlug;
    if (name && phone && service) {
      return { qualified: true, reason: 'explicit_qualified_inquiry', missing: [] };
    }
    return {
      qualified: false,
      reason: 'missing_required_fields',
      missing: ['name', 'phone', 'service'].filter((f) => {
        if (f === 'name') return !name;
        if (f === 'phone') return !phone;
        return !service;
      }),
    };
  }

  const customerTexts = Array.isArray(messages)
    ? messages.filter((m) => m.sender === 'customer').map((m) => String(m.content || ''))
    : [String(extracted?.rawText || '')];
  const allCustomer = customerTexts.join('\n').trim();

  const fields = extracted || extractLeadFields(messages || allCustomer);
  const missing = [];
  if (!fields.name) missing.push('name');
  if (!fields.phone) missing.push('phone');
  if (!fields.service && !fields.serviceSlug) missing.push('service');

  if (!allCustomer || isTrivialCustomerText(allCustomer)) {
    return { qualified: false, reason: 'no_business_intent', missing };
  }

  // Pricing-only / curiosity questions are not leads until identity is collected.
  if (missing.length) {
    const reason = missing.length === 3 && !INTENT_RE.test(allCustomer)
      ? 'no_business_intent'
      : 'missing_required_fields';
    return { qualified: false, reason, missing };
  }

  const hasIntent = INTENT_RE.test(allCustomer) || Boolean(fields.requirement);
  // Complete name + phone + specific service collected in-conversation is a real inquiry.
  if (!hasIntent && allCustomer.length < 20) {
    return { qualified: false, reason: 'insufficient_intent', missing: [] };
  }

  return { qualified: true, reason: 'qualified_inquiry', missing: [] };
}

export function nextQualificationQuestion(missing = []) {
  if (missing.includes('name') && missing.includes('phone') && missing.includes('service')) {
    return 'I can help with that. Which service are you looking for, and could I get your name and phone number so we can follow up properly?';
  }
  if (missing.includes('name') && missing.includes('phone')) {
    return 'Happy to help. Could I get your name and the best phone number to reach you?';
  }
  if (missing.includes('name')) {
    return 'Thanks — who should I address this inquiry to?';
  }
  if (missing.includes('phone')) {
    return 'Thanks. What is the best phone number to reach you on?';
  }
  if (missing.includes('service')) {
    return 'Which service are you interested in — for example WhatsApp AI Bot, Telegram AI Bot, or CRM Automation?';
  }
  return null;
}

function titleCaseName(name) {
  return normalizeName(name).replace(/\b\w/g, (c) => c.toUpperCase());
}
