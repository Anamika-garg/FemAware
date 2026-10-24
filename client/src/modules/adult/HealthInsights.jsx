import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { addMonths } from 'date-fns';
import {
  Activity,
  AlertCircle,
  ArrowRight,
  BarChart3,
  CalendarDays,
  Droplets,
  Info,
  LineChart,
  NotebookPen,
  Sparkles,
  Sun,
  TrendingUp,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api, { getErrorMessage } from '../../lib/api';
import { formatDate, toISODate, todayISO } from '../../lib/dates';
import PageHeader from '../../components/ui/PageHeader';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { CardSkeleton, EmptyState, ErrorState } from '../../components/ui/States';
import { cn } from '../../lib/utils';

const RANGES = [
  { value: '6', label: '6 months' },
  { value: '12', label: '12 months' },
];

const FLOW_COLORS = {
  heavy: '#C2185B',
  medium: '#F672A7',
  light: '#F8BBD0',
  spotting: '#FFD6E7',
};

const CustomTooltip = ({ active, payload, label, suffix = '' }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-blush-pink bg-white px-3 py-2 shadow-card">
      <p className="text-[10px] font-bold uppercase tracking-wide text-muted">{label}</p>
      {payload.map((item) => (
        <p key={item.dataKey} className="mt-0.5 text-sm font-bold text-deep-rose">
          {item.name}: {item.value}
          {suffix}
        </p>
      ))}
    </div>
  );
};

const InsightCard = ({ icon: Icon, title, children, tone = 'rose' }) => (
  <div
    className={cn(
      'rounded-2xl border p-4',
      tone === 'deep'
        ? 'border-deep-rose/20 bg-deep-rose text-white'
        : 'border-blush-pink/60 bg-white text-ink'
    )}
  >
    <span
      className={cn(
        'grid h-8 w-8 place-items-center rounded-lg',
        tone === 'deep' ? 'bg-white/15 text-white' : 'bg-soft-petal text-deep-rose'
      )}
    >
      <Icon className="h-4 w-4" aria-hidden="true" />
    </span>
    <p
      className={cn(
        'mt-3 text-[9px] font-bold uppercase tracking-[0.14em]',
        tone === 'deep' ? 'text-blush-pink' : 'text-muted'
      )}
    >
      {title}
    </p>
    <div className={cn('mt-1 text-sm leading-relaxed', tone === 'deep' ? 'text-white/90' : 'text-ink')}>
      {children}
    </div>
  </div>
);

