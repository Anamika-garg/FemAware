import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, Sparkles } from 'lucide-react';
import { Button, Card, ErrorMessage, ProgressBar } from '../components/ui';
import { useSession } from '../context/SessionContext';
import { AGE_GROUPS, GOALS } from '../lib/labels';

const STEPS = ['About you', 'Your goals', 'Privacy & demo'];

function Chip({ selected, children, ...props }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      className={`flex items-center gap-2 rounded-2xl border-2 px-4 py-3 text-left font-bold transition-colors ${
        selected ? 'border-deep bg-deep text-white' : 'border-blush bg-white hover:border-rose'
      }`}
      {...props}
    >
      {selected && <Check aria-hidden className="size-4" />}
      {children}
    </button>
  );
}

export default function Onboarding() {
  const navigate = useNavigate();
  const { profile, setProfile, start } = useSession();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    nickname: profile?.nickname || '',
    ageGroup: profile?.ageGroup || '',
    goals: profile?.goals || [],
    understandsEducational: false,
    understandsDemo: false,
    withDemoData: true,
  });
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const update = (patch) => setForm((f) => ({ ...f, ...patch }));
  const toggleGoal = (g) => update({ goals: form.goals.includes(g) ? form.goals.filter((x) => x !== g) : [...form.goals, g] });

  const canContinue = [Boolean(form.ageGroup), form.goals.length > 0, form.understandsEducational && form.understandsDemo][step];

  async function finish() {
    setBusy(true);
    setError(null);
    try {
      await start({ withDemoData: form.withDemoData });
      setProfile({ nickname: form.nickname.trim().slice(0, 30), ageGroup: form.ageGroup, goals: form.goals });
      navigate('/dashboard');
    } catch (err) {
      setError(err);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 text-center">
        <Sparkles aria-hidden className="mx-auto size-8 text-glow" />
        <h1 className="mt-2 text-3xl font-black">Welcome to FemAware</h1>
        <p className="mt-1 text-deep/80">
          Step {step + 1} of {STEPS.length}: {STEPS[step]}
        </p>
        <div className="mx-auto mt-4 max-w-sm">
          <ProgressBar value={step + 1} max={STEPS.length} label="Onboarding progress" />
        </div>
      </div>

      <Card>
        {step === 0 && (
          <div className="space-y-6">
            <div>
              <label htmlFor="nickname" className="block font-black">
                What should we call you? <span className="font-semibold text-deep/70">(optional)</span>
              </label>
              <p className="text-sm text-deep/70">A nickname is fine. It stays on this device only.</p>
              <input
                id="nickname"
                maxLength={30}
                value={form.nickname}
                onChange={(e) => update({ nickname: e.target.value })}
                className="mt-2 w-full rounded-2xl border-2 border-blush bg-white px-4 py-3 font-semibold focus:border-deep focus:outline-none"
                placeholder="e.g. Sunny"
              />
            </div>
            <fieldset>
              <legend className="font-black">How old are you?</legend>
              <div className="mt-2 grid grid-cols-3 gap-3">
                {AGE_GROUPS.map((a) => (
                  <Chip key={a.value} selected={form.ageGroup === a.value} onClick={() => update({ ageGroup: a.value })}>
                    {a.label}
                  </Chip>
                ))}
              </div>
            </fieldset>
          </div>
        )}

        {step === 1 && (
          <fieldset>
            <legend className="font-black">What would you like help with? Pick as many as you like.</legend>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {GOALS.map((g) => (
                <Chip key={g.value} selected={form.goals.includes(g.value)} onClick={() => toggleGoal(g.value)}>
                  {g.label}
                </Chip>
              ))}
            </div>
          </fieldset>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <p>
              FemAware’s first release is a <strong>demo</strong>. There’s no login: a private, random key in your browser links
              you to your demo data, which is deleted automatically after 7 days (or right away, whenever you choose).
            </p>
            <label className="flex items-start gap-3 rounded-2xl bg-mist p-4">
              <input type="checkbox" className="mt-1 size-5 accent-deep" checked={form.understandsEducational} onChange={(e) => update({ understandsEducational: e.target.checked })} />
              <span>I understand FemAware is for learning. It does not diagnose, and it doesn’t replace a doctor.</span>
            </label>
            <label className="flex items-start gap-3 rounded-2xl bg-mist p-4">
              <input type="checkbox" className="mt-1 size-5 accent-deep" checked={form.understandsDemo} onChange={(e) => update({ understandsDemo: e.target.checked })} />
              <span>I understand this is a demo. I’ll use sample data or practise entries, not my real health information.</span>
            </label>
            <label className="flex items-start gap-3 rounded-2xl border-2 border-blush p-4">
              <input type="checkbox" className="mt-1 size-5 accent-deep" checked={form.withDemoData} onChange={(e) => update({ withDemoData: e.target.checked })} />
              <span>
                <strong>Fill my dashboard with sample data</strong> — six months of made-up cycles and symptoms so I can explore
                everything.
              </span>
            </label>
            <ErrorMessage error={error} />
          </div>
        )}

        <div className="mt-8 flex justify-between gap-3">
          <Button variant="ghost" onClick={() => setStep((s) => s - 1)} disabled={step === 0 || busy}>
            <ArrowLeft aria-hidden className="size-4" /> Back
          </Button>
          {step < STEPS.length - 1 ? (
            <Button onClick={() => setStep((s) => s + 1)} disabled={!canContinue}>
              Next <ArrowRight aria-hidden className="size-4" />
            </Button>
          ) : (
            <Button onClick={finish} disabled={!canContinue || busy}>
              {busy ? 'Setting up…' : 'Start my demo'}
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
