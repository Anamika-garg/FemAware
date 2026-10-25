import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { ButtonLink } from '../../components/ui/Button';
import { LogoMark } from '../../components/Logo';

const IS = [
  'A place to learn how your body works, in plain language.',
  'Simple tools to record periods, symptoms and how you feel.',
  'Charts built only from the information you choose to enter.',
  'A printable summary to make appointments more focused.',
];

const IS_NOT = [
  'A diagnosis, or a substitute for a healthcare professional.',
  'A contraceptive method. Cycle predictions are estimates.',
  'An emergency service. In an emergency, call your local number.',
  'A place that needs your personal details to read an article.',
];

const About = () => (
  <>
    <header className="border-b border-line bg-white">
      <div className="site-container grid gap-10 py-14 sm:py-20 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <p className="eyebrow">About FemAware</p>
          <h1 className="mt-4 max-w-3xl font-display text-[2.5rem] leading-[1.06] text-ink sm:text-display-lg">
            Health information that respects you.
          </h1>
          <p className="lede mt-5 max-w-2xl">
            FemAware brings together health education, personal tracking and appointment preparation
            for women at every stage of life, from a first period to the years after menopause.
          </p>
        </div>
        <LogoMark className="hidden h-28 w-28 lg:block" />
      </div>
    </header>

    <section className="py-14 sm:py-20">
      <div className="site-container grid gap-12 lg:grid-cols-2 lg:gap-20">
        <div>
          <h2 className="font-display text-[2rem] leading-tight text-ink">What FemAware is</h2>
          <ul className="mt-6 divide-y divide-line border-y border-line">
            {IS.map((item) => (
              <li key={item} className="flex gap-3 py-4 text-[16px] leading-relaxed text-ink">
                <span className="mt-[11px] h-px w-3 shrink-0 bg-deep-rose" aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="font-display text-[2rem] leading-tight text-ink">What it is not</h2>
          <ul className="mt-6 divide-y divide-line border-y border-line">
            {IS_NOT.map((item) => (
              <li key={item} className="flex gap-3 py-4 text-[16px] leading-relaxed text-ink">
                <span className="mt-[11px] h-px w-3 shrink-0 bg-blush-pink" aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>

    <section aria-labelledby="content-heading" className="border-y border-line bg-rose-mist py-14 sm:py-20">
      <div className="site-container grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
        <h2 id="content-heading" className="font-display text-[2rem] leading-tight text-ink sm:text-[2.5rem]">
          How our content is made
        </h2>
        <div className="space-y-5 text-[17px] leading-relaxed text-ink/90">
          <p>
            Articles and guided checks are written from public health guidance, including the NHS, the
            American College of Obstetricians and Gynecologists and the World Health Organization.
            Where an article cites sources, they are listed on the page.
          </p>
          <p>
            Health guidance should be reviewed by qualified clinicians. Content that has not yet been
            reviewed says so clearly, and the guided symptom checks are built to refuse to show
            unreviewed guidance in production.
          </p>
          <p>
            Guided checks point out warning signs and suggest sensible next steps. They never give a
            diagnosis, and they always encourage a conversation with a professional when something
            is worrying you.
          </p>
        </div>
      </div>
    </section>

    <section id="privacy" aria-labelledby="privacy-heading" className="scroll-mt-20 py-14 sm:py-20">
      <div className="site-container grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
        <h2 id="privacy-heading" className="font-display text-[2rem] leading-tight text-ink sm:text-[2.5rem]">
          Your privacy
        </h2>
        <div>
          <dl className="divide-y divide-line border-y border-line">
            {[
              ['Reading is open', 'The library and symptom guide need no account and ask for no personal details.'],
              ['Starting preferences stay with you', 'If you tell us where you would like to start, that choice is kept in your browser only.'],
              ['Tracking is opt-in', 'Period, symptom and check-in records are stored only when you create an account and choose to log them.'],
              ['You stay in control', 'Export everything as one file or permanently delete your records at any time from Privacy & data.'],
            ].map(([title, text]) => (
              <div key={title} className="grid gap-1 py-5 sm:grid-cols-[14rem_1fr] sm:gap-6">
                <dt className="font-semibold text-ink">{title}</dt>
                <dd className="text-[15px] leading-relaxed text-muted">{text}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
            <ButtonLink to="/start" iconRight={ArrowRight}>
              Explore Your Health
            </ButtonLink>
            <Link to="/library" className="link text-sm sm:ml-3">
              Read the library first
            </Link>
          </div>
        </div>
      </div>
    </section>
  </>
);

export default About;
