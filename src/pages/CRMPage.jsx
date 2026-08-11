import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Plus, MoreHorizontal, Search, MessageCircle, Send, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const STAGES = ['New Lead', 'Contacted', 'Qualified', 'Converted', 'Won'];

export default function CRMPage() {
  const { api } = useAuth();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadLeads = useCallback(async () => {
    try {
      const data = await api('/leads?limit=200');
      setLeads(data.leads || []);
    } catch (e) { /* ignore */ }
    finally { setLoading(false); }
  }, [api]);

  useEffect(() => { loadLeads(); }, [loadLeads]);

  const handleDragStart = (e, leadId) => e.dataTransfer.setData('text/plain', leadId);

  const handleDrop = async (e, status) => {
    e.preventDefault();
    const leadId = e.dataTransfer.getData('text/plain');
    try {
      await api(`/leads/${leadId}`, { method: 'PUT', body: JSON.stringify({ status }) });
      loadLeads();
    } catch (err) { /* ignore */ }
  };

  const stageMap = {
    'New Lead': leads.filter(l => l.status === 'New Lead'),
    'Contacted': leads.filter(l => l.status === 'Contacted'),
    'Qualified': leads.filter(l => l.status === 'Qualified'),
    'Converted': leads.filter(l => l.status === 'Converted'),
    'Won': leads.filter(l => l.status === 'Converted' || l.status === 'Won'),
  };

  if (loading) return <div className="dash-loading"><div className="loader" /><span>Loading CRM...</span></div>;

  return (
    <div className="crm-page">
      <div className="page-header">
        <div><h1>Sales Pipeline</h1><p>Drag and drop leads between stages</p></div>
      </div>

      <div className="pipeline-board">
        {STAGES.map(stage => (
          <div key={stage} className="pipeline-column" onDragOver={e => e.preventDefault()} onDrop={e => handleDrop(e, stage)}>
            <div className="column-head">
              <span><i className="stage-dot" />{stage}</span>
              <em>{stageMap[stage]?.length || 0}</em>
            </div>
            <div className="column-cards">
              {(stageMap[stage] || []).map((lead, i) => (
                <motion.div key={lead.id} className="pipeline-card" draggable onDragStart={e => handleDragStart(e, lead.id)} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                  <div className="pc-header">
                    <span className="pc-avatar">{lead.name.split(' ').map(n => n[0]).join('').slice(0, 2)}</span>
                    <div><strong>{lead.name}</strong><span>{lead.service || 'No service'}</span></div>
                  </div>
                  {lead.budget && <div className="pc-budget">{lead.budget}</div>}
                  <div className="pc-footer">
                    <span className="pc-source"><MessageCircle size={11} /> {lead.source || 'Direct'}</span>
                    <span className={`pc-score ${lead.score >= 70 ? 'hot' : lead.score >= 40 ? 'warm' : 'cold'}`}>{lead.score || 0}</span>
                  </div>
                </motion.div>
              ))}
              {(stageMap[stage] || []).length === 0 && <div className="column-empty">No leads</div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
