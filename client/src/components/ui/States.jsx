import { AlertCircle, RefreshCw } from 'lucide-react';
import Button from './Button';
import { cn } from '../../lib/utils';

export const EmptyState = ({ icon: Icon, title, description, action, className }) => (
  <div
    className={cn(
      'flex flex-col items-center justify-center rounded-2xl border border-dashed border-blush-pink bg-white px-6 py-14 text-center',
      className
    )}
  >
    {Icon ? (
      <span className="mb-5 grid h-12 w-12 place-items-center rounded-full border border-blush-pink bg-rose-mist text-deep-rose">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
    ) : null}
    <h3 className="font-display text-2xl text-ink">{title}</h3>
    {description ? <p className="mt-2 max-w-md text-[15px] leading-relaxed text-muted">{description}</p> : null}
    {action ? <div className="mt-5">{action}</div> : null}
  </div>
);

export const ErrorState = ({ message = 'We could not load this right now.', onRetry, className }) => (
  <div
    className={cn(
      'flex flex-col items-start gap-4 rounded-xl border border-deep-rose/30 bg-rose-mist p-5 sm:flex-row sm:items-center sm:justify-between',
      className
    )}
    role="alert"
  >
    <div className="flex items-start gap-3">
      <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-deep-rose" aria-hidden="true" />
      <p className="text-sm text-ink">{message}</p>
    </div>
    {onRetry ? (
      <Button variant="secondary" size="sm" icon={RefreshCw} onClick={onRetry}>
        Try again
      </Button>
    ) : null}
  </div>
);

export const SkeletonBlock = ({ className }) => (
  <div className={cn('skeleton h-4 w-full', className)} aria-hidden="true" />
);

export const CardSkeleton = ({ rows = 3 }) => (
  <div className="card space-y-4 p-6" aria-label="Loading content">
    <SkeletonBlock className="h-5 w-1/3" />
    {Array.from({ length: rows }).map((_, index) => (
      <SkeletonBlock key={index} className={index === rows - 1 ? 'w-2/3' : 'w-full'} />
    ))}
  </div>
);

export default EmptyState;
