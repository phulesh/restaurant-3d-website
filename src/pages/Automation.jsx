import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Workflow, ToggleLeft, ToggleRight, Trash2, Edit3, X,
  Zap, GitBranch, CheckCircle2, Loader2, Bell, UserPlus, MessageCircle, ArrowRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const TRIGGER_TYPES = [
  { value: 'new_message', label: 'New Message', icon: MessageCircle },
  { value: 'new_lead', label: 'New Lead', icon: UserPlus },
  { value: 'form_submission', label: 'Form Submission', icon: Zap },
  { value: 'status_changed', label: 'Lead Status Changed', icon: GitBranch },
];

const CONDITION_TYPES = ['Budget', 'Service', 'Lead Status', 'Customer Response'];
const ACTION_TYPES = ['AI Reply', 'Create Lead', 'Update Lead', 'Send Notification', 'Assign Lead', 'Follow-up'];

export default function Automation() {
  const { api } = useAuth();
  const [automations, setAutomations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '', description: '', trigger_type: 'new_message',
    conditions: [], actions: [{ type: 'AI Reply' }]
  });

  const loadAutomations = useCallback(async () => {
    try {
      const data = await api('/automations');
      setAutomations(data.automations || []);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, [api]);

  useEffect(() => { loadAutomations(); }, [loadAutomations]);

  const handleSave = async () => {
    if (!form.name.trim()) { setError('Name is required'); return; }
    setSaving(true);
    try {
      await api('/automations', {
        method: 'POST',
        body: JSON.stringify(form)
      });
      setShowForm(false);
      resetForm();
      loadAutomations();
    } catch (e) { setError(e.message); }
    finally { setSaving(false); }
  };

  const handleToggle = async (id) => {
    try {
      await api(`/automations/${id}/toggle`, { method: 'PUT' });
      loadAutomations();
    } catch (e) { setError(e.message); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this automation?')) return;
    try {
      await api(`/automations/${id}`, { method: 'DELETE' });
      loadAutomations();
    } catch (e) { setError(e.message); }
  };

  const resetForm = () => setForm({ name: '', description: '', trigger_type: 'new_message', conditions: [], actions: [{ type: 'AI Reply' }] });

  const addAction = () => setForm({ ...form, actions: [...form.actions, { type: 'AI Reply' }] });
  const removeAction = (i) => setForm({ ...form, actions: form.actions.filter((_, idx) => idx !== i) });
  const updateAction = (i, type) => {
    const actions = [...form.actions];
    actions[i] = { type };
    setForm({ ...form, actions });
  };

  const addCondition = () => setForm({ ...form, conditions: [...form.conditions, { type: 'Budget', operator: '>', value: '' }] });
  const removeCondition = (i) => setForm({ ...form, conditions: form.conditions.filter((_, idx) => idx !== i) });

  return (
    <div className="automation-page">
      <div className="page-header">
        <div><h1>Automation Builder</h1><p>Create automated workflows for your sales process</p></div>
        <button className="dash-btn primary" onClick={() => { resetForm(); setShowForm(true); }}>
          <Plus size={16} /> New Automation
        </button>
      </div>

      {error && <div className="dash-error"><span>{error}</span><button onClick={() => setError('')}><X size={14} /></button></div>}

      {loading ? (
        <div className="dash-loading"><div className="loader" /><span>Loading automations...</span></div>
      ) : automations.length === 0 ? (
        <div className="empty-state">
          <Workflow size={48} />
          <h3>No automations yet</h3>
          <p>Create your first automation to start streamlining your sales process</p>
          <button className="dash-btn primary" onClick={() => setShowForm(true)}><Plus size={16} /> Create Automation</button>
        </div>
      ) : (
        <div className="automation-grid">
          {automations.map((auto, i) => {
            const triggerInfo = TRIGGER_TYPES.find(t => t.value === auto.trigger_type);
            return (
              <motion.div key={auto.id} className={`auto-card ${auto.is_active ? 'active' : 'inactive'}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <div className="auto-header">
                  <div className="auto-icon"><Workflow size={20} /></div>
                  <div className="auto-info">
                    <strong>{auto.name}</strong>
                    <span>{auto.description || triggerInfo?.label || auto.trigger_type}</span>
                  </div>
                  <button className={`toggle-btn ${auto.is_active ? 'on' : 'off'}`} onClick={() => handleToggle(auto.id)}>
                    {auto.is_active ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
                  </button>
                </div>
                <div className="auto-flow">
                  <span className="flow-step trigger"><Zap size={12} /> {triggerInfo?.label || 'Trigger'}</span>
                  <ArrowRight size={12} />
                  <span className="flow-step action"><CheckCircle2 size={12} /> {(() => { try { const acts = JSON.parse(auto.actions); return acts.length + ' action' + (acts.length !== 1 ? 's' : ''); } catch { return 'Actions'; } })()}</span>
                </div>
                <div className="auto-footer">
                  <span>Runs: {auto.runs_count || 0}</span>
                  <div>
                    <button onClick={() => handleDelete(auto.id)} className="danger"><Trash2 size={14} /></button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Create Automation Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowForm(false)}>
            <motion.div className="modal modal-wide" initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Create Automation</h2>
                <button onClick={() => setShowForm(false)}><X size={20} /></button>
              </div>
              <div className="modal-body">
                <div className="form-grid-2">
                  <div className="form-field">
                    <label>Name *</label>
                    <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g., Auto-qualify new leads" />
                  </div>
                  <div className="form-field">
                    <label>Trigger *</label>
                    <select value={form.trigger_type} onChange={e => setForm({ ...form, trigger_type: e.target.value })}>
                      {TRIGGER_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-field">
                  <label>Description</label>
                  <input type="text" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="What does this automation do?" />
                </div>

                <div className="auto-builder-section">
                  <h4><GitBranch size={16} /> Conditions</h4>
                  {form.conditions.map((cond, i) => (
                    <div key={i} className="condition-row">
                      <select value={cond.type} onChange={e => { const c = [...form.conditions]; c[i] = { ...c[i], type: e.target.value }; setForm({ ...form, conditions: c }); }}>
                        {CONDITION_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                      <input type="text" placeholder="Value" value={cond.value} onChange={e => { const c = [...form.conditions]; c[i] = { ...c[i], value: e.target.value }; setForm({ ...form, conditions: c }); }} />
                      <button onClick={() => removeCondition(i)}><X size={14} /></button>
                    </div>
                  ))}
                  <button className="add-btn" onClick={addCondition}><Plus size={14} /> Add Condition</button>
                </div>

                <div className="auto-builder-section">
                  <h4><CheckCircle2 size={16} /> Actions</h4>
                  {form.actions.map((action, i) => (
                    <div key={i} className="action-row">
                      <span className="action-number">{i + 1}</span>
                      <select value={action.type} onChange={e => updateAction(i, e.target.value)}>
                        {ACTION_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                      {form.actions.length > 1 && <button onClick={() => removeAction(i)}><X size={14} /></button>}
                    </div>
                  ))}
                  <button className="add-btn" onClick={addAction}><Plus size={14} /> Add Action</button>
                </div>
              </div>
              <div className="modal-footer">
                <button className="dash-btn" onClick={() => setShowForm(false)}>Cancel</button>
                <button className="dash-btn primary" onClick={handleSave} disabled={saving}>
                  {saving ? <><Loader2 className="spin" size={16} /> Saving...</> : <><CheckCircle2 size={16} /> Create Automation</>}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
