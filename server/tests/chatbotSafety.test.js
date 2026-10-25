import { describe, expect, it } from 'vitest';
import { buildSystemPrompt } from '../chatbot/prompts.js';
import { buildSafetyReply, maxUrgency, screenMessage } from '../chatbot/safety.js';
import { publicChatGuide, resolveChatModule } from '../chatbot/modules.js';

describe('chat safety screening', () => {
  it('does not flag an ordinary late period', () => {
    const screen = screenMessage('My period is five days late and I am a bit worried.');
    expect(screen.level).toBe('none');
  });

  it('flags chest pain as an emergency', () => {
    const screen = screenMessage('I have chest pain and I feel faint.');
    expect(screen.level).toBe('emergency');
    expect(screen.categories).toContain('medical-emergency');
  });

  it('flags suicidal thoughts as a crisis', () => {
    const screen = screenMessage('I keep thinking I want to kill myself.');
    expect(screen.level).toBe('crisis');
    expect(screen.instruction).toMatch(/crisis line|emergency services/i);
  });

  it('flags bleeding after menopause as urgent', () => {
    const screen = screenMessage('I noticed some bleeding after menopause last week.');
    expect(screen.level).toBe('urgent');
    expect(screen.categories).toContain('postmenopausal-bleeding');
  });

  it('takes the highest urgency when several rules match', () => {
    const screen = screenMessage('He hits me and I have chest pain right now.');
    expect(screen.level).toBe('emergency');
    expect(screen.categories).toEqual(
      expect.arrayContaining(['medical-emergency', 'abuse-or-safety'])
    );
  });

  it('keeps the more urgent of two levels', () => {
    expect(maxUrgency('routine', 'urgent')).toBe('urgent');
    expect(maxUrgency('emergency', 'crisis')).toBe('crisis');
    expect(maxUrgency('soon', 'routine')).toBe('soon');
  });
});

describe('fixed safety replies', () => {
  it('gives a teen a trusted-adult instruction in an emergency', () => {
    const reply = buildSafetyReply({
      module: 'teen',
      screen: screenMessage('I have chest pain'),
    });

    expect(reply.urgency).toBe('emergency');
    expect(reply.content).toMatch(/emergency/i);
    expect(reply.content).toMatch(/trusted adult/i);
    expect(reply.reasoning.length).toBeGreaterThan(0);
  });

  it('never gives methods or graphic detail in a crisis reply', () => {
    const reply = buildSafetyReply({
      module: 'adult',
      screen: screenMessage('I want to end my life'),
    });

    expect(reply.content).not.toMatch(/how to|method|dose/i);
    expect(reply.content).toMatch(/crisis line/i);
  });
});

describe('prompt engineering guardrails', () => {
  it('includes the module voice, private reasoning and non-diagnostic rules', () => {
    const prompt = buildSystemPrompt({
      module: 'teen',
      context: 'PROFILE\n- First name: Riya\n- Age: 15',
      safetyInstruction: 'Be gentle.',
      safetyLevel: 'soon',
    });

    expect(prompt).toContain('You are Bloom');
    expect(prompt).toContain('teenagers');
    expect(prompt).toContain('not a doctor');
    expect(prompt).toContain('private');
    expect(prompt).toContain('trusted adult');
    expect(prompt).toContain('Never diagnose');
    expect(prompt).toContain('Return JSON');
    expect(prompt).toContain('Be gentle.');
  });

  it('keeps adult and senior safety rules separate', () => {
    const adult = buildSystemPrompt({ module: 'adult', context: 'PROFILE' });
    const senior = buildSystemPrompt({ module: 'senior', context: 'PROFILE' });

    expect(adult).toContain('ectopic pregnancy');
    expect(adult).not.toContain('bleeding after menopause is a red flag');
    expect(senior).toContain('Any vaginal bleeding after menopause is a red flag');
    expect(senior).toContain('prescriber or a pharmacist');
  });
});

describe('module resolution', () => {
  it('maps every stored life stage to one of the three guides', () => {
    expect(resolveChatModule('teen')).toBe('teen');
    expect(resolveChatModule('adolescent')).toBe('teen');
    expect(resolveChatModule('adult')).toBe('adult');
    expect(resolveChatModule('perimenopause')).toBe('adult');
    expect(resolveChatModule('senior')).toBe('senior');
    expect(resolveChatModule(undefined)).toBe('adult');
  });
  it('does not expose prompts or safety rules to the client', () => {
    const guide = publicChatGuide('senior');
    expect(guide.guideName).toBe('Mira');
    expect(guide).not.toHaveProperty('scope');
    expect(guide).not.toHaveProperty('safetyRules');
  });
});
