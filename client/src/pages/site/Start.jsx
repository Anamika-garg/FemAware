import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, Settings2, X } from 'lucide-react';
import Logo from '../../components/Logo';
import Button, { ButtonLink } from '../../components/ui/Button';
import ArticlePreview from '../../components/site/ArticlePreview';
import { StageMotif } from '../../components/site/Illustrations';
import { getArticle, getReadArticles } from '../../data/library';
import { useAuth } from '../../context/AuthContext';
import {
  START_STAGES,
  clearPreferences,
  loadPreferences,
  recommendationsFor,
  savePreferences,
  topicsForStage,
} from '../../lib/preferences';
import { cn } from '../../lib/utils';

const STEPS = ['Where to start', 'What you’d like help with', 'Your starting point'];

const Progress = ({ step }) => (
  <div className="w-full">
    <p className="text-sm font-medium text-muted">
      Step {step + 1} of {STEPS.length}
      <span className="sr-only">: {STEPS[step]}</span>
    </p>
    <div className="mt-2 grid grid-cols-3 gap-1.5" aria-hidden="true">
      {STEPS.map((label, index) => (
        <span
          key={label}
          className={cn('h-1 rounded-full transition-colors duration-300', index <= step ? 'bg-deep-rose' : 'bg-soft-petal')}
        />
      ))}
    </div>
  </div>
);

