import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  addDays,
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  isToday,
  parseISO,
  startOfMonth,
  startOfWeek,
  subMonths,
} from 'date-fns';
import {
  AlertCircle,
  CalendarDays,
  CalendarHeart,
  ChevronLeft,
  ChevronRight,
  Droplets,
  Info,
  Lock,
  Pencil,
  Plus,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import api, { getErrorMessage } from '../../lib/api';
import { toISODate, formatDate, formatMonthYear, todayISO, addDays as addDaysFn } from '../../lib/dates';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import Field from '../../components/ui/Field';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { CardSkeleton, EmptyState, ErrorState } from '../../components/ui/States';
import { FLOW_OPTIONS } from '../../lib/constants';
import { cn } from '../../lib/utils';

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const calendarDaysFor = (month) => {
  const start = startOfWeek(startOfMonth(month), { weekStartsOn: 1 });
  const end = endOfWeek(endOfMonth(month), { weekStartsOn: 1 });
  return eachDayOfInterval({ start, end });
};

const flowMeta = (value) => FLOW_OPTIONS.find((option) => option.value === value) || FLOW_OPTIONS[2];

const buildDayMap = (stats) => {
  const map = new Map();
  if (!stats?.hasData) return map;

  const avgPeriod = Math.max(1, Math.round(stats.averagePeriodLength || 5));
  const avgCycle = Math.max(15, Math.round(stats.averageCycleLength || 28));

  // Logged periods always take visual precedence.
  (stats.history || []).forEach((entry) => {
    const end = entry.endDate
      ? parseISO(entry.endDate)
      : addDays(parseISO(entry.startDate), Math.max(0, Math.ceil(avgPeriod) - 1));
    const start = parseISO(entry.startDate);
    let cursor = start;
    let guard = 0;
    while (cursor <= end && guard < 30) {
      map.set(toISODate(cursor), {
        type: 'period',
        flow: entry.flow,
        cycleId: entry.id,
        startDate: entry.startDate,
      });
      cursor = addDays(cursor, 1);
      guard += 1;
    }
    map.set(entry.startDate, {
      type: 'period',
      flow: entry.flow,
      cycleId: entry.id,
      startDate: entry.startDate,
      periodStart: true,
    });
  });

  // Six upcoming cycles keep predictions visible while browsing ahead.
  for (let index = 0; index < 6; index += 1) {
    const periodStart = addDays(parseISO(stats.nextPeriodStart), index * avgCycle);
    const periodEnd = addDays(periodStart, avgPeriod - 1);
    let cursor = periodStart;
    let guard = 0;
    while (cursor <= periodEnd && guard < 15) {
      const key = toISODate(cursor);
      if (!map.has(key)) map.set(key, { type: 'predicted-period' });
      cursor = addDays(cursor, 1);
      guard += 1;
    }

    const ovulation = addDays(periodStart, -14);
    const fertileStart = addDays(ovulation, -5);
    const fertileEnd = addDays(ovulation, 1);
    let fertileCursor = fertileStart;
    let fertileGuard = 0;
    while (fertileCursor <= fertileEnd && fertileGuard < 10) {
      const key = toISODate(fertileCursor);
      if (!map.has(key)) map.set(key, { type: 'fertile' });
      fertileCursor = addDays(fertileCursor, 1);
      fertileGuard += 1;
    }
    const ovulationKey = toISODate(ovulation);
    if (!map.has(ovulationKey)) map.set(ovulationKey, { type: 'ovulation' });
    else if (map.get(ovulationKey)?.type === 'fertile') {
      map.set(ovulationKey, { type: 'ovulation' });
    }
  }

  return map;
};

const dayClasses = (info, currentMonth, today) => {
  const base =
    'relative flex min-h-[54px] flex-col items-start gap-1 rounded-xl border p-1.5 text-left transition-all sm:min-h-[78px] sm:p-2.5 focus-visible:z-10';
  if (!currentMonth) return `${base} border-transparent bg-transparent/0 text-muted/30`;
  if (info?.type === 'period') {
    return `${base} border-deep-rose bg-deep-rose text-white shadow-sm hover:bg-[#a8154e]`;
  }
  if (info?.type === 'ovulation') {
    return `${base} border-deep-rose/50 bg-white text-deep-rose ring-2 ring-inset ring-deep-rose/30 hover:bg-soft-petal/40`;
  }
  if (info?.type === 'fertile') {
    return `${base} border-pink-glow/20 bg-soft-petal/60 text-deep-rose hover:bg-soft-petal`;
  }
  if (info?.type === 'predicted-period') {
    return `${base} border-dashed border-pink-glow/80 bg-rose-mist text-deep-rose hover:bg-soft-petal/50`;
  }
  if (isToday(parseISO(today))) {
    return `${base} border-pink-glow/30 bg-white text-ink hover:border-pink-glow`;
  }
  return `${base} border-transparent bg-white/40 text-ink hover:border-blush-pink hover:bg-white`;
};

const PeriodTracker = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const [month, setMonth] = useState(startOfMonth(new Date()));

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ startDate: todayISO(), endDate: '', flow: 'medium', notes: '' });
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get(`/cycles/${user._id}`);
      setData(response.data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [user._id]);

  useEffect(() => {
    load();
  }, [load, refreshKey]);

  const stats = data?.stats;
  const cycles = data?.cycles || [];
  const dayMap = useMemo(() => buildDayMap(stats), [stats]);
  const days = useMemo(() => calendarDaysFor(month), [month]);
  const today = todayISO();

  const openCreate = (date = todayISO()) => {
    setEditing(null);
    setForm({ startDate: date, endDate: '', flow: 'medium', notes: '' });
    setFormError('');
    setModalOpen(true);
  };

  const openEdit = (cycle) => {
    setEditing(cycle);
    setForm({
      startDate: cycle.startDate,
      endDate: cycle.endDate || '',
      flow: cycle.flow || 'medium',
      notes: cycle.notes || '',
    });
    setFormError('');
    setModalOpen(true);
  };

  const handleDayClick = (iso, info) => {
    if (info?.cycleId) {
      const cycle = cycles.find((item) => item._id === info.cycleId);
      if (cycle) {
        openEdit(cycle);
        return;
      }
    }
    openCreate(iso);
  };

  const submit = async (event) => {
    event.preventDefault();
    setFormError('');

    if (!form.startDate) return setFormError('Choose the first day of this period.');
    if (form.startDate > todayISO()) return setFormError('A period start date cannot be in the future.');
    if (form.endDate && form.endDate < form.startDate) {
      return setFormError('The end date cannot be before the start date.');
    }

    setSaving(true);
    try {
      const payload = {
        startDate: form.startDate,
        endDate: form.endDate || null,
        flow: form.flow,
        notes: form.notes,
      };
      if (editing) {
        await api.put(`/cycles/${editing._id}`, payload);
        addToast({ title: 'Period updated', message: 'Your predictions have been recalculated.' });
      } else {
        await api.post('/cycles', payload);
        addToast({ title: 'Period logged', message: 'Your cycle and fertile window have been updated.' });
      }
      setModalOpen(false);
      setRefreshKey((key) => key + 1);
    } catch (err) {
      const message = getErrorMessage(err);
      setFormError(message);
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/cycles/${deleteTarget._id}`);
      addToast({ title: 'Period entry removed', message: 'Your cycle predictions have been updated.' });
      setDeleteTarget(null);
      setModalOpen(false);
      setRefreshKey((key) => key + 1);
    } catch (err) {
      addToast({ type: 'error', title: 'Could not delete entry', message: getErrorMessage(err) });
    } finally {
      setDeleting(false);
    }
  };

  const nextDays = stats?.daysLate
    ? `${stats.daysLate} day${stats.daysLate === 1 ? '' : 's'} late`
    : stats?.daysUntilNextPeriod === 0
      ? 'Expected today'
      : stats?.daysUntilNextPeriod > 0
        ? `In ${stats.daysUntilNextPeriod} day${stats.daysUntilNextPeriod === 1 ? '' : 's'}`
        : 'Add a period to predict';

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-20 w-full skeleton" />
        <div className="grid gap-4 xl:grid-cols-[1.55fr_1fr]">
          <CardSkeleton rows={7} />
          <CardSkeleton rows={5} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader
          eyebrow="Periods & predictions"
          title="Your cycle calendar"
          description="Log periods, see predicted windows and understand your rhythm."
        />
        <ErrorState message={error} onRetry={() => setRefreshKey((key) => key + 1)} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Periods & predictions"
        title="Your cycle, clearly mapped."
        description="Log each period in seconds. CycleSense learns your averages and gently updates your fertile window and next expected period."
        actions={
          <>
            <Button variant="secondary" icon={CalendarDays} onClick={() => setMonth(startOfMonth(new Date()))}>
              Today
            </Button>
            <Button icon={Plus} onClick={() => openCreate()}>
              Log period
            </Button>
          </>
        }
      />

      <div className="grid gap-4 xl:grid-cols-[1.55fr_1fr]">
        <section className="card overflow-hidden" aria-labelledby="calendar-title">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-blush-pink/40 px-4 py-4 sm:px-6">
            <div>
              <p className="eyebrow">Calendar</p>
              <h2 id="calendar-title" className="mt-0.5 font-display text-xl font-semibold text-deep-rose">
                {formatMonthYear(month)}
              </h2>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setMonth((current) => subMonths(current, 1))}
                className="rounded-xl border border-blush-pink/70 bg-white p-2 text-deep-rose transition-colors hover:bg-soft-petal/60"
                aria-label="Previous month"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setMonth((current) => addMonths(current, 1))}
                className="rounded-xl border border-blush-pink/70 bg-white p-2 text-deep-rose transition-colors hover:bg-soft-petal/60"
                aria-label="Next month"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="p-3 sm:p-5">
            <div className="grid grid-cols-7 gap-1 sm:gap-1.5" role="grid" aria-label={`${formatMonthYear(month)} calendar`}>
              {WEEKDAYS.map((day) => (
                <div
                  key={day}
                  className="py-1.5 text-center text-[9px] font-bold uppercase tracking-wider text-muted sm:text-[10px]"
                  role="columnheader"
                >
                  <span className="hidden sm:inline">{day}</span>
                  <span className="sm:hidden">{day.slice(0, 1)}</span>
                </div>
              ))}
              {days.map((day) => {
                const iso = toISODate(day);
                const info = dayMap.get(iso);
                const inMonth = isSameMonth(day, month);
                const isCurrent = isToday(day);
                return (
                  <button
                    key={iso}
                    type="button"
                    onClick={() => handleDayClick(iso, info)}
                    className={cn(
                      dayClasses(info, inMonth, today),
                      isCurrent && 'ring-2 ring-pink-glow ring-offset-1 ring-offset-white'
                    )}
                    aria-label={`${format(day, 'EEEE, d MMMM yyyy')}${info?.type === 'period' ? ', logged period day' : info?.type === 'predicted-period' ? ', predicted period day' : info?.type === 'ovulation' ? ', predicted ovulation' : info?.type === 'fertile' ? ', fertile window' : ''}${isCurrent ? ', today' : ''}. Log or edit a period.`}
                    title={inMonth ? 'Log or edit a period on this day' : undefined}
                  >
                    <span
                      className={cn(
                        'flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold sm:h-7 sm:w-7 sm:text-xs',
                        isCurrent && 'bg-white text-deep-rose',
                        !isCurrent && info?.type === 'period' && 'text-white'
                      )}
                    >
                      {format(day, 'd')}
                    </span>
                    {inMonth && info ? (
                      <>
                        <span
                          className={cn(
                            'mt-auto hidden text-[8px] font-bold uppercase tracking-wide sm:block',
                            info.type === 'period'
                              ? 'text-white/85'
                              : info.type === 'predicted-period'
                                ? 'text-pink-glow'
                                : 'text-deep-rose/70'
                          )}
                        >
                          {info.type === 'period'
                            ? 'Period'
                            : info.type === 'predicted-period'
                              ? 'Expected'
                              : info.type === 'ovulation'
                                ? 'Ovulation'
                                : 'Fertile'}
                        </span>
                        <span
                          className={cn(
                            'h-1.5 w-1.5 rounded-full sm:hidden',
                            info.type === 'period'
                              ? 'bg-white'
                              : info.type === 'predicted-period'
                                ? 'bg-pink-glow'
                                : info.type === 'ovulation'
                                  ? 'bg-deep-rose'
                                  : 'bg-rose-pink/50'
                          )}
                          aria-hidden="true"
                        />
                      </>
                    ) : null}
                  </button>
                );
              })}
            </div>

            <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 rounded-xl bg-rose-mist/60 px-3 py-2.5">
              {[
                { color: 'bg-deep-rose', label: 'Logged period' },
                { color: 'border border-dashed border-pink-glow bg-white', label: 'Expected period' },
                { color: 'bg-soft-petal ring-1 ring-pink-glow/20', label: 'Fertile window' },
                { color: 'border-2 border-deep-rose/50 bg-white', label: 'Predicted ovulation' },
              ].map((item) => (
                <span key={item.label} className="flex items-center gap-1.5 text-[10px] font-medium text-muted">
                  <span className={cn('h-2.5 w-2.5 rounded-full', item.color)} />
                  {item.label}
                </span>
              ))}
            </div>
            <p className="mt-2.5 flex items-start gap-1.5 px-1 text-[10px] leading-relaxed text-muted">
              <Info className="mt-0.5 h-3 w-3 shrink-0" aria-hidden="true" />
              Select any day to add or edit a period. Predictions are estimates and should not be used
              as contraception.
            </p>
          </div>
        </section>

        <aside className="space-y-4">
          <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-deep-rose to-[#971447] p-5 text-white shadow-card">
            <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full border border-white/20" />
            <div className="relative">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-blush-pink">
                  <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                  Next period
                </span>
                <Badge className="bg-white/15 text-white" tone="neutral">
                  {nextDays}
                </Badge>
              </div>
              <p className="mt-3 font-display text-[2rem] font-semibold leading-none">
                {stats?.hasData ? formatDate(stats.nextPeriodStart, 'd MMM') : 'â€”'}
              </p>
              <p className="mt-1 text-xs text-white/70">
                {stats?.hasData
                  ? formatDate(stats.nextPeriodStart, 'EEEE, yyyy')
                  : 'Log your most recent period to begin'}
              </p>
              <div className="mt-4 flex items-center gap-3 rounded-xl bg-white/10 p-3">
                <div className="h-9 w-9 rounded-full border-2 border-white/40 p-1">
                  <div className="h-full w-full rounded-full bg-pink-glow" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wide text-white/60">Fertile window</p>
                  <p className="text-xs font-semibold">
                    {stats?.hasData
                      ? `${formatDate(stats.fertileStart, 'd MMM')} â€“ ${formatDate(stats.fertileEnd, 'd MMM')}`
                      : 'Unlocks with your first log'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => openCreate()}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-white py-2.5 text-xs font-bold text-deep-rose transition-colors hover:bg-soft-petal"
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
                Log a period
              </button>
            </div>
          </section>

          <section className="card p-5" aria-labelledby="cycle-summary-title">
            <div className="flex items-center justify-between gap-2">
              <h2 id="cycle-summary-title" className="font-display text-lg font-semibold text-deep-rose">
                Your averages
              </h2>
              {stats?.hasData ? <Badge tone="pink">{stats.regularity}</Badge> : null}
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2.5">
              {[
                { label: 'Cycle length', value: stats?.hasData ? `${stats.averageCycleLength}d` : 'â€”' },
                { label: 'Period length', value: stats?.hasData ? `${stats.averagePeriodLength}d` : 'â€”' },
                { label: 'Variation', value: stats?.hasData ? `Â±${stats.variation}d` : 'â€”' },
                { label: 'Logged cycles', value: stats?.hasData ? stats.cycleCount : 0 },
              ].map((item) => (
                <div key={item.label} className="rounded-xl bg-rose-mist/80 px-3 py-2.5">
                  <p className="text-[9px] font-bold uppercase tracking-wide text-muted">{item.label}</p>
                  <p className="mt-0.5 text-sm font-bold capitalize text-deep-rose">{item.value}</p>
                </div>
              ))}
            </div>
            {stats?.hasData ? (
              <div className="mt-4 flex items-start gap-2 rounded-xl bg-soft-petal/50 p-3">
                <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-deep-rose" aria-hidden="true" />
                <p className="text-[10px] leading-relaxed text-deep-rose/80">
                  {stats.regularity === 'regular'
                    ? 'Your recent cycles are nicely consistent. Keep logging to refine predictions.'
                    : 'A little variation is common. More logged cycles make your predictions more personal.'}
                </p>
              </div>
            ) : null}
          </section>

          <section className="card p-5" aria-labelledby="history-title">
            <div className="flex items-center justify-between gap-2">
              <h2 id="history-title" className="font-display text-lg font-semibold text-deep-rose">
                Period history
              </h2>
              <span className="text-[10px] font-semibold text-muted">{cycles.length} logged</span>
            </div>
            {cycles.length ? (
              <ul className="mt-3 divide-y divide-blush-pink/40">
                {cycles.slice(0, 6).map((cycle) => {
                  const meta = flowMeta(cycle.flow);
                  const duration = cycle.endDate
                    ? Math.round((parseISO(cycle.endDate) - parseISO(cycle.startDate)) / 86400000) + 1
                    : null;
                  return (
                    <li key={cycle._id} className="flex items-start gap-2 py-3 first:pt-2 last:pb-0">
                      <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-soft-petal">
                        <Droplets className="h-3.5 w-3.5 text-deep-rose" aria-hidden="true" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-ink">
                          {formatDate(cycle.startDate, 'd MMM')}
                          {cycle.endDate ? ` â€“ ${formatDate(cycle.endDate, 'd MMM yyyy')}` : `, ${formatDate(cycle.startDate, 'yyyy')}`}
                        </p>
                        <p className="mt-0.5 text-[10px] capitalize text-muted">
                          {meta.label} flow{duration ? ` Â· ${duration} days` : ' Â· in progress'}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => openEdit(cycle)}
                        className="rounded-lg p-1.5 text-muted transition-colors hover:bg-rose-mist hover:text-deep-rose"
                        aria-label={`Edit period starting ${formatDate(cycle.startDate)}`}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(cycle)}
                        className="rounded-lg p-1.5 text-muted transition-colors hover:bg-rose-mist hover:text-deep-rose"
                        aria-label={`Delete period starting ${formatDate(cycle.startDate)}`}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <EmptyState
                icon={CalendarHeart}
                title="No periods yet"
                description="Your first log will start your calendar and predictions."
                action={
                  <Button size="sm" icon={Plus} onClick={() => openCreate()}>
                    Log first period
                  </Button>
                }
                className="mt-3 border-none bg-rose-mist/60 py-8"
              />
            )}
          </section>

          <div className="flex items-start gap-2 rounded-xl border border-blush-pink/60 bg-white/70 p-3">
            <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-pink-glow" aria-hidden="true" />
            <p className="text-[10px] leading-relaxed text-muted">
              Your cycle data is visible only to you. You can export or delete it from Privacy &amp; data.
            </p>
          </div>
        </aside>
      </div>

      <Modal
        open={modalOpen}
        onClose={() => !saving && setModalOpen(false)}
        title={editing ? 'Edit period' : 'Log a period'}
        description={
          editing
            ? 'Update the dates, flow or notes for this period.'
            : 'A start date is enough. Add an end date when your bleeding stops.'
        }
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={submit} loading={saving}>
              {editing ? 'Save changes' : 'Save period'}
            </Button>
          </>
        }
      >
        <form onSubmit={submit} className="space-y-5" noValidate>
          {formError ? (
            <div className="flex items-start gap-2 rounded-xl border border-blush-pink bg-rose-mist p-3 text-xs text-deep-rose" role="alert">
              <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              {formError}
            </div>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Period start" htmlFor="period-start" required>
              <input
                id="period-start"
                type="date"
                max={todayISO()}
                value={form.startDate}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    startDate: event.target.value,
                    endDate:
                      current.endDate && current.endDate < event.target.value ? '' : current.endDate,
                  }))
                }
                className="input-field"
                required
              />
            </Field>
            <Field label="Period end" htmlFor="period-end" optional hint="Leave blank if still bleeding.">
              <input
                id="period-end"
                type="date"
                min={form.startDate || undefined}
                max={todayISO()}
                value={form.endDate}
                onChange={(event) => setForm((current) => ({ ...current, endDate: event.target.value }))}
                className="input-field"
              />
            </Field>
          </div>

          <fieldset>
            <legend className="field-label">Flow intensity</legend>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {FLOW_OPTIONS.map((option) => {
                const selected = form.flow === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setForm((current) => ({ ...current, flow: option.value }))}
                    aria-pressed={selected}
                    className={cn(
                      'rounded-xl border p-2.5 text-left transition-all',
                      selected
                        ? 'border-pink-glow bg-soft-petal/70 shadow-soft'
                        : 'border-blush-pink/70 bg-white hover:border-pink-glow/50'
                    )}
                  >
                    <span className="flex gap-0.5" aria-hidden="true">
                      {[1, 2, 3, 4].map((dot) => (
                        <span
                          key={dot}
                          className={cn(
                            'h-1.5 w-1.5 rounded-full',
                            dot <= option.dots ? 'bg-pink-glow' : 'bg-blush-pink/50'
                          )}
                        />
                      ))}
                    </span>
                    <span className="mt-1.5 block text-[11px] font-bold text-deep-rose">{option.label}</span>
                    <span className="block text-[9px] text-muted">{option.description}</span>
                  </button>
                );
              })}
            </div>
          </fieldset>

          <Field label="Notes" htmlFor="period-notes" optional hint="Anything you want to remember about this period.">
            <textarea
              id="period-notes"
              rows={3}
              maxLength={600}
              value={form.notes}
              onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))}
              className="input-field resize-none"
              placeholder="e.g. heavier on day two, cramps eased with a heat packâ€¦"
            />
          </Field>

          {editing ? (
            <button
              type="button"
              onClick={() => setDeleteTarget(editing)}
              className="flex items-center gap-1.5 text-xs font-semibold text-deep-rose hover:text-rose-pink"
            >
              <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
              Delete this period entry
            </button>
          ) : null}
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => !deleting && setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title="Delete this period?"
        description="This removes the entry and recalculates your cycle predictions."
        confirmLabel="Delete period"
        loading={deleting}
      />
    </div>
  );
};

export default PeriodTracker;
