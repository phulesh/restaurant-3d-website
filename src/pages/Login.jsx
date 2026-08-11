import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, LogIn, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Logo } from '../components/UI';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '', remember: false });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.email || !form.password) {
      setError('Please enter your email and password');
      return;
    }
    setLoading(true);
    try {
      const data = await login(form.email, form.password, form.remember);
      if (data.onboarding_completed) {
        navigate('/dashboard');
      } else {
        navigate('/onboarding');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-visual">
        <div className="auth-visual-bg" />
        <div className="auth-visual-content">
          <Logo />
          <h2>Turn Every Conversation Into a Customer</h2>
          <p>AI-powered sales automation for WhatsApp, Telegram and modern businesses.</p>
          <div className="auth-visual-features">
            <span><i /> AI Customer Support</span>
            <span><i /> Smart Lead Qualification</span>
            <span><i /> Automatic CRM</span>
            <span><i /> 24/7 Automation</span>
          </div>
        </div>
      </div>
      <div className="auth-form-container">
        <motion.div className="auth-form-wrapper" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Logo />
          <h1>Welcome back</h1>
          <p className="auth-subtitle">Sign in to your AI SalesFlow account</p>

          {error && <div className="auth-error"><span>{error}</span></div>}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-field">
              <label htmlFor="email">Email address</label>
              <div className="input-wrap">
                <Mail size={18} />
                <input id="email" type="email" placeholder="you@company.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required autoComplete="email" />
              </div>
            </div>
            <div className="form-field">
              <label htmlFor="password">Password</label>
              <div className="input-wrap">
                <Lock size={18} />
                <input id="password" type={showPass ? 'text' : 'password'} placeholder="Enter your password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required autoComplete="current-password" />
                <button type="button" className="pass-toggle" onClick={() => setShowPass(!showPass)} aria-label={showPass ? 'Hide password' : 'Show password'}>
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <div className="form-row-between">
              <label className="checkbox-label">
                <input type="checkbox" checked={form.remember} onChange={e => setForm({ ...form, remember: e.target.checked })} />
                <span>Remember me</span>
              </label>
              <Link to="/forgot-password" className="auth-link">Forgot password?</Link>
            </div>
            <button type="submit" className="auth-submit" disabled={loading}>
              {loading ? <><Loader2 size={18} className="spin" /> Signing in...</> : <><LogIn size={18} /> Sign In</>}
            </button>
          </form>

          <p className="auth-footer">
            Don't have an account? <Link to="/signup" className="auth-link">Create one</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
