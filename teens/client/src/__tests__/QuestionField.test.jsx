import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { isAnswered, QuestionField } from '../components/QuestionField';

describe('QuestionField', () => {
  it('toggles multi-select options', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const q = {
      id: 'redFlags',
      kind: 'multi',
      prompt: 'Any of these?',
      options: [
        { value: 'fever', label: 'Fever' },
        { value: 'fainting', label: 'Fainting' },
      ],
    };
    render(<QuestionField question={q} value={['fever']} onChange={onChange} />);
    expect(screen.getByRole('checkbox', { name: 'Fever' })).toHaveAttribute('aria-checked', 'true');
    await user.click(screen.getByRole('checkbox', { name: 'Fainting' }));
    expect(onChange).toHaveBeenCalledWith(['fever', 'fainting']);
  });

  it('validates answers per question kind', () => {
    expect(isAnswered({ kind: 'multi' }, undefined)).toBe(true);
    expect(isAnswered({ kind: 'number', min: 10, max: 19 }, 25)).toBe(false);
    expect(isAnswered({ kind: 'number', min: 10, max: 19 }, 14)).toBe(true);
    expect(isAnswered({ kind: 'single' }, null)).toBe(false);
  });
});
