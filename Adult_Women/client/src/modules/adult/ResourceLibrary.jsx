import { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  Bookmark,
  BookmarkCheck,
  BookOpen,
  Clock,
  Search,
  ShieldCheck,
  Sparkles,
  X,
} from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/States';
import { CATEGORY_STYLES } from '../../lib/constants';
import { RESOURCES, RESOURCE_CATEGORIES } from '../../data/resources';
import { cn } from '../../lib/utils';

const BOOKMARK_KEY = 'cyclesense_saved_resources';

const categoryIcons = {
  Contraception: ShieldCheck,
  Fertility: Sparkles,
  'Sexual Health': BookOpen,
  'Pregnancy & Postpartum': BookOpen,
  Perimenopause: BookOpen,
};

const readBookmarks = () => {
  try {
    const parsed = JSON.parse(localStorage.getItem(BOOKMARK_KEY) || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const ResourceLibrary = () => {
  const [category, setCategory] = useState('All');
  const [query, setQuery] = useState('');
  const [savedOnly, setSavedOnly] = useState(false);
  const [saved, setSaved] = useState(readBookmarks);
  const [activeArticle, setActiveArticle] = useState(null);
  const [justSaved, setJustSaved] = useState(null);

  useEffect(() => {
    localStorage.setItem(BOOKMARK_KEY, JSON.stringify(saved));
  }, [saved]);

  const toggleSaved = (id) => {
    setSaved((current) => {
      const isSaved = current.includes(id);
      setJustSaved(isSaved ? null : id);
      window.setTimeout(() => setJustSaved(null), 1800);
      return isSaved ? current.filter((item) => item !== id) : [...current, id];
    });
  };

  const counts = useMemo(() => {
    const map = { All: RESOURCES.length };
    RESOURCES.forEach((resource) => {
      map[resource.category] = (map[resource.category] || 0) + 1;
    });
    return map;
  }, []);

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return RESOURCES.filter((resource) => {
      if (savedOnly && !saved.includes(resource.id)) return false;
      if (category !== 'All' && resource.category !== category) return false;
      if (!normalizedQuery) return true;
      const bodyText = (resource.sections || [])
        .flatMap((section) => [section.heading, ...(section.paragraphs || []), ...(section.bullets || [])])
        .join(' ');
      return [
        resource.title,
        resource.summary,
        resource.intro,
        resource.takeaway,
        resource.category,
        bodyText,
        ...resource.tags,
      ]
        .join(' ')
        .toLowerCase()
        .includes(normalizedQuery);
    });
  }, [category, query, savedOnly, saved]);

  const openArticle = (article) => {
    setActiveArticle(article);
    window.setTimeout(() => {
      document.querySelector('[role="dialog"]')?.scrollTo?.({ top: 0 });
    }, 50);
  };

  const related = activeArticle
    ? RESOURCES.filter(
        (item) => item.category === activeArticle.category && item.id !== activeArticle.id
      ).slice(0, 2)
    : [];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Learn at your pace"
        title="Information that respects your intelligence."
        description="Evidence-informed, plain-language guides on contraception, fertility, sexual health, postpartum care and perimenopause. No fear, no jargon, no diagnosis."
        actions={
          <button
            type="button"
            onClick={() => setSavedOnly((value) => !value)}
            className={cn('btn-secondary btn-sm', savedOnly && 'border-pink-glow bg-soft-petal')}
            aria-pressed={savedOnly}
          >
            <BookmarkCheck className="h-4 w-4" aria-hidden="true" />
            Saved ({saved.length})
          </button>
        }
      />

      <section className="relative overflow-hidden rounded-2xl border border-white/70 bg-gradient-to-r from-soft-petal via-blush-pink/70 to-pink-glow/70 p-5 sm:p-6">
        <div className="pointer-events-none absolute -right-8 -top-16 h-48 w-48 rounded-full bg-white/30 blur-2xl" />
        <div className="relative grid gap-4 sm:grid-cols-[1fr_auto] sm:items-center">
          <div>
            <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-deep-rose">
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              Start here
            </p>
            <h2 className="mt-2 max-w-2xl font-display text-xl font-semibold leading-snug text-deep-rose sm:text-2xl">
              Understanding your body should feel clarifying, not frightening.
            </h2>
            <p className="mt-2 max-w-2xl text-xs leading-relaxed text-deep-rose/70">
              Browse by topic or search for what is on your mind. Every article includes context and
              clear guidance on when to speak with a clinician.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-2xl bg-white/50 p-3 backdrop-blur-sm">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/80 text-deep-rose">
              <BookOpen className="h-4 w-4" aria-hidden="true" />
            </span>
            <div>
              <p className="text-lg font-bold leading-none text-deep-rose">{RESOURCES.length}</p>
              <p className="text-[9px] font-bold uppercase tracking-wide text-deep-rose/60">articles</p>
            </div>
          </div>
        </div>
      </section>

      <div className="card overflow-hidden">
        <div className="border-b border-blush-pink/40 p-4 sm:p-5">
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted/60"
              aria-hidden="true"
            />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="input-field pl-10 pr-10"
              placeholder="Search articles, topics or questionsâ€¦"
              aria-label="Search the resource library"
            />
            {query ? (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-muted hover:bg-rose-mist hover:text-deep-rose"
                aria-label="Clear search"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            ) : null}
          </div>

          <div className="mt-3 flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {RESOURCE_CATEGORIES.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setCategory(item)}
                aria-pressed={category === item}
                className={cn(
                  'flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-[10px] font-bold transition-colors',
                  category === item
                    ? 'border-deep-rose bg-deep-rose text-white'
                    : 'border-blush-pink/70 bg-white text-muted hover:border-pink-glow hover:text-deep-rose'
                )}
              >
                {item}
                <span
                  className={cn(
                    'rounded-full px-1.5 text-[8px]',
                    category === item ? 'bg-white/20' : 'bg-rose-mist'
                  )}
                >
                  {counts[item] || 0}
                </span>
              </button>
            ))}
          </div>

          {savedOnly || query || category !== 'All' ? (
            <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
              <p className="text-[10px] text-muted">
                {filtered.length} article{filtered.length === 1 ? '' : 's'} match your filters
              </p>
              <button
                type="button"
                onClick={() => {
                  setSavedOnly(false);
                  setQuery('');
                  setCategory('All');
                }}
                className="text-[10px] font-bold text-deep-rose hover:text-rose-pink"
              >
                Clear all filters
              </button>
            </div>
          ) : null}
        </div>

        {filtered.length ? (
          <div className="grid gap-3.5 p-4 sm:grid-cols-2 sm:p-5 xl:grid-cols-3">
            {filtered.map((resource) => {
              const styles = CATEGORY_STYLES[resource.category] || CATEGORY_STYLES.Fertility;
              const CategoryIcon = categoryIcons[resource.category] || BookOpen;
              const isSaved = saved.includes(resource.id);
              return (
                <article
                  key={resource.id}
                  className="group flex flex-col rounded-2xl border border-blush-pink/60 bg-white p-4 transition-all hover:-translate-y-0.5 hover:border-pink-glow/50 hover:shadow-soft"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className={cn('badge', styles.badge)}>
                      <CategoryIcon className="h-3 w-3" aria-hidden="true" />
                      {resource.category}
                    </span>
                    <button
                      type="button"
                      onClick={() => toggleSaved(resource.id)}
                      className={cn(
                        'rounded-lg p-1.5 transition-colors',
                        isSaved
                          ? 'bg-soft-petal text-deep-rose'
                          : 'text-muted/60 hover:bg-rose-mist hover:text-deep-rose'
                      )}
                      aria-label={isSaved ? 'Remove from saved articles' : 'Save article'}
                      aria-pressed={isSaved}
                    >
                      {isSaved ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
                    </button>
                  </div>

                  <h3 className="mt-3 font-display text-[1.05rem] font-semibold leading-snug text-deep-rose">
                    {resource.title}
                  </h3>
                  <p className="mt-1.5 flex-1 text-[11px] leading-relaxed text-muted">
                    {resource.summary}
                  </p>

                  <div className="mt-3 flex items-center justify-between border-t border-blush-pink/30 pt-3">
                    <span className="flex items-center gap-1 text-[9px] font-semibold text-muted">
                      <Clock className="h-3 w-3" aria-hidden="true" />
                      {resource.readTime} read
                    </span>
                    <button
                      type="button"
                      onClick={() => openArticle(resource)}
                      className="flex items-center gap-1 text-[10px] font-bold text-deep-rose transition-colors hover:text-rose-pink"
                    >
                      Read
                      <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                    </button>
                  </div>
                  {justSaved === resource.id ? (
                    <p className="mt-1 text-[9px] font-semibold text-pink-glow">Saved on this device</p>
                  ) : null}
                </article>
              );
            })}
          </div>
        ) : (
          <div className="p-5">
            <EmptyState
              icon={BookOpen}
              title="No articles match yet"
              description="Try a broader search or another category. Your saved articles are kept on this device."
              action={
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setQuery('');
                    setCategory('All');
                    setSavedOnly(false);
                  }}
                >
                  Show all articles
                </Button>
              }
            />
          </div>
        )}
      </div>

      <div className="flex items-start gap-2 rounded-2xl border border-blush-pink/60 bg-white/70 p-4">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-pink-glow" aria-hidden="true" />
        <p className="text-[10px] leading-relaxed text-muted">
          CycleSense articles are educational and cannot account for your full medical history. They
          are not a substitute for personalised advice from a qualified clinician. If you are worried
          about a symptom, book an appointment â€” you do not need to wait for it to become severe.
        </p>
      </div>

      <Modal
        open={Boolean(activeArticle)}
        onClose={() => setActiveArticle(null)}
        title={activeArticle?.category}
        size="lg"
      >
        {activeArticle ? (
          <article>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="font-display text-2xl font-semibold leading-tight text-deep-rose sm:text-3xl">
                  {activeArticle.title}
                </h1>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <Badge tone="pink" icon={Clock}>{activeArticle.readTime} read</Badge>
                  {saved.includes(activeArticle.id) ? <Badge tone="calm" icon={BookmarkCheck}>Saved</Badge> : null}
                </div>
              </div>
            </div>

            <p className="mt-5 border-l-2 border-pink-glow pl-4 text-sm font-medium leading-relaxed text-deep-rose/80">
              {activeArticle.intro}
            </p>

            <div className="mt-6 space-y-6">
              {activeArticle.sections.map((section) => (
                <section key={section.heading}>
                  <h2 className="font-display text-lg font-semibold text-deep-rose">{section.heading}</h2>
                  {section.paragraphs?.map((paragraph) => (
                    <p key={paragraph} className="mt-2 text-sm leading-relaxed text-ink/85">
                      {paragraph}
                    </p>
                  ))}
                  {section.bullets?.length ? (
                    <ul className="mt-3 space-y-2">
                      {section.bullets.map((bullet) => (
                        <li key={bullet} className="flex items-start gap-2 text-sm leading-relaxed text-ink/85">
                          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-pink-glow" aria-hidden="true" />
                          {bullet}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </section>
              ))}
            </div>

            <div className="mt-6 rounded-2xl bg-soft-petal/50 p-4">
              <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-deep-rose">
                <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                The takeaway
              </p>
              <p className="mt-1.5 text-sm leading-relaxed text-ink/85">{activeArticle.takeaway}</p>
            </div>

            <div className="mt-4 flex flex-wrap gap-1.5">
              {activeArticle.tags.map((tag) => (
                <span key={tag} className="rounded-full bg-rose-mist px-2 py-1 text-[9px] font-semibold text-muted">
                  #{tag}
                </span>
              ))}
            </div>

            <div className="mt-6 flex flex-col gap-2 border-t border-blush-pink/40 pt-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="max-w-lg text-[9px] leading-relaxed text-muted">
                Educational content only. Speak with a qualified clinician about your personal health.
                If you have urgent symptoms, seek same-day care.
              </p>
              <Button
                variant="secondary"
                size="sm"
                icon={saved.includes(activeArticle.id) ? BookmarkCheck : Bookmark}
                onClick={() => toggleSaved(activeArticle.id)}
              >
                {saved.includes(activeArticle.id) ? 'Saved' : 'Save'}
              </Button>
            </div>

            {related.length ? (
              <div className="mt-6 border-t border-blush-pink/40 pt-4">
                <p className="text-[10px] font-bold uppercase tracking-wide text-muted">Keep reading</p>
                <div className="mt-2 grid gap-2 sm:grid-cols-2">
                  {related.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => openArticle(item)}
                      className="rounded-xl border border-blush-pink/60 p-3 text-left transition-colors hover:border-pink-glow hover:bg-rose-mist/40"
                    >
                      <p className="text-xs font-bold text-deep-rose">{item.title}</p>
                      <p className="mt-1 text-[9px] text-muted">{item.readTime} read</p>
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
          </article>
        ) : null}
      </Modal>
    </div>
  );
};

export default ResourceLibrary;
