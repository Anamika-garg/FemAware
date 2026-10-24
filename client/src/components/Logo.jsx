import { cn } from '../lib/utils';

const Logo = ({ className = '', showWordmark = true, compact = false }) => (
  <div className={cn('flex items-center gap-3', className)}>
    <span
      className={cn(
        'relative grid shrink-0 place-items-center rounded-2xl bg-pink-glow text-white shadow-glow',
        compact ? 'h-9 w-9' : 'h-11 w-11'
      )}
      aria-hidden="true"
    >
      <svg viewBox="0 0 32 32" fill="none" className={compact ? 'h-5 w-5' : 'h-6 w-6'}>
        <path
          d="M16 27.2c-.9 0-1.8-.3-2.5-1C8.6 21.8 4 17.9 4 11.9 4 7.6 7.3 4 11.3 4c1.7 0 3.4.7 4.7 1.9A7 7 0 0 1 20.7 4C24.7 4 28 7.6 28 11.9c0 6-4.6 9.9-9.5 14.3-.7.7-1.6 1-2.5 1Z"
          fill="currentColor"
          fillOpacity="0.25"
        />
        <path
          d="M11 15h2.2l1.3-3 2.2 6 1.5-3H21"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
    {showWordmark ? (
      <span className="leading-none">
        <span
          className={cn(
            'block font-display font-semibold tracking-tight text-deep-rose',
            compact ? 'text-lg' : 'text-xl'
          )}
        >
          CycleSense
        </span>
        <span className="mt-1 block text-[9px] font-bold uppercase tracking-[0.22em] text-rose-pink">
          Track · Understand
        </span>
      </span>
    ) : null}
  </div>
);

export default Logo;
