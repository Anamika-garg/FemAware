import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  AlertCircle,
  ArrowRight,
  BarChart3,
  CalendarDays,
  ClipboardPlus,
  HeartPulse,
  LineChart as LineChartIcon,
  Moon,
  ShieldAlert,
  Sparkles,
  Thermometer,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useAuth } from '../../context/AuthContext';
import api, { getErrorMessage } from '../../lib/api';
import { formatDate, formatShortDate, todayISO } from '../../lib/dates';
import PageHeader from '../../components/ui/PageHeader';
import { CardSkeleton, EmptyState, ErrorState } from '../../components/ui/States';
import { cn } from '../../lib/utils';
import SeniorPageShell from './SeniorPageShell';
import {
  averageRating,
  countBleeding,
  daysAgoISO,
  getSymptomFrequency,
  hotFlashDays,
  lastNDays,
  previousNDays,
  shiftISO,
  sumHotFlashes,
} from './seniorUtils';

const RANGES = [
  { value: 30, label: '30 days' },
  { value: 60, label: '60 days' },
  { value: 90, label: '90 days' },
];

const LEVEL_DAYS = (logs, field) =>
  logs.filter((log) => log.senior?.[field] && log.senior[field] !== 'none').length;

const trendWord = (current, previous, unit = '') => {
  if (current === previous) return 'about the same as';
  if (current < previous) {
    return `down from ${previous}${unit} the previous period`;
  }
  return `up from ${previous}${unit} the previous period`;
};

const buildWeeklyHotFlashes = (logs, days) => {
  const today = todayISO();
  const weeks = Math.ceil(days / 7);
  const buckets = [];
  for (let index = weeks - 1; index >= 0; index -= 1) {
    const end = shiftISO(today, -index * 7);
    const start = shiftISO(today, -(index * 7 + 6));
    const bucketLogs = logs.filter((log) => log.date >= start && log.date <= end);
    buckets.push({
      label: formatShortDate(end),
      hotFlashes: sumHotFlashes(bucketLogs),
      days: bucketLogs.length,
    });
  }
  return buckets;
};

const SummaryCard = ({ icon: Icon, title, children, tone = 'rose' }) => (
  <div className="rounded-3xl border-2 border-white/90 bg-white/95 p-5 shadow-soft">
    <div className="flex items-center gap-3">
      <span
        className={cn(
          'grid h-11 w-11 shrink-0 place-items-center rounded-2xl',
          tone === 'deep' ? 'bg-deep-rose text-white' : 'bg-soft-petal text-deep-rose'
        )}
      >
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <h3 className="font-display text-lg font-semibold text-deep-rose">{title}</h3>
    </div>
    <div className="mt-3 text-sm leading-relaxed text-ink">{children}</div>
  </div>
);

