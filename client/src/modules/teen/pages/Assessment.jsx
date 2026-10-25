import { useState } from 'react';
import ConfirmDialog from '../../../components/ui/ConfirmDialog';
import { ArrowLeft, ArrowRight, ClipboardList, Droplet, HeartPulse, Phone, RotateCcw, Trash2 } from 'lucide-react';
import { api } from '../lib/api';
import { useAsync } from '../lib/useAsync';
import { formatDay } from '../lib/dates';
import { ASSESSMENT_LABELS, LEVEL_LABELS } from '../lib/labels';
import { Badge, Button, Card, ErrorMessage, FieldErrors, Loading, PageHeader, ProgressBar } from '../components/ui';
import { AssessmentResult } from '../components/AssessmentResult';
import { formatAnswer, isAnswered, QuestionField } from '../components/QuestionField';

const TYPES = [
  { type: 'cramps', icon: HeartPulse, text: 'Painful periods, cramps, or heavy bleeding.' },
  { type: 'irregular', icon: Droplet, text: 'A late, missed, or unpredictable period.' },
];

export default function Assessment() {
  const [type, setType] = useState(null);
  const [run, setRun] = useState(0);
  const history = useAsync(() => api.assessments.list(), [run]);

  return (
    <div>
      <PageHeader
        icon={ClipboardList}
        title="Guided symptom check"
        subtitle="Answer a few questions and get clear next steps. This is not a diagnosis."
      />
      <EmergencyCard />

      {!type ? (
        <div className="mt-6 grid gap-5 md:grid-cols-2">
          {TYPES.map(({ type: t, icon: Icon, text }) => (
            <button key={t} type="button" onClick={() => setType(t)} className="card p-6 text-left transition-colors hover:border-deep">
              <span className="grid size-11 place-items-center rounded-xl bg-mist text-deep">
                <Icon aria-hidden className="size-5" />
              </span>
              <h2 className="mt-4 font-display text-2xl text-ink">{ASSESSMENT_LABELS[t]}</h2>
              <p className="mt-1 text-muted">{text}</p>
            </button>
          ))}
        </div>
      ) : (
        <div className="mt-6">
          <Wizard
            key={`${type}-${run}`}
            type={type}
            onRestart={() => {
              setRun((r) => r + 1);
              setType(null);
            }}
            onDone={() => history.reload()}
          />
        </div>
      )}

      {history.data?.items.length > 0 && <History items={history.data.items} onChange={history.reload} />}
    </div>
  );
}

function EmergencyCard() {
  const { data } = useAsync(() => api.guidance.get('safety.emergency'));
  return (
    <aside className="flex items-start gap-3 rounded-xl border border-deep/40 bg-white p-4">
      <Phone aria-hidden className="mt-0.5 size-5 shrink-0 text-deep" />
      <div className="text-sm">
        <p className="font-semibold">{data?.item.title || 'If you need help right now'}</p>
        <p className="mt-0.5">{data?.item.body || 'If you feel very unwell, tell a trusted adult or contact your local emergency services.'}</p>
      </div>
    </aside>
  );
}

