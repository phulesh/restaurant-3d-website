import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import db from '../db/index.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

// List integrations
router.get('/', (req, res) => {
  try {
    let integrations = db.prepare('SELECT * FROM integrations WHERE user_id = ?').all(req.userId);

    // Auto-create default integrations if not present
    const types = ['whatsapp', 'telegram', 'google_sheets', 'email', 'crm', 'webhook', 'api'];
    const existing = new Set(integrations.map(i => i.type));

    for (const type of types) {
      if (!existing.has(type)) {
        const id = uuid();
        const name = type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
        db.prepare('INSERT INTO integrations (id, user_id, type, name, status) VALUES (?, ?, ?, ?, ?)').run(id, req.userId, type, name, 'disconnected');
      }
    }

    integrations = db.prepare('SELECT * FROM integrations WHERE user_id = ?').all(req.userId);
    res.json({ integrations });
  } catch (err) {
    console.error('List integrations error:', err);
    res.status(500).json({ error: 'Failed to fetch integrations' });
  }
});

// Update integration config
router.put('/:id', (req, res) => {
  try {
    const integration = db.prepare('SELECT * FROM integrations WHERE id = ? AND user_id = ?').get(req.params.id, req.userId);
    if (!integration) return res.status(404).json({ error: 'Integration not found' });

    const { config, status } = req.body;
    db.prepare('UPDATE integrations SET config = ?, status = ?, updated_at = datetime(\'now\') WHERE id = ?').run(
      config ? JSON.stringify(config) : integration.config,
      status || integration.status,
      req.params.id
    );

    const updated = db.prepare('SELECT * FROM integrations WHERE id = ?').get(req.params.id);
    res.json({ integration: updated });
  } catch (err) {
    console.error('Update integration error:', err);
    res.status(500).json({ error: 'Failed to update integration' });
  }
});

// Connect integration
router.put('/:id/connect', (req, res) => {
  try {
    const integration = db.prepare('SELECT * FROM integrations WHERE id = ? AND user_id = ?').get(req.params.id, req.userId);
    if (!integration) return res.status(404).json({ error: 'Integration not found' });

    const { config } = req.body;
    db.prepare('UPDATE integrations SET config = ?, status = \'connected\', updated_at = datetime(\'now\') WHERE id = ?').run(
      JSON.stringify(config || {}), req.params.id
    );

    const updated = db.prepare('SELECT * FROM integrations WHERE id = ?').get(req.params.id);
    res.json({ integration: updated });
  } catch (err) {
    console.error('Connect integration error:', err);
    res.status(500).json({ error: 'Failed to connect integration' });
  }
});

// Disconnect integration
router.put('/:id/disconnect', (req, res) => {
  try {
    const integration = db.prepare('SELECT * FROM integrations WHERE id = ? AND user_id = ?').get(req.params.id, req.userId);
    if (!integration) return res.status(404).json({ error: 'Integration not found' });

    db.prepare('UPDATE integrations SET status = \'disconnected\', updated_at = datetime(\'now\') WHERE id = ?').run(req.params.id);
    const updated = db.prepare('SELECT * FROM integrations WHERE id = ?').get(req.params.id);
    res.json({ integration: updated });
  } catch (err) {
    console.error('Disconnect integration error:', err);
    res.status(500).json({ error: 'Failed to disconnect integration' });
  }
});

export default router;
