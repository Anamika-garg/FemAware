import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  ArrowRight,
  BookOpen,
  CalendarCheck2,
  ChevronRight,
  ClipboardPlus,
  FileText,
  HeartPulse,
  LineChart,
  Lock,
  Moon,
  ShieldAlert,
  Sparkles,
  Stethoscope,
  Sun,
  Thermometer,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api, { getErrorMessage } from '../../lib/api';
import { formatDate, formatLongDate, relativeDay, todayISO } from '../../lib/dates';
import { CardSkeleton, ErrorState } from '../../components/ui/States';
import { cn } from '../../lib/utils';
import SeniorPageShell from './SeniorPageShell';
import {
  averageRating,
  countBleeding,
  hotFlashDays,
  lastNDays,
  previousNDays,
  sumHotFlashes,
} from './seniorUtils';

const greetingForHour = (hour) => {
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
};

const Metric = ({ icon: Icon, label, value, helper, tone = 'rose' }) => (
  <div className="rounded-3xl border-2 border-white/90 bg-white/95 p-4 shadow-soft sm:p-5">
    <span
      className={cn(
        'grid h-11 w-11 place-items-center rounded-2xl',
        tone === 'deep' && 'bg-deep-rose text-white',
        tone === 'glow' && 'bg-pink-glow text-white',
        tone === 'soft' && 'bg-soft-petal text-deep-rose',
        tone === 'rose' && 'bg-blush-pink/70 text-deep-rose'
      )}
    >
      <Icon className="h-5 w-5" aria-hidden="true" />
    </span>
    <p className="mt-4 text-[11px] font-bold uppercase tracking-[0.14em] text-deep-rose/60">
      {label}
    </p>
    <p className="mt-1 font-display text-xl font-semibold leading-tight text-deep-rose">{value}</p>
    <p className="mt-1.5 text-sm leading-relaxed text-muted">{helper}</p>
  </div>
);

const QuickAction = ({ to, icon: Icon, title, description, primary = false }) => (
  <Link
    to={to}
    className={cn(
      'group flex min-h-[112px] items-center gap-4 rounded-3xl border-2 p-5 transition-all hover:-translate-y-0.5 hover:shadow-card',
      primary
        ? 'border-deep-rose bg-deep-rose text-white shadow-card hover:bg-[#a81450]'
        : 'border-blush-pink bg-white text-deep-rose hover:border-pink-glow'
    )}
  >
    <span
      className={cn(
        'grid h-14 w-14 shrink-0 place-items-center rounded-2xl',
        primary ? 'bg-white/15 text-white' : 'bg-soft-petal text-deep-rose'
      )}
    >
      <Icon className="h-6 w-6" aria-hidden="true" />
    </span>
    <span className="min-w-0 flex-1">
      <span className="block text-lg font-bold leading-snug">{title}</span>
      <span
        className={cn(
          'mt-1 block text-sm leading-relaxed',
          primary ? 'text-white/80' : 'text-muted'
        )}
      >
        {description}
      </span>
    </span>
    <ArrowRight
      className={cn(
        'h-5 w-5 shrink-0 transition-transform group-hover:translate-x-1',
        primary ? 'text-white' : 'text-pink-glow'
      )}
      aria-hidden="true"
    />
  </Link>
);

