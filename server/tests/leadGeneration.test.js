/**
 * Production lead-generation + duplicate-detection + Google Sheets tests.
 * Run: npm test
 */

import fs from 'fs';
import os from 'os';
import path from 'path';
import { randomUUID as uuid } from 'crypto';

const testDb = path.join(os.tmpdir(), `salesflow-lead-test-${process.pid}-${Date.now()}.db`);
process.env.DATABASE_PATH = testDb;
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret';

const { runMigrations } = await import('../db/migrations.js');
const db = (await import('../db/index.js')).default;
const {
  buildUniqueLeadKey,
  canonicalizeService,
  normalizeName,
  normalizePhone,
} = await import('../utils/leadIdentity.js');
const {
  evaluateQualification,
  extractLeadFields,
  isTrivialCustomerText,
} = await import('../utils/leadQualification.js');
const { ingestLead, processConversationForLead } = await import('../services/leadEngine.js');
const { createGoogleSheetsClient, SHEET_HEADERS } = await import('../services/googleSheets.js');

runMigrations();

const results = [];
let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function runCase(name, fn) {
  try {
    await fn();
    passed += 1;
    results.push({ name, ok: true });
    console.log(`PASS  ${name}`);
  } catch (err) {
    failed += 1;
    results.push({ name, ok: false, error: err.message });
    console.error(`FAIL  ${name}`);
    console.error(`      ${err.message}`);
  }
}

function createUser() {
  const id = uuid();
  db.prepare('INSERT INTO users (id, full_name, email, password_hash) VALUES (?, ?, ?, ?)')
    .run(id, 'Test Owner', `owner-${id.slice(0, 8)}@example.com`, 'hash');
  return id;
}

function countLeads(userId) {
  return db.prepare('SELECT COUNT(*) as n FROM leads WHERE user_id = ?').get(userId).n;
}

function listLeads(userId) {
  return db.prepare('SELECT * FROM leads WHERE user_id = ? ORDER BY lead_code ASC').all(userId);
}

function addConversation(userId, customerMessages, channel = 'web') {
  const id = uuid();
  db.prepare(`
    INSERT INTO conversations (id, user_id, customer_name, channel, last_message_at)
    VALUES (?, ?, 'Customer', ?, datetime('now'))
  `).run(id, userId, channel);
  for (const content of customerMessages) {
    db.prepare('INSERT INTO messages (id, conversation_id, sender, content) VALUES (?, ?, ?, ?)')
      .run(uuid(), id, 'customer', content);
  }
  return id;
}

function addCustomerMessage(conversationId, content) {
  db.prepare('INSERT INTO messages (id, conversation_id, sender, content) VALUES (?, ?, ?, ?)')
    .run(uuid(), conversationId, 'customer', content);
}

function createSheetsHarness({ failAppend = false, failConfirm = false } = {}) {
  const state = {
    headers: false,
    rows: [],
    appends: 0,
    updates: 0,
    reads: 0,
    calls: [],
  };

  const fetchImpl = async (url, options = {}) => {
    const method = (options.method || 'GET').toUpperCase();
    state.calls.push({ method, url });
    const body = options.body ? (typeof options.body === 'string' ? JSON.parse(options.body) : options.body) : {};

    if (url.includes('/spreadsheets/') && !url.includes('/values') && method === 'GET') {
      return json(200, { spreadsheetId: 'sheet123', properties: { title: 'Leads' } });
    }

    if (url.includes('/values/') && url.includes(':append') && method === 'POST') {
      if (failAppend) return json(500, { error: { message: 'Sheets unavailable' } });
      if (failConfirm) return json(200, {});
      const row = body.values[0];
      state.rows.push(row);
      state.appends += 1;
      const rowNumber = state.rows.length + 1;
      return json(200, {
        updates: {
          updatedRange: `Sheet1!A${rowNumber}:L${rowNumber}`,
          updatedRows: 1,
          updatedCells: 12,
        },
      });
    }

    if (url.includes('/values/') && method === 'PUT') {
      if (failConfirm) return json(200, {});
      const decoded = decodeURIComponent(url);
      const rangeMatch = decoded.match(/!A(\d+)/);
      const rowNumber = rangeMatch ? parseInt(rangeMatch[1], 10) : 1;
      const row = body.values[0];
      if (rowNumber === 1) {
        state.headers = true;
        return json(200, { updatedRange: 'Sheet1!A1:L1', updatedRows: 1, updatedCells: 12 });
      }
      state.rows[rowNumber - 2] = row;
      state.updates += 1;
      return json(200, { updatedRange: `Sheet1!A${rowNumber}:L${rowNumber}`, updatedRows: 1, updatedCells: 12 });
    }

    if (url.includes('/values/') && method === 'GET') {
      state.reads += 1;
      const values = state.headers || state.rows.length ? [SHEET_HEADERS, ...state.rows] : [];
      return json(200, { values });
    }

    return json(404, { error: { message: `Unexpected Sheets URL ${method} ${url}` } });
  };

  const client = createGoogleSheetsClient({
    config: { spreadsheet_id: 'sheet123', worksheet: 'Sheet1', access_token: 'test-access-token' },
    fetchImpl,
  });

  return { client, state };
}

