import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Clock, Lightbulb, Zap } from 'lucide-react';
import { api } from '../lib/api';
import { useAsync } from '../lib/useAsync';
import { Badge, Card, ErrorMessage, Loading, ReviewNotice, SourceList } from '../components/ui';
import { ModuleIcon } from '../components/ModuleIcon';
import { Quiz } from '../components/Quiz';

export default function Lesson() {
  const { slug } = useParams();
  const { data, error, loading, reload } = useAsync(() => api.learning.module(slug), [slug]);

  if (loading) return <Loading label="Loading lesson…" />;
  if (error) return <ErrorMessage error={error} onRetry={error.status === 404 ? undefined : reload} />;

  const m = data.item;
  return (
    <article className="mx-auto max-w-3xl">
      <Link to="/learn" className="mb-4 inline-flex items-center gap-1 font-bold">
        <ArrowLeft aria-hidden className="size-4" /> All lessons
      </Link>
      <header className="mb-6 flex items-start gap-4">
        <span className="grid size-16 shrink-0 place-items-center rounded-2xl bg-deep text-petal">
          <ModuleIcon name={m.icon} className="size-8" />
        </span>
        <div>
          <h1 className="text-3xl font-display font-semibold text-deep-rose sm:text-4xl">{m.title}</h1>
          <p className="mt-1 text-muted">{m.summary}</p>
          <div className="mt-2 flex gap-2">
            <Badge>
              <Clock aria-hidden className="size-3.5" /> {m.estimatedMinutes} min
            </Badge>
            <Badge>
              <Zap aria-hidden className="size-3.5" /> up to {m.xpReward} XP
            </Badge>
          </div>
        </div>
      </header>

      <div className="mb-6">
        <ReviewNotice status={m.reviewStatus} />
      </div>

      <div className="space-y-4">
        {m.sections.map((s) => (
          <Card key={s.heading}>
            <h2 className="text-xl font-display font-semibold text-deep-rose">{s.heading}</h2>
            <p className="mt-2 leading-relaxed">{s.body}</p>
          </Card>
        ))}
      </div>

      {m.keyPoints?.length > 0 && (
        <aside className="mt-6 rounded-3xl bg-deep p-6 text-white">
          <h2 className="flex items-center gap-2 text-lg font-display font-semibold text-deep-rose">
            <Lightbulb aria-hidden className="size-5" /> Key points
          </h2>
          <ul className="mt-3 list-inside list-disc space-y-1 text-petal">
            {m.keyPoints.map((k) => (
              <li key={k}>{k}</li>
            ))}
          </ul>
        </aside>
      )}

      <section className="mt-10" aria-labelledby="quiz-heading">
        <h2 id="quiz-heading" className="mb-4 text-2xl font-display font-semibold text-deep-rose">
          Quiz time
        </h2>
        <Quiz key={m.slug} questions={m.quiz} onSubmit={(answers) => api.learning.submitQuiz(m.slug, answers)} />
      </section>

      <div className="mt-10">
        <SourceList sources={m.sources} />
      </div>
    </article>
  );
}
