import { useState } from 'react';
import { CheckCircle2, RotateCcw, Star, XCircle, Zap } from 'lucide-react';
import { Button, ErrorMessage } from './ui';

/**
 * Renders quiz questions (without answers — the server scores them) and the
 * per-question feedback returned after submission.
 */
export function Quiz({ questions, onSubmit }) {
  const [answers, setAnswers] = useState(() => questions.map(() => null));
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const allAnswered = answers.every((a) => a !== null);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      setResult(await onSubmit(answers));
    } catch (err) {
      setError(err);
    } finally {
      setBusy(false);
    }
  }

  function retry() {
    setAnswers(questions.map(() => null));
    setResult(null);
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      {result && <QuizResult result={result} onRetry={retry} />}

      {questions.map((q, qi) => {
        const feedback = result?.results[qi];
        return (
          <fieldset key={q.index} className="rounded-2xl border-2 border-petal bg-white p-5" disabled={Boolean(result)}>
            <legend className="px-1 font-black">
              {qi + 1}. {q.prompt}
            </legend>
            <div className="mt-2 grid gap-2">
              {q.options.map((opt, oi) => {
                const chosen = answers[qi] === oi;
                let tone = chosen ? 'border-deep bg-petal' : 'border-blush hover:border-rose';
                if (feedback) {
                  if (oi === feedback.correctIndex) tone = 'border-deep bg-deep text-white';
                  else if (chosen) tone = 'border-rose bg-petal line-through';
                  else tone = 'border-petal opacity-70';
                }
                return (
                  <label key={opt} className={`flex cursor-pointer items-center gap-3 rounded-xl border-2 px-4 py-3 font-semibold ${tone}`}>
                    <input
                      type="radio"
                      name={`q-${qi}`}
                      className="size-4 accent-deep"
                      checked={chosen}
                      onChange={() => setAnswers((prev) => prev.map((a, i) => (i === qi ? oi : a)))}
                    />
                    {opt}
                    {feedback && oi === feedback.correctIndex && <span className="sr-only"> (correct answer)</span>}
                  </label>
                );
              })}
            </div>
            {feedback && (
              <p className="mt-3 flex items-start gap-2 rounded-xl bg-mist p-3 text-sm">
                {feedback.correct ? (
                  <CheckCircle2 aria-hidden className="size-5 shrink-0" />
                ) : (
                  <XCircle aria-hidden className="size-5 shrink-0 text-rose" />
                )}
                <span>
                  <strong>{feedback.correct ? 'Correct! ' : 'Not quite. '}</strong>
                  {feedback.explanation}
                </span>
              </p>
            )}
          </fieldset>
        );
      })}

      <ErrorMessage error={error} />
      {!result && (
        <Button type="submit" size="lg" disabled={!allAnswered || busy}>
          {busy ? 'Checking…' : allAnswered ? 'Check my answers' : `Answer all ${questions.length} questions`}
        </Button>
      )}
    </form>
  );
}

function QuizResult({ result, onRetry }) {
  return (
    <div role="status" className={`rounded-3xl p-6 ${result.passed ? 'bg-deep text-white' : 'bg-petal'}`}>
      <p className="text-4xl font-black">{result.score}%</p>
      <p className="mt-1 font-bold">
        {result.correctCount} of {result.total} correct — {result.passed ? 'lesson complete!' : 'score 70% or more to complete this lesson.'}
      </p>
      {result.saved && result.xpGained > 0 && (
        <p className="mt-2 inline-flex items-center gap-1 font-black">
          <Zap aria-hidden className="size-4" /> +{result.xpGained} XP
        </p>
      )}
      {result.newAchievements?.map((a) => (
        <p key={a.code} className="mt-2 flex items-center gap-2 font-black">
          <Star aria-hidden className="size-4 fill-current" /> Badge unlocked: {a.title}
        </p>
      ))}
      <Button variant={result.passed ? 'soft' : 'primary'} size="sm" className="mt-4" onClick={onRetry}>
        <RotateCcw aria-hidden className="size-4" /> Try again
      </Button>
    </div>
  );
}