function json(status, body) {
  return {
    ok: status >= 200 && status < 300,
    status,
    text: async () => JSON.stringify(body),
  };
}

const userId = createUser();
const sheets = createSheetsHarness();

// ---------------------------------------------------------------------------
// Identity unit checks (support the uniqueLeadKey contract)
// ---------------------------------------------------------------------------
await runCase('Identity: name / phone / service normalization', async () => {
  assert(normalizeName('  Rahul   Kumar ') === 'rahul kumar', 'name should trim and collapse spaces');
  assert(normalizePhone('+91 98765-43210') === '9876543210', 'phone should strip country code and formatting');
  assert(normalizePhone('(987) 654-3210') === '9876543210', 'phone should strip brackets');
  assert(canonicalizeService('WhatsApp + AI Bot').slug === 'whatsapp_ai_bot', 'service aliases must collapse');
  assert(canonicalizeService('whatsapp ai bot').slug === 'whatsapp_ai_bot', 'lowercase service must match');
  assert(canonicalizeService('WhatsApp AI Bot').slug === canonicalizeService('WhatsApp + AI Bot').slug, 'equivalent services');
  const key = buildUniqueLeadKey('Rahul', '+91 98765 43210', 'WhatsApp + AI Bot');
  assert(key === 'rahul|9876543210|whatsapp_ai_bot', `unexpected key: ${key}`);
});

// ---------------------------------------------------------------------------
// TEST 1
// ---------------------------------------------------------------------------
let whatsappLead;
await runCase('TEST 1: Rahul / 9876543210 / WhatsApp AI Bot → NEW LEAD + one Sheets row', async () => {
  const result = await ingestLead({
    userId,
    name: 'Rahul',
    phone: '9876543210',
    email: 'rahul@gmail.com',
    service: 'WhatsApp AI Bot',
    budget: '15000',
    requirement: 'Wants AI sales bot',
    source: 'Telegram',
    alreadyQualified: true,
    sheetsClient: sheets.client,
  });
  assert(result.action === 'created', `expected created, got ${result.action}`);
  assert(result.lead.lead_code === 'LEAD-001', `expected LEAD-001, got ${result.lead.lead_code}`);
  assert(result.lead.status === 'New Lead', 'new lead must start as New Lead, not Converted');
  assert(result.uniqueLeadKey === 'rahul|9876543210|whatsapp_ai_bot', result.uniqueLeadKey);
  assert(result.lead.google_sheets_sync_status === 'synced', `expected synced after API confirm, got ${result.lead.google_sheets_sync_status}`);
  assert(sheets.state.appends === 1, `expected 1 append, got ${sheets.state.appends}`);
  assert(countLeads(userId) === 1, `expected 1 CRM lead, got ${countLeads(userId)}`);
  whatsappLead = result.lead;
});

