// Hand-built botanical illustrations. They reuse the logo petal so the brand
// reads as one system: petals for the cycle, a stem for growth over a lifetime.
const DEEP = '#C2185B';
const PETAL_FILL = '#FFD6E7';
const BLUSH = '#F8BBD0';
const PETAL = 'M16 15.2C12.6 12.6 12.4 7.4 16 3.6c3.6 3.8 3.4 9 0 11.6Z';

const Bloom = ({ cx, cy, scale = 1, count = 5, filled = [0], fill = '#FFFFFF' }) => (
  <g transform={`translate(${cx} ${cy}) scale(${scale}) translate(-16 -16.6)`}>
    {Array.from({ length: count }).map((_, index) => (
      <path
        key={index}
        d={PETAL}
        transform={`rotate(${(360 / count) * index} 16 16.6)`}
        fill={filled.includes(index) ? DEEP : fill}
        stroke={DEEP}
        strokeWidth="1.4"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    ))}
    <circle cx="16" cy="16.6" r="1.5" fill={DEEP} />
  </g>
);

const CycleDots = ({ cx, cy, r, days = 28, period = 5, marker = 14, dot = 4 }) => (
  <g>
    {Array.from({ length: days }).map((_, index) => {
      const angle = (index / days) * Math.PI * 2 - Math.PI / 2;
      const x = cx + r * Math.cos(angle);
      const y = cy + r * Math.sin(angle);
      if (index < period) return <circle key={index} cx={x} cy={y} r={dot + 1} fill={DEEP} />;
      if (index === marker - 1) {
        return (
          <g key={index}>
            <circle cx={x} cy={y} r={dot + 4} fill="none" stroke={DEEP} strokeWidth="1.4" />
            <circle cx={x} cy={y} r={dot - 1} fill={DEEP} />
          </g>
        );
      }
      return <circle key={index} cx={x} cy={y} r={dot} fill="#FFFFFF" stroke={BLUSH} strokeWidth="1.4" />;
    })}
  </g>
);

const Leaf = ({ d, rib, fill = PETAL_FILL }) => (
  <g>
    <path d={d} fill={fill} stroke={DEEP} strokeWidth="1.6" strokeLinejoin="round" />
    <path d={rib} fill="none" stroke={DEEP} strokeWidth="1.1" strokeLinecap="round" opacity="0.6" />
  </g>
);

export const HeroIllustration = ({ className }) => (
  <svg viewBox="0 0 480 580" className={className} role="img" aria-labelledby="hero-art-title">
    <title id="hero-art-title">
      A flower growing inside a ring of 28 dots, one for each day of a cycle
    </title>
    {/* Offset frame, like a print mount */}
    <path d="M58 572V250a192 192 0 0 1 384 0v322Z" fill={PETAL_FILL} />
    {/* Arch */}
    <path d="M40 556V236a190 190 0 0 1 380 0v320Z" fill="#FFFFFF" />
    <CycleDots cx={230} cy={262} r={148} dot={4.5} />
    {/* Stem and leaves */}
    <path d="M230 556C222 476 242 392 230 300" fill="none" stroke={DEEP} strokeWidth="1.8" strokeLinecap="round" />
    <Leaf d="M228 470c-34-10-56-38-62-74 34 6 58 34 62 74Z" rib="M228 470c-18-22-34-44-58-70" />
    <Leaf d="M234 408c32-10 54-36 60-72-34 6-56 32-60 72Z" rib="M234 408c16-20 32-42 56-68" />
    <Leaf d="M226 528c-24-4-42-20-50-44 24 2 44 18 50 44Z" rib="M226 528c-12-14-26-28-46-42" />
    <Bloom cx={230} cy={262} scale={4.4} filled={[0]} fill={PETAL_FILL} />
    {/* Day labels on the ring */}
    <text x="230" y="96" textAnchor="middle" fontFamily="DM Sans, sans-serif" fontSize="11" fontWeight="600" letterSpacing="1.5" fill={DEEP}>
      DAY 1
    </text>
  </svg>
);

export const TeenMotif = ({ className = 'h-16 w-16' }) => (
  <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
    <path d="M32 60V28" stroke={DEEP} strokeWidth="1.6" strokeLinecap="round" />
    <path d="M32 46c-9-1-15-7-16-15 9 1 15 7 16 15Z" fill={PETAL_FILL} stroke={DEEP} strokeWidth="1.4" strokeLinejoin="round" />
    <path d="M32 40c8-1 13-6 14-13-8 1-13 6-14 13Z" fill="#FFFFFF" stroke={DEEP} strokeWidth="1.4" strokeLinejoin="round" />
    <path d="M32 28c-5-3-6-11 0-18 6 7 5 15 0 18Z" fill={DEEP} />
  </svg>
);

export const AdultMotif = ({ className = 'h-16 w-16' }) => (
  <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
    <CycleDots cx={32} cy={32} r={24} dot={1.9} marker={14} />
    <Bloom cx={32} cy={32} scale={0.95} filled={[0]} fill={PETAL_FILL} />
  </svg>
);

export const SeniorMotif = ({ className = 'h-16 w-16' }) => (
  <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
    <path d="M32 62V40" stroke={DEEP} strokeWidth="1.6" strokeLinecap="round" />
    <path d="M32 56c8-1 13-6 14-13-8 1-13 6-14 13Z" fill="#FFFFFF" stroke={DEEP} strokeWidth="1.4" strokeLinejoin="round" />
    <Bloom cx={32} cy={26} scale={1.45} count={8} filled={[0, 4]} fill={PETAL_FILL} />
  </svg>
);

export const StageMotif = ({ stage, className }) => {
  if (stage === 'teen') return <TeenMotif className={className} />;
  if (stage === 'senior') return <SeniorMotif className={className} />;
  return <AdultMotif className={className} />;
};

// A small framed vignette for featured articles.
export const ArticleVignette = ({ stage = 'adult', className }) => (
  <div className={className}>
    <div className="grid h-full w-full place-items-center rounded-t-[999px] border border-blush-pink bg-white">
      <StageMotif stage={stage === 'everyone' ? 'adult' : stage} className="h-3/5 max-h-48 w-3/5" />
    </div>
  </div>
);
