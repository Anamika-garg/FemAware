import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Brain,
  ChevronDown,
  ChevronUp,
  MessageCircleHeart,
  Send,
  ShieldAlert,
  Sparkles,
  Trash2,
} from 'lucide-react';
import api, { getErrorMessage } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/ui/Button';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import PageHeader from '../../components/ui/PageHeader';
import { CardSkeleton, ErrorState } from '../../components/ui/States';
import { cn } from '../../lib/utils';
import RichText from './RichText';
import { getFallbackGuide, resolveChatStage } from './chatConfig';

const URGENCY_COPY = {
  soon: {
    label: 'Worth mentioning at your next visit',
    className: 'border-blush-pink bg-rose-mist text-deep-rose',
  },
  urgent: {
    label: 'Ask a clinician promptly',
    className: 'border-[#F0D49A] bg-[#FFF8E8] text-[#7A4B00]',
  },
  emergency: {
    label: 'Get urgent help now',
    className: 'border-[#E7B6C4] bg-[#FDF1F4] text-[#8E1242]',
  },
  crisis: {
    label: 'You deserve immediate support',
    className: 'border-[#E7B6C4] bg-[#FDF1F4] text-[#8E1242]',
  },
};

const TypingBubble = ({ guideName }) => (
  <div className="flex gap-3" aria-label={`${guideName} is typing`}>
    <span className="mt-1 grid h-9 w-9 shrink-0 place-items-center rounded-full bg-rose-mist text-deep-rose">
      <MessageCircleHeart className="h-4 w-4" aria-hidden="true" />
    </span>
    <div className="rounded-2xl rounded-tl-md border border-line bg-white px-4 py-3.5">
      <span className="flex items-center gap-1.5" aria-hidden="true">
        <span className="h-2 w-2 animate-bounce rounded-full bg-deep-rose/50 [animation-delay:-0.2s]" />
        <span className="h-2 w-2 animate-bounce rounded-full bg-deep-rose/50 [animation-delay:-0.1s]" />
        <span className="h-2 w-2 animate-bounce rounded-full bg-deep-rose/50" />
      </span>
      <span className="sr-only">{guideName} is thinking…</span>
    </div>
  </div>
);