const SeniorHealthInsights = () => {
  const { user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [range, setRange] = useState(30);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  const load = useCallback(async () => {
    if (!user?._id) return;
    setLoading(true);
    setError('');
    try {
      const response = await api.get(`/symptoms/${user._id}`, { params: { limit: 365 } });
      setLogs(response.data.logs || []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [user?._id]);

  useEffect(() => {
    load();
  }, [load, refreshKey]);

  const insight = useMemo(() => {
    const today = todayISO();
    const from = daysAgoISO(range - 1);
    const rangeLogs = logs
      .filter((log) => log.date >= from && log.date <= today)
      .sort((a, b) => a.date.localeCompare(b.date));
    const weekLogs = lastNDays(logs, 7);
    const priorWeekLogs = previousNDays(logs, 7);

    const frequency = getSymptomFrequency(rangeLogs);
    const weeks = buildWeeklyHotFlashes(rangeLogs, range);

    const weekHotFlashes = sumHotFlashes(weekLogs);
    const priorHotFlashes = sumHotFlashes(priorWeekLogs);
    const weekHotFlashDays = hotFlashDays(weekLogs);
    const priorHotFlashDays = hotFlashDays(priorWeekLogs);

    const weekSleep = averageRating(weekLogs, 'sleepQuality');
    const priorSleep = averageRating(priorWeekLogs, 'sleepQuality');
    const weekWellbeing = averageRating(weekLogs, 'emotionalWellbeing');
    const priorWellbeing = averageRating(priorWeekLogs, 'emotionalWellbeing');
    const weekJoints = LEVEL_DAYS(weekLogs, 'jointStiffness');
    const priorJoints = LEVEL_DAYS(priorWeekLogs, 'jointStiffness');
    const weekBladder = LEVEL_DAYS(weekLogs, 'bladderUrgency');
    const bleedingInRange = countBleeding(rangeLogs);
    const sleepRatings = rangeLogs.filter((log) => Number(log.senior?.sleepQuality) > 0).length;

    return {
      rangeLogs,
      frequency,
      weeks,
      weekHotFlashes,
      priorHotFlashes,
      weekHotFlashDays,
      priorHotFlashDays,
      weekSleep,
      priorSleep,
      weekWellbeing,
      priorWellbeing,
      weekJoints,
      priorJoints,
      weekBladder,
      bleedingInRange,
      sleepRatings,
      checkIns: rangeLogs.length,
    };
  }, [logs, range]);

  const hotFlashSentence = () => {
    if (!insight.weekHotFlashes && !insight.priorHotFlashes) {
      return 'No hot flashes were recorded this week or last week.';
    }
    if (!insight.weekHotFlashes) {
      return `No hot flashes recorded this week — down from ${insight.priorHotFlashes} last week.`;
    }
    if (insight.weekHotFlashes === insight.priorHotFlashes) {
      return `Hot flashes recorded ${insight.weekHotFlashes} time${
        insight.weekHotFlashes === 1 ? '' : 's'
      } this week, about the same as last week.`;
    }
    const direction = insight.weekHotFlashes < insight.priorHotFlashes ? 'down' : 'up';
    return `Hot flashes recorded ${insight.weekHotFlashes} time${
      insight.weekHotFlashes === 1 ? '' : 's'
    } this week — ${direction} from ${insight.priorHotFlashes} last week.`;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-16 rounded-2xl skeleton" />
        <div className="grid gap-4 md:grid-cols-2">
          {[0, 1, 2, 3].map((index) => (
            <CardSkeleton key={index} rows={3} />
          ))}
        </div>
        <CardSkeleton rows={8} />
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

  const hasData = insight.rangeLogs.length > 0;

  return (
    <SeniorPageShell>
      <PageHeader
        eyebrow="Health trends"
        title="Your patterns, explained simply"
        description="A calm view of what you have recorded. These are observations from your check-ins — not a diagnosis."
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div
          className="flex flex-wrap gap-2"
          role="group"
          aria-label="Choose a period to review"
        >
          {RANGES.map((option) => {
            const active = range === option.value;
            return (
              <button
                key={option.value}
                type="button"
                aria-pressed={active}
                onClick={() => setRange(option.value)}
                className={cn('senior-choice min-h-[48px] px-5 text-base', active && 'senior-choice-active')}
              >
                {option.label}
              </button>
            );
          })}
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/80 px-3 py-1.5 text-sm font-semibold text-muted">
          <CalendarDays className="h-4 w-4" aria-hidden="true" />
          {insight.checkIns} check-in{insight.checkIns === 1 ? '' : 's'} in this period
        </span>
      </div>

      {insight.bleedingInRange > 0 ? (
        <div className="flex flex-col gap-3 rounded-3xl border-2 border-[#E9B27A] bg-[#FFF7EC] p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <ShieldAlert className="mt-0.5 h-6 w-6 shrink-0 text-[#8A4510]" aria-hidden="true" />
            <div>
              <p className="text-base font-bold text-[#8A4510]">
                Vaginal bleeding after menopause was recorded {insight.bleedingInRange} time
                {insight.bleedingInRange === 1 ? '' : 's'} in this period.
              </p>
              <p className="mt-1 text-sm leading-relaxed text-[#8A4510]/90">
                Please arrange a prompt review with your clinician. This is a reason to check in,
                not a diagnosis.
              </p>
            </div>
          </div>
          <Link
            to="/doctor-report"
            className="senior-button shrink-0 border-2 border-[#8A4510]/30 bg-white text-[#8A4510] hover:bg-[#FFF0E0]"
          >
            Prepare for a visit
          </Link>
        </div>
      ) : null}

      <section aria-labelledby="insight-summary-title" className="space-y-3">
        <div>
          <p className="eyebrow">In plain language</p>
          <h2 id="insight-summary-title" className="section-title mt-1">
            What your check-ins suggest
          </h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <SummaryCard icon={Thermometer} title="Hot flashes" tone="deep">
            <p className="text-base leading-relaxed">{hotFlashSentence()}</p>
            <p className="mt-2 text-sm text-muted">
              Recorded on {insight.weekHotFlashDays} day
              {insight.weekHotFlashDays === 1 ? '' : 's'} this week
              {insight.priorHotFlashDays !== insight.weekHotFlashDays
                ? `, compared with ${insight.priorHotFlashDays} last week`
                : ''}
              .
            </p>
          </SummaryCard>

          <SummaryCard icon={Moon} title="Sleep">
            {insight.weekSleep !== null ? (
              <>
                <p className="text-base leading-relaxed">
                  Sleep quality averaged{' '}
                  <span className="font-bold text-deep-rose">{insight.weekSleep} out of 5</span>{' '}
                  this week
                  {insight.priorSleep !== null
                    ? `, ${trendWord(insight.weekSleep, insight.priorSleep)}.`
                    : '.'}
                </p>
                <p className="mt-2 text-sm text-muted">
                  Based on {insight.sleepRatings} sleep rating
                  {insight.sleepRatings === 1 ? '' : 's'} in the last {range} days.
                </p>
              </>
            ) : (
              <p className="text-base leading-relaxed">
                There are not enough sleep ratings yet. A quick rating each morning helps show the
                pattern.
              </p>
            )}
          </SummaryCard>

          <SummaryCard icon={Activity} title="Joints and mobility">
            <p className="text-base leading-relaxed">
              Joint stiffness appeared on{' '}
              <span className="font-bold text-deep-rose">{insight.weekJoints}</span> of your last 7
              check-ins
              {insight.weekJoints !== insight.priorJoints
                ? `, ${trendWord(insight.weekJoints, insight.priorJoints)}.`
                : ', about the same as last week.'}
            </p>
            <p className="mt-2 text-sm text-muted">
              Gentle movement, strength work and fall prevention all support bone and joint health.
            </p>
          </SummaryCard>

          <SummaryCard icon={HeartPulse} title="Mood and wellbeing">
            {insight.weekWellbeing !== null ? (
              <p className="text-base leading-relaxed">
                Emotional wellbeing averaged{' '}
                <span className="font-bold text-deep-rose">{insight.weekWellbeing} out of 5</span>{' '}
                this week
                {insight.priorWellbeing !== null
                  ? `, ${trendWord(insight.weekWellbeing, insight.priorWellbeing)}.`
                  : '.'}
              </p>
            ) : (
              <p className="text-base leading-relaxed">
                No wellbeing rating yet this week. Sharing how you feel is as useful as sharing
                physical symptoms.
              </p>
            )}
            <p className="mt-2 text-sm text-muted">
              Bladder urgency was noted on {insight.weekBladder} day
              {insight.weekBladder === 1 ? '' : 's'} this week.
            </p>
          </SummaryCard>
        </div>
      </section>

      {hasData ? (
        <div className="grid gap-4 xl:grid-cols-2">
          <section className="senior-card" aria-labelledby="frequency-chart-title">
            <div className="flex items-start gap-3">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-soft-petal text-deep-rose">
                <BarChart3 className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <h2 id="frequency-chart-title" className="font-display text-lg font-semibold text-deep-rose">
                  How often each symptom appeared
                </h2>
                <p className="mt-0.5 text-sm text-muted">
                  Number of check-ins where you noted each symptom in the last {range} days.
                </p>
              </div>
            </div>

            {insight.frequency.length ? (
              <div className="mt-5 h-[320px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={insight.frequency.slice(0, 7)}
                    layout="vertical"
                    margin={{ top: 4, right: 21, bottom: 4, left: 4 }}
                  >
                    <CartesianGrid stroke="#FFD6E7" strokeDasharray="4 4" horizontal={false} />
                    <XAxis
                      type="number"
                      allowDecimals={false}
                      tick={{ fill: '#8a5a6b', fontSize: 12 }}
                      axisLine={{ stroke: '#F8BBD0' }}
                      tickLine={false}
                    />
                    <YAxis
                      type="category"
                      dataKey="name"
                      width={116}
                      tick={{ fill: '#C2185B', fontSize: 12, fontWeight: 600 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: 14,
                        border: '2px solid #F8BBD0',
                        background: '#FFF1F6',
                        color: '#C2185B',
                        fontSize: 13,
                      }}
                      formatter={(value) => [`${value} check-in${value === 1 ? '' : 's'}`, 'Recorded']}
                    />
                    <Bar dataKey="count" fill="#E0487E" radius={[0, 8, 8, 0]} barSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="mt-5 rounded-2xl bg-rose-mist/70 p-4 text-sm text-muted">
                No specific symptoms were recorded in this period. That is a valid result — your
                notes will build a picture over time.
              </p>
            )}
          </section>

          <section className="senior-card" aria-labelledby="hotflash-chart-title">
            <div className="flex items-start gap-3">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-soft-petal text-deep-rose">
                <LineChartIcon className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <h2 id="hotflash-chart-title" className="font-display text-lg font-semibold text-deep-rose">
                  Hot flashes week by week
                </h2>
                <p className="mt-0.5 text-sm text-muted">
                  Total hot flashes recorded in each seven-day period.
                </p>
              </div>
            </div>

            <div className="mt-5 h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={insight.weeks} margin={{ top: 8, right: 16, bottom: 4, left: 0 }}>
                  <CartesianGrid stroke="#FFD6E7" strokeDasharray="4 4" vertical={false} />
                  <XAxis
                    dataKey="label"
                    tick={{ fill: '#8a5a6b', fontSize: 11 }}
                    axisLine={{ stroke: '#F8BBD0' }}
                    tickLine={false}
                    minTickGap={12}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fill: '#8a5a6b', fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                    width={32}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 14,
                      border: '2px solid #F8BBD0',
                      background: '#FFF1F6',
                      color: '#C2185B',
                      fontSize: 13,
                    }}
                    formatter={(value, name) => [
                      name === 'hotFlashes' ? `${value} hot flashes` : value,
                      'Recorded',
                    ]}
                    labelFormatter={(label) => `Week ending ${label}`}
                  />
                  <Line
                    type="monotone"
                    dataKey="hotFlashes"
                    stroke="#C2185B"
                    strokeWidth={3}
                    dot={{ r: 4, fill: '#C2185B', strokeWidth: 0 }}
                    activeDot={{ r: 6, fill: '#E0487E', strokeWidth: 0 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              Fewer hot flashes over time can reflect treatment, lifestyle changes or natural
              variation. Bring this chart to your clinician if you would like to discuss options.
            </p>
          </section>
        </div>
      ) : (
        <EmptyState
          icon={Sparkles}
          title={`No check-ins in the last ${range} days`}
          description="Once you save a few daily check-ins, your trends will appear here. You can also choose a shorter period above."
          action={
            <Link to="/symptoms" className="senior-button bg-deep-rose text-white hover:bg-[#a81450]">
              <ClipboardPlus className="h-5 w-5" aria-hidden="true" />
              Start a check-in
            </Link>
          }
          className="border-2"
        />
      )}

      <section className="flex flex-col gap-4 rounded-3xl border-2 border-blush-pink/70 bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-deep-rose" aria-hidden="true" />
          <p className="text-sm leading-relaxed text-muted">
            Trends are easier to discuss than single days. If something is worsening, new or
            worrying, contact your clinician rather than waiting for more data.
          </p>
        </div>
        <Link
          to="/doctor-report"
          className="senior-button shrink-0 border-2 border-blush-pink bg-white text-deep-rose hover:bg-soft-petal"
        >
          Prepare a visit summary
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </section>

      {insight.rangeLogs.length ? (
        <p className="text-center text-sm text-muted">
          Reviewing {formatDate(insight.rangeLogs[0].date, 'd MMM')} to{' '}
          {formatDate(insight.rangeLogs[insight.rangeLogs.length - 1].date, 'd MMM yyyy')}.
        </p>
      ) : null}
    </SeniorPageShell>
  );
};

export default SeniorHealthInsights;
