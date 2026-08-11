import { useState, useEffect } from 'react';
import { CreditCard, Check, Sparkles, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const plans = [
  {
    name: 'Starter', price: 'Custom', period: 'for small businesses',
    features: ['AI customer support', 'Telegram automation', 'Basic lead generation', 'Basic CRM', 'Lead notifications'],
    planId: 'starter'
  },
  {
    name: 'Professional', price: 'Custom', period: 'for growing businesses',
    features: ['WhatsApp + Telegram', 'Advanced AI Agent', 'Lead qualification', 'Lead scoring', 'CRM pipeline', 'Follow-up automation', 'Analytics'],
    planId: 'professional', featured: true
  },
  {
    name: 'Enterprise', price: "Let's talk", period: 'for advanced sales teams',
    features: ['Everything in Professional', 'Custom AI workflows', 'Advanced automation', 'Custom CRM', 'Team management', 'API integration', 'Priority support'],
    planId: 'enterprise'
  },
];

export default function Billing() {
  const { subscription } = useAuth();
  const currentPlan = subscription?.plan || 'starter';

  return (
    <div className="billing-page">
      <div className="page-header">
        <div><h1>Billing</h1><p>Manage your subscription and payments</p></div>
      </div>

      <div className="billing-current">
        <div className="billing-current-card">
          <div><CreditCard size={24} /></div>
          <div>
            <span>Current Plan</span>
            <strong>{currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)}</strong>
          </div>
          <span className="plan-status active">Active</span>
        </div>
        <div className="billing-notice">
          <AlertCircle size={16} />
          <span>Payment integration requires a Stripe account. Configure STRIPE_SECRET_KEY in environment variables to enable billing.</span>
        </div>
      </div>

      <div className="billing-plans">
        {plans.map(plan => (
          <div key={plan.planId} className={`billing-plan ${plan.featured ? 'featured' : ''} ${plan.planId === currentPlan ? 'current' : ''}`}>
            {plan.featured && <div className="popular"><Sparkles size={13} /> MOST POPULAR</div>}
            {plan.planId === currentPlan && <div className="current-badge">Current Plan</div>}
            <h3>{plan.name}</h3>
            <div className="plan-price"><strong>{plan.price}</strong><span>{plan.period}</span></div>
            <ul>{plan.features.map(f => <li key={f}><Check size={14} />{f}</li>)}</ul>
            {plan.planId !== currentPlan && (
              <button className={`dash-btn ${plan.featured ? 'primary' : ''}`} disabled>
                {plan.planId === 'enterprise' ? 'Contact Sales' : 'Upgrade'} <ArrowRight size={14} />
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="dash-card">
        <div className="card-header"><h3>Billing History</h3></div>
        <div className="empty-state">
          <p>No billing history available. Payment integration requires Stripe configuration.</p>
        </div>
      </div>
    </div>
  );
}
