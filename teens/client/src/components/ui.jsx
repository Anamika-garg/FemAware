import { Link } from 'react-router-dom';
import { AlertCircle, ExternalLink, Loader2, Sparkles } from 'lucide-react';
import { REVIEW_LABELS } from '../lib/labels';
import { useSession } from '../context/SessionContext';

const variants = {
  primary: 'bg-deep text-white hover:bg-rose shadow-soft',
  secondary: 'bg-white text-deep border-2 border-blush hover:border-rose',
  soft: 'bg-petal text-deep hover:bg-blush',
  ghost: 'text-deep hover:bg-petal',
};
const sizes = { sm: 'px-3 py-1.5 text-sm', md: 'px-5 py-2.5', lg: 'px-7 py-3.5 text-lg' };

const buttonClass = (variant = 'primary', size = 'md', className = '') =>
  `inline-flex items-center justify-center gap-2 rounded-full font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`;

export function Button({ variant, size, className, ...props }) {
  return <button type="button" className={buttonClass(variant, size, className)} {...props} />;
}

export function LinkButton({ variant, size, className, ...props }) {
  return <Link className={buttonClass(variant, size, className)} {...props} />;
}

export function Card({ className = '', as: Tag = 'section', ...props }) {
  return <Tag className={`card p-5 sm:p-6 ${className}`} {...props} />;
}

export function PageHeader({ icon: Icon, title, subtitle, children }) {
  return (
    <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex items-start gap-4">
        {Icon && (
          <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-petal text-deep">
            <Icon aria-hidden className="size-7" />
          </span>
        )}
        <div>
          <h1 className="text-3xl font-black tracking-tight sm:text-4xl">{title}</h1>
          {subtitle && <p className="mt-1 max-w-2xl text-deep/80">{subtitle}</p>}
        </div>
      </div>
      {children && <div className="flex flex-wrap gap-2">{children}</div>}
    </header>
  );
}

export function Badge({ children, className = 'bg-petal text-deep' }) {
  return <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${className}`}>{children}</span>;
}

export function Loading({ label = 'Loading…' }) {
  return (
    <div role="status" className="flex items-center justify-center gap-2 py-12 text-rose">
      <Loader2 aria-hidden className="size-5 animate-spin" />
      <span className="font-semibold">{label}</span>
    </div>
  );
}

export function ErrorMessage({ error, onRetry }) {
  if (!error) return null;
  return (
    <div role="alert" className="flex flex-wrap items-center gap-3 rounded-2xl border-2 border-rose bg-petal p-4 font-semibold">
      <AlertCircle aria-hidden className="size-5 shrink-0" />
      <span className="flex-1">{error.message || String(error)}</span>
      {onRetry && (
        <Button size="sm" variant="secondary" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}

export function FieldErrors({ error }) {
  if (!error?.details) return null;
  return (
    <ul className="mt-2 list-inside list-disc text-sm font-semibold">
      {Object.values(error.details).map((msg) => (
        <li key={msg}>{msg}</li>
      ))}
    </ul>
  );
}

export function EmptyState({ icon: Icon = Sparkles, title, children }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-blush p-8 text-center">
      <Icon aria-hidden className="size-8 text-glow" />
      <p className="font-bold">{title}</p>
      {children && <div className="text-sm text-deep/80">{children}</div>}
    </div>
  );
}

/** Wraps pages that need a demo session (tracking, insights). */
export function SessionGate({ children, feature = 'this feature' }) {
  const { status } = useSession();
  if (status === 'loading') return <Loading />;
  if (status === 'none') {
    return (
      <Card className="mx-auto max-w-xl text-center">
        <Sparkles aria-hidden className="mx-auto size-10 text-glow" />
        <h2 className="mt-3 text-2xl font-black">Start your demo first</h2>
        <p className="mt-2 text-deep/80">
          To use {feature}, start a free demo session. No account, no email — and you can delete everything any time.
        </p>
        <LinkButton to="/onboarding" className="mt-5">
          Start demo
        </LinkButton>
      </Card>
    );
  }
  return children;
}

export function ReviewNotice({ status }) {
  if (!status || status === 'clinician_reviewed') {
    return status ? <Badge>{REVIEW_LABELS[status]}</Badge> : null;
  }
  return (
    <p className="rounded-xl bg-petal px-3 py-2 text-xs font-semibold">
      {REVIEW_LABELS[status] || status}. This educational content has been drafted from public health sources and is waiting
      for review by a qualified clinician.
    </p>
  );
}

export function SourceList({ sources }) {
  if (!sources?.length) return null;
  return (
    <div>
      <h3 className="text-sm font-black uppercase tracking-wide text-rose">Sources</h3>
      <ul className="mt-2 space-y-1 text-sm">
        {sources.map((s) => (
          <li key={s.url}>
            <a href={s.url} target="_blank" rel="noreferrer" className="inline-flex items-start gap-1 underline decoration-blush underline-offset-2 hover:decoration-deep">
              <span>
                {s.title} — <span className="text-deep/70">{s.publisher}</span>
              </span>
              <ExternalLink aria-hidden className="mt-0.5 size-3.5 shrink-0" />
              <span className="sr-only">(opens in a new tab)</span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ProgressBar({ value, max = 100, label }) {
  const pct = Math.max(0, Math.min(100, Math.round((value / max) * 100)));
  return (
    <div role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label={label} className="h-3 w-full overflow-hidden rounded-full bg-petal">
      <div className="h-full rounded-full bg-linear-to-r from-glow to-deep transition-all" style={{ width: `${pct}%` }} />
    </div>
  );
}
