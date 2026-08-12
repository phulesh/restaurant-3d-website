/**
 * Production lead engine: qualify → uniqueLeadKey → create or update → Sheets sync.
 */

import { v4 as uuid } from 'uuid';
import db from '../db/index.js';
import {
  buildUniqueLeadKey,
  canonicalizeService,
  canonicalizeSource,
  canonicalizeStatus,
  formatLeadCode,
  normalizeName,
  normalizePhone,
  parseLeadCodeNumber,
  todayISODate,
} from '../utils/leadIdentity.js';
import {
  evaluateQualification,
  extractLeadFields,
  nextQualificationQuestion,
} from '../utils/leadQualification.js';
import { createNotification } from '../utils/notifications.js';
import { getUserSheetsClient, leadToSheetRow } from './googleSheets.js';

const DEFAULT_STATUS = 'New Lead';

export function nextLeadCode(userId) {
  const row = db.prepare(`
    SELECT lead_code FROM leads
    WHERE user_id = ? AND lead_code IS NOT NULL
    ORDER BY CAST(REPLACE(lead_code, 'LEAD-', '') AS INTEGER) DESC
    LIMIT 1
  `).get(userId);
  return formatLeadCode(parseLeadCodeNumber(row?.lead_code) + 1);
}

export function findLeadByUniqueKey(userId, uniqueLeadKey) {
  if (!uniqueLeadKey) return null;
  return db.prepare(
    'SELECT * FROM leads WHERE user_id = ? AND unique_lead_key = ? LIMIT 1'
  ).get(userId, uniqueLeadKey);
}

function calculateLeadScore({ budget, service, source, email, phone }) {
  let score = 30;
  if (budget && budget !== 'Not provided' && budget !== '—' && budget !== '') {
    const numBudget = parseInt(String(budget).replace(/[^0-9]/g, ''), 10);
    if (Number.isFinite(numBudget)) {
      if (numBudget >= 50000) score += 30;
      else if (numBudget >= 20000) score += 20;
      else if (numBudget >= 5000) score += 10;
      else score += 5;
    } else {
      score += 5;
    }
  }
  if (service && service !== 'General Inquiry') score += 15;
  if (source === 'WhatsApp' || source === 'Telegram') score += 10;
  if (email) score += 5;
  if (phone) score += 5;
  return Math.min(100, score);
}

function mergeRequirement(existing, incoming) {
  const next = (incoming || '').trim();
  const prev = (existing || '').trim();
  if (!next) return prev || null;
  if (!prev) return next;
  if (prev.includes(next) || next.includes(prev)) return next.length > prev.length ? next : prev;
  return `${prev}\n${next}`.slice(0, 2000);
}

function mergeConversationHistory(existingRaw, incomingText) {
  let history = [];
  if (existingRaw) {
    try { history = JSON.parse(existingRaw); } catch { history = []; }
  }
  if (!Array.isArray(history)) history = [];
  if (incomingText && incomingText.trim()) {
    const last = history[history.length - 1];
    if (!last || last.text !== incomingText.trim()) {
      history.push({ text: incomingText.trim(), at: new Date().toISOString() });
    }
  }
  return JSON.stringify(history.slice(-50));
}

