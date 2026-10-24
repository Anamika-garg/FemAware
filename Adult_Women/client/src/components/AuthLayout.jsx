import { Link } from 'react-router-dom';
import { HeartPulse, LockKeyhole, Sparkles, TrendingUp } from 'lucide-react';
import Logo from './Logo';

const features = [
  {
    icon: TrendingUp,
    title: 'Patterns, not guesses',
    description: 'Cycle averages, fertile windows and symptom trends built from your own logs.',
  },
  {
    icon: HeartPulse,
    title: 'Better appointments',
    description: 'A structured health summary you can print and bring to your clinician.',
  },
  {
    icon: LockKeyhole,
    title: 'Your data, contained',
    description: 'Export everything in one file or erase it completely — whenever you choose.',
  },
];

const CycleArt = () => (
  <div className="relative mx-auto h-64 w-64" aria-hidden="true">
    <div className="absolute inset-0 rounded-full border border-white/70" />
    <div className="absolute inset-6 rounded-full border border-deep-rose/15" />
    <div className="absolute inset-12 rounded-full border border-white/80" />
    <div className="absolute inset-0 animate-soft-pulse rounded-full bg-white/25 blur-2xl" />
    <div className="absolute inset-[3.4rem] grid place-items-center rounded-full bg-white/70 shadow-card backdrop-blur">
      <div className="text-center">
        <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-rose-pink">Today</p>
        <p className="font-display text-5xl font-semibold leading-none text-deep-rose">Day 13</p>
        <p className="mt-1 text-[10px] font-semibold text-muted">of a 29-day rhythm</p>
      </div>
    </div>
    <span className="absolute left-[4.5rem] top-1.5 h-3 w-3 rounded-full bg-deep-rose ring-4 ring-white/60" />
    <span className="absolute right-8 top-16 h-2.5 w-2.5 rounded-full bg-pink-glow ring-4 ring-white/60" />
    <span className="absolute bottom-8 right-14 h-2 w-2 rounded-full bg-rose-pink ring-4 ring-white/50" />
    <div className="absolute -right-2 bottom-20 rounded-2xl border border-white/80 bg-white/85 px-3 py-2 shadow-soft backdrop-blur">
      <p className="text-[9px] font-bold uppercase tracking-wide text-muted">Fertile window</p>
      <p className="text-xs font-bold text-deep-rose">22–28 Oct</p>
    </div>
    <div className="absolute -left-4 top-24 flex items-center gap-1.5 rounded-2xl border border-white/80 bg-white/85 px-3 py-2 shadow-soft backdrop-blur">
      <Sparkles className="h-3.5 w-3.5 text-pink-glow" />
      <p className="text-[11px] font-bold text-deep-rose">Ovulation near</p>
    </div>
  </div>
);

const AuthLayout = ({ children }) => (
  <div className="min-h-screen lg:grid lg:grid-cols-[1.08fr_1fr]">
    <section className="relative hidden overflow-hidden bg-hero-gradient lg:flex lg:flex-col lg:justify-between lg:p-10 xl:p-14">
      <div className="pointer-events-none absolute -left-24 -top-24 h-80 w-80 rounded-full bg-white/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-36 -right-20 h-96 w-96 rounded-full bg-pink-glow/20 blur-3xl" />

      <Link to="/" className="relative z-10 w-fit" aria-label="CycleSense home">
        <Logo />
      </Link>

      <div className="relative z-10 my-8 grid gap-10 xl:grid-cols-[1fr_0.9fr] xl:items-center">
        <div className="max-w-xl">
          <span className="badge bg-white/60 text-deep-rose">
            <Sparkles className="h-3.5 w-3.5" />
            Built for adult women
          </span>
          <h1 className="mt-5 font-display text-[2.9rem] font-semibold leading-[1.08] tracking-tight text-deep-rose xl:text-[3.4rem]">
            Your body has a rhythm.
            <br />
            Let&apos;s understand it together.
          </h1>
          <p className="mt-5 max-w-md text-[15px] leading-relaxed text-deep-rose/75">
            A calm, private space to track your cycle, connect symptoms to patterns, and walk into
            your next appointment better prepared.
          </p>
        </div>
        <div className="hidden xl:block">
          <CycleArt />
        </div>
      </div>

      <div className="relative z-10 grid gap-3 sm:grid-cols-3">
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <div
              key={feature.title}
              className="rounded-2xl border border-white/60 bg-white/45 p-4 backdrop-blur-sm"
            >
              <Icon className="h-4 w-4 text-deep-rose" aria-hidden="true" />
              <p className="mt-2 text-xs font-bold text-deep-rose">{feature.title}</p>
              <p className="mt-1 text-[11px] leading-relaxed text-deep-rose/65">
                {feature.description}
              </p>
            </div>
          );
        })}
      </div>

      <p className="relative z-10 mt-8 text-[10px] font-medium leading-relaxed text-deep-rose/60">
        CycleSense offers educational guidance, not medical diagnosis. For urgent concerns, contact
        a healthcare professional or local emergency service.
      </p>
    </section>

    <main className="flex min-h-screen items-center justify-center bg-rose-mist px-4 py-10 sm:px-8 lg:py-14">
      <div className="w-full max-w-[27rem]">
        <Link to="/" className="mb-8 flex justify-center lg:hidden" aria-label="CycleSense home">
          <Logo />
        </Link>
        {children}
      </div>
    </main>
  </div>
);

export default AuthLayout;
