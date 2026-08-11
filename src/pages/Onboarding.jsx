import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, Tag, Users, Target, CheckCircle2, ArrowRight, ArrowLeft, Loader2, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Logo } from '../components/UI';

const steps = [
  { title: 'Business Name', icon: Building2, field: 'business_name', placeholder: 'Enter your business name' },
  { title: 'Business Category', icon: Tag, field: 'business_category', placeholder: '' },
  { title: 'Team Size', icon: Users, field: 'team_size', placeholder: '' },
  { title: 'Primary Goal', icon: Target, field: 'primary_goal', placeholder: '' },
  { title: 'Complete Setup', icon: CheckCircle2, field: null },
];

const categories = ['Technology', 'E-commerce', 'Education', 'Healthcare', 'Real Estate', 'Finance', 'Consulting', 'Agency', 'Restaurant', 'Retail', 'Manufacturing', 'Other'];
const teamSizes = ['Just me', '2-5', '6-10', '11-25', '26-50', '50+'];
const goals = [
  { id: 'customer_support', label: 'Customer Support', desc: 'Automate customer conversations' },
  { id: 'lead_generation', label: 'Lead Generation', desc: 'Capture and qualify more leads' },
  { id: 'sales_automation', label: 'Sales Automation', desc: 'Automate your sales pipeline' },
  { id: 'crm', label: 'CRM', desc: 'Organize customer relationships' },
  { id: 'whatsapp_automation', label: 'WhatsApp Automation', desc: 'WhatsApp sales workflows' },
  { id: 'telegram_automation', label: 'Telegram Automation', desc: 'Telegram bot integration' },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const { api, business, updateBusiness } = useAuth();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    business_name: business?.name || '',
    business_category: business?.category || '',
    team_size: business?.team_size || '',
    primary_goal: business?.primary_goal || ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const canNext = () => {
    if (step === 0) return form.business_name.trim().length > 0;
    if (step === 1) return form.business_category.length > 0;
    if (step === 2) return form.team_size.length > 0;
    if (step === 3) return form.primary_goal.length > 0;
    return true;
  };

  const handleNext = async () => {
    if (step === steps.length - 1) {
      // Complete onboarding
      setLoading(true);
      try {
        const data = await api('/settings/onboarding', {
          method: 'POST',
          body: JSON.stringify(form)
        });
        updateBusiness(data.business);
        navigate('/dashboard');
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
      return;
    }
    setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
  };

  const StepIcon = steps[step].icon;
  const progress = ((step + 1) / steps.length) * 100;

  return (
    <div className="onboarding-page">
      <div className="onboarding-header">
        <Logo />
        <div className="onboarding-progress">
          <div className="progress-bar"><div className="progress-fill" style={{ width: `${progress}%` }} /></div>
          <span>Step {step + 1} of {steps.length}</span>
        </div>
      </div>

      <div className="onboarding-body">
        <AnimatePresence mode="wait">
          <motion.div key={step} className="onboarding-step" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.3 }}>
            <div className="step-icon-large"><StepIcon size={32} /></div>
            <h1>{steps[step].title}</h1>

            {step === 0 && (
              <div className="onboarding-field">
                <input type="text" placeholder={steps[step].placeholder} value={form.business_name} onChange={e => setForm({ ...form, business_name: e.target.value })} autoFocus />
              </div>
            )}

            {step === 1 && (
              <div className="onboarding-options">
                {categories.map(cat => (
                  <button key={cat} type="button" className={`option-btn ${form.business_category === cat ? 'active' : ''}`} onClick={() => setForm({ ...form, business_category: cat })}>
                    {cat}
                  </button>
                ))}
              </div>
            )}

            {step === 2 && (
              <div className="onboarding-options">
                {teamSizes.map(size => (
                  <button key={size} type="button" className={`option-btn ${form.team_size === size ? 'active' : ''}`} onClick={() => setForm({ ...form, team_size: size })}>
                    {size}
                  </button>
                ))}
              </div>
            )}

            {step === 3 && (
              <div className="onboarding-goals">
                {goals.map(goal => (
                  <button key={goal.id} type="button" className={`goal-btn ${form.primary_goal === goal.id ? 'active' : ''}`} onClick={() => setForm({ ...form, primary_goal: goal.id })}>
                    <strong>{goal.label}</strong>
                    <span>{goal.desc}</span>
                  </button>
                ))}
              </div>
            )}

            {step === 4 && (
              <div className="onboarding-summary">
                <div className="summary-card">
                  <Sparkles size={24} />
                  <h2>You're all set!</h2>
                  <p>Here's a summary of your setup:</p>
                  <div className="summary-items">
                    <div><strong>Business:</strong> {form.business_name}</div>
                    <div><strong>Category:</strong> {form.business_category}</div>
                    <div><strong>Team Size:</strong> {form.team_size}</div>
                    <div><strong>Goal:</strong> {goals.find(g => g.id === form.primary_goal)?.label || form.primary_goal}</div>
                  </div>
                </div>
              </div>
            )}

            {error && <div className="auth-error"><span>{error}</span></div>}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="onboarding-actions">
        {step > 0 && (
          <button type="button" className="onboarding-btn secondary" onClick={handleBack}>
            <ArrowLeft size={18} /> Back
          </button>
        )}
        <button type="button" className="onboarding-btn primary" onClick={handleNext} disabled={!canNext() || loading}>
          {loading ? <><Loader2 size={18} className="spin" /> Setting up...</> :
            step === steps.length - 1 ? <><CheckCircle2 size={18} /> Complete Setup</> : <><ArrowRight size={18} /> Continue</>}
        </button>
      </div>
    </div>
  );
}
