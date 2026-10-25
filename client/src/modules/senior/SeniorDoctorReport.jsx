import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  ClipboardList,
  FileText,
  HeartPulse,
  Loader2,
  Pill,
  Plus,
  Printer,
  Save,
  ShieldAlert,
  Stethoscope,
  Trash2,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import api, { getErrorMessage } from '../../lib/api';
import { formatDate, formatLongDate, todayISO } from '../../lib/dates';
import PageHeader from '../../components/ui/PageHeader';
import { CardSkeleton, ErrorState } from '../../components/ui/States';
import { cn } from '../../lib/utils';
import SeniorPageShell from './SeniorPageShell';
import SeniorConfirmDialog from './SeniorConfirmDialog';
import { SENIOR_LEVEL_LABELS, daysAgoISO } from './seniorUtils';

const RANGES = [
  { value: '30', label: 'Last 30 days' },
  { value: '90', label: 'Last 3 months' },
  { value: '180', label: 'Last 6 months' },
];

const SYMPTOM_FOCUS = [
  'Hot flashes and night sweats',
  'Sleep quality',
  'Joint stiffness and bone health',
  'Bladder and urinary health',
  'Vaginal dryness and intimate comfort',
  'Memory and concentration',
  'Mood and emotional wellbeing',
  'Heart and cardiovascular health',
  'Falls, balance or mobility',
];

const STEPS = [
  { id: 1, title: 'Your concerns', icon: ClipboardList },
  { id: 2, title: 'Medications', icon: Pill },
  { id: 3, title: 'Symptoms', icon: Activity },
  { id: 4, title: 'Review & print', icon: FileText },
];

const ListEditor = ({ draft, setDraft, onAdd, placeholder, items, onRemove, removeLabel }) => (
  <div>
    <div className="flex flex-col gap-2 sm:flex-row">
      <input
        type="text"
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            event.preventDefault();
            onAdd();
          }
        }}
        placeholder={placeholder}
        className="senior-input"
        aria-label={placeholder}
      />
      <button
        type="button"
        onClick={onAdd}
        className="senior-button shrink-0 border-2 border-blush-pink bg-white text-deep-rose hover:bg-soft-petal"
      >
        <Plus className="h-5 w-5" aria-hidden="true" />
        Add
      </button>
    </div>
    {items.length ? (
      <ul className="mt-3 space-y-2">
        {items.map((item, index) => (
          <li
            key={`${item}-${index}`}
            className="flex items-start gap-3 rounded-2xl border-2 border-blush-pink/60 bg-white px-4 py-3"
          >
            <span className="mt-1 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-soft-petal text-xs font-semibold text-deep-rose">
              {index + 1}
            </span>
            <span className="min-w-0 flex-1 text-base leading-relaxed text-ink">{item}</span>
            <button
              type="button"
              onClick={() => onRemove(index)}
              className="grid h-11 w-11 shrink-0 place-items-center rounded-xl text-muted hover:bg-rose-mist hover:text-deep-rose"
              aria-label={`${removeLabel}: ${item}`}
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </li>
        ))}
      </ul>
    ) : (
      <p className="mt-3 rounded-2xl bg-rose-mist/70 px-4 py-3 text-sm text-muted">
        Nothing added yet. You can also skip this step and come back later.
      </p>
    )}
  </div>
);

const StatBox = ({ label, value, helper }) => (
  <div className="rounded-2xl bg-rose-mist/80 p-3 text-center">
    <p className="font-display text-xl text-ink">{value ?? '—'}</p>
    <p className="mt-0.5 text-xs font-semibold text-muted">{label}</p>
    {helper ? <p className="mt-1 text-xs leading-snug text-muted">{helper}</p> : null}
  </div>
);

