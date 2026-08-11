import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, User, Phone, Building2, Users, MessageSquare, Loader2, CheckCircle2, ArrowLeft } from 'lucide-react';
import { Logo } from '../components/UI';

export default function ContactSales() {
  const [form, setForm] = useState({
    name: '', email: '', phone: '', business: '', company_size: '', requirements: '', budget: '', message: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [responseMsg, setResponseMsg] = useState('');

  const validate = () => {
    if (!form.name.trim()) return 'Name is required';
    if (!form.email.trim()) return 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return 'Invalid email';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const err = validate();
    if (err) { setError(err); return; }

    setLoading(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResponseMsg(data.message);
      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="contact-sales-page">
      <div className="auth-visual">
        <div className="auth-visual-bg" />
        <div className="auth-visual-content">
          <Logo />
          <h2>Enterprise Solutions</h2>
          <p>Get a custom AI SalesFlow implementation built around your sales process and scale.</p>
          <div className="auth-visual-features">
            <span><i /> Custom AI workflows</span>
            <span><i /> Advanced automation</span>
            <span><i /> Priority support</span>
            <span><i /> Team management</span>
          </div>
        </div>
      </div>
      <div className="auth-form-container">
        <motion.div className="auth-form-wrapper auth-form-wide" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Link to="/" className="auth-back"><ArrowLeft size={16} /> Back to home</Link>
          <Logo />

          {success ? (
            <div className="auth-success-block">
              <CheckCircle2 size={48} />
              <h2>Thank you!</h2>
              <p>{responseMsg}</p>
              <Link to="/" className="auth-submit" style={{ display: 'inline-flex', marginTop: '1rem', textDecoration: 'none' }}>
                Back to Home
              </Link>
            </div>
          ) : (
            <>
              <h1>Contact Sales</h1>
              <p className="auth-subtitle">Tell us about your business and requirements</p>

              {error && <div className="auth-error"><span>{error}</span></div>}

              <form onSubmit={handleSubmit} className="auth-form">
                <div className="form-grid-2">
                  <div className="form-field">
                    <label>Name *</label>
                    <div className="input-wrap"><User size={18} /><input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Your name" required /></div>
                  </div>
                  <div className="form-field">
                    <label>Email *</label>
                    <div className="input-wrap"><Mail size={18} /><input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="you@company.com" required /></div>
                  </div>
                </div>
                <div className="form-grid-2">
                  <div className="form-field">
                    <label>Phone</label>
                    <div className="input-wrap"><Phone size={18} /><input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+91 XXXXX XXXXX" /></div>
                  </div>
                  <div className="form-field">
                    <label>Business</label>
                    <div className="input-wrap"><Building2 size={18} /><input type="text" value={form.business} onChange={e => setForm({ ...form, business: e.target.value })} placeholder="Company name" /></div>
                  </div>
                </div>
                <div className="form-grid-2">
                  <div className="form-field">
                    <label>Company Size</label>
                    <select value={form.company_size} onChange={e => setForm({ ...form, company_size: e.target.value })}>
                      <option value="">Select size</option>
                      <option value="1-10">1-10 employees</option>
                      <option value="11-50">11-50 employees</option>
                      <option value="51-200">51-200 employees</option>
                      <option value="201-1000">201-1000 employees</option>
                      <option value="1000+">1000+ employees</option>
                    </select>
                  </div>
                  <div className="form-field">
                    <label>Budget</label>
                    <select value={form.budget} onChange={e => setForm({ ...form, budget: e.target.value })}>
                      <option value="">Select budget</option>
                      <option value="Under ₹50,000">Under ₹50,000</option>
                      <option value="₹50,000 - ₹1,00,000">₹50,000 - ₹1,00,000</option>
                      <option value="₹1,00,000 - ₹5,00,000">₹1,00,000 - ₹5,00,000</option>
                      <option value="₹5,00,000+">₹5,00,000+</option>
                    </select>
                  </div>
                </div>
                <div className="form-field">
                  <label>Requirements</label>
                  <select value={form.requirements} onChange={e => setForm({ ...form, requirements: e.target.value })}>
                    <option value="">Select primary requirement</option>
                    <option value="AI Customer Support">AI Customer Support</option>
                    <option value="Lead Generation">Lead Generation</option>
                    <option value="Sales Automation">Sales Automation</option>
                    <option value="WhatsApp Automation">WhatsApp Automation</option>
                    <option value="Telegram Automation">Telegram Automation</option>
                    <option value="Custom Integration">Custom Integration</option>
                    <option value="Full Platform">Full Platform</option>
                  </select>
                </div>
                <div className="form-field">
                  <label>Message</label>
                  <textarea value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} rows={4} placeholder="Tell us more about your needs..." />
                </div>
                <button type="submit" className="auth-submit" disabled={loading}>
                  {loading ? <><Loader2 size={18} className="spin" /> Submitting...</> : <><MessageSquare size={18} /> Submit Request</>}
                </button>
              </form>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}
