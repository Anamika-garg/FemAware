import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CalendarClock,
  Check,
  ClipboardList,
  Droplets,
  HeartHandshake,
  HeartPulse,
  Info,
  Lock,
  Moon,
  RotateCcw,
  ShieldAlert,
  Sparkles,
  Stethoscope,
  Thermometer,
  Wind,
} from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { cn } from '../lib/utils';
import { useAuth } from '../context/AuthContext';

const LATENESS = [
  { value: 'under3', label: 'A few days (1–3)', helper: 'Within the range many cycles vary.' },
  { value: '4to7', label: '4–7 days', helper: 'Worth a test if pregnancy is possible.' },
  { value: '8to14', label: '8–14 days', helper: 'A clinician conversation is reasonable.' },
  { value: 'over14', label: 'More than 2 weeks', helper: 'Book a review, especially if recurrent.' },
  { value: 'unsure', label: "I'm not sure", helper: 'Track from today and note your last period.' },
];

const PREGNANCY = [
  { value: 'yes', label: 'Yes, it is possible' },
  { value: 'no', label: 'No, it is not possible' },
  { value: 'unsure', label: "I'm not sure" },
];

const TESTS = [
  { value: 'positive', label: 'Positive' },
  { value: 'negative', label: 'Negative' },
  { value: 'not-taken', label: 'Not taken yet' },
  { value: 'na', label: 'Not applicable' },
];

const FACTORS = [
  'High stress',
  'Travel or time-zone change',
  'Illness or fever',
  'Big change in sleep',
  'Intense exercise',
  'Weight change',
  'New medication',
  'Started/stopped hormonal contraception',
  'Life transition or grief',
  'None of these',
];

const SYMPTOMS = [
  'Severe pelvic or abdominal pain',
  'Dizziness or fainting',
  'Shoulder-tip pain',
  'Fever',
  'Very heavy bleeding',
  'Unusual discharge or odour',
  'Pain during sex',
  'Hot flushes',
  'Mild cramps only',
  'None of these',
];

const steps = [
  { key: 'lateness', question: 'How late is your period?', hint: 'Count from the first day you expected it to start.' },
  { key: 'pregnancy', question: 'Could you be pregnant?', hint: 'This helps us choose safer, more useful guidance.' },
  { key: 'test', question: 'Have you taken a pregnancy test?', hint: 'A test is most reliable after a missed period.' },
  { key: 'factors', question: 'Has anything changed recently?', hint: 'Select everything that applies. These are common, non-pregnancy reasons for a late period.' },
  { key: 'symptoms', question: 'Are you experiencing any of these?', hint: 'Some symptoms need attention sooner rather than later.' },
];

const OPTION_BUTTON = (selected) =>
  cn(
    'flex items-start gap-2.5 rounded-xl border p-3 text-left transition-all',
    selected
      ? 'border-deep-rose bg-soft-petal/65 shadow-soft'
      : 'border-blush-pink/70 bg-white hover:border-pink-glow/60 hover:bg-rose-mist/50'
  );

