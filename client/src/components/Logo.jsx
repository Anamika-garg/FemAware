import { cn } from '../lib/utils';

// Five petals arranged as a cycle; the filled petal marks "where you are now".
const PETAL = 'M16 15.2C12.6 12.6 12.4 7.4 16 3.6c3.6 3.8 3.4 9 0 11.6Z';

export const LogoMark = ({ className = 'h-7 w-7' }) => (
  <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
    {[0, 72, 144, 216, 288].map((angle, index) => (
      <path
        key={angle}
        d={PETAL}
        transform={`rotate(${angle} 16 16.6)`}
        fill={index === 0 ? '#C2185B' : '#FFD6E7'}
        stroke="#C2185B"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
    ))}
    <circle cx="16" cy="16.6" r="1.6" fill="#C2185B" />
  </svg>
);

const Logo = ({ className = '', showWordmark = true, compact = false }) => (
  <span className={cn('inline-flex items-center gap-2', className)}>
    <LogoMark className={compact ? 'h-7 w-7' : 'h-8 w-8'} />
    {showWordmark ? (
      <span
        className={cn(
          'font-display leading-none tracking-[-0.01em] text-ink',
          compact ? 'text-[1.3rem]' : 'text-[1.5rem]'
        )}
      >
        Fem<span className="text-deep-rose">Aware</span>
      </span>
    ) : null}
  </span>
);

export default Logo;
