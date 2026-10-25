import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { ButtonLink } from '../../components/ui/Button';
import { StageMotif } from '../../components/site/Illustrations';
import ArticlePreview from '../../components/site/ArticlePreview';
import { SITE_STAGES } from '../../data/stages';
import { LIBRARY } from '../../data/library';
import { cn } from '../../lib/utils';

const articlesFor = (stage) => {
  const own = LIBRARY.filter((article) => article.stage === stage);
  const shared = LIBRARY.filter((article) => article.stage === 'everyone');
  return [...own.slice(0, 2), ...shared].slice(0, 3);
};

const Explore = () => (
  <>
    <header className="border-b border-line bg-white">
      <div className="site-container py-14 sm:py-20">
        <p className="eyebrow">Explore health</p>
        <h1 className="mt-4 max-w-3xl font-display text-[2.5rem] leading-[1.06] text-ink sm:text-display-lg">
          Support shaped around where you are in life.
        </h1>
        <p className="lede mt-5 max-w-2xl">
          Start with the stage that fits you best, then wander freely. Ages are a guide, not a rule,
          and every article in the library is open to everyone.
        </p>
        <nav aria-label="Life stages" className="mt-10 flex flex-wrap gap-2">
          {SITE_STAGES.map((stage) => (
            <a key={stage.value} href={`#${stage.value}`} className="chip">
              {stage.title}
              <span className="text-muted">{stage.ages}</span>
            </a>
          ))}
        </nav>
      </div>
    </header>

    {SITE_STAGES.map((stage, index) => (
      <section
        key={stage.value}
        id={stage.value}
        aria-labelledby={`${stage.value}-heading`}
        className={cn('scroll-mt-20 border-b border-line py-14 sm:py-20', index % 2 === 1 ? 'bg-rose-mist' : 'bg-white')}
      >
        <div className="site-container grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
          <div>
            <StageMotif stage={stage.value} className="h-20 w-20" />
            <p className="mt-6 text-sm font-semibold text-deep-rose">
              {stage.theme} · usually {stage.ages}
            </p>
            <h2 id={`${stage.value}-heading`} className="mt-2 font-display text-[2.25rem] leading-tight text-ink sm:text-[2.75rem]">
              {stage.title}
            </h2>
            <p className="mt-4 text-[17px] leading-relaxed text-muted">{stage.description}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <ButtonLink to={`/start?stage=${stage.value}`} iconRight={ArrowRight}>
                Start here
              </ButtonLink>
              <Link to={`/library?stage=${stage.value}`} className="link text-sm sm:ml-3">
                All {stage.title.toLowerCase()} articles
              </Link>
            </div>
          </div>

          <div className="grid gap-10 sm:grid-cols-2">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">What you can do</h3>
              <ul className="mt-4 divide-y divide-line border-y border-line">
                {stage.tools.map((tool) => (
                  <li key={tool.label} className="flex items-start justify-between gap-4 py-3.5 text-[15px] text-ink">
                    {tool.label}
                    <span
                      className={cn(
                        'mt-0.5 shrink-0 rounded-md px-2 py-0.5 text-[11px] font-semibold',
                        tool.account ? 'bg-white text-muted ring-1 ring-line' : 'bg-soft-petal text-deep-rose'
                      )}
                    >
                      {tool.account ? 'Free account' : 'Open to all'}
                    </span>
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-xs leading-relaxed text-muted">
                Tracking tools need an account because they store your personal records.
              </p>
            </div>
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Start reading</h3>
              <div className="mt-4 space-y-6 border-t border-line pt-5">
                {articlesFor(stage.value).map((article) => (
                  <ArticlePreview key={article.id} article={article} variant="compact" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    ))}

    <section className="py-16 sm:py-20">
      <div className="site-container flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
        <div>
          <h2 className="font-display text-[1.75rem] leading-tight text-ink">Not sure where you fit?</h2>
          <p className="mt-2 text-[15px] text-muted">You can explore everything without choosing a stage.</p>
        </div>
        <ButtonLink to="/start?stage=everything" variant="secondary" iconRight={ArrowRight}>
          Explore everything
        </ButtonLink>
      </div>
    </section>
  </>
);

export default Explore;
