import { useMemo, useState } from 'react';
import { CalendarHeart, ChevronLeft, ChevronRight, Droplet, Trash2 } from 'lucide-react';
import { api } from '../lib/api';
import { useAsync } from '../lib/useAsync';
import { addDays, apiDay, buildMonthGrid, diffDays, entryCoversDay, formatDay, todayIso } from '../lib/dates';
import { FLOW_LABELS } from '../lib/labels';
import { Button, Card, ErrorMessage, FieldErrors, Loading, PageHeader, SessionGate } from '../components/ui';

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

async function loadCalendar() {
  const [cycles, symptoms, insights] = await Promise.all([api.cycles.list(), api.symptoms.list(), api.insights.get()]);
  return { cycles: cycles.items, symptomDays: new Set(symptoms.items.map((s) => apiDay(s.date))), insights: insights.insights };
}

export default function CalendarPage() {
  return (
    <SessionGate feature="the period calendar">
      <Calendar />
    </SessionGate>
  );
}

function Calendar() {
  const today = todayIso();
  const [month, setMonth] = useState(() => ({ year: Number(today.slice(0, 4)), month: Number(today.slice(5, 7)) - 1 }));
  const [selected, setSelected] = useState(today);
  const { data, error, loading, reload } = useAsync(loadCalendar);

  const grid = useMemo(() => buildMonthGrid(month.year, month.month), [month]);
  const monthLabel = new Date(Date.UTC(month.year, month.month, 1)).toLocaleDateString(undefined, { month: 'long', year: 'numeric', timeZone: 'UTC' });

  const predicted = useMemo(() => {
    const start = apiDay(data?.insights.cycle.predictedNextStart);
    if (!start) return null;
    const len = Math.round(data.insights.cycle.averagePeriodLength || 5);
    return { start, end: addDays(start, len - 1) };
  }, [data]);

  const shiftMonth = (delta) =>
    setMonth(({ year, month: m }) => {
      const d = new Date(Date.UTC(year, m + delta, 1));
      return { year: d.getUTCFullYear(), month: d.getUTCMonth() };
    });

  if (loading && !data) return <Loading label="Loading your calendar…" />;
  if (error) return <ErrorMessage error={error} onRetry={reload} />;

  const { cycles, symptomDays } = data;
  const entriesOn = (iso) => cycles.filter((c) => entryCoversDay(c, iso));

  return (
    <div>
      <PageHeader icon={CalendarHeart} title="Period calendar" subtitle="Tap a day to log or edit a period." />
      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={() => shiftMonth(-1)} aria-label="Previous month">
              <ChevronLeft aria-hidden />
            </Button>
            <h2 className="text-xl font-black" aria-live="polite">
              {monthLabel}
            </h2>
            <Button variant="ghost" size="sm" onClick={() => shiftMonth(1)} aria-label="Next month">
              <ChevronRight aria-hidden />
            </Button>
          </div>
          <div role="grid" aria-label={monthLabel} className="grid grid-cols-7 gap-1 text-center">
            {WEEKDAYS.map((d) => (
              <div key={d} role="columnheader" className="py-1 text-xs font-black uppercase text-rose">
                {d}
              </div>
            ))}
            {grid.map(({ iso, inMonth, day }) => {
              const isPeriod = entriesOn(iso).length > 0;
              const isPredicted = !isPeriod && predicted && iso >= predicted.start && iso <= predicted.end;
              const isSelected = iso === selected;
              const isToday = iso === today;
              let tone = inMonth ? 'bg-white hover:bg-petal' : 'bg-transparent text-deep/40 hover:bg-petal';
              if (isPeriod) tone = 'bg-deep text-white hover:bg-rose';
              else if (isPredicted) tone = 'border-2 border-dashed border-glow bg-mist';
              return (
                <button
                  key={iso}
                  type="button"
                  role="gridcell"
                  aria-selected={isSelected}
                  aria-label={`${formatDay(iso, { weekday: 'long', day: 'numeric', month: 'long' })}${isPeriod ? ', period day' : ''}${isPredicted ? ', predicted period' : ''}${symptomDays.has(iso) ? ', symptoms logged' : ''}`}
                  onClick={() => setSelected(iso)}
                  className={`relative aspect-square rounded-xl text-sm font-bold transition-colors ${tone} ${isSelected ? 'ring-4 ring-glow' : ''} ${isToday ? 'underline decoration-2 underline-offset-4' : ''}`}
                >
                  {day}
                  {symptomDays.has(iso) && <span aria-hidden className={`absolute bottom-1 left-1/2 size-1.5 -translate-x-1/2 rounded-full ${isPeriod ? 'bg-petal' : 'bg-rose'}`} />}
                </button>
              );
            })}
          </div>
          <ul className="mt-4 flex flex-wrap gap-4 text-xs font-bold">
            <li className="flex items-center gap-1.5"><span className="size-3 rounded bg-deep" /> Period</li>
            <li className="flex items-center gap-1.5"><span className="size-3 rounded border-2 border-dashed border-glow" /> Predicted</li>
            <li className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-rose" /> Symptoms logged</li>
          </ul>
        </Card>

        <DayPanel key={`${selected}-${entriesOn(selected)[0]?.id ?? 'new'}-${entriesOn(selected)[0]?.updatedAt ?? ''}`} day={selected} today={today} cycles={cycles} entries={entriesOn(selected)} onChange={reload} />
      </div>

      <Card className="mt-6">
        <h2 className="text-xl font-black">Logged periods</h2>
        {cycles.length === 0 ? (
          <p className="mt-2 text-deep/80">No periods logged yet. Pick the day your last period started.</p>
        ) : (
          <ul className="mt-3 divide-y divide-petal">
            {cycles.map((c) => (
              <li key={c.id}>
                <button type="button" onClick={() => setSelected(apiDay(c.startDate))} className="flex w-full items-center justify-between gap-3 py-3 text-left hover:text-rose">
                  <span className="flex items-center gap-2 font-bold">
                    <Droplet aria-hidden className="size-4 fill-current" />
                    {formatDay(c.startDate, { day: 'numeric', month: 'short', year: 'numeric' })} – {c.endDate ? formatDay(c.endDate) : 'ongoing'}
                  </span>
                  <span className="text-sm text-deep/70">
                    {c.endDate ? `${diffDays(apiDay(c.endDate), apiDay(c.startDate)) + 1} days` : ''} {c.flow ? `· ${FLOW_LABELS[c.flow]}` : ''}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

function DayPanel({ day, today, cycles, entries, onChange }) {
  const entry = entries[0];
  const openEntry = !entry && cycles.find((c) => !c.endDate && apiDay(c.startDate) < day && diffDays(day, apiDay(c.startDate)) < 15);
  const [form, setForm] = useState({
    startDate: entry ? apiDay(entry.startDate) : day,
    endDate: entry ? apiDay(entry.endDate) || '' : '',
    flow: entry?.flow || '',
  });
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const isFuture = day > today;

  async function run(action) {
    setBusy(true);
    setError(null);
    try {
      await action();
      await onChange();
    } catch (err) {
      setError(err);
    } finally {
      setBusy(false);
    }
  }

  const payload = () => ({ startDate: form.startDate, endDate: form.endDate || null, flow: form.flow || null });
  const save = (e) => {
    e.preventDefault();
    run(() => (entry ? api.cycles.update(entry.id, payload()) : api.cycles.create(payload())));
  };

  return (
    <Card>
      <h2 className="text-xl font-black">{formatDay(day, { weekday: 'long', day: 'numeric', month: 'long' })}</h2>
      {isFuture && !entry ? (
        <p className="mt-3 text-deep/80">You can only log periods for today or earlier.</p>
      ) : (
        <>
          {openEntry && (
            <div className="mt-3 rounded-2xl bg-petal p-4">
              <p className="font-bold">Your period that started {formatDay(openEntry.startDate)} has no end date.</p>
              <Button size="sm" className="mt-2" disabled={busy} onClick={() => run(() => api.cycles.update(openEntry.id, { endDate: day }))}>
                End period on this day
              </Button>
            </div>
          )}
          <form onSubmit={save} className="mt-4 space-y-4">
            <p className="font-bold">{entry ? 'Edit this period' : 'Log a period'}</p>
            <div className="grid grid-cols-2 gap-3">
              <label className="text-sm font-bold">
                Start
                <input type="date" required max={today} value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} className="mt-1 w-full rounded-xl border-2 border-blush bg-white px-3 py-2" />
              </label>
              <label className="text-sm font-bold">
                End <span className="font-semibold text-deep/60">(optional)</span>
                <input type="date" min={form.startDate} max={today} value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} className="mt-1 w-full rounded-xl border-2 border-blush bg-white px-3 py-2" />
              </label>
            </div>
            <fieldset>
              <legend className="text-sm font-bold">Flow</legend>
              <div className="mt-1 flex gap-2">
                {Object.entries(FLOW_LABELS).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={form.flow === value}
                    onClick={() => setForm({ ...form, flow: form.flow === value ? '' : value })}
                    className={`flex-1 rounded-xl border-2 px-3 py-2 text-sm font-bold ${form.flow === value ? 'border-deep bg-deep text-white' : 'border-blush bg-white'}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </fieldset>
            {error && (
              <div role="alert" className="rounded-xl bg-petal p-3 text-sm font-semibold">
                {error.message}
                <FieldErrors error={error} />
              </div>
            )}
            <div className="flex flex-wrap gap-2">
              <Button type="submit" disabled={busy}>
                {entry ? 'Save changes' : 'Log period'}
              </Button>
              {entry && (
                <Button variant="secondary" disabled={busy} onClick={() => window.confirm('Delete this period entry?') && run(() => api.cycles.remove(entry.id))}>
                  <Trash2 aria-hidden className="size-4" /> Delete
                </Button>
              )}
            </div>
          </form>
        </>
      )}
    </Card>
  );
}
