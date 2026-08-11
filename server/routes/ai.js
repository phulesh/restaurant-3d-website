import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import db from '../db/index.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

// AI chat endpoint (demo mode unless OPENAI_API_KEY is configured)
router.post('/chat', (req, res) => {
  try {
    const { message, conversation_id } = req.body;
    if (!message) return res.status(400).json({ error: 'Message is required' });

    const business = db.prepare('SELECT * FROM businesses WHERE user_id = ?').get(req.userId);

    // Get or create conversation
    let convId = conversation_id;
    if (!convId) {
      convId = uuid();
      db.prepare(`
        INSERT INTO conversations (id, user_id, customer_name, channel, last_message_at)
        VALUES (?, ?, 'AI Test Customer', 'web', datetime('now'))
      `).run(convId, req.userId);
    }

    // Save customer message
    const customerMsgId = uuid();
    db.prepare('INSERT INTO messages (id, conversation_id, sender, content) VALUES (?, ?, ?, ?)').run(customerMsgId, convId, 'customer', message);

    // Generate AI response
    const aiResponse = generateDemoAIResponse(message, business);

    // Save AI message
    const aiMsgId = uuid();
    db.prepare('INSERT INTO messages (id, conversation_id, sender, content, intent, entities) VALUES (?, ?, ?, ?, ?, ?)').run(
      aiMsgId, convId, 'ai', aiResponse.content, aiResponse.intent, JSON.stringify(aiResponse.entities)
    );

    db.prepare('UPDATE conversations SET last_message_at = datetime(\'now\') WHERE id = ?').run(convId);

    // Check if we have enough info to create a lead
    const messages = db.prepare('SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at ASC').all(convId);
    const leadData = extractLeadFromConversation(messages);

    if (leadData && leadData.name && (leadData.phone || leadData.email)) {
      // Check for existing lead
      let existingLead = null;
      if (leadData.email) {
        existingLead = db.prepare('SELECT * FROM leads WHERE user_id = ? AND email = ?').get(req.userId, leadData.email);
      }
      if (!existingLead && leadData.phone) {
        existingLead = db.prepare('SELECT * FROM leads WHERE user_id = ? AND phone = ?').get(req.userId, leadData.phone);
      }

      if (existingLead) {
        // Update existing lead
        db.prepare('UPDATE leads SET service = COALESCE(?, service), budget = COALESCE(?, budget), updated_at = datetime(\'now\') WHERE id = ?').run(
          leadData.service, leadData.budget, existingLead.id
        );
        db.prepare('UPDATE conversations SET lead_id = ? WHERE id = ?').run(existingLead.id, convId);
      } else {
        // Create new lead
        const leadId = uuid();
        const score = calculateScore(leadData);
        db.prepare(`
          INSERT INTO leads (id, user_id, name, phone, email, service, budget, source, status, score)
          VALUES (?, ?, ?, ?, ?, ?, ?, 'Web AI', 'New Lead', ?)
        `).run(leadId, req.userId, leadData.name, leadData.phone || null, leadData.email || null, leadData.service || null, leadData.budget || null, score);
        db.prepare('UPDATE conversations SET lead_id = ? WHERE id = ?').run(leadId, convId);
      }
    }

    res.json({
      response: aiResponse.content,
      conversation_id: convId,
      intent: aiResponse.intent,
      entities: aiResponse.entities,
      demo_mode: !process.env.OPENAI_API_KEY
    });
  } catch (err) {
    console.error('AI chat error:', err);
    res.status(500).json({ error: 'AI service error' });
  }
});

