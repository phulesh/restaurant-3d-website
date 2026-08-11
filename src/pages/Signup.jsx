import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, User, Phone, Building2, Loader2, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Logo } from '../components/UI';

export default function Signup() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { signup } = useAuth();
  const [form, setForm] = useState({
    full_name: '', email: '', phone: '', business_name: '', password: '', confirm_password: '', plan: 'starter'
  });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const plan = searchParams.get('plan');
    if (plan && ['starter', 'professional', 'enterprise'].includes(plan)) {
      setForm(prev => ({ ...prev, plan }));
    }
  }, [searchParams]);

  const validate = () => {
    if (!form.full_name.trim()) return 'Full name is required';
    if (!form.email.trim()) return 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return 'Please enter a valid email';
    if (!form.password) return 'Password is required';
    if (form.password.length < 8) return 'Password must be at least 8 characters';
    if (form.password !== form.confirm_password) return 'Passwords do not match';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const validationError = validate();
    if (validationError) { setError(validationError); return; }

    setLoading(true);
    try {
      await signup({
        full_name: form.full_name,
        email: form.email,
        phone: form.phone,
        business_name: form.business_name,
        password: form.password,
        plan: form.plan
      });
      navigate('/onboarding');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const planLabels = { starter: 'Starter', professional: 'Professional', enterprise: 'Enterprise' };

  return (
    <div className="auth-page">
      <div className="auth-visual">
        <div className="auth-visual-bg" />
        <div className="auth-visual-content">
          <Logo />
          <h2>Start Your AI Sales Journey</h2>
          <p>Join businesses using AI to capture, qualify, and convert leads automatically.</p>
          <div className="auth-visual-features">
            <span><i /> No credit card required</span>
            <span><i /> Guided setup</span>
            <span><i /> 24/7 AI support</span>
            <span><i /> Cancel anytime</span>
          </div>
        </div>
      </div>
      <div className="auth-form-container">
        <motion.div className="auth-form-wrapper auth-form-wide" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Logo />
          <h1>Create your account</h1>
          <p className="auth-subtitle">Start capturing every conversation</p>

          {form.plan && (
            <div className="selected-plan-badge">
              <span>Selected Plan:</span> <strong>{planLabels[form.plan] || form.plan}</strong>
              <Link to="/#pricing" className="change-plan">Change</Link>
            </div>
          )}

          {error && <div className="auth-error"><span>{error}</span></div>}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-grid-2">
              <div className="form-field">
                <label htmlFor="full_name">Full Name *</label>
                <div className="input-wrap">
                  <User size={18} />
                  <input id="full_name" type="text" placeholder="John Doe" value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} required />
                </div>
              </div>
              <div className="form-field">
                <label htmlFor="email">Email *</label>
                <div className="input-wrap">
                  <Mail size={18} />
                  <input id="email" type="email" placeholder="you@company.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
                </div>
              </div>
            </div>
            <div className="form-grid-2">
              <div className="form-field">
                <label htmlFor="phone">Phone</label>
                <div className="input-wrap">
                  <Phone size={18} />
                  <input id="phone" type="tel" placeholder="+91 XXXXX XXXXX" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
                </div>
              </div>
              <div className="form-field">
                <label htmlFor="business_name">Business Name</label>
                <div className="input-wrap">
                  <Building2 size={18} />
                  <input id="business_name" type="text" placeholder="Your company" value={form.business_name} onChange={e => setForm({ ...form, business_name: e.target.value })} />
                </div>
              </div>
            </div>
            <div className="form-grid-2">
              <div className="form-field">
                <label htmlFor="password">Password *</label>
                <div className="input-wrap">
                  <Lock size={18} />
                  <input id="password" type={showPass ? 'text' : 'password'} placeholder="Min 8 characters" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
                  <button type="button" className="pass-toggle" onClick={() => setShowPass(!showPass)}>{showPass ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                </div>
              </div>
              <div className="form-field">
                <label htmlFor="confirm_password">Confirm Password *</label>
                <div className="input-wrap">
                  <Lock size={18} />
                  <input id="confirm_password" type={showPass ? 'text' : 'password'} placeholder="Repeat password" value={form.confirm_password} onChange={e => setForm({ ...form, confirm_password: e.target.value })} required />
                </div>
              </div>
            </div>
            <button type="submit" className="auth-submit" disabled={loading}>
              {loading ? <><Loader2 size={18} className="spin" /> Creating account...</> : <><UserPlus size={18} /> Create Account</>}
            </button>
          </form>

          <p className="auth-footer">
            Already have an account? <Link to="/login" className="auth-link">Sign in</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
