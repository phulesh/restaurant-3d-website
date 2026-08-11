import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageCircle, Send, Sheet, Mail, PanelsTopLeft, Webhook, Code2,
  Plug, X, CheckCircle2, AlertCircle, Loader2, Settings, ExternalLink
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const INTEGRATION_META = {
  whatsapp: { icon: MessageCircle, color: 'green', description: 'Connect WhatsApp Business API for automated customer conversations.' },
  telegram: { icon: Send, color: 'cyan', description: 'Link a Telegram bot to handle customer support and lead capture.' },
  google_sheets: { icon: Sheet, color: 'green', description: 'Sync lead data to Google Sheets for reporting and backup.' },
  email: { icon: Mail, color: 'blue', description: 'Configure email notifications and follow-up sequences.' },
  crm: { icon: PanelsTopLeft, color: 'purple', description: 'Connect external CRM systems for two-way lead sync.' },
  webhook: { icon: Webhook, color: 'orange', description: 'Send lead events to custom webhook endpoints.' },
  api: { icon: Code2, color: 'blue', description: 'Access the API for custom integrations with your tools.' },
};

export default function IntegrationsPage() {
  const { api } = useAuth();
  const [integrations, setIntegrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [configuring, setConfiguring] = useState(null);
  const [configForm, setConfigForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const loadIntegrations = useCallback(async () => {
    try {
      const data = await api('/integrations');
      setIntegrations(data.integrations || []);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, [api]);

  useEffect(() => { loadIntegrations(); }, [loadIntegrations]);

  const handleConnect = async (integration) => {
    setConfiguring(integration);
    try {
      setConfigForm(integration.config ? JSON.parse(integration.config) : {});
    } catch { setConfigForm({}); }
  };

  const handleSaveConfig = async () => {
    if (!configuring) return;
    setSaving(true);
    try {
      await api(`/integrations/${configuring.id}/connect`, {
        method: 'PUT',
        body: JSON.stringify({ config: configForm })
      });
      setConfiguring(null);
      loadIntegrations();
    } catch (e) { setError(e.message); }
    finally { setSaving(false); }
  };

  const handleDisconnect = async (integration) => {
    if (!confirm(`Disconnect ${integration.name}?`)) return;
    try {
      await api(`/integrations/${integration.id}/disconnect`, { method: 'PUT' });
      loadIntegrations();
    } catch (e) { setError(e.message); }
  };

  if (loading) return <div className="dash-loading"><Loader2 className="spin" size={24} /><span>Loading integrations...</span></div>;

  return (
    <div className="integrations-page">
      <div className="page-header">
        <div><h1>Integrations</h1><p>Connect your tools and channels</p></div>
      </div>

      {error && <div className="dash-error"><span>{error}</span><button onClick={() => setError('')}><X size={14} /></button></div>}

      <div className="integration-grid">
        {integrations.map((intg, i) => {
          const meta = INTEGRATION_META[intg.type] || {};
          const Icon = meta.icon || Plug;
          const isConnected = intg.status === 'connected';
          return (
            <motion.div key={intg.id} className={`intg-card ${isConnected ? 'connected' : ''}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <div className={`intg-icon intg-${meta.color}`}><Icon size={24} /></div>
              <div className="intg-info">
                <strong>{intg.name}</strong>
                <p>{meta.description || 'Configure this integration.'}</p>
              </div>
              <div className="intg-status">
                {isConnected ? (
                  <span className="status-connected"><CheckCircle2 size={14} /> Connected</span>
                ) : (
                  <span className="status-disconnected"><AlertCircle size={14} /> Not connected</span>
                )}
              </div>
              <div className="intg-actions">
                {isConnected ? (
                  <>
                    <button className="dash-btn" onClick={() => handleConnect(intg)}><Settings size={14} /> Configure</button>
                    <button className="dash-btn danger" onClick={() => handleDisconnect(intg)}>Disconnect</button>
                  </>
                ) : (
                  <button className="dash-btn primary" onClick={() => handleConnect(intg)}><Plug size={14} /> Connect</button>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Configuration Modal */}
      <AnimatePresence>
        {configuring && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setConfiguring(null)}>
            <motion.div className="modal" initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Configure {configuring.name}</h2>
                <button onClick={() => setConfiguring(null)}><X size={20} /></button>
              </div>
              <div className="modal-body">
                <p className="config-desc">{INTEGRATION_META[configuring.type]?.description}</p>

                {configuring.type === 'whatsapp' && (
                  <>
                    <div className="form-field"><label>Phone Number ID</label><input type="text" value={configForm.phone_number_id || ''} onChange={e => setConfigForm({ ...configForm, phone_number_id: e.target.value })} placeholder="Your WhatsApp Phone Number ID" /></div>
                    <div className="form-field"><label>Access Token</label><input type="password" value={configForm.access_token || ''} onChange={e => setConfigForm({ ...configForm, access_token: e.target.value })} placeholder="WhatsApp Access Token" /></div>
                    <div className="form-field"><label>Verify Token</label><input type="text" value={configForm.verify_token || ''} onChange={e => setConfigForm({ ...configForm, verify_token: e.target.value })} placeholder="Webhook Verify Token" /></div>
                  </>
                )}

                {configuring.type === 'telegram' && (
                  <div className="form-field"><label>Bot Token</label><input type="password" value={configForm.bot_token || ''} onChange={e => setConfigForm({ ...configForm, bot_token: e.target.value })} placeholder="Telegram Bot Token from @BotFather" /></div>
                )}

                {configuring.type === 'google_sheets' && (
                  <>
                    <div className="form-field"><label>Spreadsheet URL or ID</label><input type="text" value={configForm.spreadsheet_id || ''} onChange={e => setConfigForm({ ...configForm, spreadsheet_id: e.target.value })} placeholder="Google Sheets URL or ID" /></div>
                    <div className="form-field"><label>Worksheet Name</label><input type="text" value={configForm.worksheet || ''} onChange={e => setConfigForm({ ...configForm, worksheet: e.target.value })} placeholder="Sheet1" /></div>
                    <div className="config-notice">Google OAuth credentials must be set in environment variables (GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET).</div>
                  </>
                )}

                {configuring.type === 'email' && (
                  <>
                    <div className="form-field"><label>SMTP Host</label><input type="text" value={configForm.smtp_host || ''} onChange={e => setConfigForm({ ...configForm, smtp_host: e.target.value })} placeholder="smtp.gmail.com" /></div>
                    <div className="form-field"><label>SMTP Port</label><input type="text" value={configForm.smtp_port || ''} onChange={e => setConfigForm({ ...configForm, smtp_port: e.target.value })} placeholder="587" /></div>
                    <div className="form-field"><label>Username</label><input type="text" value={configForm.smtp_user || ''} onChange={e => setConfigForm({ ...configForm, smtp_user: e.target.value })} placeholder="your@email.com" /></div>
                    <div className="form-field"><label>Password</label><input type="password" value={configForm.smtp_pass || ''} onChange={e => setConfigForm({ ...configForm, smtp_pass: e.target.value })} placeholder="App password" /></div>
                  </>
                )}

                {configuring.type === 'webhook' && (
                  <div className="form-field"><label>Webhook URL</label><input type="url" value={configForm.webhook_url || ''} onChange={e => setConfigForm({ ...configForm, webhook_url: e.target.value })} placeholder="https://your-webhook-url.com/endpoint" /></div>
                )}

                {configuring.type === 'api' && (
                  <div className="config-notice">Use the API base URL <code>/api</code> with your authentication token. See documentation for endpoint details.</div>
                )}

                {configuring.type === 'crm' && (
                  <div className="config-notice">External CRM integration requires API credentials. Configure via webhook or API integration for data sync.</div>
                )}
              </div>
              <div className="modal-footer">
                <button className="dash-btn" onClick={() => setConfiguring(null)}>Cancel</button>
                <button className="dash-btn primary" onClick={handleSaveConfig} disabled={saving}>
                  {saving ? <><Loader2 className="spin" size={16} /> Saving...</> : <><CheckCircle2 size={16} /> Save & Connect</>}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
