import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  UsersRound, UserRoundPlus, BadgeCheck, XCircle, Flame, ChartNoAxesCombined,
  TrendingUp, Workflow, MessagesSquare, Loader2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AnalyticsPage() {
  const { api } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);

  const loadAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      const result = await api(`/analytics?days=${days}`);
      setData(result);
    } catch (e) { /* ignore */ }
    finally { setLoading(false); }
  }, [api, days]);

  useEffect(() => { loadAnalytics(); }, [loadAnalytics]);

  if (loading) return <div className="dash-loading"><Loader2 className="spin" size={24} /><span>Loading analytics...</span></div>;

  const stats = data?.stats || {};
  const statCards = [
    { label: 'Total Leads', value: stats.total_leads || 0, icon: UsersRound, color: 'cyan' },
    { label: 'New Leads', value: stats.new_leads || 0, icon: UserRoundPlus, color: 'green' },
    { label: 'Qualified', value: stats.qualified || 0, icon: Flame, color: 'orange' },
    { label: 'Converted', value: stats.converted || 0, icon: BadgeCheck, color: 'purple' },
    { label: 'Lost', value: stats.lost || 0, icon: XCircle, color: 'red' },
    { label: 'Conversion Rate', value: `${stats.conversion_rate || 0}%`, icon: ChartNoAxesCombined, color: 'yellow' },
  ];

  const maxSource = Math.max(...(data?.sources || []).map(s => s.count), 1);
  const maxService = Math.max(...(data?.services || []).map(s => s.count), 1);
  const maxMonthly = Math.max(...(data?.monthly || []).map(m => m.count), 1);

  return (
    <div className="analytics-page">
      <div className="page-header">
        <div><h1>Analytics</h1><p>Insights into your sales performance</p></div>
        <div className="date-filters">
          {[7, 30, 90].map(d => (
            <button key={d} className={`dash-btn ${days === d ? 'primary' : ''}`} onClick={() => setDays(d)}>{d} days</button>
          ))}
        </div>
      </div>

      <div className="stat-grid">
        {statCards.map((card, i) => (
          <motion.div key={card.label} className={`stat-card stat-${card.color}`} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <div className="stat-icon"><card.icon size={20} /></div>
            <div className="stat-info"><span>{card.label}</span><strong>{card.value}</strong></div>
          </motion.div>
        ))}
      </div>

      <div className="dash-grid-2">
        <div className="dash-card">
          <div className="card-header"><h3><TrendingUp size={18} /> Lead Sources</h3></div>
          <div className="chart-bars">
            {(data?.sources || []).length === 0 ? <p className="chart-empty">No data yet</p> :
              (data?.sources || []).map((source, i) => (
                <div key={source.source} className="chart-bar-item">
                  <span className="bar-label">{source.source || 'Unknown'}</span>
                  <div className="bar-track"><motion.div className="bar-fill" initial={{ width: 0 }} animate={{ width: `${(source.count / maxSource) * 100}%` }} transition={{ delay: i * 0.1, duration: 0.5 }} /></div>
                  <span className="bar-value">{source.count}</span>
                </div>
              ))
            }
          </div>
        </div>

        <div className="dash-card">
          <div className="card-header"><h3><Workflow size={18} /> Service Distribution</h3></div>
          <div className="chart-bars">
            {(data?.services || []).length === 0 ? <p className="chart-empty">No data yet</p> :
              (data?.services || []).map((svc, i) => (
                <div key={svc.service} className="chart-bar-item">
                  <span className="bar-label">{svc.service || 'Unknown'}</span>
                  <div className="bar-track"><motion.div className="bar-fill purple" initial={{ width: 0 }} animate={{ width: `${(svc.count / maxService) * 100}%` }} transition={{ delay: i * 0.1, duration: 0.5 }} /></div>
                  <span className="bar-value">{svc.count}</span>
                </div>
              ))
            }
          </div>
        </div>
      </div>

      <div className="dash-card">
        <div className="card-header"><h3><ChartNoAxesCombined size={18} /> Monthly Lead Growth</h3></div>
        <div className="monthly-chart">
          {(data?.monthly || []).length === 0 ? <p className="chart-empty">No data yet</p> :
            <div className="monthly-bars">
              {(data?.monthly || []).reverse().map((m, i) => (
                <div key={m.month} className="monthly-bar-item">
                  <motion.div className="monthly-bar" initial={{ height: 0 }} animate={{ height: `${(m.count / maxMonthly) * 100}%` }} transition={{ delay: i * 0.05, duration: 0.5 }} />
                  <span>{m.month}</span>
                  <em>{m.count}</em>
                </div>
              ))}
            </div>
          }
        </div>
      </div>

      <div className="dash-grid-2">
        <div className="dash-card">
          <div className="card-header"><h3><MessagesSquare size={18} /> Conversations</h3></div>
          <div className="mini-stats-grid">
            <div className="mini-stat"><span>Total</span><strong>{data?.conversationStats?.total_conversations || 0}</strong></div>
            <div className="mini-stat"><span>Active</span><strong>{data?.conversationStats?.active || 0}</strong></div>
          </div>
        </div>
        <div className="dash-card">
          <div className="card-header"><h3><Workflow size={18} /> Automations</h3></div>
          <div className="mini-stats-grid">
            <div className="mini-stat"><span>Total</span><strong>{data?.automationStats?.total_automations || 0}</strong></div>
            <div className="mini-stat"><span>Active</span><strong>{data?.automationStats?.active_automations || 0}</strong></div>
            <div className="mini-stat"><span>Total Runs</span><strong>{data?.automationStats?.total_runs || 0}</strong></div>
          </div>
        </div>
      </div>
    </div>
  );
}
