import { cn } from '../../lib/utils';

const Toggle = ({ checked, onChange, label, description, id, disabled = false }) => (
  <label
    htmlFor={id}
    className={cn(
      'flex items-start justify-between gap-4',
      disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'
    )}
  >
    <span>
      <span className="block text-sm font-semibold text-ink">{label}</span>
      {description ? <span className="mt-0.5 block text-xs leading-relaxed text-muted">{description}</span> : null}
    </span>
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange?.(!checked)}
      className={cn(
        'relative mt-0.5 inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors',
        checked ? 'bg-pink-glow' : 'bg-blush-pink'
      )}
    >
      <span
        className={cn(
          'inline-block h-[18px] w-[18px] transform rounded-full bg-white shadow transition-transform',
          checked ? 'translate-x-[22px]' : 'translate-x-[3px]'
        )}
      />
    </button>
  </label>
);

export default Toggle;
