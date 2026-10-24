import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  ArrowDownUp,
  CalendarDays,
  Check,
  ChevronDown,
  Clock,
  Droplets,
  Lock,
  Moon,
  NotebookPen,
  Pencil,
  Plus,
  Search,
  Sparkles,
  Sun,
  Trash2,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import api, { getErrorMessage } from '../../lib/api';
import {
  addDays,
  formatDate,
  formatLongDate,
  parseISO,
  relativeDay,
  todayISO,
} from '../../lib/dates';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Field from '../../components/ui/Field';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { CardSkeleton, EmptyState, ErrorState } from '../../components/ui/States';
import {
  ENERGY_LABELS,
  FLOW_OPTIONS,
  MOODS,
  PHYSICAL_SYMPTOM_GROUPS,
  SEVERITY_OPTIONS,
  SEVERITY_STYLES,
} from '../../lib/constants';
import { cn } from '../../lib/utils';

const emptyForm = (date = todayISO()) => ({
  date,
  physical: [],
  mood: [],
  flow: 'none',
  energyLevel: 3,
  sleepHours: '',
  notes: '',
});

const RANGE_FILTERS = [
  { value: '30', label: '30 days' },
  { value: '90', label: '90 days' },
  { value: 'all', label: 'All time' },
];

const MoodTag = ({ children }) => (
  <span className="rounded-full bg-rose-mist px-2 py-0.5 text-[10px] font-medium text-deep-rose/80">
    {children}
  </span>
);

