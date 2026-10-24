import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  ArrowRight,
  CalendarDays,
  CalendarHeart,
  ChevronRight,
  ClipboardPlus,
  FileText,
  Flower2,
  HeartPulse,
  LineChart,
  Lock,
  NotebookPen,
  ShieldAlert,
  Sparkles,
  Sun,
  TrendingUp,
  Wind,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api, { getErrorMessage } from '../../lib/api';
import {
  differenceInCalendarDays,
  formatDate,
  formatShortDate,
  parseISO,
  relativeDay,
  todayISO,
} from '../../lib/dates';
import PageHeader from '../../components/ui/PageHeader';
import CycleRing from '../../components/ui/CycleRing';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { CardSkeleton, ErrorState } from '../../components/ui/States';
import { cn } from '../../lib/utils';
import { LIFE_STAGES } from '../../lib/constants';

const greetingForHour = (hour) => {
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
};

const stagePhaseNudge = (stages = [], phaseKey) => {
  if (stages.includes('pcos')) {
    return 'For PCOS awareness, consistent logs of cycle spacing, acne and energy are more useful than any single day.';
  }
  if (stages.includes('perimenopause')) {
    return 'Through perimenopause, cycle timing can shift from month to month. Patterns over several months matter most.';
  }
  if (stages.includes('fertility')) {
    return phaseKey === 'ovulation'
      ? 'Your estimated fertile window is open. Ovulation tests can add detail if you are trying to conceive.'
      : 'Fertility predictions are estimates. Combining them with body signs gives a clearer picture.';
  }
  return 'One log at a time is enough. Consistency builds the patterns that make predictions useful.';
};

