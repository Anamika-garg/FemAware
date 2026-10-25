import { Link } from 'react-router-dom';
import { BookHeart, CheckCircle2, Clock, Lock, Star, Zap } from 'lucide-react';
import { api } from '../lib/api';
import { useAsync } from '../lib/useAsync';
import { Badge, Card, ErrorMessage, Loading, PageHeader, ProgressBar } from '../components/ui';
import { ModuleIcon } from '../components/ModuleIcon';

export default function Learn() {
  const modules = useAsync(() => api.learning.modules());
  const progress = useAsync(() => api.learning.progress());

  const p = progress.data?.progress;
  const done = new Map((p?.completedModules || []).map((m) => [m.slug, m]));

  return (
    <div>
      <PageHeader icon={BookHeart} title="Learn" subtitle="Short lessons, quick quizzes. Earn XP and badges as you go." />

      {p && (
        <Card className="mb-6">
          <div className="flex flex-wrap items-center gap-6">
            <div>
              <p className="text-xs font-semibold text-rose">Level</p>
              <p className="text-3xl font-display text-ink">{p.level}</p>
            </div>
            <div className="min-w-48 flex-1">
              <p className="mb-1 text-sm font-semibold">
                {p.completedModules.length} of {p.totalModules} lessons complete · {p.xp} XP
              </p>
              <ProgressBar value={p.completedModules.length} max={p.totalModules || 1} label="Lessons completed" />
            </div>
          </div>
          <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {p.availableAchievements.map((a) => {
              const earned = p.achievements.some((e) => e.code === a.code);
              return (
                <li key={a.code} className={`flex items-center gap-3 rounded-2xl p-3 ${earned ? 'bg-deep text-white' : 'bg-mist'}`}>
                  {earned ? <Star aria-hidden className="size-5 fill-current" /> : <Lock aria-hidden className="size-5 text-blush" />}
                  <span>
                    <span className="block text-sm font-semibold">{a.title}</span>
                    <span className={`block text-xs ${earned ? 'text-petal' : 'text-muted'}`}>
                      {a.description}
                      {!earned && <span className="sr-only"> (locked)</span>}
                    </span>
                  </span>
                </li>
              );
            })}
          </ul>
        </Card>
      )}

      {modules.loading && <Loading label="Loading lessons…" />}
      <ErrorMessage error={modules.error} onRetry={modules.reload} />
      {modules.data && (
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {modules.data.items.map((m) => {
            const completed = done.get(m.slug);
            return (
              <li key={m.slug}>
                <Link to={`/learn/${m.slug}`} className="card flex h-full flex-col p-6 transition-transform">
                  <div className="flex items-start justify-between">
                    <span className="grid size-12 place-items-center rounded-2xl bg-petal">
                      <ModuleIcon name={m.icon} className="size-6" />
                    </span>
                    {completed && (
                      <Badge className="bg-deep text-white">
                        <CheckCircle2 aria-hidden className="size-3.5" /> {completed.bestScore}%
                      </Badge>
                    )}
                  </div>
                  <h2 className="mt-4 text-lg font-display text-ink">{m.title}</h2>
                  <p className="mt-1 flex-1 text-muted">{m.summary}</p>
                  <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold">
                    <Badge>
                      <Clock aria-hidden className="size-3.5" /> {m.estimatedMinutes} min
                    </Badge>
                    <Badge>
                      <Zap aria-hidden className="size-3.5" /> {m.xpReward} XP
                    </Badge>
                    <Badge>{m.questionCount} questions</Badge>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
      {modules.data?.items.length === 0 && (
        <p className="text-center font-semibold">No lessons are available yet. Lessons appear here once they’ve been clinically reviewed.</p>
      )}
    </div>
  );
}
