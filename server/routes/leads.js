import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import db from '../db/index.js';
import { requireAuth } from '../middleware/auth.js';
import { LEAD_SOURCES, LEAD_STATUSES, buildUniqueLeadKey } from '../utils/leadIdentity.js';
import { createNotification } from '../utils/notifications.js';
import {
  findLeadByUniqueKey,
  ingestLead,
  leadPublicView,
  nextLeadCode,
  retryLeadSync,
  syncLeadToSheets,
} from '../services/leadEngine.js';

const router = Router();
router.use(requireAuth);

router.get('/', (req, res) => {
  try {
    const { search, status, source, sort, order, page = 1, limit = 50 } = req.query;
    let query = 'SELECT * FROM leads WHERE user_id = ?';
    const params = [req.userId];

    if (search) {
      query += ' AND (name LIKE ? OR email LIKE ? OR phone LIKE ? OR service LIKE ? OR lead_code LIKE ? OR unique_lead_key LIKE ?)';
      const s = `%${search}%`;
      params.push(s, s, s, s, s, s);
    }
    if (status && status !== 'all') {
      query += ' AND status = ?';
      params.push(status);
    }
    if (source && source !== 'all') {
      query += ' AND source = ?';
      params.push(source);
    }

    const sortField = ['created_at', 'updated_at', 'name', 'score', 'status', 'last_contacted', 'lead_code'].includes(sort) ? sort : 'created_at';
    const sortOrder = order === 'asc' ? 'ASC' : 'DESC';
    query += ` ORDER BY ${sortField} ${sortOrder}`;

    const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    query += ' LIMIT ? OFFSET ?';
    params.push(parseInt(limit, 10), offset);

    const leads = db.prepare(query).all(...params).map(leadPublicView);

    let countQuery = 'SELECT COUNT(*) as total FROM leads WHERE user_id = ?';
    const countParams = [req.userId];
    if (search) {
      countQuery += ' AND (name LIKE ? OR email LIKE ? OR phone LIKE ? OR service LIKE ? OR lead_code LIKE ? OR unique_lead_key LIKE ?)';
      const s = `%${search}%`;
      countParams.push(s, s, s, s, s, s);
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

    res.json({
      leads,
      total,
      stats,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      statuses: LEAD_STATUSES,
      sources: LEAD_SOURCES,
    });
  } catch (err) {
    console.error('List leads error:', err);
    res.status(500).json({ error: 'Failed to fetch leads' });
  }
});

router.get('/:id', (req, res) => {
  try {
    const lead = db.prepare('SELECT * FROM leads WHERE id = ? AND user_id = ?').get(req.params.id, req.userId);
    if (!lead) return res.status(404).json({ error: 'Lead not found' });

    const conversations = db.prepare('SELECT * FROM conversations WHERE lead_id = ?').all(lead.id);
    res.json({ lead: leadPublicView(lead), conversations });
  } catch (err) {
    console.error('Get lead error:', err);
    res.status(500).json({ error: 'Failed to fetch lead' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, phone, email, service, budget, source, status, notes, requirement, tags } = req.body;
    if (!name) return res.status(400).json({ error: 'Lead name is required' });

    const uniqueLeadKey = buildUniqueLeadKey(name, phone, service);
    if (uniqueLeadKey) {
      const result = await ingestLead({
        userId: req.userId,
        name,
        phone,
        email,
        service,
        budget,
        requirement: requirement || notes,
        source: source || 'Manual',
        status,
        notes,
        alreadyQualified: true,
        allowConversion: status === 'Converted',
      });
      const code = result.action === 'created' ? 201 : 200;
      return res.status(code).json({
        lead: leadPublicView(result.lead),
        action: result.action,
        uniqueLeadKey: result.uniqueLeadKey,
        duplicate: result.action === 'updated',
      });
    }

    // Incomplete manual records (missing phone or service) cannot form a unique key.
    const id = uuid();
    const leadCode = nextLeadCode(req.userId);
    db.prepare(`
      INSERT INTO leads (id, user_id, lead_code, name, phone, email, service, budget, source, status, notes, tags, requirement, last_contacted, google_sheets_sync_status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), 'not_connected')
    `).run(
      id, req.userId, leadCode, name, phone || null, email || null, service || null, budget || null,
      source || 'Manual', status && status !== 'Converted' ? status : 'New Lead', notes || null, tags || null,
      requirement || null
    );
    const lead = db.prepare('SELECT * FROM leads WHERE id = ?').get(id);
    createNotification(req.userId, 'new_lead', 'New Lead Created', `${name} has been added to your pipeline.`);
    res.status(201).json({ lead: leadPublicView(lead), action: 'created', uniqueLeadKey: null });
  } catch (err) {
    console.error('Create lead error:', err);
    res.status(500).json({ error: 'Failed to create lead' });
  }
});

router.post('/ingest', async (req, res) => {
  try {
    const result = await ingestLead({
      userId: req.userId,
      ...req.body,
      source: req.body.source || 'Webhook',
      alreadyQualified: true,
    });
    if (result.action === 'skipped') {
      return res.status(422).json({
        error: 'Lead is not qualified',
        reason: result.reason,
        missing: result.missing,
      });
    }
    res.status(result.action === 'created' ? 201 : 200).json({
      lead: leadPublicView(result.lead),
      action: result.action,
      uniqueLeadKey: result.uniqueLeadKey,
      duplicate: result.action === 'updated',
    });
  } catch (err) {
    console.error('Ingest lead error:', err);
    res.status(500).json({ error: 'Failed to ingest lead' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const lead = db.prepare('SELECT * FROM leads WHERE id = ? AND user_id = ?').get(req.params.id, req.userId);
    if (!lead) return res.status(404).json({ error: 'Lead not found' });

    const { name, phone, email, service, budget, source, status, notes, tags, requirement } = req.body;

    if (status === 'Converted' && lead.status !== 'Converted') {
      // Explicit CRM conversion is allowed here — this is the business process.
    }

    const nextName = name || lead.name;
    const nextPhone = phone !== undefined ? phone : lead.phone;
    const nextService = service !== undefined ? service : lead.service;
    const nextKey = buildUniqueLeadKey(nextName, nextPhone, nextService);

    if (nextKey && nextKey !== lead.unique_lead_key) {
      const conflict = findLeadByUniqueKey(req.userId, nextKey);
      if (conflict && conflict.id !== lead.id) {
        return res.status(409).json({
          error: 'Another lead already exists for this name, phone and service',
          existing_lead_id: conflict.id,
          existing_lead_code: conflict.lead_code,
          uniqueLeadKey: nextKey,
        });
      }
    }

    db.prepare(`
      UPDATE leads SET
        name = ?, phone = ?, email = ?, service = ?, budget = ?, source = ?,
        status = ?, notes = ?, tags = ?, requirement = ?, unique_lead_key = ?,
        last_contacted = datetime('now'), updated_at = datetime('now')
      WHERE id = ?
    `).run(
      nextName,
      nextPhone ?? lead.phone,
      email !== undefined ? email : lead.email,
      nextService ?? lead.service,
      budget !== undefined ? budget : lead.budget,
      source !== undefined ? source : lead.source,
      status || lead.status,
      notes !== undefined ? notes : lead.notes,
      tags !== undefined ? tags : lead.tags,
      requirement !== undefined ? requirement : lead.requirement,
      nextKey || lead.unique_lead_key,
      req.params.id
    );

    if (status && status !== lead.status) {
      createNotification(req.userId, 'status_change', 'Lead Status Updated', `${lead.name} moved to ${status}`);
      if (status === 'Converted') {
        createNotification(req.userId, 'lead_converted', 'Lead Converted! 🎉', `${lead.name} has been converted!`);
      }
    }

    const updated = db.prepare('SELECT * FROM leads WHERE id = ?').get(req.params.id);
    const { syncLeadToSheets } = await import('../services/leadEngine.js');
    const synced = await syncLeadToSheets(req.userId, updated, { allowAppend: false });
    res.json({ lead: leadPublicView(synced) });
  } catch (err) {
    console.error('Update lead error:', err);
    res.status(500).json({ error: 'Failed to update lead' });
  }
});

router.post('/:id/retry-sync', async (req, res) => {
  try {
    const synced = await retryLeadSync(req.userId, req.params.id);
    if (!synced) return res.status(404).json({ error: 'Lead not found' });
    res.json({
      lead: leadPublicView(synced),
      google_sheets_sync_status: synced.google_sheets_sync_status,
      google_sheets_error: synced.google_sheets_error,
    });
  } catch (err) {
    console.error('Retry sync error:', err);
    res.status(500).json({ error: 'Failed to retry Google Sheets sync' });
  }
});

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

router.post('/:id/notes', (req, res) => {
  try {
    const lead = db.prepare('SELECT * FROM leads WHERE id = ? AND user_id = ?').get(req.params.id, req.userId);
    if (!lead) return res.status(404).json({ error: 'Lead not found' });

    const { note } = req.body;
    if (!note) return res.status(400).json({ error: 'Note content is required' });

    const existingNotes = lead.notes ? safeParseNotes(lead.notes) : [];
    existingNotes.push({ text: note, created_at: new Date().toISOString() });
    db.prepare("UPDATE leads SET notes = ?, updated_at = datetime('now') WHERE id = ?")
      .run(JSON.stringify(existingNotes), req.params.id);

    const updated = db.prepare('SELECT * FROM leads WHERE id = ?').get(req.params.id);
    res.json({ lead: leadPublicView(updated) });
  } catch (err) {
    console.error('Add note error:', err);
    res.status(500).json({ error: 'Failed to add note' });
  }
});

function safeParseNotes(raw) {
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [{ text: raw, created_at: new Date().toISOString() }];
  } catch {
    return [{ text: raw, created_at: new Date().toISOString() }];
  }
}

export default router;
