import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({ user: { lifeStage: 'senior' } }),
}));

import ChatLauncher from '../ChatLauncher';

const renderAt = (path) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <ChatLauncher />
    </MemoryRouter>
  );

describe('ChatLauncher', () => {
  it('links to the chat with the guide for the signed-in stage', () => {
    renderAt('/dashboard');

    const link = screen.getByRole('link', { name: /open a private chat with mira/i });
    expect(link).toHaveAttribute('href', '/chat');
    expect(screen.getByText('Ask Mira')).toBeInTheDocument();
  });

  it('is hidden on the chat page itself', () => {
    renderAt('/chat');

    expect(screen.queryByRole('link', { name: /open a private chat/i })).not.toBeInTheDocument();
  });
});
