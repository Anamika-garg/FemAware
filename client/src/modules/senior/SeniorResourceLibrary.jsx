import { useMemo, useState } from 'react';
import {
  Activity,
  ArrowRight,
  BookOpen,
  Check,
  ChevronRight,
  Droplets,
  HeartPulse,
  Search,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import PageHeader from '../../components/ui/PageHeader';
import Modal from '../../components/ui/Modal';
import { EmptyState } from '../../components/ui/States';
import { cn } from '../../lib/utils';
import SeniorPageShell from './SeniorPageShell';
import { SENIOR_ARTICLES as ARTICLES } from '../../data/seniorResources';

const CATEGORIES = [
  'All',
  'Postmenopause',
  'Osteoporosis',
  'Cardiovascular Health',
  'Intimate Health',
  'Healthy Aging',
];

const CATEGORY_STYLES = {
  Postmenopause: { icon: Sparkles, tone: 'bg-soft-petal text-deep-rose' },
  Osteoporosis: { icon: ShieldCheck, tone: 'bg-blush-pink/70 text-deep-rose' },
  'Cardiovascular Health': { icon: HeartPulse, tone: 'bg-[#FFE4EC] text-deep-rose' },
  'Intimate Health': { icon: Droplets, tone: 'bg-rose-mist text-deep-rose' },
  'Healthy Aging': { icon: Activity, tone: 'bg-soft-petal text-deep-rose' },
};

const Callout = ({ tone, title, text }) => {
  const styles = {
    warn: 'border-deep-rose/40 bg-rose-mist text-deep-rose',
    danger: 'border-deep-rose/40 bg-rose-mist text-deep-rose',
    info: 'border-blush-pink bg-soft-petal/40 text-deep-rose',
  };
  return (
    <div className={cn('rounded-2xl border-2 p-4', styles[tone] || styles.info)}>
      <div className="flex items-start gap-2.5">
        <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
        <div>
          <p className="text-base font-semibold">{title}</p>
          <p className="mt-1 text-sm leading-relaxed">{text}</p>
        </div>
      </div>
    </div>
  );
};

const ActivityCheckin = () => {
  const [checked, setChecked] = useState([]);
  const items = [
    'I moved for at least 20 minutes on most days this week',
    'I did some strength or balance work this week',
    'I know my most recent blood pressure reading',
    'I have had cholesterol checked when advised',
    'I do not smoke, or I have asked for help to stop',
    'I know the signs of a heart attack and when to call for help',
  ];

  const toggle = (item) => {
    setChecked((current) =>
      current.includes(item) ? current.filter((value) => value !== item) : [...current, item]
    );
  };

  return (
    <div className="rounded-3xl border-2 border-blush-pink bg-white p-4 sm:p-5">
      <div className="flex items-start gap-3">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-soft-petal text-deep-rose">
          <HeartPulse className="h-5 w-5" aria-hidden="true" />
        </span>
        <div>
          <h4 className="font-display text-lg text-ink">
            My weekly heart check-in
          </h4>
          <p className="mt-0.5 text-sm leading-relaxed text-muted">
            A private reflection to bring to your next appointment. Nothing is saved or sent.
          </p>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        {items.map((item) => {
          const active = checked.includes(item);
          return (
            <button
              key={item}
              type="button"
              aria-pressed={active}
              onClick={() => toggle(item)}
              className={cn(
                'flex min-h-[52px] w-full items-start gap-3 rounded-2xl border-2 px-3.5 py-3 text-left text-sm font-semibold transition-colors',
                active
                  ? 'border-deep-rose bg-rose-mist text-deep-rose'
                  : 'border-blush-pink bg-white text-ink hover:border-pink-glow hover:bg-soft-petal/40'
              )}
            >
              <span
                className={cn(
                  'mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-lg border-2',
                  active ? 'border-deep-rose bg-deep-rose text-white' : 'border-blush-pink bg-white'
                )}
                aria-hidden="true"
              >
                {active ? <Check className="h-4 w-4" /> : null}
              </span>
              <span className="leading-relaxed">{item}</span>
            </button>
          );
        })}
      </div>

      <p className="mt-4 rounded-2xl bg-rose-mist/70 px-4 py-3 text-sm leading-relaxed text-muted">
        {checked.length} of {items.length} reflections checked. This is not a risk score. Use it to
        notice what you would like to discuss.
      </p>
    </div>
  );
};

const SeniorResourceLibrary = () => {
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [activeArticle, setActiveArticle] = useState(null);

  const firstName = user?.name?.split(' ')[0] || 'there';

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return ARTICLES.filter((article) => {
      const matchesCategory = category === 'All' || article.category === category;
      if (!matchesCategory) return false;
      if (!term) return true;
      const haystack = [article.title, article.summary, article.category, ...article.tags]
        .join(' ')
        .toLowerCase();
      return haystack.includes(term);
    });
  }, [query, category]);

  return (
    <SeniorPageShell>
      <PageHeader
        eyebrow="Learning library"
        title={`Reviewed guidance, ${firstName}`}
        description="Clear, calm articles on later-life health. Read at your own pace, and bring anything useful to your next appointment."
      />

      <section className="rounded-3xl border-2 border-blush-pink/70 bg-white p-4 sm:p-5">
        <label htmlFor="senior-resource-search" className="text-base font-semibold text-ink">
          Search the library
        </label>
        <div className="relative mt-2">
          <Search
            className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted"
            aria-hidden="true"
          />
          <input
            id="senior-resource-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Try “bone density”, “sleep” or “bladder”"
            className="senior-input !pl-12 !pr-12"
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="absolute right-2 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-xl text-muted hover:bg-rose-mist hover:text-deep-rose"
              aria-label="Clear search"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          ) : null}
        </div>

        <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Filter by topic">
          {CATEGORIES.map((item) => {
            const active = category === item;
            return (
              <button
                key={item}
                type="button"
                aria-pressed={active}
                onClick={() => setCategory(item)}
                className={cn('senior-choice min-h-[48px] px-4 text-base', active && 'senior-choice-active')}
              >
                {item}
              </button>
            );
          })}
        </div>
      </section>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-semibold text-muted">
          {filtered.length} guide{filtered.length === 1 ? '' : 's'}
          {category !== 'All' ? ` in ${category}` : ''}
          {query ? ` matching “${query.trim()}”` : ''}
        </p>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/80 px-3 py-1.5 text-sm font-semibold text-deep-rose">
          <ShieldCheck className="h-4 w-4" aria-hidden="true" />
          Reviewed senior health information
        </span>
      </div>

      {filtered.length ? (
        <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((article) => {
            const style = CATEGORY_STYLES[article.category] || CATEGORY_STYLES.Postmenopause;
            const Icon = style.icon;
            return (
              <li key={article.id}>
                <article className="flex h-full flex-col rounded-3xl border border-line bg-white p-5 shadow-soft transition-all hover:border-pink-glow/50">
                  <div className="flex items-start justify-between gap-3">
                    <span className={cn('grid h-12 w-12 place-items-center rounded-2xl', style.tone)}>
                      <Icon className="h-6 w-6" aria-hidden="true" />
                    </span>
                    <span className="rounded-full bg-rose-mist px-3 py-1 text-xs font-semibold text-deep-rose">
                      {article.readTime}
                    </span>
                  </div>

                  <p className="mt-4 text-xs font-semibold text-muted">
                    {article.category}
                  </p>
                  <h2 className="mt-1 font-display text-xl leading-snug text-ink">
                    {article.title}
                  </h2>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">{article.summary}</p>

                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {article.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-rose-mist/80 px-2.5 py-1 text-xs font-semibold text-muted"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveArticle(article)}
                    className="senior-button mt-4 w-full border-2 border-blush-pink bg-white text-deep-rose hover:border-deep-rose hover:bg-soft-petal"
                    aria-label={`Read ${article.title}`}
                  >
                    <BookOpen className="h-5 w-5" aria-hidden="true" />
                    Read guide
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </button>
                </article>
              </li>
            );
          })}
        </ul>
      ) : (
        <EmptyState
          icon={Search}
          title="No guides match that search"
          description="Try a broader word, or choose “All” to see every guide in the library."
          action={
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setCategory('All');
              }}
              className="senior-button bg-deep-rose text-white hover:bg-[#A3134C]"
            >
              Show all guides
            </button>
          }
          className="border-2"
        />
      )}

      <section className="rounded-3xl border-2 border-blush-pink/70 bg-soft-petal/40 p-5">
        <div className="flex items-start gap-3">
          <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-deep-rose" aria-hidden="true" />
          <div>
            <h2 className="font-display text-lg text-ink">
              Information, not diagnosis
            </h2>
            <p className="mt-1 text-sm leading-relaxed text-muted">
              These guides offer general education and do not replace personalised medical advice.
              Recommendations for screening and treatment vary by country and individual history.
              If you have a symptom that worries you, contact your clinician. For urgent symptoms,
              seek emergency care.
            </p>
          </div>
        </div>
      </section>

      <Modal
        open={Boolean(activeArticle)}
        onClose={() => setActiveArticle(null)}
        title={activeArticle?.title}
        description={
          activeArticle ? `${activeArticle.category} · ${activeArticle.readTime} read` : undefined
        }
        size="xl"
        footer={
          <>
            <button
              type="button"
              onClick={() => setActiveArticle(null)}
              className="senior-button border-2 border-blush-pink bg-white text-deep-rose hover:bg-soft-petal"
            >
              Close
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveArticle(null);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="senior-button bg-deep-rose text-white hover:bg-[#A3134C]"
            >
              Back to the library
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </>
        }
      >
        {activeArticle ? (
          <div className="space-y-5">
            <p className="text-base leading-relaxed text-ink">{activeArticle.intro}</p>

            {activeArticle.callout &&
            ['warn', 'danger'].includes(activeArticle.callout.tone) ? (
              <Callout {...activeArticle.callout} />
            ) : null}

            {activeArticle.sections.map((section) => (
              <section key={section.heading}>
                <h3 className="font-display text-lg text-ink">
                  {section.heading}
                </h3>
                {section.paragraphs?.map((paragraph) => (
                  <p key={paragraph} className="mt-2 text-base leading-relaxed text-ink">
                    {paragraph}
                  </p>
                ))}
                {section.bullets?.length ? (
                  <ul className="mt-3 space-y-2">
                    {section.bullets.map((bullet) => (
                      <li key={bullet} className="flex items-start gap-2 text-base leading-relaxed text-ink">
                        <Check className="mt-1 h-4 w-4 shrink-0 text-deep-rose" aria-hidden="true" />
                        {bullet}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </section>
            ))}

            {activeArticle.activityCheckin ? <ActivityCheckin /> : null}

            {activeArticle.callout && activeArticle.callout.tone === 'info' ? (
              <Callout {...activeArticle.callout} />
            ) : null}

            <p className="rounded-2xl bg-rose-mist/80 px-4 py-3 text-sm leading-relaxed text-muted">
              Reviewed by the FemAware clinical content team. Last reviewed this year. This guide
              is general education, not personalised medical advice.
            </p>
          </div>
        ) : null}
      </Modal>
    </SeniorPageShell>
  );
};

export default SeniorResourceLibrary;
