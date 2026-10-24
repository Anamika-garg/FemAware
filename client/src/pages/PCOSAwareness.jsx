import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  AlertCircle,
  ArrowRight,
  Check,
  ClipboardCopy,
  ClipboardList,
  Droplets,
  FlaskConical,
  HeartPulse,
  Info,
  Lock,
  Moon,
  RefreshCw,
  ShieldAlert,
  Sparkles,
  Stethoscope,
  Weight,
} from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { CardSkeleton, ErrorState } from '../components/ui/States';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api, { getErrorMessage } from '../lib/api';
import { cn } from '../lib/utils';

const STORAGE_KEY = 'cyclesense_pcos_reflection';

const SIGN_GROUPS = [
  {
    id: 'cycle',
    title: 'Cycle patterns',
    icon: Activity,
    description: 'PCOS often affects how regularly ovulation happens.',
    signs: [
      { id: 'irregular', label: 'My periods are often irregular' },
      { id: 'long', label: 'My cycles are frequently longer than 35 days' },
      { id: 'missed', label: 'I have missed several periods in the last year' },
      { id: 'heavy', label: 'My bleeding is sometimes very heavy' },
    ],
  },
  {
    id: 'body',
    title: 'Skin & hair patterns',
    icon: Sparkles,
    description: 'Higher androgen levels can show up on the skin and scalp.',
    signs: [
      { id: 'acne', label: 'Persistent acne along my jaw, chin or back' },
      { id: 'hair', label: 'Excess facial or body hair growth' },
      { id: 'scalp', label: 'Thinning hair on my scalp' },
    ],
  },
  {
    id: 'metabolic',
    title: 'Metabolic signals',
    icon: Weight,
    description: 'Insulin resistance can accompany PCOS and affect energy and weight.',
    signs: [
      { id: 'weight', label: 'Weight gain, especially around my middle' },
      { id: 'stubborn', label: 'Weight that feels difficult to shift' },
      { id: 'patches', label: 'Dark, velvety skin patches or skin tags' },
      { id: 'cravings', label: 'Strong sugar or carbohydrate cravings' },
    ],
  },
  {
    id: 'wellbeing',
    title: 'Energy & mood',
    icon: Moon,
    description: 'These can overlap with many other conditions, including stress and sleep debt.',
    signs: [
      { id: 'fatigue', label: 'Frequent fatigue, even after sleep' },
      { id: 'sleep', label: 'Ongoing trouble falling or staying asleep' },
      { id: 'anxiety', label: 'Anxiety or low mood that affects daily life' },
    ],
  },
];

const ALL_SIGNS = SIGN_GROUPS.flatMap((group) => group.signs);

