import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import ArticlePreview from '../../components/site/ArticlePreview';
import LearningProgress from '../../components/site/LearningProgress';
import MythOrFact from '../../components/site/MythOrFact';
import { EmptyState } from '../../components/ui/States';
import { LIBRARY, STAGE_FILTERS, TOPICS, getReadArticles, matchesStage } from '../../data/library';
import { cn } from '../../lib/utils';

const Library = () => {
  const [params, setParams] = useSearchParams();
  const stage = STAGE_FILTERS.some((item) => item.value === params.get('stage')) ? params.get('stage') : 'all';
  const topic = TOPICS.includes(params.get('topic')) ? params.get('topic') : 'All topics';
  const [query, setQuery] = useState('');
  const [read] = useState(getReadArticles);

  const setParam = (key, value, fallback) => {
    const next = new URLSearchParams(params);
    if (value === fallback) next.delete(key);
    else next.set(key, value);
    setParams(next, { replace: true });
  };

  const topics = useMemo(
    () => TOPICS.filter((item) => LIBRARY.some((article) => article.topic === item && matchesStage(article, stage))),
    [stage]
  );

  const results = useMemo(() => {
    const term = query.trim().toLowerCase();
    return LIBRARY.filter((article) => {
      if (!matchesStage(article, stage)) return false;
      if (topic !== 'All topics' && article.topic !== topic) return false;
      if (!term) return true;
      return [article.title, article.summary, article.topic, ...(article.tags || [])]
        .join(' ')
        .toLowerCase()
        .includes(term);
    });
  }, [query, stage, topic]);

  const filtered = query || stage !== 'all' || topic !== 'All topics';
  const [lead, ...rest] = results;
  const readCount = LIBRARY.filter((article) => read.includes(article.id)).length;

  const clearAll = () => {
    setQuery('');
    setParams({}, { replace: true });
  };

  return (
    <>
      <header className="border-b border-line bg-white">
        <div className="site-container grid gap-10 py-14 sm:py-16 lg:grid-cols-[1fr_320px] lg:items-end">
          <div>
            <p className="eyebrow">Learning library</p>
            <h1 className="mt-4 font-display text-[2.5rem] leading-[1.06] text-ink sm:text-display-lg">
              Good health starts with understanding.
            </h1>
            <p className="lede mt-5 max-w-2xl">
              Plain-language articles for every stage of life, written from public health guidance and
              clear about what they can and cannot tell you.
            </p>
          </div>
          <LearningProgress
            done={readCount}
            total={LIBRARY.length}
            note="Progress is saved in this browser only."
          />
        </div>
      </header>

      <div className="sticky top-16 z-20 border-b border-line bg-white/[0.97]">
        <div className="site-container flex flex-col gap-3 py-4 md:flex-row md:items-center">
          <label className="relative block md:w-80">
            <span className="sr-only">Search articles</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden="true" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search topics, symptoms, questions"
              className="input-field pl-9"
            />
          </label>
          <div className="flex gap-1 overflow-x-auto rounded-lg border border-line p-1 no-scrollbar" role="radiogroup" aria-label="Life stage">
            {STAGE_FILTERS.map((item) => (
              <button
                key={item.value}
                type="button"
                role="radio"
                aria-checked={stage === item.value}
                onClick={() => setParam('stage', item.value, 'all')}
                className={cn(
                  'min-h-[36px] shrink-0 rounded-md px-3 text-sm font-medium transition-colors',
                  stage === item.value ? 'bg-deep-rose text-white' : 'text-ink/75 hover:bg-rose-mist hover:text-deep-rose'
                )}
              >
                {item.label}
              </button>
            ))}
          </div>
          <label className="md:ml-auto md:w-56">
            <span className="sr-only">Topic</span>
            <select
              value={topic}
              onChange={(event) => setParam('topic', event.target.value, 'All topics')}
              className="input-field"
            >
              <option>All topics</option>
              {topics.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <section className="site-container py-12 sm:py-16" aria-live="polite">
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm text-muted">
            {results.length} {results.length === 1 ? 'article' : 'articles'}
            {topic !== 'All topics' ? ` in ${topic}` : ''}
          </p>
          {filtered ? (
            <button type="button" onClick={clearAll} className="inline-flex items-center gap-1.5 text-sm font-semibold text-deep-rose hover:underline">
              <X className="h-4 w-4" aria-hidden="true" />
              Clear filters
            </button>
          ) : null}
        </div>

        {!results.length ? (
          <EmptyState
            className="mt-8"
            icon={Search}
            title="Nothing matches that yet"
            description="Try a broader word, another life stage, or clear the filters to see every article."
            action={
              <button type="button" className="btn-secondary" onClick={clearAll}>
                Show all articles
              </button>
            }
          />
        ) : filtered ? (
          <div className="mt-4 grid gap-x-16 md:grid-cols-2">
            {results.map((article) => (
              <ArticlePreview key={article.id} article={article} read={read.includes(article.id)} />
            ))}
          </div>
        ) : (
          <>
            <div className="mt-8 border-t border-line pt-10">
              <ArticlePreview article={lead} variant="feature" read={read.includes(lead.id)} />
            </div>
            <div className="mt-12 grid gap-x-16 md:grid-cols-2">
              {rest.map((article) => (
                <ArticlePreview key={article.id} article={article} read={read.includes(article.id)} />
              ))}
            </div>
          </>
        )}
      </section>

      <div className="site-container pb-16 sm:pb-20">
        <MythOrFact />
      </div>
    </>
  );
};

export default Library;