function Wizard({ type, onRestart, onDone }) {
  const { data, error, loading, reload } = useAsync(() => api.assessments.questions(type), [type]);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [submitError, setSubmitError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [reviewing, setReviewing] = useState(false);

  if (loading) return <Loading label="Loading questions…" />;
  if (error) return <ErrorMessage error={error} onRetry={reload} />;

  if (result) {
    return (
      <div>
        <AssessmentResult level={result.level} guidance={result.guidance} />
        <p className="mt-4 text-sm text-muted">
          {result.saved
            ? 'We saved only the result level — never your answers.'
            : 'Nothing was saved, because you have not started a demo session.'}
        </p>
        <Button variant="secondary" className="mt-4" onClick={onRestart}>
          <RotateCcw aria-hidden className="size-4" /> Start another check
        </Button>
      </div>
    );
  }

  const { questions } = data;

  if (reviewing) {
    return (
      <Card className="mx-auto max-w-2xl">
        <div className="mb-6">
          <div className="mb-2 flex justify-between text-sm font-semibold">
            <span>{ASSESSMENT_LABELS[type]}</span>
            <span>Review</span>
          </div>
          <ProgressBar value={1} max={1} label="Check progress" />
        </div>
        <h2 className="font-display text-2xl text-ink">Check your answers</h2>
        <p className="mt-1 text-sm text-muted">Nothing is sent until you choose See my guidance.</p>
        <dl className="mt-5 divide-y divide-petal border-y border-petal">
          {questions.map((x, index) => (
            <div key={x.id} className="grid gap-1 py-3 sm:grid-cols-[1fr_auto] sm:items-start sm:gap-6">
              <dt className="text-sm text-muted">{x.prompt}</dt>
              <dd className="flex items-center gap-3 font-semibold sm:justify-end">
                {formatAnswer(x, answers[x.id])}
                <button
                  type="button"
                  className="text-sm font-semibold text-deep underline decoration-blush underline-offset-4 hover:decoration-deep"
                  onClick={() => {
                    setReviewing(false);
                    setStep(index);
                  }}
                >
                  Edit<span className="sr-only"> answer to: {x.prompt}</span>
                </button>
              </dd>
            </div>
          ))}
        </dl>
        {submitError && (
          <div role="alert" className="mt-4 rounded-xl bg-mist p-3 text-sm font-semibold">
            {submitError.message}
            <FieldErrors error={submitError} />
          </div>
        )}
        <div className="mt-8 flex justify-between gap-3">
          <Button variant="ghost" onClick={() => setReviewing(false)} disabled={busy}>
            <ArrowLeft aria-hidden className="size-4" /> Back
          </Button>
          <Button onClick={submit} disabled={busy}>
            {busy ? 'Checking…' : 'See my guidance'}
          </Button>
        </div>
      </Card>
    );
  }
  const q = questions[step];
  const last = step === questions.length - 1;
  const value = answers[q.id];

  async function submit() {
    setBusy(true);
    setSubmitError(null);
    try {
      const body = Object.fromEntries(questions.map((x) => [x.id, x.kind === 'multi' ? answers[x.id] || [] : answers[x.id]]));
      setResult(await api.assessments.submit(type, body));
      onDone();
    } catch (err) {
      setSubmitError(err);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card className="mx-auto max-w-2xl">
      <div className="mb-6">
        <div className="mb-2 flex justify-between text-sm font-semibold">
          <span>{ASSESSMENT_LABELS[type]}</span>
          <span>
            Question {step + 1} of {questions.length}
          </span>
        </div>
        <ProgressBar value={step + 1} max={questions.length} label="Check progress" />
      </div>

      <QuestionField key={q.id} question={q} value={value} onChange={(v) => setAnswers((a) => ({ ...a, [q.id]: v }))} />

      {submitError && (
        <div role="alert" className="mt-4 rounded-xl bg-petal p-3 text-sm font-semibold">
          {submitError.message}
          <FieldErrors error={submitError} />
        </div>
      )}

      <div className="mt-8 flex justify-between gap-3">
        <Button variant="ghost" onClick={() => (step === 0 ? onRestart() : setStep((s) => s - 1))} disabled={busy}>
          <ArrowLeft aria-hidden className="size-4" /> {step === 0 ? 'Change check' : 'Back'}
        </Button>
        {last ? (
          <Button onClick={() => setReviewing(true)} disabled={!isAnswered(q, value) || busy}>
            Review answers <ArrowRight aria-hidden className="size-4" />
          </Button>
        ) : (
          <Button onClick={() => setStep((s) => s + 1)} disabled={!isAnswered(q, value)}>
            Next <ArrowRight aria-hidden className="size-4" />
          </Button>
        )}
      </div>
    </Card>
  );
}

function History({ items, onChange }) {
  const [error, setError] = useState(null);
  const [pending, setPending] = useState(null);
  const [removing, setRemoving] = useState(false);
  async function remove() {
    setRemoving(true);
    try {
      await api.assessments.remove(pending);
      setPending(null);
      onChange();
    } catch (err) {
      setError(err);
      setPending(null);
    } finally {
      setRemoving(false);
    }
  }
  return (
    <Card className="mt-8">
      <ConfirmDialog
        open={Boolean(pending)}
        onClose={() => setPending(null)}
        onConfirm={remove}
        loading={removing}
        title="Delete this check?"
        description="The saved result level for this check will be removed from your account."
        confirmLabel="Delete check"
      />
      <h2 className="font-display text-2xl text-ink">Your past checks</h2>
      <p className="text-sm text-muted">Only the type, date and result level are stored.</p>
      <ErrorMessage error={error} />
      <ul className="mt-3 divide-y divide-petal">
        {items.map((a) => (
          <li key={a.id} className="flex items-center justify-between gap-3 py-3">
            <span>
              <span className="font-semibold">{ASSESSMENT_LABELS[a.type]}</span>{' '}
              <span className="text-sm text-muted">· {formatDay(a.createdAt, { day: 'numeric', month: 'short', year: 'numeric' })}</span>
            </span>
            <span className="flex items-center gap-2">
              <Badge className={a.result.level === 'urgent' ? 'bg-deep text-white' : 'bg-petal text-deep'}>{LEVEL_LABELS[a.result.level]}</Badge>
              <Button variant="ghost" size="sm" aria-label="Delete this check" onClick={() => setPending(a.id)}>
                <Trash2 aria-hidden className="size-4" />
              </Button>
            </span>
          </li>
        ))}
      </ul>
    </Card>
  );
}
