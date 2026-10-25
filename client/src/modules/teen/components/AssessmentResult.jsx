import { AlertOctagon, CheckCircle2, Stethoscope } from 'lucide-react';
import { LEVEL_LABELS } from '../lib/labels';
import { levelStyles } from '../theme/tokens';
import { ReviewNotice, SourceList } from './ui';

const ICONS = { urgent: AlertOctagon, see_doctor: Stethoscope, self_care: CheckCircle2 };

/** Renders guidance returned by the API. All wording comes from the server. */
export function AssessmentResult({ level, guidance }) {
  const Icon = ICONS[level] || CheckCircle2;
  const style = levelStyles[level] || levelStyles.self_care;
  const reasons = guidance.reasons.filter((r) => r.text);

  return (
    <div className="space-y-4">
      <div role={level === 'urgent' ? 'alert' : 'status'} className={`rounded-2xl border p-6 sm:p-8 ${style.container}`}>
        <span className={`inline-flex rounded-md px-2.5 py-1 text-xs font-semibold ${style.badge}`}>
          {LEVEL_LABELS[level]}
        </span>
        <h2 className="mt-4 flex items-center gap-3 font-display text-[1.75rem] leading-tight">
          <Icon aria-hidden className="size-7 shrink-0" /> {guidance.title}
        </h2>
        <p className="mt-2 leading-relaxed">{guidance.body}</p>
        {guidance.actions?.length > 0 && (
          <>
            <h3 className="mt-5 font-semibold">What you can do</h3>
            <ul className="mt-2 list-inside list-disc space-y-1.5 leading-relaxed">
              {guidance.actions.map((a) => (
                <li key={a}>{a}</li>
              ))}
            </ul>
          </>
        )}
      </div>

      {reasons.length > 0 && (
        <div className="card p-5">
          <h3 className="font-semibold text-ink">Why we suggested this</h3>
          <ul className="mt-2 list-inside list-disc space-y-1">
            {reasons.map((r) => (
              <li key={r.code}>{r.text}</li>
            ))}
          </ul>
        </div>
      )}

      <p className="rounded-xl border border-petal bg-mist p-4 text-sm">
        This check is not a diagnosis. It helps you decide on next steps. Only a doctor or nurse can tell you what is causing your
        symptoms.
      </p>
      <ReviewNotice status={guidance.reviewStatus} />
      <SourceList sources={guidance.sources} />
    </div>
  );
}
