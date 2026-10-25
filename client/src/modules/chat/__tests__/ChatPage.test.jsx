import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../../context/AuthContext', () => ({
  useAuth: () => ({ user: { lifeStage: 'adult', name: 'Sam' } }),
}));

vi.mock('../../../lib/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
  },
  getErrorMessage: (error) =>
    error?.response?.data?.message || error?.message || 'Something went wrong.',
}));

import api from '../../../lib/api';
import ChatPage from '../ChatPage';

const GUIDE = {
  id: 'adult',
  label: 'Adult women',
  guideName: 'Ava',
  tagline: 'Practical, evidence-informed answers about your cycle and health.',
  description: 'Ava helps you understand symptoms without diagnosing you.',
  suggestions: ['What could be causing my heavy periods?'],
  disclaimer: 'Ava gives health education, not a diagnosis.',
};

const assistantReply = (overrides = {}) => ({
  id: 'assistant-1',
  role: 'assistant',
  content: 'Heavier periods can have several causes.',
  reasoning: [
    'Considered how heavy the bleeding is.',
    'Checked whether any red flags were mentioned.',
  ],
  urgency: 'soon',
  followUps: ['What should I track before my appointment?'],
  createdAt: '2026-10-25T10:00:00.000Z',
  ...overrides,
});

const loadedThread = (messages = []) => ({
  data: { module: 'adult', guide: GUIDE, messages },
});

describe('ChatPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Element.prototype.scrollIntoView = vi.fn();
  });

  it('shows a loading state while the conversation is fetched', async () => {
    let resolveRequest;
    api.get.mockReturnValue(
      new Promise((resolve) => {
        resolveRequest = resolve;
      })
    );

    render(<ChatPage stageHint="adult" />);

    expect(screen.getByLabelText('Loading content')).toBeInTheDocument();

    resolveRequest(loadedThread());
    expect(await screen.findByRole('heading', { name: 'Chat with Ava' })).toBeInTheDocument();
  });

  it('loads the saved conversation, urgency and guide from the server', async () => {
    api.get.mockResolvedValue(loadedThread([assistantReply()]));

    render(<ChatPage stageHint="adult" />);

    expect(await screen.findByText('Heavier periods can have several causes.')).toBeInTheDocument();
    expect(screen.getByText('Worth mentioning at your next visit')).toBeInTheDocument();
    expect(api.get).toHaveBeenCalledWith('/chat');
  });

  it('sends a message and appends the reply', async () => {
    const user = userEvent.setup();
    api.get.mockResolvedValue(loadedThread());
    api.post.mockResolvedValue({
      data: { module: 'adult', message: assistantReply() },
    });

    render(<ChatPage stageHint="adult" />);

    const input = await screen.findByLabelText('Your message to Ava');
    await user.type(input, 'My periods are heavy');
    await user.click(screen.getByRole('button', { name: 'Send' }));

    expect(api.post).toHaveBeenCalledWith(
      '/chat/messages',
      { message: 'My periods are heavy' },
      { timeout: 60000 }
    );
    expect(await screen.findByText('Heavier periods can have several causes.')).toBeInTheDocument();
    expect(input).toHaveValue('');
  });

  it('restores the message and shows an error when sending fails', async () => {
    const user = userEvent.setup();
    api.get.mockResolvedValue(loadedThread());
    api.post.mockRejectedValue({
      response: { data: { message: 'The guide is busy right now.' } },
    });

    render(<ChatPage stageHint="adult" />);

    const input = await screen.findByLabelText('Your message to Ava');
    await user.type(input, 'Should I be worried?');
    await user.click(screen.getByRole('button', { name: 'Send' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('The guide is busy right now.');
    expect(input).toHaveValue('Should I be worried?');
  });

  it('reveals the reasoning summary on request', async () => {
    const user = userEvent.setup();
    api.get.mockResolvedValue(loadedThread([assistantReply()]));

    render(<ChatPage stageHint="adult" />);

    const toggle = await screen.findByRole('button', { name: /how i thought about this/i });
    expect(screen.queryByText('Considered how heavy the bleeding is.')).not.toBeInTheDocument();

    await user.click(toggle);

    expect(screen.getByText('Considered how heavy the bleeding is.')).toBeInTheDocument();
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
  });

  it('clears the conversation after confirmation', async () => {
    const user = userEvent.setup();
    api.get.mockResolvedValue(loadedThread([assistantReply()]));
    api.delete.mockResolvedValue({ data: { success: true } });

    render(<ChatPage stageHint="adult" />);

    await screen.findByText('Heavier periods can have several causes.');
    await user.click(screen.getByRole('button', { name: 'Clear chat' }));

    const dialog = await screen.findByRole('dialog');
    await user.click(within(dialog).getByRole('button', { name: 'Clear chat' }));

    expect(api.delete).toHaveBeenCalledWith('/chat');
    expect(await screen.findByText(GUIDE.tagline)).toBeInTheDocument();
  });
});
