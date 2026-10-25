import { Link } from 'react-router-dom';
import { ArrowRight, ChevronDown, Phone } from 'lucide-react';
import { ButtonLink } from '../../components/ui/Button';
import { getArticle } from '../../data/library';
import { useAuth } from '../../context/AuthContext';

const URGENT_SIGNS = [
  'Fainting or nearly fainting.',
  'Soaking through a pad or tampon every hour for more than two hours.',
  'Sudden, severe pain in the belly or pelvis that is different from usual cramps.',
  'Fever together with belly or pelvic pain, or signs of toxic shock syndrome while using a tampon.',
  'Severe pain when pregnancy is possible.',
  'Chest pain, sudden breathlessness, or weakness on one side of the face or body.',
  'Thoughts of harming yourself.',
];

const CONCERNS = [
  {
    title: 'Period pain',
    common: 'Cramping in the lower belly or back in the first days of a period that eases with heat, gentle movement or pain relief.',
    talk: 'Pain stops you from going to school or work, does not improve with usual care, happens outside your period, or keeps getting worse.',
    articles: ['pms-common-and-when-to-seek-help', 'understanding-your-cycle'],
  },
  {
    title: 'Irregular or late periods',
    common: 'Variation of a few days each month, irregular cycles in the first two years after a first period, or changes during perimenopause.',
    talk: 'No period for three months, cycles shorter than 21 or longer than 45 days that persist, or new hair growth or acne alongside irregular periods.',
    articles: ['understanding-your-cycle', 'pcos-awareness'],
    tool: { to: '/late-period', label: 'Late period guide' },
  },
  {
    title: 'Heavy bleeding',
    common: 'Heavier days at the start of a period that settle within a few days.',
    talk: 'Changing protection every one to two hours, passing large clots, bleeding longer than seven days, or feeling tired and breathless.',
    articles: ['understanding-your-cycle', 'midlife-bleeding'],
  },
  {
    title: 'Mood changes before a period',
    common: 'Some irritability, low mood or tiredness in the days before bleeding that lifts once a period starts.',
    talk: 'Symptoms affect relationships, work or school, or low mood and anxiety feel severe each month.',
    articles: ['pms-common-and-when-to-seek-help'],
  },
  {
    title: 'Bleeding after menopause',
    common: 'Bleeding after 12 months without a period is not expected.',
    talk: 'Always book an appointment promptly, even if the bleeding is light or stops. Most causes are not serious, but it should be checked.',
    articles: ['understanding-postmenopause', 'menopause-changing-health-needs'],
  },
  {
    title: 'Hot flushes, sleep and menopause symptoms',
    common: 'Hot flushes, night sweats and broken sleep around and after menopause.',
    talk: 'Symptoms affect your sleep, mood, work or relationships. There are effective treatments to discuss.',
    articles: ['hot-flushes-sleep', 'understanding-postmenopause'],
  },
  {
    title: 'Intimate and urinary discomfort',
    common: 'Some dryness, or needing to pass urine more often, especially after menopause.',
    talk: 'Pain during sex, burning when passing urine, blood in urine, unusual discharge, or leaking that affects daily life.',
    articles: ['intimate-urinary-health', 'vaginal-ph'],
  },
];

const ASSESSMENT_STEPS = [
  { title: 'Answer one question at a time', text: 'About what you are noticing, how long it has lasted and how it affects you.' },
  { title: 'Review your answers', text: 'See a short summary before anything is shown, and change answers if you need to.' },
  { title: 'Read the guidance', text: 'Educational information, any warning signs, and a suggested next step.' },
  { title: 'Keep only what helps', text: 'Just the check type, date and result level are saved, never your answers.' },
];

