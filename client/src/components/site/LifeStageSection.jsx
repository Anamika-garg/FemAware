import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { StageMotif } from './Illustrations';
import SectionHeading from './SectionHeading';
import { SITE_STAGES } from '../../data/stages';
import { cn } from '../../lib/utils';

const LifeStageSection = () => (
  <section aria-labelledby="stages-heading" className="py-16 sm:py-20">
    <div className="site-container">
      <SectionHeading
        id="stages-heading"
        eyebrow="Life stages"
        title="Your health journey, at every stage."
        description="Each stage has its own tools and reading. Age ranges are a starting point, not a gate: every resource is open to everyone."
      />

      <div className="mt-12 grid overflow-hidden rounded-3xl border border-line md:grid-cols-3">
        {SITE_STAGES.map((stage, index) => (
          <article
            key={stage.value}
            className={cn(
              'flex flex-col p-7 sm:p-8',
              index > 0 && 'border-t border-line md:border-l md:border-t-0',
              stage.value === 'adult' ? 'bg-rose-mist' : 'bg-white'
            )}
          >
            <div className="flex items-start justify-between gap-4">
              <span
                className={cn(
                  'grid h-20 w-20 place-items-center rounded-full',
                  stage.value === 'adult' ? 'bg-white' : 'bg-rose-mist'
                )}
              >
                <StageMotif stage={stage.value} className="h-14 w-14" />
              </span>
              <span className="rounded-md border border-blush-pink bg-white px-2.5 py-1 text-xs font-semibold text-deep-rose" aria-hidden="true">
                Ages {stage.ages}
              </span>
            </div>
            <h3 className="mt-6 font-display text-[1.75rem] leading-tight text-ink">{stage.title}</h3>
            <p className="mt-1 text-sm font-semibold text-deep-rose">{stage.theme}</p>
            <p className="sr-only">Usually ages {stage.ages}</p>
            <p className="mt-4 text-[15px] leading-relaxed text-muted">{stage.description}</p>
            <ul className="mt-6 space-y-2.5 border-t border-line pt-5">
              {stage.features.map((feature) => (
                <li key={feature} className="flex gap-3 text-sm text-ink">
                  <span className="mt-[9px] h-px w-3 shrink-0 bg-deep-rose" aria-hidden="true" />
                  {feature}
                </li>
              ))}
            </ul>
            <Link
              to={`/explore#${stage.value}`}
              className="group mt-auto inline-flex items-center gap-2 pt-8 text-sm font-semibold text-deep-rose"
            >
              Explore resources
              <span className="sr-only">for {stage.title.toLowerCase()}</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
            </Link>
          </article>
        ))}
      </div>
    </div>
  </section>
);

export default LifeStageSection;
