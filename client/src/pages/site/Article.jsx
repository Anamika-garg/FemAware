import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Check, ExternalLink, Info, ShieldAlert } from 'lucide-react';
import ArticlePreview from '../../components/site/ArticlePreview';
import { EmptyState } from '../../components/ui/States';
import { ButtonLink } from '../../components/ui/Button';
import { LIBRARY, STAGE_LABELS, getArticle, getReadArticles, setArticleRead } from '../../data/library';
import { cn } from '../../lib/utils';

const Article = () => {
  const { id } = useParams();
  const article = getArticle(id);
  const [read, setRead] = useState(() => getReadArticles().includes(id));

  useEffect(() => {
    setRead(getReadArticles().includes(id));
    if (article) document.title = `${article.title} — FemAware`;
    return () => {
      document.title = 'FemAware — Understand your body. Own your health.';
    };
  }, [id, article]);

  if (!article) {
    return (
      <div className="site-container py-20">
        <EmptyState
          icon={Info}
          title="We couldn’t find that article"
          description="It may have moved or been renamed. The library has everything that is currently published."
          action={<ButtonLink to="/library">Back to the library</ButtonLink>}
        />
      </div>
    );
  }

  const related = LIBRARY.filter(
    (item) => item.id !== article.id && (item.topic === article.topic || item.stage === article.stage)
  ).slice(0, 3);

  const toggleRead = () => {
    const next = !read;
    setArticleRead(article.id, next);
    setRead(next);
  };

  return (
    <article>
      <header className="border-b border-line bg-rose-mist">
        <div className="site-container py-12 sm:py-16">
          <Link to="/library" className="inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-deep-rose">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Learning library
          </Link>
          <div className="mt-8 max-w-3xl">
            <p className="flex flex-wrap gap-x-2 text-xs font-semibold uppercase tracking-[0.14em] text-deep-rose">
              <span>{article.topic}</span>
              <span aria-hidden="true">·</span>
              <span>{STAGE_LABELS[article.stage]}</span>
            </p>
            <h1 className="mt-4 font-display text-[2.25rem] leading-[1.08] text-ink sm:text-display-md lg:text-display-lg">
              {article.title}
            </h1>
            <p className="lede mt-5">{article.summary}</p>
            <p className="mt-6 text-sm text-muted">{article.readTime} read</p>
          </div>
        </div>
      </header>

      <div className="site-container grid gap-12 py-12 sm:py-16 lg:grid-cols-[minmax(0,1fr)_280px] lg:gap-20">
        <div className="max-w-prose">
          <p className="text-[19px] leading-[1.7] text-ink first-letter:float-left first-letter:mr-2 first-letter:font-display first-letter:text-[3.6rem] first-letter:leading-[0.9] first-letter:text-deep-rose">
            {article.intro}
          </p>

          {article.sections.map((section) => (
            <section key={section.heading} className="mt-10">
              <h2 className="font-display text-[1.625rem] leading-snug text-ink">{section.heading}</h2>
              {section.paragraphs?.map((paragraph) => (
                <p key={paragraph.slice(0, 40)} className="mt-4 text-[17px] leading-[1.75] text-ink/90">
                  {paragraph}
                </p>
              ))}
              {section.bullets?.length ? (
                <ul className="mt-4 space-y-2.5">
                  {section.bullets.map((bullet) => (
                    <li key={bullet} className="flex gap-3 text-[17px] leading-relaxed text-ink/90">
                      <span className="mt-[13px] h-px w-3 shrink-0 bg-deep-rose" aria-hidden="true" />
                      {bullet}
                    </li>
                  ))}
                </ul>
              ) : null}
            </section>
          ))}

          {article.callout ? (
            <aside className="mt-10 flex gap-3 rounded-2xl border border-blush-pink bg-rose-mist p-5">
              <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-deep-rose" aria-hidden="true" />
              <div>
                <p className="font-semibold text-ink">{article.callout.title}</p>
                <p className="mt-1 text-[15px] leading-relaxed text-muted">{article.callout.text}</p>
              </div>
            </aside>
          ) : null}

          {article.takeaway ? (
            <blockquote className="mt-12 border-l-2 border-deep-rose pl-6">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-deep-rose">The takeaway</p>
              <p className="mt-2 font-display text-[1.5rem] leading-snug text-ink">{article.takeaway}</p>
            </blockquote>
          ) : null}

          <div className="mt-12 flex flex-col gap-4 border-t border-line pt-8 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={toggleRead}
              aria-pressed={read}
              className={cn(read ? 'btn-primary' : 'btn-secondary')}
            >
              <Check className={cn('h-4 w-4', read && 'animate-pop-in')} aria-hidden="true" />
              {read ? 'Marked as read' : 'Mark as read'}
            </button>
            <p className="text-xs text-muted">Reading progress stays in this browser.</p>
          </div>
        </div>

        <aside className="space-y-10 lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl border border-line p-5">
            <p className="text-sm font-semibold text-ink">About this information</p>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              {article.sources?.length
                ? 'Written from the public health sources below and awaiting review by a clinician. '
                : ''}
              This article is general education, not a diagnosis. If you are worried about a symptom,
              speak to a healthcare professional.
            </p>
            <Link to="/symptom-guide" className="link mt-3 inline-block text-sm">
              When to get help
            </Link>
          </div>

          {article.sources?.length ? (
            <div>
              <h2 className="eyebrow">Sources</h2>
              <ul className="mt-3 space-y-3">
                {article.sources.map((source) => (
                  <li key={source.url}>
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noreferrer"
                      className="group inline-flex gap-1.5 text-sm leading-snug text-ink hover:text-deep-rose"
                    >
                      <span>
                        {source.title}
                        <span className="block text-xs text-muted">{source.publisher}</span>
                      </span>
                      <ExternalLink className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted" aria-hidden="true" />
                      <span className="sr-only">(opens in a new tab)</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {related.length ? (
            <div>
              <h2 className="eyebrow">Keep reading</h2>
              <div className="mt-4 space-y-5">
                {related.map((item) => (
                  <ArticlePreview key={item.id} article={item} variant="compact" />
                ))}
              </div>
            </div>
          ) : null}
        </aside>
      </div>
    </article>
  );
};

export default Article;
