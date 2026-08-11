import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  UsersRound, UserRoundPlus, PhoneCall, BadgeCheck, XCircle, ChartNoAxesCombined,
  Flame, MessagesSquare, Workflow, Plus, TrendingUp, ArrowRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function DashboardHome() {
  const { api, user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api('/analytics/dashboard')
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [api]);

  if (loading) return <div className="dash-loading"><div className="loader" /><span>Loading dashboard...</span></div>;

  const stats = data?.stats || {};
  const statCards = [
    { label: 'Total Leads', value: stats.total_leads || 0, icon: UsersRound, color: 'cyan' },
    { label: 'New Leads', value: stats.new_leads || 0, icon: UserRoundPlus, color: 'green' },
    { label: 'Contacted', value: stats.contacted || 0, icon: PhoneCall, color: 'blue' },
    { label: 'Qualified', value: stats.qualified || 0, icon: Flame, color: 'orange' },
    { label: 'Converted', value: stats.converted || 0, icon: BadgeCheck, color: 'purple' },
    { label: 'Lost', value: stats.lost || 0, icon: XCircle, color: 'red' },
    { label: 'Conversion Rate', value: `${stats.conversion_rate || 0}%`, icon: ChartNoAxesCombined, color: 'yellow' },
  ];

  return (
    <div className="dashboard-home">
      <div className="dash-welcome">
        <div>
          <h1>Welcome back, {user?.full_name?.split(' ')[0] || 'there'}!</h1>
          <p>Here's what's happening with your sales pipeline today.</p>
        </div>
        <button className="dash-btn primary" onClick={() => navigate('/dashboard/leads')}>
          <Plus size={16} /> Add Lead
        </button>
      </div>

      <div className="stat-grid">
        {statCards.map((card, i) => (
          <motion.div key={card.label} className={`stat-card stat-${card.color}`} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <div className="stat-icon"><card.icon size={20} /></div>
            <div className="stat-info">
              <span>{card.label}</span>
              <strong>{card.value}</strong>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="dash-grid-2">
        <div className="dash-card">
          <div className="card-header">
            <h3><UserRoundPlus size={18} /> Recent Leads</h3>
            <button className="card-link" onClick={() => navigate('/dashboard/leads')}>View all <ArrowRight size={14} /></button>
          </div>
          <div className="card-list">
            {data?.recentLeads?.length > 0 ? data.recentLeads.map(lead => (
              <div key={lead.id} className="card-list-item" onClick={() => navigate('/dashboard/leads')}>
                <div className="cli-avatar">{lead.name.split(' ').map(n => n[0]).join('').slice(0, 2)}</div>
                <div className="cli-info">
                  <strong>{lead.name}</strong>
                  <span>{lead.service || 'No service'}</span>
                </div>
                <span className={`cli-status status-${lead.status.toLowerCase().replace(/\s/g, '-')}`}>{lead.status}</span>
              </div>
            )) : <div className="empty-state"><p>No leads yet. Start by adding your first lead!</p><button className="dash-btn primary" onClick={() => navigate('/dashboard/leads')}><Plus size={16} /> Add Lead</button></div>}
          </div>
        </div>

        <div className="dash-card">
          <div className="card-header">
            <h3><MessagesSquare size={18} /> Recent Conversations</h3>
            <button className="card-link" onClick={() => navigate('/dashboard/conversations')}>View all <ArrowRight size={14} /></button>
          </div>
          <div className="card-list">
            {data?.recentConversations?.length > 0 ? data.recentConversations.map(conv => (
              <div key={conv.id} className="card-list-item" onClick={() => navigate('/dashboard/conversations')}>
                <div className="cli-avatar">{(conv.customer_name || 'C')[0]}</div>
                <div className="cli-info">
                  <strong>{conv.customer_name || 'Customer'}</strong>
                  <span>{conv.channel} · {conv.status}</span>
                </div>
                <span className={`cli-status status-${conv.status}`}>{conv.status}</span>
              </div>
            )) : <div className="empty-state"><p>No conversations yet. They'll appear when customers reach out.</p></div>}
          </div>
        </div>
      </div>

      <div className="dash-card">
        <div className="card-header">
          <h3><Workflow size={18} /> Automation Status</h3>
          <button className="card-link" onClick={() => navigate('/dashboard/automation')}>Manage <ArrowRight size={14} /></button>
        </div>
        <div className="automation-status-bar">
          <div className="as-item"><span>Active Automations</span><strong>{data?.activeAutomations || 0}</strong></div>
          <div className="as-item"><span>Total Leads</span><strong>{stats.total_leads || 0}</strong></div>
          <div className="as-item"><span>Conversion Rate</span><strong>{stats.conversion_rate || 0}%</strong></div>
          <div className="as-item"><span><TrendingUp size={14} /> Pipeline Health</span><strong className="green-text">Good</strong></div>
        </div>
      </div>
    </div>
  );
}