const SeniorDoctorReport = () => {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [step, setStep] = useState(1);
  const [range, setRange] = useState('90');
  const [visitDate, setVisitDate] = useState('');
  const [concerns, setConcerns] = useState(() =>
    (user?.clinicianQuestions || []).filter(Boolean).slice(0, 15)
  );
  const [concernDraft, setConcernDraft] = useState('');
  const [medications, setMedications] = useState([]);
  const [medicationDraft, setMedicationDraft] = useState('');
  const [symptomFocus, setSymptomFocus] = useState([]);
  const [symptomNotes, setSymptomNotes] = useState('');

  const [snapshot, setSnapshot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [savedReports, setSavedReports] = useState([]);
  const [activeReportId, setActiveReportId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const dateRange = useMemo(() => {
    const to = todayISO();
    return { from: daysAgoISO(Number(range) - 1), to };
  }, [range]);

  const buildConcerns = useCallback(() => {
    const focus = symptomFocus.map((item) => `I would like to discuss ${item.toLowerCase()}.`);
    const notes = symptomNotes.trim() ? [`About my symptoms: ${symptomNotes.trim()}`] : [];
    return [...concerns, ...focus, ...notes]
      .map((item) => String(item).trim())
      .filter(Boolean)
      .slice(0, 15);
  }, [concerns, symptomFocus, symptomNotes]);

  const payload = useCallback(
    () => ({
      from: dateRange.from,
      to: dateRange.to,
      concerns: buildConcerns(),
      medications,
      visitDate: visitDate || null,
      careContext: 'senior',
    }),
    [dateRange.from, dateRange.to, buildConcerns, medications, visitDate]
  );

  const generatePreview = useCallback(
    async ({ silent = false } = {}) => {
      if (silent) setLoading(true);
      else setGenerating(true);
      setError('');
      try {
        const response = await api.post('/reports/preview', payload());
        setSnapshot(response.data.snapshot);
        setActiveReportId(null);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
        setGenerating(false);
      }
    },
    [payload]
  );

  const loadSaved = useCallback(async () => {
    try {
      const response = await api.get('/reports');
      setSavedReports(response.data.reports || []);
    } catch {
      // A saved-report fetch failure should not block preparing a visit.
    }
  }, []);

  useEffect(() => {
    generatePreview({ silent: true });
    loadSaved();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addConcern = () => {
    const value = concernDraft.trim();
    if (!value) return;
    setConcerns((current) => (current.length >= 15 ? current : [...current, value]));
    setConcernDraft('');
  };

  const addMedication = () => {
    const value = medicationDraft.trim();
    if (!value) return;
    setMedications((current) => (current.length >= 15 ? current : [...current, value]));
    setMedicationDraft('');
  };

  const toggleFocus = (item) => {
    setSymptomFocus((current) =>
      current.includes(item) ? current.filter((value) => value !== item) : [...current, item]
    );
  };

  const goToStep = async (next) => {
    if (next === 4) {
      setStep(4);
      await generatePreview();
      return;
    }
    setStep(next);
  };

  const saveReport = async () => {
    setSaving(true);
    try {
      const response = await api.post('/reports', {
        ...payload(),
        title: `Postmenopause care summary · ${formatDate(dateRange.from, 'd MMM')} – ${formatDate(
          dateRange.to,
          'd MMM yyyy'
        )}`,
        questions: buildConcerns(),
        notes: symptomNotes.trim(),
      });
      const report = response.data.report;
      setActiveReportId(report._id);
      setSnapshot(report.snapshot);
      addToast({
        title: 'Visit summary saved',
        message: 'You can reopen, print or delete it from your saved summaries.',
      });
      loadSaved();
    } catch (err) {
      addToast({ type: 'error', title: 'Could not save summary', message: getErrorMessage(err) });
    } finally {
      setSaving(false);
    }
  };

  const openSaved = async (report) => {
    setGenerating(true);
    try {
      const response = await api.get(`/reports/${report._id}`);
      const saved = response.data.report;
      const appointment = saved.snapshot?.appointment;
      if (appointment) {
        setVisitDate(appointment.visitDate || '');
        setConcerns(appointment.concerns || []);
        setMedications(appointment.medications || []);
      }
      setSnapshot(saved.snapshot);
      setSymptomNotes(saved.notes || '');
      setActiveReportId(saved._id);
      setStep(4);
      addToast({
        title: 'Saved summary opened',
        message: `${formatDate(saved.rangeStart)} – ${formatDate(saved.rangeEnd)}`,
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      addToast({ type: 'error', title: 'Could not open summary', message: getErrorMessage(err) });
    } finally {
      setGenerating(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/reports/${deleteTarget._id}`);
      setSavedReports((current) => current.filter((item) => item._id !== deleteTarget._id));
      if (activeReportId === deleteTarget._id) setActiveReportId(null);
      setDeleteTarget(null);
      addToast({ title: 'Summary deleted' });
    } catch (err) {
      addToast({ type: 'error', title: 'Could not delete summary', message: getErrorMessage(err) });
    } finally {
      setDeleting(false);
    }
  };

  const seniorSummary = snapshot?.seniorSummary;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-16 rounded-2xl skeleton" />
        <CardSkeleton rows={8} />
        <CardSkeleton rows={5} />
      </div>
    );
  }

  if (error && !snapshot) {
    return (
      <SeniorPageShell>
        <ErrorState message={error} onRetry={() => generatePreview({ silent: true })} />
      </SeniorPageShell>
    );
  }

  return (
    <SeniorPageShell>
      <PageHeader
        eyebrow="Appointment planner"
        title="Prepare for your doctor visit"
        description="Gather your concerns, medications and recent symptoms in one place. Print a clear summary to take with you."
      />

      {/* Stepper */}
      <nav aria-label="Appointment planner steps" className="rounded-3xl border-2 border-blush-pink/60 bg-white/80 p-3">
        <ol className="grid grid-cols-2 gap-2 lg:grid-cols-4">
          {STEPS.map((item) => {
            const Icon = item.icon;
            const active = step === item.id;
            const complete = step > item.id;
            return (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => goToStep(item.id)}
                  aria-current={active ? 'step' : undefined}
                  className={cn(
                    'flex min-h-[56px] w-full items-center gap-2.5 rounded-2xl border-2 px-3 py-2 text-left transition-colors',
                    active
                      ? 'border-deep-rose bg-deep-rose text-white'
                      : complete
                        ? 'border-blush-pink bg-soft-petal/70 text-deep-rose'
                        : 'border-blush-pink/60 bg-white text-muted hover:border-pink-glow hover:text-deep-rose'
                  )}
                >
                  <span
                    className={cn(
                      'grid h-8 w-8 shrink-0 place-items-center rounded-full text-sm font-semibold',
                      active ? 'bg-white/20 text-white' : 'bg-rose-mist text-deep-rose'
                    )}
                  >
                    {complete ? <Check className="h-4 w-4" aria-hidden="true" /> : item.id}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-xs font-semibold opacity-80">
                      Step {item.id}
                    </span>
                    <span className="block truncate text-sm font-semibold">{item.title}</span>
                  </span>
                  <Icon className="ml-auto hidden h-4 w-4 shrink-0 opacity-70 sm:block" aria-hidden="true" />
                </button>
              </li>
            );
          })}
        </ol>
      </nav>

      {error ? (
        <div role="alert" className="flex items-start gap-2.5 rounded-2xl border-2 border-deep-rose/30 bg-rose-mist px-4 py-3">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-deep-rose" aria-hidden="true" />
          <p className="text-base font-medium text-deep-rose">{error}</p>
        </div>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-[1.15fr_1fr]">
        {/* Wizard */}
        <section className="senior-card" aria-labelledby="wizard-title">
          <p className="eyebrow">Step {step} of 4</p>
          <h2 id="wizard-title" className="senior-section-title mt-1">
            {STEPS[step - 1].title}
          </h2>

          {step === 1 ? (
            <div className="mt-5 space-y-5">
              <div>
                <label htmlFor="visit-date" className="text-base font-semibold text-ink">
                  When is your appointment? <span className="font-medium text-muted">(optional)</span>
                </label>
                <p className="mt-0.5 text-sm text-muted">
                  Adding the date helps you print the summary at the right time.
                </p>
                <input
                  id="visit-date"
                  type="date"
                  value={visitDate}
                  onChange={(event) => setVisitDate(event.target.value)}
                  className="senior-input mt-2"
                />
              </div>

              <div>
                <h3 className="text-base font-semibold text-ink">What would you like to discuss?</h3>
                <p className="mt-0.5 text-sm leading-relaxed text-muted">
                  Add one concern at a time, in your own words. There is no wrong way to phrase it.
                </p>
                <div className="mt-2.5">
                  <ListEditor
                    draft={concernDraft}
                    setDraft={setConcernDraft}
                    onAdd={addConcern}
                    placeholder="For example: I would like to review my bone health."
                    items={concerns}
                    onRemove={(index) =>
                      setConcerns((current) => current.filter((_, position) => position !== index))
                    }
                    removeLabel="Remove concern"
                  />
                </div>
              </div>
            </div>
          ) : null}

          {step === 2 ? (
            <div className="mt-5 space-y-5">
              <div>
                <h3 className="text-base font-semibold text-ink">
                  Medicines, vitamins and supplements
                </h3>
                <p className="mt-0.5 text-sm leading-relaxed text-muted">
                  Include the name and dose if you know it, for example “Vitamin D3 1000 IU daily”.
                  This helps your clinician review interactions.
                </p>
                <div className="mt-2.5">
                  <ListEditor
                    draft={medicationDraft}
                    setDraft={setMedicationDraft}
                    onAdd={addMedication}
                    placeholder="For example: Calcium citrate 500 mg twice daily"
                    items={medications}
                    onRemove={(index) =>
                      setMedications((current) => current.filter((_, position) => position !== index))
                    }
                    removeLabel="Remove medication"
                  />
                </div>
              </div>
              <div className="rounded-2xl border-2 border-blush-pink/60 bg-rose-mist/70 p-4">
                <p className="text-sm leading-relaxed text-muted">
                  If you are unsure about a dose, add the medicine name and bring the packet or a
                  photo to your appointment. Never stop a prescribed medicine without advice.
                </p>
              </div>
            </div>
          ) : null}

          {step === 3 ? (
            <div className="mt-5 space-y-5">
              <div>
                <h3 className="text-base font-semibold text-ink">Which symptoms should we include?</h3>
                <p className="mt-0.5 text-sm leading-relaxed text-muted">
                  Choose any topics you would like your clinician to know about. Your saved
                  check-ins are summarised automatically.
                </p>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {SYMPTOM_FOCUS.map((item) => {
                    const active = symptomFocus.includes(item);
                    return (
                      <button
                        key={item}
                        type="button"
                        aria-pressed={active}
                        onClick={() => toggleFocus(item)}
                        className={cn(
                          'senior-choice min-h-[52px] justify-start px-3.5 text-left text-base',
                          active && 'senior-choice-active'
                        )}
                      >
                        <span
                          className={cn(
                            'grid h-5 w-5 shrink-0 place-items-center rounded border-2',
                            active ? 'border-white bg-white/20' : 'border-blush-pink bg-white'
                          )}
                          aria-hidden="true"
                        >
                          {active ? <Check className="h-3.5 w-3.5" /> : null}
                        </span>
                        {item}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label htmlFor="symptom-notes" className="text-base font-semibold text-ink">
                  Anything else about your symptoms?{' '}
                  <span className="font-medium text-muted">(optional)</span>
                </label>
                <p className="mt-0.5 text-sm text-muted">
                  Changes in timing, what helps, or what worries you most.
                </p>
                <textarea
                  id="symptom-notes"
                  rows={4}
                  maxLength={1200}
                  value={symptomNotes}
                  onChange={(event) => setSymptomNotes(event.target.value)}
                  className="senior-input mt-2 min-h-[112px] resize-y"
                  placeholder="For example: night sweats are waking me twice a week, and my knees feel stiff in the morning."
                />
              </div>

              <div>
                <h3 className="text-base font-semibold text-ink">How far back should we look?</h3>
                <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3" role="radiogroup" aria-label="Summary period">
                  {RANGES.map((option) => {
                    const active = range === option.value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        role="radio"
                        aria-checked={active}
                        onClick={() => setRange(option.value)}
                        className={cn('senior-choice text-base', active && 'senior-choice-active')}
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>
                <p className="mt-2 text-sm text-muted">
                  Summary covers {formatDate(dateRange.from)} to {formatDate(dateRange.to)}.
                </p>
              </div>
            </div>
          ) : null}

          {step === 4 ? (
            <div className="mt-5 space-y-5">
              <div className="rounded-2xl border-2 border-blush-pink/60 bg-rose-mist/60 p-4">
                <p className="text-base leading-relaxed text-ink">
                  Your summary is ready below. Check that the details look right, then print it or
                  save it to your account.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => generatePreview()}
                    disabled={generating}
                    className="senior-button border-2 border-blush-pink bg-white text-deep-rose hover:bg-soft-petal"
                  >
                    {generating ? <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" /> : null}
                    {generating ? 'Updating…' : 'Update summary'}
                  </button>
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="senior-button bg-deep-rose text-white hover:bg-[#A3134C]"
                  >
                    <Printer className="h-5 w-5" aria-hidden="true" />
                    Print summary
                  </button>
                  <button
                    type="button"
                    onClick={saveReport}
                    disabled={saving || !snapshot}
                    className="senior-button border-2 border-blush-pink bg-white text-deep-rose hover:bg-soft-petal"
                  >
                    <Save className="h-5 w-5" aria-hidden="true" />
                    {saving ? 'Saving…' : activeReportId ? 'Save a copy' : 'Save summary'}
                  </button>
                </div>
              </div>

              <div className="rounded-2xl border-2 border-blush-pink/60 bg-white p-4">
                <h3 className="text-base font-semibold text-deep-rose">Before you print</h3>
                <ul className="mt-2 space-y-1.5 text-sm leading-relaxed text-muted">
                  <li className="flex gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-deep-rose" aria-hidden="true" />
                    The print preview will include only the medical summary, not the rest of this
                    page.
                  </li>
                  <li className="flex gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-deep-rose" aria-hidden="true" />
                    Bring your medication list or packets as well — the summary is a backup.
                  </li>
                  <li className="flex gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-deep-rose" aria-hidden="true" />
                    This summary is self-reported information, not a diagnosis.
                  </li>
                </ul>
              </div>
            </div>
          ) : null}

          <div className="mt-6 flex flex-col gap-2 border-t-2 border-blush-pink/50 pt-5 sm:flex-row sm:justify-between">
            <button
              type="button"
              onClick={() => setStep((current) => Math.max(1, current - 1))}
              disabled={step === 1}
              className="senior-button border-2 border-blush-pink bg-white text-deep-rose hover:bg-soft-petal disabled:opacity-50"
            >
              <ArrowLeft className="h-5 w-5" aria-hidden="true" />
              Back
            </button>
            {step < 4 ? (
              <button
                type="button"
                onClick={() => goToStep(step + 1)}
                disabled={generating}
                className="senior-button bg-deep-rose text-white hover:bg-[#A3134C]"
              >
                {generating ? <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" /> : null}
                {step === 3 ? 'Review summary' : 'Continue'}
                <ArrowRight className="h-5 w-5" aria-hidden="true" />
              </button>
            ) : (
              <Link
                to="/symptoms"
                className="senior-button border-2 border-blush-pink bg-white text-deep-rose hover:bg-soft-petal"
              >
                Back to check-ins
              </Link>
            )}
          </div>
        </section>

        {/* Live summary preview / sidebar */}
        <div className="space-y-4">
          {seniorSummary ? (
            <section className="senior-card" aria-labelledby="snapshot-glance-title">
              <div className="flex items-start gap-3">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-soft-petal text-deep-rose">
                  <HeartPulse className="h-5 w-5" aria-hidden="true" />
                </span>
                <div>
                  <h2 id="snapshot-glance-title" className="font-display text-lg text-ink">
                    What your check-ins show
                  </h2>
                  <p className="mt-0.5 text-sm text-muted">
                    {formatDate(snapshot.rangeStart)} to {formatDate(snapshot.rangeEnd)}
                  </p>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <StatBox label="Check-ins" value={seniorSummary.checkIns} />
                <StatBox label="Hot flash days" value={seniorSummary.hotFlashDays} />
                <StatBox
                  label="Sleep average"
                  value={
                    seniorSummary.averageSleepQuality !== null
                      ? `${seniorSummary.averageSleepQuality}/5`
                      : '—'
                  }
                />
                <StatBox label="Joint stiffness days" value={seniorSummary.jointStiffnessDays} />
              </div>
              {seniorSummary.bleedingReports > 0 ? (
                <p className="mt-4 flex items-start gap-2 rounded-2xl bg-rose-mist px-3 py-2.5 text-sm font-semibold text-deep-rose">
                  <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                  Bleeding after menopause was recorded. Please mention this first at your
                  appointment.
                </p>
              ) : null}
            </section>
          ) : (
            <section className="senior-card">
              <h2 className="font-display text-lg text-ink">
                Your summary builds here
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                As you add concerns and choose topics, FemAware will prepare a plain-language
                summary from your saved check-ins.
              </p>
            </section>
          )}

          <section className="rounded-3xl border-2 border-blush-pink/70 bg-soft-petal/40 p-5">
            <div className="flex items-center gap-2 text-deep-rose">
              <Stethoscope className="h-5 w-5" aria-hidden="true" />
              <h2 className="font-display text-lg">A calm reminder</h2>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              You do not need every detail to have a useful appointment. Your notes are there to
              support the conversation, not to be perfect.
            </p>
            <Link
              to="/resources"
              className="mt-2 inline-flex min-h-[48px] items-center gap-1 text-sm font-semibold text-deep-rose hover:text-rose-pink"
            >
              Read the visit preparation guide
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </section>
        </div>
      </div>

      {/* Saved summaries */}
      <section className="senior-card" aria-labelledby="saved-summaries-title">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="eyebrow">Saved summaries</p>
            <h2 id="saved-summaries-title" className="senior-section-title mt-1">
              Your past visit summaries
            </h2>
            <p className="mt-1 text-sm text-muted">
              Reopen a summary to print it again or update it with new notes.
            </p>
          </div>
        </div>

        {savedReports.length ? (
          <ul className="mt-4 divide-y-2 divide-rose-mist">
            {savedReports.map((report) => (
              <li key={report._id} className="flex flex-wrap items-center gap-3 py-4 first:pt-2 last:pb-0">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-soft-petal text-deep-rose">
                  <FileText className="h-5 w-5" aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-base font-semibold text-ink">{report.title}</p>
                  <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-sm text-muted">
                    <span className="inline-flex items-center gap-1">
                      <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
                      {formatDate(report.rangeStart)} – {formatDate(report.rangeEnd)}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>Saved {formatLongDate(report.generatedAt)}</span>
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => openSaved(report)}
                    className="senior-button min-h-[48px] border-2 border-blush-pink bg-white px-4 text-deep-rose hover:bg-soft-petal"
                  >
                    Open
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(report)}
                    className="senior-button min-h-[48px] border-2 border-deep-rose/30 bg-white px-4 text-deep-rose hover:bg-rose-mist"
                    aria-label={`Delete summary from ${formatDate(report.rangeStart)}`}
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 rounded-2xl bg-rose-mist/70 px-4 py-4 text-sm text-muted">
            No saved summaries yet. Use “Save summary” when you are happy with the preview.
          </p>
        )}
      </section>

      {/* Printable summary */}
      <section aria-labelledby="printable-title" className="space-y-3">
        <div className="no-print">
          <p className="eyebrow">Print preview</p>
          <h2 id="printable-title" className="section-title mt-1">
            Clinical summary
          </h2>
        </div>

        <div className="print-report rounded-3xl border-2 border-blush-pink bg-white p-6 text-ink shadow-soft sm:p-8">
          <header className="flex flex-wrap items-start justify-between gap-4 border-b-2 border-blush-pink pb-5">
            <div>
              <p className="text-xs font-semibold text-deep-rose">
                FemAware · Senior care
              </p>
              <h2 className="mt-1 font-display text-2xl text-ink">
                Postmenopause care summary
              </h2>
              <p className="mt-1 text-sm text-muted">
                Prepared {snapshot ? formatLongDate(snapshot.generatedAt) : formatLongDate(todayISO())}
              </p>
            </div>
            <div className="text-sm text-muted sm:text-right">
              <p className="text-base font-semibold text-ink">{snapshot?.patient?.name || user?.name}</p>
              <p>
                {snapshot?.patient?.age ? `Age ${snapshot.patient.age}` : 'Age not recorded'}
                {snapshot?.patient?.lifeStage ? ` · ${snapshot.patient.lifeStage}` : ''}
              </p>
              <p>
                {snapshot
                  ? `${formatDate(snapshot.rangeStart)} – ${formatDate(snapshot.rangeEnd)}`
                  : `${formatDate(dateRange.from)} – ${formatDate(dateRange.to)}`}
              </p>
            </div>
          </header>

          {snapshot?.appointment ? (
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="print-avoid-break">
                <h3 className="text-sm font-semibold text-deep-rose">
                  Concerns to discuss
                </h3>
                {snapshot.appointment.concerns?.length ? (
                  <ol className="mt-2 list-decimal space-y-1.5 pl-5 text-sm leading-relaxed">
                    {snapshot.appointment.concerns.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ol>
                ) : (
                  <p className="mt-2 text-sm text-muted">No specific concerns were listed.</p>
                )}
              </div>
              <div className="print-avoid-break">
                <h3 className="text-sm font-semibold text-deep-rose">
                  Current medications
                </h3>
                {snapshot.appointment.medications?.length ? (
                  <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm leading-relaxed">
                    {snapshot.appointment.medications.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-2 text-sm text-muted">No medications were listed.</p>
                )}
                {snapshot.appointment.visitDate ? (
                  <p className="mt-3 text-sm font-semibold text-deep-rose">
                    Appointment: {formatLongDate(snapshot.appointment.visitDate)}
                  </p>
                ) : null}
              </div>
            </div>
          ) : null}

          {seniorSummary ? (
            <div className="mt-6 print-avoid-break">
              <h3 className="text-sm font-semibold text-deep-rose">
                Recent check-in patterns
              </h3>
              <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {[
                  { label: 'Check-ins', value: seniorSummary.checkIns },
                  { label: 'Hot flash days', value: seniorSummary.hotFlashDays },
                  { label: 'Total hot flashes', value: seniorSummary.totalHotFlashes },
                  { label: 'Night sweat days', value: seniorSummary.nightSweatDays },
                  { label: 'Fatigue days', value: seniorSummary.daytimeExhaustionDays },
                  { label: 'Joint stiffness days', value: seniorSummary.jointStiffnessDays },
                  { label: 'Bladder urgency days', value: seniorSummary.bladderUrgencyDays },
                  {
                    label: 'Sleep average',
                    value:
                      seniorSummary.averageSleepQuality !== null
                        ? `${seniorSummary.averageSleepQuality}/5`
                        : '—',
                  },
                  {
                    label: 'Mood average',
                    value:
                      seniorSummary.averageWellbeing !== null
                        ? `${seniorSummary.averageWellbeing}/5`
                        : '—',
                  },
                  {
                    label: 'Memory average',
                    value:
                      seniorSummary.averageMemoryClarity !== null
                        ? `${seniorSummary.averageMemoryClarity}/5`
                        : '—',
                  },
                ].map((item) => (
                  <div key={item.label} className="rounded-xl border border-blush-pink px-2.5 py-2 text-center">
                    <p className="text-base font-semibold text-deep-rose">{item.value}</p>
                    <p className="text-xs font-semibold text-muted">
                      {item.label}
                    </p>
                  </div>
                ))}
              </div>
              {seniorSummary.bleedingReports > 0 ? (
                <p className="mt-3 rounded-xl border-2 border-deep-rose/40 bg-rose-mist px-3 py-2 text-sm font-semibold text-deep-rose">
                  Vaginal bleeding after menopause was recorded{' '}
                  {seniorSummary.bleedingReports} time
                  {seniorSummary.bleedingReports === 1 ? '' : 's'} in this period. Please review
                  promptly.
                </p>
              ) : null}
            </div>
          ) : null}

          {snapshot?.topPhysical?.length ? (
            <div className="mt-6 print-avoid-break">
              <h3 className="text-sm font-semibold text-deep-rose">
                Most frequently logged symptoms
              </h3>
              <table className="mt-2 w-full border-collapse text-sm">
                <caption className="sr-only">Symptoms logged during this period</caption>
                <thead>
                  <tr className="border-b border-blush-pink text-left">
                    <th scope="col" className="py-2 pr-3 font-semibold text-deep-rose">
                      Symptom
                    </th>
                    <th scope="col" className="py-2 pr-3 font-semibold text-deep-rose">
                      Days recorded
                    </th>
                    <th scope="col" className="py-2 font-semibold text-deep-rose">
                      Strongest rating
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {snapshot.topPhysical.slice(0, 8).map((item) => (
                    <tr key={item.name} className="border-b border-blush-pink/50">
                      <td className="py-2 pr-3">{item.name}</td>
                      <td className="py-2 pr-3">{item.count}</td>
                      <td className="py-2 capitalize">{item.worstSeverity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}

          {snapshot?.seniorSummary?.recent?.length ? (
            <div className="mt-6 print-avoid-break">
              <h3 className="text-sm font-semibold text-deep-rose">
                Recent check-ins
              </h3>
              <table className="mt-2 w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-blush-pink text-left">
                    <th scope="col" className="py-2 pr-3 font-semibold text-deep-rose">
                      Date
                    </th>
                    <th scope="col" className="py-2 pr-3 font-semibold text-deep-rose">
                      Hot flashes
                    </th>
                    <th scope="col" className="py-2 pr-3 font-semibold text-deep-rose">
                      Night sweats
                    </th>
                    <th scope="col" className="py-2 pr-3 font-semibold text-deep-rose">
                      Sleep
                    </th>
                    <th scope="col" className="py-2 font-semibold text-deep-rose">
                      Joints
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {snapshot.seniorSummary.recent.slice(-8).map((item) => (
                    <tr key={item.date} className="border-b border-blush-pink/50">
                      <td className="py-2 pr-3">{formatDate(item.date, 'd MMM')}</td>
                      <td className="py-2 pr-3">{item.hotFlashCount || '—'}</td>
                      <td className="py-2 pr-3 capitalize">
                        {SENIOR_LEVEL_LABELS[item.nightSweats] || 'None'}
                      </td>
                      <td className="py-2 pr-3">
                        {item.sleepQuality ? `${item.sleepQuality}/5` : '—'}
                      </td>
                      <td className="py-2 capitalize">
                        {SENIOR_LEVEL_LABELS[item.jointStiffness] || 'None'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}

          {snapshot?.discussionPoints?.length ? (
            <div className="mt-6 print-avoid-break">
              <h3 className="text-sm font-semibold text-deep-rose">
                Questions you may want to ask
              </h3>
              <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm leading-relaxed">
                {snapshot.discussionPoints.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            </div>
          ) : null}

          {symptomNotes.trim() ? (
            <div className="mt-6 print-avoid-break">
              <h3 className="text-sm font-semibold text-deep-rose">
                Your notes
              </h3>
              <p className="mt-2 whitespace-pre-line text-sm leading-relaxed">{symptomNotes.trim()}</p>
            </div>
          ) : null}

          <footer className="mt-6 border-t border-blush-pink pt-4 text-xs leading-relaxed text-muted">
            <p>
              {snapshot?.disclaimer ||
                'This summary is self-reported information for discussion with a qualified clinician. It is not a diagnosis or a substitute for medical advice.'}
            </p>
            <p className="mt-2">
              Generated by FemAware · {snapshot?.patient?.name || user?.name} ·{' '}
              {formatDate(snapshot?.generatedAt || todayISO(), 'd MMMM yyyy')}
            </p>
          </footer>
        </div>
      </section>

      <SeniorConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        loading={deleting}
        title="Delete this saved summary?"
        description={
          deleteTarget
            ? `This will remove the summary covering ${formatDate(deleteTarget.rangeStart)} to ${formatDate(
                deleteTarget.rangeEnd
              )}.`
            : ''
        }
      />
    </SeniorPageShell>
  );
};

export default SeniorDoctorReport;
