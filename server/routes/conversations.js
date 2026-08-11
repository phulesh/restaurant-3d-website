import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import db from '../db/index.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

// List conversations
router.get('/', (req, res) => {
  try {
    const { search, status, page = 1, limit = 50 } = req.query;
    let query = 'SELECT c.*, (SELECT content FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message FROM conversations c WHERE c.user_id = ?';
    const params = [req.userId];

    if (search) {
      query += ' AND (c.customer_name LIKE ? OR c.customer_phone LIKE ? OR c.customer_email LIKE ?)';
      const s = `%${search}%`;
      params.push(s, s, s);
    }
    if (status && status !== 'all') {
      query += ' AND c.status = ?';
      params.push(status);
    }

    query += ' ORDER BY c.last_message_at DESC, c.created_at DESC';
    const offset = (parseInt(page) - 1) * parseInt(limit);
    query += ' LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const conversations = db.prepare(query).all(...params);

    // Stats
    const stats = db.prepare(`
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active,
        SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) as resolved
      FROM conversations WHERE user_id = ?
    `).get(req.userId);

    res.json({ conversations, stats });
  } catch (err) {
    console.error('List conversations error:', err);
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
});

// Get conversation with messages
router.get('/:id', (req, res) => {
  try {
    const conversation = db.prepare('SELECT * FROM conversations WHERE id = ? AND user_id = ?').get(req.params.id, req.userId);
    if (!conversation) return res.status(404).json({ error: 'Conversation not found' });

    const messages = db.prepare('SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at ASC').all(conversation.id);
    let lead = null;
    if (conversation.lead_id) {
      lead = db.prepare('SELECT * FROM leads WHERE id = ?').get(conversation.lead_id);
    }

    res.json({ conversation, messages, lead });
  } catch (err) {
    console.error('Get conversation error:', err);
    res.status(500).json({ error: 'Failed to fetch conversation' });
  }
});

// Create conversation (from customer message)
router.post('/', (req, res) => {
  try {
    const { customer_name, customer_phone, customer_email, channel, initial_message } = req.body;
    const id = uuid();

    db.prepare(`
      INSERT INTO conversations (id, user_id, customer_name, customer_phone, customer_email, channel, last_message_at)
      VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
    `).run(id, req.userId, customer_name || 'Customer', customer_phone || null, customer_email || null, channel || 'web');

    if (initial_message) {
      db.prepare('INSERT INTO messages (id, conversation_id, sender, content) VALUES (?, ?, ?, ?)').run(uuid(), id, 'customer', initial_message);
    }

    const conversation = db.prepare('SELECT * FROM conversations WHERE id = ?').get(id);
    res.status(201).json({ conversation });
  } catch (err) {
    console.error('Create conversation error:', err);
    res.status(500).json({ error: 'Failed to create conversation' });
  }
});

// Send message in conversation
router.post('/:id/messages', (req, res) => {
  try {
    const conversation = db.prepare('SELECT * FROM conversations WHERE id = ? AND user_id = ?').get(req.params.id, req.userId);
    if (!conversation) return res.status(404).json({ error: 'Conversation not found' });

    const { content, sender } = req.body;
    if (!content) return res.status(400).json({ error: 'Message content is required' });

    const msgId = uuid();
    db.prepare('INSERT INTO messages (id, conversation_id, sender, content) VALUES (?, ?, ?, ?)').run(msgId, conversation.id, sender || 'customer', content);
    db.prepare('UPDATE conversations SET last_message_at = datetime(\'now\'), updated_at = datetime(\'now\') WHERE id = ?').run(conversation.id);

    const message = db.prepare('SELECT * FROM messages WHERE id = ?').get(msgId);
    res.json({ message });
  } catch (err) {
    console.error('Send message error:', err);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// Toggle AI
router.put('/:id/ai-toggle', (req, res) => {
  try {
    const conversation = db.prepare('SELECT * FROM conversations WHERE id = ? AND user_id = ?').get(req.params.id, req.userId);
    if (!conversation) return res.status(404).json({ error: 'Conversation not found' });

    db.prepare('UPDATE conversations SET ai_enabled = ?, updated_at = datetime(\'now\') WHERE id = ?').run(conversation.ai_enabled ? 0 : 1, conversation.id);
    const updated = db.prepare('SELECT * FROM conversations WHERE id = ?').get(conversation.id);
    res.json({ conversation: updated });
  } catch (err) {
    console.error('Toggle AI error:', err);
    res.status(500).json({ error: 'Failed to toggle AI' });
  }
});

// Resolve conversation
router.put('/:id/resolve', (req, res) => {
  try {
    const conversation = db.prepare('SELECT * FROM conversations WHERE id = ? AND user_id = ?').get(req.params.id, req.userId);
    if (!conversation) return res.status(404).json({ error: 'Conversation not found' });

    db.prepare('UPDATE conversations SET status = \'resolved\', updated_at = datetime(\'now\') WHERE id = ?').run(conversation.id);
    const updated = db.prepare('SELECT * FROM conversations WHERE id = ?').get(conversation.id);
    res.json({ conversation: updated });
  } catch (err) {
    console.error('Resolve conversation error:', err);
    res.status(500).json({ error: 'Failed to resolve conversation' });
  }
});

// Assign conversation
router.put('/:id/assign', (req, res) => {
  try {
    const conversation = db.prepare('SELECT * FROM conversations WHERE id = ? AND user_id = ?').get(req.params.id, req.userId);
    if (!conversation) return res.status(404).json({ error: 'Conversation not found' });

    const { assigned_to } = req.body;
    db.prepare('UPDATE conversations SET assigned_to = ?, updated_at = datetime(\'now\') WHERE id = ?').run(assigned_to || null, conversation.id);
    const updated = db.prepare('SELECT * FROM conversations WHERE id = ?').get(conversation.id);
    res.json({ conversation: updated });
  } catch (err) {
    console.error('Assign conversation error:', err);
    res.status(500).json({ error: 'Failed to assign conversation' });
  }
});

export default router;
