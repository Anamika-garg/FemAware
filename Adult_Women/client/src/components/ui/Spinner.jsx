import { cn } from '../../lib/utils';

const Spinner = ({ className = 'h-6 w-6', label = 'Loading' }) => (
  <span className="inline-flex items-center justify-center" role="status">
    <span
      className={cn(
        'animate-spin rounded-full border-2 border-blush-pink border-t-pink-glow',
        className
      )}
      aria-hidden="true"
    />
    <span className="sr-only">{label}</span>
  </span>
);

export default Spinner;
