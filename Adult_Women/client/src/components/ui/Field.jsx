import { cn } from '../../lib/utils';

const Field = ({
  label,
  htmlFor,
  hint,
  error,
  required,
  children,
  className,
  optional,
}) => (
  <div className={cn('w-full', className)}>
    {label ? (
      <label htmlFor={htmlFor} className="field-label">
        {label}
        {required ? <span className="ml-0.5 text-pink-glow">*</span> : null}
        {optional ? <span className="ml-1.5 font-medium normal-case text-muted">(optional)</span> : null}
      </label>
    ) : null}
    {children}
    {error ? (
      <p className="mt-1.5 text-xs font-medium text-deep-rose" role="alert">
        {error}
      </p>
    ) : hint ? (
      <p className="field-hint">{hint}</p>
    ) : null}
  </div>
);

export default Field;
