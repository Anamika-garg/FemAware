import { Link } from 'react-router-dom';
import { BookOpen, HeartHandshake, Lock, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import PageHeader from '../../components/ui/PageHeader';
import Badge from '../../components/ui/Badge';

/**
 * Teen dashboard placeholder.
 *
 * The life-stage router needs a teen experience to render. This page keeps the
 * shared shell, privacy messaging and safe language in place while the fuller
 * teen module is designed with age-appropriate clinical review.
 */
const TeenDashboard = () => {
  const { user } = useAuth();
  const firstName = user?.name?.split(' ')[0] || 'there';

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Teen space"
        title={`Welcome, ${firstName}`}
        description="A calm place to learn about your body, your cycle and what feels normal for you."
        actions={<Badge tone="pink" icon={Sparkles}>Growing module</Badge>}
      />

      <section className="grid gap-4 md:grid-cols-2">
        <Link
          to="/resources"
          className="group rounded-2xl border border-blush-pink/70 bg-white p-5 shadow-soft transition-all hover:-translate-y-0.5 hover:border-pink-glow/50 hover:shadow-card"
        >
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-soft-petal text-deep-rose">
            <BookOpen className="h-5 w-5" aria-hidden="true" />
          </span>
          <h2 className="mt-4 font-display text-lg font-semibold text-deep-rose">
            Learn at your own pace
          </h2>
          <p className="mt-1.5 text-sm leading-relaxed text-muted">
            Clear, reviewed articles about cycles, feelings and looking after yourself.
          </p>
        </Link>

        <Link
          to="/privacy"
          className="group rounded-2xl border border-blush-pink/70 bg-white p-5 shadow-soft transition-all hover:-translate-y-0.5 hover:border-pink-glow/50 hover:shadow-card"
        >
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-soft-petal text-deep-rose">
            <Lock className="h-5 w-5" aria-hidden="true" />
          </span>
          <h2 className="mt-4 font-display text-lg font-semibold text-deep-rose">
            Your privacy comes first
          </h2>
          <p className="mt-1.5 text-sm leading-relaxed text-muted">
            Review what you share, export your data, or delete it whenever you choose.
          </p>
        </Link>
      </section>

      <section className="rounded-2xl border border-blush-pink/60 bg-soft-petal/40 p-5">
        <div className="flex items-start gap-3">
          <HeartHandshake className="mt-0.5 h-5 w-5 shrink-0 text-deep-rose" aria-hidden="true" />
          <p className="text-sm leading-relaxed text-ink">
            If something feels painful, worrying or unusual, talking to a trusted adult or
            clinician is always okay. CycleSense offers information, not diagnosis.
          </p>
        </div>
      </section>
    </div>
  );
};

export default TeenDashboard;
