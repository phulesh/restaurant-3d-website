import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import db from '../db/index.js';

const router = Router();

router.post('/', (req, res) => {
  try {
    const { name, email, phone, business, company_size, requirements, budget, message } = req.body;

    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Invalid email address' });
    }

    const id = uuid();
    db.prepare(`
      INSERT INTO contact_requests (id, name, email, phone, business, company_size, requirements, budget, message)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, name, email, phone || null, business || null, company_size || null, requirements || null, budget || null, message || null);

    res.status(201).json({ id, message: 'Your request has been submitted. Our team will contact you within 24 hours.' });
  } catch (err) {
    console.error('Contact request error:', err);
    res.status(500).json({ error: 'Failed to submit contact request' });
  }
});

export default router;
