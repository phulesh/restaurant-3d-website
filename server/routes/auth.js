import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import db from '../db/index.js';
import { hashPassword, comparePassword } from '../utils/password.js';
import { generateToken, generateResetToken } from '../utils/token.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// Signup
router.post('/signup', async (req, res) => {
  try {
    const { full_name, email, phone, business_name, password, plan } = req.body;

    if (!full_name || !email || !password) {
      return res.status(400).json({ error: 'Full name, email and password are required' });
    }
    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Invalid email address' });
    }

    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }

    const userId = uuid();
    const businessId = uuid();
    const subscriptionId = uuid();
    const passwordHash = await hashPassword(password);

    const insertUser = db.prepare(
      'INSERT INTO users (id, full_name, email, phone, password_hash) VALUES (?, ?, ?, ?, ?)'
    );
    const insertBusiness = db.prepare(
      'INSERT INTO businesses (id, user_id, name) VALUES (?, ?, ?)'
    );
    const insertSubscription = db.prepare(
      'INSERT INTO subscriptions (id, user_id, plan) VALUES (?, ?, ?)'
    );

    const transaction = db.transaction(() => {
      insertUser.run(userId, full_name, email, phone || null, passwordHash);
      insertBusiness.run(businessId, userId, business_name || '');
      insertSubscription.run(subscriptionId, userId, plan || 'starter');
    });
    transaction();

    const token = generateToken({ userId, email });

    res.status(201).json({
      token,
      user: { id: userId, full_name, email, phone },
      business: { id: businessId, name: business_name || '' },
      subscription: { plan: plan || 'starter' }
    });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ error: 'An error occurred during signup' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password, remember } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const valid = await comparePassword(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    if (!user.is_active) {
      return res.status(403).json({ error: 'Account has been deactivated' });
    }

    const token = generateToken({ userId: user.id, email: user.email });

    if (remember) {
      db.prepare('UPDATE users SET remember_token = ? WHERE id = ?').run(token, user.id);
    }

    const business = db.prepare('SELECT * FROM businesses WHERE user_id = ?').get(user.id);
    const subscription = db.prepare('SELECT * FROM subscriptions WHERE user_id = ?').get(user.id);

    res.json({
      token,
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        phone: user.phone
      },
      business: business || null,
      subscription: subscription || { plan: 'starter' },
      onboarding_completed: business?.onboarding_completed || 0
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'An error occurred during login' });
  }
});

// Forgot password
router.post('/forgot-password', (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const user = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (!user) {
      // Don't reveal whether user exists
      return res.json({ message: 'If an account with that email exists, a reset link has been sent.' });
    }

    const token = generateResetToken();
    const expires = new Date(Date.now() + 60 * 60 * 1000).toISOString();

    db.prepare('DELETE FROM password_resets WHERE user_id = ?').run(user.id);
    db.prepare(
      'INSERT INTO password_resets (id, user_id, token, expires_at) VALUES (?, ?, ?, ?)'
    ).run(uuid(), user.id, token, expires);

    // In production, send email via SMTP. In demo mode, return the token for testing.
    const isDemo = !process.env.SMTP_HOST;
    res.json({
      message: 'If an account with that email exists, a reset link has been sent.',
      ...(isDemo && { demo_token: token, demo_note: 'DEMO MODE: No email service configured. Use this token to reset password.' })
    });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ error: 'An error occurred' });
  }
});

// Reset password
router.post('/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) {
      return res.status(400).json({ error: 'Token and new password are required' });
    }
    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    const reset = db.prepare(
      'SELECT * FROM password_resets WHERE token = ? AND used = 0 AND expires_at > datetime(\'now\')'
    ).get(token);

    if (!reset) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    const passwordHash = await hashPassword(password);
    db.prepare('UPDATE users SET password_hash = ?, updated_at = datetime(\'now\') WHERE id = ?').run(passwordHash, reset.user_id);
    db.prepare('UPDATE password_resets SET used = 1 WHERE id = ?').run(reset.id);

    res.json({ message: 'Password has been reset successfully' });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ error: 'An error occurred' });
  }
});

// Get current user
router.get('/me', requireAuth, (req, res) => {
  try {
    const user = db.prepare('SELECT id, full_name, email, phone, role, created_at FROM users WHERE id = ?').get(req.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const business = db.prepare('SELECT * FROM businesses WHERE user_id = ?').get(req.userId);
    const subscription = db.prepare('SELECT * FROM subscriptions WHERE user_id = ?').get(req.userId);

    res.json({ user, business: business || null, subscription: subscription || { plan: 'starter' } });
  } catch (err) {
    console.error('Get me error:', err);
    res.status(500).json({ error: 'An error occurred' });
  }
});

// Logout
router.post('/logout', requireAuth, (req, res) => {
  db.prepare('UPDATE users SET remember_token = NULL WHERE id = ?').run(req.userId);
  res.json({ message: 'Logged out successfully' });
});

export default router;
