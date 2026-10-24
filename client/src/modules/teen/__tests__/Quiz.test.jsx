import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Quiz } from '../components/Quiz';

const questions = [
  { index: 0, prompt: 'Day 1 is?', options: ['Ovulation', 'First day of period'] },
  { index: 1, prompt: 'Typical teen cycle?', options: ['7 days', '21–45 days'] },
];

const passed = {
  score: 100,
  correctCount: 2,
  total: 2,
  passed: true,
  saved: true,
  xpGained: 50,
  newAchievements: [{ code: 'first_steps', title: 'First Steps' }],
  results: [
    { index: 0, chosenIndex: 1, correctIndex: 1, correct: true, explanation: 'Cycles start on bleeding day 1.' },
    { index: 1, chosenIndex: 1, correctIndex: 1, correct: true, explanation: '21–45 is typical.' },
  ],
};

describe('Quiz', () => {
  it('only allows submitting once every question is answered', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(passed);
    render(<Quiz questions={questions} onSubmit={onSubmit} />);

    expect(screen.getByRole('button', { name: /answer all 2 questions/i })).toBeDisabled();

    await user.click(screen.getByLabelText('First day of period'));
    await user.click(screen.getByLabelText('21–45 days'));
    await user.click(screen.getByRole('button', { name: /check my answers/i }));

    expect(onSubmit).toHaveBeenCalledWith([1, 1]);
    expect(await screen.findByText('100%')).toBeInTheDocument();
    expect(screen.getByText(/\+50 XP/)).toBeInTheDocument();
    expect(screen.getByText(/Badge unlocked: First Steps/)).toBeInTheDocument();
    expect(screen.getByText('Cycles start on bleeding day 1.')).toBeInTheDocument();
  });

  it('shows explanations for wrong answers and supports retrying', async () => {
    const user = userEvent.setup();
    const failed = {
      ...passed,
      score: 50,
      correctCount: 1,
      passed: false,
      xpGained: 0,
      newAchievements: [],
      results: [{ ...passed.results[0], chosenIndex: 0, correct: false }, passed.results[1]],
    };
    render(<Quiz questions={questions} onSubmit={vi.fn().mockResolvedValue(failed)} />);
    await user.click(screen.getByLabelText('Ovulation'));
    await user.click(screen.getByLabelText('21–45 days'));
    await user.click(screen.getByRole('button', { name: /check my answers/i }));

    expect(await screen.findByText(/score 70% or more/i)).toBeInTheDocument();
    expect(screen.getByText('Not quite.')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /try again/i }));
    expect(screen.getByRole('button', { name: /answer all 2 questions/i })).toBeDisabled();
  });

  it('shows API errors', async () => {
    const user = userEvent.setup();
    render(<Quiz questions={questions.slice(0, 1)} onSubmit={vi.fn().mockRejectedValue(new Error('Server unavailable'))} />);
    await user.click(screen.getByLabelText('Ovulation'));
    await user.click(screen.getByRole('button', { name: /check my answers/i }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Server unavailable');
  });
});
