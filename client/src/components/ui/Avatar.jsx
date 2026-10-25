import { cn } from '../../lib/utils';

const SIZES = {
  sm: 'h-8 w-8 text-[11px]',
  md: 'h-10 w-10 text-xs',
  lg: 'h-12 w-12 text-sm',
};

const Avatar = ({ name = '', size = 'md', className }) => {
  const initials =
    name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('') || 'CS';

  return (
    <span
      className={cn(
        'grid shrink-0 place-items-center rounded-full border border-blush-pink bg-rose-mist font-semibold text-deep-rose',
        SIZES[size],
        className
      )}
      aria-hidden="true"
      title={name}
    >
      {initials}
    </span>
  );
};

export default Avatar;
