import { cn } from '../../lib/utils';

const TONES = {
  rose: 'bg-soft-petal text-deep-rose',
  pink: 'bg-blush-pink/80 text-deep-rose',
  glow: 'bg-pink-glow text-white',
  outline: 'border border-blush-pink bg-white/70 text-deep-rose',
  calm: 'bg-[#E8F5EE] text-[#227054]',
  warn: 'bg-[#FFF0E0] text-[#9A4E12]',
  neutral: 'bg-white/70 text-muted',
};

const Badge = ({ tone = 'rose', className, children, icon: Icon }) => (
  <span className={cn('badge', TONES[tone] || TONES.rose, className)}>
    {Icon ? <Icon className="h-3.5 w-3.5" aria-hidden="true" /> : null}
    {children}
  </span>
);

export default Badge;