function generateDemoAIResponse(message, business) {
  const lower = message.toLowerCase();
  const bizName = business?.name || 'our company';
  const bizDesc = business?.description || 'AI-powered business solutions';

  let intent = 'general';
  let entities = {};
  let content = '';

  // Intent detection
  if (lower.match(/price|cost|how much|pricing|plan/)) {
    intent = 'pricing';
    content = `Thank you for your interest in our pricing! ${bizName} offers flexible plans tailored to your needs. Our Starter plan is perfect for small businesses, Professional for growing teams, and Enterprise for advanced requirements. Would you like me to provide details for a specific plan?`;
  } else if (lower.match(/service|what do you|offer|provide|help/)) {
    intent = 'services';
    content = `At ${bizName}, we provide ${bizDesc}. Our key services include AI customer support, lead generation, sales automation, and CRM management. Which service interests you the most?`;
  } else if (lower.match(/support|help|issue|problem|error/)) {
    intent = 'support';
    content = `I'd be happy to help! Could you please describe the issue you're experiencing? Our team at ${bizName} is committed to resolving your concerns quickly. If needed, I can connect you with a human agent.`;
  } else if (lower.match(/hello|hi|hey|good (morning|afternoon|evening)/)) {
    intent = 'greeting';
    content = `Hello! Welcome to ${bizName}. I'm your AI assistant, here to help with any questions about our services, pricing, or support. How can I assist you today?`;
  } else if (lower.match(/hours|open|time|available|when/)) {
    intent = 'hours';
    const hours = business?.working_hours || 'Monday to Friday, 9 AM to 6 PM IST';
    content = `Our working hours are ${hours}. However, our AI assistant is available 24/7 to help you with basic queries. For urgent matters, please reach out during business hours.`;
  } else if (lower.match(/contact|reach|email|phone|call/)) {
    intent = 'contact';
    const contact = business?.contact_info ? JSON.parse(business.contact_info) : {};
    content = `You can reach us at ${contact.email || 'our contact email'} or ${contact.phone || 'our phone number'}. Would you like to schedule a call with our team?`;
  } else if (lower.match(/automat|workflow|ai|bot|chatbot/)) {
    intent = 'automation_interest';
    entities.service = 'AI Automation';
    content = `Great question! Our AI automation can handle customer conversations, qualify leads, and manage your entire sales pipeline automatically. It works with WhatsApp and Telegram. What kind of automation are you looking for?`;
  } else if (lower.match(/whatsapp/)) {
    intent = 'whatsapp_interest';
    entities.service = 'WhatsApp Automation';
    content = `Our WhatsApp integration lets your AI assistant handle customer conversations, capture leads, and trigger sales workflows directly through WhatsApp Business. Would you like to learn more about setup?`;
  } else if (lower.match(/telegram/)) {
    intent = 'telegram_interest';
    entities.service = 'Telegram Automation';
    content = `Our Telegram integration connects your bot to the AI sales system, allowing automatic customer support, lead qualification, and CRM updates. Would you like to know more?`;
  } else if (lower.match(/crm|lead|pipeline|sales/)) {
    intent = 'crm_interest';
    content = `Our built-in CRM automatically captures and organizes leads from all your channels. It includes lead scoring, pipeline management, and follow-up automation. Every conversation becomes structured, actionable data.`;
  } else if (lower.match(/thank|thanks/)) {
    intent = 'thanks';
    content = `You're welcome! If you have any other questions, feel free to ask. We're here to help you succeed!`;
  } else if (lower.match(/bye|goodbye|see you/)) {
    intent = 'goodbye';
    content = `Thank you for chatting with us! If you need any help in the future, don't hesitate to reach out. Have a great day!`;
  } else {
    content = `Thank you for your message. I'd be happy to help you with information about ${bizName}'s services, pricing, or any other questions. Could you tell me a bit more about what you're looking for?`;
  }

  return { content, intent, entities };
}

function extractLeadFromConversation(messages) {
  const allText = messages.map(m => m.content).join(' ');
  const leadData = {};

  // Extract name
  const nameMatch = allText.match(/(?:my name is|i'm|i am|this is|name:?)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i);
  if (nameMatch) leadData.name = nameMatch[1];

  // Extract phone
  const phoneMatch = allText.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}|\+?\d{10,12}/);
  if (phoneMatch) leadData.phone = phoneMatch[0];

  // Extract email
  const emailMatch = allText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  if (emailMatch) leadData.email = emailMatch[0];

  // Extract budget
  const budgetMatch = allText.match(/(?:budget|price|cost|spend|invest|₹|rs\.?|inr)\s*(?:is|of|around|about|:)?\s*(₹?\s*[\d,]+(?:\s*(?:k|lakh|l))?)/i);
  if (budgetMatch) leadData.budget = budgetMatch[1];

  // Extract service
  const serviceKeywords = ['ai automation', 'whatsapp bot', 'telegram bot', 'crm', 'chatbot', 'sales automation', 'lead generation'];
  for (const keyword of serviceKeywords) {
    if (allText.toLowerCase().includes(keyword)) {
      leadData.service = keyword.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      break;
    }
  }

  return Object.keys(leadData).length >= 1 ? leadData : null;
}

function calculateScore(leadData) {
  let score = 30;
  if (leadData.budget) score += 25;
  if (leadData.service) score += 20;
  if (leadData.phone) score += 10;
  if (leadData.email) score += 15;
  return Math.min(100, score);
}

export default router;
