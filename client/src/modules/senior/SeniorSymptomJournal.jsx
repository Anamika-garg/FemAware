import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Activity,
  AlertCircle,
  Brain,
  CalendarDays,
  Check,
  Droplets,
  HeartPulse,
  Moon,
  NotebookPen,
  Pencil,
  RotateCcw,
  Save,
  ShieldAlert,
  Sparkles,
  Thermometer,
  Trash2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import api, { getErrorMessage } from '../../lib/api';
import {
  formatDate,
  formatLongDate,
  relativeDay,
  todayISO,
} from '../../lib/dates';
import PageHeader from '../../components/ui/PageHeader';
import { CardSkeleton, EmptyState, ErrorState } from '../../components/ui/States';
import SeniorPageShell from './SeniorPageShell';
import SeniorConfirmDialog from './SeniorConfirmDialog';
import {
  ENERGY_LABELS,
  MEMORY_LABELS,
  SENIOR_LEVELS,
  SENIOR_LEVEL_LABELS,
  SENIOR_MOOD_OPTIONS,
  SLEEP_LABELS,
  WELLBEING_LABELS,
  buildSeniorPayload,
  createSeniorForm,
  daysAgoISO,
  formFromLog,
} from './seniorUtils';
import { cn } from '../../lib/utils';

const RATING_LABELS = {
  sleepQuality: SLEEP_LABELS,
  memoryClarity: MEMORY_LABELS,
  emotionalWellbeing: WELLBEING_LABELS,
  energyLevel: ENERGY_LABELS,
};

const RANGE_FILTERS = [
  { value: '7', label: 'Last 7 days' },
  { value: '30', label: 'Last 30 days' },
  { value: '90', label: 'Last 90 days' },
  { value: 'all', label: 'All entries' },
];

const SectionCard = ({ icon: Icon, title, description, children, id }) => (
  <section className="rounded-3xl border-2 border-blush-pink/60 bg-rose-mist/40 p-4 sm:p-5" aria-labelledby={id}>
    <div className="flex items-start gap-3">
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-white text-deep-rose shadow-sm">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <div>
        <h3 id={id} className="font-display text-lg font-semibold text-deep-rose">
          {title}
        </h3>
        {description ? <p className="mt-0.5 text-sm leading-relaxed text-muted">{description}</p> : null}
      </div>
    </div>
    <div className="mt-4 space-y-4">{children}</div>
  </section>
);

const ChoiceScale = ({ legend, hint, value, onChange, options = SENIOR_LEVELS, columns = 4 }) => (
  <fieldset>
    <legend className="text-base font-bold text-ink">{legend}</legend>
    {hint ? <p className="mt-0.5 text-sm text-muted">{hint}</p> : null}
    <div
      className={cn('mt-2.5 grid gap-2', columns === 2 ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-4')}
      role="radiogroup"
      aria-label={legend}
    >
      {options.map((option) => {
        const active = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(option.value)}
            className={cn('senior-choice text-base', active && 'senior-choice-active')}
          >
            {active ? <Check className="h-4 w-4" aria-hidden="true" /> : null}
            {option.label}
          </button>
        );
      })}
    </div>
  </fieldset>
);

