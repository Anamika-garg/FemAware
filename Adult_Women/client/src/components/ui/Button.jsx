import { cn } from '../../lib/utils';

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
  const variants = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    ghost: 'btn-ghost',
    danger: 'btn-danger',
    soft: 'btn bg-soft-petal/80 text-deep-rose hover:bg-blush-pink',
    dark: 'btn bg-ink text-white hover:bg-[#2a1720]',
  };
  const sizes = {
    sm: 'btn-sm',
    md: '',
    lg: 'btn-lg',
  };

  return (
    <button
      type={type}
      className={cn(variants[variant] || variants.primary, sizes[size], className)}
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

export default Button;
