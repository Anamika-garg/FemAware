import {
  BarChart3,
  BookHeart,
  CalendarHeart,
  ClipboardList,
  HandHeart,
  Lock,
  NotebookPen,
  ShieldCheck,
  Stethoscope,
  Trophy,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { LinkButton } from '../components/ui';
import { useSession } from '../context/SessionContext';

const FEATURES = [
  { icon: BookHeart, title: 'Bite-sized lessons', text: 'Short, friendly lessons on cycles, puberty, hygiene and consent — with quizzes, XP and badges.', to: '/learn' },
  { icon: CalendarHeart, title: 'Period calendar', text: 'Log your period, see your cycle at a glance, and get an estimate of when the next one is due.', to: '/calendar' },
  { icon: NotebookPen, title: 'Symptom diary', text: 'Track cramps, moods, headaches and more, with how strong they felt.', to: '/symptoms' },
  { icon: ClipboardList, title: 'Guided symptom check', text: 'Answer a few questions about cramps or late periods and get clear next steps — never a diagnosis.', to: '/check' },
  { icon: BarChart3, title: 'Health insights', text: 'Charts of your cycle and symptoms, plus a summary you can take to a doctor.', to: '/insights' },
  { icon: HandHeart, title: 'Body safety & consent', text: 'Know your rights, your boundaries, and who you can talk to.', to: '/safety' },
];

const CHECKPOINTS = [
  { icon: Stethoscope, title: 'Closing diagnosis gaps', text: 'Guided checks help you notice when symptoms are worth a doctor’s visit — without diagnosing.' },
  { icon: NotebookPen, title: 'Symptom tracking', text: 'A private diary of cycles and symptoms builds a real picture over time.' },
  { icon: BookHeart, title: 'Health awareness', text: 'Gamified lessons make reproductive health knowledge stick.' },
  { icon: BarChart3, title: 'Meaningful clinical insights', text: 'Cycle stats and flags you can share with a clinician, in plain language.' },
];

export default function Landing() {
  const { status } = useSession();
  const started = status === 'active';

  return (
    <div className="-mx-4 -mt-8 sm:-mt-10">
      <section className="bg-hero px-4 pb-16 pt-14 sm:pt-20">
        <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[1.2fr_1fr]">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-sm font-bold shadow-soft">
              <Lock aria-hidden className="size-4" /> No account. No judgement.
            </p>
            <h1 className="mt-5 text-4xl font-black leading-tight tracking-tight sm:text-6xl">
              Know your body.
              <br />
              <span className="text-rose">Own your health.</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg text-deep/85">
              FemAware helps teens understand periods, puberty, and body safety — with a cycle tracker, symptom diary, guided
              symptom checks, and lessons that actually feel fun.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <LinkButton to={started ? '/dashboard' : '/onboarding'} size="lg">
                {started ? 'Go to my dashboard' : 'Get started'}
              </LinkButton>
              <LinkButton to="/learn" size="lg" variant="secondary">
                Explore lessons
              </LinkButton>
            </div>
          </div>
          <HeroArt />
        </div>
      </section>

      <section aria-labelledby="features" className="px-4 py-16">
        <div className="mx-auto max-w-6xl">
          <h2 id="features" className="text-3xl font-black tracking-tight">Everything in one gentle place</h2>
          <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map(({ icon: Icon, title, text, to }) => (
              <li key={title}>
                <Link to={to} className="card block h-full p-6 transition-transform hover:-translate-y-1">
                  <span className="grid size-12 place-items-center rounded-2xl bg-petal">
                    <Icon aria-hidden className="size-6" />
                  </span>
                  <h3 className="mt-4 text-lg font-black">{title}</h3>
                  <p className="mt-1 text-deep/80">{text}</p>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section aria-labelledby="checkpoints" className="bg-white px-4 py-16">
        <div className="mx-auto max-w-6xl">
          <h2 id="checkpoints" className="text-3xl font-black tracking-tight">Built around four goals</h2>
          <ol className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {CHECKPOINTS.map(({ icon: Icon, title, text }, i) => (
              <li key={title} className="rounded-3xl bg-mist p-6">
                <span className="text-sm font-black text-rose">0{i + 1}</span>
                <Icon aria-hidden className="mt-2 size-7" />
                <h3 className="mt-3 font-black">{title}</h3>
                <p className="mt-1 text-sm text-deep/80">{text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="px-4 py-16">
        <div className="mx-auto flex max-w-4xl flex-col items-center gap-4 rounded-blob bg-deep p-10 text-center text-white">
          <ShieldCheck aria-hidden className="size-10 text-petal" />
          <h2 className="text-2xl font-black sm:text-3xl">Private by design</h2>
          <p className="max-w-2xl text-petal">
            This first version runs on demo data. There’s no sign-up, your onboarding answers stay on your device, and you can
            delete everything with one tap. FemAware is educational and never diagnoses.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <LinkButton to="/privacy" variant="soft">
              How we handle data
            </LinkButton>
            <LinkButton to="/disclaimer" variant="secondary">
              Health disclaimer
            </LinkButton>
          </div>
        </div>
      </section>

      <section className="px-4 pb-6 text-center">
        <Trophy aria-hidden className="mx-auto size-6 text-glow" />
        <p className="mt-2 font-bold">Finish lessons to earn XP and unlock badges.</p>
      </section>
    </div>
  );
}

function HeroArt() {
  // Decorative cycle ring illustration.
  const days = Array.from({ length: 28 }, (_, i) => i);
  return (
    <div aria-hidden className="relative mx-auto aspect-square w-full max-w-sm">
      <svg viewBox="0 0 200 200" className="size-full drop-shadow-xl">
        <circle cx="100" cy="100" r="92" fill="var(--color-white)" />
        {days.map((d) => {
          const angle = (d / 28) * Math.PI * 2 - Math.PI / 2;
          const fill = d < 5 ? 'var(--color-deep)' : d >= 12 && d <= 15 ? 'var(--color-glow)' : 'var(--color-petal)';
          return <circle key={d} cx={100 + Math.cos(angle) * 72} cy={100 + Math.sin(angle) * 72} r="7" fill={fill} />;
        })}
        <text x="100" y="94" textAnchor="middle" fontSize="13" fontWeight="800" fill="var(--color-rose)">
          DAY
        </text>
        <text x="100" y="125" textAnchor="middle" fontSize="38" fontWeight="900" fill="var(--color-deep)">
          14
        </text>
      </svg>
    </div>
  );
}
