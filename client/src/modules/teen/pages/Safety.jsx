import { Link } from 'react-router-dom';
import { ArrowRight, HandHeart, Phone } from 'lucide-react';
import { api } from '../lib/api';
import { useAsync } from '../lib/useAsync';
import { Card, ErrorMessage, Loading, PageHeader, ReviewNotice, SourceList } from '../components/ui';
import { ModuleIcon } from '../components/ModuleIcon';

const SAFETY_LESSONS = ['consent-and-boundaries', 'body-safety'];

async function loadSafety() {
  const [lessons, helplines] = await Promise.all([
    Promise.all(SAFETY_LESSONS.map((slug) => api.learning.module(slug).then((r) => r.item).catch(() => null))),
    api.guidance.get('safety.helplines').then((r) => r.item).catch(() => null),
  ]);
  return { lessons: lessons.filter(Boolean), helplines };
}

export default function Safety() {
  const { data, error, loading, reload } = useAsync(loadSafety);

  return (
    <div>
      <PageHeader icon={HandHeart} title="Body safety & consent" subtitle="Your body, your boundaries. Know your rights and who you can talk to." />
      {loading && <Loading />}
      <ErrorMessage error={error} onRetry={reload} />

      {data && (
        <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
          <div className="space-y-6">
            {data.lessons.map((m) => (
              <Card key={m.slug}>
                <div className="flex items-center gap-3">
                  <span className="grid size-12 place-items-center rounded-2xl bg-petal">
                    <ModuleIcon name={m.icon} className="size-6" />
                  </span>
                  <h2 className="text-2xl font-black">{m.title}</h2>
                </div>
                <p className="mt-3 text-deep/85">{m.summary}</p>
                <ul className="mt-4 space-y-2">
                  {m.keyPoints.map((k) => (
                    <li key={k} className="rounded-2xl bg-mist px-4 py-3 font-bold">
                      {k}
                    </li>
                  ))}
                </ul>
                <Link to={`/learn/${m.slug}`} className="mt-4 inline-flex items-center gap-1 font-black underline">
                  Read the full lesson & take the quiz <ArrowRight aria-hidden className="size-4" />
                </Link>
              </Card>
            ))}
          </div>

          {data.helplines && (
            <aside className="space-y-4 self-start rounded-3xl bg-deep p-6 text-white">
              <h2 className="flex items-center gap-2 text-xl font-black">
                <Phone aria-hidden className="size-5" /> {data.helplines.title}
              </h2>
              <p className="text-petal">{data.helplines.body}</p>
              <ul className="space-y-2">
                {data.helplines.actions.map((a) => (
                  <li key={a} className="rounded-2xl bg-white/10 p-3 font-bold">
                    {a}
                  </li>
                ))}
              </ul>
              <div className="rounded-2xl bg-white p-4 text-deep">
                <SourceList sources={data.helplines.sources} />
              </div>
              <ReviewNotice status={data.helplines.reviewStatus} />
            </aside>
          )}
        </div>
      )}
    </div>
  );
}
