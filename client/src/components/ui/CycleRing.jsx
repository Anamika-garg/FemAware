const CycleRing = ({ day, total = 28, phaseLabel = 'cycle', className = '' }) => {
  const radius = 68;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.max(0.03, Math.min(Number(day) / Number(total) || 0, 1));
  const dash = circumference * progress;

  return (
    <div className={`relative ${className}`} aria-label={`Day ${day} of ${total}`}>
      <svg viewBox="0 0 160 160" className="h-full w-full -rotate-90" role="img" aria-hidden="true">
        <circle cx="80" cy="80" r={radius} fill="none" stroke="#FFE3EE" strokeWidth="8" />
        <circle
          cx="80"
          cy="80"
          r={radius}
          fill="none"
          stroke="#C2185B"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circumference - dash}`}
        />
              </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-deep-rose">Day</span>
        <span className="font-display text-[2.6rem] leading-none text-ink">
          {day ?? '—'}
        </span>
        <span className="mt-1 text-[11px] font-medium text-muted">of {total} · {phaseLabel}</span>
      </div>
    </div>
  );
};

export default CycleRing;
