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
        'grid shrink-0 place-items-center rounded-full bg-gradient-to-br from-pink-glow to-deep-rose font-bold text-white ring-2 ring-white',
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
