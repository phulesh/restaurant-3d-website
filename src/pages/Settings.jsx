import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  User, Building2, Sparkles, Bell, Puzzle, Shield, CreditCard, Users,
  Save, Loader2, CheckCircle2, X, Eye, EyeOff
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const tabs = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'business', label: 'Business', icon: Building2 },
  { id: 'ai', label: 'AI Settings', icon: Sparkles },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'security', label: 'Security', icon: Shield },
];

export default function Settings() {
  const { api, user, business, updateUser, updateBusiness } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Profile form
  const [profileForm, setProfileForm] = useState({ full_name: '', email: '', phone: '' });
  // Business form
  const [businessForm, setBusinessForm] = useState({ name: '', category: '', description: '', services: '', working_hours: '', contact_info: '' });
  // AI form
  const [aiForm, setAiForm] = useState({ ai_tone: 'professional', ai_languages: 'en', faq: '' });
  // Password form
  const [passForm, setPassForm] = useState({ current_password: '', new_password: '', confirm_password: '' });
  const [showPass, setShowPass] = useState(false);

  useEffect(() => {
    if (user) setProfileForm({ full_name: user.full_name || '', email: user.email || '', phone: user.phone || '' });
  }, [user]);

  useEffect(() => {
    if (business) {
      setBusinessForm({
        name: business.name || '', category: business.category || '',
        description: business.description || '', services: business.services || '',
        working_hours: business.working_hours || '', contact_info: business.contact_info || ''
      });
      setAiForm({
        ai_tone: business.ai_tone || 'professional', ai_languages: business.ai_languages || 'en',
        faq: business.faq || ''
      });
    }
  }, [business]);

  const showSuccess = (msg) => { setSuccess(msg); setTimeout(() => setSuccess(''), 3000); };

  const saveProfile = async () => {
    setSaving(true);
    try {
      const data = await api('/settings/profile', { method: 'PUT', body: JSON.stringify(profileForm) });
      updateUser(data.user);
      showSuccess('Profile updated successfully');
    } catch (e) { setError(e.message); }
    finally { setSaving(false); }
  };

  const saveBusiness = async () => {
    setSaving(true);
    try {
      const data = await api('/settings/business', { method: 'PUT', body: JSON.stringify(businessForm) });
      updateBusiness(data.business);
      showSuccess('Business settings updated');
    } catch (e) { setError(e.message); }
    finally { setSaving(false); }
  };

  const saveAI = async () => {
    setSaving(true);
    try {
      const data = await api('/settings/business', { method: 'PUT', body: JSON.stringify(aiForm) });
      updateBusiness(data.business);
      showSuccess('AI settings updated');
    } catch (e) { setError(e.message); }
    finally { setSaving(false); }
  };

  const changePassword = async () => {
    if (passForm.new_password !== passForm.confirm_password) { setError('Passwords do not match'); return; }
    if (passForm.new_password.length < 8) { setError('Password must be at least 8 characters'); return; }
    setSaving(true);
    try {
      await api('/settings/password', { method: 'PUT', body: JSON.stringify({ current_password: passForm.current_password, new_password: passForm.new_password }) });
      setPassForm({ current_password: '', new_password: '', confirm_password: '' });
      showSuccess('Password changed successfully');
    } catch (e) { setError(e.message); }
    finally { setSaving(false); }
  };

  return (
    <div className="settings-page">
      <div className="page-header">
        <div><h1>Settings</h1><p>Manage your account and preferences</p></div>
      </div>

      {success && <div className="dash-success"><CheckCircle2 size={16} />{success}</div>}
      {error && <div className="dash-error"><span>{error}</span><button onClick={() => setError('')}><X size={14} /></button></div>}

      <div className="settings-layout">
        <div className="settings-tabs">
          {tabs.map(tab => (
            <button key={tab.id} className={`settings-tab ${activeTab === tab.id ? 'active' : ''}`} onClick={() => setActiveTab(tab.id)}>
              <tab.icon size={18} /><span>{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="settings-content">
          {activeTab === 'profile' && (
            <div className="settings-section">
              <h2>Profile</h2>
              <div className="form-grid-2">
                <div className="form-field"><label>Full Name</label><input type="text" value={profileForm.full_name} onChange={e => setProfileForm({ ...profileForm, full_name: e.target.value })} /></div>
                <div className="form-field"><label>Email</label><input type="email" value={profileForm.email} onChange={e => setProfileForm({ ...profileForm, email: e.target.value })} /></div>
                <div className="form-field"><label>Phone</label><input type="tel" value={profileForm.phone} onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })} /></div>
              </div>
              <button className="dash-btn primary" onClick={saveProfile} disabled={saving}>
                {saving ? <Loader2 className="spin" size={16} /> : <Save size={16} />} Save Profile
              </button>
            </div>
          )}

          {activeTab === 'business' && (
            <div className="settings-section">
              <h2>Business Information</h2>
              <div className="form-grid-2">
                <div className="form-field"><label>Business Name</label><input type="text" value={businessForm.name} onChange={e => setBusinessForm({ ...businessForm, name: e.target.value })} /></div>
                <div className="form-field"><label>Category</label><input type="text" value={businessForm.category} onChange={e => setBusinessForm({ ...businessForm, category: e.target.value })} /></div>
              </div>
              <div className="form-field"><label>Description</label><textarea value={businessForm.description} onChange={e => setBusinessForm({ ...businessForm, description: e.target.value })} rows={3} /></div>
              <div className="form-field"><label>Services (comma separated)</label><input type="text" value={businessForm.services} onChange={e => setBusinessForm({ ...businessForm, services: e.target.value })} /></div>
              <div className="form-field"><label>Working Hours</label><input type="text" value={businessForm.working_hours} onChange={e => setBusinessForm({ ...businessForm, working_hours: e.target.value })} placeholder="Monday-Friday, 9 AM - 6 PM" /></div>
              <div className="form-field"><label>Contact Info (JSON)</label><textarea value={businessForm.contact_info} onChange={e => setBusinessForm({ ...businessForm, contact_info: e.target.value })} rows={2} placeholder='{"email":"hello@company.com","phone":"+91 XXXXX XXXXX"}' /></div>
              <button className="dash-btn primary" onClick={saveBusiness} disabled={saving}>
                {saving ? <Loader2 className="spin" size={16} /> : <Save size={16} />} Save Business
              </button>
            </div>
          )}

          {activeTab === 'ai' && (
            <div className="settings-section">
              <h2>AI Settings</h2>
              <p className="section-desc">Configure how your AI assistant communicates with customers.</p>
              <div className="form-grid-2">
                <div className="form-field">
                  <label>Tone of Voice</label>
                  <select value={aiForm.ai_tone} onChange={e => setAiForm({ ...aiForm, ai_tone: e.target.value })}>
                    <option value="professional">Professional</option>
                    <option value="friendly">Friendly</option>
                    <option value="casual">Casual</option>
                    <option value="formal">Formal</option>
                  </select>
                </div>
                <div className="form-field">
                  <label>Supported Languages</label>
                  <input type="text" value={aiForm.ai_languages} onChange={e => setAiForm({ ...aiForm, ai_languages: e.target.value })} placeholder="en, hi" />
                </div>
              </div>
              <div className="form-field">
                <label>FAQ (one per line: Q: ... A: ...)</label>
                <textarea value={aiForm.faq} onChange={e => setAiForm({ ...aiForm, faq: e.target.value })} rows={6} placeholder="Q: What services do you offer? A: We provide AI automation, WhatsApp bots, and CRM solutions." />
              </div>
              <div className="ai-notice">
                <Sparkles size={16} />
                <span>AI runs in demo mode. Configure OPENAI_API_KEY in environment variables for production AI responses.</span>
              </div>
              <button className="dash-btn primary" onClick={saveAI} disabled={saving}>
                {saving ? <Loader2 className="spin" size={16} /> : <Save size={16} />} Save AI Settings
              </button>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="settings-section">
              <h2>Notification Preferences</h2>
              <div className="notification-options">
                {[
                  { label: 'New lead notifications', desc: 'Get notified when a new lead is captured' },
                  { label: 'High-value lead alerts', desc: 'Priority alerts for leads with high scores' },
                  { label: 'New conversation alerts', desc: 'When a customer starts a new conversation' },
                  { label: 'Lead conversion alerts', desc: 'When a lead status changes to Converted' },
                  { label: 'Automation failure alerts', desc: 'When an automation workflow fails' },
                ].map(notif => (
                  <div key={notif.label} className="notif-option">
                    <div><strong>{notif.label}</strong><span>{notif.desc}</span></div>
                    <label className="toggle"><input type="checkbox" defaultChecked /><span className="toggle-slider" /></label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="settings-section">
              <h2>Change Password</h2>
              <div className="form-field">
                <label>Current Password</label>
                <div className="input-wrap">
                  <input type={showPass ? 'text' : 'password'} value={passForm.current_password} onChange={e => setPassForm({ ...passForm, current_password: e.target.value })} />
                  <button type="button" className="pass-toggle" onClick={() => setShowPass(!showPass)}>{showPass ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                </div>
              </div>
              <div className="form-grid-2">
                <div className="form-field"><label>New Password</label><input type={showPass ? 'text' : 'password'} value={passForm.new_password} onChange={e => setPassForm({ ...passForm, new_password: e.target.value })} placeholder="Min 8 characters" /></div>
                <div className="form-field"><label>Confirm Password</label><input type={showPass ? 'text' : 'password'} value={passForm.confirm_password} onChange={e => setPassForm({ ...passForm, confirm_password: e.target.value })} /></div>
              </div>
              <button className="dash-btn primary" onClick={changePassword} disabled={saving}>
                {saving ? <Loader2 className="spin" size={16} /> : <Shield size={16} />} Change Password
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
