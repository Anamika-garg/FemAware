import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Activity,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  Flower2,
  Heart,
  Lock,
  Sparkles,
  Sprout,
} from 'lucide-react';
import Logo from '../components/Logo';
import Button from '../components/ui/Button';
import Field from '../components/ui/Field';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  GOALS,
  LIFE_STAGES,
  SENIOR_FOCUS_AREAS,
  SENIOR_GOALS,
  STAGE_OPTIONS,
  TEEN_GOALS,
} from '../lib/constants';
import { getErrorMessage } from '../lib/api';
import { addDays, formatDate, parseISO, todayISO } from '../lib/dates';
import { isTeenStage } from '../lib/navItems';
import { loadPreferences } from '../lib/preferences';
import { cn } from '../lib/utils';

const stageIcons = {
  sparkles: Sparkles,
  activity: Activity,
  flower: Flower2,
  heart: Heart,
  sprout: Sprout,
};

const STEP_DETAILS = {
  space: {
    title: 'Your space',
    heading: 'Which FemAware space fits you?',
    caption: 'Each life stage gets its own dashboard, tools and lessons. You can switch later.',
  },
  focus: {
    title: 'Your focus',
    heading: 'What brings you to FemAware?',
    caption: 'Choose one or more. Your dashboard and education will adapt to what you select.',
  },
  goals: {
    title: 'Your goals',
    heading: 'What would you like to get from FemAware?',
    caption: 'We use these to prioritise the insights and prompts you see.',
  },
  rhythm: {
    title: 'Your rhythm',
    heading: 'How would you describe your usual cycle?',
    caption: 'Estimates are enough. Your averages update automatically as you log.',
  },
};

// Teen and senior spaces skip the adult cycle-focus and prediction steps.
const STEPS_FOR_STAGE = {
  teen: ['space', 'goals'],
  adult: ['space', 'focus', 'goals', 'rhythm'],
  senior: ['space', 'goals'],
};

const GOALS_FOR_STAGE = { teen: TEEN_GOALS, adult: GOALS, senior: SENIOR_GOALS };

// Choices made in the public "Explore your health" flow, if this browser has them.
const startPreferences = (user) => {
  if (user?.onboardingComplete) return null;
  const saved = loadPreferences();
  return saved && STEPS_FOR_STAGE[saved.stage] ? saved : null;
};

const initialStage = (user) => {
  const saved = startPreferences(user);
  if (saved) return saved.stage;
  if (isTeenStage(user?.lifeStage)) return 'teen';
  if (user?.lifeStage === 'senior') return 'senior';
  return 'adult';
};

