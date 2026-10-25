import { useState } from 'react';
import { Link } from 'react-router-dom';
import { RotateCcw } from 'lucide-react';
import { cn } from '../../lib/utils';

const STATEMENTS = [
  {
    text: 'A healthy cycle is always exactly 28 days.',
    answer: 'myth',
    explanation: '28 days is an average. Adult cycles of 21 to 35 days are common, and length often varies a little each month.',
    articleId: 'understanding-your-cycle',
  },
  {
    text: 'Severe period pain that stops you doing everyday things is worth talking to a doctor about.',
    answer: 'fact',
    explanation: 'Common does not mean you have to put up with it. Pain that disrupts daily life can have treatable causes.',
    articleId: 'pms-common-and-when-to-seek-help',
  },
  {
    text: 'Irregular periods always mean you have PCOS.',
    answer: 'myth',
    explanation: 'Stress, thyroid changes, the first years after a first period and perimenopause can all cause irregular cycles. Only a clinician can confirm PCOS.',
    articleId: 'pcos-awareness',
  },
  {
    text: 'Bleeding after 12 months without a period should be checked promptly.',
    answer: 'fact',
    explanation: 'Bleeding after menopause is not expected. Most causes are not serious, but it should always be assessed.',
    articleId: 'menopause-changing-health-needs',
  },
];

const MythOrFact = () => {
  const [answers, setAnswers] = useState({});
  const answered = Object.keys(answers).length;
  const correct = STATEMENTS.filter((item, index) => answers[index] === item.answer).length;

  return (
    <section aria-labelledby="myth-heading" className="rounded-3xl border border-line bg-white p-6 sm:p-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">Quick check</p>
          <h2 id="myth-heading" className="mt-3 font-display text-[1.75rem] leading-tight text-ink sm:text-[2rem]">
            Myth or fact?
          </h2>
          <p className="mt-2 text-[15px] text-muted">Four statements we hear often. Nothing is saved.</p>
        </div>
        <p className="text-sm text-muted" aria-live="polite">
          {answered === STATEMENTS.length
            ? `You got ${correct} of ${STATEMENTS.length}.`
            : `${answered} of ${STATEMENTS.length} answered`}
        </p>
      </div>

      <ol className="mt-8 divide-y divide-line border-y border-line">
        {STATEMENTS.map((item, index) => {
          const chosen = answers[index];
          const isRight = chosen === item.answer;
          return (
            <li key={item.text} className="grid gap-4 py-6 md:grid-cols-[1fr_auto] md:items-start md:gap-10">
              <div>
                <p className="text-[17px] leading-snug text-ink">{item.text}</p>
                {chosen ? (
                  <div className="mt-3 animate-fade-up text-sm leading-relaxed" aria-live="polite">
                    <p className="font-semibold text-deep-rose">
                      {isRight ? 'Right' : 'Not quite'}: it’s a {item.answer}.
                    </p>
                    <p className="mt-1 text-muted">
                      {item.explanation}{' '}
                      <Link to={`/library/${item.articleId}`} className="link font-medium">
                        Read more
                      </Link>
                    </p>
                  </div>
                ) : null}
              </div>
              <div className="flex gap-2" role="group" aria-label={`Is this a myth or a fact: ${item.text}`}>
                {['myth', 'fact'].map((option) => (
                  <button
                    key={option}
                    type="button"
                    disabled={Boolean(chosen)}
                    aria-pressed={chosen === option}
                    onClick={() => setAnswers((current) => ({ ...current, [index]: option }))}
                    className={cn(
                      'min-h-[44px] min-w-[88px] rounded-lg border px-4 text-sm font-semibold capitalize transition-colors',
                      chosen === option
                        ? 'border-deep-rose bg-deep-rose text-white'
                        : chosen
                          ? 'border-line text-muted'
                          : 'border-blush-pink text-deep-rose hover:border-deep-rose hover:bg-rose-mist'
                    )}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </li>
          );
        })}
      </ol>

      {answered ? (
        <button
          type="button"
          onClick={() => setAnswers({})}
          className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-deep-rose hover:underline"
        >
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          Start again
        </button>
      ) : null}
    </section>
  );
};

export default MythOrFact;
