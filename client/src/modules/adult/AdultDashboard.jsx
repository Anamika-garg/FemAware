import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  CalendarHeart,
  ChevronRight,
  ClipboardPlus,
  FileText,
  HeartPulse,
  Lock,
  NotebookPen,
  ShieldAlert,
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
import { CardSkeleton, ErrorState } from '../../components/ui/States';
import { cn } from '../../lib/utils';
import { LIFE_STAGES } from '../../lib/constants';
import { getArticle, getReadArticles } from '../../data/library';
import LearningProgress from '../../components/site/LearningProgress';

const ARTICLES_FOR_FOCUS = {
  general: ['understanding-your-cycle', 'pms-common-and-when-to-seek-help'],
  pcos: ['pcos-awareness', 'understanding-your-cycle'],
  perimenopause: ['perimenopause-101', 'hot-flushes-sleep'],
  fertility: ['fertile-window', 'fertility-assessment'],
};

const ContinueLearning = ({ stages = [] }) => {
  const ids = [...new Set([...(stages.length ? stages : ['general']).flatMap((key) => ARTICLES_FOR_FOCUS[key] || []), 'pms-common-and-when-to-seek-help'])];
  const articles = ids.map(getArticle).filter(Boolean).slice(0, 3);
  const read = getReadArticles();
  const done = articles.filter((article) => read.includes(article.id)).length;
  const next = articles.find((article) => !read.includes(article.id));
  return (
    <section className="card grid gap-6 p-6 sm:p-8 lg:grid-cols-[1fr_1.4fr] lg:gap-12" aria-labelledby="continue-learning">
      <div>
        <p className="eyebrow">Continue learning</p>
        <h2 id="continue-learning" className="mt-2 font-display text-2xl text-ink">
          {next ? next.title : 'You’ve read your picks'}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          {next ? next.summary : 'Browse the library for more on your cycle, symptoms and care.'}
        </p>
        <Link to={next ? `/library/${next.id}` : '/library'} className="btn-secondary mt-5">
          {next ? `Read · ${next.readTime}` : 'Open the library'}
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
      <div className="flex flex-col justify-between gap-5">
        <ul className="divide-y divide-line border-y border-line">
          {articles.map((article) => (
            <li key={article.id}>
              <Link to={`/library/${article.id}`} className="flex items-center justify-between gap-4 py-3 text-sm text-ink hover:text-deep-rose">
                <span>{article.title}</span>
                <span className="shrink-0 text-xs text-muted">{read.includes(article.id) ? 'Read' : article.readTime}</span>
              </Link>
            </li>
          ))}
        </ul>
        <LearningProgress done={done} total={articles.length} label="suggested articles read" />
      </div>
    </section>
  );
};

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

