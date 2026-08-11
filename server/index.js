import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

import { runMigrations } from './db/migrations.js';
import authRoutes from './routes/auth.js';
import leadRoutes from './routes/leads.js';
import conversationRoutes from './routes/conversations.js';
import automationRoutes from './routes/automations.js';
import analyticsRoutes from './routes/analytics.js';
import integrationRoutes from './routes/integrations.js';
import notificationRoutes from './routes/notifications.js';
import settingsRoutes from './routes/settings.js';
import contactRoutes from './routes/contact.js';
import aiRoutes from './routes/ai.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? true : ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));

// Run migrations
runMigrations();

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/automations', automationRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/integrations', integrationRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/ai', aiRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', mode: process.env.OPENAI_API_KEY ? 'production' : 'demo', timestamp: new Date().toISOString() });
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(__dirname, '..', 'dist');
  app.use(express.static(distPath));
  // Express 5 uses new path syntax for catch-all
  app.get('/{*splat}', (req, res) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.join(distPath, 'index.html'));
    }
  });
}

// Error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`AI SalesFlow server running on port ${PORT}`);
  console.log(`Mode: ${process.env.OPENAI_API_KEY ? 'production' : 'demo'}`);
});

export default app;
