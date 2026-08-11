import { Router } from 'express';
import db from '../db/index.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

router.get('/', (req, res) => {
  try {
    const { days = 30 } = req.query;
    const dateFilter = `datetime('now', '-${parseInt(days)} days')`;

    const stats = db.prepare(`
      SELECT
        COUNT(*) as total_leads,
        SUM(CASE WHEN status = 'New Lead' THEN 1 ELSE 0 END) as new_leads,
        SUM(CASE WHEN status = 'Contacted' THEN 1 ELSE 0 END) as contacted,
        SUM(CASE WHEN status = 'Qualified' THEN 1 ELSE 0 END) as qualified,
        SUM(CASE WHEN status = 'Converted' THEN 1 ELSE 0 END) as converted,
        SUM(CASE WHEN status = 'Lost' THEN 1 ELSE 0 END) as lost,
        ROUND(
          CASE WHEN COUNT(*) > 0 
          THEN (CAST(SUM(CASE WHEN status = 'Converted' THEN 1 ELSE 0 END) AS REAL) / COUNT(*)) * 100 
          ELSE 0 END, 1
        ) as conversion_rate
      FROM leads WHERE user_id = ?
    `).get(req.userId);

    const sources = db.prepare(`
      SELECT source, COUNT(*) as count FROM leads 
      WHERE user_id = ? AND source IS NOT NULL
      GROUP BY source ORDER BY count DESC
    `).all(req.userId);

    const services = db.prepare(`
      SELECT service, COUNT(*) as count FROM leads 
      WHERE user_id = ? AND service IS NOT NULL
      GROUP BY service ORDER BY count DESC
    `).all(req.userId);

    // Monthly trend (last 12 months)
    const monthly = db.prepare(`
      SELECT strftime('%Y-%m', created_at) as month, COUNT(*) as count 
      FROM leads WHERE user_id = ? 
      GROUP BY month ORDER BY month DESC LIMIT 12
    `).all(req.userId);

    // Conversation stats
    const conversationStats = db.prepare(`
      SELECT
        COUNT(*) as total_conversations,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active
      FROM conversations WHERE user_id = ?
    `).get(req.userId);

    // Automation stats
    const automationStats = db.prepare(`
      SELECT
        COUNT(*) as total_automations,
        SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as active_automations,
        SUM(runs_count) as total_runs
      FROM automations WHERE user_id = ?
    `).get(req.userId);

    res.json({ stats, sources, services, monthly, conversationStats, automationStats });
  } catch (err) {
    console.error('Analytics error:', err);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// Dashboard summary
router.get('/dashboard', (req, res) => {
  try {
    const stats = db.prepare(`
      SELECT
        COUNT(*) as total_leads,
        SUM(CASE WHEN status = 'New Lead' THEN 1 ELSE 0 END) as new_leads,
        SUM(CASE WHEN status = 'Contacted' THEN 1 ELSE 0 END) as contacted,
        SUM(CASE WHEN status = 'Qualified' THEN 1 ELSE 0 END) as qualified,
        SUM(CASE WHEN status = 'Converted' THEN 1 ELSE 0 END) as converted,
        SUM(CASE WHEN status = 'Lost' THEN 1 ELSE 0 END) as lost,
        ROUND(
          CASE WHEN COUNT(*) > 0 
          THEN (CAST(SUM(CASE WHEN status = 'Converted' THEN 1 ELSE 0 END) AS REAL) / COUNT(*)) * 100 
          ELSE 0 END, 1
        ) as conversion_rate
      FROM leads WHERE user_id = ?
    `).get(req.userId);

    const recentLeads = db.prepare('SELECT * FROM leads WHERE user_id = ? ORDER BY created_at DESC LIMIT 5').all(req.userId);
    const recentConversations = db.prepare('SELECT * FROM conversations WHERE user_id = ? ORDER BY last_message_at DESC LIMIT 5').all(req.userId);
    const activeAutomations = db.prepare('SELECT COUNT(*) as count FROM automations WHERE user_id = ? AND is_active = 1').get(req.userId);

    res.json({ stats, recentLeads, recentConversations, activeAutomations: activeAutomations.count });
  } catch (err) {
    console.error('Dashboard error:', err);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

export default router;
