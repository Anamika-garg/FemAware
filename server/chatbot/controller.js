import { ChatThread } from '../models/ChatThread.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { ApiError } from '../middleware/error.js';
import { buildHealthContext } from './context.js';
import { generateChatReply } from './gemini.js';
import { CHAT_MODULES, publicChatGuide, resolveChatModule } from './modules.js';
import { buildSystemPrompt } from './prompts.js';
import {
  buildSafetyReply,
  maxUrgency,
  safetyFooterFor,
  screenMessage,
} from './safety.js';

const MAX_MESSAGE_CHARS = 2000;
const MAX_STORED_MESSAGES = 60;
const HISTORY_WINDOW = 12;
const RETURNED_MESSAGES = 40;

const getOrCreateThread = (userId, module) =>
  ChatThread.findOneAndUpdate(
    { user: userId, module },
    { $setOnInsert: { user: userId, module, messages: [] } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

const trimThread = (thread) => {
  const overflow = thread.messages.length - MAX_STORED_MESSAGES;
  if (overflow > 0) thread.messages.splice(0, overflow);
};

const publicMessage = (message) => ({
  id: message._id,
  role: message.role,
  content: message.content,
  reasoning: message.reasoning || [],
  urgency: message.urgency || 'routine',
  followUps: message.followUps || [],
  safetyLevel: message.safetyLevel || 'none',
  createdAt: message.createdAt,
});

const withFooter = (content, level) => {
  const footer = safetyFooterFor(level);
  if (!footer || content.includes(footer)) return content;
  return `${content}\n\n> ${footer}`;
};

export const getChat = asyncHandler(async (req, res) => {
  const module = resolveChatModule(req.user.lifeStage);
  const thread = await getOrCreateThread(req.user._id, module);

  res.json({
    success: true,
    module,
    guide: publicChatGuide(module),
    messages: thread.messages.slice(-RETURNED_MESSAGES).map(publicMessage),
  });
});

export const postChatMessage = asyncHandler(async (req, res) => {
  const module = resolveChatModule(req.user.lifeStage);
  const raw = req.body?.message;

  if (typeof raw !== 'string' || !raw.trim()) {
    throw new ApiError(422, 'Type a question first.');
  }

  const content = raw.trim();
  if (content.length > MAX_MESSAGE_CHARS) {
    throw new ApiError(
      422,
      `Please keep your message under ${MAX_MESSAGE_CHARS} characters so the guide can focus on your question.`
    );
  }

  const thread = await getOrCreateThread(req.user._id, module);
  const screen = screenMessage(content);

  // Two levels are handled without waiting for a model: an emergency or a
  // crisis needs immediate, predictable language, not a slower generation.
  if (screen.level === 'emergency' || screen.level === 'crisis') {
    const safetyReply = buildSafetyReply({ module, screen });

    thread.messages.push({
      role: 'user',
      content,
      safetyLevel: screen.level,
      urgency: screen.level,
    });
    thread.messages.push({
      role: 'assistant',
      content: safetyReply.content,
      reasoning: safetyReply.reasoning,
      urgency: safetyReply.urgency,
      followUps: safetyReply.followUps,
      safetyLevel: screen.level,
    });
    trimThread(thread);
    thread.lastMessageAt = new Date();
    await thread.save();

    return res.status(201).json({
      success: true,
      module,
      message: publicMessage(thread.messages[thread.messages.length - 1]),
      safety: {
        level: screen.level,
        categories: screen.categories,
        notice: safetyReply.safetyNotice,
      },
    });
  }

  const context = await buildHealthContext(req.user, module);
  const systemPrompt = buildSystemPrompt({
    module,
    context,
    safetyInstruction: screen.instruction,
    safetyLevel: screen.level,
  });

  const history = [
    ...thread.messages
      .slice(-HISTORY_WINDOW)
      .map((message) => ({ role: message.role, content: message.content })),
    { role: 'user', content },
  ];

  const reply = await generateChatReply({ module, systemPrompt, messages: history });
  const urgency = maxUrgency(reply.urgency, screen.level);
  const followUps =
    reply.followUps?.length > 0
      ? reply.followUps
      : CHAT_MODULES[module].suggestions.slice(0, 3);

  thread.messages.push({
    role: 'user',
    content,
    safetyLevel: screen.level,
    urgency,
  });
  thread.messages.push({
    role: 'assistant',
    content: withFooter(reply.answer, urgency),
    reasoning: reply.reasoning,
    urgency,
    followUps,
    safetyLevel: screen.level,
  });
  trimThread(thread);
  thread.lastMessageAt = new Date();
  await thread.save();

  res.status(201).json({
    success: true,
    module,
    message: publicMessage(thread.messages[thread.messages.length - 1]),
    safety: {
      level: screen.level,
      categories: screen.categories,
      notice: safetyFooterFor(urgency),
    },
  });
});

export const deleteChat = asyncHandler(async (req, res) => {
  const module = resolveChatModule(req.user.lifeStage);
  await ChatThread.deleteOne({ user: req.user._id, module });

  res.json({
    success: true,
    message: 'Your chat history has been cleared.',
  });
});