const Message = ({ message, guide, isSenior, onFollowUp }) => {
  const [showReasoning, setShowReasoning] = useState(false);
  const isAssistant = message.role === 'assistant';
  const urgency = URGENCY_COPY[message.urgency];
  const reasoning = Array.isArray(message.reasoning) ? message.reasoning : [];
  const followUps = Array.isArray(message.followUps) ? message.followUps : [];

  if (!isAssistant) {
    return (
      <div className="flex justify-end">
        <div
          className={cn(
            'max-w-[88%] whitespace-pre-wrap rounded-2xl rounded-tr-md bg-deep-rose px-4 py-3 text-white shadow-sm',
            isSenior ? 'text-base leading-relaxed' : 'text-[15px] leading-relaxed'
          )}
        >
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <article className="flex gap-3">
      <span
        className={cn(
          'mt-1 grid shrink-0 place-items-center rounded-full bg-rose-mist text-deep-rose',
          isSenior ? 'h-11 w-11' : 'h-9 w-9'
        )}
        aria-hidden="true"
      >
        <MessageCircleHeart className={isSenior ? 'h-5 w-5' : 'h-4 w-4'} />
      </span>

      <div className="min-w-0 flex-1">
        <div
          className={cn(
            'rounded-2xl rounded-tl-md border border-line bg-white px-4 py-3.5 shadow-sm sm:px-5',
            isSenior && 'px-5 py-4'
          )}
        >
          <p className="text-xs font-semibold text-deep-rose">{guide.guideName}</p>
          <RichText
            text={message.content}
            className={cn(
              'mt-1.5 text-ink',
              isSenior ? 'text-base leading-relaxed' : 'text-[15px] leading-relaxed'
            )}
          />
        </div>

        {urgency ? (
          <p
            className={cn(
              'mt-2 inline-flex items-start gap-2 rounded-lg border px-3 py-2 text-xs font-semibold leading-relaxed',
              urgency.className
            )}
          >
            <ShieldAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            {urgency.label}
          </p>
        ) : null}

        {reasoning.length ? (
          <div className="mt-2">
            <button
              type="button"
              onClick={() => setShowReasoning((value) => !value)}
              aria-expanded={showReasoning}
              className={cn(
                'inline-flex min-h-[36px] items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-semibold text-muted transition-colors hover:bg-rose-mist hover:text-deep-rose',
                isSenior && 'min-h-[44px] text-sm'
              )}
            >
              <Brain className="h-3.5 w-3.5" aria-hidden="true" />
              How I thought about this
              {showReasoning ? (
                <ChevronUp className="h-3.5 w-3.5" aria-hidden="true" />
              ) : (
                <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
              )}
            </button>
            {showReasoning ? (
              <ul className="mt-1.5 space-y-1.5 rounded-xl bg-rose-mist/70 px-4 py-3 text-xs leading-relaxed text-muted">
                {reasoning.map((item, index) => (
                  <li key={`${message.id || 'message'}-reason-${index}`} className="flex gap-2">
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-deep-rose" aria-hidden="true" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        ) : null}

        {followUps.length ? (
          <div className="mt-2.5 flex flex-wrap gap-2">
            {followUps.map((question, index) => (
              <button
                key={`${message.id || 'message'}-follow-${index}`}
                type="button"
                onClick={() => onFollowUp(question)}
                className={cn(
                  'chip text-left',
                  isSenior && 'min-h-[48px] text-sm',
                  'text-xs sm:text-sm'
                )}
              >
                <Sparkles className="h-3.5 w-3.5 shrink-0 text-deep-rose" aria-hidden="true" />
                {question}
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </article>
  );
};

const ChatPage = ({ stageHint }) => {
  const { user } = useAuth();
  const hintedStage = stageHint || resolveChatStage(user?.lifeStage);
  const [activeStage, setActiveStage] = useState(hintedStage);
  const [guide, setGuide] = useState(() => getFallbackGuide(hintedStage));
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState('');
  const [confirmClear, setConfirmClear] = useState(false);
  const [clearing, setClearing] = useState(false);
  const endRef = useRef(null);
  const textareaRef = useRef(null);

  const isSenior = activeStage === 'senior';
  const isTeen = activeStage === 'teen';

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    try {
      const { data } = await api.get('/chat');
      const nextStage = data.module || hintedStage;
      setActiveStage(nextStage);
      setGuide(data.guide || getFallbackGuide(nextStage));
      setMessages(data.messages || []);
    } catch (error) {
      setLoadError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, [hintedStage]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, sending]);

  useEffect(() => {
    const element = textareaRef.current;
    if (!element) return;
    element.style.height = 'auto';
    element.style.height = `${Math.min(element.scrollHeight, 160)}px`;
  }, [input]);

  const send = async (textOverride) => {
    const text = String(textOverride ?? input).trim();
    if (!text || sending) return;

    setSendError('');
    setSending(true);
    const optimistic = {
      id: `temp-${Date.now()}`,
      role: 'user',
      content: text,
      createdAt: new Date().toISOString(),
    };
    setMessages((current) => [...current, optimistic]);
    setInput('');

    try {
      const { data } = await api.post(
        '/chat/messages',
        { message: text },
        { timeout: 60000 }
      );
      if (!data?.message) throw new Error('The guide did not send a reply. Please try again.');
      setActiveStage(data.module || activeStage);
      setMessages((current) => [...current, data.message]);
    } catch (error) {
      setMessages((current) => current.filter((message) => message.id !== optimistic.id));
      setInput(text);
      setSendError(getErrorMessage(error));
    } finally {
      setSending(false);
      requestAnimationFrame(() => textareaRef.current?.focus());
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    send();
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      send();
    }
  };

  const clearChat = async () => {
    setClearing(true);
    setSendError('');
    try {
      await api.delete('/chat');
      setMessages([]);
      setConfirmClear(false);
    } catch (error) {
      setSendError(getErrorMessage(error));
    } finally {
      setClearing(false);
    }
  };

  const openFollowUp = (question) => {
    setInput(question);
    requestAnimationFrame(() => textareaRef.current?.focus());
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-20 rounded-2xl skeleton" />
        <CardSkeleton rows={4} />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="space-y-6">
        <PageHeader
          eyebrow="Ask FemAware"
          title="Your health questions, answered"
          description="A private place to think out loud and get plain-language guidance."
        />
        <ErrorState message={loadError} onRetry={load} />
      </div>
    );
  }

  return (
    <div className={cn('space-y-5 sm:space-y-6', isSenior && 'space-y-6')}>
      <PageHeader
        eyebrow={isTeen ? 'Ask Bloom' : isSenior ? 'Ask a question' : 'Ask FemAware'}
        title={`Chat with ${guide.guideName}`}
        description={guide.description}
        actions={
          <Button
            variant="secondary"
            size={isSenior ? 'lg' : 'sm'}
            icon={Trash2}
            onClick={() => setConfirmClear(true)}
            disabled={!messages.length || sending}
          >
            Clear chat
          </Button>
        }
      />

      <section
        className={cn(
          'rounded-2xl border border-line bg-white p-4 sm:p-5',
          isSenior && 'border-2 p-5 sm:p-6'
        )}
        aria-label={`Conversation with ${guide.guideName}`}
      >
        {messages.length === 0 ? (
          <div className="rounded-xl bg-rose-mist/70 p-5 sm:p-6">
            <div className="flex items-start gap-3">
              <span
                className={cn(
                  'grid shrink-0 place-items-center rounded-full bg-white text-deep-rose ring-1 ring-blush-pink',
                  isSenior ? 'h-14 w-14' : 'h-11 w-11'
                )}
                aria-hidden="true"
              >
                <MessageCircleHeart className={isSenior ? 'h-6 w-6' : 'h-5 w-5'} />
              </span>
              <div>
                <p className={cn('font-display text-ink', isSenior ? 'text-2xl' : 'text-xl')}>
                  {guide.tagline}
                </p>
                <p className={cn('mt-1.5 text-muted', isSenior ? 'text-base leading-relaxed' : 'text-sm leading-relaxed')}>
                  Ask anything about your body, symptoms or next steps. I will keep it private to
                  your account, and I will tell you when something needs a clinician.
                </p>
              </div>
            </div>

            <p className="mt-5 text-xs font-semibold uppercase tracking-[0.12em] text-deep-rose">
              Try one of these
            </p>
            <div className="mt-2.5 flex flex-wrap gap-2">
              {guide.suggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => send(suggestion)}
                  disabled={sending}
                  className={cn(
                    'chip text-left',
                    isSenior && 'min-h-[48px] text-sm',
                    'text-xs sm:text-sm'
                  )}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div
            role="log"
            aria-live="polite"
            aria-label={`Messages with ${guide.guideName}`}
            className="space-y-5"
          >
            {messages.map((message) => (
              <Message
                key={message.id || `${message.role}-${message.createdAt}`}
                message={message}
                guide={guide}
                isSenior={isSenior}
                onFollowUp={openFollowUp}
              />
            ))}
            {sending ? <TypingBubble guideName={guide.guideName} /> : null}
            <div ref={endRef} />
          </div>
        )}
      </section>

      <form
        onSubmit={handleSubmit}
        className={cn('card p-3 sm:p-4', isSenior && 'border-2 p-4 sm:p-5')}
      >
        <label htmlFor="chat-message" className="sr-only">
          Your message to {guide.guideName}
        </label>
        <textarea
          id="chat-message"
          ref={textareaRef}
          rows={1}
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={handleKeyDown}
          maxLength={2000}
          placeholder={
            isTeen
              ? 'Ask Bloom anything about your body or periods…'
              : isSenior
                ? 'Type your question here…'
                : 'Ask about your cycle, symptoms or next steps…'
          }
          className={cn(
            'input-field resize-none',
            isSenior && 'senior-input min-h-[56px] text-base'
          )}
          disabled={sending}
        />
        <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs leading-relaxed text-muted">
            {sending ? `${guide.guideName} is thinking…` : 'Enter to send · Shift + Enter for a new line'}
          </p>
          <Button
            type="submit"
            size={isSenior ? 'lg' : 'md'}
            loading={sending}
            disabled={!input.trim() || sending}
            icon={Send}
          >
            Send
          </Button>
        </div>
        {sendError ? (
          <p
            role="alert"
            className="mt-3 rounded-lg border border-[#E7B6C4] bg-[#FDF1F4] px-3 py-2 text-sm font-medium text-[#8E1242]"
          >
            {sendError}
          </p>
        ) : null}
      </form>

      <section className="rounded-2xl border border-line bg-white p-4 text-xs leading-relaxed text-muted sm:p-5">
        <p className="flex items-center gap-2 font-semibold text-deep-rose">
          <ShieldAlert className="h-4 w-4" aria-hidden="true" />
          Important to know
        </p>
        <p className="mt-1.5">{guide.disclaimer}</p>
        <p className="mt-2">
          FemAware is not an emergency service. If you are in immediate danger or your symptoms are
          severe, call your local emergency number.
        </p>
        <p className="mt-2">
          Your chat is saved to your account. You can clear it at any time with the button above.
          {isTeen ? ' It is still a good idea to talk to a trusted adult about anything that worries you.' : ''}
        </p>
      </section>

      <ConfirmDialog
        open={confirmClear}
        onClose={() => setConfirmClear(false)}
        onConfirm={clearChat}
        title="Clear this chat?"
        description={`This will delete your conversation with ${guide.guideName}. Your health logs will not be affected.`}
        confirmLabel="Clear chat"
        loading={clearing}
      />
    </div>
  );
};

export default ChatPage;