const MonthTrack = ({ stats }) => {
  const total = Math.max(21, Math.round(stats.averageCycleLength || 28));
  const period = Math.max(1, Math.round(stats.averagePeriodLength || 5));
  const today = todayISO();
  const elapsed = stats.currentCycleDay
    ?? differenceInCalendarDays(parseISO(today), parseISO(stats.lastPeriodStart || today)) + 1;
  const currentDay = Math.min(total, Math.max(1, elapsed));
  const ovulationDay = Math.max(8, total - 14);
  const fertileStartDay = clampDay(ovulationDay - 5);
  const fertileEndDay = clampDay(ovulationDay + 1);

  function clampDay(value) {
    return Math.min(total, Math.max(1, value));
  }

  const pct = (day) => `${Math.min(100, (day / total) * 100)}%`;

  return (
    <div>
      <div className="relative h-14">
        <div className="absolute inset-x-0 top-3 h-8 overflow-hidden rounded-full bg-rose-mist ring-1 ring-line">
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
            className="absolute inset-y-1 w-1.5 -translate-x-1/2 rounded-full bg-white ring-1 ring-deep-rose/40"
            style={{ left: pct(ovulationDay - 0.5) }}
            title="Predicted ovulation"
          />
        </div>
        <div
          className="absolute top-1 z-10 flex -translate-x-1/2 flex-col items-center"
          style={{ left: pct(currentDay - 0.5) }}
        >
          <span className="rounded-md bg-deep-rose px-2 py-0.5 text-xs font-semibold text-white">
            Today
          </span>
          <span className="mt-2 h-3 w-3 rounded-full border-2 border-white bg-deep-rose" />
        </div>
      </div>
      <div className="mt-1 flex justify-between text-xs font-medium text-muted">
        <span>Day 1</span>
        <span>Fertile window (estimate)</span>
        <span>Day {total}</span>
      </div>
      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
        <span className="flex items-center gap-1.5 text-xs text-muted">
          <span className="h-2 w-2 rounded-full bg-deep-rose" /> Period
        </span>
        <span className="flex items-center gap-1.5 text-xs text-muted">
          <span className="h-2 w-2 rounded-full bg-pink-glow/50" /> Fertile window
        </span>
        <span className="flex items-center gap-1.5 text-xs text-muted">
          <span className="h-2 w-2 rounded-full bg-blush-pink" /> Luteal
        </span>
        <span className="flex items-center gap-1.5 text-xs text-muted">
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
        <div className="h-64 rounded-2xl skeleton" />
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
      {/* Hero: one clear next step */}
      <section className="card overflow-hidden" aria-labelledby="dashboard-greeting">
        <div className="grid items-center gap-8 p-6 sm:p-8 lg:grid-cols-[1fr_auto] lg:gap-12">
          <div>
            <p className="eyebrow">
              {stats?.hasData ? stats.phase.label : 'Getting started'}
              {stage ? <span className="font-medium normal-case tracking-normal text-muted"> · {stage.short}</span> : null}
            </p>
            <h1 id="dashboard-greeting" className="mt-3 font-display text-[2.25rem] leading-[1.1] text-ink sm:text-[2.75rem]">
              {greetingForHour(new Date().getHours())}, {firstName}.
            </h1>
            <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-muted sm:text-base">
              {stats?.hasData
                ? `Day ${cycleDay} of about ${stats.averageCycleLength}. ${stats.phase.description}`
                : 'Your rhythm starts with one period. Add your most recent one and FemAware will begin mapping your cycle and symptom patterns.'}
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              {stats?.hasData ? (
                <Link to="/symptoms" className="btn-primary btn-lg">
                  <ClipboardPlus className="h-4 w-4" aria-hidden="true" />
                  {latestLog?.date === today ? 'Update today’s check-in' : 'Log how today feels'}
                </Link>
              ) : (
                <Link to="/cycle" className="btn-primary btn-lg">
                  <CalendarHeart className="h-4 w-4" aria-hidden="true" />
                  Log my period
                </Link>
              )}
              <div className="flex flex-wrap gap-x-5 gap-y-2 sm:ml-2">
                <Link to="/insights" className="link text-sm">
                  View trends
                </Link>
                <Link to="/doctor-report" className="link text-sm">
                  Prepare a doctor report
                </Link>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center gap-2">
            <CycleRing
              day={cycleDay || '—'}
              total={stats?.averageCycleLength || 28}
              phaseLabel={
                stats?.hasData
                  ? stats.phase.label.replace(' phase', '').replace(' window', '')
                  : 'getting started'
              }
              className="h-40 w-40 sm:h-44 sm:w-44"
            />
            {stats?.hasData ? <p className="text-xs text-muted">Phases are estimates</p> : null}
          </div>
        </div>

        {stats?.hasData ? (
          <dl className="grid grid-cols-2 border-t border-line lg:grid-cols-4" aria-label="Your cycle summary">
            {[
              {
                label: 'Next period (estimate)',
                value: formatDate(stats.nextPeriodStart, 'EEE d MMM'),
                helper: nextPeriodHelper,
                to: '/cycle',
              },
              {
                label: 'Fertile window (estimate)',
                value: `${formatShortDate(stats.fertileStart)} – ${formatShortDate(stats.fertileEnd)}`,
                helper: 'Not a contraceptive method',
                to: '/cycle',
              },
              {
                label: 'Average cycle',
                value: `${stats.averageCycleLength} days`,
                helper: `±${stats.variation} days · ${stats.regularity}`,
                to: '/insights',
              },
              {
                label: 'Latest check-in',
                value: latestLog ? relativeDay(latestLog.date) : 'None yet',
                helper: latestLog
                  ? `${recentSymptoms} symptom${recentSymptoms === 1 ? '' : 's'} recorded`
                  : 'How are you feeling today?',
                to: '/symptoms',
              },
            ].map((item, index) => (
              <Link
                key={item.label}
                to={item.to}
                className={cn(
                  'group block px-6 py-5 transition-colors hover:bg-rose-mist sm:px-8',
                  index % 2 === 1 && 'border-l border-line',
                  index > 1 && 'border-t border-line lg:border-t-0',
                  index === 2 && 'lg:border-l'
                )}
              >
                <dt className="text-xs font-medium text-muted">{item.label}</dt>
                <dd className="mt-1 font-display text-xl text-ink group-hover:text-deep-rose">{item.value}</dd>
                <dd className="mt-0.5 text-xs text-muted">{item.helper}</dd>
              </Link>
            ))}
          </dl>
        ) : null}
      </section>

      <ContinueLearning stages={user?.lifeStages} />

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
                className="flex items-center gap-1 text-xs font-semibold text-deep-rose transition-colors hover:text-rose-pink"
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
                      <p className="text-xs font-semibold text-muted">
                        {item.label}
                      </p>
                      <p className="mt-0.5 truncate text-xs font-semibold capitalize text-deep-rose">
                        {item.value}
                      </p>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="mt-4 rounded-2xl border border-dashed border-blush-pink bg-rose-mist/60 p-6 text-center">
                <CalendarHeart className="mx-auto h-8 w-8 text-pink-glow" aria-hidden="true" />
                <p className="mt-3 text-sm font-semibold text-deep-rose">Your calendar is waiting</p>
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
                className="flex items-center gap-1 text-xs font-semibold text-deep-rose transition-colors hover:text-rose-pink"
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
                      <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-soft-petal text-xs font-semibold text-deep-rose">
                        {formatDate(log.date, 'd')}
                        <span className="sr-only">{formatDate(log.date, 'MMMM')}</span>
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-xs font-semibold text-ink">{relativeDay(log.date)}</p>
                          {log.flow !== 'none' ? (
                            <Badge tone="pink" className="!px-2 !py-0.5">
                              {log.flow} flow
                            </Badge>
                          ) : null}
                          {log.energyLevel ? (
                            <span className="flex items-center gap-1 text-xs text-muted">
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
                                className="rounded-full bg-rose-mist px-2 py-0.5 text-xs font-medium text-muted"
                              >
                                {tag}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs italic text-muted">No symptoms noted</span>
                          )}
                          {physical.length + mood.length > 4 ? (
                            <span className="text-xs font-semibold text-muted">
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
                <p className="mt-2 text-sm font-semibold text-deep-rose">Your journal is a blank page</p>
                <p className="mt-1 text-xs text-muted">Log how you feel — even “nothing today” is useful.</p>
                <Link to="/symptoms" className="btn-secondary btn-sm mt-3">
                  Start today&apos;s entry
                </Link>
              </div>
            )}
          </section>
        </div>

        <div className="space-y-4">
          <section className="rounded-2xl border border-soft-petal bg-rose-mist p-5 sm:p-6">
            <div>
              <p className="flex items-center gap-2 text-xs font-semibold text-deep-rose">
                <HeartPulse className="h-4 w-4" aria-hidden="true" />
                A note for today
              </p>
              <h2 className="mt-2 font-display text-2xl text-ink">
                {stats?.hasData ? stats.phase.tone : 'Begin where you are'}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted">{nudge}</p>
              <Link to="/resources" className="link mt-4 inline-flex items-center gap-1.5 text-sm">
                Explore the resource library
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </div>
          </section>

          <section className="card p-5 sm:p-6">
            <p className="flex items-center gap-2 text-xs font-semibold text-deep-rose">
              <FileText className="h-4 w-4" aria-hidden="true" />
              Visit preparation
            </p>
            <h2 className="mt-2 font-display text-2xl text-ink">
              Make your next appointment count.
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Turn 3–6 months of logs into a clear, printable summary with your questions for the
              clinician.
            </p>
            <QueueReportStats stats={stats} totalLogs={data?.totalLogs || 0} />
            <Link to="/doctor-report" className="btn-secondary btn-sm mt-4 w-full">
              Build my report
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </section>

          <section className="rounded-2xl border border-line p-5">
            <div className="flex items-center gap-2 text-deep-rose">
              <Lock className="h-3.5 w-3.5" aria-hidden="true" />
              <p className="text-xs font-semibold">Private by design</p>
            </div>
            <p className="mt-1.5 text-xs leading-relaxed text-muted">
              Your records are tied to your account. Export or permanently delete them whenever you
              choose.
            </p>
            <Link
              to="/privacy"
              className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-deep-rose hover:text-rose-pink"
            >
              Review privacy controls
              <ChevronRight className="h-3 w-3" aria-hidden="true" />
            </Link>
          </section>
        </div>
      </div>

      {/* Universal guidance banner */}
      <section
        className="card overflow-hidden"
        aria-labelledby="guidance-title"
      >
        <div className="grid gap-5 p-5 sm:p-6 lg:grid-cols-[auto_1fr_auto] lg:items-center">
          <span className="grid h-11 w-11 place-items-center rounded-full border border-blush-pink bg-rose-mist text-deep-rose">
            <ShieldAlert className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 id="guidance-title" className="font-display text-2xl text-ink">
                When cycle changes deserve a professional conversation
              </h2>
              <Badge tone="pink">Guidance, not diagnosis</Badge>
            </div>
            <p className="mt-1.5 text-xs leading-relaxed text-muted">
              Most variation is normal. Reach out to a gynecologist or clinician if you notice any of
              the following — especially if it is new or persistent.
            </p>
            <ul className="mt-3 grid gap-x-6 gap-y-1.5 sm:grid-cols-2">
              {[
                'Bleeding through protection hourly',
                'Severe pain affecting daily life',
                'Periods consistently over 35 days apart',
                'Bleeding after menopause',
                'Symptoms that keep worsening',
              ].map((item) => (
                <li key={item} className="flex gap-2.5 text-sm text-ink">
                  <span className="mt-[9px] h-1 w-1 shrink-0 rounded-full bg-deep-rose" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
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
        <div className="border-t border-line bg-rose-mist/50 px-5 py-3 sm:px-6">
          <p className="text-xs leading-relaxed text-muted">
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
        <div key={item.label} className="rounded-lg border border-line p-2 text-center">
          <Icon className="mx-auto h-3.5 w-3.5 text-deep-rose" aria-hidden="true" />
          <p className="mt-1 text-xs font-semibold text-deep-rose">{item.value}</p>
          <p className="text-xs font-medium text-muted">{item.label}</p>
        </div>
      );
    })}
  </div>
);

export default AdultDashboard;
