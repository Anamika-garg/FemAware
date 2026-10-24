import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  BarChart3,
  BookHeart,
  CalendarHeart,
  ClipboardList,
  LayoutDashboard,
  NotebookPen,
  Star,
  Trophy,
} from 'lucide-react';
import { api } from '../lib/api';
import { useAsync } from '../lib/useAsync';
import { useAuth } from '../../../context/AuthContext';
import { apiDay, diffDays, formatDay, todayIso } from '../lib/dates';
import { SEVERITY_LABELS, SYMPTOM_LABELS } from '../lib/labels';
import { Badge, Button, Card, EmptyState, ErrorMessage, LinkButton, Loading, PageHeader, ProgressBar } from '../components/ui';
import { ModuleIcon } from '../components/ModuleIcon';

async function loadDashboard() {
  const [insights, progress, modules, symptoms] = await Promise.all([
    api.insights.get(),
    api.learning.progress(),
    api.learning.modules(),
    api.symptoms.list(),
  ]);
  return {
    insights: insights.insights,
    progress: progress.progress,
    modules: modules.items,
    recentSymptoms: symptoms.items.slice(0, 4),
  };
}

const QUICK_ACTIONS = [
  { to: '/cycle', icon: CalendarHeart, label: 'Log a period' },
  { to: '/symptoms', icon: NotebookPen, label: 'Log symptoms' },
  { to: '/check', icon: ClipboardList, label: 'Symptom check' },
  { to: '/insights', icon: BarChart3, label: 'See insights' },
];

/** Lets a new teen explore charts and insights before logging anything real. */
function SampleDataButton({ onLoaded }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const load = async () => {
    setBusy(true);
    setError(null);
    try {
      await api.loadSampleData();
      onLoaded();
    } catch (err) {
      setError(err);
      setBusy(false);
    }
  };
  return (
    <>
      <Button size="sm" variant="secondary" onClick={load} disabled={busy}>
        {busy ? 'Loading…' : 'Try with sample data'}
      </Button>
      {error && <p role="alert" className="w-full text-sm font-semibold">{error.message}</p>}
    </>
  );
}

