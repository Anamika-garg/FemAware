import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';
import { ArticleVignette } from './Illustrations';
import { STAGE_LABELS } from '../../data/library';
import { cn } from '../../lib/utils';

const Meta = ({ article, read }) => (
  <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-medium text-muted">
    <span className="font-semibold uppercase tracking-[0.12em] text-deep-rose">{article.topic}</span>
    <span aria-hidden="true">·</span>
    <span>{STAGE_LABELS[article.stage]}</span>
    <span aria-hidden="true">·</span>
    <span>{article.readTime} read</span>
    {read ? (
      <span className="inline-flex items-center gap-1 text-deep-rose">
        <span aria-hidden="true">·</span>
        <Check className="h-3.5 w-3.5" aria-hidden="true" />
        Read
      </span>
    ) : null}
  </p>
);

// variant: "feature" (large with vignette), "row" (editorial list row), "compact".
// `stacked` puts the vignette above the text for narrower columns.
const ArticlePreview = ({ article, variant = 'row', read = false, index, stacked = false, className }) => {
  const href = `/library/${article.id}`;

  if (variant === 'feature') {
    return (
      <article
        className={cn(
          'group grid gap-6',
          !stacked && 'sm:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] sm:items-center sm:gap-10',
          className
        )}
      >
        <ArticleVignette
          stage={article.stage}
          className={stacked ? 'aspect-[2/1] w-full max-w-md' : 'aspect-[4/5] w-full max-w-[240px]'}
        />
        <div>
          <Meta article={article} read={read} />
          <h3 className="mt-3 font-display text-[1.75rem] leading-[1.15] text-ink sm:text-[2rem]">
            <Link to={href} className="decoration-blush-pink decoration-2 underline-offset-[6px] group-hover:underline">
              {article.title}
            </Link>
          </h3>
          <p className="mt-3 text-[15px] leading-relaxed text-muted">{article.summary}</p>
        </div>
      </article>
    );
  }

  if (variant === 'compact') {
    return (
      <article className={cn('group', className)}>
        <Meta article={article} read={read} />
        <h3 className="mt-2 text-base font-semibold leading-snug text-ink">
          <Link to={href} className="decoration-blush-pink decoration-2 underline-offset-4 group-hover:text-deep-rose">
            {article.title}
          </Link>
        </h3>
      </article>
    );
  }

  return (
    <article className={cn('group flex gap-5 border-t border-line py-6', className)}>
      {typeof index === 'number' ? (
        <span className="w-8 shrink-0 font-display text-xl leading-none text-rose-pink" aria-hidden="true">
          {String(index + 1).padStart(2, '0')}
        </span>
      ) : null}
      <div className="min-w-0">
        <Meta article={article} read={read} />
        <h3 className="mt-2 font-display text-[1.375rem] leading-snug text-ink">
          <Link to={href} className="decoration-blush-pink decoration-2 underline-offset-4 group-hover:underline">
            {article.title}
          </Link>
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-muted">{article.summary}</p>
      </div>
    </article>
  );
};

export default ArticlePreview;
