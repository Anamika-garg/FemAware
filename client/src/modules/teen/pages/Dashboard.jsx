import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  BarChart3,
  BookHeart,
  CalendarHeart,
  ClipboardList,
  NotebookPen,
  Star,
  Trophy,
} from 'lucide-react';
import { api } from '../lib/api';
import { useAsync } from '../lib/useAsync';
import { useAuth } from '../../../context/AuthContext';
import { apiDay, diffDays, formatDay, todayIso } from '../lib/dates';
import { SEVERITY_LABELS, SYMPTOM_LABELS } from '../lib/labels';
import { Badge, Button, Card, EmptyState, ErrorMessage, LinkButton, Loading, ProgressBar } from '../components/ui';
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

const SAMPLE_KEY = 'femaware_teen_sample_data';

export const usingSampleData = () => {
  try {
    return localStorage.getItem(SAMPLE_KEY) === 'true';
  } catch {
    return false;
  }
};

const setSampleFlag = (value) => {
  try {
    if (value) localStorage.setItem(SAMPLE_KEY, 'true');
    else localStorage.removeItem(SAMPLE_KEY);
  } catch {
    // Labelling falls back to the notice shown when the data is loaded.
  }
};

/** Lets a new teen explore charts and insights before logging anything real. */
function SampleDataButton({ onLoaded }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const load = async () => {
    setBusy(true);
    setError(null);
    try {
      await api.loadSampleData();
      setSampleFlag(true);
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
  const [sample, setSample] = useState(usingSampleData);

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
    <div className="space-y-6">
      {sample ? (
        <div role="status" className="flex flex-col gap-3 rounded-xl border border-deep/30 bg-mist p-4 text-sm sm:flex-row sm:items-center sm:justify-between">
          <p>
            <span className="font-semibold text-deep">You’re looking at sample data.</span> These periods and symptoms
            are made up so you can explore. Delete them any time in{' '}
            <Link to="/privacy" className="font-semibold text-deep underline underline-offset-2">
              Privacy &amp; data
            </Link>
            .
          </p>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setSampleFlag(false);
              setSample(false);
            }}
          >
            Hide this note
          </Button>
        </div>
      ) : null}

      {/* Learning comes first in the teen space */}
      <section className="card grid gap-8 p-6 sm:p-8 lg:grid-cols-[1.3fr_1fr] lg:gap-12" aria-labelledby="teen-greeting">
        <div>
          <p className="eyebrow">Learn &amp; explore</p>
          <h1 id="teen-greeting" className="mt-3 font-display text-[2.25rem] leading-[1.1] text-ink sm:text-[2.75rem]">
            {greeting}
          </h1>
          <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-muted sm:text-base">
            {nextModule
              ? 'Pick up your next short lesson, or log how you’re feeling today.'
              : 'You’ve finished every lesson. Keep tracking, and come back to any lesson whenever you like.'}
          </p>
          {nextModule ? (
            <Link
              to={`/learn/${nextModule.slug}`}
              className="group mt-6 flex items-center gap-4 rounded-xl border border-blush p-4 transition-colors hover:border-deep hover:bg-mist"
            >
              <span className="grid size-11 shrink-0 place-items-center rounded-lg bg-mist text-deep">
                <ModuleIcon name={nextModule.icon} className="size-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-xs font-semibold text-deep">Up next</span>
                <span className="block font-semibold text-ink">{nextModule.title}</span>
              </span>
              <span className="btn-primary btn-sm shrink-0">Start</span>
            </Link>
          ) : (
            <LinkButton to="/learn" className="mt-6">
              Browse lessons
            </LinkButton>
          )}
          <nav aria-label="Quick actions" className="mt-6 flex flex-wrap gap-x-6 gap-y-2">
            {QUICK_ACTIONS.map(({ to, icon: Icon, label }) => (
              <Link key={to} to={to} className="inline-flex items-center gap-2 text-sm font-semibold text-deep hover:underline">
                <Icon aria-hidden className="size-4" /> {label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="rounded-xl bg-mist p-5 sm:p-6">
          <p className="flex items-center gap-2 text-sm font-semibold text-ink">
            <Trophy aria-hidden className="size-4 text-deep" /> Level {progress.level}
          </p>
          <p className="mt-1 text-sm text-muted">
            {progress.xp} XP · {progress.completedModules.length} of {progress.totalModules} lessons done
          </p>
          <div className="mt-4">
            <ProgressBar value={xpIntoLevel} max={150} label="XP towards next level" />
            <p className="mt-2 text-xs text-muted">{150 - xpIntoLevel} XP to level {progress.level + 1}</p>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            {progress.achievements.length ? (
              progress.achievements.map((a) => (
                <Badge key={a.code} className="bg-white text-deep ring-1 ring-blush">
                  <Star aria-hidden className="size-3 fill-current" /> {a.title}
                </Badge>
              ))
            ) : (
              <p className="text-sm text-muted">Finish a lesson to earn your first badge.</p>
            )}
          </div>
          <p className="mt-5 border-t border-petal pt-4 text-xs leading-relaxed text-muted">
            XP and badges come from lessons and quizzes, never from what you log about your body.
          </p>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Card>
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-display text-2xl text-ink">Cycle snapshot</h2>
            <Link to="/cycle" className="text-sm font-semibold text-deep hover:underline">
              Calendar
            </Link>
          </div>
          {cycle.periodsLogged === 0 ? (
            <div className="mt-4">
              <EmptyState icon={CalendarHeart} title="No periods logged yet">
                <p>Add your period dates to start seeing your own pattern.</p>
                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  <LinkButton to="/cycle" size="sm">
                    Open calendar
                  </LinkButton>
                  <SampleDataButton
                    onLoaded={() => {
                      setSample(true);
                      reload();
                    }}
                  />
                </div>
              </EmptyState>
            </div>
          ) : (
            <dl className="mt-5 grid grid-cols-2 divide-petal border-y border-petal sm:grid-cols-4 sm:divide-x">
              <Stat label="Cycle day" value={cycleDay ?? '—'} />
              <Stat
                label="Next period (estimate)"
                value={daysUntilNext === null ? '—' : daysUntilNext >= 0 ? `in ${daysUntilNext}d` : `${-daysUntilNext}d late`}
                hint={cycle.predictedNextStart ? formatDay(cycle.predictedNextStart) : 'Log 2+ periods'}
              />
              <Stat label="Average cycle" value={cycle.averageCycleLength ? `${cycle.averageCycleLength}d` : '—'} />
              <Stat label="Average period" value={cycle.averagePeriodLength ? `${cycle.averagePeriodLength}d` : '—'} />
            </dl>
          )}
          {flags.length > 0 && (
            <Link to="/insights" className="mt-5 flex items-center gap-3 rounded-xl border border-blush bg-mist p-4 text-sm font-semibold text-ink hover:border-deep">
              <AlertTriangle aria-hidden className="size-5 shrink-0 text-deep" />
              {flags.length} pattern{flags.length > 1 ? 's' : ''} worth mentioning to a doctor — see insights
            </Link>
          )}
        </Card>

        <Card>
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-display text-2xl text-ink">Recent symptoms</h2>
            <Link to="/symptoms" className="text-sm font-semibold text-deep hover:underline">
              Diary
            </Link>
          </div>
          {recentSymptoms.length === 0 ? (
            <p className="mt-4 text-sm text-muted">Nothing logged yet. Your diary is private to your account.</p>
          ) : (
            <ul className="mt-4 divide-y divide-petal">
              {recentSymptoms.map((log) => (
                <li key={log.id} className="py-3">
                  <p className="text-xs font-semibold text-deep">
                    {formatDay(log.date, { weekday: 'short', day: 'numeric', month: 'short' })} · {SEVERITY_LABELS[log.severity]}
                  </p>
                  <p className="mt-0.5 text-sm text-ink">{log.symptoms.map((x) => SYMPTOM_LABELS[x]).join(', ')}</p>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <section className="flex flex-col items-start gap-4 rounded-xl border border-line bg-white p-5 sm:flex-row sm:items-center sm:p-6">
        <BookHeart aria-hidden className="size-6 shrink-0 text-deep" />
        <p className="flex-1 text-[15px] text-ink">
          Something doesn’t feel right? The guided symptom check can help you decide whether to talk to a doctor.
        </p>
        <LinkButton to="/check" variant="secondary">
          Start a check
        </LinkButton>
      </section>
    </div>
  );
}

function Stat({ label, value, hint }) {
  return (
    <div className="px-1 py-4 sm:px-4 sm:first:pl-0">
      <dt className="text-xs font-medium text-muted">{label}</dt>
      <dd className="mt-1 font-display text-2xl text-ink">{value}</dd>
      {hint && <dd className="text-xs text-muted">{hint}</dd>}
    </div>
  );
}
