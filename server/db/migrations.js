import db from './index.js';

export function runMigrations() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      full_name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      phone TEXT,
      password_hash TEXT NOT NULL,
      role TEXT DEFAULT 'user',
      is_active INTEGER DEFAULT 1,
      email_verified INTEGER DEFAULT 0,
      remember_token TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS businesses (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      category TEXT,
      team_size TEXT,
      primary_goal TEXT,
      description TEXT,
      services TEXT,
      pricing TEXT,
      working_hours TEXT,
      contact_info TEXT,
      faq TEXT,
      ai_tone TEXT DEFAULT 'professional',
      ai_languages TEXT DEFAULT 'en',
      onboarding_completed INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS leads (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      business_id TEXT,
      lead_code TEXT,
      unique_lead_key TEXT,
      name TEXT NOT NULL,
      phone TEXT,
      email TEXT,
      service TEXT,
      budget TEXT,
      source TEXT,
      status TEXT DEFAULT 'New Lead',
      score INTEGER DEFAULT 0,
      notes TEXT,
      tags TEXT,
      requirement TEXT,
      last_contacted TEXT,
      conversation_history TEXT,
      google_sheets_sync_status TEXT DEFAULT 'not_connected',
      google_sheets_error TEXT,
      google_sheets_row INTEGER,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS conversations (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      lead_id TEXT,
      customer_name TEXT,
      customer_phone TEXT,
      customer_email TEXT,
      channel TEXT DEFAULT 'web',
      status TEXT DEFAULT 'active',
      ai_enabled INTEGER DEFAULT 1,
      assigned_to TEXT,
      last_message_at TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      conversation_id TEXT NOT NULL,
      sender TEXT NOT NULL,
      content TEXT NOT NULL,
      message_type TEXT DEFAULT 'text',
      intent TEXT,
      entities TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS automations (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      trigger_type TEXT NOT NULL,
      trigger_config TEXT,
      conditions TEXT,
      actions TEXT,
      is_active INTEGER DEFAULT 1,
      runs_count INTEGER DEFAULT 0,
      last_run_at TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS integrations (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      type TEXT NOT NULL,
      name TEXT NOT NULL,
      config TEXT,
      status TEXT DEFAULT 'disconnected',
      last_sync_at TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      message TEXT,
      data TEXT,
      read INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS subscriptions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL UNIQUE,
      plan TEXT NOT NULL DEFAULT 'free',
      status TEXT DEFAULT 'active',
      current_period_start TEXT,
      current_period_end TEXT,
      payment_method TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS contact_requests (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      business TEXT,
      company_size TEXT,
      requirements TEXT,
      budget TEXT,
      message TEXT,
      status TEXT DEFAULT 'new',
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS password_resets (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      token TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      used INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_leads_user_id ON leads(user_id);
    CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
    CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id);
    CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
    CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
    CREATE INDEX IF NOT EXISTS idx_automations_user_id ON automations(user_id);
    CREATE INDEX IF NOT EXISTS idx_integrations_user_id ON integrations(user_id);
    CREATE UNIQUE INDEX IF NOT EXISTS idx_leads_unique_key ON leads(user_id, unique_lead_key) WHERE unique_lead_key IS NOT NULL;
    CREATE INDEX IF NOT EXISTS idx_leads_lead_code ON leads(user_id, lead_code);
  `);

  addColumnIfMissing('leads', 'lead_code', 'TEXT');
  addColumnIfMissing('leads', 'unique_lead_key', 'TEXT');
  addColumnIfMissing('leads', 'requirement', 'TEXT');
  addColumnIfMissing('leads', 'last_contacted', 'TEXT');
  addColumnIfMissing('leads', 'conversation_history', 'TEXT');
  addColumnIfMissing('leads', 'google_sheets_sync_status', "TEXT DEFAULT 'not_connected'");
  addColumnIfMissing('leads', 'google_sheets_error', 'TEXT');
  addColumnIfMissing('leads', 'google_sheets_row', 'INTEGER');

  backfillLeadIdentity();

  console.log('Database migrations completed.');
}

function addColumnIfMissing(table, column, definition) {
  const cols = db.prepare(`PRAGMA table_info(${table})`).all();
  if (!cols.some((c) => c.name === column)) {
    db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
  }
}

function backfillLeadIdentity() {
  const leads = db.prepare('SELECT * FROM leads').all();
  const counters = new Map();

  for (const lead of leads) {
    if (lead.lead_code) {
      const n = parseInt(String(lead.lead_code).replace(/LEAD-/i, ''), 10);
      if (Number.isFinite(n)) {
        counters.set(lead.user_id, Math.max(counters.get(lead.user_id) || 0, n));
      }
    }
  }

  for (const lead of leads) {
    const updates = {};
    if (!lead.lead_code) {
      const next = (counters.get(lead.user_id) || 0) + 1;
      counters.set(lead.user_id, next);
      updates.lead_code = `LEAD-${String(next).padStart(3, '0')}`;
    }
    if (!lead.unique_lead_key && lead.name && lead.phone && lead.service) {
      const name = String(lead.name).trim().toLowerCase().replace(/\s+/g, ' ');
      const phone = String(lead.phone).replace(/[^\d]/g, '');
      const service = String(lead.service).toLowerCase().replace(/[+_/,-]+/g, ' ').replace(/\s+/g, ' ').trim().replace(/\s+/g, '_');
      if (name && phone && service) updates.unique_lead_key = `${name}|${phone}|${service}`;
    }
    if (!lead.last_contacted) {
      updates.last_contacted = (lead.updated_at || lead.created_at || '').slice(0, 10) || null;
    }
    if (!lead.google_sheets_sync_status) {
      updates.google_sheets_sync_status = 'not_connected';
    }
    const keys = Object.keys(updates);
    if (!keys.length) continue;
    const sets = keys.map((k) => `${k} = ?`).join(', ');
    db.prepare(`UPDATE leads SET ${sets} WHERE id = ?`).run(...keys.map((k) => updates[k]), lead.id);
  }
}