const Onboarding = () => {
  const { user, completeOnboarding } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  // Someone who already chose a stage in "Explore your health" starts on the next question.
  const [fromStart] = useState(() => Boolean(startPreferences(user)));
  const [stepIndex, setStepIndex] = useState(() => (startPreferences(user) ? 1 : 0));
  const [space, setSpace] = useState(() => initialStage(user));
  const [stages, setStages] = useState(
    user?.lifeStages?.length ? user.lifeStages : ['general']
  );
  const [goals, setGoals] = useState(() => {
    if (user?.goals?.length) return user.goals;
    const saved = startPreferences(user);
    if (!saved) return [];
    const options = GOALS_FOR_STAGE[saved.stage].map((goal) => goal.value);
    return saved.topics.filter((topic) => options.includes(topic));
  });
  const [age, setAge] = useState(user?.age || '');
  const [cycleLength, setCycleLength] = useState(
    user?.cycleProfile?.averageCycleLength || 28
  );
  const [periodLength, setPeriodLength] = useState(
    user?.cycleProfile?.averagePeriodLength || 5
  );
  const [lastPeriod, setLastPeriod] = useState('');
  const [notSure, setNotSure] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const iconForStage = (icon) => stageIcons[icon] || Sparkles;
  const selectedStageDetails = LIFE_STAGES.filter((item) => stages.includes(item.value));
  const steps = STEPS_FOR_STAGE[space].map((key) => ({ key, ...STEP_DETAILS[key] }));
  const step = steps[stepIndex].key;
  const goalOptions = GOALS_FOR_STAGE[space];
  const spaceDetails = STAGE_OPTIONS.find((item) => item.value === space);

  const chooseSpace = (value) => {
    setSpace(value);
    // Goals are worded per space, so a new space starts with a fresh list.
    if (value !== space) setGoals([]);
  };

  const preview = useMemo(() => {
    if (notSure || !lastPeriod) return null;
    const next = addDays(parseISO(lastPeriod), Number(cycleLength) || 28);
    const ovulation = addDays(next, -14);
    return {
      next: formatDate(next, 'd MMM yyyy'),
      fertileStart: formatDate(addDays(ovulation, -5), 'd MMM'),
      fertileEnd: formatDate(addDays(ovulation, 1), 'd MMM'),
    };
  }, [lastPeriod, cycleLength, notSure]);

  const toggleStage = (value) => {
    setStages((current) =>
      current.includes(value)
        ? current.length === 1
          ? current
          : current.filter((item) => item !== value)
        : [...current, value]
    );
  };

  const toggleGoal = (value) => {
    setGoals((current) =>
      current.includes(value) ? current.filter((item) => item !== value) : [...current, value]
    );
  };

  const validateStep = () => {
    if (step === 'focus' && !stages.length) return 'Choose at least one focus to continue.';
    if (step === 'goals' && !goals.length) return 'Choose at least one goal — it helps us shape your space.';
    if (step === 'goals' && age) {
      const [min, max] = spaceDetails.ageRange;
      if (Number(age) < min || Number(age) > max) {
        return `The ${spaceDetails.label.toLowerCase()} is for ages ${min}–${max}. Adjust your age or go back and pick another space.`;
      }
    }
    if (step === 'rhythm') {
      if (!Number(cycleLength) || Number(cycleLength) < 15 || Number(cycleLength) > 90) {
        return 'Cycle length should be between 15 and 90 days.';
      }
      if (!Number(periodLength) || Number(periodLength) < 1 || Number(periodLength) > 15) {
        return 'Period length should be between 1 and 15 days.';
      }
      if (!notSure && lastPeriod && lastPeriod > todayISO()) {
        return 'The last period date cannot be in the future.';
      }
    }
    return '';
  };

  const next = () => {
    const message = validateStep();
    if (message) {
      setError(message);
      return;
    }
    setError('');
    setStepIndex((current) => Math.min(current + 1, steps.length - 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const back = () => {
    setError('');
    setStepIndex((current) => Math.max(current - 1, 0));
  };

  const stagePayload = () => {
    if (space === 'teen') return { lifeStage: 'teen', lifeStages: ['general'], focusAreas: ['general'] };
    if (space === 'senior') {
      return { lifeStage: 'senior', lifeStages: ['postmenopause'], focusAreas: SENIOR_FOCUS_AREAS };
    }
    return {
      lifeStage: 'adult',
      lifeStages: stages,
      focusAreas: [
        ...stages,
        ...(goals.includes('Manage irregular periods') ? ['irregular-periods'] : []),
      ],
      cycleProfile: {
        averageCycleLength: Number(cycleLength),
        averagePeriodLength: Number(periodLength),
        lastPeriodStart: notSure || !lastPeriod ? null : lastPeriod,
      },
    };
  };

  const finish = async () => {
    const message = validateStep();
    if (message) {
      setError(message);
      return;
    }
    setError('');
    setSaving(true);
    try {
      await completeOnboarding({ ...stagePayload(), goals, age: age || undefined });
      addToast({
        title: 'Your space is ready',
        message:
          space === 'adult'
            ? 'Predictions and insights will sharpen with every log.'
            : `Welcome to your ${spaceDetails.label.toLowerCase()}.`,
      });
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-canvas">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-4 py-5 sm:px-6">
        <Logo compact />
        <Link
          to="/privacy"
          className="hidden items-center gap-1.5 text-xs font-semibold text-muted transition-colors hover:text-deep-rose sm:flex"
        >
          <Lock className="h-3.5 w-3.5" aria-hidden="true" />
          Your data is private
        </Link>
      </header>

      <main className="mx-auto w-full max-w-5xl px-4 pb-16 pt-2 sm:px-6">
        <div className="mb-8 text-center sm:mb-10">
          <p className="eyebrow">Welcome, {user?.name?.split(' ')[0] || 'friend'}</p>
          <h1 className="mx-auto mt-3 max-w-2xl font-display text-[2.25rem] leading-tight text-ink sm:text-[2.75rem]">
            Let&apos;s shape your space around you.
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-muted">
            No perfect answers needed. You can adjust every one of these later.
          </p>
        </div>

        <ol
          className="mx-auto mb-6 grid max-w-3xl gap-2"
          style={{ gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))` }}
          aria-label="Onboarding progress"
        >
          {steps.map((item, index) => {
            const active = index === stepIndex;
            return (
              <li key={item.title} aria-current={active ? 'step' : undefined}>
                <span
                  className={cn(
                    'block h-1 rounded-full transition-colors duration-300',
                    index <= stepIndex ? 'bg-deep-rose' : 'bg-soft-petal'
                  )}
                  aria-hidden="true"
                />
                <span
                  className={cn(
                    'mt-2 hidden text-xs font-medium sm:block',
                    active ? 'text-deep-rose' : 'text-muted'
                  )}
                >
                  {item.title}
                </span>
              </li>
            );
          })}
        </ol>

        <div className="mx-auto max-w-3xl overflow-hidden rounded-2xl border border-line bg-white">
          <div className="border-b border-line px-5 py-6 sm:px-8 sm:py-7">
            <p className="text-sm font-medium text-muted">
              Step {stepIndex + 1} of {steps.length}
            </p>
            <h2 className="mt-1 font-display text-[1.75rem] leading-tight text-ink">
              {steps[stepIndex].heading}
            </h2>
            <p className="mt-1.5 text-sm leading-relaxed text-muted">{steps[stepIndex].caption}</p>
          </div>

          <div className="px-5 py-6 sm:px-8 sm:py-8">
            {fromStart && stepIndex > 0 && step !== 'space' ? (
              <p className="mb-6 flex flex-wrap items-center gap-x-2 gap-y-1 rounded-lg bg-rose-mist px-4 py-3 text-sm text-ink">
                <Check className="h-4 w-4 text-deep-rose" aria-hidden="true" />
                Setting up your <span className="font-semibold">{spaceDetails.label.toLowerCase()}</span>, as you chose earlier.
                <button
                  type="button"
                  onClick={() => setStepIndex(0)}
                  className="font-semibold text-deep-rose underline underline-offset-2"
                >
                  Change
                </button>
              </p>
            ) : null}
            {error ? (
              <div
                className="mb-5 flex items-start gap-2.5 rounded-xl border border-blush-pink bg-rose-mist p-3.5 text-sm text-deep-rose"
                role="alert"
              >
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                <p className="leading-relaxed">{error}</p>
              </div>
            ) : null}

            {step === 'space' ? (
              <div className="grid gap-3 sm:grid-cols-3" role="radiogroup" aria-label="FemAware space">
                {STAGE_OPTIONS.map((option) => {
                  const Icon = iconForStage(option.icon);
                  const selected = space === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      onClick={() => chooseSpace(option.value)}
                      className={cn(
                        'relative flex flex-col items-start rounded-2xl border p-4 text-left transition-all sm:p-5',
                        selected
                          ? 'border-deep-rose bg-rose-mist ring-1 ring-deep-rose'
                          : 'border-line bg-white hover:border-blush-pink hover:bg-rose-mist/50'
                      )}
                    >
                      <span
                        className={cn(
                          'grid h-10 w-10 place-items-center rounded-xl transition-colors',
                          selected ? 'bg-deep-rose text-white' : 'bg-rose-mist text-deep-rose'
                        )}
                      >
                        <Icon className="h-5 w-5" aria-hidden="true" />
                      </span>
                      <span className="mt-3 text-base font-semibold text-ink">{option.label}</span>
                      <span className="text-xs font-medium text-deep-rose">
                        {option.ages}
                      </span>
                      <span className="mt-1.5 text-xs leading-relaxed text-muted">{option.description}</span>
                    </button>
                  );
                })}
              </div>
            ) : null}

            {step === 'focus' ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {LIFE_STAGES.map((stage) => {
                  const Icon = iconForStage(stage.icon);
                  const selected = stages.includes(stage.value);
                  return (
                    <button
                      key={stage.value}
                      type="button"
                      onClick={() => toggleStage(stage.value)}
                      aria-pressed={selected}
                      className={cn(
                        'group relative flex flex-col items-start rounded-2xl border p-4 text-left transition-all sm:p-5',
                        selected
                          ? 'border-deep-rose bg-rose-mist ring-1 ring-deep-rose'
                          : 'border-line bg-white hover:border-blush-pink hover:bg-rose-mist/50'
                      )}
                    >
                      <span
                        className={cn(
                          'grid h-10 w-10 place-items-center rounded-xl transition-colors',
                          selected ? 'bg-deep-rose text-white' : 'bg-rose-mist text-deep-rose'
                        )}
                      >
                        <Icon className="h-5 w-5" aria-hidden="true" />
                      </span>
                      <span className="mt-3 text-base font-semibold text-ink">{stage.label}</span>
                      <span className="mt-1 text-xs leading-relaxed text-muted">
                        {stage.description}
                      </span>
                      <span
                        className={cn(
                          'absolute right-3.5 top-3.5 grid h-5 w-5 place-items-center rounded-full border transition-colors',
                          selected
                            ? 'border-deep-rose bg-deep-rose text-white'
                            : 'border-blush-pink bg-white text-transparent'
                        )}
                        aria-hidden="true"
                      >
                        <Check className="h-3 w-3" />
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : null}

            {step === 'goals' ? (
              <div>
                <div className="flex flex-wrap gap-2.5">
                  {goalOptions.map((goal) => {
                    const selected = goals.includes(goal.value);
                    return (
                      <button
                        key={goal.value}
                        type="button"
                        onClick={() => toggleGoal(goal.value)}
                        aria-pressed={selected}
                        className={cn('chip', selected && 'chip-active')}
                      >
                        {selected ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : null}
                        {goal.value}
                      </button>
                    );
                  })}
                </div>
                <div className="mt-7 grid gap-4 sm:grid-cols-[1fr_200px]">
                  <div className="rounded-2xl bg-rose-mist p-4">
                    <p className="flex items-center gap-2 text-sm font-semibold text-ink">
                      <Sprout className="h-4 w-4 text-pink-glow" aria-hidden="true" />
                      Why we ask
                    </p>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted">
                      {space === 'teen'
                        ? 'Your goals decide which lessons and tools we show first. You can change them any time.'
                        : 'Your goals shape the prompts you receive — from preparing for a gynecology visit to understanding later-life changes. You can update them any time.'}
                    </p>
                  </div>
                  <Field label="Your age" htmlFor="age" optional>
                    <input
                      id="age"
                      type="number"
                      min={spaceDetails.ageRange[0]}
                      max={spaceDetails.ageRange[1]}
                      inputMode="numeric"
                      value={age}
                      onChange={(event) => setAge(event.target.value)}
                      className="input-field"
                      placeholder={space === 'teen' ? 'e.g. 15' : space === 'senior' ? 'e.g. 62' : 'e.g. 29'}
                    />
                  </Field>
                </div>
              </div>
            ) : null}

            {step === 'rhythm' ? (
              <div className="space-y-6">
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field
                    label="Average cycle length"
                    htmlFor="cycle-length"
                    hint="First day of one period to the day before the next."
                  >
                    <div className="relative">
                      <input
                        id="cycle-length"
                        type="number"
                        min="15"
                        max="90"
                        value={cycleLength}
                        onChange={(event) => setCycleLength(event.target.value)}
                        className="input-field pr-14"
                      />
                      <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted">
                        days
                      </span>
                    </div>
                  </Field>
                  <Field label="Typical period length" htmlFor="period-length">
                    <div className="relative">
                      <input
                        id="period-length"
                        type="number"
                        min="1"
                        max="15"
                        value={periodLength}
                        onChange={(event) => setPeriodLength(event.target.value)}
                        className="input-field pr-14"
                      />
                      <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted">
                        days
                      </span>
                    </div>
                  </Field>
                </div>

                <div className="rounded-2xl border border-blush-pink/70 bg-rose-mist/70 p-4 sm:p-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-ink">When did your last period start?</p>
                      <p className="mt-1 text-xs text-muted">
                        Optional — but it unlocks today&apos;s phase and predictions.
                      </p>
                    </div>
                    <label className="flex cursor-pointer items-center gap-2 text-xs font-semibold text-muted">
                      <input
                        type="checkbox"
                        checked={notSure}
                        onChange={(event) => {
                          setNotSure(event.target.checked);
                          if (event.target.checked) setLastPeriod('');
                        }}
                        className="h-4 w-4 rounded border-blush-pink accent-deep-rose"
                      />
                      I&apos;m not sure
                    </label>
                  </div>
                  {!notSure ? (
                    <div className="mt-4 max-w-xs">
                      <Field label="Last period start date" htmlFor="last-period">
                        <input
                          id="last-period"
                          type="date"
                          max={todayISO()}
                          value={lastPeriod}
                          onChange={(event) => setLastPeriod(event.target.value)}
                          className="input-field"
                        />
                      </Field>
                    </div>
                  ) : null}
                </div>

                {preview ? (
                  <div className="rounded-2xl border border-pink-glow/25 bg-rose-mist p-4 sm:p-5">
                    <p className="flex items-center gap-2 text-sm font-semibold text-ink">
                      <CalendarDays className="h-4 w-4 text-deep-rose" aria-hidden="true" />
                      A first estimate
                    </p>
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      <div>
                        <p className="text-xs font-semibold text-muted">Next period</p>
                        <p className="text-sm font-semibold text-deep-rose">{preview.next}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-muted">Estimated fertile window</p>
                        <p className="text-sm font-semibold text-deep-rose">
                          {preview.fertileStart} – {preview.fertileEnd}
                        </p>
                      </div>
                    </div>
                    <p className="mt-3 text-xs leading-relaxed text-muted">
                      Predictions are estimates based on averages, not a contraceptive method.
                    </p>
                  </div>
                ) : null}

                {selectedStageDetails.some((item) => item.value === 'pcos') ? (
                  <p className="rounded-xl bg-white p-3 text-xs leading-relaxed text-muted ring-1 ring-blush-pink/60">
                    You selected PCOS awareness. FemAware can help you collect patterns for a
                    clinician, but it does not diagnose PCOS.
                  </p>
                ) : null}
              </div>
            ) : null}
          </div>

          <div className="flex flex-col-reverse items-stretch justify-between gap-3 border-t border-line bg-rose-mist/50 px-5 py-4 sm:flex-row sm:items-center sm:px-8">
            <Button
              variant="ghost"
              onClick={back}
              disabled={stepIndex === 0 || saving}
              icon={ArrowLeft}
              className="justify-center sm:justify-start"
            >
              Back
            </Button>
            {stepIndex < steps.length - 1 ? (
              <Button onClick={next} iconRight={ArrowRight}>
                Continue
              </Button>
            ) : (
              <Button onClick={finish} loading={saving} iconRight={ArrowRight}>
                Enter my dashboard
              </Button>
            )}
          </div>
        </div>

        <p className="mx-auto mt-6 flex max-w-3xl items-start justify-center gap-2 text-center text-xs leading-relaxed text-muted">
          <Lock className="mt-0.5 h-3 w-3 shrink-0" aria-hidden="true" />
          Your answers are used only to personalise your experience. You can export or delete them at
          any time from Privacy &amp; data.
        </p>
      </main>
    </div>
  );
};

export default Onboarding;
