import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import db from '../db/index.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

// List automations
router.get('/', (req, res) => {
  try {
    const automations = db.prepare('SELECT * FROM automations WHERE user_id = ? ORDER BY created_at DESC').all(req.userId);
    res.json({ automations });
  } catch (err) {
    console.error('List automations error:', err);
    res.status(500).json({ error: 'Failed to fetch automations' });
  }
});

// Get automation
router.get('/:id', (req, res) => {
  try {
    const automation = db.prepare('SELECT * FROM automations WHERE id = ? AND user_id = ?').get(req.params.id, req.userId);
    if (!automation) return res.status(404).json({ error: 'Automation not found' });
    res.json({ automation });
  } catch (err) {
    console.error('Get automation error:', err);
    res.status(500).json({ error: 'Failed to fetch automation' });
  }
});

// Create automation
router.post('/', (req, res) => {
  try {
    const { name, description, trigger_type, trigger_config, conditions, actions } = req.body;
    if (!name || !trigger_type) return res.status(400).json({ error: 'Name and trigger type are required' });

    const id = uuid();
    db.prepare(`
      INSERT INTO automations (id, user_id, name, description, trigger_type, trigger_config, conditions, actions)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, req.userId, name, description || null, trigger_type,
      JSON.stringify(trigger_config || {}), JSON.stringify(conditions || []), JSON.stringify(actions || []));

    const automation = db.prepare('SELECT * FROM automations WHERE id = ?').get(id);
    res.status(201).json({ automation });
  } catch (err) {
    console.error('Create automation error:', err);
    res.status(500).json({ error: 'Failed to create automation' });
  }
});

// Update automation
router.put('/:id', (req, res) => {
  try {
    const automation = db.prepare('SELECT * FROM automations WHERE id = ? AND user_id = ?').get(req.params.id, req.userId);
    if (!automation) return res.status(404).json({ error: 'Automation not found' });

    const { name, description, trigger_type, trigger_config, conditions, actions, is_active } = req.body;
    db.prepare(`
      UPDATE automations SET name = ?, description = ?, trigger_type = ?, trigger_config = ?, conditions = ?, actions = ?, is_active = ?, updated_at = datetime('now')
      WHERE id = ?
    `).run(
      name || automation.name, description ?? automation.description,
      trigger_type || automation.trigger_type,
      JSON.stringify(trigger_config || JSON.parse(automation.trigger_config || '{}')),
      JSON.stringify(conditions || JSON.parse(automation.conditions || '[]')),
      JSON.stringify(actions || JSON.parse(automation.actions || '[]')),
      is_active !== undefined ? (is_active ? 1 : 0) : automation.is_active,
      req.params.id
    );

    const updated = db.prepare('SELECT * FROM automations WHERE id = ?').get(req.params.id);
    res.json({ automation: updated });
  } catch (err) {
    console.error('Update automation error:', err);
    res.status(500).json({ error: 'Failed to update automation' });
  }
});

// Delete automation
router.delete('/:id', (req, res) => {
  try {
    const automation = db.prepare('SELECT * FROM automations WHERE id = ? AND user_id = ?').get(req.params.id, req.userId);
    if (!automation) return res.status(404).json({ error: 'Automation not found' });

    db.prepare('DELETE FROM automations WHERE id = ?').run(req.params.id);
    res.json({ message: 'Automation deleted' });
  } catch (err) {
    console.error('Delete automation error:', err);
    res.status(500).json({ error: 'Failed to delete automation' });
  }
});

// Toggle automation active state
router.put('/:id/toggle', (req, res) => {
  try {
    const automation = db.prepare('SELECT * FROM automations WHERE id = ? AND user_id = ?').get(req.params.id, req.userId);
    if (!automation) return res.status(404).json({ error: 'Automation not found' });

    db.prepare('UPDATE automations SET is_active = ?, updated_at = datetime(\'now\') WHERE id = ?').run(automation.is_active ? 0 : 1, automation.id);
    const updated = db.prepare('SELECT * FROM automations WHERE id = ?').get(automation.id);
    res.json({ automation: updated });
  } catch (err) {
    console.error('Toggle automation error:', err);
    res.status(500).json({ error: 'Failed to toggle automation' });
  }
});

export default router;
