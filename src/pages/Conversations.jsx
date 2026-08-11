import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Send, MoreHorizontal, Bot, User, CheckCircle2, X,
  ToggleLeft, ToggleRight, UserCheck, Loader2, MessageCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Conversations() {
  const { api } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [active, setActive] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);

  const loadConversations = useCallback(async () => {
    try {
      const params = search ? `?search=${encodeURIComponent(search)}` : '';
      const data = await api(`/conversations${params}`);
      setConversations(data.conversations || []);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, [api, search]);

  useEffect(() => { loadConversations(); }, [loadConversations]);

  const loadMessages = useCallback(async (convId) => {
    try {
      const data = await api(`/conversations/${convId}`);
      setActive(data.conversation);
      setMessages(data.messages || []);
    } catch (e) { setError(e.message); }
  }, [api]);

  useEffect(() => {
    if (active) loadMessages(active.id);
  }, [active?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!newMsg.trim() || !active) return;
    setSending(true);
    try {
      await api(`/conversations/${active.id}/messages`, {
        method: 'POST',
        body: JSON.stringify({ content: newMsg, sender: 'human' })
      });
      setNewMsg('');
      loadMessages(active.id);
      loadConversations();
    } catch (e) { setError(e.message); }
    finally { setSending(false); }
  };

  const toggleAI = async () => {
    if (!active) return;
    try {
      await api(`/conversations/${active.id}/ai-toggle`, { method: 'PUT' });
      loadMessages(active.id);
    } catch (e) { setError(e.message); }
  };

  const resolveConv = async () => {
    if (!active) return;
    try {
      await api(`/conversations/${active.id}/resolve`, { method: 'PUT' });
      loadConversations();
      loadMessages(active.id);
    } catch (e) { setError(e.message); }
  };

  return (
    <div className="conversations-page">
      <div className="page-header">
        <div><h1>Conversations</h1><p>Manage customer conversations</p></div>
      </div>

      <div className="conv-layout">
        <div className="conv-sidebar">
          <div className="conv-search">
            <Search size={16} />
            <input type="text" placeholder="Search conversations..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="conv-list">
            {loading ? <div className="conv-empty"><Loader2 className="spin" size={20} /></div> :
              conversations.length === 0 ? <div className="conv-empty"><MessageCircle size={24} /><span>No conversations yet</span></div> :
                conversations.map(conv => (
                  <button key={conv.id} className={`conv-item ${active?.id === conv.id ? 'active' : ''}`} onClick={() => loadMessages(conv.id)}>
                    <div className="conv-avatar">{(conv.customer_name || 'C')[0]}</div>
                    <div className="conv-info">
                      <div className="conv-top"><strong>{conv.customer_name || 'Customer'}</strong><time>{conv.last_message_at ? new Date(conv.last_message_at).toLocaleDateString() : ''}</time></div>
                      <p>{conv.last_message || 'No messages yet'}</p>
                    </div>
                    <span className={`conv-status ${conv.status}`}>{conv.status}</span>
                  </button>
                ))
            }
          </div>
        </div>

        <div className="conv-main">
          {!active ? (
            <div className="conv-empty-main">
              <MessageCircle size={48} />
              <h3>Select a conversation</h3>
              <p>Choose a conversation from the sidebar to view messages</p>
            </div>
          ) : (
            <>
              <div className="conv-header">
                <div className="conv-header-info">
                  <div className="conv-avatar">{(active.customer_name || 'C')[0]}</div>
                  <div>
                    <strong>{active.customer_name || 'Customer'}</strong>
                    <span>{active.customer_phone || active.customer_email || active.channel}</span>
                  </div>
                </div>
                <div className="conv-header-actions">
                  <button className={`ai-toggle ${active.ai_enabled ? 'on' : 'off'}`} onClick={toggleAI}>
                    {active.ai_enabled ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                    <span>AI {active.ai_enabled ? 'ON' : 'OFF'}</span>
                  </button>
                  <button className="dash-btn" onClick={resolveConv}><CheckCircle2 size={14} /> Resolve</button>
                </div>
              </div>

              <div className="conv-messages">
                {messages.length === 0 && <div className="conv-empty"><MessageCircle size={24} /><span>No messages yet</span></div>}
                {messages.map(msg => (
                  <motion.div key={msg.id} className={`msg msg-${msg.sender}`} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}>
                    <div className="msg-avatar">{msg.sender === 'ai' ? <Bot size={16} /> : msg.sender === 'human' ? <UserCheck size={16} /> : <User size={16} />}</div>
                    <div className="msg-body">
                      <p>{msg.content}</p>
                      <span className="msg-meta">{msg.sender === 'ai' ? 'AI' : msg.sender === 'human' ? 'Team' : 'Customer'} · {new Date(msg.created_at).toLocaleTimeString()}</span>
                    </div>
                  </motion.div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              <div className="conv-input">
                <input type="text" placeholder="Type a message..." value={newMsg} onChange={e => setNewMsg(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()} />
                <button onClick={handleSend} disabled={sending || !newMsg.trim()}>
                  {sending ? <Loader2 className="spin" size={18} /> : <Send size={18} />}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
      {error && <div className="dash-error"><span>{error}</span><button onClick={() => setError('')}><X size={14} /></button></div>}
    </div>
  );
}