const SymptomJournal = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  const [form, setForm] = useState(emptyForm());
  const [editingId, setEditingId] = useState(null);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [rangeFilter, setRangeFilter] = useState('90');
  const [query, setQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(6);

  const load = useCallback(
    async ({ hydrateToday = false } = {}) => {
      setLoading(true);
      setError('');
      try {
        const response = await api.get(`/symptoms/${user._id}`, { params: { limit: 365 } });
        const fetched = response.data.logs;
        setLogs(fetched);
        setTotal(response.data.total);

        if (hydrateToday) {
          const todayLog = fetched.find((log) => log.date === todayISO());
          if (todayLog) {
            setForm({
              date: todayLog.date,
              physical: todayLog.physical.map((item) => ({ ...item })),
              mood: [...todayLog.mood],
              flow: todayLog.flow,
              energyLevel: todayLog.energyLevel || 3,
              sleepHours: todayLog.sleepHours ?? '',
              notes: todayLog.notes || '',
            });
            setEditingId(todayLog._id);
          }
        }
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    },
    [user._id]
  );

  useEffect(() => {
    load({ hydrateToday: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [load, refreshKey]);

  const selectedPhysicalNames = form.physical.map((item) => item.name);

  const togglePhysical = (name) => {
    setForm((current) => {
      const exists = current.physical.some((item) => item.name === name);
      return {
        ...current,
        physical: exists
          ? current.physical.filter((item) => item.name !== name)
          : [...current.physical, { name, severity: 'mild' }],
      };
    });
  };

  const setSeverity = (name, severity) => {
    setForm((current) => ({
      ...current,
      physical: current.physical.map((item) =>
        item.name === name ? { ...item, severity } : item
      ),
    }));
  };

  const toggleMood = (mood) => {
    setForm((current) => ({
      ...current,
      mood: current.mood.includes(mood)
        ? current.mood.filter((item) => item !== mood)
        : [...current.mood, mood],
    }));
  };

  const handleDateChange = (date) => {
    const existing = logs.find((log) => log.date === date);
    if (existing) {
      setEditingId(existing._id);
      setForm({
        date: existing.date,
        physical: existing.physical.map((item) => ({ ...item })),
        mood: [...existing.mood],
        flow: existing.flow,
        energyLevel: existing.energyLevel || 3,
        sleepHours: existing.sleepHours ?? '',
        notes: existing.notes || '',
      });
    } else {
      setEditingId(null);
      setForm({ ...emptyForm(date), energyLevel: 3 });
    }
    setFormError('');
  };

  const resetForm = () => {
    setEditingId(null);
    setForm(emptyForm());
    setFormError('');
  };

  const startEdit = (log) => {
    setEditingId(log._id);
    setForm({
      date: log.date,
      physical: log.physical.map((item) => ({ ...item })),
      mood: [...log.mood],
      flow: log.flow,
      energyLevel: log.energyLevel || 3,
      sleepHours: log.sleepHours ?? '',
      notes: log.notes || '',
    });
    setFormError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const submit = async (event) => {
    event?.preventDefault();
    setFormError('');

    if (!form.date) return setFormError('Choose the date you are logging.');
    if (form.date > todayISO()) return setFormError('You cannot log symptoms for a future date.');
    if (form.sleepHours !== '' && (Number(form.sleepHours) < 0 || Number(form.sleepHours) > 24)) {
      return setFormError('Sleep hours should be between 0 and 24.');
    }

    setSaving(true);
    try {
      const payload = {
        date: form.date,
        physical: form.physical,
        mood: form.mood,
        flow: form.flow,
        energyLevel: Number(form.energyLevel),
        sleepHours: form.sleepHours === '' ? null : Number(form.sleepHours),
        notes: form.notes,
      };

      let response;
      if (editingId) {
        response = await api.put(`/symptoms/${editingId}`, payload);
      } else {
        response = await api.post('/symptoms', payload);
      }

      addToast({
        title: editingId ? 'Journal updated' : 'Journal saved',
        message: 'Every entry helps your patterns become clearer.',
      });
      setEditingId(response.data.log._id);
      setRefreshKey((key) => key + 1);
    } catch (err) {
      const message = getErrorMessage(err);
      setFormError(message);
      addToast({ type: 'error', title: 'Could not save entry', message });
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/symptoms/${deleteTarget._id}`);
      addToast({ title: 'Entry deleted', message: 'That day has been removed from your journal.' });
      if (editingId === deleteTarget._id) resetForm();
      setDeleteTarget(null);
      setRefreshKey((key) => key + 1);
    } catch (err) {
      addToast({ type: 'error', title: 'Could not delete entry', message: getErrorMessage(err) });
    } finally {
      setDeleting(false);
    }
  };

  const filteredLogs = useMemo(() => {
    const cutoff =
      rangeFilter === 'all' ? null : addDays(parseISO(todayISO()), -Number(rangeFilter));
    const normalizedQuery = query.trim().toLowerCase();
    return logs.filter((log) => {
      if (cutoff && parseISO(log.date) < cutoff) return false;
      if (!normalizedQuery) return true;
      const haystack = [
        log.notes,
        ...log.physical.map((item) => item.name),
        ...log.mood,
        log.flow,
        log.date,
        formatDate(log.date, 'd MMMM yyyy'),
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(normalizedQuery);
    });
  }, [logs, rangeFilter, query]);

  const topSymptom = useMemo(() => {
    const counts = new Map();
    logs.forEach((log) =>
      log.physical.forEach((item) => counts.set(item.name, (counts.get(item.name) || 0) + 1))
    );
    return [...counts.entries()].sort((a, b) => b[1] - a[1])[0] || null;
  }, [logs]);

  const selectedCount = form.physical.length + form.mood.length + (form.flow !== 'none' ? 1 : 0);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-20 w-full skeleton" />
        <div className="grid gap-4 xl:grid-cols-[1.45fr_1fr]">
          <CardSkeleton rows={8} />
          <CardSkeleton rows={6} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader
          eyebrow="Daily check-in"
          title="Your symptom journal"
          description="A quiet record of how your body and mood feel each day."
        />
        <ErrorState message={error} onRetry={() => setRefreshKey((key) => key + 1)} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Daily check-in"
        title="Notice what your body is telling you."
        description="Small, honest observations become useful patterns. Log what you notice — there are no wrong answers."
        actions={
          <>
            <Button variant="secondary" icon={Clock} onClick={resetForm}>
              New entry
            </Button>
            <Button icon={NotebookPen} onClick={submit} loading={saving}>
              {editingId ? 'Save changes' : 'Save today'}
            </Button>
          </>
        }
      />

      <div className="grid gap-4 xl:grid-cols-[1.45fr_1fr]">
        <div className="space-y-4">
          <section className="card overflow-hidden" aria-labelledby="entry-title">
            <div className="flex flex-wrap items-center justify-between gap-3 bg-gradient-to-r from-rose-mist via-soft-petal/60 to-white px-5 py-4 sm:px-6">
              <div>
                <p className="eyebrow">{editingId ? 'Editing entry' : 'New check-in'}</p>
                <h2 id="entry-title" className="mt-0.5 font-display text-xl font-semibold text-deep-rose">
                  How are you feeling?
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <Badge tone="outline" icon={CalendarDays} className="bg-white/70">
                  {relativeDay(form.date)}
                </Badge>
                <span className="text-[10px] font-semibold text-muted">{selectedCount} signals</span>
              </div>
            </div>

            <form onSubmit={submit} className="space-y-6 p-5 sm:p-6" noValidate>
              {formError ? (
                <div className="flex items-start gap-2 rounded-xl border border-blush-pink bg-rose-mist p-3 text-xs text-deep-rose" role="alert">
                  <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  {formError}
                </div>
              ) : null}

              <div className="grid gap-4 sm:grid-cols-[minmax(0,220px)_1fr] sm:items-end">
                <Field label="Date" htmlFor="journal-date">
                  <input
                    id="journal-date"
                    type="date"
                    max={todayISO()}
                    value={form.date}
                    onChange={(event) => handleDateChange(event.target.value)}
                    className="input-field"
                  />
                </Field>
                <div className="flex flex-wrap items-center gap-1.5 pb-1">
                  <button
                    type="button"
                    onClick={() => handleDateChange(todayISO())}
                    className={cn('chip !px-2.5 !py-1.5 !text-[11px]', form.date === todayISO() && 'chip-active')}
                  >
                    Today
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDateChange(addDays(parseISO(todayISO()), -1) && formatDate(addDays(parseISO(todayISO()), -1), 'yyyy-MM-dd'))}
                    className={cn(
                      'chip !px-2.5 !py-1.5 !text-[11px]',
                      form.date === formatDate(addDays(parseISO(todayISO()), -1), 'yyyy-MM-dd') && 'chip-active'
                    )}
                  >
                    Yesterday
                  </button>
                  <span className="ml-1 text-[10px] text-muted">
                    {editingId ? 'Editing an existing entry.' : 'No entry yet for this date.'}
                  </span>
                </div>
              </div>

              <fieldset>
                <div className="flex items-center justify-between">
                  <legend className="field-label !mb-2 flex items-center gap-2">
                    <span className="grid h-5 w-5 place-items-center rounded-md bg-soft-petal text-deep-rose">
                      <Sun className="h-3 w-3" aria-hidden="true" />
                    </span>
                    Physical symptoms
                  </legend>
                  <span className="text-[10px] font-medium text-muted">Tap to select, then set severity</span>
                </div>
                <div className="space-y-3">
                  {PHYSICAL_SYMPTOM_GROUPS.map((group) => (
                    <div key={group.title}>
                      <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wide text-muted/70">
                        {group.title}
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {group.symptoms.map((name) => {
                          const selected = selectedPhysicalNames.includes(name);
                          return (
                            <button
                              key={name}
                              type="button"
                              onClick={() => togglePhysical(name)}
                              aria-pressed={selected}
                              className={cn(
                                'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-[11px] font-medium transition-all',
                                selected
                                  ? 'border-pink-glow bg-pink-glow text-white shadow-sm'
                                  : 'border-blush-pink/70 bg-white text-ink hover:border-pink-glow hover:bg-soft-petal/40'
                              )}
                            >
                              {selected ? <Check className="h-3 w-3" aria-hidden="true" /> : <Plus className="h-3 w-3 text-muted" aria-hidden="true" />}
                              {name}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                {form.physical.length ? (
                  <div className="mt-4 space-y-2 rounded-xl border border-pink-glow/20 bg-soft-petal/35 p-3">
                    <p className="text-[10px] font-bold uppercase tracking-wide text-deep-rose/70">
                      Rate how each one felt
                    </p>
                    {form.physical.map((item) => (
                      <div key={item.name} className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-xs font-semibold text-ink">{item.name}</span>
                        <div className="flex gap-1">
                          {SEVERITY_OPTIONS.map((severity) => (
                            <button
                              key={severity.value}
                              type="button"
                              onClick={() => setSeverity(item.name, severity.value)}
                              aria-pressed={item.severity === severity.value}
                              className={cn(
                                'rounded-md border px-2.5 py-1 text-[10px] font-bold transition-colors',
                                item.severity === severity.value
                                  ? SEVERITY_STYLES[severity.value]
                                  : 'border-blush-pink/50 bg-white text-muted hover:border-pink-glow'
                              )}
                            >
                              {severity.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : null}
              </fieldset>

              <fieldset className="border-t border-blush-pink/40 pt-5">
                <legend className="field-label flex items-center gap-2">
                  <span className="grid h-5 w-5 place-items-center rounded-md bg-soft-petal text-deep-rose">
                    <Sparkles className="h-3 w-3" aria-hidden="true" />
                  </span>
                  Mood &amp; wellbeing
                </legend>
                <div className="flex flex-wrap gap-1.5">
                  {MOODS.map((mood) => {
                    const selected = form.mood.includes(mood);
                    return (
                      <button
                        key={mood}
                        type="button"
                        onClick={() => toggleMood(mood)}
                        aria-pressed={selected}
                        className={cn('chip !py-1.5 !text-[11px]', selected && 'chip-active')}
                      >
                        {selected ? <Check className="h-3 w-3" aria-hidden="true" /> : null}
                        {mood}
                      </button>
                    );
                  })}
                </div>
              </fieldset>

              <fieldset className="border-t border-blush-pink/40 pt-5">
                <legend className="field-label flex items-center gap-2">
                  <span className="grid h-5 w-5 place-items-center rounded-md bg-soft-petal text-deep-rose">
                    <Droplets className="h-3 w-3" aria-hidden="true" />
                  </span>
                  Flow &amp; spotting
                </legend>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                  {[{ value: 'none', label: 'None', dots: 0 }, ...FLOW_OPTIONS].map((option) => {
                    const selected = form.flow === option.value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setForm((current) => ({ ...current, flow: option.value }))}
                        aria-pressed={selected}
                        className={cn(
                          'rounded-xl border px-2 py-2 text-center transition-all',
                          selected
                            ? 'border-pink-glow bg-pink-glow text-white shadow-sm'
                            : 'border-blush-pink/70 bg-white text-ink hover:border-pink-glow'
                        )}
                      >
                        <span className="flex justify-center gap-0.5" aria-hidden="true">
                          {[1, 2, 3, 4].map((dot) => (
                            <span
                              key={dot}
                              className={cn(
                                'h-1 w-1 rounded-full',
                                dot <= option.dots
                                  ? selected
                                    ? 'bg-white'
                                    : 'bg-pink-glow'
                                  : selected
                                    ? 'bg-white/30'
                                    : 'bg-blush-pink/50'
                              )}
                            />
                          ))}
                        </span>
                        <span className="mt-1 block text-[10px] font-bold">{option.label}</span>
                      </button>
                    );
                  })}
                </div>
              </fieldset>

              <div className="grid gap-5 border-t border-blush-pink/40 pt-5 sm:grid-cols-2">
                <fieldset>
                  <legend className="field-label flex items-center gap-2">
                    <span className="grid h-5 w-5 place-items-center rounded-md bg-soft-petal text-deep-rose">
                      <Sun className="h-3 w-3" aria-hidden="true" />
                    </span>
                    Energy level
                  </legend>
                  <div className="flex gap-1.5">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <button
                        key={level}
                        type="button"
                        onClick={() => setForm((current) => ({ ...current, energyLevel: level }))}
                        aria-pressed={form.energyLevel === level}
                        aria-label={`${ENERGY_LABELS[level]} energy`}
                        className={cn(
                          'flex h-9 flex-1 items-center justify-center rounded-lg border text-xs font-bold transition-all',
                          form.energyLevel >= level
                            ? 'border-pink-glow bg-pink-glow text-white'
                            : 'border-blush-pink/70 bg-white text-muted hover:border-pink-glow'
                        )}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                  <p className="mt-1.5 text-[10px] font-medium text-muted">
                    {ENERGY_LABELS[form.energyLevel]}
                  </p>
                </fieldset>

                <Field label="Sleep last night" htmlFor="sleep-hours" optional>
                  <div className="relative">
                    <Moon
                      className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted/60"
                      aria-hidden="true"
                    />
                    <input
                      id="sleep-hours"
                      type="number"
                      min="0"
                      max="24"
                      step="0.5"
                      value={form.sleepHours}
                      onChange={(event) =>
                        setForm((current) => ({ ...current, sleepHours: event.target.value }))
                      }
                      className="input-field pl-10 pr-14"
                      placeholder="e.g. 7.5"
                    />
                    <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-muted">
                      hours
                    </span>
                  </div>
                </Field>
              </div>

              <Field
                label="Anything else you want to remember?"
                htmlFor="journal-notes"
                optional
                hint="Stress, food, medication, sleep, or anything that felt meaningful."
              >
                <textarea
                  id="journal-notes"
                  rows={3}
                  maxLength={1200}
                  value={form.notes}
                  onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))}
                  className="input-field resize-none"
                  placeholder="A few words are enough…"
                />
              </Field>

              <div className="flex flex-col-reverse gap-2.5 border-t border-blush-pink/40 pt-5 sm:flex-row sm:items-center sm:justify-between">
                <p className="flex items-center gap-1.5 text-[10px] text-muted">
                  <Lock className="h-3 w-3" aria-hidden="true" />
                  Only you can see this.
                </p>
                <div className="flex gap-2">
                  <Button variant="secondary" type="button" onClick={resetForm} disabled={saving}>
                    Clear
                  </Button>
                  <Button type="submit" loading={saving} icon={editingId ? Pencil : Plus}>
                    {editingId ? 'Save changes' : 'Save entry'}
                  </Button>
                </div>
              </div>
            </form>
          </section>
        </div>

        <aside className="space-y-4">
          <section className="card overflow-hidden" aria-labelledby="history-title">
            <div className="bg-soft-petal/50 px-5 py-4">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="eyebrow">Your record</p>
                  <h2 id="history-title" className="mt-0.5 font-display text-xl font-semibold text-deep-rose">
                    Journal history
                  </h2>
                </div>
                <div className="text-right">
                  <p className="font-display text-xl font-semibold text-deep-rose">{total}</p>
                  <p className="text-[9px] font-bold uppercase tracking-wide text-muted">entries</p>
                </div>
              </div>
              {topSymptom ? (
                <p className="mt-2 text-[10px] text-muted">
                  Most logged: <span className="font-bold text-deep-rose">{topSymptom[0]}</span> ({topSymptom[1]}×)
                </p>
              ) : null}
            </div>

            <div className="space-y-2.5 p-4">
              <div className="relative">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted/60"
                  aria-hidden="true"
                />
                <input
                  type="search"
                  value={query}
                  onChange={(event) => {
                    setQuery(event.target.value);
                    setVisibleCount(6);
                  }}
                  placeholder="Search symptoms or notes"
                  aria-label="Search journal entries"
                  className="input-field !py-2 pl-9 text-xs"
                />
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex gap-1">
                  {RANGE_FILTERS.map((filter) => (
                    <button
                      key={filter.value}
                      type="button"
                      onClick={() => {
                        setRangeFilter(filter.value);
                        setVisibleCount(6);
                      }}
                      aria-pressed={rangeFilter === filter.value}
                      className={cn(
                        'rounded-lg px-2 py-1 text-[10px] font-bold transition-colors',
                        rangeFilter === filter.value
                          ? 'bg-deep-rose text-white'
                          : 'bg-rose-mist text-muted hover:text-deep-rose'
                      )}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>
                <span className="flex items-center gap-1 text-[9px] font-semibold text-muted">
                  <ArrowDownUp className="h-2.5 w-2.5" aria-hidden="true" />
                  Newest
                </span>
              </div>
            </div>

            <div className="px-4 pb-4">
              {filteredLogs.length ? (
                <>
                  <ul className="space-y-2.5">
                    {filteredLogs.slice(0, visibleCount).map((log) => (
                      <li
                        key={log._id}
                        className={cn(
                          'rounded-xl border bg-white p-3.5 transition-colors',
                          editingId === log._id
                            ? 'border-pink-glow shadow-soft'
                            : 'border-blush-pink/50 hover:border-pink-glow/40'
                        )}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <p className="text-xs font-bold text-ink">{relativeDay(log.date)}</p>
                              {log.flow !== 'none' ? (
                                <Badge tone="pink" className="!px-1.5 !py-0.5 !text-[9px]">
                                  {log.flow}
                                </Badge>
                              ) : null}
                              {editingId === log._id ? <Badge tone="glow" className="!px-1.5 !py-0.5 !text-[9px]">Editing</Badge> : null}
                            </div>
                            <p className="mt-0.5 text-[9px] font-medium text-muted">
                              {formatDate(log.date, 'EEEE, d MMMM yyyy')}
                            </p>
                          </div>
                          <div className="flex gap-0.5">
                            <button
                              type="button"
                              onClick={() => startEdit(log)}
                              className="rounded-md p-1.5 text-muted transition-colors hover:bg-rose-mist hover:text-deep-rose"
                              aria-label={`Edit entry for ${formatDate(log.date)}`}
                            >
                              <Pencil className="h-3 w-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteTarget(log)}
                              className="rounded-md p-1.5 text-muted transition-colors hover:bg-rose-mist hover:text-deep-rose"
                              aria-label={`Delete entry for ${formatDate(log.date)}`}
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        </div>

                        {log.physical.length ? (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {log.physical.slice(0, 5).map((item) => (
                              <span
                                key={item.name}
                                className={cn(
                                  'rounded-full px-1.5 py-0.5 text-[9px] font-semibold capitalize',
                                  SEVERITY_STYLES[item.severity] || SEVERITY_STYLES.mild
                                )}
                                title={`${item.name}: ${item.severity}`}
                              >
                                {item.name}
                              </span>
                            ))}
                            {log.physical.length > 5 ? (
                              <span className="text-[9px] font-semibold text-muted">+{log.physical.length - 5}</span>
                            ) : null}
                          </div>
                        ) : null}

                        {log.mood.length ? (
                          <div className="mt-1.5 flex flex-wrap gap-1">
                            {log.mood.slice(0, 3).map((mood) => (
                              <MoodTag key={mood}>{mood}</MoodTag>
                            ))}
                            {log.mood.length > 3 ? (
                              <span className="text-[9px] font-semibold text-muted">+{log.mood.length - 3}</span>
                            ) : null}
                          </div>
                        ) : null}

                        <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[9px] text-muted">
                          {log.energyLevel ? (
                            <span className="flex items-center gap-1">
                              <Sun className="h-2.5 w-2.5" aria-hidden="true" /> Energy {log.energyLevel}/5
                            </span>
                          ) : null}
                          {log.sleepHours !== null && log.sleepHours !== undefined ? (
                            <span className="flex items-center gap-1">
                              <Moon className="h-2.5 w-2.5" aria-hidden="true" /> {log.sleepHours}h sleep
                            </span>
                          ) : null}
                        </div>

                        {log.notes ? (
                          <p className="mt-2 line-clamp-2 rounded-lg bg-rose-mist/60 px-2 py-1.5 text-[10px] italic leading-relaxed text-muted">
                            “{log.notes}”
                          </p>
                        ) : null}
                      </li>
                    ))}
                  </ul>

                  {filteredLogs.length > visibleCount ? (
                    <button
                      type="button"
                      onClick={() => setVisibleCount((count) => count + 6)}
                      className="mt-3 flex w-full items-center justify-center gap-1 rounded-xl border border-blush-pink/60 bg-white py-2 text-[10px] font-bold text-deep-rose transition-colors hover:bg-rose-mist"
                    >
                      Show more
                      <ChevronDown className="h-3 w-3" aria-hidden="true" />
                    </button>
                  ) : null}
                </>
              ) : (
                <EmptyState
                  icon={NotebookPen}
                  title={query || rangeFilter !== 'all' ? 'Nothing matches those filters' : 'No journal entries yet'}
                  description={
                    query || rangeFilter !== 'all'
                      ? 'Try a wider date range or a different search.'
                      : 'Your first check-in can be as short as one word.'
                  }
                  action={
                    query || rangeFilter !== 'all' ? (
                      <Button
                        size="sm"
                        variant="secondary"
                        icon={X}
                        onClick={() => {
                          setQuery('');
                          setRangeFilter('all');
                        }}
                      >
                        Clear filters
                      </Button>
                    ) : null
                  }
                  className="border-none bg-rose-mist/50 px-3 py-8"
                />
              )}
            </div>
          </section>

          <section className="flex items-start gap-2 rounded-xl border border-blush-pink/60 bg-white/75 p-3.5">
            <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-pink-glow" aria-hidden="true" />
            <div>
              <p className="text-[10px] font-bold text-deep-rose">A gentle reminder</p>
              <p className="mt-0.5 text-[10px] leading-relaxed text-muted">
                One severe symptom is a data point. A pattern over time is what helps a clinician.
                Log consistently when you can, not perfectly.
              </p>
            </div>
          </section>
        </aside>
      </div>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => !deleting && setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title="Delete this journal entry?"
        description={
          deleteTarget
            ? `The entry for ${formatLongDate(deleteTarget.date)} will be permanently removed.`
            : ''
        }
        confirmLabel="Delete entry"
        loading={deleting}
      />
    </div>
  );
};

export default SymptomJournal;
