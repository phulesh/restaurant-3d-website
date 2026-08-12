import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Search, X, Trash2, Edit3, Eye,
  Loader2, CheckCircle2, Phone, Mail, ArrowUpDown, RefreshCw
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const STATUSES = ['New Lead', 'Contacted', 'Qualified', 'Converted', 'Lost'];
const SOURCES = ['Website', 'AI Chat', 'WhatsApp', 'Telegram', 'Manual', 'Webhook', 'Other'];

export default function Leads() {
  const { api } = useAuth();
  const [leads, setLeads] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [sort, setSort] = useState('created_at');
  const [order, setOrder] = useState('desc');
  const [showForm, setShowForm] = useState(false);
  const [editLead, setEditLead] = useState(null);
  const [viewLead, setViewLead] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', phone: '', email: '', service: '', budget: '', source: 'Manual', status: 'New Lead', notes: '', requirement: '' });
  const [retryingId, setRetryingId] = useState(null);

  const loadLeads = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (sourceFilter !== 'all') params.set('source', sourceFilter);
      params.set('sort', sort);
      params.set('order', order);

      const data = await api(`/leads?${params.toString()}`);
      setLeads(data.leads || []);
      setStats(data.stats || {});
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [api, search, statusFilter, sourceFilter, sort, order]);

  useEffect(() => { loadLeads(); }, [loadLeads]);

  const handleSave = async () => {
    if (!form.name.trim()) { setError('Lead name is required'); return; }
    setSaving(true);
    setError('');
    try {
      if (editLead) {
        await api(`/leads/${editLead.id}`, { method: 'PUT', body: JSON.stringify(form) });
      } else {
        await api('/leads', { method: 'POST', body: JSON.stringify(form) });
      }
      setShowForm(false);
      setEditLead(null);
      resetForm();
      loadLeads();
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this lead?')) return;
    try {
      await api(`/leads/${id}`, { method: 'DELETE' });
      if (viewLead?.id === id) setViewLead(null);
      loadLeads();
    } catch (e) { setError(e.message); }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await api(`/leads/${id}`, { method: 'PUT', body: JSON.stringify({ status }) });
      loadLeads();
    } catch (e) { setError(e.message); }
  };

  const openEdit = (lead) => {
    setEditLead(lead);
    setForm({
      name: lead.name, phone: lead.phone || '', email: lead.email || '',
      service: lead.service || '', budget: lead.budget || '', source: lead.source || 'Manual',
      status: lead.status || 'New Lead', notes: typeof lead.notes === 'string' ? lead.notes : '',
      requirement: lead.requirement || ''
    });
    setShowForm(true);
  };

  const resetForm = () => setForm({ name: '', phone: '', email: '', service: '', budget: '', source: 'Manual', status: 'New Lead', notes: '', requirement: '' });

  const retrySync = async (id) => {
    setRetryingId(id);
    try {
      await api(`/leads/${id}/retry-sync`, { method: 'POST' });
      loadLeads();
    } catch (e) { setError(e.message); }
    finally { setRetryingId(null); }
  };

  const syncLabel = (lead) => {
    const status = lead.google_sheets_sync_status;
    if (status === 'synced') return { text: 'Google Sheets Synced', cls: 'sync-synced' };
    if (status === 'failed') return { text: 'Sheets sync failed', cls: 'sync-failed' };
    if (status === 'pending') return { text: 'Sheets pending', cls: 'sync-pending' };
    return { text: 'Sheets not connected', cls: 'sync-off' };
  };

  const toggleSort = (field) => {
    if (sort === field) setOrder(order === 'desc' ? 'asc' : 'desc');
    else { setSort(field); setOrder('desc'); }
  };

  return (
    <div className="leads-page">
      <div className="page-header">
        <div>
          <h1>Lead Management</h1>
          <p>Manage all your leads in one place</p>
        </div>
        <button className="dash-btn primary" onClick={() => { resetForm(); setEditLead(null); setShowForm(true); }}>
          <Plus size={16} /> Add Lead
        </button>
      </div>

      <div className="leads-stats">
        <div className="mini-stat" onClick={() => setStatusFilter('all')}><span>Total</span><strong>{stats.total_leads || 0}</strong></div>
        <div className="mini-stat" onClick={() => setStatusFilter('New Lead')}><span>New</span><strong>{stats.new_leads || 0}</strong></div>
        <div className="mini-stat" onClick={() => setStatusFilter('Contacted')}><span>Contacted</span><strong>{stats.contacted || 0}</strong></div>
        <div className="mini-stat" onClick={() => setStatusFilter('Qualified')}><span>Qualified</span><strong>{stats.qualified || 0}</strong></div>
        <div className="mini-stat" onClick={() => setStatusFilter('Converted')}><span>Converted</span><strong>{stats.converted || 0}</strong></div>
        <div className="mini-stat" onClick={() => setStatusFilter('Lost')}><span>Lost</span><strong>{stats.lost || 0}</strong></div>
      </div>

      <div className="leads-toolbar">
        <div className="search-wrap">
          <Search size={16} />
          <input type="text" placeholder="Search leads..." value={search} onChange={e => setSearch(e.target.value)} />
          {search && <button onClick={() => setSearch('')}><X size={14} /></button>}
        </div>
        <div className="filter-group">
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="all">All Statuses</option>
            {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={sourceFilter} onChange={e => setSourceFilter(e.target.value)}>
            <option value="all">All Sources</option>
            {SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {error && <div className="dash-error"><span>{error}</span><button onClick={() => setError('')}><X size={14} /></button></div>}

      {loading ? (
        <div className="dash-loading"><div className="loader" /><span>Loading leads...</span></div>
      ) : leads.length === 0 ? (
        <div className="empty-state">
          <h3>No leads found</h3>
          <p>{search || statusFilter !== 'all' ? 'Try adjusting your filters' : 'Start by adding your first lead'}</p>
          <button className="dash-btn primary" onClick={() => { resetForm(); setShowForm(true); }}><Plus size={16} /> Add Lead</button>
        </div>
      ) : (
        <div className="leads-table-wrap">
          <table className="leads-table">
            <thead>
              <tr>
                <th onClick={() => toggleSort('lead_code')} className="sortable">Lead ID <ArrowUpDown size={12} /></th>
                <th onClick={() => toggleSort('name')} className="sortable">Name <ArrowUpDown size={12} /></th>
                <th>Contact</th>
                <th>Service</th>
                <th>Budget</th>
                <th>Source</th>
                <th onClick={() => toggleSort('status')} className="sortable">Status <ArrowUpDown size={12} /></th>
                <th>Sheets</th>
                <th onClick={() => toggleSort('created_at')} className="sortable">Created <ArrowUpDown size={12} /></th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {leads.map(lead => (
                <tr key={lead.id}>
                  <td><span className="lead-code">{lead.lead_code || '—'}</span></td>
                  <td><strong>{lead.name}</strong></td>
                  <td className="contact-cell">
                    {lead.phone && <span><Phone size={12} /> {lead.phone}</span>}
                    {lead.email && <span><Mail size={12} /> {lead.email}</span>}
                  </td>
                  <td>{lead.service || '—'}</td>
                  <td>{lead.budget || '—'}</td>
                  <td><span className="source-badge">{lead.source || '—'}</span></td>
                  <td>
                    <select className="status-select" value={lead.status} onChange={e => handleStatusChange(lead.id, e.target.value)}>
                      {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                  <td>
                    <span className={`sync-badge ${syncLabel(lead).cls}`}>{syncLabel(lead).text}</span>
                    {lead.google_sheets_sync_status === 'failed' && (
                      <button className="retry-sync-btn" onClick={() => retrySync(lead.id)} title="Retry Sync" disabled={retryingId === lead.id}>
                        {retryingId === lead.id ? <Loader2 size={12} className="spin" /> : <RefreshCw size={12} />} Retry
                      </button>
                    )}
                  </td>
                  <td>{new Date(lead.created_at).toLocaleDateString()}</td>
                  <td className="actions-cell">
                    <button onClick={() => setViewLead(lead)} title="View"><Eye size={15} /></button>
                    <button onClick={() => openEdit(lead)} title="Edit"><Edit3 size={15} /></button>
                    <button onClick={() => handleDelete(lead.id)} title="Delete" className="danger"><Trash2 size={15} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowForm(false)}>
            <motion.div className="modal" initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h2>{editLead ? 'Edit Lead' : 'Add New Lead'}</h2>
                <button onClick={() => setShowForm(false)}><X size={20} /></button>
              </div>
              <div className="modal-body">
                <div className="form-grid-2">
                  <div className="form-field">
                    <label>Name *</label>
                    <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Lead name" />
                  </div>
                  <div className="form-field">
                    <label>Phone</label>
                    <input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+91 XXXXX XXXXX" />
                  </div>
                  <div className="form-field">
                    <label>Email</label>
                    <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="email@example.com" />
                  </div>
                  <div className="form-field">
                    <label>Service</label>
                    <input type="text" value={form.service} onChange={e => setForm({ ...form, service: e.target.value })} placeholder="Interested service" />
                  </div>
                  <div className="form-field">
                    <label>Budget</label>
                    <input type="text" value={form.budget} onChange={e => setForm({ ...form, budget: e.target.value })} placeholder="₹50,000" />
                  </div>
                  <div className="form-field">
                    <label>Source</label>
                    <select value={form.source} onChange={e => setForm({ ...form, source: e.target.value })}>
                      {SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="form-field">
                    <label>Status</label>
                    <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                      {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-field">
                  <label>Notes</label>
                  <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Additional notes..." rows={3} />
                </div>
              </div>
              <div className="modal-footer">
                <button className="dash-btn" onClick={() => setShowForm(false)}>Cancel</button>
                <button className="dash-btn primary" onClick={handleSave} disabled={saving}>
                  {saving ? <><Loader2 size={16} className="spin" /> Saving...</> : <><CheckCircle2 size={16} /> {editLead ? 'Update' : 'Create'} Lead</>}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* View Lead Modal */}
      <AnimatePresence>
        {viewLead && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setViewLead(null)}>
            <motion.div className="modal modal-wide" initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Lead Details</h2>
                <button onClick={() => setViewLead(null)}><X size={20} /></button>
              </div>
              <div className="modal-body">
                <div className="lead-detail-grid">
                  <div className="ld-field"><span>Lead ID</span><strong>{viewLead.lead_code || '—'}</strong></div>
                  <div className="ld-field"><span>Name</span><strong>{viewLead.name}</strong></div>
                  <div className="ld-field"><span>Phone</span><strong>{viewLead.phone || '—'}</strong></div>
                  <div className="ld-field"><span>Email</span><strong>{viewLead.email || '—'}</strong></div>
                  <div className="ld-field"><span>Service</span><strong>{viewLead.service || '—'}</strong></div>
                  <div className="ld-field"><span>Budget</span><strong>{viewLead.budget || '—'}</strong></div>
                  <div className="ld-field"><span>Source</span><strong>{viewLead.source || '—'}</strong></div>
                  <div className="ld-field"><span>Status</span><strong><span className={`status-tag status-${viewLead.status?.toLowerCase().replace(/\s/g, '-')}`}>{viewLead.status}</span></strong></div>
                  <div className="ld-field"><span>Unique Lead Key</span><strong className="mono-key">{viewLead.unique_lead_key || '—'}</strong></div>
                  <div className="ld-field"><span>Last Contacted</span><strong>{viewLead.last_contacted || '—'}</strong></div>
                  <div className="ld-field"><span>Google Sheets</span><strong className={viewLead.google_sheets_sync_status === 'synced' ? 'green-text' : ''}>{syncLabel(viewLead).text}</strong></div>
                  <div className="ld-field"><span>Created</span><strong>{new Date(viewLead.created_at).toLocaleString()}</strong></div>
                </div>
                {viewLead.requirement && (
                  <div className="ld-notes">
                    <span>Requirement</span>
                    <p>{viewLead.requirement}</p>
                  </div>
                )}
                {viewLead.google_sheets_error && (
                  <div className="ld-notes">
                    <span>Sheets error</span>
                    <p>{viewLead.google_sheets_error}</p>
                    <button className="dash-btn" onClick={() => retrySync(viewLead.id)}><RefreshCw size={14} /> Retry Sync</button>
                  </div>
                )}
                {viewLead.notes && (
                  <div className="ld-notes">
                    <span>Notes</span>
                    <p>{typeof viewLead.notes === 'string' && viewLead.notes.startsWith('[') ? JSON.parse(viewLead.notes).map((n, i) => <span key={i}>{n.text}<br /></span>) : viewLead.notes}</p>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button className="dash-btn danger" onClick={() => { handleDelete(viewLead.id); }}><Trash2 size={14} /> Delete</button>
                <button className="dash-btn" onClick={() => { setViewLead(null); openEdit(viewLead); }}><Edit3 size={14} /> Edit</button>
                <button className="dash-btn" onClick={() => setViewLead(null)}>Close</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
