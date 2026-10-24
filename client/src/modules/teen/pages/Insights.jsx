import { useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ReferenceArea,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { AlertTriangle, BarChart3, CheckCircle2, Download, Info } from 'lucide-react';
import { api } from '../lib/api';
import { useAsync } from '../lib/useAsync';
import { formatDay } from '../lib/dates';
import { humanize, SYMPTOM_LABELS } from '../lib/labels';
import { colors } from '../theme/tokens';
import { Button, Card, EmptyState, ErrorMessage, Loading, PageHeader } from '../components/ui';

const axisProps = {
  stroke: colors.blush,
  tick: { fill: colors.deep, fontSize: 12, fontWeight: 600 },
  tickLine: false,
};

function ChartTooltip({ active, payload, label, format }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-blush bg-white px-3 py-2 text-sm font-bold text-deep shadow-soft">
      <p className="text-xs text-rose">{label}</p>
      <p>{format(payload[0].value)}</p>
    </div>
  );
}

/** Accessible table alternative for each chart. */
function DataTable({ caption, columns, rows }) {
  return (
    <details className="mt-3 text-sm">
      <summary className="cursor-pointer font-bold">Show as table</summary>
      <table className="mt-2 w-full text-left">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr className="border-b border-petal">
            {columns.map((c) => (
              <th key={c} scope="col" className="py-1 font-black">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.join('|')} className="border-b border-mist">
              {r.map((cell, i) => (
                <td key={i} className="py-1">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </details>
  );
}

/** The summary is behind sign-in, so it is fetched with the token, not linked. */
function SummaryButton() {
  const [state, setState] = useState({ busy: false, error: null });
  const download = async () => {
    setState({ busy: true, error: null });
    try {
      await api.insights.downloadSummary();
      setState({ busy: false, error: null });
    } catch (error) {
      setState({ busy: false, error });
    }
  };
  return (
    <div className="flex flex-col items-end gap-2">
      <Button onClick={download} disabled={state.busy}>
        <Download aria-hidden className="size-4" /> {state.busy ? 'Preparing…' : 'Download summary'}
      </Button>
      {state.error && <p role="alert" className="text-sm font-semibold">{state.error.message}</p>}
    </div>
  );
}

export default function TeenInsights() {
  const { data, error, loading, reload } = useAsync(() => api.insights.get());

  if (loading) return <Loading label="Crunching your numbers…" />;
  if (error) return <ErrorMessage error={error} onRetry={reload} />;

  const { cycle, symptoms, flags } = data.insights;
  const cycleData = cycle.history.map((h) => ({ label: formatDay(h.startDate), value: h.cycleLength }));
  const symptomData = symptoms.frequency.map((f) => ({ label: SYMPTOM_LABELS[f.symptom] || humanize(f.symptom), value: f.count }));
  const severityData = symptoms.severityTrend.map((s) => ({
    label: formatDay(`${s.month}-01`, { month: 'short', year: '2-digit' }),
    value: s.averageSeverity,
  }));

  return (
    <div>
      <PageHeader icon={BarChart3} title="Health insights" subtitle="Patterns from your calendar and symptom diary, in plain language.">
        <SummaryButton />
      </PageHeader>

      <dl className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Tile label="Average cycle" value={cycle.averageCycleLength ? `${cycle.averageCycleLength} days` : '—'} hint={cycle.shortestCycle ? `Range ${cycle.shortestCycle}–${cycle.longestCycle} days` : 'Log 2+ periods'} />
        <Tile label="Average period" value={cycle.averagePeriodLength ? `${cycle.averagePeriodLength} days` : '—'} hint="Typical: up to 7 days" />
        <Tile label="Regularity" value={humanize(cycle.regularity)} hint={cycle.variation !== null ? `Varies by ${cycle.variation} days` : 'Needs 3+ periods'} />
        <Tile label="Next period (est.)" value={cycle.predictedNextStart ? formatDay(cycle.predictedNextStart) : '—'} hint="Estimates can be off by days" />
      </dl>

      <Card className="mb-6">
        <h2 className="flex items-center gap-2 text-xl font-black">
          <AlertTriangle aria-hidden className="size-5" /> Things to talk to a doctor about
        </h2>
        {flags.length === 0 ? (
          <p className="mt-3 flex items-center gap-2">
            <CheckCircle2 aria-hidden className="size-5 shrink-0" /> Nothing stands out in what you’ve logged so far. Keep tracking!
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
            {flags.map((f) => (
              <li key={f.code} className="flex items-start gap-2 rounded-2xl bg-petal p-3 font-semibold">
                <Info aria-hidden className="mt-0.5 size-4 shrink-0" />
                {f.message}
              </li>
            ))}
          </ul>
        )}
        <p className="mt-4 text-xs text-deep/70">
          These are observations, not a diagnosis. Download your summary to share with a doctor or nurse.
        </p>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="lg:col-span-2">
          <h2 className="text-xl font-black">Cycle length (days)</h2>
          <p className="text-sm text-deep/80">Shaded band: the typical teen range of 21–45 days.</p>
          {cycleData.length === 0 ? (
            <div className="mt-4">
              <EmptyState title="Log at least two periods to see cycle lengths" />
            </div>
          ) : (
            <>
              <div className="mt-4 h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={cycleData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }} barCategoryGap="30%">
                    <CartesianGrid vertical={false} stroke={colors.petal} />
                    <ReferenceArea y1={21} y2={45} fill={colors.petal} fillOpacity={0.6} ifOverflow="extendDomain" />
                    <XAxis dataKey="label" {...axisProps} />
                    <YAxis {...axisProps} axisLine={false} allowDecimals={false} domain={[0, (max) => Math.max(50, max + 5)]} />
                    <Tooltip cursor={{ fill: colors.mist }} content={<ChartTooltip format={(v) => `${v}-day cycle`} />} />
                    <Bar dataKey="value" name="Cycle length" fill={colors.deep} radius={[4, 4, 0, 0]} maxBarSize={36} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <DataTable caption="Cycle lengths" columns={['Period started', 'Cycle length (days)']} rows={cycleData.map((d) => [d.label, d.value])} />
            </>
          )}
        </Card>

        <Card>
          <h2 className="text-xl font-black">Most logged symptoms</h2>
          {symptomData.length === 0 ? (
            <div className="mt-4">
              <EmptyState title="No symptoms logged yet" />
            </div>
          ) : (
            <>
              <div className="mt-4" style={{ height: Math.max(160, symptomData.length * 36) }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={symptomData} layout="vertical" margin={{ top: 0, right: 16, left: 8, bottom: 0 }} barCategoryGap="25%">
                    <CartesianGrid horizontal={false} stroke={colors.petal} />
                    <XAxis type="number" {...axisProps} allowDecimals={false} />
                    <YAxis type="category" dataKey="label" {...axisProps} axisLine={false} width={100} />
                    <Tooltip cursor={{ fill: colors.mist }} content={<ChartTooltip format={(v) => `Logged ${v} time${v === 1 ? '' : 's'}`} />} />
                    <Bar dataKey="value" name="Times logged" fill={colors.deep} radius={[0, 4, 4, 0]} maxBarSize={22} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <DataTable caption="Symptom frequency" columns={['Symptom', 'Times logged']} rows={symptomData.map((d) => [d.label, d.value])} />
            </>
          )}
        </Card>

        <Card>
          <h2 className="text-xl font-black">Average severity by month (1–5)</h2>
          {severityData.length === 0 ? (
            <div className="mt-4">
              <EmptyState title="No symptoms logged yet" />
            </div>
          ) : (
            <>
              <div className="mt-4 h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={severityData} margin={{ top: 8, right: 16, left: -24, bottom: 0 }}>
                    <CartesianGrid vertical={false} stroke={colors.petal} />
                    <XAxis dataKey="label" {...axisProps} />
                    <YAxis {...axisProps} axisLine={false} domain={[0, 5]} ticks={[1, 2, 3, 4, 5]} />
                    <Tooltip cursor={{ stroke: colors.blush, strokeWidth: 1 }} content={<ChartTooltip format={(v) => `Average severity ${v}/5`} />} />
                    <Line type="monotone" dataKey="value" name="Average severity" stroke={colors.deep} strokeWidth={2} dot={{ r: 4, fill: colors.deep, stroke: colors.white, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <DataTable caption="Average severity by month" columns={['Month', 'Average severity']} rows={severityData.map((d) => [d.label, d.value])} />
            </>
          )}
        </Card>
      </div>
    </div>
  );
}

function Tile({ label, value, hint }) {
  return (
    <div className="card p-5">
      <dt className="text-xs font-black uppercase tracking-wide text-rose">{label}</dt>
      <dd className="mt-1 text-2xl font-black capitalize">{value}</dd>
      <dd className="text-xs font-semibold text-deep/70">{hint}</dd>
    </div>
  );
}
