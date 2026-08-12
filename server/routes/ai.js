import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import db from '../db/index.js';
import { requireAuth } from '../middleware/auth.js';
import { processConversationForLead } from '../services/leadEngine.js';
import { extractLeadFields, evaluateQualification, nextQualificationQuestion } from '../utils/leadQualification.js';

const router = Router();
router.use(requireAuth);

router.post('/chat', async (req, res) => {
  try {
    const { message, conversation_id, channel } = req.body;
    if (!message) return res.status(400).json({ error: 'Message is required' });

    const business = db.prepare('SELECT * FROM businesses WHERE user_id = ?').get(req.userId);

    let convId = conversation_id;
    if (!convId) {
      convId = uuid();
      db.prepare(`
        INSERT INTO conversations (id, user_id, customer_name, channel, last_message_at)
        VALUES (?, ?, 'AI Test Customer', ?, datetime('now'))
      `).run(convId, req.userId, channel || 'web');
    }

    const customerMsgId = uuid();
    db.prepare('INSERT INTO messages (id, conversation_id, sender, content) VALUES (?, ?, ?, ?)')
      .run(customerMsgId, convId, 'customer', message);

    const messages = db.prepare(
      'SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at ASC'
    ).all(convId);

    const extracted = extractLeadFields(messages);
    const qualification = evaluateQualification({ messages, extracted });

    const aiResponse = generateDemoAIResponse(message, business, { extracted, qualification });

    const aiMsgId = uuid();
    db.prepare('INSERT INTO messages (id, conversation_id, sender, content, intent, entities) VALUES (?, ?, ?, ?, ?, ?)')
      .run(aiMsgId, convId, 'ai', aiResponse.content, aiResponse.intent, JSON.stringify(aiResponse.entities));

    db.prepare("UPDATE conversations SET last_message_at = datetime('now') WHERE id = ?").run(convId);

    if (extracted.name) {
      db.prepare('UPDATE conversations SET customer_name = COALESCE(NULLIF(customer_name, \'AI Test Customer\'), ?) WHERE id = ?')
        .run(extracted.name, convId);
    }
    if (extracted.phone) {
      db.prepare('UPDATE conversations SET customer_phone = COALESCE(customer_phone, ?) WHERE id = ?')
        .run(extracted.phone, convId);
    }
    if (extracted.email) {
      db.prepare('UPDATE conversations SET customer_email = COALESCE(customer_email, ?) WHERE id = ?')
        .run(extracted.email, convId);
    }

    const source = channel === 'whatsapp' ? 'WhatsApp' : channel === 'telegram' ? 'Telegram' : 'AI Chat';
    const leadResult = await processConversationForLead({
      userId: req.userId,
      conversationId: convId,
      source,
    });

    res.json({
      response: aiResponse.content,
      conversation_id: convId,
      intent: aiResponse.intent,
      entities: aiResponse.entities,
      demo_mode: !process.env.OPENAI_API_KEY,
      lead: leadResult.lead
        ? {
          id: leadResult.lead.id,
          lead_code: leadResult.lead.lead_code,
          unique_lead_key: leadResult.lead.unique_lead_key,
          action: leadResult.action,
          google_sheets_sync_status: leadResult.lead.google_sheets_sync_status,
          status: leadResult.lead.status,
        }
        : null,
      qualification: {
        qualified: leadResult.action === 'created' || leadResult.action === 'updated',
        action: leadResult.action,
        reason: leadResult.reason,
        missing: leadResult.missing || [],
      },
    });
  } catch (err) {
    console.error('AI chat error:', err);
    res.status(500).json({ error: 'AI service error' });
  }
});

