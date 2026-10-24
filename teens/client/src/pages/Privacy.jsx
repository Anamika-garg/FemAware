import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Trash2 } from 'lucide-react';
import { useSession } from '../context/SessionContext';
import { Button, Card, ErrorMessage, PageHeader } from '../components/ui';

const STORED = [
  ['Period dates', 'Start and end dates and flow you log in the calendar.'],
  ['Symptom diary', 'Symptoms, how strong they were, the date, and any notes.'],
  ['Guided checks', 'Only the type of check, the date, and the result level (for example “talk to a doctor”). Your answers are never saved, and pregnancy-related answers are never stored.'],
  ['Learning progress', 'Lessons completed, quiz scores, XP and badges.'],
];

export default function Privacy() {
  const navigate = useNavigate();
  const { status, session, deleteEverything } = useSession();
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState(null);
  const [done, setDone] = useState(false);

  async function handleDelete() {
    setError(null);
    try {
      await deleteEverything();
      setDone(true);
      setConfirming(false);
    } catch (err) {
      setError(err);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader icon={Lock} title="Privacy & your data" subtitle="Plain-language answers about what FemAware keeps, and how to delete it." />

      <Card>
        <h2 className="text-xl font-black">Demo mode</h2>
        <p className="mt-2">
          This first release of FemAware is a <strong>demo</strong>. It is designed to be explored with made-up sample data. Please
          don’t enter real, sensitive health information.
        </p>
        <ul className="mt-3 list-inside list-disc space-y-1">
          <li>There are no accounts, passwords, emails, or names on our servers.</li>
          <li>
            When you start a demo, your browser gets a random private key in a secure cookie. We store only a scrambled (hashed)
            version of it, which links you to your demo data.
          </li>
          <li>All demo data is deleted automatically 7 days after you start.</li>
          <li>Your nickname, age group, and goals from onboarding stay on this device only.</li>
          <li>Demo records are labelled as demo data and kept apart from any future real data.</li>
        </ul>
        {session && (
          <p className="mt-3 text-sm font-bold">
            Your current demo data will be deleted automatically on {new Date(session.expiresAt).toLocaleDateString()}.
          </p>
        )}
      </Card>

      <Card>
        <h2 className="text-xl font-black">What we store</h2>
        <dl className="mt-3 space-y-3">
          {STORED.map(([term, desc]) => (
            <div key={term} className="rounded-2xl bg-mist p-4">
              <dt className="font-black">{term}</dt>
              <dd className="text-deep/85">{desc}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-3 text-sm">We don’t sell data, show ads, or use tracking cookies.</p>
      </Card>

      <Card id="delete">
        <h2 className="text-xl font-black">Delete my data</h2>
        <p className="mt-2">
          This permanently deletes your periods, symptoms, checks, and learning progress from our servers, ends your demo
          session, and clears your onboarding details from this device. It can’t be undone.
        </p>
        <ErrorMessage error={error} />
        {done && (
          <p role="status" className="mt-3 rounded-2xl bg-petal p-4 font-bold">
            All done — your data has been deleted.{' '}
            <button type="button" className="underline" onClick={() => navigate('/')}>
              Back to home
            </button>
          </p>
        )}
        {!done && !confirming && (
          <Button className="mt-4" onClick={() => setConfirming(true)}>
            <Trash2 aria-hidden className="size-4" /> Delete all my data
          </Button>
        )}
        {confirming && (
          <div role="alertdialog" aria-labelledby="confirm-title" className="mt-4 rounded-2xl border-2 border-deep p-4">
            <p id="confirm-title" className="font-black">
              Are you sure? This deletes everything{status !== 'active' ? ' stored on this device' : ''}.
            </p>
            <div className="mt-3 flex gap-2">
              <Button onClick={handleDelete}>Yes, delete everything</Button>
              <Button variant="secondary" onClick={() => setConfirming(false)}>
                Cancel
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