// ---------------------------------------------------------------------------
// TEST 2
// ---------------------------------------------------------------------------
await runCase('TEST 2: same name + phone + service → SAME LEAD, no new row', async () => {
  const result = await ingestLead({
    userId,
    name: 'Rahul',
    phone: '+91-9876543210',
    service: 'whatsapp ai bot',
    budget: '18000',
    requirement: 'Needs follow-up on WhatsApp bot',
    source: 'AI Chat',
    alreadyQualified: true,
    sheetsClient: sheets.client,
  });
  assert(result.action === 'updated', `expected updated, got ${result.action}`);
  assert(result.lead.id === whatsappLead.id, 'Lead ID must stay the same');
  assert(result.lead.lead_code === 'LEAD-001', 'Lead code must stay LEAD-001');
  assert(result.lead.budget === '18000', 'budget should update');
  assert(countLeads(userId) === 1, `expected still 1 lead, got ${countLeads(userId)}`);
  assert(sheets.state.appends === 1, `must not append another row, appends=${sheets.state.appends}`);
  assert(sheets.state.updates >= 1, 'existing Sheets row should be updated');
  assert(result.lead.google_sheets_sync_status === 'synced', 'update must only show synced after API confirm');
});

// ---------------------------------------------------------------------------
// TEST 3
// ---------------------------------------------------------------------------
let telegramLead;
await runCase('TEST 3: same customer, Telegram AI Bot → NEW LEAD + new row', async () => {
  const result = await ingestLead({
    userId,
    name: 'Rahul',
    phone: '9876543210',
    service: 'Telegram AI Bot',
    source: 'Telegram',
    alreadyQualified: true,
    sheetsClient: sheets.client,
  });
  assert(result.action === 'created', `expected created, got ${result.action}`);
  assert(result.lead.lead_code === 'LEAD-002', `expected LEAD-002, got ${result.lead.lead_code}`);
  assert(result.lead.id !== whatsappLead.id, 'different service must get a new lead id');
  assert(result.uniqueLeadKey === 'rahul|9876543210|telegram_ai_bot', result.uniqueLeadKey);
  assert(countLeads(userId) === 2, `expected 2 leads, got ${countLeads(userId)}`);
  assert(sheets.state.appends === 2, `expected 2 appends, got ${sheets.state.appends}`);
  telegramLead = result.lead;
});

// ---------------------------------------------------------------------------
// TEST 4
// ---------------------------------------------------------------------------
let crmLead;
await runCase('TEST 4: same customer, CRM Automation → NEW LEAD + new row', async () => {
  const result = await ingestLead({
    userId,
    name: 'Rahul',
    phone: '9876543210',
    service: 'CRM Automation',
    source: 'Website',
    alreadyQualified: true,
    sheetsClient: sheets.client,
  });
  assert(result.action === 'created', `expected created, got ${result.action}`);
  assert(result.lead.lead_code === 'LEAD-003', `expected LEAD-003, got ${result.lead.lead_code}`);
  assert(countLeads(userId) === 3, `expected 3 leads, got ${countLeads(userId)}`);
  assert(sheets.state.appends === 3, `expected 3 appends, got ${sheets.state.appends}`);
  crmLead = result.lead;
});

// ---------------------------------------------------------------------------
// TEST 5
// ---------------------------------------------------------------------------
await runCase('TEST 5: CRM Automation again → SAME LEAD, no new row', async () => {
  const result = await ingestLead({
    userId,
    name: '  RAHUL  ',
    phone: '91 9876543210',
    service: 'crm automation',
    alreadyQualified: true,
    sheetsClient: sheets.client,
  });
  assert(result.action === 'updated', `expected updated, got ${result.action}`);
  assert(result.lead.id === crmLead.id, 'must keep CRM lead id');
  assert(result.lead.lead_code === 'LEAD-003', 'must keep LEAD-003');
  assert(countLeads(userId) === 3, `expected still 3 leads, got ${countLeads(userId)}`);
  assert(sheets.state.appends === 3, `must not append, appends=${sheets.state.appends}`);
});