export async function syncLeadToSheets(userId, lead, { sheetsClient, allowAppend = true } = {}) {
  try {
    let client = sheetsClient;
    if (!client) {
      const resolved = await getUserSheetsClient(db, userId);
      if (!resolved.connected) {
        db.prepare(`
          UPDATE leads
          SET google_sheets_sync_status = 'not_connected',
              google_sheets_error = NULL,
              updated_at = datetime('now')
          WHERE id = ?
        `).run(lead.id);
        return { ...lead, google_sheets_sync_status: 'not_connected', google_sheets_error: null, sheets_operation: null };
      }
      client = resolved.client;
    }

    if (!client || client.isConfigured === false) {
      db.prepare(`
        UPDATE leads
        SET google_sheets_sync_status = 'not_connected',
            google_sheets_error = NULL,
            updated_at = datetime('now')
        WHERE id = ?
      `).run(lead.id);
      return { ...lead, google_sheets_sync_status: 'not_connected', sheets_operation: null };
    }

    const result = await client.syncLead(lead, { allowAppend });
    if (result.status === 'synced' && result.confirmed) {
      db.prepare(`
        UPDATE leads
        SET google_sheets_sync_status = 'synced',
            google_sheets_error = NULL,
            google_sheets_row = ?,
            updated_at = datetime('now')
        WHERE id = ?
      `).run(result.rowNumber || lead.google_sheets_row || null, lead.id);
      const updated = db.prepare('SELECT * FROM leads WHERE id = ?').get(lead.id);
      return { ...updated, sheets_operation: result.operation };
    }

    const error = result.error || 'Google Sheets API did not confirm the write';
    db.prepare(`
      UPDATE leads
      SET google_sheets_sync_status = ?,
          google_sheets_error = ?,
          updated_at = datetime('now')
      WHERE id = ?
    `).run(result.status === 'not_connected' ? 'not_connected' : 'failed', error, lead.id);
    const updated = db.prepare('SELECT * FROM leads WHERE id = ?').get(lead.id);
    return { ...updated, sheets_operation: result.operation || null };
  } catch (err) {
    const message = err.message || 'Google Sheets sync failed';
    db.prepare(`
      UPDATE leads
      SET google_sheets_sync_status = 'failed',
          google_sheets_error = ?,
          updated_at = datetime('now')
      WHERE id = ?
    `).run(message, lead.id);
    const updated = db.prepare('SELECT * FROM leads WHERE id = ?').get(lead.id);
    return { ...updated, sheets_operation: null };
  }
}

export async function retryLeadSync(userId, leadId, { sheetsClient } = {}) {
  const lead = db.prepare('SELECT * FROM leads WHERE id = ? AND user_id = ?').get(leadId, userId);
  if (!lead) return null;
  return syncLeadToSheets(userId, lead, {
    sheetsClient,
    allowAppend: lead.google_sheets_sync_status !== 'synced',
  });
}

/**
 * Ingest a qualified inquiry.
 * Never creates a second lead for the same uniqueLeadKey.
 */
