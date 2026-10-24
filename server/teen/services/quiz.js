export const PASS_MARK = 70;

export const ACHIEVEMENTS = {
  first_steps: { title: 'First Steps', description: 'Completed your first lesson' },
  perfect_score: { title: 'Perfect Score', description: 'Scored 100% on a quiz' },
  knowledge_seeker: { title: 'Knowledge Seeker', description: 'Completed 3 lessons' },
  femaware_champion: { title: 'FemAware Champion', description: 'Completed every lesson' },
};

export class QuizSubmissionError extends Error {}

/**
 * Score a quiz server-side. `answers` is an array of chosen option indexes,
 * one per question. Returns per-question feedback including the explanation.
 */
export function scoreQuiz(quiz, answers) {
  if (!Array.isArray(answers) || answers.length !== quiz.length) {
    throw new QuizSubmissionError(`Expected ${quiz.length} answers`);
  }
  const results = quiz.map((question, i) => {
    const chosen = answers[i];
    if (!Number.isInteger(chosen) || chosen < 0 || chosen >= question.options.length) {
      throw new QuizSubmissionError(`Answer ${i + 1} is not a valid option`);
    }
    return {
      index: i,
      chosenIndex: chosen,
      correctIndex: question.correctIndex,
      correct: chosen === question.correctIndex,
      explanation: question.explanation,
    };
  });
  const correctCount = results.filter((r) => r.correct).length;
  const score = Math.round((correctCount / quiz.length) * 100);
  return { score, correctCount, total: quiz.length, passed: score >= PASS_MARK, results };
}

/**
 * Apply a scored attempt to a progress document (mutates it).
 * XP is only awarded for improvement, so retaking a quiz can't farm XP.
 * Returns the codes of newly earned achievements.
 */
export function applyAttempt(progress, module, { score, passed }, totalModules) {
  const existing = progress.completedModules.find((m) => m.slug === module.slug);
  const xpFor = (s) => Math.round((module.xpReward * s) / 100);
  let xpGained = 0;

  if (existing) {
    existing.attempts += 1;
    existing.lastScore = score;
    if (score > existing.bestScore) {
      xpGained = xpFor(score) - xpFor(existing.bestScore);
      existing.bestScore = score;
    }
  } else if (passed) {
    xpGained = xpFor(score);
    progress.completedModules.push({
      module: module._id,
      slug: module.slug,
      bestScore: score,
      lastScore: score,
      attempts: 1,
      completedAt: new Date(),
    });
  }
  progress.xp += xpGained;

  const earned = new Set(progress.achievements.map((a) => a.code));
  const completed = progress.completedModules.length;
  const newly = [];
  const award = (code, condition) => {
    if (condition && !earned.has(code)) {
      progress.achievements.push({ code });
      newly.push(code);
    }
  };
  award('first_steps', completed >= 1);
  award('perfect_score', score === 100 && progress.completedModules.some((m) => m.slug === module.slug));
  award('knowledge_seeker', completed >= 3);
  award('femaware_champion', totalModules > 0 && completed >= totalModules);

  return { xpGained, newAchievements: newly };
}
