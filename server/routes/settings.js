import { Router } from 'express';
import db from '../db/index.js';
import { requireAuth } from '../middleware/auth.js';
import { hashPassword } from '../utils/password.js';

const router = Router();
router.use(requireAuth);

// Get profile
router.get('/profile', (req, res) => {
  try {
    const user = db.prepare('SELECT id, full_name, email, phone, role, created_at FROM users WHERE id = ?').get(req.userId);
    const business = db.prepare('SELECT * FROM businesses WHERE user_id = ?').get(req.userId);
    const subscription = db.prepare('SELECT * FROM subscriptions WHERE user_id = ?').get(req.userId);
    res.json({ user, business, subscription });
  } catch (err) {
    console.error('Get profile error:', err);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Update profile
router.put('/profile', (req, res) => {
  try {
    const { full_name, email, phone } = req.body;
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.userId);

    if (email && email !== user.email) {
      const existing = db.prepare('SELECT id FROM users WHERE email = ? AND id != ?').get(email, req.userId);
      if (existing) return res.status(409).json({ error: 'Email already in use' });
    }

    db.prepare('UPDATE users SET full_name = ?, email = ?, phone = ?, updated_at = datetime(\'now\') WHERE id = ?').run(
      full_name || user.full_name, email || user.email, phone ?? user.phone, req.userId
    );

    const updated = db.prepare('SELECT id, full_name, email, phone, role FROM users WHERE id = ?').get(req.userId);
    res.json({ user: updated });
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Update business
router.put('/business', (req, res) => {
  try {
    const { name, category, description, services, pricing, working_hours, contact_info, faq, ai_tone, ai_languages } = req.body;
    const business = db.prepare('SELECT * FROM businesses WHERE user_id = ?').get(req.userId);

    db.prepare(`
      UPDATE businesses SET name = ?, category = ?, description = ?, services = ?, pricing = ?, working_hours = ?, contact_info = ?, faq = ?, ai_tone = ?, ai_languages = ?, updated_at = datetime('now')
      WHERE user_id = ?
    `).run(
      name || business.name, category ?? business.category,
      description ?? business.description,
      services ? (typeof services === 'string' ? services : JSON.stringify(services)) : business.services,
      pricing ?? business.pricing,
      working_hours ?? business.working_hours,
      contact_info ? (typeof contact_info === 'string' ? contact_info : JSON.stringify(contact_info)) : business.contact_info,
      faq ? (typeof faq === 'string' ? faq : JSON.stringify(faq)) : business.faq,
      ai_tone ?? business.ai_tone, ai_languages ?? business.ai_languages,
      req.userId
    );

    const updated = db.prepare('SELECT * FROM businesses WHERE user_id = ?').get(req.userId);
    res.json({ business: updated });
  } catch (err) {
    console.error('Update business error:', err);
    res.status(500).json({ error: 'Failed to update business' });
  }
});

// Change password
router.put('/password', async (req, res) => {
  try {
    const { current_password, new_password } = req.body;
    if (!current_password || !new_password) return res.status(400).json({ error: 'Current and new password are required' });
    if (new_password.length < 8) return res.status(400).json({ error: 'New password must be at least 8 characters' });

    const { comparePassword } = await import('../utils/password.js');
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.userId);
    const valid = await comparePassword(current_password, user.password_hash);
    if (!valid) return res.status(401).json({ error: 'Current password is incorrect' });

    const hash = await hashPassword(new_password);
    db.prepare('UPDATE users SET password_hash = ?, updated_at = datetime(\'now\') WHERE id = ?').run(hash, req.userId);
    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error('Change password error:', err);
    res.status(500).json({ error: 'Failed to change password' });
  }
});

// Complete onboarding
router.post('/onboarding', (req, res) => {
  try {
    const { business_name, business_category, team_size, primary_goal } = req.body;

    db.prepare(`
      UPDATE businesses SET name = COALESCE(?, name), category = COALESCE(?, category), team_size = COALESCE(?, team_size), primary_goal = COALESCE(?, primary_goal), onboarding_completed = 1, updated_at = datetime('now')
      WHERE user_id = ?
    `).run(business_name || null, business_category || null, team_size || null, primary_goal || null, req.userId);

    const business = db.prepare('SELECT * FROM businesses WHERE user_id = ?').get(req.userId);
    res.json({ business });
  } catch (err) {
    console.error('Onboarding error:', err);
    res.status(500).json({ error: 'Failed to complete onboarding' });
  }
});

export default router;
