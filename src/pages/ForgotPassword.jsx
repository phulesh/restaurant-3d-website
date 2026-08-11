import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, Loader2, Send, CheckCircle2, KeyRound } from 'lucide-react';
import { Logo } from '../components/UI';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const [demoToken, setDemoToken] = useState('');
  const [resetMode, setResetMode] = useState(false);
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email) { setError('Email is required'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSent(true);
      if (data.demo_token) setDemoToken(data.demo_token);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setError('');
    if (!resetToken || !newPassword) { setError('Token and new password are required'); return; }
    if (newPassword.length < 8) { setError('Password must be at least 8 characters'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: resetToken, password: newPassword })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResetSuccess(true);
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
          <h2>Secure Account Recovery</h2>
          <p>We'll help you get back into your AI SalesFlow account safely.</p>
        </div>
      </div>
      <div className="auth-form-container">
        <motion.div className="auth-form-wrapper" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Link to="/login" className="auth-back"><ArrowLeft size={16} /> Back to login</Link>
          <Logo />

          {!resetMode && !sent && (
            <>
              <h1>Forgot password?</h1>
              <p className="auth-subtitle">Enter your email and we'll send you a reset link.</p>
              {error && <div className="auth-error"><span>{error}</span></div>}
              <form onSubmit={handleSubmit} className="auth-form">
                <div className="form-field">
                  <label htmlFor="email">Email address</label>
                  <div className="input-wrap">
                    <Mail size={18} />
                    <input id="email" type="email" placeholder="you@company.com" value={email} onChange={e => setEmail(e.target.value)} required />
                  </div>
                </div>
                <button type="submit" className="auth-submit" disabled={loading}>
                  {loading ? <><Loader2 size={18} className="spin" /> Sending...</> : <><Send size={18} /> Send Reset Link</>}
                </button>
              </form>
            </>
          )}

          {sent && !resetMode && (
            <div className="auth-success-block">
              <CheckCircle2 size={48} />
              <h2>Check your email</h2>
              <p>If an account with <strong>{email}</strong> exists, we've sent a password reset link.</p>
              {demoToken && (
                <div className="demo-notice">
                  <span>DEMO MODE</span>
                  <p>No email service configured. Use this token to reset your password:</p>
                  <code>{demoToken}</code>
                  <button className="auth-submit" style={{ marginTop: '1rem' }} onClick={() => { setResetToken(demoToken); setResetMode(true); }}>
                    <KeyRound size={18} /> Reset Password Now
                  </button>
                </div>
              )}
              <button className="auth-submit secondary" onClick={() => setResetMode(true)} style={{ marginTop: '1rem' }}>
                <KeyRound size={18} /> I have a reset token
              </button>
            </div>
          )}

          {resetMode && !resetSuccess && (
            <>
              <h1>Reset password</h1>
              <p className="auth-subtitle">Enter your reset token and new password.</p>
              {error && <div className="auth-error"><span>{error}</span></div>}
              <form onSubmit={handleReset} className="auth-form">
                <div className="form-field">
                  <label htmlFor="token">Reset Token</label>
                  <div className="input-wrap">
                    <KeyRound size={18} />
                    <input id="token" type="text" placeholder="Paste your reset token" value={resetToken} onChange={e => setResetToken(e.target.value)} required />
                  </div>
                </div>
                <div className="form-field">
                  <label htmlFor="new_password">New Password</label>
                  <div className="input-wrap">
                    <Mail size={18} />
                    <input id="new_password" type="password" placeholder="Min 8 characters" value={newPassword} onChange={e => setNewPassword(e.target.value)} required />
                  </div>
                </div>
                <button type="submit" className="auth-submit" disabled={loading}>
                  {loading ? <><Loader2 size={18} className="spin" /> Resetting...</> : <><KeyRound size={18} /> Reset Password</>}
                </button>
              </form>
            </>
          )}

          {resetSuccess && (
            <div className="auth-success-block">
              <CheckCircle2 size={48} />
              <h2>Password reset!</h2>
              <p>Your password has been successfully reset.</p>
              <Link to="/login" className="auth-submit" style={{ display: 'inline-flex', marginTop: '1rem', textDecoration: 'none' }}>
                <ArrowLeft size={18} /> Go to Login
              </Link>
            </div>
          )}

          <p className="auth-footer">
            Remember your password? <Link to="/login" className="auth-link">Sign in</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