const Start = () => {
  const { user } = useAuth();
  const [params] = useSearchParams();
  const saved = useMemo(loadPreferences, []);
  const requestedStage = START_STAGES.some((item) => item.value === params.get('stage')) ? params.get('stage') : null;

  const [step, setStep] = useState(saved && !requestedStage ? 2 : 0);
  const [stage, setStage] = useState(requestedStage || saved?.stage || null);
  const [topics, setTopics] = useState(saved && (!requestedStage || requestedStage === saved.stage) ? saved.topics : []);
  const headingRef = useRef(null);

  useEffect(() => {
    headingRef.current?.focus();
    window.scrollTo({ top: 0 });
  }, [step]);

  const chooseStage = (value) => {
    if (value !== stage) setTopics([]);
    setStage(value);
  };

  const toggleTopic = (value) =>
    setTopics((current) => (current.includes(value) ? current.filter((item) => item !== value) : [...current, value]));

  const finish = (chosenTopics = topics) => {
    savePreferences({ stage, topics: chosenTopics });
    setTopics(chosenTopics);
    setStep(2);
  };

  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      <header className="border-b border-line bg-white">
        <div className="site-container flex h-16 items-center justify-between">
          <Link to="/" aria-label="FemAware home" className="rounded-md">
            <Logo compact />
          </Link>
          <Link to="/" className="inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-deep-rose">
            <X className="h-4 w-4" aria-hidden="true" />
            Exit
          </Link>
        </div>
      </header>

      <main id="main-content" className="flex-1">
        {step < 2 ? (
          <div className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-6 sm:py-16">
            <Progress step={step} />

            {step === 0 ? (
              <section aria-labelledby="start-q1" className="mt-10">
                <h1 id="start-q1" ref={headingRef} tabIndex={-1} className="font-display text-[2.25rem] leading-tight text-ink outline-none sm:text-[2.75rem]">
                  Where would you like to start?
                </h1>
                <p className="mt-3 text-[15px] text-muted">
                  This only shapes what we show first. Everything stays open to you.
                </p>
                <div className="mt-8 grid gap-3" role="radiogroup" aria-labelledby="start-q1">
                  {START_STAGES.map((option) => {
                    const selected = stage === option.value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        onClick={() => chooseStage(option.value)}
                        className={cn(
                          'flex min-h-[88px] items-center gap-4 rounded-2xl border bg-white p-4 text-left transition-colors sm:gap-5 sm:p-5',
                          selected ? 'border-deep-rose bg-rose-mist ring-1 ring-deep-rose' : 'border-line hover:border-blush-pink hover:bg-rose-mist/50'
                        )}
                      >
                        {option.value === 'everything' ? (
                          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-dashed border-blush-pink text-deep-rose" aria-hidden="true">
                            <ArrowRight className="h-5 w-5" />
                          </span>
                        ) : (
                          <StageMotif stage={option.value} className="h-12 w-12 shrink-0" />
                        )}
                        <span className="min-w-0 flex-1">
                          <span className="flex flex-wrap items-baseline gap-x-2">
                            <span className="text-lg font-semibold text-ink">{option.label}</span>
                            <span className="text-sm text-muted">{option.hint}</span>
                          </span>
                          <span className="mt-0.5 block text-sm leading-relaxed text-muted">{option.description}</span>
                        </span>
                        <span
                          className={cn(
                            'grid h-6 w-6 shrink-0 place-items-center rounded-full border-2 transition-colors',
                            selected ? 'border-deep-rose bg-deep-rose text-white' : 'border-blush-pink'
                          )}
                          aria-hidden="true"
                        >
                          {selected ? <Check className="h-3.5 w-3.5 animate-pop-in" /> : null}
                        </span>
                      </button>
                    );
                  })}
                </div>
                <div className="mt-10 flex items-center justify-between gap-4">
                  <ButtonLink to="/" variant="ghost" icon={ArrowLeft}>
                    Back
                  </ButtonLink>
                  <Button onClick={() => setStep(1)} disabled={!stage} iconRight={ArrowRight} size="lg">
                    Continue
                  </Button>
                </div>
              </section>
            ) : (
              <section aria-labelledby="start-q2" className="mt-10">
                <h1 id="start-q2" ref={headingRef} tabIndex={-1} className="font-display text-[2.25rem] leading-tight text-ink outline-none sm:text-[2.75rem]">
                  What would you like help with?
                </h1>
                <p className="mt-3 text-[15px] text-muted">Choose as many as you like, or skip this step.</p>
                <div className="mt-8 grid gap-2.5 sm:grid-cols-2">
                  {topicsForStage(stage).map((topic) => {
                    const selected = topics.includes(topic.value);
                    return (
                      <button
                        key={topic.value}
                        type="button"
                        role="checkbox"
                        aria-checked={selected}
                        onClick={() => toggleTopic(topic.value)}
                        className={cn(
                          'flex min-h-[60px] items-center gap-3 rounded-xl border bg-white px-4 py-3 text-left text-[15px] font-medium transition-colors',
                          selected ? 'border-deep-rose bg-rose-mist text-deep-rose' : 'border-line text-ink hover:border-blush-pink'
                        )}
                      >
                        <span
                          className={cn(
                            'grid h-5 w-5 shrink-0 place-items-center rounded border-2 transition-colors',
                            selected ? 'border-deep-rose bg-deep-rose text-white' : 'border-blush-pink'
                          )}
                          aria-hidden="true"
                        >
                          {selected ? <Check className="h-3 w-3" /> : null}
                        </span>
                        {topic.value}
                      </button>
                    );
                  })}
                </div>
                <p className="mt-5 text-xs leading-relaxed text-muted">
                  We don’t ask for your name, age or health details. Your choices are kept in this
                  browser only.
                </p>
                <div className="mt-10 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <Button variant="ghost" icon={ArrowLeft} onClick={() => setStep(0)}>
                    Back
                  </Button>
                  <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center">
                    <Button variant="ghost" onClick={() => finish([])}>
                      Skip for now
                    </Button>
                    <Button onClick={() => finish()} iconRight={ArrowRight} size="lg">
                      Show my starting point
                    </Button>
                  </div>
                </div>
              </section>
            )}
          </div>
        ) : (
          <StartingPoint
            headingRef={headingRef}
            stage={stage}
            topics={topics}
            user={user}
            onEdit={() => setStep(0)}
            onClear={() => {
              clearPreferences();
              setStage(null);
              setTopics([]);
              setStep(0);
            }}
          />
        )}
      </main>
    </div>
  );
};

