import { describe, expect, it } from 'vitest';
import { applyAttempt, QuizSubmissionError, scoreQuiz } from '../teen/services/quiz.js';

const quiz = [
  { options: ['a', 'b'], correctIndex: 0, explanation: 'e1' },
  { options: ['a', 'b', 'c'], correctIndex: 2, explanation: 'e2' },
  { options: ['a', 'b'], correctIndex: 1, explanation: 'e3' },
  { options: ['a', 'b'], correctIndex: 1, explanation: 'e4' },
];

const module = { _id: 'm1', slug: 'basics', xpReward: 50 };
const freshProgress = () => ({ completedModules: [], xp: 0, achievements: [] });

describe('scoreQuiz', () => {
  it('scores all-correct answers as 100', () => {
    const out = scoreQuiz(quiz, [0, 2, 1, 1]);
    expect(out).toMatchObject({ score: 100, correctCount: 4, total: 4, passed: true });
    expect(out.results.every((r) => r.correct)).toBe(true);
  });

  it('rounds partial scores and applies the 70% pass mark', () => {
    expect(scoreQuiz(quiz, [0, 2, 1, 0])).toMatchObject({ score: 75, passed: true });
    expect(scoreQuiz(quiz, [0, 2, 0, 0])).toMatchObject({ score: 50, passed: false });
  });

  it('returns per-question feedback with explanations', () => {
    const { results } = scoreQuiz(quiz, [1, 2, 1, 1]);
    expect(results[0]).toEqual({ index: 0, chosenIndex: 1, correctIndex: 0, correct: false, explanation: 'e1' });
  });

  it.each([
    [[0, 2, 1]],
    [[0, 2, 1, 1, 0]],
    [[0, 3, 1, 1]],
    [[0, -1, 1, 1]],
    [[0, '2', 1, 1]],
    ['0,2,1,1'],
    [undefined],
  ])('rejects invalid answers %j', (answers) => {
    expect(() => scoreQuiz(quiz, answers)).toThrow(QuizSubmissionError);
  });
});

describe('applyAttempt', () => {
  it('awards XP and first achievements on a passing first attempt', () => {
    const progress = freshProgress();
    const out = applyAttempt(progress, module, { score: 100, passed: true }, 6);
    expect(out.xpGained).toBe(50);
    expect(out.newAchievements).toEqual(['first_steps', 'perfect_score']);
    expect(progress.completedModules).toHaveLength(1);
  });

  it('does not complete a module on a failing attempt', () => {
    const progress = freshProgress();
    const out = applyAttempt(progress, module, { score: 50, passed: false }, 6);
    expect(out).toEqual({ xpGained: 0, newAchievements: [] });
    expect(progress.completedModules).toHaveLength(0);
  });

  it('only awards XP for improvement on retakes', () => {
    const progress = freshProgress();
    applyAttempt(progress, module, { score: 75, passed: true }, 6);
    expect(progress.xp).toBe(38);
    expect(applyAttempt(progress, module, { score: 75, passed: true }, 6).xpGained).toBe(0);
    expect(applyAttempt(progress, module, { score: 100, passed: true }, 6).xpGained).toBe(12);
    expect(progress.xp).toBe(50);
    expect(progress.completedModules[0]).toMatchObject({ attempts: 3, bestScore: 100, lastScore: 100 });
  });

  it('awards the champion badge when every module is complete', () => {
    const progress = freshProgress();
    for (const slug of ['a', 'b', 'c']) {
      applyAttempt(progress, { ...module, slug }, { score: 80, passed: true }, 3);
    }
    expect(progress.achievements.map((a) => a.code)).toEqual(['first_steps', 'knowledge_seeker', 'femaware_champion']);
  });
});
