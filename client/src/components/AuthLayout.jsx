import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Logo from './Logo';
import { HeroIllustration } from './site/Illustrations';

const POINTS = [
  'Your logs build patterns that are personal to you.',
  'A printable summary helps appointments stay focused.',
  'Export or permanently delete your records whenever you choose.',
];

const AuthLayout = ({ children }) => (
  <div className="min-h-screen bg-white lg:grid lg:grid-cols-[1fr_1fr]">
    <section className="relative hidden flex-col justify-between border-r border-line bg-rose-mist p-10 lg:flex xl:p-14">
      <Link to="/" className="w-fit rounded-md" aria-label="FemAware home">
        <Logo />
      </Link>

      <div className="grid items-center gap-10 xl:grid-cols-[1fr_200px]">
        <div className="max-w-md">
          <p className="eyebrow">Your health, your way</p>
          <h1 className="mt-4 font-display text-[2.75rem] leading-[1.05] text-ink">
            Understand your body.{' '}
            <span className="italic text-deep-rose">Own your health.</span>
          </h1>
          <ul className="mt-8 space-y-3 border-t border-line pt-6">
            {POINTS.map((point) => (
              <li key={point} className="flex gap-3 text-[15px] leading-relaxed text-ink/85">
                <span className="mt-[11px] h-px w-3 shrink-0 bg-deep-rose" aria-hidden="true" />
                {point}
              </li>
            ))}
          </ul>
        </div>
        <HeroIllustration className="hidden h-auto w-full xl:block" />
      </div>

      <p className="max-w-lg text-xs leading-relaxed text-muted">
        FemAware offers educational guidance, not medical diagnosis. For urgent concerns, contact a
        healthcare professional or your local emergency service.
      </p>
    </section>

    <main id="main-content" className="flex min-h-screen flex-col px-4 py-6 sm:px-8 lg:py-10">
      <div className="flex items-center justify-between">
        <Link to="/" className="rounded-md lg:hidden" aria-label="FemAware home">
          <Logo compact />
        </Link>
        <Link
          to="/"
          className="ml-auto inline-flex items-center gap-1.5 text-sm font-medium text-muted transition-colors hover:text-deep-rose"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to site
        </Link>
      </div>
      <div className="flex flex-1 items-center justify-center py-10">
        <div className="w-full max-w-[26rem]">{children}</div>
      </div>
    </main>
  </div>
);

export default AuthLayout;