const LatePeriodNavigator = () => {
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({
    lateness: '',
    pregnancy: '',
    test: '',
    factors: [],
    symptoms: [],
  });
  const [error, setError] = useState('');
  const [showResult, setShowResult] = useState(false);

  const setSingle = (key, value) => {
    setAnswers((current) => ({ ...current, [key]: value }));
    setError('');
  };

  const toggleMulti = (key, value) => {
    setAnswers((current) => {
      const currentValues = current[key];
      if (value === 'None of these') {
        return { ...current, [key]: currentValues.includes(value) ? [] : [value] };
      }
      const withoutNone = currentValues.filter((item) => item !== 'None of these');
      return {
        ...current,
        [key]: withoutNone.includes(value)
          ? withoutNone.filter((item) => item !== value)
          : [...withoutNone, value],
      };
    });
    setError('');
  };

  const next = () => {
    if (step === 0 && !answers.lateness) return setError('Choose how late your period is.');
    if (step === 1 && !answers.pregnancy) return setError('Choose an option to continue.');
    if (step === 2 && !answers.test) {
      return setError('Let us know whether you have taken a test, or choose “Not applicable”.');
    }
    if (step === 3 && !answers.factors.length) return setError('Select at least one option, including “None of these”.');
    if (step === 4) {
      if (!answers.symptoms.length) return setError('Select at least one option, including “None of these”.');
      setShowResult(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setError('');
    setStep((current) => Math.min(current + 1, steps.length - 1));
  };

  const back = () => {
    setError('');
    if (showResult) {
      setShowResult(false);
      return;
    }
    setStep((current) => Math.max(current - 1, 0));
  };

  const restart = () => {
    setAnswers({ lateness: '', pregnancy: '', test: '', factors: [], symptoms: [] });
    setStep(0);
    setShowResult(false);
    setError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const guidance = useMemo(() => {
    const urgentSymptoms = answers.symptoms.filter((item) =>
      ['Severe pelvic or abdominal pain', 'Dizziness or fainting', 'Shoulder-tip pain', 'Fever', 'Very heavy bleeding'].includes(item)
    );

    if (urgentSymptoms.length && answers.pregnancy !== 'no') {
      return {
        level: 'urgent',
        title: 'These symptoms deserve same-day medical care',
        summary:
          'Severe or one-sided pelvic pain with a late period, dizziness, shoulder-tip pain, fever or very heavy bleeding can be urgent. Do not wait to see whether your period arrives.',
        steps: [
          'Contact your local urgent care, emergency department or after-hours gynecology service today.',
          'If pregnancy is possible, tell the clinician — an early pregnancy assessment may be needed.',
          'Do not drive yourself if you feel faint or are in severe pain.',
        ],
        badge: 'Urgent guidance',
      };
    }

    if (answers.test === 'positive') {
      return {
        level: 'consult',
        title: 'A positive test suggests pregnancy — arrange follow-up',
        summary:
          'A positive pregnancy test is usually reliable, but it does not tell you where the pregnancy is. Contact a clinician to arrange early pregnancy care and confirm the next steps.',
        steps: [
          'Book an early pregnancy appointment with a clinician or maternity service.',
          'Seek same-day care for severe pain, heavy bleeding, dizziness or shoulder-tip pain.',
          'Continue folic acid if you were already taking it; ask a clinician about any medicines or supplements.',
        ],
        badge: 'Follow-up recommended',
      };
    }

    if (answers.lateness === 'over14' || answers.lateness === '8to14') {
      return {
        level: 'consult',
        title: 'A clinician conversation is a sensible next step',
        summary:
          'A period that is more than a week late — especially if repeated, very heavy, painful or accompanied by other new symptoms — is worth assessing. Pregnancy, stress, thyroid changes, PCOS and perimenopause are among the possibilities.',
        steps: [
          'Take a pregnancy test if it is possible you could be pregnant; repeat in a few days if negative and your period stays away.',
          'Book a non-urgent appointment with a gynecologist or primary care clinician.',
          'Bring your cycle dates and any symptom notes so the conversation is efficient.',
        ],
        badge: 'See a clinician',
      };
    }

    if (answers.pregnancy === 'yes' && answers.test === 'not-taken') {
      return {
        level: 'consult',
        title: 'Take a pregnancy test first',
        summary:
          'A home pregnancy test after a missed period is the quickest way to add clarity. If the result is positive, arrange early care. If it is negative and your period remains absent, repeat in a few days.',
        steps: [
          'Use first-morning urine for the most concentrated sample.',
          'Repeat the test in 2–3 days if the first is negative and your period has not come.',
          'Book a clinician if you have pain, heavy bleeding, or a negative test with no period after another week.',
        ],
        badge: 'Start with a test',
      };
    }

    if (answers.factors.filter((item) => item !== 'None of these').length) {
      return {
        level: 'monitor',
        title: 'There may be a temporary explanation',
        summary:
          'Stress, travel, illness, sleep changes, weight changes, exercise and hormonal contraception can all delay ovulation and therefore your period. This is common and often settles without treatment.',
        steps: [
          'Take a pregnancy test if there is any chance you could be pregnant.',
          'Give your cycle another 1–2 weeks while keeping your logs up to date.',
          'Book a review if your period stays absent for more than 2–3 weeks or this keeps happening.',
        ],
        badge: 'Watch and track',
      };
    }

    return {
      level: 'monitor',
      title: 'A short wait is reasonable',
      summary:
        'A few days of variation is common and often not meaningful. If pregnancy is possible, a test after the missed period is still the clearest next step. Keep logging so the pattern becomes visible.',
      steps: [
        'Take a pregnancy test if there is any possibility you could be pregnant.',
        'Note your symptoms and any lifestyle changes over the next week.',
        'Speak with a clinician if your period remains absent after another week or you feel unwell.',
      ],
      badge: 'Keep tracking',
    };
  }, [answers]);

  const levelStyles = {
    urgent: {
      wrap: 'border-deep-rose/30 bg-[#FFF7FA]',
      icon: 'bg-deep-rose text-white',
      badge: 'bg-deep-rose text-white',
    },
    consult: {
      wrap: 'border-pink-glow/40 bg-soft-petal/30',
      icon: 'bg-deep-rose text-white',
      badge: 'bg-deep-rose text-white',
    },
    monitor: {
      wrap: 'border-blush-pink/70 bg-rose-mist/60',
      icon: 'bg-soft-petal text-deep-rose',
      badge: 'bg-white text-deep-rose',
    },
  };

  const selectedFactors = answers.factors.filter((item) => item !== 'None of these');
  const selectedSymptoms = answers.symptoms.filter((item) => item !== 'None of these');

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Guided assessment"
        title="Your period is late. Let's think it through."
        description="A calm, private way to consider common reasons for a late period and decide what to do next. This is guidance, not a diagnosis."
        actions={
          <Badge tone="outline" icon={Lock}>
            Answers stay in this browser
          </Badge>
        }
      />

      <div className="grid gap-4 xl:grid-cols-[1.5fr_1fr]">
        <div className="space-y-4">
          <section className="card overflow-hidden" aria-labelledby="navigator-title">
            <div className="relative overflow-hidden bg-rose-mist px-5 py-5 sm:px-7">
              <div className="relative flex items-start gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/70 text-deep-rose">
                  <HeartHandshake className="h-5 w-5" aria-hidden="true" />
                </span>
                <div>
                  <h2 id="navigator-title" className="font-display text-xl text-ink">
                    {showResult ? 'Your personalised guidance' : steps[step].question}
                  </h2>
                  <p className="mt-1 text-xs leading-relaxed text-muted">
                    {showResult ? 'Based on the answers you selected.' : steps[step].hint}
                  </p>
                </div>
              </div>

              {!showResult ? (
                <div className="relative mt-4 flex items-center gap-1.5" aria-label={`Step ${step + 1} of ${steps.length}`}>
                  {steps.map((item, index) => (
                    <span
                      key={item.key}
                      className={cn(
                        'h-1.5 flex-1 rounded-full transition-colors',
                        index <= step ? 'bg-deep-rose' : 'bg-white/60'
                      )}
                    />
                  ))}
                  <span className="ml-2 shrink-0 text-xs font-semibold text-muted">
                    {step + 1}/{steps.length}
                  </span>
                </div>
              ) : null}
            </div>

            <div className="p-5 sm:p-7">
              {error ? (
                <div className="mb-4 flex items-start gap-2 rounded-xl border border-blush-pink bg-rose-mist p-3 text-xs text-deep-rose" role="alert">
                  <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  {error}
                </div>
              ) : null}

              {showResult ? (
                <div>
                  <div className={cn('rounded-2xl border p-5', levelStyles[guidance.level].wrap)}>
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <span className={cn('grid h-11 w-11 place-items-center rounded-2xl', levelStyles[guidance.level].icon)}>
                        {guidance.level === 'urgent' ? (
                          <ShieldAlert className="h-5 w-5" aria-hidden="true" />
                        ) : guidance.level === 'consult' ? (
                          <Stethoscope className="h-5 w-5" aria-hidden="true" />
                        ) : (
                          <Sparkles className="h-5 w-5" aria-hidden="true" />
                        )}
                      </span>
                      <span className={cn('badge', levelStyles[guidance.level].badge)}>
                        {guidance.badge}
                      </span>
                    </div>
                    <h3 className="mt-4 font-display text-xl text-ink">
                      {guidance.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-ink/80">{guidance.summary}</p>

                    <div className="mt-4">
                      <p className="text-xs font-semibold text-muted">
                        What to do next
                      </p>
                      <ol className="mt-2 space-y-2">
                        {guidance.steps.map((item, index) => (
                          <li key={item} className="flex items-start gap-2.5 text-xs leading-relaxed text-ink/80">
                            <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-white text-xs font-semibold text-deep-rose ring-1 ring-blush-pink">
                              {index + 1}
                            </span>
                            {item}
                          </li>
                        ))}
                      </ol>
                    </div>
                  </div>

                  <div className="mt-4 rounded-xl border border-blush-pink/60 bg-white p-4">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-semibold text-muted">Your answers</p>
                      <button
                        type="button"
                        onClick={restart}
                        className="flex items-center gap-1 text-xs font-semibold text-deep-rose hover:text-rose-pink"
                      >
                        <RotateCcw className="h-3 w-3" aria-hidden="true" />
                        Start over
                      </button>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      <span className="rounded-full bg-rose-mist px-2 py-1 text-xs font-semibold text-deep-rose">
                        {LATENESS.find((item) => item.value === answers.lateness)?.label || 'Lateness not set'}
                      </span>
                      <span className="rounded-full bg-rose-mist px-2 py-1 text-xs font-semibold text-deep-rose">
                        Pregnancy possible: {answers.pregnancy}
                      </span>
                      <span className="rounded-full bg-rose-mist px-2 py-1 text-xs font-semibold text-deep-rose">
                        Test: {TESTS.find((item) => item.value === answers.test)?.label}
                      </span>
                      {selectedFactors.slice(0, 3).map((factor) => (
                        <span key={factor} className="rounded-full bg-soft-petal px-2 py-1 text-xs font-semibold text-deep-rose">
                          {factor}
                        </span>
                      ))}
                      {selectedSymptoms.slice(0, 4).map((symptom) => (
                        <span key={symptom} className="rounded-full bg-blush-pink/60 px-2 py-1 text-xs font-semibold text-deep-rose">
                          {symptom}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-5 flex flex-col gap-2 sm:flex-row">
                    <Link to="/doctor-report" className="btn-primary flex-1 justify-center">
                      <ClipboardList className="h-4 w-4" aria-hidden="true" />
                      Prepare for a clinician visit
                    </Link>
                    <Button variant="secondary" icon={RotateCcw} onClick={restart} className="flex-1">
                      Start over
                    </Button>
                  </div>
                </div>
              ) : (
                <div>
                  {step === 0 ? (
                    <div className="grid gap-2.5 sm:grid-cols-2">
                      {LATENESS.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setSingle('lateness', option.value)}
                          aria-pressed={answers.lateness === option.value}
                          className={OPTION_BUTTON(answers.lateness === option.value)}
                        >
                          <span
                            className={cn(
                              'mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full border',
                              answers.lateness === option.value
                                ? 'border-deep-rose bg-deep-rose text-white'
                                : 'border-blush-pink'
                            )}
                          >
                            {answers.lateness === option.value ? <Check className="h-2.5 w-2.5" /> : null}
                          </span>
                          <span>
                            <span className="block text-xs font-semibold text-deep-rose">{option.label}</span>
                            <span className="mt-0.5 block text-xs leading-relaxed text-muted">
                              {option.helper}
                            </span>
                          </span>
                        </button>
                      ))}
                    </div>
                  ) : null}

                  {step === 1 ? (
                    <div className="grid gap-2.5">
                      {PREGNANCY.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setSingle('pregnancy', option.value)}
                          aria-pressed={answers.pregnancy === option.value}
                          className={OPTION_BUTTON(answers.pregnancy === option.value)}
                        >
                          <span
                            className={cn(
                              'mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full border',
                              answers.pregnancy === option.value
                                ? 'border-deep-rose bg-deep-rose text-white'
                                : 'border-blush-pink'
                            )}
                          >
                            {answers.pregnancy === option.value ? <Check className="h-2.5 w-2.5" /> : null}
                          </span>
                          <span className="text-xs font-semibold text-deep-rose">{option.label}</span>
                        </button>
                      ))}
                      <p className="rounded-xl bg-rose-mist/70 p-3 text-xs leading-relaxed text-muted">
                        If you have had sex without contraception, or your method may have failed
                        (missed pill, broken condom, slipped IUD), pregnancy is possible even if you
                        feel no different.
                      </p>
                    </div>
                  ) : null}

                  {step === 2 ? (
                    <div>
                      <div className="grid gap-2.5 sm:grid-cols-2">
                        {TESTS.map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => setSingle('test', option.value)}
                            aria-pressed={answers.test === option.value}
                            className={OPTION_BUTTON(answers.test === option.value)}
                          >
                            <span
                              className={cn(
                                'mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full border',
                                answers.test === option.value
                                  ? 'border-deep-rose bg-deep-rose text-white'
                                  : 'border-blush-pink'
                              )}
                            >
                              {answers.test === option.value ? <Check className="h-2.5 w-2.5" /> : null}
                            </span>
                            <span className="text-xs font-semibold text-deep-rose">{option.label}</span>
                          </button>
                        ))}
                      </div>
                      <p className="mt-3 rounded-xl bg-rose-mist/70 p-3 text-xs leading-relaxed text-muted">
                        Home tests can be negative if taken very early. A negative test does not rule
                        out pregnancy on day one of a missed period. Wait 2–3 days and test again if
                        unsure.
                      </p>
                    </div>
                  ) : null}

                  {step === 3 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {FACTORS.map((factor) => {
                        const selected = answers.factors.includes(factor);
                        return (
                          <button
                            key={factor}
                            type="button"
                            onClick={() => toggleMulti('factors', factor)}
                            aria-pressed={selected}
                            className={cn('chip !text-[11px]', selected && 'chip-active')}
                          >
                            {selected ? <Check className="h-3 w-3" aria-hidden="true" /> : null}
                            {factor}
                          </button>
                        );
                      })}
                    </div>
                  ) : null}

                  {step === 4 ? (
                    <div>
                      <div className="flex flex-wrap gap-1.5">
                        {SYMPTOMS.map((symptom) => {
                          const selected = answers.symptoms.includes(symptom);
                          const urgent = ['Severe pelvic or abdominal pain', 'Dizziness or fainting', 'Shoulder-tip pain', 'Fever', 'Very heavy bleeding'].includes(symptom);
                          return (
                            <button
                              key={symptom}
                              type="button"
                              onClick={() => toggleMulti('symptoms', symptom)}
                              aria-pressed={selected}
                              className={cn(
                                'chip !text-[11px]',
                                selected && (urgent ? 'border-deep-rose bg-deep-rose text-white' : 'chip-active')
                              )}
                            >
                              {selected ? <Check className="h-3 w-3" aria-hidden="true" /> : urgent ? <AlertTriangle className="h-3 w-3 text-deep-rose" aria-hidden="true" /> : null}
                              {symptom}
                            </button>
                          );
                        })}
                      </div>
                      <p className="mt-4 flex items-start gap-2 rounded-xl border border-deep-rose/15 bg-[#FFF7FA] p-3 text-xs leading-relaxed text-muted">
                        <ShieldAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                        If you have severe pain, fainting, shoulder-tip pain or heavy bleeding, seek
                        same-day medical care rather than waiting for this tool.
                      </p>
                    </div>
                  ) : null}

                  <div className="mt-6 flex flex-col-reverse gap-2.5 border-t border-blush-pink/40 pt-4 sm:flex-row sm:justify-between">
                    <Button
                      variant="ghost"
                      onClick={back}
                      disabled={step === 0}
                      icon={ArrowLeft}
                    >
                      Back
                    </Button>
                    <Button onClick={next} iconRight={ArrowRight}>
                      {step === steps.length - 1 ? 'See my guidance' : 'Continue'}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </section>

          <div className="flex items-start gap-2 rounded-2xl border border-blush-pink/60 bg-white/75 p-4">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-deep-rose" aria-hidden="true" />
            <p className="text-xs leading-relaxed text-muted">
              This navigator cannot tell you why your period is late, rule out pregnancy, or diagnose a
              condition. Its suggestions are general educational guidance. For personal medical
              advice, speak with a qualified clinician.
            </p>
          </div>
        </div>

        <aside className="space-y-4">
          <section className="card p-5 sm:p-6">
            <div className="flex items-center gap-2">
              <CalendarClock className="h-4 w-4 text-pink-glow" aria-hidden="true" />
              <h2 className="font-display text-lg text-ink">
                What can delay a period?
              </h2>
            </div>
            <p className="mt-1.5 text-xs leading-relaxed text-muted">
              Ovulation can shift for many reasons. A later ovulation means a later period — even if
              nothing feels unusual.
            </p>
            <ul className="mt-4 space-y-3">
              {[
                { icon: Wind, title: 'Stress and life transitions', text: 'A demanding month, grief, travel or big change can delay ovulation.' },
                { icon: Moon, title: 'Sleep and weight changes', text: 'Significant shifts in sleep, weight or calorie intake can affect hormones.' },
                { icon: Thermometer, title: 'Illness and medication', text: 'Fevers, new medicines and hormonal contraception changes can alter timing.' },
                { icon: HeartPulse, title: 'Hormonal conditions', text: 'PCOS, thyroid changes and perimenopause can cause irregular or missed periods.' },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.title} className="flex items-start gap-2.5">
                    <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-soft-petal text-deep-rose">
                      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                    </span>
                    <div>
                      <p className="text-xs font-semibold text-ink">{item.title}</p>
                      <p className="mt-0.5 text-xs leading-relaxed text-muted">{item.text}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
            <Link to="/resources" className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-deep-rose hover:text-rose-pink">
              Read more about cycle changes
              <ArrowRight className="h-3 w-3" aria-hidden="true" />
            </Link>
          </section>

          <section className="rounded-2xl border border-deep-rose/20 bg-[#FFF7FA] p-5">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-deep-rose" aria-hidden="true" />
              <h2 className="font-display text-lg text-ink">
                Don&apos;t wait for these
              </h2>
            </div>
            <ul className="mt-3 space-y-2">
              {[
                'Severe or one-sided pelvic pain',
                'Dizziness, fainting or shoulder-tip pain',
                'Fever with pelvic pain',
                'Bleeding that soaks through protection hourly',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 text-xs leading-relaxed text-muted">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-deep-rose" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs leading-relaxed text-muted">
              These can have causes that need same-day assessment. Contact urgent care or your local
              emergency service.
            </p>
          </section>

          <section className="rounded-2xl border border-blush-pink/60 bg-white/70 p-4">
            <div className="flex items-center gap-2">
              <Info className="h-3.5 w-3.5 text-pink-glow" aria-hidden="true" />
              <p className="text-xs font-semibold text-deep-rose">When to see a gynecologist</p>
            </div>
            <p className="mt-1.5 text-xs leading-relaxed text-muted">
              Book a review if your period is more than 2–3 weeks late, you have 3 or more missed
              periods in a year, your cycles are consistently under 21 or over 35 days, or the pattern
              is new for you.
            </p>
            <Link to="/doctor-report" className="btn-secondary btn-sm mt-3 w-full">
              Build a visit summary
            </Link>
          </section>

          <p className="flex items-start gap-1.5 px-1 text-xs leading-relaxed text-muted">
            <Lock className="mt-0.5 h-3 w-3 shrink-0" aria-hidden="true" />
            This assessment runs entirely in your browser. Your answers are not saved to your account.
          </p>
        </aside>
      </div>
    </div>
  );
};

export default LatePeriodNavigator;
