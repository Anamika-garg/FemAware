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
import { LIFE_STAGES, GOALS } from '../lib/constants';
import { getErrorMessage } from '../lib/api';
import { addDays, formatDate, parseISO, todayISO } from '../lib/dates';
import { cn } from '../lib/utils';

const stageIcons = {
  sparkles: Sparkles,
  activity: Activity,
  flower: Flower2,
  heart: Heart,
};

const steps = [
  { title: 'Your focus', caption: 'What would you like support with?' },
  { title: 'Your goals', caption: 'What matters most right now?' },
  { title: 'Your rhythm', caption: 'A starting point for predictions.' },
];

const Onboarding = () => {
  const { user, completeOnboarding } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [stages, setStages] = useState(
    user?.lifeStages?.length ? user.lifeStages : ['general']
  );
  const [goals, setGoals] = useState(user?.goals || []);
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
    if (step === 0 && !stages.length) return 'Choose at least one focus to continue.';
    if (step === 1 && !goals.length) return 'Choose at least one goal — it helps us shape your space.';
    if (step === 1 && age && (Number(age) < 13 || Number(age) > 80)) {
      return 'Please enter an age between 13 and 80, or leave it blank.';
    }
    if (step === 2) {
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
    setStep((current) => Math.min(current + 1, steps.length - 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const back = () => {
    setError('');
    setStep((current) => Math.max(current - 1, 0));
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
      await completeOnboarding({
        lifeStage: 'adult',
        lifeStages: stages,
        focusAreas: [
          ...stages,
          ...(goals.includes('Manage irregular periods') ? ['irregular-periods'] : []),
        ],
        goals,
        age: age || undefined,
        cycleProfile: {
          averageCycleLength: Number(cycleLength),
          averagePeriodLength: Number(periodLength),
          lastPeriodStart: notSure || !lastPeriod ? null : lastPeriod,
        },
      });
      addToast({
        title: 'Your space is ready',
        message: 'Predictions and insights will sharpen with every log.',
      });
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-petal-radial">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-4 py-6 sm:px-6">
        <Logo />
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
          <h1 className="mx-auto mt-2 max-w-2xl font-display text-3xl font-semibold leading-tight text-deep-rose sm:text-[2.6rem]">
            Let&apos;s shape your space around you.
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-muted">
            No perfect answers needed. You can adjust every one of these later.
          </p>
        </div>

        <ol className="mx-auto mb-7 flex max-w-2xl items-start justify-between" aria-label="Onboarding progress">
          {steps.map((item, index) => {
            const active = index === step;
            const complete = index < step;
            return (
              <li key={item.title} className="flex flex-1 flex-col items-center text-center">
                <div className="flex w-full items-center">
                  <span
                    className={cn(
                      'mx-auto flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors',
                      complete
                        ? 'bg-pink-glow text-white'
                        : active
                          ? 'bg-deep-rose text-white'
                          : 'bg-white text-muted ring-1 ring-blush-pink'
                    )}
                    aria-current={active ? 'step' : undefined}
                  >
                    {complete ? <Check className="h-4 w-4" aria-hidden="true" /> : index + 1}
                  </span>
                </div>
                <span
                  className={cn(
                    'mt-2 hidden text-[10px] font-bold uppercase tracking-wide sm:block',
                    active ? 'text-deep-rose' : 'text-muted'
                  )}
                >
                  {item.title}
                </span>
              </li>
            );
          })}
        </ol>

        <div className="mx-auto max-w-3xl overflow-hidden rounded-3xl border border-white/80 bg-white/95 shadow-card">
          <div className="bg-gradient-to-r from-rose-mist via-soft-petal/60 to-rose-mist px-5 py-5 sm:px-8 sm:py-6">
            <p className="eyebrow">
              Step {step + 1} of {steps.length}
            </p>
            <h2 className="mt-1 font-display text-2xl font-semibold text-deep-rose">
              {step === 0
                ? 'What brings you to CycleSense?'
                : step === 1
                  ? 'What would you like to get from tracking?'
                  : 'How would you describe your usual cycle?'}
            </h2>
            <p className="mt-1.5 text-sm leading-relaxed text-muted">
              {step === 0
                ? 'Choose one or more. Your dashboard and education will adapt to what you select.'
                : step === 1
                  ? 'We use these to prioritise the insights and prompts you see.'
                  : 'Estimates are enough. Your averages update automatically as you log.'}
            </p>
          </div>

          <div className="px-5 py-6 sm:px-8 sm:py-8">
            {error ? (
              <div
                className="mb-5 flex items-start gap-2.5 rounded-xl border border-blush-pink bg-rose-mist p-3.5 text-sm text-deep-rose"
                role="alert"
              >
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                <p className="leading-relaxed">{error}</p>
              </div>
            ) : null}

            {step === 0 ? (
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
                          ? 'border-pink-glow bg-soft-petal/70 shadow-soft'
                          : 'border-blush-pink/70 bg-white hover:border-pink-glow/60 hover:bg-rose-mist/60'
                      )}
                    >
                      <span
                        className={cn(
                          'grid h-10 w-10 place-items-center rounded-xl transition-colors',
                          selected ? 'bg-pink-glow text-white' : 'bg-soft-petal text-deep-rose'
                        )}
                      >
                        <Icon className="h-5 w-5" aria-hidden="true" />
                      </span>
                      <span className="mt-3 text-sm font-bold text-deep-rose">{stage.label}</span>
                      <span className="mt-1 text-xs leading-relaxed text-muted">
                        {stage.description}
                      </span>
                      <span
                        className={cn(
                          'absolute right-3.5 top-3.5 grid h-5 w-5 place-items-center rounded-full border transition-colors',
                          selected
                            ? 'border-pink-glow bg-pink-glow text-white'
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

            {step === 1 ? (
              <div>
                <div className="flex flex-wrap gap-2.5">
                  {GOALS.map((goal) => {
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
                    <p className="flex items-center gap-2 text-xs font-bold text-deep-rose">
                      <Sprout className="h-4 w-4 text-pink-glow" aria-hidden="true" />
                      Why we ask
                    </p>
                    <p className="mt-1.5 text-xs leading-relaxed text-muted">
                      Your goals shape the prompts you receive — from preparing for a gynecology
                      visit to understanding perimenopause changes. You can update them any time.
                    </p>
                  </div>
                  <Field label="Your age" htmlFor="age" optional>
                    <input
                      id="age"
                      type="number"
                      min="13"
                      max="80"
                      inputMode="numeric"
                      value={age}
                      onChange={(event) => setAge(event.target.value)}
                      className="input-field"
                      placeholder="e.g. 29"
                    />
                  </Field>
                </div>
              </div>
            ) : null}

            {step === 2 ? (
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
                      <p className="text-sm font-bold text-deep-rose">When did your last period start?</p>
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
                        className="h-4 w-4 rounded border-blush-pink accent-pink-glow"
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
                  <div className="rounded-2xl border border-pink-glow/25 bg-gradient-to-br from-soft-petal/80 to-white p-4 sm:p-5">
                    <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-deep-rose">
                      <CalendarDays className="h-4 w-4" aria-hidden="true" />
                      A first prediction
                    </p>
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wide text-muted">Next period</p>
                        <p className="text-sm font-bold text-deep-rose">{preview.next}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wide text-muted">Estimated fertile window</p>
                        <p className="text-sm font-bold text-deep-rose">
                          {preview.fertileStart} – {preview.fertileEnd}
                        </p>
                      </div>
                    </div>
                    <p className="mt-3 text-[10px] leading-relaxed text-muted">
                      Predictions are estimates based on averages, not a contraceptive method.
                    </p>
                  </div>
                ) : null}

                {selectedStageDetails.some((item) => item.value === 'pcos') ? (
                  <p className="rounded-xl bg-white p-3 text-[11px] leading-relaxed text-muted ring-1 ring-blush-pink/60">
                    You selected PCOS awareness. CycleSense can help you collect patterns for a
                    clinician, but it does not diagnose PCOS.
                  </p>
                ) : null}
              </div>
            ) : null}
          </div>

          <div className="flex flex-col-reverse items-stretch justify-between gap-3 border-t border-blush-pink/40 bg-rose-mist/50 px-5 py-4 sm:flex-row sm:items-center sm:px-8">
            <Button
              variant="ghost"
              onClick={back}
              disabled={step === 0 || saving}
              icon={ArrowLeft}
              className="justify-center sm:justify-start"
            >
              Back
            </Button>
            {step < steps.length - 1 ? (
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

        <p className="mx-auto mt-6 flex max-w-3xl items-start justify-center gap-2 text-center text-[10px] leading-relaxed text-muted">
          <Lock className="mt-0.5 h-3 w-3 shrink-0" aria-hidden="true" />
          Your answers are used only to personalise your experience. You can export or delete them at
          any time from Privacy &amp; data.
        </p>
      </main>
    </div>
  );
};

export default Onboarding;
