import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { SessionProvider } from '../context/SessionContext';
import Landing from '../pages/Landing';

afterEach(() => vi.unstubAllGlobals());

describe('Landing', () => {
  it('shows the main call to action and the four goals', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 401, json: async () => ({ error: 'No session' }) }));
    render(
      <MemoryRouter>
        <SessionProvider>
          <Landing />
        </SessionProvider>
      </MemoryRouter>,
    );
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/know your body/i);
    expect(await screen.findByRole('link', { name: 'Get started' })).toHaveAttribute('href', '/onboarding');
    for (const goal of ['Closing diagnosis gaps', 'Symptom tracking', 'Health awareness', 'Meaningful clinical insights']) {
      expect(screen.getByText(goal)).toBeInTheDocument();
    }
  });
});
