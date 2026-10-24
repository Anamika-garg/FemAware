import { useState } from 'react';
import { Check, NotebookPen, Pencil, Trash2 } from 'lucide-react';
import { api } from '../lib/api';
import { useAsync } from '../lib/useAsync';
import { apiDay, formatDay, todayIso } from '../lib/dates';
import { SEVERITY_LABELS, SYMPTOM_LABELS } from '../lib/labels';
import { Badge, Button, Card, EmptyState, ErrorMessage, FieldErrors, Loading, PageHeader } from '../components/ui';

const emptyForm = () => ({ date: todayIso(), symptoms: [], severity: 3, notes: '' });

export default function TeenSymptoms() {
  const { data, error, loading, reload } = useAsync(() => api.symptoms.list());
  const [editing, setEditing] = useState(null);

  return (
    <div>
      <PageHeader icon={NotebookPen} title="Symptom diary" subtitle="Log how you feel. Patterns over time help you and your doctor." />
      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <SymptomForm
          key={editing?.id || 'new'}
          editing={editing}
          onCancel={() => setEditing(null)}
          onSaved={async () => {
            setEditing(null);
            await reload();
          }}
        />
        <Card>
          <h2 className="text-xl font-black">History</h2>
          {loading && !data && <Loading />}
          <ErrorMessage error={error} onRetry={reload} />
          {data?.items.length === 0 && (
            <div className="mt-4">
              <EmptyState icon={NotebookPen} title="Your diary is empty">
                Log your first symptoms using the form.
              </EmptyState>
            </div>
          )}
          {data?.items.length > 0 && (
            <ul className="mt-4 space-y-3">
              {data.items.map((log) => (
                <SymptomRow key={log.id} log={log} onEdit={() => setEditing(log)} onDeleted={reload} />
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}

function SymptomForm({ editing, onSaved, onCancel }) {
  const [form, setForm] = useState(() =>
    editing ? { date: apiDay(editing.date), symptoms: editing.symptoms, severity: editing.severity, notes: editing.notes || '' } : emptyForm(),
  );
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);

  const toggle = (s) => setForm((f) => ({ ...f, symptoms: f.symptoms.includes(s) ? f.symptoms.filter((x) => x !== s) : [...f.symptoms, s] }));

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setSaved(false);
    try {
      const body = { ...form, notes: form.notes.trim() || undefined };
      if (editing) await api.symptoms.update(editing.id, body);
      else await api.symptoms.create(body);
      setForm(emptyForm());
      setSaved(true);
      await onSaved();
    } catch (err) {
      setError(err);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card as="form" onSubmit={submit} className="space-y-5 self-start" aria-label={editing ? 'Edit symptom log' : 'New symptom log'}>
      <h2 className="text-xl font-black">{editing ? 'Edit entry' : 'How are you feeling?'}</h2>
      <label className="block text-sm font-bold">
        Date
        <input type="date" required max={todayIso()} value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="mt-1 w-full rounded-xl border-2 border-blush bg-white px-3 py-2" />
      </label>

      <fieldset>
        <legend className="text-sm font-bold">Symptoms</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {Object.entries(SYMPTOM_LABELS).map(([value, label]) => {
            const on = form.symptoms.includes(value);
            return (
              <button
                key={value}
                type="button"
                aria-pressed={on}
                onClick={() => toggle(value)}
                className={`inline-flex items-center gap-1 rounded-full border-2 px-3 py-1.5 text-sm font-bold ${on ? 'border-deep bg-deep text-white' : 'border-blush bg-white hover:border-rose'}`}
              >
                {on && <Check aria-hidden className="size-3.5" />}
                {label}
              </button>
            );
          })}
        </div>
      </fieldset>

      <label className="block text-sm font-bold">
        How strong? <span className="text-rose">{form.severity} — {SEVERITY_LABELS[form.severity]}</span>
        <input
          type="range"
          min={1}
          max={5}
          step={1}
          value={form.severity}
          onChange={(e) => setForm({ ...form, severity: Number(e.target.value) })}
          aria-valuetext={SEVERITY_LABELS[form.severity]}
          className="mt-2 w-full accent-deep"
        />
      </label>

      <label className="block text-sm font-bold">
        Notes <span className="font-semibold text-deep/60">(optional, max 500 characters)</span>
        <textarea
          maxLength={500}
          rows={3}
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          className="mt-1 w-full rounded-xl border-2 border-blush bg-white px-3 py-2"
          placeholder="What helped? What made it worse?"
        />
      </label>
      <p className="text-xs text-deep/70">Demo reminder: please use practice entries rather than real health details.</p>

      {error && (
        <div role="alert" className="rounded-xl bg-petal p-3 text-sm font-semibold">
          {error.message}
          <FieldErrors error={error} />
        </div>
      )}
      {saved && <p role="status" className="text-sm font-bold">Saved!</p>}

      <div className="flex gap-2">
        <Button type="submit" disabled={busy || form.symptoms.length === 0}>
          {editing ? 'Save changes' : 'Log symptoms'}
        </Button>
        {editing && (
          <Button variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </Card>
  );
}

function SymptomRow({ log, onEdit, onDeleted }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  async function remove() {
    if (!window.confirm('Delete this entry?')) return;
    setBusy(true);
    try {
      await api.symptoms.remove(log.id);
      await onDeleted();
    } catch (err) {
      setError(err);
      setBusy(false);
    }
  }

  return (
    <li className="rounded-2xl bg-mist p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-black text-rose">{formatDay(log.date, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</p>
          <div className="mt-1 flex flex-wrap gap-1.5">
            {log.symptoms.map((s) => (
              <Badge key={s} className="bg-white text-deep">
                {SYMPTOM_LABELS[s]}
              </Badge>
            ))}
          </div>
          <p className="mt-1 text-sm font-semibold">
            Severity {log.severity}/5 · {SEVERITY_LABELS[log.severity]}
          </p>
          {log.notes && <p className="mt-1 text-sm text-deep/80">“{log.notes}”</p>}
        </div>
        <div className="flex shrink-0 gap-1">
          <Button variant="ghost" size="sm" onClick={onEdit} aria-label="Edit entry">
            <Pencil aria-hidden className="size-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={remove} disabled={busy} aria-label="Delete entry">
            <Trash2 aria-hidden className="size-4" />
          </Button>
        </div>
      </div>
      <ErrorMessage error={error} />
    </li>
  );
}
