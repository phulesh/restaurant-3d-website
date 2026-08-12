import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import db from '../db/index.js';
import { requireAuth } from '../middleware/auth.js';
import {
  createGoogleSheetsClient,
  parseIntegrationConfig,
  redactSheetsConfig,
} from '../services/googleSheets.js';

const router = Router();
router.use(requireAuth);

function sanitizeIntegration(row) {
  if (!row) return row;
  const config = parseIntegrationConfig(row.config);
  const safeConfig = row.type === 'google_sheets'
    ? redactSheetsConfig(config)
    : redactGenericConfig(config);
  return { ...row, config: JSON.stringify(safeConfig) };
}

const SECRET_CONFIG_KEYS = [
  'service_account_json', 'private_key', 'access_token', 'refresh_token',
  'client_secret', 'credentials_json', 'token', 'bot_token', 'smtp_pass',
  'password', 'secret', 'api_key', 'webhook_secret',
];

function mergeIntegrationConfig(existing, incoming) {
  const merged = { ...existing, ...incoming };
  for (const key of SECRET_CONFIG_KEYS) {
    if (incoming[key] === undefined || incoming[key] === null || incoming[key] === '') {
      if (existing[key]) merged[key] = existing[key];
      else delete merged[key];
    }
  }
  if ((!incoming.service_account || incoming.service_account === '') && existing.service_account) {
    merged.service_account = existing.service_account;
  }
  return merged;
}

function redactGenericConfig(config) {
  if (!config || typeof config !== 'object') return {};
  const safe = { ...config };
  for (const key of ['access_token', 'bot_token', 'smtp_pass', 'password', 'secret', 'api_key', 'webhook_secret']) {
    if (safe[key]) {
      safe[`${key}_set`] = true;
      delete safe[key];
    }
  }
  return safe;
}

router.get('/', (req, res) => {
  try {
    let integrations = db.prepare('SELECT * FROM integrations WHERE user_id = ?').all(req.userId);

    const types = ['whatsapp', 'telegram', 'google_sheets', 'email', 'crm', 'webhook', 'api'];
    const existing = new Set(integrations.map((i) => i.type));

    for (const type of types) {
      if (!existing.has(type)) {
        const id = uuid();
        const name = type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
        db.prepare('INSERT INTO integrations (id, user_id, type, name, status) VALUES (?, ?, ?, ?, ?)')
          .run(id, req.userId, type, name, 'disconnected');
      }
    }

    integrations = db.prepare('SELECT * FROM integrations WHERE user_id = ?').all(req.userId);
    res.json({ integrations: integrations.map(sanitizeIntegration) });
  } catch (err) {
    console.error('List integrations error:', err);
    res.status(500).json({ error: 'Failed to fetch integrations' });
  }
});

router.put('/:id', (req, res) => {
  try {
    const integration = db.prepare('SELECT * FROM integrations WHERE id = ? AND user_id = ?')
      .get(req.params.id, req.userId);
    if (!integration) return res.status(404).json({ error: 'Integration not found' });

    const { config, status } = req.body;
    const merged = mergeIntegrationConfig(parseIntegrationConfig(integration.config), config || {});
    db.prepare("UPDATE integrations SET config = ?, status = ?, updated_at = datetime('now') WHERE id = ?")
      .run(JSON.stringify(merged), status || integration.status, req.params.id);

    const updated = db.prepare('SELECT * FROM integrations WHERE id = ?').get(req.params.id);
    res.json({ integration: sanitizeIntegration(updated) });
  } catch (err) {
    console.error('Update integration error:', err);
    res.status(500).json({ error: 'Failed to update integration' });
  }
});

router.put('/:id/connect', async (req, res) => {
  try {
    const integration = db.prepare('SELECT * FROM integrations WHERE id = ? AND user_id = ?')
      .get(req.params.id, req.userId);
    if (!integration) return res.status(404).json({ error: 'Integration not found' });

    const config = mergeIntegrationConfig(
      parseIntegrationConfig(integration.config),
      req.body.config || {}
    );

    if (integration.type === 'google_sheets') {
      const client = createGoogleSheetsClient({ config });
      if (!client.isConfigured) {
        return res.status(400).json({
          error: 'Google Sheets requires a spreadsheet ID and credentials (service account JSON or OAuth refresh token).',
        });
      }
      try {
        await client.verifyConnection();
      } catch (err) {
        db.prepare("UPDATE integrations SET config = ?, status = 'disconnected', updated_at = datetime('now') WHERE id = ?")
          .run(JSON.stringify(config), req.params.id);
        return res.status(400).json({ error: `Google Sheets connection failed: ${err.message}` });
      }
    }

    db.prepare("UPDATE integrations SET config = ?, status = 'connected', last_sync_at = datetime('now'), updated_at = datetime('now') WHERE id = ?")
      .run(JSON.stringify(config), req.params.id);

    const updated = db.prepare('SELECT * FROM integrations WHERE id = ?').get(req.params.id);
    res.json({ integration: sanitizeIntegration(updated) });
  } catch (err) {
    console.error('Connect integration error:', err);
    res.status(500).json({ error: 'Failed to connect integration' });
  }
});

router.post('/:id/test', async (req, res) => {
  try {
    const integration = db.prepare('SELECT * FROM integrations WHERE id = ? AND user_id = ?')
      .get(req.params.id, req.userId);
    if (!integration) return res.status(404).json({ error: 'Integration not found' });
    if (integration.type !== 'google_sheets') {
      return res.status(400).json({ error: 'Test is only available for Google Sheets' });
    }

    const config = {
      ...parseIntegrationConfig(integration.config),
      ...(req.body.config || {}),
    };
    const client = createGoogleSheetsClient({ config });
    const result = await client.verifyConnection();
    res.json({ ok: true, ...result });
  } catch (err) {
    res.status(400).json({ ok: false, error: err.message });
  }
});

router.put('/:id/disconnect', (req, res) => {
  try {
    const integration = db.prepare('SELECT * FROM integrations WHERE id = ? AND user_id = ?')
      .get(req.params.id, req.userId);
    if (!integration) return res.status(404).json({ error: 'Integration not found' });

    db.prepare("UPDATE integrations SET status = 'disconnected', updated_at = datetime('now') WHERE id = ?")
      .run(req.params.id);
    const updated = db.prepare('SELECT * FROM integrations WHERE id = ?').get(req.params.id);
    res.json({ integration: sanitizeIntegration(updated) });
  } catch (err) {
    console.error('Disconnect integration error:', err);
    res.status(500).json({ error: 'Failed to disconnect integration' });
  }
});

export default router;