function generateDemoAIResponse(message, business, { extracted, qualification } = {}) {
  const lower = message.toLowerCase();
  const bizName = business?.name || 'our company';
  const bizDesc = business?.description || 'AI-powered business solutions';

  let intent = 'general';
  let entities = {};
  let content = '';

  if (lower.match(/price|cost|how much|pricing|plan/)) {
    intent = 'pricing';
    content = `Thank you for your interest in pricing. ${bizName} offers flexible plans for WhatsApp AI Bot, Telegram AI Bot, and CRM Automation. I can share a tailored quote once I know a bit more about your requirement.`;
  } else if (lower.match(/service|what do you|offer|provide/)) {
    intent = 'services';
    content = `At ${bizName}, we provide ${bizDesc}. Our key services include WhatsApp AI Bot, Telegram AI Bot, CRM Automation, and sales workflows. Which service are you looking for?`;
  } else if (lower.match(/support|issue|problem|error/)) {
    intent = 'support';
    content = `I'd be happy to help. Could you describe the issue? If this is a new project, tell me which service you need and I can take your details.`;
  } else if (lower.match(/hello|hi|hey|good (morning|afternoon|evening)/) && message.trim().length < 24) {
    intent = 'greeting';
    content = `Hello! Welcome to ${bizName}. I can help with WhatsApp AI Bot, Telegram AI Bot, CRM Automation, and related sales systems. What are you looking to set up?`;
  } else if (lower.match(/hours|open|working hours|available|when/)) {
    intent = 'hours';
    const hours = business?.working_hours || 'Monday to Friday, 9 AM to 6 PM IST';
    content = `Our working hours are ${hours}. I am available 24/7 to collect your requirement.`;
  } else if (lower.match(/contact|reach|email|phone|call/)) {
    intent = 'contact';
    content = `I can have our team reach out. Share your name, phone number, and the service you need.`;
  } else if (lower.match(/whatsapp/)) {
    intent = 'whatsapp_interest';
    entities.service = 'WhatsApp AI Bot';
    content = `Our WhatsApp AI Bot can handle customer conversations, qualify buyers, and sync real leads into your CRM. Are you looking to automate sales, support, or both?`;
  } else if (lower.match(/telegram/)) {
    intent = 'telegram_interest';
    entities.service = 'Telegram AI Bot';
    content = `Our Telegram AI Bot connects to your sales workflow for support, qualification, and CRM updates. What would you like it to handle?`;
  } else if (lower.match(/crm|pipeline/)) {
    intent = 'crm_interest';
    entities.service = 'CRM Automation';
    content = `CRM Automation captures qualified inquiries, prevents duplicate leads, and keeps Google Sheets in sync. What process are you trying to automate?`;
  } else if (lower.match(/thank|thanks/)) {
    intent = 'thanks';
    content = `You're welcome. If you want us to proceed, share any remaining details and I'll record the inquiry.`;
  } else if (lower.match(/bye|goodbye|see you/)) {
    intent = 'goodbye';
    content = `Thank you for chatting with us. Reach out anytime you are ready to move forward.`;
  } else {
    content = `Thank you — I can help with ${bizName}'s services. Tell me what you need and I'll collect the details our team requires.`;
  }

  if (extracted?.service) entities.service = extracted.service;
  if (extracted?.name) entities.name = extracted.name;
  if (extracted?.phone) entities.phone = extracted.phone;
  if (extracted?.email) entities.email = extracted.email;
  if (extracted?.budget) entities.budget = extracted.budget;

  if (qualification && !qualification.qualified && qualification.missing?.length) {
    const followUp = nextQualificationQuestion(qualification.missing);
    if (followUp && intent !== 'greeting' && intent !== 'thanks' && intent !== 'goodbye') {
      content = `${content} ${followUp}`;
    }
  } else if (qualification?.qualified && extracted?.name) {
    content = `Thanks ${extracted.name}. I've recorded your inquiry${extracted.service ? ` for ${extracted.service}` : ''}. Our team will follow up shortly. Is there anything else we should know about the requirement?`;
    intent = 'lead_captured';
  }

  return { content, intent, entities };
}

export default router;