const HealthInsights = () => {
  const { user } = useAuth();
  const [range, setRange] = useState('6');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    const from = toISODate(addMonths(new Date(), -Number(range)));
    try {
      const [cycleRes, symptomRes] = await Promise.all([
        api.get(`/cycles/${user._id}`),
        api.get(`/symptoms/${user._id}/summary`, { params: { from, to: todayISO() } }),
      ]);
      setData({
        stats: cycleRes.data.stats,
        series: cycleRes.data.series,
        summary: symptomRes.data,
        from,
        to: todayISO(),
      });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [user._id, range]);

  useEffect(() => {
    load();
  }, [load, refreshKey]);

  const stats = data?.stats;
  const summary = data?.summary;

  const cycleChart = useMemo(() => {
    if (!stats?.history) return [];
    return stats.history
      .filter((cycle) => cycle.cycleLength && cycle.startDate >= (data?.from || ''))
      .map((cycle) => ({
        label: formatDate(cycle.startDate, range === '12' ? "MMM ''yy" : 'MMM'),
        fullDate: formatDate(cycle.startDate, 'MMMM yyyy'),
        cycleLength: cycle.cycleLength,
        periodLength: cycle.periodLength,
        flow: cycle.flow,
      }))
      .slice(-Number(range));
  }, [stats, data?.from, range]);

  const symptomChart = useMemo(
    () =>
      (summary?.topPhysical || []).map((item) => ({
        ...item,
        fill: item.count >= 4 ? '#C2185B' : item.count >= 2 ? '#F672A7' : '#F8BBD0',
      })),
    [summary]
  );

  const flowChart = useMemo(
    () =>
      (summary?.flowDistribution || []).map((item) => ({
        ...item,
        fill: FLOW_COLORS[item.name] || '#F8BBD0',
      })),
    [summary]
  );

  const avgEnergy = useMemo(() => {
    const days = summary?.daily || [];
    if (!days.length) return null;
    const totalEnergy = days.reduce((sum, day) => sum + (day.energyLevel || 0), 0);
    return Math.round((totalEnergy / days.length) * 10) / 10;
  }, [summary]);

  const trend = useMemo(() => {
    const lengths = (stats?.history || []).map((cycle) => cycle.cycleLength).filter(Boolean);
    if (lengths.length < 4) return null;
    const half = Math.floor(lengths.length / 2);
    const firstAvg = lengths.slice(0, half).reduce((sum, value) => sum + value, 0) / half;
    const secondAvg =
      lengths.slice(half).reduce((sum, value) => sum + value, 0) / (lengths.length - half);
    const difference = Math.round((secondAvg - firstAvg) * 10) / 10;
    return {
      difference,
      direction: difference > 1 ? 'longer' : difference < -1 ? 'shorter' : 'steady',
    };
  }, [stats]);

  const topSymptom = symptomChart[0];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-20 w-full skeleton" />
        <div className="grid gap-4 sm:grid-cols-3">
          {[0, 1, 2].map((index) => (
            <CardSkeleton key={index} rows={2} />
          ))}
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <CardSkeleton rows={6} />
          <CardSkeleton rows={6} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader
          eyebrow="Patterns over time"
          title="Your health insights"
          description="See how your cycle and symptoms change over time."
        />
        <ErrorState message={error} onRetry={() => setRefreshKey((key) => key + 1)} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Patterns over time"
        title="See the bigger picture."
        description="Charts make trends easier to spot — and easier to explain. Compare your cycle lengths, symptom frequency and flow across time."
        actions={
          <>
            <div className="flex rounded-xl border border-blush-pink/70 bg-white p-1">
              {RANGES.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setRange(item.value)}
                  aria-pressed={range === item.value}
                  className={cn(
                    'rounded-lg px-3 py-1.5 text-[11px] font-bold transition-colors',
                    range === item.value
                      ? 'bg-pink-glow text-white shadow-sm'
                      : 'text-muted hover:text-deep-rose'
                  )}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <Link to="/doctor-report" className="btn-secondary btn-sm">
              Doctor report
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </>
        }
      />

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Insight summary">
        {[
          {
            label: 'Average cycle',
            value: stats?.hasData ? `${stats.averageCycleLength} days` : '—',
            helper: stats?.hasData ? `Across ${stats.cycleCount} logged cycles` : 'Log periods to calculate',
            icon: CalendarDays,
          },
          {
            label: 'Cycle variation',
            value: stats?.hasData ? `±${stats.variation} days` : '—',
            helper: stats?.regularity || 'Awaiting more data',
            icon: Activity,
          },
          {
            label: 'Most logged symptom',
            value: topSymptom ? topSymptom.name : 'None yet',
            helper: topSymptom ? `${topSymptom.count} entries in this range` : 'Start a symptom journal',
            icon: NotebookPen,
          },
          {
            label: 'Average energy',
            value: avgEnergy ? `${avgEnergy}/5` : '—',
            helper: `${summary?.totalLogs || 0} check-ins in range`,
            icon: Sun,
          },
        ].map((metric) => {
          const Icon = metric.icon;
          return (
            <div key={metric.label} className="rounded-2xl border border-white/70 bg-soft-petal/45 p-4 shadow-soft">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-bold uppercase tracking-[0.13em] text-deep-rose/60">
                  {metric.label}
                </span>
                <Icon className="h-4 w-4 text-pink-glow" aria-hidden="true" />
              </div>
              <p className="mt-2 truncate font-display text-xl font-semibold capitalize text-deep-rose">
                {metric.value}
              </p>
              <p className="mt-0.5 text-[10px] capitalize text-muted">{metric.helper}</p>
            </div>
          );
        })}
      </section>

      <div className="grid gap-4 xl:grid-cols-[1.6fr_1fr]">
        <section className="card p-5 sm:p-6" aria-labelledby="cycle-chart-title">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="eyebrow">Cycle duration</p>
              <h2 id="cycle-chart-title" className="section-title mt-1">
                Your cycle length, month by month
              </h2>
              <p className="mt-1 text-[11px] text-muted">
                A healthy cycle is often 21–35 days, but your personal pattern matters most.
              </p>
            </div>
            {stats?.hasData ? (
              <Badge tone="pink" icon={TrendingUp}>
                Avg {stats.averageCycleLength}d
              </Badge>
            ) : null}
          </div>

          {cycleChart.length ? (
            <>
              <div className="mt-5 h-[280px] w-full" role="img" aria-label="Bar chart of cycle lengths by month">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={cycleChart} margin={{ top: 18, right: 8, left: -24, bottom: 0 }}>
                    <CartesianGrid vertical={false} stroke="#FFD6E7" strokeDasharray="4 4" />
                    <XAxis
                      dataKey="label"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10, fill: '#7C5B6A', fontWeight: 600 }}
                      dy={8}
                    />
                    <YAxis
                      domain={[15, 'dataMax + 5']}
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10, fill: '#7C5B6A' }}
                      width={44}
                    />
                    <Tooltip
                      cursor={{ fill: '#FFF1F6' }}
                      content={<CustomTooltip suffix=" days" />}
                      labelFormatter={(label) => label}
                    />
                    <ReferenceLine
                      y={stats.averageCycleLength}
                      stroke="#C2185B"
                      strokeDasharray="5 4"
                      strokeWidth={1.5}
                      label={{
                        value: 'Your average',
                        position: 'insideTopRight',
                        fill: '#C2185B',
                        fontSize: 9,
                        fontWeight: 700,
                      }}
                    />
                    <Bar dataKey="cycleLength" name="Cycle" radius={[8, 8, 3, 3]} maxBarSize={34}>
                      {cycleChart.map((entry, index) => {
                        const deviation = Math.abs(entry.cycleLength - stats.averageCycleLength);
                        return (
                          <Cell
                            key={`${entry.fullDate}-${index}`}
                            fill={deviation > 4 ? '#C2185B' : deviation > 2 ? '#F672A7' : '#F8BBD0'}
                          />
                        );
                      })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-4">
                <span className="flex items-center gap-1.5 text-[10px] font-medium text-muted">
                  <span className="h-2.5 w-2.5 rounded-sm bg-blush-pink" /> Close to average
                </span>
                <span className="flex items-center gap-1.5 text-[10px] font-medium text-muted">
                  <span className="h-2.5 w-2.5 rounded-sm bg-pink-glow" /> 3–4 days different
                </span>
                <span className="flex items-center gap-1.5 text-[10px] font-medium text-muted">
                  <span className="h-2.5 w-2.5 rounded-sm bg-deep-rose" /> 5+ days different
                </span>
              </div>
            </>
          ) : (
            <EmptyState
              icon={BarChart3}
              title="Not enough cycle data yet"
              description="At least two logged periods are needed to calculate cycle lengths."
              action={
                <Link to="/cycle" className="btn-primary btn-sm">
                  Log a period
                </Link>
              }
              className="mt-5 border-none bg-rose-mist/50"
            />
          )}
        </section>

        <section className="card p-5 sm:p-6" aria-labelledby="flow-chart-title">
          <div>
            <p className="eyebrow">Flow mix</p>
            <h2 id="flow-chart-title" className="section-title mt-1">
              How your flow showed up
            </h2>
          </div>
          {flowChart.length ? (
            <>
              <div className="mt-2 h-[210px] w-full" role="img" aria-label="Donut chart of flow intensity distribution">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={flowChart}
                      dataKey="count"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={58}
                      outerRadius={84}
                      paddingAngle={3}
                      stroke="none"
                    >
                      {flowChart.map((entry) => (
                        <Cell key={entry.name} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <ul className="mt-1 space-y-2">
                {flowChart.map((item) => (
                  <li key={item.name} className="flex items-center justify-between gap-2">
                    <span className="flex items-center gap-2 text-xs font-medium capitalize text-ink">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.fill }} />
                      {item.name}
                    </span>
                    <span className="text-[10px] font-bold text-deep-rose">{item.count} logged</span>
                  </li>
                ))}
              </ul>
              <p className="mt-4 flex items-start gap-1.5 rounded-lg bg-rose-mist/70 p-2.5 text-[9px] leading-relaxed text-muted">
                <Info className="mt-0.5 h-3 w-3 shrink-0" aria-hidden="true" />
                Flow is self-reported. Consistently soaking through protection hourly is worth a
                clinician conversation.
              </p>
            </>
          ) : (
            <EmptyState
              icon={Droplets}
              title="No flow logged yet"
              description="Flow is captured when you add period dates and in your daily journal."
              className="mt-5 border-none bg-rose-mist/50"
            />
          )}
        </section>
      </div>

      <section className="card p-5 sm:p-6" aria-labelledby="symptom-chart-title">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="eyebrow">Symptom frequency</p>
            <h2 id="symptom-chart-title" className="section-title mt-1">
              What shows up most often
            </h2>
            <p className="mt-1 text-[11px] text-muted">
              Counted from {summary?.totalLogs || 0} journal entries in this period.
            </p>
          </div>
          <Link
            to="/symptoms"
            className="flex items-center gap-1 text-xs font-bold text-deep-rose hover:text-rose-pink"
          >
            Open journal
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </div>

        {symptomChart.length ? (
          <div className="mt-5 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
            <div
              style={{ height: Math.max(240, symptomChart.length * 42) }}
              className="w-full"
              role="img"
              aria-label="Horizontal bar chart of most frequent physical symptoms"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={symptomChart}
                  layout="vertical"
                  margin={{ top: 0, right: 30, left: 6, bottom: 0 }}
                  barCategoryGap="28%"
                >
                  <CartesianGrid horizontal={false} stroke="#FFD6E7" strokeDasharray="4 4" />
                  <XAxis type="number" hide />
                  <YAxis
                    type="category"
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    width={96}
                    tick={{ fontSize: 10, fill: '#3B2430', fontWeight: 600 }}
                  />
                  <Tooltip cursor={{ fill: '#FFF1F6' }} content={<CustomTooltip suffix=" entries" />} />
                  <Bar dataKey="count" name="Logged" radius={[0, 8, 8, 0]} maxBarSize={20}>
                    {symptomChart.map((entry) => (
                      <Cell key={entry.name} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-3">
              <InsightCard icon={Sparkles} title="What this can tell you" tone="deep">
                {topSymptom
                  ? `${topSymptom.name} appeared in ${topSymptom.count} of your ${summary.totalLogs} check-ins. Look at where it falls in your cycle — symptoms clustered around the luteal phase often follow a different pattern than all-month symptoms.`
                  : 'Keep logging to reveal your most frequent symptoms.'}
              </InsightCard>
              <div className="rounded-2xl bg-rose-mist/70 p-4">
                <p className="text-[9px] font-bold uppercase tracking-wide text-muted">Mood snapshot</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {(summary?.topMood || []).length ? (
                    summary.topMood.map((mood) => (
                      <span
                        key={mood.name}
                        className="rounded-full border border-blush-pink/70 bg-white px-2 py-1 text-[10px] font-semibold text-deep-rose"
                      >
                        {mood.name} · {mood.count}
                      </span>
                    ))
                  ) : (
                    <span className="text-[10px] text-muted">No moods logged in this range.</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <EmptyState
            icon={NotebookPen}
            title="No symptoms logged in this range"
            description="Even a brief daily note builds a useful frequency picture."
            action={
              <Link to="/symptoms" className="btn-primary btn-sm">
                Log today
              </Link>
            }
            className="mt-5 border-none bg-rose-mist/50"
          />
        )}
      </section>

      <section aria-labelledby="patterns-title">
        <div className="mb-3">
          <p className="eyebrow">Worth noticing</p>
          <h2 id="patterns-title" className="section-title mt-1">
            Gentle patterns in your data
          </h2>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          <InsightCard icon={LineChart} title="Cycle trend">
            {trend
              ? trend.direction === 'steady'
                ? 'Your recent cycle lengths look steady compared with earlier months. Consistency can make predictions more reliable.'
                : `Your recent cycles are about ${Math.abs(trend.difference)} days ${trend.direction} than earlier ones. One shift is common; a persistent change is worth mentioning to a clinician.`
              : 'Log a few more cycles and we will show whether your cycle length is shifting over time.'}
          </InsightCard>
          <InsightCard icon={Activity} title="Variability">
            {stats?.hasData
              ? `Your cycle lengths vary by about ${stats.variation} days. ${
                  stats.variation <= 2
                    ? 'That is a very consistent pattern.'
                    : stats.variation <= 5
                      ? 'Some variation is common and often linked to stress, sleep or travel.'
                      : 'A variation above 5 days is worth tracking carefully and discussing if it persists.'
                }`
              : 'We need at least two cycle lengths to measure variation.'}
          </InsightCard>
          <InsightCard icon={Sun} title="Energy & mood">
            {summary?.totalLogs
              ? `Your average energy is ${avgEnergy}/5 across ${summary.totalLogs} check-ins. ${
                  summary.topMood?.[0]
                    ? `"${summary.topMood[0].name}" is your most logged mood.`
                    : ''
                } Compare this with your cycle phases in the journal for more context.`
              : 'Energy and mood patterns appear after a few journal entries.'}
          </InsightCard>
        </div>
      </section>

      <div className="flex items-start gap-2 rounded-2xl border border-blush-pink/60 bg-white/75 p-4">
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-deep-rose" aria-hidden="true" />
        <p className="text-[10px] leading-relaxed text-muted">
          These insights are generated from self-reported logs and are educational only. They cannot
          diagnose a condition. If a pattern worries you — especially very heavy bleeding, severe
          pain, cycles under 21 or over 35 days, or bleeding after menopause — please speak with a
          qualified clinician.
        </p>
      </div>
    </div>
  );
};

export default HealthInsights;
