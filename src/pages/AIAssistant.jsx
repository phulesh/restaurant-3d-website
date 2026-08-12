import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Sparkles, Loader2, Trash2, MessageCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AIAssistant() {
  const { api } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [demoMode, setDemoMode] = useState(false);
  const [leadEvent, setLeadEvent] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || sending) return;
    const userMsg = { sender: 'customer', content: input, created_at: new Date().toISOString() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setSending(true);

    try {
      const data = await api('/ai/chat', {
        method: 'POST',
        body: JSON.stringify({ message: input, conversation_id: conversationId })
      });
      setMessages(prev => [...prev, { sender: 'ai', content: data.response, intent: data.intent, created_at: new Date().toISOString() }]);
      setConversationId(data.conversation_id);
      setDemoMode(data.demo_mode);
      if (data.lead?.action === 'created') {
        setLeadEvent({ type: 'created', code: data.lead.lead_code, sync: data.lead.google_sheets_sync_status });
      } else if (data.lead?.action === 'updated') {
        setLeadEvent({ type: 'updated', code: data.lead.lead_code, sync: data.lead.google_sheets_sync_status });
      }
    } catch (e) {
      setMessages(prev => [...prev, { sender: 'ai', content: 'Sorry, I encountered an error. Please try again.', created_at: new Date().toISOString() }]);
    } finally {
      setSending(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
    setConversationId(null);
    setLeadEvent(null);
  };

  const quickPrompts = [
    'What services do you offer?',
    'What are your prices?',
    'I need WhatsApp automation',
    'How does lead qualification work?',
    'Tell me about your CRM',
    'What are your working hours?',
  ];

  return (
    <div className="ai-assistant-page">
      <div className="page-header">
        <div>
          <h1><Sparkles size={24} /> AI Assistant</h1>
          <p>Test your AI customer support agent</p>
        </div>
        <div className="ai-header-actions">
          {demoMode && <span className="demo-badge">DEMO MODE</span>}
          {leadEvent && (
            <span className={`lead-event-badge ${leadEvent.type}`}>
              {leadEvent.type === 'created' ? 'Lead created' : 'Existing lead updated'} {leadEvent.code}
              {leadEvent.sync === 'synced' ? ' · Google Sheets Synced' : leadEvent.sync === 'failed' ? ' · Sheets sync failed' : ''}
            </span>
          )}
          <button className="dash-btn" onClick={clearChat}><Trash2 size={14} /> Clear Chat</button>
        </div>
      </div>

      <div className="ai-chat-container">
        <div className="ai-chat-messages">
          {messages.length === 0 && (
            <div className="ai-welcome">
              <Bot size={48} />
              <h2>AI Sales Assistant</h2>
              <p>Start a conversation to test your AI agent. It will respond based on your business configuration.</p>
              <div className="quick-prompts">
                {quickPrompts.map(prompt => (
                  <button key={prompt} className="quick-prompt" onClick={() => { setInput(prompt); }}>
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}
          {messages.map((msg, i) => (
            <motion.div key={i} className={`ai-msg ai-msg-${msg.sender}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              <div className="ai-msg-avatar">{msg.sender === 'ai' ? <Bot size={18} /> : <User size={18} />}</div>
              <div className="ai-msg-content">
                <p>{msg.content}</p>
                <div className="ai-msg-meta">
                  <span>{msg.sender === 'ai' ? 'AI Assistant' : 'You'}</span>
                  {msg.intent && <span className="ai-intent">{msg.intent}</span>}
                  <time>{new Date(msg.created_at).toLocaleTimeString()}</time>
                </div>
              </div>
            </motion.div>
          ))}
          {sending && (
            <div className="ai-msg ai-msg-ai">
              <div className="ai-msg-avatar"><Bot size={18} /></div>
              <div className="ai-msg-content typing"><span /><span /><span /></div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="ai-chat-input">
          <input type="text" placeholder="Type your message..." value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()} disabled={sending} />
          <button onClick={handleSend} disabled={sending || !input.trim()}>
            {sending ? <Loader2 className="spin" size={20} /> : <Send size={20} />}
          </button>
        </div>
      </div>
    </div>
  );
}