const readStored = () => {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const PCOSAwareness = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [stats, setStats] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const [selected, setSelected] = useState(readStored);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(selected));
  }, [selected]);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const [cycleRes, symptomRes] = await Promise.all([
          api.get(`/cycles/${user._id}`),
          api.get(`/symptoms/${user._id}/summary`),
        ]);
        if (!active) return;
        setStats(cycleRes.data.stats);
        setSummary(symptomRes.data);
      } catch (err) {
        if (active) setError(getErrorMessage(err));
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [user._id, refreshKey]);

  const toggle = (id) => {
    setSelected((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    );
  };

  const reset = () => {
    setSelected([]);
    addToast({ title: 'Reflection cleared', message: 'You can start again whenever you like.' });
  };

  const interpretation = useMemo(() => {
    if (selected.length === 0) {
      return {
        label: 'Ready when you are',
        message:
          'Select any patterns you recognise. This is a reflection tool, not a score — and not a diagnosis.',
      };
    }
    if (selected.length <= 2) {
      return {
        label: 'A few signals selected',
        message:
          'You have noticed a couple of patterns. Many have everyday explanations. If something persists or worries you, it is still worth a conversation with a clinician.',
      };
    }
    if (selected.length <= 5) {
      return {
        label: 'Some patterns worth discussing',
        message:
          'Several of the patterns you selected can overlap with PCOS — but also with thyroid changes, stress, sleep debt and other conditions. A clinician can help sort out what is going on.',
      };
    }
    return {
      label: 'Several patterns worth discussing',
      message:
        'You have selected several patterns that a clinician may want to explore. This does not mean you have PCOS. Bring your cycle log and these notes to make the conversation focused.',
    };
  }, [selected.length]);

  const selectedLabels = ALL_SIGNS.filter((sign) => selected.includes(sign.id)).map((sign) => sign.label);

  const copyNotes = async () => {
    const lines = [
      'Notes for my clinician visit',
      '',
      `CycleSense average cycle: ${stats?.hasData ? `${stats.averageCycleLength} days` : 'not enough data'}`,
      `Cycle regularity: ${stats?.regularity || 'not enough data'}`,
      `Cycle variation: ${stats?.hasData ? `±${stats.variation} days` : 'not enough data'}`,
      '',
      'Patterns I have noticed:',
      ...(selectedLabels.length ? selectedLabels.map((label) => `- ${label}`) : ['- None selected']),
      '',
      'I would like to discuss whether these patterns need assessment. I understand CycleSense is not a diagnostic tool.',
    ];
    try {
      await navigator.clipboard.writeText(lines.join('\n'));
      addToast({ title: 'Notes copied', message: 'Paste them into your notes or patient portal.' });
    } catch {
      addToast({
        type: 'error',
        title: 'Clipboard unavailable',
        message: 'Your browser blocked clipboard access. You can type the patterns into your notes manually.',
      });
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Understanding patterns"
        title="PCOS awareness, without the fear."
        description="Learn what PCOS is (and isn’t), reflect on patterns you have noticed, and prepare a grounded conversation with a clinician. No diagnosis is made here."
        actions={
          <>
            <Link to="/doctor-report" className="btn-secondary btn-sm">
              Visit summary
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
            <Badge tone="outline" icon={Lock}>
              Reflection stored on this device
            </Badge>
          </>
        }
      />

      <section className="overflow-hidden rounded-2xl border border-deep-rose/20 bg-[#FFF7FA]">
        <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div className="flex items-start gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-deep-rose text-white">
              <ShieldAlert className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <p className="text-sm font-bold text-deep-rose">
                CycleSense does not diagnose PCOS.
              </p>
              <p className="mt-0.5 text-[11px] leading-relaxed text-muted">
                No app can. PCOS is diagnosed by a qualified clinician after a history, examination
                and, where appropriate, blood tests or an ultrasound — and after other causes are
                ruled out.
              </p>
            </div>
          </div>
          <Badge tone="pink" className="shrink-0">Educational only</Badge>
        </div>
      </section>

      <div className="grid gap-4 xl:grid-cols-[1.45fr_1fr]">
        <div className="space-y-4">
          <section className="card p-5 sm:p-6" aria-labelledby="what-is-title">
            <div className="flex items-center gap-2">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-soft-petal text-deep-rose">
                <Info className="h-4 w-4" aria-hidden="true" />
              </span>
              <h2 id="what-is-title" className="font-display text-xl font-semibold text-deep-rose">
                What PCOS actually is
              </h2>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-ink/85">
              Polycystic ovary syndrome is a common hormonal condition affecting roughly 1 in 10
              women of reproductive age, depending on the criteria used. It is not caused by a single
              thing, and it looks different from person to person. The name is misleading: “polycystic”
              refers to many small follicles on the ovary, not painful cysts, and not everyone with
              PCOS has them.
            </p>
            <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
              {[
                {
                  icon: Activity,
                  title: 'Ovulation can be irregular',
                  text: 'Cycles may be long, unpredictable, or occasionally absent. This is why periods are often the first clue.',
                },
                {
                  icon: Sparkles,
                  title: 'Androgens may be higher',
                  text: 'Acne, facial or body hair growth and scalp hair thinning can sometimes reflect higher androgen levels.',
                },
                {
                  icon: Weight,
                  title: 'Metabolism can be involved',
                  text: 'Insulin resistance is common, though not universal, and can affect energy, weight and long-term health.',
                },
                {
                  icon: HeartPulse,
                  title: 'It is not one story',
                  text: 'Some people have mild symptoms; others have significant metabolic or fertility concerns. Care should match the person.',
                },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="rounded-xl bg-rose-mist/70 p-3.5">
                    <Icon className="h-4 w-4 text-deep-rose" aria-hidden="true" />
                    <p className="mt-2 text-xs font-bold text-deep-rose">{item.title}</p>
                    <p className="mt-0.5 text-[10px] leading-relaxed text-muted">{item.text}</p>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="card p-5 sm:p-6" aria-labelledby="diagnosis-title">
            <div className="flex items-center gap-2">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-soft-petal text-deep-rose">
                <Stethoscope className="h-4 w-4" aria-hidden="true" />
              </span>
              <h2 id="diagnosis-title" className="font-display text-xl font-semibold text-deep-rose">
                How a clinician assesses PCOS
              </h2>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-ink/85">
              A common diagnostic framework (the Rotterdam criteria) requires at least two of the
              following three features, after other conditions have been excluded:
            </p>
            <div className="mt-4 space-y-2.5">
              {[
                {
                  number: '01',
                  title: 'Irregular or absent ovulation',
                  text: 'Often seen as cycles that are consistently long, unpredictable, or missing.',
                },
                {
                  number: '02',
                  title: 'Clinical or biochemical hyperandrogenism',
                  text: 'Signs such as acne, unwanted hair growth, or higher androgen levels on a blood test.',
                },
                {
                  number: '03',
                  title: 'Polycystic ovarian morphology',
                  text: 'Many small follicles or increased ovarian volume seen on ultrasound — when appropriate for age.',
                },
              ].map((item) => (
                <div key={item.number} className="flex items-start gap-3 rounded-xl border border-blush-pink/50 p-3">
                  <span className="font-display text-lg font-semibold text-pink-glow">{item.number}</span>
                  <div>
                    <p className="text-xs font-bold text-deep-rose">{item.title}</p>
                    <p className="mt-0.5 text-[10px] leading-relaxed text-muted">{item.text}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-start gap-2 rounded-xl bg-soft-petal/40 p-3">
              <FlaskConical className="mt-0.5 h-3.5 w-3.5 shrink-0 text-deep-rose" aria-hidden="true" />
              <p className="text-[10px] leading-relaxed text-deep-rose/80">
                Clinicians may also check thyroid function, prolactin, blood pressure, glucose and
                lipids. Ultrasound findings change across the lifespan, so they are interpreted in
                context — not as a stand-alone diagnosis.
              </p>
            </div>
          </section>

          <section className="card p-5 sm:p-6" aria-labelledby="myths-title">
            <h2 id="myths-title" className="font-display text-xl font-semibold text-deep-rose">
              Three things PCOS is not
            </h2>
            <div className="mt-3 grid gap-2.5 sm:grid-cols-3">
              {[
                { title: 'Not a fertility verdict', text: 'Many people with PCOS conceive, sometimes with support. Irregular ovulation can be treated.' },
                { title: 'Not caused by one choice', text: 'PCOS has genetic and hormonal roots. It is not a personal failure or simply “a lifestyle condition”.' },
                { title: 'Not diagnosed by an app', text: 'A checklist can help you prepare, but symptoms overlap with many conditions. A clinician must assess.' },
              ].map((item) => (
                <div key={item.title} className="rounded-xl bg-rose-mist/70 p-3">
                  <p className="text-[11px] font-bold text-deep-rose">{item.title}</p>
                  <p className="mt-1 text-[10px] leading-relaxed text-muted">{item.text}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside className="space-y-4">
          <section className="card p-5" aria-labelledby="your-data-title">
            <div className="flex items-center justify-between gap-2">
              <h2 id="your-data-title" className="font-display text-lg font-semibold text-deep-rose">
                From your own tracking
              </h2>
              <Badge tone="pink">{stats?.hasData ? `${stats.cycleCount} cycles` : 'No data yet'}</Badge>
            </div>

            {loading ? (
              <div className="mt-4 space-y-3">
                <CardSkeleton rows={2} />
              </div>
            ) : error ? (
              <ErrorState
                message={error}
                onRetry={() => setRefreshKey((key) => key + 1)}
                className="mt-4 border-none p-0"
              />
            ) : (
              <>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  {[
                    { label: 'Average cycle', value: stats?.hasData ? `${stats.averageCycleLength}d` : '—' },
                    { label: 'Variation', value: stats?.hasData ? `±${stats.variation}d` : '—' },
                    { label: 'Regularity', value: stats?.regularity || '—' },
                    { label: 'Period length', value: stats?.hasData ? `${stats.averagePeriodLength}d` : '—' },
                  ].map((item) => (
                    <div key={item.label} className="rounded-xl bg-rose-mist/80 px-3 py-2.5">
                      <p className="text-[9px] font-bold uppercase tracking-wide text-muted">{item.label}</p>
                      <p className="mt-0.5 text-xs font-bold capitalize text-deep-rose">{item.value}</p>
                    </div>
                  ))}
                </div>

                {summary?.topPhysical?.length ? (
                  <div className="mt-3">
                    <p className="text-[9px] font-bold uppercase tracking-wide text-muted">
                      Your most logged symptoms
                    </p>
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {summary.topPhysical.slice(0, 5).map((item) => (
                        <span key={item.name} className="rounded-full bg-soft-petal px-2 py-0.5 text-[9px] font-semibold text-deep-rose">
                          {item.name} · {item.count}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null}

                <p className="mt-3 flex items-start gap-1.5 rounded-lg bg-white p-2.5 text-[9px] leading-relaxed text-muted ring-1 ring-blush-pink/40">
                  <Info className="mt-0.5 h-3 w-3 shrink-0" aria-hidden="true" />
                  {stats?.hasData &&
                  (stats.averageCycleLength > 35 || stats.regularity === 'irregular')
                    ? 'Your logged cycles are long or variable. That is one pattern a clinician may want to review — not a diagnosis.'
                    : 'Your logged cycles do not show a clear irregular pattern. Symptoms can still matter, and PCOS can occur with regular cycles.'}
                </p>
              </>
            )}
            <Link to="/cycle" className="mt-4 flex items-center justify-center gap-1 text-[10px] font-bold text-deep-rose hover:text-rose-pink">
              Open cycle tracker
              <ArrowRight className="h-3 w-3" aria-hidden="true" />
            </Link>
          </section>

          <section className="rounded-2xl border border-blush-pink/60 bg-white/75 p-4">
            <div className="flex items-center gap-2">
              <ClipboardList className="h-4 w-4 text-pink-glow" aria-hidden="true" />
              <p className="text-[10px] font-bold text-deep-rose">If you book an appointment</p>
            </div>
            <ul className="mt-2 space-y-1.5">
              {[
                'Bring 3–6 months of cycle dates.',
                'List skin, hair, sleep and weight changes.',
                'Note any medicines and family history of PCOS or diabetes.',
                'Ask which assessments are appropriate for you.',
              ].map((item) => (
                <li key={item} className="flex items-start gap-1.5 text-[10px] leading-relaxed text-muted">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-pink-glow" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
            <Link to="/doctor-report" className="btn-secondary btn-sm mt-3 w-full">
              Build my health summary
            </Link>
          </section>

          <div className="flex items-start gap-2 rounded-xl border border-blush-pink/60 bg-white/70 p-3.5">
            <Droplets className="mt-0.5 h-3.5 w-3.5 shrink-0 text-pink-glow" aria-hidden="true" />
            <p className="text-[10px] leading-relaxed text-muted">
              Irregular periods can also be caused by thyroid conditions, high prolactin, perimenopause,
              significant weight change, stress and some medicines. This is why a clinician rules out
              other causes first.
            </p>
          </div>
        </aside>
      </div>

      <section className="card overflow-hidden" aria-labelledby="reflection-title">
        <div className="border-b border-blush-pink/40 bg-gradient-to-r from-rose-mist via-soft-petal/50 to-white px-5 py-5 sm:px-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="eyebrow">Pattern reflection</p>
              <h2 id="reflection-title" className="mt-1 font-display text-2xl font-semibold text-deep-rose">
                Notice what you have been experiencing
              </h2>
              <p className="mt-1 max-w-2xl text-xs leading-relaxed text-muted">
                Think about the last 6–12 months. Select what feels familiar. There is no right number
                and no diagnosis at the end — only a clearer starting point for a conversation.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge tone="outline" className="bg-white/60">
                {selected.length} of {ALL_SIGNS.length} selected
              </Badge>
              {selected.length ? (
                <button
                  type="button"
                  onClick={reset}
                  className="flex items-center gap-1 text-[10px] font-bold text-deep-rose hover:text-rose-pink"
                >
                  <RefreshCw className="h-3 w-3" aria-hidden="true" />
                  Reset
                </button>
              ) : null}
            </div>
          </div>
        </div>

        <div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-[1.45fr_1fr]">
          <div className="space-y-5">
            {SIGN_GROUPS.map((group) => {
              const Icon = group.icon;
              return (
                <fieldset key={group.id}>
                  <legend className="flex w-full items-center gap-2">
                    <span className="grid h-7 w-7 place-items-center rounded-lg bg-soft-petal text-deep-rose">
                      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                    </span>
                    <span className="text-xs font-bold text-deep-rose">{group.title}</span>
                    <span className="ml-auto text-[9px] font-medium text-muted">{group.description}</span>
                  </legend>
                  <div className="mt-2 grid gap-1.5 sm:grid-cols-2">
                    {group.signs.map((sign) => {
                      const checked = selected.includes(sign.id);
                      return (
                        <button
                          key={sign.id}
                          type="button"
                          onClick={() => toggle(sign.id)}
                          aria-pressed={checked}
                          className={cn(
                            'flex items-center gap-2 rounded-xl border px-3 py-2.5 text-left text-[11px] font-medium transition-all',
                            checked
                              ? 'border-pink-glow bg-soft-petal/60 text-deep-rose'
                              : 'border-blush-pink/60 bg-white text-ink hover:border-pink-glow/60'
                          )}
                        >
                          <span
                            className={cn(
                              'grid h-4 w-4 shrink-0 place-items-center rounded border',
                              checked
                                ? 'border-pink-glow bg-pink-glow text-white'
                                : 'border-blush-pink bg-white'
                            )}
                            aria-hidden="true"
                          >
                            {checked ? <Check className="h-2.5 w-2.5" /> : null}
                          </span>
                          {sign.label}
                        </button>
                      );
                    })}
                  </div>
                </fieldset>
              );
            })}
          </div>

          <div className="space-y-3">
            <div className="rounded-2xl border border-pink-glow/30 bg-gradient-to-br from-soft-petal/60 to-white p-5">
              <div className="flex items-center gap-2">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-pink-glow text-white">
                  <HeartPulse className="h-4 w-4" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-wide text-muted">Your reflection</p>
                  <p className="text-sm font-bold text-deep-rose">{interpretation.label}</p>
                </div>
              </div>
              <div className="mt-4">
                <div className="h-2 overflow-hidden rounded-full bg-white">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-pink-glow to-deep-rose transition-all"
                    style={{ width: `${Math.max(4, (selected.length / ALL_SIGNS.length) * 100)}%` }}
                  />
                </div>
                <p className="mt-1.5 text-[9px] text-muted">
                  {selected.length} reflection signals selected · not a risk score
                </p>
              </div>
              <p className="mt-3 text-xs leading-relaxed text-ink/80">{interpretation.message}</p>
              <div className="mt-4 flex items-start gap-2 rounded-xl bg-white/80 p-3">
                <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-deep-rose" aria-hidden="true" />
                <p className="text-[9px] leading-relaxed text-deep-rose/80">
                  Many people without PCOS will recognise some of these patterns, and some people with
                  PCOS will recognise none. This reflection cannot confirm or exclude PCOS.
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-blush-pink/60 bg-white p-4">
              <p className="text-[10px] font-bold uppercase tracking-wide text-muted">Take this with you</p>
              <p className="mt-1.5 text-[11px] leading-relaxed text-muted">
                Copy a plain-language note with your tracked cycle averages and the patterns you
                selected. It is written for your own notes — not a diagnosis.
              </p>
              <Button
                variant="secondary"
                size="sm"
                icon={ClipboardCopy}
                className="mt-3 w-full"
                onClick={copyNotes}
              >
                Copy notes for my clinician
              </Button>
              <Link to="/doctor-report" className="btn-primary btn-sm mt-2 w-full">
                Open full doctor report
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
              <p className="mt-2 flex items-center justify-center gap-1 text-[8px] text-muted">
                <Lock className="h-2.5 w-2.5" aria-hidden="true" />
                Selected patterns stay on this device until you clear them.
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="flex items-start gap-2 rounded-2xl border border-blush-pink/60 bg-white/75 p-4">
        <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-deep-rose" aria-hidden="true" />
        <p className="text-[10px] leading-relaxed text-muted">
          CycleSense is an educational tracking tool and does not provide medical diagnosis or
          treatment. If you are concerned about PCOS, irregular periods, acne, hair changes, weight or
          fertility, speak with a gynecologist, endocrinologist or primary care clinician. Seek prompt
          care for severe pain or very heavy bleeding.
        </p>
      </div>
    </div>
  );
};

export default PCOSAwareness;