// ---------------------------------------------------------------------------
// TEST 6
// ---------------------------------------------------------------------------
await runCase('TEST 6: "Hi" → NO lead', async () => {
  assert(isTrivialCustomerText('Hi'), '"Hi" is not a lead');
  const convId = addConversation(userId, ['Hi']);
  const before = countLeads(userId);
  const result = await processConversationForLead({
    userId,
    conversationId: convId,
    source: 'AI Chat',
    sheetsClient: sheets.client,
  });
  assert(result.action === 'skipped', `expected skipped, got ${result.action}`);
  assert(result.reason === 'no_business_intent', `reason=${result.reason}`);
  assert(countLeads(userId) === before, 'greeting must not create a lead');
  assert(sheets.state.appends === 3, 'greeting must not append a Sheets row');
});

// ---------------------------------------------------------------------------
// TEST 7
// ---------------------------------------------------------------------------
await runCase('TEST 7: pricing question only → do not create a lead', async () => {
  const text = 'How much does your WhatsApp AI Bot cost?';
  const extracted = extractLeadFields(text);
  const qualification = evaluateQualification({
    messages: [{ sender: 'customer', content: text }],
    extracted,
  });
  assert(extracted.service === 'WhatsApp AI Bot', `should detect service, got ${extracted.service}`);
  assert(!extracted.name && !extracted.phone, 'must not invent name/phone');
  assert(qualification.qualified === false, 'pricing question is not a qualified lead');
  assert(qualification.missing.includes('name'), 'should ask for name');
  assert(qualification.missing.includes('phone'), 'should ask for phone');

  const convId = addConversation(userId, [text]);
  const before = countLeads(userId);
  const result = await processConversationForLead({
    userId,
    conversationId: convId,
    source: 'AI Chat',
    sheetsClient: sheets.client,
  });
  assert(result.action === 'skipped', `expected skipped, got ${result.action}`);
  assert(countLeads(userId) === before, 'unqualified pricing question must not create a lead');
});

// ---------------------------------------------------------------------------
// TEST 8
// ---------------------------------------------------------------------------
let snehaLead;
let snehaConv;
await runCase('TEST 8: genuine requirement + name + phone + service → CREATE REAL LEAD + one row', async () => {
  const beforeLeads = countLeads(userId);
  const beforeAppends = sheets.state.appends;
  snehaConv = addConversation(userId, [
    'How much does your WhatsApp AI Bot cost?',
    'My name is Sneha. Phone 9123456789. I need a WhatsApp AI Bot for my clinic sales team.',
  ]);
  const result = await processConversationForLead({
    userId,
    conversationId: snehaConv,
    source: 'AI Chat',
    sheetsClient: sheets.client,
  });
  assert(result.action === 'created', `expected created, got ${result.action} (${result.reason})`);
  assert(result.lead.name === 'Sneha', result.lead.name);
  assert(result.lead.phone === '9123456789', result.lead.phone);
  assert(result.lead.service === 'WhatsApp AI Bot', result.lead.service);
  assert(result.lead.status === 'New Lead', 'must not auto-convert');
  assert(result.lead.google_sheets_sync_status === 'synced', 'create must sync only after API confirm');
  assert(countLeads(userId) === beforeLeads + 1, 'exactly one new CRM lead');
  assert(sheets.state.appends === beforeAppends + 1, 'exactly one new Sheets row');
  snehaLead = result.lead;
});

// ---------------------------------------------------------------------------
// TEST 9
// ---------------------------------------------------------------------------
await runCase('TEST 9: 20 more messages after lead creation → still ONE lead and ONE row', async () => {
  const beforeLeads = countLeads(userId);
  const beforeAppends = sheets.state.appends;
  for (let i = 0; i < 20; i += 1) {
    addCustomerMessage(snehaConv, `Follow-up message ${i + 1} about the WhatsApp AI Bot`);
    const result = await processConversationForLead({
      userId,
      conversationId: snehaConv,
      source: 'AI Chat',
      sheetsClient: sheets.client,
    });
    assert(result.action === 'updated', `message ${i + 1} should update, got ${result.action}`);
    assert(result.lead.id === snehaLead.id, 'must keep the same lead');
  }
  assert(countLeads(userId) === beforeLeads, '20 follow-ups must not create more leads');
  assert(sheets.state.appends === beforeAppends, '20 follow-ups must not append Sheets rows');
});