const MetricCard = ({ icon: Icon, label, value, helper, tone = 'rose', to, badge }) => {
  const Wrapper = to ? Link : 'div';
  return (
    <Wrapper
      {...(to ? { to } : {})}
      className={cn(
        'card group relative flex flex-col justify-between p-5 transition-all',
        to && 'hover:-translate-y-0.5 hover:border-pink-glow/40 hover:shadow-card'
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <span
          className={cn(
            'grid h-10 w-10 place-items-center rounded-xl',
            tone === 'glow' && 'bg-pink-glow text-white',
            tone === 'deep' && 'bg-deep-rose text-white',
            tone === 'rose' && 'bg-soft-petal text-deep-rose',
            tone === 'soft' && 'bg-blush-pink/80 text-deep-rose'
          )}
        >
          <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
        </span>
        {badge ? <Badge tone="outline" className="bg-white/70">{badge}</Badge> : null}
        {to ? (
          <ChevronRight
            className="h-4 w-4 text-deep-rose/30 transition-transform group-hover:translate-x-0.5 group-hover:text-deep-rose/70"
            aria-hidden="true"
          />
        ) : null}
      </div>
      <div className="mt-5">
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted">{label}</p>
        <p className="mt-1 font-display text-xl font-semibold leading-tight text-deep-rose sm:text-[1.35rem]">
          {value}
        </p>
        <p className="mt-1.5 text-[11px] leading-relaxed text-muted">{helper}</p>
      </div>
    </Wrapper>
  );
};

const QuickAction = ({ to, icon: Icon, title, description, primary = false }) => (
  <Link
    to={to}
    className={cn(
      'group flex items-center gap-4 rounded-2xl border p-4 transition-all hover:-translate-y-0.5 hover:shadow-card sm:p-5',
      primary
        ? 'border-pink-glow bg-pink-glow text-white shadow-glow hover:bg-rose-pink'
        : 'border-blush-pink/70 bg-white text-deep-rose hover:border-pink-glow/50'
    )}
  >
    <span
      className={cn(
        'grid h-11 w-11 shrink-0 place-items-center rounded-xl',
        primary ? 'bg-white/20 text-white' : 'bg-soft-petal text-deep-rose'
      )}
    >
      <Icon className="h-5 w-5" aria-hidden="true" />
    </span>
    <span className="min-w-0 flex-1">
      <span className="block text-sm font-bold">{title}</span>
      <span className={cn('mt-0.5 block text-[11px] leading-relaxed', primary ? 'text-white/80' : 'text-muted')}>
        {description}
      </span>
    </span>
    <ArrowRight
      className={cn(
        'h-4 w-4 shrink-0 transition-transform group-hover:translate-x-0.5',
        primary ? 'text-white' : 'text-pink-glow'
      )}
      aria-hidden="true"
    />
  </Link>
);

const MonthTrack = ({ stats }) => {
  const total = Math.max(21, Math.round(stats.averageCycleLength || 28));
  const period = Math.max(1, Math.round(stats.averagePeriodLength || 5));
  const today = todayISO();
  const elapsed = stats.currentCycleDay
    ?? differenceInCalendarDays(parseISO(today), parseISO(stats.lastPeriodStart || today)) + 1;
  const currentDay = Math.min(total, Math.max(1, elapsed));
  const ovulationDay = Math.max(8, total - 14);
  const fertileStartDay = sexualDay(ovulationDay - 5);
  const fertileEndDay = sexualDay(ovulationDay + 1);

  function sexualDay(value) {
    return Math.min(total, Math.max(1, value));
  }

  const pct = (day) => `${Math.min(100, (day / total) * 100)}%`;

  return (
    <div>
      <div className="relative h-14">
        <div className="absolute inset-x-0 top-3 h-8 overflow-hidden rounded-full bg-rose-mist ring-1 ring-blush-pink/60">
          <div
            className="absolute inset-y-0 left-0 bg-deep-rose/85"
            style={{ width: pct(period) }}
            title="Menstrual days"
          />
          <div
            className="absolute inset-y-0 bg-pink-glow/35"
            style={{ left: pct(fertileStartDay - 1), width: pct(fertileEndDay - fertileStartDay + 1) }}
            title="Estimated fertile window"
          />
          <div
            className="absolute inset-y-0 right-0 bg-blush-pink/40"
            style={{ left: pct(fertileEndDay) }}
            title="Luteal phase"
          />
          <div
            className="absolute inset-y-1 w-1.5 -translate-x-1/2 rounded-full bg-white shadow ring-1 ring-deep-rose/30"
            style={{ left: pct(ovulationDay - 0.5) }}
            title="Predicted ovulation"
          />
        </div>
        <div
          className="absolute top-1 z-10 flex -translate-x-1/2 flex-col items-center"
          style={{ left: pct(currentDay - 0.5) }}
        >
          <span className="rounded-full bg-deep-rose px-2 py-0.5 text-[9px] font-bold text-white shadow">
            Today
          </span>
          <span className="mt-2 h-3 w-3 rounded-full border-2 border-white bg-pink-glow shadow" />
        </div>
      </div>
      <div className="mt-1 flex justify-between text-[9px] font-semibold uppercase tracking-wide text-muted">
        <span>Day 1</span>
        <span>Fertile window</span>
        <span>Day {total}</span>
      </div>
      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
        <span className="flex items-center gap-1.5 text-[10px] font-medium text-muted">
          <span className="h-2 w-2 rounded-full bg-deep-rose" /> Period
        </span>
        <span className="flex items-center gap-1.5 text-[10px] font-medium text-muted">
          <span className="h-2 w-2 rounded-full bg-pink-glow/50" /> Fertile window
        </span>
        <span className="flex items-center gap-1.5 text-[10px] font-medium text-muted">
          <span className="h-2 w-2 rounded-full bg-blush-pink" /> Luteal
        </span>
        <span className="flex items-center gap-1.5 text-[10px] font-medium text-muted">
          <span className="h-2 w-2 rounded-full border border-deep-rose bg-white" /> Predicted ovulation
        </span>
      </div>
    </div>
  );
};

const AdultDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [cycleRes, symptomRes] = await Promise.all([
        api.get(`/cycles/${user._id}`),
        api.get(`/symptoms/${user._id}`, { params: { limit: 12 } }),
      ]);
      setData({
        stats: cycleRes.data.stats,
        series: cycleRes.data.series,
        logs: symptomRes.data.logs,
        totalLogs: symptomRes.data.total,
      });
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
  const logs = data?.logs || [];
  const today = todayISO();
  const latestLog = logs.find((log) => log.date === today) || logs[0];
  const firstName = user?.name?.split(' ')[0] || 'there';
  const stage = LIFE_STAGES.find((item) => user?.lifeStages?.includes(item.value));

  const cycleDay =
    stats?.currentCycleDay && stats.currentCycleDay > 0
      ? Math.min(stats.currentCycleDay, stats.averageCycleLength + 15)
      : null;

  const recentSymptoms = latestLog
    ? (latestLog.physical?.length || 0) + (latestLog.mood?.length || 0)
    : 0;

  const nextPeriodHelper = useMemo(() => {
    if (!stats?.hasData) return 'Log your period to generate a prediction.';
    if (stats.daysLate > 0) return `${stats.daysLate} day${stats.daysLate === 1 ? '' : 's'} later than predicted`;
    if (stats.daysUntilNextPeriod === 0) return 'Predicted to start today';
    return `In ${stats.daysUntilNextPeriod} day${stats.daysUntilNextPeriod === 1 ? '' : 's'}`;
  }, [stats]);

  const nudge = stagePhaseNudge(user?.lifeStages, stats?.phaseKey);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-56 rounded-3xl skeleton" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[0, 1, 2, 3].map((index) => (
            <CardSkeleton key={index} rows={2} />
          ))}
        </div>
        <CardSkeleton rows={4} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader
          eyebrow="Your health space"
          title={`Welcome back, ${firstName}`}
          description="Your personal cycle and symptom overview."
        />
        <ErrorState message={error} onRetry={() => setRefreshKey((key) => key + 1)} />
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-7">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl border border-white/70 bg-hero-gradient p-5 shadow-soft sm:p-7 lg:p-8">
        <div className="pointer-events-none absolute -right-14 -top-24 h-72 w-72 rounded-full bg-white/35 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-24 left-1/3 h-72 w-72 rounded-full bg-pink-glow/15 blur-3xl" />
        <div className="relative grid items-center gap-6 lg:grid-cols-[1fr_auto]">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="outline" className="border-white/80 bg-white/60" icon={Sparkles}>
                {stats?.hasData ? stats.phase.label : 'Your first cycle'}
              </Badge>
              {stage ? (
                <span className="rounded-full border border-white/60 bg-white/30 px-2.5 py-1 text-[10px] font-bold text-deep-rose/80">
                  {stage.short}
                </span>
              ) : null}
            </div>
            <h1 className="mt-3 font-display text-[2rem] font-semibold leading-tight tracking-tight text-deep-rose sm:text-[2.65rem]">
              {greetingForHour(new Date().getHours())}, {firstName}.
            </h1>
            {stats?.hasData ? (
              <>
                <p className="mt-2 text-sm leading-relaxed text-deep-rose/80 sm:text-[15px]">
                  <span className="font-bold">{stats.phase.label}</span> — Day {cycleDay} of{' '}
                  {stats.averageCycleLength}. {stats.phase.description}
                </p>
                <div className="mt-5 flex flex-wrap items-center gap-2.5">
                  <span className="flex items-center gap-1.5 rounded-full bg-white/65 px-3 py-1.5 text-[11px] font-semibold text-deep-rose">
                    <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
                    Next period {nextPeriodHelper.toLowerCase()}
                  </span>
                  <span className="flex items-center gap-1.5 rounded-full bg-white/65 px-3 py-1.5 text-[11px] font-semibold text-deep-rose">
                    <Flower2 className="h-3.5 w-3.5" aria-hidden="true" />
                    Ovulation around {formatShortDate(stats.ovulationDate)}
                  </span>
                </div>
              </>
            ) : (
              <>
                <p className="mt-2 max-w-xl text-sm leading-relaxed text-deep-rose/80 sm:text-[15px]">
                  Your rhythm starts with one period. Add your most recent period and FemAware will
                  begin mapping your phases, fertile window and symptom patterns.
                </p>
                <div className="mt-5 flex flex-wrap gap-2.5">
                  <Link to="/cycle" className="btn-primary">
                    <CalendarHeart className="h-4 w-4" aria-hidden="true" />
                    Log my period
                  </Link>
                  <Link to="/symptoms" className="btn-secondary border-white/70 bg-white/60">
                    <NotebookPen className="h-4 w-4" aria-hidden="true" />
                    Check in today
                  </Link>
                </div>
              </>
            )}
          </div>

          <div className="flex items-center justify-center lg:pr-3">
            <div className="relative rounded-full bg-white/25 p-2 ring-1 ring-white/50 backdrop-blur-sm">
              <CycleRing
                day={cycleDay || '—'}
                total={stats?.averageCycleLength || 28}
                phaseLabel={
                  stats?.hasData
                    ? stats.phase.label.replace(' phase', '').replace(' window', '')
                    : 'getting started'
                }
                className="h-36 w-36 sm:h-44 sm:w-44"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Metrics */}
      <section aria-label="Key cycle indicators" className="grid gap-3.5 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          icon={CalendarHeart}
          label="Next predicted period"
          value={stats?.hasData ? formatDate(stats.nextPeriodStart, 'EEE, d MMM') : 'Not yet predicted'}
          helper={nextPeriodHelper}
          tone="deep"
          to="/cycle"
          badge={stats?.daysLate > 0 ? `${stats.daysLate}d late` : undefined}
        />
        <MetricCard
          icon={Flower2}
          label="Estimated ovulation"
          value={stats?.hasData ? formatDate(stats.ovulationDate, 'd MMM') : 'Add a period first'}
          helper={
            stats?.hasData
              ? `Fertile window ${formatShortDate(stats.fertileStart)} – ${formatShortDate(stats.fertileEnd)}`
              : 'Your fertile window appears after your first log.'
          }
          tone="glow"
          to="/cycle"
        />
        <MetricCard
          icon={Activity}
          label="Average cycle length"
          value={stats?.hasData ? `${stats.averageCycleLength} days` : `${user?.cycleProfile?.averageCycleLength || 28} days`}
          helper={
            stats?.hasData
              ? `Variation ±${stats.variation} days · ${stats.regularity}`
              : 'A starting estimate from your setup.'
          }
          tone="rose"
          to="/insights"
        />
        <MetricCard
          icon={NotebookPen}
          label="Latest check-in"
          value={latestLog ? relativeDay(latestLog.date) : 'No entry yet'}
          helper={
            latestLog
              ? `${recentSymptoms} signal${recentSymptoms === 1 ? '' : 's'} recorded${latestLog.flow !== 'none' ? ` · ${latestLog.flow} flow` : ''}`
              : 'How are you feeling today?'
          }
          tone="soft"
          to="/symptoms"
          badge={latestLog?.date === today ? 'Today' : undefined}
        />
      </section>

      {/* Quick actions */}
      <section aria-labelledby="quick-actions-title">
        <div className="mb-3 flex items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Keep it simple</p>
            <h2 id="quick-actions-title" className="section-title mt-1">
              Quick actions
            </h2>
          </div>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          <QuickAction
            to="/symptoms"
            icon={ClipboardPlus}
            title="Log today's symptoms"
            description="A 30-second check-in builds your pattern."
            primary
          />
          <QuickAction
            to="/insights"
            icon={LineChart}
            title="View cycle trends"
            description="See length, flow and symptom patterns."
          />
          <QuickAction
            to="/doctor-report"
            icon={FileText}
            title="Generate doctor report"
            description="A structured summary for your next visit."
          />
        </div>
      </section>

      {/* Main grid */}
      <div className="grid gap-4 xl:grid-cols-[1.55fr_1fr] xl:items-start">
        <div className="space-y-4">
          <section className="card p-5 sm:p-6" aria-labelledby="month-glance-title">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="eyebrow">Your cycle</p>
                <h2 id="month-glance-title" className="section-title mt-1">
                  This month at a glance
                </h2>
              </div>
              <Link
                to="/cycle"
                className="flex items-center gap-1 text-xs font-bold text-deep-rose transition-colors hover:text-rose-pink"
              >
                Open calendar
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </div>

            {stats?.hasData ? (
              <>
                <div className="mt-6">
                  <MonthTrack stats={stats} />
                </div>
                <div className="mt-6 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                  {[
                    { label: 'Cycle day', value: cycleDay },
                    { label: 'Avg. period', value: `${stats.averagePeriodLength} days` },
                    { label: 'Cycles logged', value: stats.cycleCount },
                    { label: 'Regularity', value: stats.regularity },
                  ].map((item) => (
                    <div key={item.label} className="rounded-xl bg-rose-mist/80 px-3 py-2.5">
                      <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-muted">
                        {item.label}
                      </p>
                      <p className="mt-0.5 truncate text-xs font-bold capitalize text-deep-rose">
                        {item.value}
                      </p>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="mt-4 rounded-2xl border border-dashed border-blush-pink bg-rose-mist/60 p-6 text-center">
                <CalendarHeart className="mx-auto h-8 w-8 text-pink-glow" aria-hidden="true" />
                <p className="mt-3 text-sm font-bold text-deep-rose">Your calendar is waiting</p>
                <p className="mx-auto mt-1 max-w-sm text-xs leading-relaxed text-muted">
                  Add your most recent period to see your cycle day, fertile window and next period
                  prediction.
                </p>
                <Link to="/cycle" className="btn-primary btn-sm mt-4">
                  Add a period
                </Link>
              </div>
            )}
          </section>

          <section className="card p-5 sm:p-6" aria-labelledby="recent-logs-title">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="eyebrow">Recent check-ins</p>
                <h2 id="recent-logs-title" className="section-title mt-1">
                  How you&apos;ve been feeling
                </h2>
              </div>
              <Link
                to="/symptoms"
                className="flex items-center gap-1 text-xs font-bold text-deep-rose transition-colors hover:text-rose-pink"
              >
                Journal
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </div>

            {logs.length ? (
              <ul className="mt-4 divide-y divide-blush-pink/40">
                {logs.slice(0, 3).map((log) => {
                  const physical = log.physical?.map((item) => item.name) || [];
                  const mood = log.mood || [];
                  const tags = [...physical, ...mood].slice(0, 4);
                  return (
                    <li key={log._id} className="flex items-start gap-3 py-3.5 first:pt-2 last:pb-0">
                      <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-soft-petal text-[11px] font-bold text-deep-rose">
                        {formatDate(log.date, 'd')}
                        <span className="sr-only">{formatDate(log.date, 'MMMM')}</span>
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-xs font-bold text-ink">{relativeDay(log.date)}</p>
                          {log.flow !== 'none' ? (
                            <Badge tone="pink" className="!px-2 !py-0.5">
                              {log.flow} flow
                            </Badge>
                          ) : null}
                          {log.energyLevel ? (
                            <span className="flex items-center gap-1 text-[10px] text-muted">
                              <Sun className="h-3 w-3" aria-hidden="true" />
                              Energy {log.energyLevel}/5
                            </span>
                          ) : null}
                        </div>
                        <div className="mt-1.5 flex flex-wrap gap-1.5">
                          {tags.length ? (
                            tags.map((tag) => (
                              <span
                                key={tag}
                                className="rounded-full bg-rose-mist px-2 py-0.5 text-[10px] font-medium text-deep-rose/80"
                              >
                                {tag}
                              </span>
                            ))
                          ) : (
                            <span className="text-[11px] italic text-muted">No symptoms noted</span>
                          )}
                          {physical.length + mood.length > 4 ? (
                            <span className="text-[10px] font-semibold text-muted">
                              +{physical.length + mood.length - 4} more
                            </span>
                          ) : null}
                        </div>
                      </div>
                      <Link
                        to="/symptoms"
                        className="mt-1 rounded-lg p-1.5 text-muted transition-colors hover:bg-rose-mist hover:text-deep-rose"
                        aria-label={`View or edit entry for ${formatDate(log.date)}`}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="mt-4 rounded-2xl bg-rose-mist/70 p-5 text-center">
                <NotebookPen className="mx-auto h-7 w-7 text-pink-glow" aria-hidden="true" />
                <p className="mt-2 text-sm font-bold text-deep-rose">Your journal is a blank page</p>
                <p className="mt-1 text-xs text-muted">Log how you feel — even “nothing today” is useful.</p>
                <Link to="/symptoms" className="btn-secondary btn-sm mt-3">
                  Start today&apos;s entry
                </Link>
              </div>
            )}
          </section>
        </div>

        <div className="space-y-4">
          <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-deep-rose to-[#8f1446] p-5 text-white shadow-card sm:p-6">
            <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full border border-white/15" />
            <div className="pointer-events-none absolute -right-2 -top-2 h-20 w-20 rounded-full bg-pink-glow/25 blur-xl" />
            <div className="relative">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/15">
                <HeartPulse className="h-4 w-4" aria-hidden="true" />
              </span>
              <p className="mt-4 text-[10px] font-bold uppercase tracking-[0.16em] text-blush-pink">
                Today&apos;s care nudge
              </p>
              <h2 className="mt-1.5 font-display text-xl font-semibold">
                {stats?.hasData ? stats.phase.tone : 'Begin where you are'}
              </h2>
              <p className="mt-2 text-xs leading-relaxed text-white/80">
                {stats?.hasData ? stats.phase.description : nudge}
              </p>
              <p className="mt-3 rounded-xl bg-white/10 p-2.5 text-[10px] leading-relaxed text-white/75">
                {nudge}
              </p>
              <Link
                to="/resources"
                className="mt-4 inline-flex items-center gap-1.5 text-[11px] font-bold text-white underline decoration-white/30 underline-offset-4 hover:decoration-white"
              >
                Explore the resource library
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </div>
          </section>

          <section className="rounded-2xl border border-blush-pink/70 bg-white p-5 shadow-soft sm:p-6">
            <div className="flex items-center justify-between">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-soft-petal text-deep-rose">
                <FileText className="h-4 w-4" aria-hidden="true" />
              </span>
              <Badge tone="pink">Visit prep</Badge>
            </div>
            <h2 className="mt-4 font-display text-lg font-semibold text-deep-rose">
              Make your next appointment count.
            </h2>
            <p className="mt-1.5 text-xs leading-relaxed text-muted">
              Turn 3–6 months of logs into a clear, printable summary with your questions for the
              clinician.
            </p>
            <QueueReportStats stats={stats} totalLogs={data?.totalLogs || 0} />
            <Link to="/doctor-report" className="btn-secondary btn-sm mt-4 w-full">
              Build my report
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </section>

          <section className="rounded-2xl border border-blush-pink/60 bg-soft-petal/40 p-4">
            <div className="flex items-center gap-2 text-deep-rose">
              <Lock className="h-3.5 w-3.5" aria-hidden="true" />
              <p className="text-[10px] font-bold uppercase tracking-wide">Private by design</p>
            </div>
            <p className="mt-1.5 text-[11px] leading-relaxed text-muted">
              Your health data is tied to your account and never sold. Export or permanently delete
              it whenever you choose.
            </p>
            <Link
              to="/privacy"
              className="mt-2 inline-flex items-center gap-1 text-[10px] font-bold text-deep-rose hover:text-rose-pink"
            >
              Review privacy controls
              <ChevronRight className="h-3 w-3" aria-hidden="true" />
            </Link>
          </section>
        </div>
      </div>

      {/* Universal guidance banner */}
      <section
        className="overflow-hidden rounded-2xl border border-blush-pink/80 bg-white shadow-soft"
        aria-labelledby="guidance-title"
      >
        <div className="grid gap-5 p-5 sm:p-6 lg:grid-cols-[auto_1fr_auto] lg:items-center">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-rose-mist text-deep-rose">
            <ShieldAlert className="h-6 w-6" aria-hidden="true" />
          </span>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 id="guidance-title" className="font-display text-lg font-semibold text-deep-rose">
                When cycle changes deserve a professional conversation
              </h2>
              <Badge tone="pink">Guidance, not diagnosis</Badge>
            </div>
            <p className="mt-1.5 text-xs leading-relaxed text-muted">
              Most variation is normal. Reach out to a gynecologist or clinician if you notice any of
              the following — especially if it is new or persistent.
            </p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {[
                'Bleeding through protection hourly',
                'Severe pain affecting daily life',
                'Periods consistently over 35 days apart',
                'Bleeding after menopause',
                'Symptoms that keep worsening',
              ].map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-blush-pink/60 bg-rose-mist/70 px-2.5 py-1 text-[10px] font-medium text-deep-rose/80"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row lg:flex-col">
            <Link to="/late-period" className="btn-secondary btn-sm whitespace-nowrap">
              Late period guide
            </Link>
            <Link to="/doctor-report" className="btn-primary btn-sm whitespace-nowrap">
              Prepare for a visit
            </Link>
          </div>
        </div>
        <div className="border-t border-blush-pink/40 bg-rose-mist/50 px-5 py-2.5 sm:px-6">
          <p className="text-[9px] leading-relaxed text-muted">
            If you have severe pain, heavy bleeding with dizziness, or any symptom that feels urgent,
            seek same-day medical care. FemAware does not provide emergency care.
          </p>
        </div>
      </section>
    </div>
  );
};

const QueueReportStats = ({ stats, totalLogs }) => (
  <div className="mt-4 grid grid-cols-3 gap-2">
    {[
      { label: 'Cycles', value: stats?.cycleCount ?? 0, icon: Wind },
      { label: 'Logs', value: totalLogs ?? 0, icon: NotebookPen },
      { label: 'Variance', value: stats ? `±${stats.variation}d` : '—', icon: TrendingUp },
    ].map((item) => {
      const Icon = item.icon;
      return (
        <div key={item.label} className="rounded-xl bg-rose-mist/70 p-2 text-center">
          <Icon className="mx-auto h-3.5 w-3.5 text-pink-glow" aria-hidden="true" />
          <p className="mt-1 text-xs font-bold text-deep-rose">{item.value}</p>
          <p className="text-[8px] font-bold uppercase tracking-wide text-muted">{item.label}</p>
        </div>
      );
    })}
  </div>
);

export default AdultDashboard;
