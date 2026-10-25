import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, LockKeyhole, Stethoscope } from 'lucide-react';
import { ButtonLink } from '../../components/ui/Button';
import { HeroIllustration } from '../../components/site/Illustrations';
import LifeStageSection from '../../components/site/LifeStageSection';
import SectionHeading from '../../components/site/SectionHeading';
import ArticlePreview from '../../components/site/ArticlePreview';
import { getArticle } from '../../data/library';
import { useAuth } from '../../context/AuthContext';

const FEATURED_ID = 'understanding-your-cycle';
const LEARN_IDS = [
  'pms-common-and-when-to-seek-help',
  'pcos-awareness',
  'consent-boundaries-body-safety',
  'menopause-changing-health-needs',
];

const STEPS = [
  {
    number: '01',
    title: 'Learn',
    text: 'Explore clear, sourced health education written for your stage of life.',
    link: { to: '/library', label: 'Open the library' },
  },
  {
    number: '02',
    title: 'Track',
    text: 'Record periods and symptoms, then see the patterns that are personal to you.',
    link: { to: '/start', label: 'Find your tools' },
  },
  {
    number: '03',
    title: 'Act',
    text: 'Understand sensible next steps and bring a clear summary to your healthcare professional.',
    link: { to: '/symptom-guide', label: 'Read the symptom guide' },
  },
];

const PRINCIPLES = [
  {
    icon: LockKeyhole,
    title: 'Private by default',
    text: 'Reading needs no account. If you choose to track, you can export or permanently delete your records at any time.',
  },
  {
    icon: BookOpen,
    title: 'Sourced, and honest about it',
    text: 'Articles cite public health sources such as the NHS, ACOG and WHO, and say plainly when content is still awaiting clinical review.',
  },
  {
    icon: Stethoscope,
    title: 'Made to support care, not replace it',
    text: 'FemAware never diagnoses. Guided checks highlight warning signs and suggest when to speak to a professional.',
  },
];

const Landing = () => {
  const { user } = useAuth();
  const featured = getArticle(FEATURED_ID);
  const articles = LEARN_IDS.map(getArticle).filter(Boolean);

  return (
    <>
      {/* Hero */}
      <section className="overflow-hidden border-b border-line bg-rose-mist">
        <div className="site-container grid items-center gap-12 py-12 sm:py-16 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:py-20">
          <div className="max-w-xl">
            <p className="eyebrow">Your health, your way</p>
            <h1 className="mt-5 font-display text-[2.75rem] leading-[1.04] tracking-[-0.02em] text-ink sm:text-display-lg lg:text-display-xl">
              Understand your body.{' '}
              <span className="italic text-deep-rose">Own your health.</span>
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-muted">
              FemAware helps you learn how your body works, keep track of how you feel, and know what
              to do next, from your first period to life after menopause.
            </p>
            <div className="mt-9 flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
              <ButtonLink
                to={user ? (user.onboardingComplete ? '/dashboard' : '/onboarding') : '/start'}
                size="lg"
                iconRight={ArrowRight}
              >
                {user ? 'Open your dashboard' : 'Explore Your Health'}
              </ButtonLink>
              <Link to="/library" className="link text-[15px]">
                Explore the Learning Library
              </Link>
            </div>
            <p className="mt-10 flex max-w-md items-start gap-3 border-t border-blush-pink/60 pt-5 text-sm leading-relaxed text-muted">
              <LockKeyhole className="mt-0.5 h-4 w-4 shrink-0 text-deep-rose" aria-hidden="true" />
              Education first. No account needed to read, and nothing here replaces informed care from
              a professional.
            </p>
          </div>

          <figure className="mx-auto w-full max-w-[300px] sm:max-w-[400px] lg:mr-0 lg:max-w-[440px]">
            <HeroIllustration className="h-auto w-full" />
            <figcaption className="mt-4 text-center font-display text-base italic text-muted">
              Every body keeps its own rhythm.
            </figcaption>
          </figure>
        </div>
      </section>

      <LifeStageSection />

      {/* Learn */}
      <section aria-labelledby="learn-heading" className="border-y border-line bg-rose-mist py-16 sm:py-20">
        <div className="site-container">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <SectionHeading
              id="learn-heading"
              eyebrow="The library"
              title="Good health starts with understanding."
            />
            <Link to="/library" className="link shrink-0 text-sm">
              Browse all articles
            </Link>
          </div>

          <div className="mt-12 grid gap-12 lg:grid-cols-[1fr_1fr] lg:gap-16">
            {featured ? <ArticlePreview article={featured} variant="feature" stacked /> : null}
            <div className="border-b border-line">
              {articles.map((article, index) => (
                <ArticlePreview key={article.id} article={article} index={index} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Learn → Track → Act */}
      <section aria-labelledby="how-heading" className="py-16 sm:py-20">
        <div className="site-container">
          <SectionHeading
            id="how-heading"
            eyebrow="How FemAware helps"
            title="From a question to a confident next step."
          />
          <ol className="relative mt-14 grid gap-10 md:grid-cols-3 md:gap-8">
            <span
              className="absolute left-[19px] top-10 bottom-10 w-px bg-blush-pink md:left-10 md:right-10 md:top-[19px] md:bottom-auto md:h-px md:w-auto"
              aria-hidden="true"
            />
            {STEPS.map((step) => (
              <li key={step.title} className="relative flex gap-5 md:block">
                <span className="relative z-10 grid h-10 w-10 shrink-0 place-items-center rounded-full border border-blush-pink bg-white text-xs font-semibold tracking-wider text-deep-rose">
                  {step.number}
                </span>
                <div className="md:mt-7 md:pr-6">
                  <h3 className="font-display text-[1.75rem] leading-tight text-ink">{step.title}</h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-muted">{step.text}</p>
                  <Link to={step.link.to} className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-deep-rose hover:underline">
                    {step.link.label}
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </Link>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Trust */}
      <section aria-labelledby="trust-heading" className="border-t border-line py-16 sm:py-20">
        <div className="site-container grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
          <div>
            <SectionHeading
              id="trust-heading"
              eyebrow="Our approach"
              title="Careful with your information, and with the facts."
              description="Health information should leave you calmer and better prepared, never more confused or alarmed."
            />
            <Link to="/about" className="link mt-6 inline-block text-sm">
              How FemAware works
            </Link>
          </div>
          <dl className="divide-y divide-line border-y border-line">
            {PRINCIPLES.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="grid gap-3 py-6 sm:grid-cols-[2.5rem_1fr]">
                  <dt className="contents">
                    <Icon className="mt-1 h-5 w-5 text-deep-rose" aria-hidden="true" />
                    <span className="text-lg font-semibold text-ink sm:col-start-2">{item.title}</span>
                  </dt>
                  <dd className="text-[15px] leading-relaxed text-muted sm:col-start-2">{item.text}</dd>
                </div>
              );
            })}
          </dl>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="pb-16 sm:pb-20">
        <div className="site-container">
          <div className="rounded-3xl bg-deep-rose px-6 py-14 text-center sm:px-12 sm:py-20">
            <h2 className="mx-auto max-w-2xl font-display text-[2.25rem] leading-[1.08] text-white sm:text-display-md">
              Your health deserves understanding.
            </h2>
            <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-white/85">
              Start with what you want to know. Two short questions, no account required.
            </p>
            <Link
              to="/start"
              className="btn btn-lg mt-8 bg-white text-deep-rose hover:bg-rose-mist focus-visible:ring-white focus-visible:ring-offset-deep-rose"
            >
              Start Exploring
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
};

export default Landing;
