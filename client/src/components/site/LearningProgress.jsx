import { cn } from '../../lib/utils';

// Progress through a set of articles or lessons. Rewards reading, not disclosure.
const LearningProgress = ({ done, total, label = 'articles read', note, className }) => {
  const pct = total ? Math.round((done / total) * 100) : 0;
  return (
    <div className={cn('w-full', className)}>
      <div className="flex items-baseline justify-between gap-4">
        <p className="text-sm text-ink">
          <span className="font-display text-2xl text-deep-rose">{done}</span>
          <span className="text-muted"> of {total} {label}</span>
        </p>
        <p className="text-xs font-semibold text-muted">{pct}%</p>
      </div>
      <div
        className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-soft-petal"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={done}
        aria-label={`${done} of ${total} ${label}`}
      >
        <div className="h-full rounded-full bg-deep-rose transition-[width] duration-500" style={{ width: `${pct}%` }} />
      </div>
      {note ? <p className="mt-2 text-xs leading-relaxed text-muted">{note}</p> : null}
    </div>
  );
};

export default LearningProgress;
