import { beforeEach, describe, expect, it, vi } from 'vitest';
import request from 'supertest';
import { app, newUser, useTestDatabase } from './helpers.js';
import { generateChatReply } from '../chatbot/gemini.js';

vi.mock('../chatbot/gemini.js', () => ({
  generateChatReply: vi.fn(),
}));

useTestDatabase();

const routineReply = {
  answer:
    'A cycle that varies by a few days is common. Keep tracking the dates and mention the pattern at your next visit.',
  reasoning: [
    'You described cycle lengths between 27 and 33 days.',
    'A small amount of variation is common for many people.',
  ],
  urgency: 'routine',
  followUps: ['What counts as an irregular cycle?', 'Which symptoms should I track?'],
};

describe('chatbot API', () => {
  beforeEach(() => {
    vi.mocked(generateChatReply).mockReset();
  });

  it('requires sign-in', async () => {
    await request(app).get('/api/chat').expect(401);
  });

  it('returns the adult guide and an empty thread for a new account', async () => {
    const client = await newUser();
    const { body } = await client.get('/api/chat').expect(200);

    expect(body.module).toBe('adult');
    expect(body.guide.guideName).toBe('Ava');
    expect(body.guide.disclaimer).toMatch(/not a diagnosis/i);
    expect(body.messages).toEqual([]);
  });

  it('sends context to Gemini and stores both sides of the conversation', async () => {
    const client = await newUser();
    vi.mocked(generateChatReply).mockResolvedValue(routineReply);

    const { body } = await client
      .post('/api/chat/messages')
      .send({ message: 'My cycles vary from 27 to 33 days. Is that a problem?' })
      .expect(201);

    expect(body.message.role).toBe('assistant');
    expect(body.message.content).toMatch(/Keep tracking/i);
    expect(body.message.reasoning).toHaveLength(2);
    expect(body.message.followUps).toHaveLength(2);
    expect(generateChatReply).toHaveBeenCalledTimes(1);

    const call = vi.mocked(generateChatReply).mock.calls[0][0];
    expect(call.systemPrompt).toContain('You are Ava');
    expect(call.systemPrompt).toContain('PROFILE');
    expect(call.messages.at(-1)).toEqual({
      role: 'user',
      content: 'My cycles vary from 27 to 33 days. Is that a problem?',
    });

    const history = await client.get('/api/chat').expect(200);
    expect(history.body.messages).toHaveLength(2);
    expect(history.body.messages[0].role).toBe('user');
  });

  it('rejects empty messages', async () => {
    const client = await newUser();
    const { body } = await client
      .post('/api/chat/messages')
      .send({ message: '   ' })
      .expect(422);

    expect(body.message).toMatch(/type a question/i);
    expect(generateChatReply).not.toHaveBeenCalled();
  });

  it('short-circuits a crisis message without calling Gemini', async () => {
    const client = await newUser();

    const { body } = await client
      .post('/api/chat/messages')
      .send({ message: 'I want to kill myself' })
      .expect(201);

    expect(body.message.urgency).toBe('crisis');
    expect(body.message.content).toMatch(/emergency|crisis line/i);
    expect(body.safety.level).toBe('crisis');
    expect(generateChatReply).not.toHaveBeenCalled();
  });

  it('uses the teen guide after the account switches life stage', async () => {
    const client = await newUser();
    await client.patch('/api/auth/profile').send({ lifeStage: 'teen' }).expect(200);

    const { body } = await client.get('/api/chat').expect(200);
    expect(body.module).toBe('teen');
    expect(body.guide.guideName).toBe('Bloom');
    expect(body.guide.disclaimer).toMatch(/trusted adult/i);
  });

  it('clears only the current module history', async () => {
    const client = await newUser();
    vi.mocked(generateChatReply).mockResolvedValue(routineReply);

    await client
      .post('/api/chat/messages')
      .send({ message: 'Tell me about PMS.' })
      .expect(201);

    await client.delete('/api/chat').expect(200);

    const { body } = await client.get('/api/chat').expect(200);
    expect(body.messages).toEqual([]);
  });

  it('exports chat history and clears it with all health logs', async () => {
    const client = await newUser();
    vi.mocked(generateChatReply).mockResolvedValue(routineReply);

    await client
      .post('/api/chat/messages')
      .send({ message: 'Tell me about PMS.' })
      .expect(201);

    const exported = await client.get('/api/user/export').expect(200);
    const archive = JSON.parse(exported.text);
    expect(archive.exportVersion).toBe('1.2');
    expect(archive.chats).toHaveLength(1);
    expect(archive.chats[0].messages).toHaveLength(2);
    expect(JSON.stringify(archive.chats)).not.toContain('password');

    const cleared = await client
      .delete('/api/user/data')
      .send({ scope: 'all', password: client.password, confirmation: 'DELETE' })
      .expect(200);
    expect(cleared.body.deleted.chats).toBe(1);

    const history = await client.get('/api/chat').expect(200);
    expect(history.body.messages).toEqual([]);
  });
});