const StartingPoint = ({ headingRef, stage, topics, user, onEdit, onClear }) => {
  const { articles, tools } = recommendationsFor({ stage, topics });
  const reading = articles.map(getArticle).filter(Boolean);
  const read = getReadArticles();
  const next = reading.find((article) => !read.includes(article.id)) || reading[0];
  const stageLabel = START_STAGES.find((item) => item.value === stage)?.label;

  return (
    <div className="site-container py-10 sm:py-14">
      <div className="flex flex-col gap-6 border-b border-line pb-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">Your starting point</p>
          <h1 ref={headingRef} tabIndex={-1} className="mt-3 font-display text-[2.25rem] leading-tight text-ink outline-none sm:text-display-md">
            Here’s where to begin.
          </h1>
          <p className="mt-3 text-[15px] text-muted">
            Based on: <span className="font-medium text-ink">{stageLabel}</span>
            {topics.length ? ` · ${topics.join(', ')}` : ' · no topics chosen'}
          </p>
        </div>
        <Button variant="secondary" icon={Settings2} onClick={onEdit} className="shrink-0">
          Change preferences
        </Button>
      </div>

      <div className="mt-10 grid gap-12 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-16">
        <div>
          {next ? (
            <section aria-labelledby="next-heading" className="rounded-3xl bg-rose-mist p-6 sm:p-8">
              <p id="next-heading" className="text-sm font-semibold text-deep-rose">
                Suggested first step
              </p>
              <h2 className="mt-2 font-display text-[1.75rem] leading-tight text-ink sm:text-[2rem]">{next.title}</h2>
              <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-muted">{next.summary}</p>
              <ButtonLink to={`/library/${next.id}`} iconRight={ArrowRight} className="mt-6">
                Read now · {next.readTime}
              </ButtonLink>
            </section>
          ) : null}

          <section aria-labelledby="reading-heading" className="mt-12">
            <h2 id="reading-heading" className="font-display text-2xl text-ink">
              Recommended reading
            </h2>
            <div className="mt-2 border-b border-line">
              {reading
                .filter((article) => article.id !== next?.id)
                .map((article) => (
                  <ArticlePreview key={article.id} article={article} read={read.includes(article.id)} />
                ))}
            </div>
            <Link to={stage === 'everything' ? '/library' : `/library?stage=${stage}`} className="link mt-6 inline-block text-sm">
              See more in the library
            </Link>
          </section>
        </div>

        <aside className="space-y-8">
          <section aria-labelledby="tools-heading">
            <h2 id="tools-heading" className="font-display text-2xl text-ink">
              Tools that can help
            </h2>
            <ul className="mt-4 divide-y divide-line border-y border-line">
              {tools.map((tool) => {
                const locked = tool.account && !user;
                return (
                  <li key={tool.key}>
                    <Link to={locked ? '/register' : tool.to} className="group flex items-start justify-between gap-4 py-4">
                      <span>
                        <span className="block font-semibold text-ink group-hover:text-deep-rose">{tool.label}</span>
                        <span className="mt-0.5 block text-sm text-muted">{tool.text}</span>
                      </span>
                      <span
                        className={cn(
                          'mt-0.5 shrink-0 rounded-md px-2 py-0.5 text-[11px] font-semibold',
                          locked ? 'bg-white text-muted ring-1 ring-line' : 'bg-soft-petal text-deep-rose'
                        )}
                      >
                        {locked ? 'Free account' : 'Open'}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>

          {!user ? (
            <section className="rounded-2xl border border-line bg-white p-6">
              <h2 className="font-semibold text-ink">Want to track over time?</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                A free account lets you log periods and symptoms, see your own patterns and prepare a
                summary for appointments. We’ll carry these choices over.
              </p>
              <ButtonLink to="/register" className="mt-5 w-full">
                Create a free account
              </ButtonLink>
              <p className="mt-3 text-center text-xs text-muted">
                Already have one?{' '}
                <Link to="/login" className="font-semibold text-deep-rose hover:underline">
                  Sign in
                </Link>
              </p>
            </section>
          ) : (
            <ButtonLink to="/dashboard" variant="secondary" className="w-full">
              Go to your dashboard
            </ButtonLink>
          )}

          <p className="text-xs leading-relaxed text-muted">
            Your choices are saved in this browser only.{' '}
            <button type="button" onClick={onClear} className="font-semibold text-deep-rose underline underline-offset-2">
              Clear them
            </button>
          </p>
        </aside>
      </div>
    </div>
  );
};

export default Start;