export default function TeenDashboard() {
  const { user } = useAuth();
  const { data, error, loading, reload } = useAsync(loadDashboard);

  const greeting = user?.name ? `Hi, ${user.name.split(' ')[0]}!` : 'Hi there!';

  if (loading) return <Loading label="Loading your dashboard…" />;
  if (error) return <ErrorMessage error={error} onRetry={reload} />;

  const { insights, progress, modules, recentSymptoms } = data;
  const { cycle, flags } = insights;
  const today = todayIso();
  const cycleDay = cycle.lastPeriodStart ? diffDays(today, apiDay(cycle.lastPeriodStart)) + 1 : null;
  const daysUntilNext = cycle.predictedNextStart ? diffDays(apiDay(cycle.predictedNextStart), today) : null;
  const completed = new Set(progress.completedModules.map((m) => m.slug));
  const nextModule = modules.find((m) => !completed.has(m.slug));
  const xpIntoLevel = progress.xp % 150;

  return (
    <div>
      <PageHeader icon={LayoutDashboard} title={greeting} subtitle="Here’s your cycle, learning and health snapshot." />

      <ul className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        {QUICK_ACTIONS.map(({ to, icon: Icon, label }) => (
          <li key={to}>
            <Link to={to} className="card flex items-center gap-3 p-4 font-bold transition-transform hover:-translate-y-0.5">
              <Icon aria-hidden className="size-5 text-rose" /> {label}
            </Link>
          </li>
        ))}
      </ul>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <h2 className="flex items-center gap-2 text-xl font-display font-semibold text-deep-rose">
            <CalendarHeart aria-hidden className="size-5" /> Cycle snapshot
          </h2>
          {cycle.periodsLogged === 0 ? (
            <div className="mt-4">
              <EmptyState icon={CalendarHeart} title="No periods logged yet">
                <div className="mt-2 flex flex-wrap justify-center gap-2">
                  <LinkButton to="/cycle" size="sm">
                    Open calendar
                  </LinkButton>
                  <SampleDataButton onLoaded={reload} />
                </div>
              </EmptyState>
            </div>
          ) : (
            <dl className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
              <Stat label="Cycle day" value={cycleDay ?? '—'} />
              <Stat
                label="Next period (est.)"
                value={daysUntilNext === null ? '—' : daysUntilNext >= 0 ? `in ${daysUntilNext}d` : `${-daysUntilNext}d late`}
                hint={cycle.predictedNextStart ? formatDay(cycle.predictedNextStart) : 'Log 2+ periods'}
              />
              <Stat label="Avg. cycle" value={cycle.averageCycleLength ? `${cycle.averageCycleLength}d` : '—'} />
              <Stat label="Avg. period" value={cycle.averagePeriodLength ? `${cycle.averagePeriodLength}d` : '—'} />
            </dl>
          )}
          {flags.length > 0 && (
            <Link to="/insights" className="mt-5 flex items-center gap-3 rounded-2xl bg-petal p-4 font-bold">
              <AlertTriangle aria-hidden className="size-5 shrink-0" />
              {flags.length} pattern{flags.length > 1 ? 's' : ''} worth mentioning to a doctor — see insights
            </Link>
          )}
        </Card>

        <Card>
          <h2 className="flex items-center gap-2 text-xl font-display font-semibold text-deep-rose">
            <Trophy aria-hidden className="size-5" /> Level {progress.level}
          </h2>
          <p className="mt-1 text-sm text-muted">
            {progress.xp} XP · {progress.completedModules.length}/{progress.totalModules} lessons
          </p>
          <div className="mt-3">
            <ProgressBar value={xpIntoLevel} max={150} label="XP towards next level" />
            <p className="mt-1 text-xs font-semibold text-muted">{150 - xpIntoLevel} XP to level {progress.level + 1}</p>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {progress.achievements.length ? (
              progress.achievements.map((a) => (
                <Badge key={a.code} className="bg-deep text-white">
                  <Star aria-hidden className="size-3 fill-current" /> {a.title}
                </Badge>
              ))
            ) : (
              <p className="text-sm text-muted">Finish a lesson to earn your first badge.</p>
            )}
          </div>
          {nextModule && (
            <Link to={`/learn/${nextModule.slug}`} className="mt-5 flex items-center gap-3 rounded-2xl bg-mist p-3 font-bold hover:bg-petal">
              <ModuleIcon name={nextModule.icon} className="size-5 text-rose" />
              <span>
                <span className="block text-xs uppercase tracking-wide text-rose">Up next</span>
                {nextModule.title}
              </span>
            </Link>
          )}
        </Card>

        <Card className="lg:col-span-3">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-xl font-display font-semibold text-deep-rose">
              <NotebookPen aria-hidden className="size-5" /> Recent symptoms
            </h2>
            <Link to="/symptoms" className="text-sm font-bold underline">
              View all
            </Link>
          </div>
          {recentSymptoms.length === 0 ? (
            <p className="mt-3 text-muted">Nothing logged yet.</p>
          ) : (
            <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {recentSymptoms.map((log) => (
                <li key={log.id} className="rounded-2xl bg-mist p-4">
                  <p className="text-sm font-bold text-rose">{formatDay(log.date, { weekday: 'short', day: 'numeric', month: 'short' })}</p>
                  <p className="mt-1 font-bold">{log.symptoms.map((s) => SYMPTOM_LABELS[s]).join(', ')}</p>
                  <p className="text-sm text-muted">{SEVERITY_LABELS[log.severity]}</p>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="lg:col-span-3 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
          <BookHeart aria-hidden className="size-8 text-glow" />
          <p className="flex-1">
            Something doesn’t feel right? The guided symptom check can help you decide whether to talk to a doctor.
          </p>
          <LinkButton to="/check">Start a check</LinkButton>
        </Card>
      </div>
    </div>
  );
}

function Stat({ label, value, hint }) {
  return (
    <div className="rounded-2xl bg-mist p-4">
      <dt className="text-xs font-bold uppercase tracking-wide text-rose">{label}</dt>
      <dd className="mt-1 text-2xl font-display font-semibold text-deep-rose">{value}</dd>
      {hint && <dd className="text-xs font-semibold text-muted">{hint}</dd>}
    </div>
  );
}
