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
      <div role={level === 'urgent' ? 'alert' : 'status'} className={`rounded-3xl border-2 p-6 ${style.container}`}>
        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-black uppercase tracking-wide ${style.badge}`}>
          {LEVEL_LABELS[level]}
        </span>
        <h2 className="mt-3 flex items-center gap-2 text-2xl font-black">
          <Icon aria-hidden className="size-7 shrink-0" /> {guidance.title}
        </h2>
        <p className="mt-2 leading-relaxed">{guidance.body}</p>
        {guidance.actions?.length > 0 && (
          <>
            <h3 className="mt-4 font-black">What you can do</h3>
            <ul className="mt-1 list-inside list-disc space-y-1">
              {guidance.actions.map((a) => (
                <li key={a}>{a}</li>
              ))}
            </ul>
          </>
        )}
      </div>

      {reasons.length > 0 && (
        <div className="card p-5">
          <h3 className="font-black">Why we suggested this</h3>
          <ul className="mt-2 list-inside list-disc space-y-1">
            {reasons.map((r) => (
              <li key={r.code}>{r.text}</li>
            ))}
          </ul>
        </div>
      )}

      <p className="rounded-2xl bg-petal p-4 text-sm font-semibold">
        This check is not a diagnosis. It helps you decide on next steps. Only a doctor or nurse can tell you what is causing your
        symptoms.
      </p>
      <ReviewNotice status={guidance.reviewStatus} />
      <SourceList sources={guidance.sources} />
    </div>
  );
}
