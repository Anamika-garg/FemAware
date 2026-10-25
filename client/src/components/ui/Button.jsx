import { Link } from 'react-router-dom';
import { cn } from '../../lib/utils';

const VARIANTS = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  ghost: 'btn-ghost',
  danger: 'btn-danger',
  soft: 'btn bg-rose-mist text-deep-rose hover:bg-soft-petal',
  dark: 'btn bg-ink text-white hover:bg-[#1f1219]',
};

const SIZES = {
  sm: 'btn-sm',
  md: '',
  lg: 'btn-lg',
};

const Button = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon: Icon,
  iconRight: IconRight,
  children,
  className,
  disabled,
  type = 'button',
  ...props
}) => {
  return (
    <button
      type={type}
      className={cn(VARIANTS[variant] || VARIANTS.primary, SIZES[size], className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? (
        <span
          className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
          aria-hidden="true"
        />
      ) : Icon ? (
        <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
      ) : null}
      {children}
      {IconRight && !loading ? <IconRight className="h-4 w-4 shrink-0" aria-hidden="true" /> : null}
    </button>
  );
};

// A router link styled as a button, for navigation that should read as an action.
export const ButtonLink = ({
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconRight: IconRight,
  children,
  className,
  ...props
}) => (
  <Link className={cn(VARIANTS[variant] || VARIANTS.primary, SIZES[size], className)} {...props}>
    {Icon ? <Icon className="h-4 w-4 shrink-0" aria-hidden="true" /> : null}
    {children}
    {IconRight ? <IconRight className="h-4 w-4 shrink-0" aria-hidden="true" /> : null}
  </Link>
);

export const PrimaryButton = (props) => <ButtonLink variant="primary" {...props} />;
export const SecondaryButton = (props) => <ButtonLink variant="secondary" {...props} />;

export default Button;