export async function ingestLead({
  userId,
  name,
  phone,
  email,
  service,
  budget,
  requirement,
  source,
  status,
  notes,
  conversationId,
  conversationText,
  alreadyQualified = false,
  allowConversion = false,
  sheetsClient,
} = {}) {
  const extracted = {
    name: name ? name.trim() : null,
    phone: phone ? normalizePhone(phone) : null,
    email: email || null,
    service,
    budget,
    requirement,
  };

  const qualification = evaluateQualification({
    extracted: { ...extracted, serviceSlug: canonicalizeService(service).slug },
    alreadyQualified,
    messages: conversationText ? [{ sender: 'customer', content: conversationText }] : undefined,
  });

  if (!qualification.qualified) {
    return {
      action: 'skipped',
      reason: qualification.reason,
      missing: qualification.missing,
      lead: null,
      uniqueLeadKey: buildUniqueLeadKey(name, phone, service),
    };
  }

  const serviceInfo = canonicalizeService(service);
  const uniqueLeadKey = buildUniqueLeadKey(name, phone, service);
  if (!uniqueLeadKey) {
    return {
      action: 'skipped',
      reason: 'missing_required_fields',
      missing: ['name', 'phone', 'service'].filter((field) => {
        if (field === 'name') return !normalizeName(name);
        if (field === 'phone') return !normalizePhone(phone);
        return !serviceInfo.slug;
      }),
      lead: null,
      uniqueLeadKey: null,
    };
  }

  const resolvedSource = canonicalizeSource(source, alreadyQualified ? 'Manual' : 'Other');
  const now = todayISODate();
  const existing = findLeadByUniqueKey(userId, uniqueLeadKey);

  if (existing) {
    const nextStatus = status
      ? (status === 'Converted' && !allowConversion && existing.status !== 'Converted'
        ? existing.status
        : canonicalizeStatus(status, existing.status))
      : existing.status;

    const nextEmail = email || existing.email;
    const nextBudget = budget || existing.budget;
    const nextRequirement = mergeRequirement(existing.requirement, requirement);
    const history = mergeConversationHistory(existing.conversation_history, conversationText);
    const score = calculateLeadScore({
      budget: nextBudget,
      service: serviceInfo.display,
      source: existing.source || resolvedSource,
      email: nextEmail,
      phone: existing.phone,
    });

    db.prepare(`
      UPDATE leads SET
        email = ?,
        budget = ?,
        requirement = ?,
        notes = COALESCE(?, notes),
        conversation_history = ?,
        last_contacted = ?,
        status = ?,
        score = ?,
        updated_at = datetime('now')
      WHERE id = ?
    `).run(
      nextEmail,
      nextBudget,
      nextRequirement,
      notes ?? null,
      history,
      now,
      nextStatus,
      score,
      existing.id
    );

    if (conversationId) {
      db.prepare('UPDATE conversations SET lead_id = ? WHERE id = ?').run(existing.id, conversationId);
    }

    const updated = db.prepare('SELECT * FROM leads WHERE id = ?').get(existing.id);
    const alreadyInSheet = existing.google_sheets_sync_status === 'synced' || Boolean(existing.google_sheets_row);
    const synced = await syncLeadToSheets(userId, updated, { sheetsClient, allowAppend: !alreadyInSheet });
    return {
      action: 'updated',
      reason: 'duplicate_unique_key',
      lead: synced,
      uniqueLeadKey,
      created: false,
    };
  }

  // New leads never auto-convert.
  const initialStatus = status && status !== 'Converted'
    ? canonicalizeStatus(status, DEFAULT_STATUS)
    : DEFAULT_STATUS;
  if (allowConversion && status === 'Converted') {
    // only if caller is an explicit CRM conversion
  }

  const id = uuid();
  const leadCode = nextLeadCode(userId);
  const displayName = name.trim().replace(/\s+/g, ' ');
  const displayPhone = normalizePhone(phone);
  const displayService = serviceInfo.display || service;
  const score = calculateLeadScore({
    budget,
    service: displayService,
    source: resolvedSource,
    email,
    phone: displayPhone,
  });
  const history = mergeConversationHistory(null, conversationText);

  db.prepare(`
    INSERT INTO leads (
      id, user_id, lead_code, unique_lead_key, name, phone, email, service, budget,
      source, status, score, notes, requirement, last_contacted, conversation_history,
      google_sheets_sync_status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
  `).run(
    id,
    userId,
    leadCode,
    uniqueLeadKey,
    displayName,
    displayPhone,
    email || null,
    displayService,
    budget || null,
    resolvedSource,
    DEFAULT_STATUS === initialStatus || status === 'Converted' ? DEFAULT_STATUS : initialStatus,
    score,
    notes || null,
    requirement || null,
    now,
    history
  );

  if (conversationId) {
    db.prepare('UPDATE conversations SET lead_id = ? WHERE id = ?').run(id, conversationId);
  }

  createNotification(
    userId,
    'new_lead',
    'New Lead Created',
    `${displayName} · ${displayService} (${leadCode}) added to your pipeline.`
  );

  const created = db.prepare('SELECT * FROM leads WHERE id = ?').get(id);
  const synced = await syncLeadToSheets(userId, created, { sheetsClient, allowAppend: true });
  return {
    action: 'created',
    reason: 'new_unique_key',
    lead: synced,
    uniqueLeadKey,
    created: true,
  };
}

export async function processConversationForLead({
  userId,
  conversationId,
  source,
  sheetsClient,
} = {}) {
  const messages = db.prepare(
    'SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at ASC'
  ).all(conversationId);

  const customerMessages = messages.filter((m) => m.sender === 'customer');
  const extracted = extractLeadFields(customerMessages);
  const qualification = evaluateQualification({ messages, extracted });

  if (!qualification.qualified) {
    return {
      action: 'skipped',
      reason: qualification.reason,
      missing: qualification.missing,
      extracted,
      followUp: nextQualificationQuestion(qualification.missing),
      lead: null,
    };
  }

  const conversationText = customerMessages.map((m) => m.content).join('\n');
  const result = await ingestLead({
    userId,
    name: extracted.name,
    phone: extracted.phone,
    email: extracted.email,
    service: extracted.service,
    budget: extracted.budget,
    requirement: extracted.requirement,
    source: source || 'AI Chat',
    conversationId,
    conversationText,
    alreadyQualified: true,
    sheetsClient,
  });

  return { ...result, extracted, followUp: null };
}

export function leadPublicView(lead) {
  if (!lead) return null;
  return {
    ...lead,
    google_sheets_synced: lead.google_sheets_sync_status === 'synced',
    sheet_row: leadToSheetRow(lead),
  };
}