const RatingScale = ({ field, legend, hint, value, onChange }) => {
  const labels = RATING_LABELS[field] || {};
  return (
    <fieldset>
      <legend className="text-base font-bold text-ink">{legend}</legend>
      {hint ? <p className="mt-0.5 text-sm text-muted">{hint}</p> : null}
      <div className="mt-2.5 grid grid-cols-5 gap-1.5 sm:gap-2" role="radiogroup" aria-label={legend}>
        {[1, 2, 3, 4, 5].map((rating) => {
          const active = Number(value) === rating;
          return (
            <button
              key={rating}
              type="button"
              role="radio"
              aria-checked={active}
              aria-label={`${rating} out of 5 — ${labels[rating] || ''}`}
              onClick={() => onChange(rating)}
              className={cn(
                'flex min-h-[64px] flex-col items-center justify-center gap-0.5 rounded-xl border-2 px-1 py-2 transition-colors',
                active
                  ? 'border-deep-rose bg-deep-rose text-white'
                  : 'border-blush-pink bg-white text-deep-rose hover:border-pink-glow hover:bg-soft-petal/60'
              )}
            >
              <span className="text-lg font-bold leading-none">{rating}</span>
              <span className="text-center text-[10px] font-semibold leading-tight sm:text-xs">
                {labels[rating] || ''}
              </span>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
};

const levelSummary = (log) => {
  const details = log.senior || {};
  return [
    details.hotFlashCount > 0
      ? `${details.hotFlashCount} hot flash${details.hotFlashCount === 1 ? '' : 'es'}`
      : null,
    details.nightSweats && details.nightSweats !== 'none'
      ? `Night sweats: ${SENIOR_LEVEL_LABELS[details.nightSweats]}`
      : null,
    details.daytimeExhaustion && details.daytimeExhaustion !== 'none'
      ? `Fatigue: ${SENIOR_LEVEL_LABELS[details.daytimeExhaustion]}`
      : null,
    details.jointStiffness && details.jointStiffness !== 'none'
      ? `Joints: ${SENIOR_LEVEL_LABELS[details.jointStiffness]}`
      : null,
    details.bladderUrgency && details.bladderUrgency !== 'none'
      ? `Bladder: ${SENIOR_LEVEL_LABELS[details.bladderUrgency]}`
      : null,
    details.vaginalDryness && details.vaginalDryness !== 'none'
      ? `Dryness: ${SENIOR_LEVEL_LABELS[details.vaginalDryness]}`
      : null,
    details.sleepQuality ? `Sleep ${details.sleepQuality}/5` : null,
    details.emotionalWellbeing ? `Mood ${details.emotionalWellbeing}/5` : null,
    details.memoryClarity ? `Memory ${details.memoryClarity}/5` : null,
  ].filter(Boolean);
};

const SeniorSymptomJournal = () => {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  const [form, setForm] = useState(createSeniorForm());
  const [editingId, setEditingId] = useState(null);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [rangeFilter, setRangeFilter] = useState('30');
  const [exactDate, setExactDate] = useState('');
  const [visibleCount, setVisibleCount] = useState(8);

  const hydrated = useRef(false);
  const today = todayISO();

  const load = useCallback(async () => {
    if (!user?._id) return;
    setLoading(true);
    setError('');
    try {
      const response = await api.get(`/symptoms/${user._id}`, { params: { limit: 365 } });
      const fetched = response.data.logs || [];
      setLogs(fetched);
      setTotal(response.data.total ?? fetched.length);

      if (!hydrated.current) {
        hydrated.current = true;
        const todayLog = fetched.find((log) => log.date === today);
        if (todayLog) {
          setForm(formFromLog(todayLog));
          setEditingId(todayLog._id);
        }
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [user?._id, today]);

  useEffect(() => {
    load();
  }, [load, refreshKey]);

  const set = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
    setFormError('');
  };

  const toggleMood = (mood) => {
    setForm((current) => ({
      ...current,
      mood: current.mood.includes(mood)
        ? current.mood.filter((item) => item !== mood)
        : [...current.mood, mood],
    }));
  };

  const startEdit = (log) => {
    setForm(formFromLog(log));
    setEditingId(log._id);
    setFormError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setEditingId(null);
    setForm(createSeniorForm());
    setFormError('');
  };

  const handleDateChange = (date) => {
    setFormError('');
    setForm((current) => ({ ...current, date }));
    if (!date) return;
    const existing = logs.find((log) => log.date === date);
    if (existing) {
      setForm(formFromLog(existing));
      setEditingId(existing._id);
    } else {
      setEditingId(null);
    }
  };

  const submit = async (event) => {
    event.preventDefault();
    setFormError('');

    if (!form.date) return setFormError('Choose the date you are recording.');
    if (form.date > today) return setFormError('You cannot record a check-in for a future date.');
    if (form.sleepHours !== '' && (Number(form.sleepHours) < 0 || Number(form.sleepHours) > 24)) {
      return setFormError('Hours slept should be between 0 and 24.');
    }
    if (Number(form.hotFlashCount) < 0 || Number(form.hotFlashCount) > 30) {
      return setFormError('Please enter a hot flash count between 0 and 30.');
    }

    setSaving(true);
    try {
      const payload = buildSeniorPayload(form);
      const response = editingId
        ? await api.put(`/symptoms/${editingId}`, payload)
        : await api.post('/symptoms', payload);

      const saved = response.data.log || response.data.symptom;
      if (saved) {
        setLogs((current) => {
          const without = current.filter((log) => log._id !== saved._id && log.date !== saved.date);
          return [saved, ...without].sort((a, b) => b.date.localeCompare(a.date));
        });
      } else {
        setRefreshKey((key) => key + 1);
      }

      setEditingId(saved?._id || editingId);
      setForm(formFromLog(saved || { ...payload, _id: editingId }));
      addToast({
        title: editingId ? 'Check-in updated' : 'Check-in saved',
        message: 'Thank you for taking a moment for yourself today.',
      });
    } catch (err) {
      setFormError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/symptoms/${deleteTarget._id}`);
      setLogs((current) => current.filter((log) => log._id !== deleteTarget._id));
      setTotal((current) => Math.max(0, current - 1));
      if (editingId === deleteTarget._id) resetForm();
      setDeleteTarget(null);
      addToast({ title: 'Entry deleted', message: 'That check-in has been removed.' });
    } catch (err) {
      addToast({ type: 'error', title: 'Could not delete entry', message: getErrorMessage(err) });
    } finally {
      setDeleting(false);
    }
  };

  const filteredLogs = useMemo(() => {
    let result = logs;
    if (rangeFilter !== 'all') {
      const from = daysAgoISO(Number(rangeFilter) - 1);
      result = result.filter((log) => log.date >= from);
    }
    if (exactDate) result = result.filter((log) => log.date === exactDate);
    return result;
  }, [logs, rangeFilter, exactDate, today]);

  const visibleLogs = filteredLogs.slice(0, visibleCount);
  const loggedToday = logs.some((log) => log.date === today);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-16 rounded-2xl skeleton" />
        <CardSkeleton rows={10} />
        <CardSkeleton rows={5} />
      </div>
    );
  }

  if (error) {
    return (
      <SeniorPageShell>
        <ErrorState message={error} onRetry={() => setRefreshKey((key) => key + 1)} />
      </SeniorPageShell>
    );
  }

  return (
    <SeniorPageShell>
      <PageHeader
        eyebrow="Daily check-in"
        title="How are you feeling today?"
        description="There are no right answers. Share what you notice, and skip anything that does not apply. This record is for you and your clinician."
      />

      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/80 px-3 py-1.5 text-sm font-bold text-deep-rose">
          <CalendarDays className="h-4 w-4" aria-hidden="true" />
          {formatLongDate(today)}
        </span>
        {loggedToday ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-soft-petal px-3 py-1.5 text-sm font-bold text-deep-rose">
            <Check className="h-4 w-4" aria-hidden="true" />
            Today’s check-in is saved
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/80 px-3 py-1.5 text-sm font-semibold text-muted">
            <NotebookPen className="h-4 w-4" aria-hidden="true" />
            No check-in yet today
          </span>
        )}
      </div>

      <form onSubmit={submit} noValidate className="space-y-5">
        <section className="senior-card space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="eyebrow">{editingId ? 'Editing an entry' : 'New entry'}</p>
              <h2 className="senior-section-title mt-1">
                {editingId ? 'Update your check-in' : 'Today’s check-in'}
              </h2>
            </div>
            {editingId ? (
              <button
                type="button"
                onClick={resetForm}
                className="senior-button border-2 border-blush-pink bg-white text-deep-rose hover:bg-soft-petal"
              >
                <RotateCcw className="h-4 w-4" aria-hidden="true" />
                Start a new entry
              </button>
            ) : null}
          </div>

          <div>
            <label htmlFor="senior-journal-date" className="text-base font-bold text-ink">
              Date
            </label>
            <p className="mt-0.5 text-sm text-muted">
              Choose today, or an earlier day you would like to record.
            </p>
            <input
              id="senior-journal-date"
              type="date"
              value={form.date}
              max={today}
              onChange={(event) => handleDateChange(event.target.value)}
              className="senior-input mt-2"
              required
            />
          </div>

          {formError ? (
            <div
              role="alert"
              className="flex items-start gap-2.5 rounded-2xl border-2 border-deep-rose/30 bg-rose-mist px-4 py-3"
            >
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-deep-rose" aria-hidden="true" />
              <p className="text-base font-medium text-deep-rose">{formError}</p>
            </div>
          ) : null}

          <SectionCard
            id="sleep-section"
            icon={Moon}
            title="Sleep & fatigue"
            description="Rest has a strong effect on how the rest of the day feels."
          >
            <RatingScale
              field="sleepQuality"
              legend="How well did you sleep?"
              hint="Think about how rested you felt when you woke."
              value={form.sleepQuality}
              onChange={(value) => set('sleepQuality', value)}
            />
            <div>
              <label htmlFor="senior-sleep-hours" className="text-base font-bold text-ink">
                Hours slept <span className="font-medium text-muted">(optional)</span>
              </label>
              <input
                id="senior-sleep-hours"
                type="number"
                min="0"
                max="24"
                step="0.5"
                inputMode="decimal"
                value={form.sleepHours}
                onChange={(event) => set('sleepHours', event.target.value)}
                placeholder="For example, 7"
                className="senior-input mt-2"
              />
            </div>
            <ChoiceScale
              legend="Night sweats"
              hint="Waking up damp or overheated during the night."
              value={form.nightSweats}
              onChange={(value) => set('nightSweats', value)}
            />
            <ChoiceScale
              legend="Daytime exhaustion"
              hint="Feeling drained during the day, even after resting."
              value={form.daytimeExhaustion}
              onChange={(value) => set('daytimeExhaustion', value)}
            />
          </SectionCard>

          <SectionCard
            id="temperature-section"
            icon={Thermometer}
            title="Temperature & comfort"
            description="Hot flashes can be brief or linger. Recording frequency helps spot patterns."
          >
            <div>
              <label htmlFor="senior-hot-flash-count" className="text-base font-bold text-ink">
                How many hot flashes did you notice today?
              </label>
              <input
                id="senior-hot-flash-count"
                type="number"
                min="0"
                max="30"
                step="1"
                inputMode="numeric"
                value={form.hotFlashCount}
                onChange={(event) => set('hotFlashCount', event.target.value)}
                className="senior-input mt-2"
              />
            </div>
            <ChoiceScale
              legend="Overall hot flash severity"
              value={form.hotFlashSeverity}
              onChange={(value) => set('hotFlashSeverity', value)}
            />
          </SectionCard>

          <SectionCard
            id="intimate-section"
            icon={Droplets}
            title="Intimate & urinary health"
            description="These changes are common after menopause and treatable. Share only what feels comfortable."
          >
            <ChoiceScale
              legend="Vaginal dryness"
              value={form.vaginalDryness}
              onChange={(value) => set('vaginalDryness', value)}
            />
            <ChoiceScale
              legend="Bladder urgency"
              hint="A sudden, strong need to pass urine."
              value={form.bladderUrgency}
              onChange={(value) => set('bladderUrgency', value)}
            />
            <ChoiceScale
              legend="Pelvic discomfort"
              hint="Pressure, heaviness or discomfort in the pelvic area."
              value={form.pelvicComfort}
              onChange={(value) => set('pelvicComfort', value)}
            />
          </SectionCard>

          <SectionCard
            id="bone-section"
            icon={Activity}
            title="Bone & joint wellbeing"
            description="Stiffness and bone comfort can change with activity, sleep and weather."
          >
            <ChoiceScale
              legend="Joint stiffness"
              value={form.jointStiffness}
              onChange={(value) => set('jointStiffness', value)}
            />
            <ChoiceScale
              legend="Bone discomfort"
              value={form.boneDiscomfort}
              onChange={(value) => set('boneDiscomfort', value)}
            />
            <div>
              <label htmlFor="senior-mobility-notes" className="text-base font-bold text-ink">
                Mobility notes <span className="font-medium text-muted">(optional)</span>
              </label>
              <p className="mt-0.5 text-sm text-muted">
                What helped or made movement harder today? Walks, stairs, rest?
              </p>
              <textarea
                id="senior-mobility-notes"
                rows={3}
                maxLength={500}
                value={form.mobilityNotes}
                onChange={(event) => set('mobilityNotes', event.target.value)}
                className="senior-input mt-2 min-h-[96px] resize-y"
                placeholder="For example: a morning walk helped loosen my knees."
              />
            </div>
          </SectionCard>

          <SectionCard
            id="mood-section"
            icon={Brain}
            title="Mood & memory"
            description="Emotional wellbeing and memory can shift with sleep, stress and hormones."
          >
            <RatingScale
              field="energyLevel"
              legend="Energy today"
              value={form.energyLevel}
              onChange={(value) => set('energyLevel', value)}
            />
            <RatingScale
              field="emotionalWellbeing"
              legend="Emotional wellbeing"
              value={form.emotionalWellbeing}
              onChange={(value) => set('emotionalWellbeing', value)}
            />
            <RatingScale
              field="memoryClarity"
              legend="Memory and focus"
              value={form.memoryClarity}
              onChange={(value) => set('memoryClarity', value)}
            />

            <fieldset>
              <legend className="text-base font-bold text-ink">Words that fit today</legend>
              <p className="mt-0.5 text-sm text-muted">Choose any that feel true. You can skip this.</p>
              <div className="mt-2.5 flex flex-wrap gap-2">
                {SENIOR_MOOD_OPTIONS.map((mood) => {
                  const active = form.mood.includes(mood);
                  return (
                    <button
                      key={mood}
                      type="button"
                      aria-pressed={active}
                      onClick={() => toggleMood(mood)}
                      className={cn(
                        'senior-choice min-h-[48px] px-4 text-base',
                        active && 'senior-choice-active'
                      )}
                    >
                      {active ? <Check className="h-4 w-4" aria-hidden="true" /> : null}
                      {mood}
                    </button>
                  );
                })}
              </div>
            </fieldset>

            <div>
              <label htmlFor="senior-memory-notes" className="text-base font-bold text-ink">
                Memory notes <span className="font-medium text-muted">(optional)</span>
              </label>
              <textarea
                id="senior-memory-notes"
                rows={3}
                maxLength={500}
                value={form.memoryNotes}
                onChange={(event) => set('memoryNotes', event.target.value)}
                className="senior-input mt-2 min-h-[96px] resize-y"
                placeholder="For example: word-finding felt harder in the afternoon."
              />
            </div>
          </SectionCard>

          <div className="rounded-3xl border-2 border-blush-pink bg-soft-petal/40 p-4 sm:p-5">
            <label
              htmlFor="senior-bleeding"
              className="flex cursor-pointer items-start gap-3 rounded-2xl bg-white p-4"
            >
              <input
                id="senior-bleeding"
                type="checkbox"
                checked={form.postmenopausalBleeding}
                onChange={(event) => set('postmenopausalBleeding', event.target.checked)}
                className="mt-0.5 h-6 w-6 shrink-0 rounded border-2 border-blush-pink text-deep-rose focus:ring-4 focus:ring-pink-glow/30"
              />
              <span>
                <span className="block text-base font-bold text-deep-rose">
                  I noticed vaginal bleeding after menopause
                </span>
                <span className="mt-0.5 block text-sm leading-relaxed text-muted">
                  This is worth mentioning to your clinician promptly, even if it is light or
                  stops on its own. It is not a diagnosis here — just an important note to share.
                </span>
              </span>
            </label>
            {form.postmenopausalBleeding ? (
              <p className="mt-3 flex items-start gap-2 rounded-xl bg-[#FFF0E0] px-3 py-2.5 text-sm font-semibold text-[#8A4510]">
                <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                Please contact your clinician soon. If bleeding is heavy or you feel unwell, seek
                same-day care.
              </p>
            ) : null}
          </div>

          <div>
            <label htmlFor="senior-general-notes" className="text-base font-bold text-ink">
              Anything else you would like to remember?{' '}
              <span className="font-medium text-muted">(optional)</span>
            </label>
            <textarea
              id="senior-general-notes"
              rows={4}
              maxLength={1200}
              value={form.notes}
              onChange={(event) => set('notes', event.target.value)}
              className="senior-input mt-2 min-h-[112px] resize-y"
              placeholder="Sleep, stress, activity, appointments, or anything on your mind."
            />
          </div>

          <div className="flex flex-col gap-3 border-t-2 border-blush-pink/50 pt-5 sm:flex-row sm:justify-end">
            {editingId ? (
              <button
                type="button"
                onClick={resetForm}
                className="senior-button border-2 border-blush-pink bg-white text-deep-rose hover:bg-soft-petal"
              >
                Cancel edit
              </button>
            ) : null}
            <button
              type="submit"
              disabled={saving}
              className="senior-button bg-deep-rose text-white hover:bg-[#a81450]"
            >
              <Save className="h-5 w-5" aria-hidden="true" />
              {saving ? 'Saving…' : editingId ? 'Save changes' : 'Save today’s check-in'}
            </button>
          </div>
        </section>
      </form>

      {/* History */}
      <section className="senior-card" aria-labelledby="senior-history-title">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="eyebrow">Your history</p>
            <h2 id="senior-history-title" className="senior-section-title mt-1">
              Past check-ins
            </h2>
            <p className="mt-1 text-sm text-muted">
              {filteredLogs.length} entr{filteredLogs.length === 1 ? 'y' : 'ies'} shown ·{' '}
              {total} saved in total
            </p>
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="senior-history-date" className="text-sm font-bold text-deep-rose">
              Find a date
            </label>
            <input
              id="senior-history-date"
              type="date"
              value={exactDate}
              max={today}
              onChange={(event) => {
                setExactDate(event.target.value);
                setVisibleCount(8);
              }}
              className="senior-input !min-h-[48px] w-auto"
            />
            {exactDate ? (
              <button
                type="button"
                onClick={() => setExactDate('')}
                className="min-h-[48px] rounded-xl px-3 text-sm font-bold text-deep-rose hover:bg-rose-mist"
              >
                Clear
              </button>
            ) : null}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Filter check-ins by date range">
          {RANGE_FILTERS.map((filter) => {
            const active = rangeFilter === filter.value;
            return (
              <button
                key={filter.value}
                type="button"
                aria-pressed={active}
                onClick={() => {
                  setRangeFilter(filter.value);
                  setVisibleCount(8);
                }}
                className={cn('senior-choice min-h-[48px] px-4 text-base', active && 'senior-choice-active')}
              >
                {filter.label}
              </button>
            );
          })}
        </div>

        {visibleLogs.length ? (
          <ul className="mt-5 space-y-3">
            {visibleLogs.map((log) => {
              const notes = levelSummary(log);
              const isEditing = editingId === log._id;
              return (
                <li
                  key={log._id}
                  className={cn(
                    'rounded-2xl border-2 p-4 transition-colors',
                    isEditing ? 'border-deep-rose bg-rose-mist/70' : 'border-blush-pink/60 bg-white'
                  )}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-base font-bold text-deep-rose">{relativeDay(log.date)}</p>
                        <span className="text-sm font-semibold text-muted">
                          {formatDate(log.date, 'EEEE, d MMMM yyyy')}
                        </span>
                        {isEditing ? (
                          <span className="rounded-full bg-deep-rose px-2.5 py-0.5 text-xs font-bold text-white">
                            Editing
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-1.5 text-sm leading-relaxed text-muted">
                        {notes.length ? notes.join(' · ') : 'No symptoms recorded — a calm day is still a useful record.'}
                      </p>
                      {log.senior?.postmenopausalBleeding ? (
                        <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-[#FFF0E0] px-2.5 py-1 text-xs font-bold text-[#8A4510]">
                          <ShieldAlert className="h-3.5 w-3.5" aria-hidden="true" />
                          Bleeding reported
                        </p>
                      ) : null}
                      {log.notes ? (
                        <p className="mt-2 rounded-xl bg-rose-mist/70 px-3 py-2 text-sm leading-relaxed text-ink">
                          {log.notes}
                        </p>
                      ) : null}
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => startEdit(log)}
                        className="senior-button min-h-[48px] border-2 border-blush-pink bg-white px-4 text-deep-rose hover:bg-soft-petal"
                        aria-label={`Edit the check-in for ${formatDate(log.date)}`}
                      >
                        <Pencil className="h-4 w-4" aria-hidden="true" />
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(log)}
                        className="senior-button min-h-[48px] border-2 border-deep-rose/30 bg-white px-4 text-deep-rose hover:bg-rose-mist"
                        aria-label={`Delete the check-in for ${formatDate(log.date)}`}
                      >
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                        Delete
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <EmptyState
            icon={Sparkles}
            title={exactDate ? 'No entry for that date' : 'No check-ins in this range'}
            description={
              exactDate
                ? 'Try another date, or clear the date search to see all entries.'
                : 'Your saved check-ins will appear here. You can change the date range above.'
            }
            className="mt-5 border-2"
          />
        )}

        {visibleCount < filteredLogs.length ? (
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => setVisibleCount((count) => count + 8)}
              className="senior-button border-2 border-blush-pink bg-white text-deep-rose hover:bg-soft-petal"
            >
              Show more entries
            </button>
          </div>
        ) : null}
      </section>

      <div className="rounded-3xl border-2 border-blush-pink/70 bg-white p-5">
        <div className="flex items-start gap-3">
          <HeartPulse className="mt-0.5 h-5 w-5 shrink-0 text-deep-rose" aria-hidden="true" />
          <p className="text-sm leading-relaxed text-muted">
            Your check-ins are a personal record, not a diagnosis. Bring them to your appointments
            if they help the conversation. If a symptom feels urgent or severe, contact a clinician
            or emergency service rather than waiting for your next entry.
          </p>
        </div>
      </div>

      <SeniorConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        loading={deleting}
        title="Delete this check-in?"
        description={
          deleteTarget ? `This will remove your entry for ${formatDate(deleteTarget.date)}.` : ''
        }
      />
    </SeniorPageShell>
  );
};

export default SeniorSymptomJournal;
