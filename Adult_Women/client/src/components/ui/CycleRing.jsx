import { useId } from 'react';

const CycleRing = ({ day, total = 28, phaseLabel = 'cycle', className = '' }) => {
  const gradientId = useId().replace(/:/g, '');
  const radius = 68;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.max(0.03, Math.min(Number(day) / Number(total) || 0, 1));
  const dash = circumference * progress;

  return (
    <div className={`relative ${className}`} aria-label={`Day ${day} of ${total}`}>
      <svg viewBox="0 0 160 160" className="h-full w-full -rotate-90" role="img" aria-hidden="true">
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F672A7" />
            <stop offset="100%" stopColor="#C2185B" />
          </linearGradient>
        </defs>
        <circle cx="80" cy="80" r={radius} fill="none" stroke="rgba(255,241,246,0.9)" strokeWidth="10" />
        <circle
          cx="80"
          cy="80"
          r={radius}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circumference - dash}`}
        />
        <circle cx="80" cy="80" r="51" fill="rgba(255,255,255,0.55)" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-rose-pink">Day</span>
        <span className="font-display text-[2.4rem] font-semibold leading-none text-deep-rose">
          {day ?? '—'}
        </span>
        <span className="mt-1 text-[10px] font-semibold text-muted">of {total} · {phaseLabel}</span>
      </div>
    </div>
  );
};

export default CycleRing;
