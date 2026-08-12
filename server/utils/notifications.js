import { v4 as uuid } from 'uuid';
import db from '../db/index.js';

export function createNotification(userId, type, title, message, data = null) {
  try {
    db.prepare(
      'INSERT INTO notifications (id, user_id, type, title, message, data) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(uuid(), userId, type, title, message, data ? JSON.stringify(data) : null);
  } catch (err) {
    console.error('Notification creation failed:', err);
  }
}