// ---------------------------------------------------------------------------
// TEST 10
// ---------------------------------------------------------------------------
await runCase('TEST 10: same name + phone + different service → NEW lead + NEW row', async () => {
  const beforeLeads = countLeads(userId);
  const beforeAppends = sheets.state.appends;
  const result = await ingestLead({
    userId,
    name: 'Sneha',
    phone: '9123456789',
    service: 'Telegram AI Bot',
    requirement: 'Also wants Telegram coverage',
    source: 'WhatsApp',
    alreadyQualified: true,
    sheetsClient: sheets.client,
  });
  assert(result.action === 'created', `expected created, got ${result.action}`);
  assert(result.lead.id !== snehaLead.id, 'different service must be a new lead');
  assert(countLeads(userId) === beforeLeads + 1, 'expected one additional lead');
  assert(sheets.state.appends === beforeAppends + 1, 'expected one additional Sheets row');
});

// Extra production guarantees
await runCase('Sheets failure keeps the CRM lead and marks sync failed (never fake-synced)', async () => {
  const isolatedUser = createUser();
  const failing = createSheetsHarness({ failAppend: true });
  const result = await ingestLead({
    userId: isolatedUser,
    name: 'Karan',
    phone: '9000000001',
    service: 'WhatsApp AI Bot',
    alreadyQualified: true,
    sheetsClient: failing.client,
  });
  assert(result.action === 'created', 'lead must still be saved');
  assert(result.lead.id, 'lead id required');
  assert(result.lead.google_sheets_sync_status === 'failed', `expected failed, got ${result.lead.google_sheets_sync_status}`);
  assert(result.lead.google_sheets_error, 'error must be stored');
  assert(failing.state.appends === 0, 'failed API must not count as append');
});

await runCase('Retry Sync after outage appends exactly once and then shows Synced', async () => {
  const isolatedUser = createUser();
  const flaky = createSheetsHarness({ failAppend: true });
  const first = await ingestLead({
    userId: isolatedUser,
    name: 'Meera',
    phone: '9000000002',
    service: 'CRM Automation',
    alreadyQualified: true,
    sheetsClient: flaky.client,
  });
  assert(first.lead.google_sheets_sync_status === 'failed', 'first sync should fail');

  const recovered = createSheetsHarness();
  const { retryLeadSync } = await import('../services/leadEngine.js');
  const retried = await retryLeadSync(isolatedUser, first.lead.id, { sheetsClient: recovered.client });
  assert(retried.google_sheets_sync_status === 'synced', `retry should sync, got ${retried.google_sheets_sync_status}`);
  assert(recovered.state.appends === 1, `retry should append once, got ${recovered.state.appends}`);

  const second = await ingestLead({
    userId: isolatedUser,
    name: 'Meera',
    phone: '9000000002',
    service: 'CRM Automation',
    budget: '25000',
    alreadyQualified: true,
    sheetsClient: recovered.client,
  });
  assert(second.action === 'updated', 'duplicate after retry must update');
  assert(recovered.state.appends === 1, 'must not append a duplicate row after retry');
});

await runCase('Unconnected Sheets never shows Synced', async () => {
  const isolatedUser = createUser();
  const result = await ingestLead({
    userId: isolatedUser,
    name: 'Dev',
    phone: '9000000003',
    service: 'WhatsApp AI Bot',
    alreadyQualified: true,
  });
  assert(result.action === 'created', 'lead must be saved without Sheets');
  assert(result.lead.google_sheets_sync_status === 'not_connected', result.lead.google_sheets_sync_status);
  assert(result.lead.google_sheets_sync_status !== 'synced', 'must not fake synced');
});

console.log('\n========================================');
console.log(`Results: ${passed} passed, ${failed} failed, ${passed + failed} total`);
console.log('========================================');
for (const row of results) {
  console.log(`${row.ok ? '✓' : '✗'} ${row.name}${row.error ? ` — ${row.error}` : ''}`);
}

try { fs.unlinkSync(testDb); } catch { /* ignore */ }
try { fs.unlinkSync(`${testDb}-wal`); } catch { /* ignore */ }
try { fs.unlinkSync(`${testDb}-shm`); } catch { /* ignore */ }

if (failed > 0) process.exit(1);
