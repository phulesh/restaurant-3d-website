import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import db from '../db/index.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

// List leads with search, filter, sort
router.get('/', (req, res) => {
  try {
    const { search, status, source, sort, order, page = 1, limit = 50 } = req.query;
    let query = 'SELECT * FROM leads WHERE user_id = ?';
    const params = [req.userId];

    if (search) {
      query += ' AND (name LIKE ? OR email LIKE ? OR phone LIKE ? OR service LIKE ?)';
      const s = `%${search}%`;
      params.push(s, s, s, s);
    }
    if (status && status !== 'all') {
      query += ' AND status = ?';
      params.push(status);
    }
    if (source && source !== 'all') {
      query += ' AND source = ?';
      params.push(source);
    }

    const sortField = ['created_at', 'updated_at', 'name', 'score', 'status'].includes(sort) ? sort : 'created_at';
    const sortOrder = order === 'asc' ? 'ASC' : 'DESC';
    query += ` ORDER BY ${sortField} ${sortOrder}`;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    query += ' LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const leads = db.prepare(query).all(...params);

    // Count total
    let countQuery = 'SELECT COUNT(*) as total FROM leads WHERE user_id = ?';
    const countParams = [req.userId];
    if (search) {
      countQuery += ' AND (name LIKE ? OR email LIKE ? OR phone LIKE ? OR service LIKE ?)';
      const s = `%${search}%`;
      countParams.push(s, s, s, s);
    }
    if (status && status !== 'all') {
      countQuery += ' AND status = ?';
      countParams.push(status);
    }
    if (source && source !== 'all') {
      countQuery += ' AND source = ?';
      countParams.push(source);
    }
    const { total } = db.prepare(countQuery).get(...countParams);

    // Stats
    const stats = db.prepare(`
      SELECT
        COUNT(*) as total_leads,
        SUM(CASE WHEN status = 'New Lead' THEN 1 ELSE 0 END) as new_leads,
        SUM(CASE WHEN status = 'Contacted' THEN 1 ELSE 0 END) as contacted,
        SUM(CASE WHEN status = 'Qualified' THEN 1 ELSE 0 END) as qualified,
        SUM(CASE WHEN status = 'Converted' THEN 1 ELSE 0 END) as converted,
        SUM(CASE WHEN status = 'Lost' THEN 1 ELSE 0 END) as lost
      FROM leads WHERE user_id = ?
    `).get(req.userId);

    res.json({ leads, total, stats, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    console.error('List leads error:', err);
    res.status(500).json({ error: 'Failed to fetch leads' });
  }
});

// Get single lead
router.get('/:id', (req, res) => {
  try {
    const lead = db.prepare('SELECT * FROM leads WHERE id = ? AND user_id = ?').get(req.params.id, req.userId);
    if (!lead) return res.status(404).json({ error: 'Lead not found' });

    // Get related conversations
    const conversations = db.prepare('SELECT * FROM conversations WHERE lead_id = ?').all(lead.id);

    res.json({ lead, conversations });
  } catch (err) {
    console.error('Get lead error:', err);
    res.status(500).json({ error: 'Failed to fetch lead' });
  }
});

// Create lead
router.post('/', (req, res) => {
  try {
    const { name, phone, email, service, budget, source, status, notes, tags } = req.body;
    if (!name) return res.status(400).json({ error: 'Lead name is required' });

    const id = uuid();
    const score = calculateLeadScore({ budget, service, source });

    db.prepare(`
      INSERT INTO leads (id, user_id, name, phone, email, service, budget, source, status, score, notes, tags)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, req.userId, name, phone || null, email || null, service || null, budget || null,
      source || 'Direct', status || 'New Lead', score, notes || null, tags || null);

    const lead = db.prepare('SELECT * FROM leads WHERE id = ?').get(id);

    // Create notification
    createNotification(req.userId, 'new_lead', 'New Lead Created', `${name} has been added to your pipeline.`);

    res.status(201).json({ lead });
  } catch (err) {
    console.error('Create lead error:', err);
    res.status(500).json({ error: 'Failed to create lead' });
  }
});

// Update lead
router.put('/:id', (req, res) => {
  try {
    const lead = db.prepare('SELECT * FROM leads WHERE id = ? AND user_id = ?').get(req.params.id, req.userId);
    if (!lead) return res.status(404).json({ error: 'Lead not found' });

    const { name, phone, email, service, budget, source, status, notes, tags } = req.body;
    const score = calculateLeadScore({ budget: budget || lead.budget, service: service || lead.service, source: source || lead.source });

    db.prepare(`
      UPDATE leads SET name = ?, phone = ?, email = ?, service = ?, budget = ?, source = ?, status = ?, score = ?, notes = ?, tags = ?, updated_at = datetime('now')
      WHERE id = ?
    `).run(
      name || lead.name, phone ?? lead.phone, email ?? lead.email,
      service ?? lead.service, budget ?? lead.budget, source ?? lead.source,
      status || lead.status, score, notes ?? lead.notes, tags ?? lead.tags, req.params.id
    );

    if (status && status !== lead.status) {
      createNotification(req.userId, 'status_change', 'Lead Status Updated', `${lead.name} moved to ${status}`);
      if (status === 'Converted') {
        createNotification(req.userId, 'lead_converted', 'Lead Converted! 🎉', `${lead.name} has been converted!`);
      }
    }

    const updated = db.prepare('SELECT * FROM leads WHERE id = ?').get(req.params.id);
    res.json({ lead: updated });
  } catch (err) {
    console.error('Update lead error:', err);
    res.status(500).json({ error: 'Failed to update lead' });
  }
});

// Delete lead
router.delete('/:id', (req, res) => {
  try {
    const lead = db.prepare('SELECT * FROM leads WHERE id = ? AND user_id = ?').get(req.params.id, req.userId);
    if (!lead) return res.status(404).json({ error: 'Lead not found' });

    db.prepare('DELETE FROM leads WHERE id = ?').run(req.params.id);
    res.json({ message: 'Lead deleted successfully' });
  } catch (err) {
    console.error('Delete lead error:', err);
    res.status(500).json({ error: 'Failed to delete lead' });
  }
});

// Add note to lead
router.post('/:id/notes', (req, res) => {
  try {
    const lead = db.prepare('SELECT * FROM leads WHERE id = ? AND user_id = ?').get(req.params.id, req.userId);
    if (!lead) return res.status(404).json({ error: 'Lead not found' });

    const { note } = req.body;
    if (!note) return res.status(400).json({ error: 'Note content is required' });

    const existingNotes = lead.notes ? JSON.parse(lead.notes) : [];
    existingNotes.push({ text: note, created_at: new Date().toISOString() });
    db.prepare('UPDATE leads SET notes = ?, updated_at = datetime(\'now\') WHERE id = ?').run(JSON.stringify(existingNotes), req.params.id);

    const updated = db.prepare('SELECT * FROM leads WHERE id = ?').get(req.params.id);
    res.json({ lead: updated });
  } catch (err) {
    console.error('Add note error:', err);
    res.status(500).json({ error: 'Failed to add note' });
  }
});

function calculateLeadScore({ budget, service, source }) {
  let score = 30; // base
  if (budget && budget !== 'Not provided' && budget !== '—' && budget !== '') {
    const numBudget = parseInt(budget.replace(/[^0-9]/g, ''));
    if (numBudget >= 50000) score += 30;
    else if (numBudget >= 20000) score += 20;
    else if (numBudget >= 5000) score += 10;
    else score += 5;
  }
  if (service && service !== 'General Inquiry') score += 15;
  if (source === 'WhatsApp' || source === 'Telegram') score += 10;
  if (source === 'Referral') score += 15;
  return Math.min(100, score);
}

function createNotification(userId, type, title, message) {
  try {
    db.prepare('INSERT INTO notifications (id, user_id, type, title, message) VALUES (?, ?, ?, ?, ?)').run(uuid(), userId, type, title, message);
  } catch (e) {
    console.error('Notification creation failed:', e);
  }
}

export default router;