const SymptomGuide = () => {
  const { user } = useAuth();

  return (
    <>
      <header className="border-b border-line bg-white">
        <div className="site-container py-14 sm:py-20">
          <p className="eyebrow">Symptom guide</p>
          <h1 className="mt-4 max-w-3xl font-display text-[2.5rem] leading-[1.06] text-ink sm:text-display-lg">
            Know what’s common, and when to get help.
          </h1>
          <p className="lede mt-5 max-w-2xl">
            General information about symptoms many women notice. It cannot tell you what is causing
            yours. Only a healthcare professional can do that.
          </p>
        </div>
      </header>

      <section aria-labelledby="urgent-heading" className="bg-white">
        <div className="site-container py-12">
          <div className="grid gap-8 rounded-3xl border-2 border-deep-rose p-6 sm:p-10 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <p className="inline-flex items-center gap-2 text-sm font-semibold text-deep-rose">
                <Phone className="h-4 w-4" aria-hidden="true" />
                Get help now
              </p>
              <h2 id="urgent-heading" className="mt-3 font-display text-[1.75rem] leading-tight text-ink sm:text-[2rem]">
                Some symptoms need urgent care.
              </h2>
              <p className="mt-3 text-[15px] leading-relaxed text-muted">
                Call your local emergency number (for example 911 in the US, 999 in the UK, or 112 in the
                EU and India) or go to the nearest emergency department if you notice any of these.
              </p>
            </div>
            <ul className="divide-y divide-line border-y border-line">
              {URGENT_SIGNS.map((sign) => (
                <li key={sign} className="flex gap-3 py-3 text-[15px] leading-relaxed text-ink">
                  <span className="mt-[11px] h-1.5 w-1.5 shrink-0 rounded-full bg-deep-rose" aria-hidden="true" />
                  {sign}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section aria-labelledby="concerns-heading" className="py-14 sm:py-20">
        <div className="site-container grid gap-10 lg:grid-cols-[0.7fr_1.3fr] lg:gap-16">
          <div>
            <h2 id="concerns-heading" className="font-display text-[2rem] leading-tight text-ink">
              Common concerns
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed text-muted">
              Choose a topic to see what is often common, what is worth discussing with a professional,
              and where to read more.
            </p>
          </div>
          <div className="border-t border-line">
            {CONCERNS.map((concern) => (
              <details key={concern.title} className="group border-b border-line">
                <summary className="flex min-h-[64px] cursor-pointer list-none items-center justify-between gap-4 py-4 text-lg font-semibold text-ink transition-colors hover:text-deep-rose [&::-webkit-details-marker]:hidden">
                  {concern.title}
                  <ChevronDown className="h-5 w-5 shrink-0 text-deep-rose transition-transform group-open:rotate-180" aria-hidden="true" />
                </summary>
                <div className="grid gap-6 pb-8 pt-1 sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Often common</p>
                    <p className="mt-2 text-[15px] leading-relaxed text-ink">{concern.common}</p>
                  </div>
                  <div className="rounded-xl bg-rose-mist p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-deep-rose">Talk to a professional if</p>
                    <p className="mt-2 text-[15px] leading-relaxed text-ink">{concern.talk}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-2 sm:col-span-2">
                    {concern.articles
                      .map(getArticle)
                      .filter(Boolean)
                      .map((article) => (
                        <Link key={article.id} to={`/library/${article.id}`} className="link text-sm font-medium">
                          {article.title}
                        </Link>
                      ))}
                    {concern.tool ? (
                      <Link
                        to={user ? concern.tool.to : '/register'}
                        className="inline-flex items-center gap-1.5 text-sm font-semibold text-deep-rose hover:underline"
                      >
                        {concern.tool.label}
                        {!user ? <span className="font-normal text-muted">(free account)</span> : null}
                        <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                      </Link>
                    ) : null}
                  </div>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section aria-labelledby="assessment-heading" className="border-t border-line bg-rose-mist py-14 sm:py-20">
        <div className="site-container">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div className="max-w-2xl">
              <p className="eyebrow">Guided assessment</p>
              <h2 id="assessment-heading" className="mt-3 font-display text-[2rem] leading-tight text-ink sm:text-[2.5rem]">
                A calm, step-by-step check.
              </h2>
              <p className="mt-3 text-[15px] leading-relaxed text-muted">
                Guided checks for period pain, irregular periods and late periods are available with a
                free account, next to your own logs. They never give a diagnosis.
              </p>
            </div>
            <ButtonLink to={user ? '/check' : '/register'} iconRight={ArrowRight} className="shrink-0">
              {user ? 'Start a guided check' : 'Create a free account'}
            </ButtonLink>
          </div>
          <ol className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {ASSESSMENT_STEPS.map((step, index) => (
              <li key={step.title} className="border-t border-deep-rose/40 pt-5">
                <span className="font-display text-xl text-deep-rose">{index + 1}</span>
                <h3 className="mt-2 font-semibold text-ink">{step.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted">{step.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </>
  );
};

export default SymptomGuide;
