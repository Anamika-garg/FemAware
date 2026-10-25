import {
  GoogleGenAI,
  HarmBlockThreshold,
  HarmCategory,
  Type,
} from '@google/genai';
import { ApiError } from '../middleware/error.js';

const DEFAULT_MODEL = 'gemini-2.5-flash';
const DEFAULT_THINKING_BUDGET = 1024;
const MAX_ANSWER_CHARS = 8000;

let client;

const getClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new ApiError(
      503,
      'The chat guide is not configured yet. Add GEMINI_API_KEY to server/.env and restart the API.'
    );
  }
  if (!client) {
    client = new GoogleGenAI({ apiKey });
  }
  return client;
};

const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    answer: {
      type: Type.STRING,
      description:
        'The visible answer in markdown. Warm, plain language, no code fences, under the guide’s word limit.',
    },
    reasoning: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description:
        'Two or three short, user-facing bullets summarising what was considered. Not raw chain of thought.',
    },
    urgency: {
      type: Type.STRING,
      format: 'enum',
      enum: ['routine', 'soon', 'urgent', 'emergency', 'crisis'],
      description: 'How quickly the person should seek care.',
    },
    followUps: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'Two or three short questions the person might ask next.',
    },
  },
  required: ['answer', 'reasoning', 'urgency', 'followUps'],
  propertyOrdering: ['answer', 'reasoning', 'urgency', 'followUps'],
};

const SAFETY_SETTINGS = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    // Intimate health questions are legitimate. Only block clearly explicit
    // content, not respectful clinical language.
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
  },
];

const supportsThinking = (model) => /^gemini-(2\.5|3)/i.test(model);

const thinkingBudget = () => {
  const value = Number(process.env.GEMINI_THINKING_BUDGET);
  if (Number.isFinite(value) && value >= 0) return value;
  return DEFAULT_THINKING_BUDGET;
};

const text = (value, max) => String(value ?? '').trim().slice(0, max);

const normalizeReply = (data) => {
  const answer = text(data?.answer, MAX_ANSWER_CHARS);
  if (!answer) {
    throw new ApiError(502, 'The guide returned an empty answer. Please try again.');
  }

  const urgencyValues = ['routine', 'soon', 'urgent', 'emergency', 'crisis'];
  const reasoning = Array.isArray(data?.reasoning)
    ? data.reasoning.map((item) => text(item, 240)).filter(Boolean).slice(0, 3)
    : [];
  const followUps = Array.isArray(data?.followUps)
    ? data.followUps.map((item) => text(item, 120)).filter(Boolean).slice(0, 3)
    : [];

  return {
    answer,
    reasoning,
    urgency: urgencyValues.includes(data?.urgency) ? data.urgency : 'routine',
    followUps,
  };
};

const parseReply = (raw) => {
  if (!raw) {
    throw new ApiError(502, 'The guide returned an empty answer. Please try again.');
  }

  try {
    return normalizeReply(JSON.parse(raw));
  } catch (error) {
    if (error instanceof ApiError) throw error;
  }

  // Structured output is requested, but a malformed response should not lose a
  // safe answer. Strip an accidental code fence and try once more.
  const cleaned = raw
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

  try {
    return normalizeReply(JSON.parse(cleaned));
  } catch {
    return {
      answer: text(raw, MAX_ANSWER_CHARS),
      reasoning: [],
      urgency: 'routine',
      followUps: [],
    };
  }
};

const toApiError = (error) => {
  if (error instanceof ApiError) return error;

  const status = error?.status ?? error?.code ?? error?.response?.status;
  const message = String(error?.message || '');

  // Keep the server log useful without putting provider details in the UI.
  console.error('Gemini chat error:', {
    name: error?.name,
    status,
    message: message.slice(0, 500),
  });

  if (status === 429) {
    return new ApiError(
      429,
      'The guide is receiving a lot of questions right now. Please try again in a minute.'
    );
  }
  if (status === 401 || status === 403) {
    return new ApiError(
      503,
      'The chat guide is not configured correctly. Please check the Gemini API key.'
    );
  }
  if (status === 400) {
    return new ApiError(502, 'The guide could not understand that request. Try rephrasing it.');
  }
  if (/timeout|timed out|abort|ETIMEDOUT/i.test(message)) {
    return new ApiError(504, 'The guide took too long to answer. Please try again.');
  }
  return new ApiError(502, 'The guide could not answer right now. Please try again.');
};

/**
 * Send a short conversation to Gemini and return a validated, structured reply.
 * `messages` includes the current user message and is already limited by the
 * controller. Consecutive same-role turns are merged so the transcript is valid
 * even after a failed request is retried.
 */
export const generateChatReply = async ({ systemPrompt, messages }) => {
  const model = process.env.GEMINI_MODEL || DEFAULT_MODEL;
  const contents = [];

  for (const message of messages) {
    const content = text(message?.content, 4000);
    if (!content) continue;
    const role = message.role === 'assistant' ? 'model' : 'user';
    const previous = contents[contents.length - 1];
    if (previous && previous.role === role) {
      previous.parts[0].text += `\n\n${content}`;
    } else {
      contents.push({ role, parts: [{ text: content }] });
    }
  }

  if (!contents.length) {
    throw new ApiError(422, 'Type a question first.');
  }

  const config = {
    systemInstruction: systemPrompt,
    temperature: 0.5,
    topP: 0.9,
    maxOutputTokens: 2048,
    responseMimeType: 'application/json',
    responseSchema: RESPONSE_SCHEMA,
    safetySettings: SAFETY_SETTINGS,
    httpOptions: { timeout: 45_000 },
  };

  if (supportsThinking(model)) {
    config.thinkingConfig = {
      // Hidden thinking gives the model room to weigh context and red flags.
      // The visible `reasoning` summary is generated separately by the prompt.
      thinkingBudget: thinkingBudget(),
      includeThoughts: false,
    };
  }

  try {
    const response = await getClient().models.generateContent({
      model,
      contents,
      config,
    });

    const finishReason = response?.candidates?.[0]?.finishReason;
    if (finishReason === 'SAFETY' || finishReason === 'RECITATION') {
      throw new ApiError(
        422,
        'I cannot answer that one safely. Try asking in a different way, or speak with a clinician.'
      );
    }

    return parseReply(response?.text);
  } catch (error) {
    throw toApiError(error);
  }
};

export { RESPONSE_SCHEMA };
