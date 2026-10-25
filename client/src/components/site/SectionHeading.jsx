import { cn } from '../../lib/utils';

const SectionHeading = ({ id, eyebrow, title, description, align = 'left', as: Tag = 'h2', className, children }) => (
  <div className={cn('max-w-2xl', align === 'center' && 'mx-auto text-center', className)}>
    {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
    <Tag id={id} className="mt-3 font-display text-[2rem] leading-[1.1] text-ink sm:text-[2.5rem]">{title}</Tag>
    {description ? <p className="mt-4 text-base leading-relaxed text-muted sm:text-lg">{description}</p> : null}
    {children}
  </div>
);

export default SectionHeading;