const SeniorDashboard = () => {
  const { user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  const load = useCallback(async () => {
    if (!user?._id) return;
    setLoading(true);
    setError('');
    try {
      const response = await api.get(`/symptoms/${user._id}`, { params: { limit: 120 } });
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

  const summary = useMemo(() => {
    const today = todayISO();
    const weekLogs = lastNDays(logs, 7);
    const priorWeekLogs = previousNDays(logs, 7);
    const monthLogs = lastNDays(logs, 30);

    const latest = logs.find((log) => log.date === today) || logs[0] || null;
    const weekHotFlashDays = hotFlashDays(weekLogs);
    const priorHotFlashDays = hotFlashDays(priorWeekLogs);
    const weekHotFlashes = sumHotFlashes(weekLogs);
    const priorHotFlashes = sumHotFlashes(priorWeekLogs);
    const sleepAverage = averageRating(weekLogs, 'sleepQuality');
    const wellbeingAverage = averageRating(weekLogs, 'emotionalWellbeing');
    const jointDays = weekLogs.filter(
      (log) => log.senior?.jointStiffness && log.senior.jointStiffness !== 'none'
    ).length;
    const bleedingThisMonth = countBleeding(monthLogs);

    return {
      today,
      latest,
      weekHotFlashDays,
      priorHotFlashDays,
      weekHotFlashes,
      priorHotFlashes,
      sleepAverage,
      wellbeingAverage,
      jointDays,
      bleedingThisMonth,
      weekCheckIns: weekLogs.length,
    };
  }, [logs]);

  const firstName = user?.name?.split(' ')[0] || 'there';
  const latest = summary.latest;
  const loggedToday = latest?.date === summary.today;

  const hotFlashHelper =
    summary.priorHotFlashDays === summary.weekHotFlashDays
      ? 'About the same as last week'
      : summary.weekHotFlashDays < summary.priorHotFlashDays
        ? `Down from ${summary.priorHotFlashDays} days last week`
        : `Up from ${summary.priorHotFlashDays} days last week`;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-16 rounded-2xl skeleton" />
        <div className="h-60 rounded-3xl skeleton" />
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
      <SeniorPageShell>
        <ErrorState message={error} onRetry={() => setRefreshKey((key) => key + 1)} />
      </SeniorPageShell>
    );
  }

  return (
    <SeniorPageShell>
      {/* Warm greeting */}
      <section className="relative overflow-hidden rounded-3xl border-2 border-white/90 bg-hero-gradient p-6 shadow-soft sm:p-8">
        <div className="pointer-events-none absolute -right-14 -top-24 h-72 w-72 rounded-full bg-white/40 blur-2xl" />
        <div className="relative">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/70 px-3 py-1.5 text-xs font-bold text-deep-rose">
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              Postmenopause care
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/70 px-3 py-1.5 text-xs font-bold text-deep-rose">
              <HeartPulse className="h-4 w-4" aria-hidden="true" />
              Wellness check-in
            </span>
            <span className="text-xs font-semibold text-deep-rose/70">
              {formatLongDate(summary.today)}
            </span>
          </div>

          <h1 className="mt-4 max-w-3xl font-display text-[2rem] font-semibold leading-tight tracking-tight text-deep-rose sm:text-[2.6rem]">
            {greetingForHour(new Date().getHours())}, {firstName}.
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-deep-rose/80 sm:text-lg">
            {loggedToday
              ? 'Your check-in for today is saved. You can add more detail at any time.'
              : 'How are you feeling today? A short check-in helps you notice patterns and prepares you for your next visit.'}
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link to="/symptoms" className="senior-button bg-deep-rose text-white hover:bg-[#a81450]">
              <ClipboardPlus className="h-5 w-5" aria-hidden="true" />
              {loggedToday ? 'Update today’s check-in' : 'Log today’s symptoms'}
            </Link>
            <Link
              to="/doctor-report"
              className="senior-button border-2 border-blush-pink bg-white/85 text-deep-rose hover:bg-white"
            >
              <Stethoscope className="h-5 w-5" aria-hidden="true" />
              Prepare for a doctor visit
            </Link>
          </div>
        </div>
      </section>

      {/* At-a-glance metrics */}
      <section aria-labelledby="senior-metrics-title">
        <h2 id="senior-metrics-title" className="sr-only">
          Your week at a glance
        </h2>
        <div className="grid gap-3.5 sm:grid-cols-2 xl:grid-cols-4">
          <Metric
            icon={CalendarCheck2}
            label="Latest check-in"
            value={latest ? relativeDay(latest.date) : 'Not yet'}
            helper={
              latest
                ? `${formatDate(latest.date, 'EEEE, d MMMM')} · ${summary.weekCheckIns} check-in${
                    summary.weekCheckIns === 1 ? '' : 's'
                  } this week`
                : 'Your first check-in is a gentle place to start.'
            }
            tone="deep"
          />
          <Metric
            icon={Thermometer}
            label="Hot flash days"
            value={`${summary.weekHotFlashDays} this week`}
            helper={`${summary.weekHotFlashes} hot flash${
              summary.weekHotFlashes === 1 ? '' : 'es'
            } recorded · ${hotFlashHelper.toLowerCase()}`}
            tone="glow"
          />
          <Metric
            icon={Moon}
            label="Sleep quality"
            value={
              summary.sleepAverage !== null ? `${summary.sleepAverage} out of 5` : 'Not recorded'
            }
            helper={
              summary.sleepAverage !== null
                ? 'Your average over the last 7 days.'
                : 'Log sleep to see your weekly average.'
            }
            tone="soft"
          />
          <Metric
            icon={Activity}
            label="Joints & mobility"
            value={`${summary.jointDays} day${summary.jointDays === 1 ? '' : 's'} this week`}
            helper={
              summary.jointDays
                ? 'Stiffness recorded. Gentle movement can help.'
                : 'No joint stiffness recorded this week.'
            }
            tone="rose"
          />
        </div>
      </section>

      {/* Quick actions */}
      <section aria-labelledby="senior-actions-title">
        <div className="mb-3">
          <p className="eyebrow">Keep it simple</p>
          <h2 id="senior-actions-title" className="section-title mt-1">
            What would you like to do?
          </h2>
        </div>
        <div className="grid gap-3 lg:grid-cols-3">
          <QuickAction
            to="/symptoms"
            icon={ClipboardPlus}
            title="Log today’s symptoms"
            description="Sleep, comfort, joints and mood in one calm check-in."
            primary
          />
          <QuickAction
            to="/doctor-report"
            icon={FileText}
            title="Prepare for doctor visit"
            description="Bring your concerns, medications and patterns to the appointment."
          />
          <QuickAction
            to="/insights"
            icon={LineChart}
            title="View health summary"
            description="See plain-language trends from the last 30, 60 or 90 days."
          />
        </div>
      </section>

      <div className="grid gap-4 xl:grid-cols-[1.5fr_1fr]">
        {/* Recent check-ins */}
        <section className="senior-card" aria-labelledby="senior-recent-title">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="eyebrow">Recent check-ins</p>
              <h2 id="senior-recent-title" className="senior-section-title mt-1">
                How you’ve been feeling
              </h2>
            </div>
            <Link
              to="/symptoms"
              className="inline-flex min-h-[48px] items-center gap-1.5 rounded-xl px-3 text-sm font-bold text-deep-rose hover:bg-rose-mist"
            >
              Open journal
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>

          {logs.length ? (
            <ul className="mt-4 divide-y-2 divide-rose-mist">
              {logs.slice(0, 3).map((log) => {
                const details = log.senior || {};
                const notes = [
                  details.hotFlashCount > 0 ? `${details.hotFlashCount} hot flash${details.hotFlashCount === 1 ? '' : 'es'}` : null,
                  details.nightSweats && details.nightSweats !== 'none'
                    ? `${details.nightSweats} night sweats`
                    : null,
                  details.jointStiffness && details.jointStiffness !== 'none'
                    ? `${details.jointStiffness} joint stiffness`
                    : null,
                  details.sleepQuality
                    ? `sleep ${details.sleepQuality}/5`
                    : null,
                ].filter(Boolean);

                return (
                  <li key={log._id} className="flex items-start gap-3 py-4 first:pt-2 last:pb-0">
                    <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-soft-petal text-sm font-bold text-deep-rose">
                      {formatDate(log.date, 'd')}
                      <span className="sr-only">{formatDate(log.date, 'MMMM')}</span>
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-base font-bold text-ink">{relativeDay(log.date)}</p>
                      <p className="mt-1 text-sm leading-relaxed text-muted">
                        {notes.length ? notes.join(' · ') : 'No symptoms noted — that is useful too.'}
                      </p>
                      {details.postmenopausalBleeding ? (
                        <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-[#FFF0E0] px-2.5 py-1 text-xs font-bold text-[#8A4510]">
                          <ShieldAlert className="h-3.5 w-3.5" aria-hidden="true" />
                          Bleeding reported — mention this to your clinician
                        </p>
                      ) : null}
                    </div>
                    <Link
                      to="/symptoms"
                      className="mt-1 grid h-11 w-11 place-items-center rounded-xl text-muted hover:bg-rose-mist hover:text-deep-rose"
                      aria-label={`Open the check-in for ${formatDate(log.date)}`}
                    >
                      <ChevronRight className="h-5 w-5" aria-hidden="true" />
                    </Link>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="mt-4 rounded-2xl border-2 border-dashed border-blush-pink bg-rose-mist/60 p-6 text-center">
              <ClipboardPlus className="mx-auto h-9 w-9 text-pink-glow" aria-hidden="true" />
              <p className="mt-3 text-base font-bold text-deep-rose">Your journal is a blank page</p>
              <p className="mx-auto mt-1 max-w-sm text-sm leading-relaxed text-muted">
                Log how you feel today — even “nothing today” is a helpful record.
              </p>
              <Link to="/symptoms" className="senior-button mt-4 bg-deep-rose text-white hover:bg-[#a81450]">
                Start today’s check-in
              </Link>
            </div>
          )}
        </section>

        <div className="space-y-4">
          {/* Care note */}
          <section className="rounded-3xl bg-gradient-to-br from-deep-rose to-[#8f1446] p-6 text-white shadow-card">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-white/15">
              <Sun className="h-5 w-5" aria-hidden="true" />
            </span>
            <p className="mt-4 text-xs font-bold uppercase tracking-[0.16em] text-blush-pink">
              A note for today
            </p>
            <h2 className="mt-2 font-display text-xl font-semibold leading-snug">
              Small, steady habits matter more than perfect ones.
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-white/85">
              A short walk, a glass of water, or a few minutes of gentle stretching all count.
              Your notes help your clinician see the whole picture.
            </p>
            <Link
              to="/resources"
              className="mt-4 inline-flex min-h-[48px] items-center gap-1.5 text-sm font-bold text-white underline decoration-white/40 underline-offset-4 hover:decoration-white"
            >
              Explore the learning library
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </section>

          {/* Visit prep */}
          <section className="senior-card">
            <div className="flex items-center justify-between">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-soft-petal text-deep-rose">
                <FileText className="h-5 w-5" aria-hidden="true" />
              </span>
              <span className="rounded-full bg-blush-pink/70 px-3 py-1 text-xs font-bold text-deep-rose">
                Visit prep
              </span>
            </div>
            <h2 className="mt-4 font-display text-lg font-semibold text-deep-rose">
              Make your next appointment count.
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Turn your check-ins into a clear, printable summary — with your concerns and
              medications in one place.
            </p>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              {[
                { label: 'Check-ins', value: logs.length },
                { label: 'Bleeding alerts', value: summary.bleedingThisMonth },
                { label: 'Sleep avg', value: summary.sleepAverage ?? '—' },
              ].map((item) => (
                <div key={item.label} className="rounded-2xl bg-rose-mist/80 px-2 py-3">
                  <p className="text-lg font-bold text-deep-rose">{item.value}</p>
                  <p className="text-[10px] font-bold uppercase tracking-wide text-muted">
                    {item.label}
                  </p>
                </div>
              ))}
            </div>
            <Link
              to="/doctor-report"
              className="senior-button mt-4 w-full border-2 border-blush-pink bg-white text-deep-rose hover:bg-soft-petal"
            >
              Build my visit summary
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </section>

          {/* Privacy */}
          <section className="rounded-3xl border-2 border-blush-pink/70 bg-soft-petal/40 p-5">
            <div className="flex items-center gap-2 text-deep-rose">
              <Lock className="h-4 w-4" aria-hidden="true" />
              <p className="text-xs font-bold uppercase tracking-wide">Private by design</p>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Your health information belongs to you. Export or permanently delete it whenever you
              choose.
            </p>
            <Link
              to="/privacy"
              className="mt-2 inline-flex min-h-[48px] items-center gap-1 text-sm font-bold text-deep-rose hover:text-rose-pink"
            >
              Review privacy controls
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </section>
        </div>
      </div>

      {/* Warning signs */}
      <section
        className="overflow-hidden rounded-3xl border-2 border-blush-pink bg-white shadow-soft"
        aria-labelledby="senior-warning-title"
      >
        <div className="grid gap-5 p-5 sm:p-6 lg:grid-cols-[auto_1fr_auto] lg:items-center">
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-rose-mist text-deep-rose">
            <ShieldAlert className="h-7 w-7" aria-hidden="true" />
          </span>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 id="senior-warning-title" className="font-display text-xl font-semibold text-deep-rose">
                When to speak with your clinician
              </h2>
              <span className="rounded-full bg-blush-pink/70 px-3 py-1 text-xs font-bold text-deep-rose">
                Guidance, not diagnosis
              </span>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Many changes are manageable. Please arrange a review if you notice any of the
              following — especially if it is new, sudden or persistent.
            </p>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {[
                'Any vaginal bleeding after menopause',
                'Sudden or worsening joint pain or stiffness',
                'Chest pain, breathlessness or palpitations',
                'Urinary symptoms with fever or back pain',
                'A new breast change or unusual discharge',
                'Unintentional weight loss or ongoing fatigue',
              ].map((item) => (
                <span
                  key={item}
                  className="flex items-start gap-2 rounded-xl bg-rose-mist/70 px-3 py-2.5 text-sm font-medium text-deep-rose"
                >
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-deep-rose" aria-hidden="true" />
                  {item}
                </span>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Link to="/doctor-report" className="senior-button bg-deep-rose text-white hover:bg-[#a81450]">
              Prepare for a visit
            </Link>
            <Link
              to="/resources"
              className="senior-button border-2 border-blush-pink bg-white text-deep-rose hover:bg-soft-petal"
            >
              <BookOpen className="h-5 w-5" aria-hidden="true" />
              Read the guides
            </Link>
          </div>
        </div>
        <div className="border-t-2 border-blush-pink/50 bg-rose-mist/60 px-5 py-3 sm:px-6">
          <p className="text-xs leading-relaxed text-muted">
            If you have chest pain, severe shortness of breath, heavy bleeding with dizziness, or
            any symptom that feels urgent, seek same-day medical care. FemAware does not provide
            emergency care.
          </p>
        </div>
      </section>

      {summary.wellbeingAverage !== null ? (
        <p className="text-center text-sm text-muted">
          Your emotional wellbeing averaged{' '}
          <span className="font-bold text-deep-rose">{summary.wellbeingAverage} out of 5</span> this
          week.
        </p>
      ) : null}
    </SeniorPageShell>
  );
};

export default SeniorDashboard;
