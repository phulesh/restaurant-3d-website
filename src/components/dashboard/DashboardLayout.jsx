import { useState, useEffect } from 'react';
import { NavLink, useNavigate, Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, UsersRound, PanelsTopLeft, MessagesSquare, Workflow,
  Sparkles, ChartNoAxesCombined, Puzzle, Settings, CreditCard, LogOut,
  Bell, Menu, X, ChevronRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../hooks/useApi';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/dashboard/leads', icon: UsersRound, label: 'Leads' },
  { to: '/dashboard/crm', icon: PanelsTopLeft, label: 'CRM' },
  { to: '/dashboard/conversations', icon: MessagesSquare, label: 'Conversations' },
  { to: '/dashboard/automation', icon: Workflow, label: 'Automation' },
  { to: '/dashboard/ai-assistant', icon: Sparkles, label: 'AI Assistant' },
  { to: '/dashboard/analytics', icon: ChartNoAxesCombined, label: 'Analytics' },
  { to: '/dashboard/integrations', icon: Puzzle, label: 'Integrations' },
  { to: '/dashboard/settings', icon: Settings, label: 'Settings' },
  { to: '/dashboard/billing', icon: CreditCard, label: 'Billing' },
];

export default function DashboardLayout() {
  const navigate = useNavigate();
  const { user, business, logout } = useAuth();
  const { getNotifications, markRead, markAllRead } = useNotifications();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const loadNotifications = async () => {
    try {
      const data = await getNotifications();
      setNotifications(data.notifications || []);
      setUnreadCount(data.unread_count || 0);
    } catch (e) { /* ignore */ }
  };

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleMarkRead = async (id) => {
    await markRead(id);
    loadNotifications();
  };

  const handleMarkAllRead = async () => {
    await markAllRead();
    loadNotifications();
  };

  const initials = (user?.full_name || 'U').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="dashboard-layout">
      <aside className={`dash-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <a className="brand" href="/" aria-label="AI SalesFlow home">
            <span className="brand-mark"><span>AI</span><i /></span>
            <span className="brand-name">AI Sales<span>Flow</span></span>
          </a>
          <button className="sidebar-close" onClick={() => setSidebarOpen(false)}><X size={20} /></button>
        </div>
        <nav className="sidebar-nav">
          {navItems.map(item => (
            <NavLink key={item.to} to={item.to} end={item.to === '/dashboard'} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} onClick={() => setSidebarOpen(false)}>
              <item.icon size={18} />
              <span>{item.label}</span>
              <ChevronRight size={14} className="sidebar-arrow" />
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          <button className="sidebar-link logout-link" onClick={handleLogout}>
            <LogOut size={18} /><span>Logout</span>
          </button>
        </div>
      </aside>

      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

      <div className="dash-main">
        <header className="dash-topbar">
          <button className="menu-toggle" onClick={() => setSidebarOpen(true)}><Menu size={22} /></button>
          <div className="topbar-title">
            <h2>{business?.name || 'My Business'}</h2>
          </div>
          <div className="topbar-actions">
            <button className="notif-btn" onClick={() => setNotifOpen(!notifOpen)}>
              <Bell size={20} />
              {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
            </button>
            <div className="topbar-user" onClick={() => navigate('/dashboard/settings')}>
              <div className="user-avatar">{initials}</div>
              <span>{user?.full_name || 'User'}</span>
            </div>
          </div>

          <AnimatePresence>
            {notifOpen && (
              <motion.div className="notif-dropdown" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <div className="notif-header">
                  <h3>Notifications</h3>
                  {unreadCount > 0 && <button onClick={handleMarkAllRead}>Mark all read</button>}
                </div>
                <div className="notif-list">
                  {notifications.length === 0 ? (
                    <p className="notif-empty">No notifications yet</p>
                  ) : notifications.slice(0, 10).map(n => (
                    <div key={n.id} className={`notif-item ${n.read ? '' : 'unread'}`} onClick={() => handleMarkRead(n.id)}>
                      <strong>{n.title}</strong>
                      <p>{n.message}</p>
                      <time>{new Date(n.created_at).toLocaleString()}</time>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </header>

        <main className="dash-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
