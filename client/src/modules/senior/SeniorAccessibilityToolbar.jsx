import { useEffect, useState } from 'react';
import { Accessibility, Check } from 'lucide-react';
import { cn } from '../../lib/utils';

const STORAGE_KEY = 'femaware_senior_font_scale';

const TEXT_SIZES = [
  { value: 'standard', label: 'Standard', short: 'A' },
  { value: 'large', label: 'Large', short: 'A+' },
  { value: 'xlarge', label: 'Extra large', short: 'A++' },
];

const readScale = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return TEXT_SIZES.some((option) => option.value === saved) ? saved : 'standard';
  } catch {
    return 'standard';
  }
};

const SeniorAccessibilityToolbar = () => {
  const [scale, setScale] = useState(readScale);

  useEffect(() => {
    document.documentElement.setAttribute('data-senior-font-scale', scale);
    window.dispatchEvent(new CustomEvent('femaware:font-scale', { detail: scale }));
    try {
      localStorage.setItem(STORAGE_KEY, scale);
    } catch {
      // The preference simply will not persist if storage is unavailable.
    }
  }, [scale]);

  return (
    <section
      aria-label="Accessibility toolbar"
      className="sticky top-[74px] z-20 rounded-2xl border-2 border-blush-pink bg-white/95 p-3.5 shadow-soft sm:top-[78px] sm:p-4"
    >
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-2.5">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-soft-petal text-deep-rose">
            <Accessibility className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <p className="text-sm font-semibold text-deep-rose">Text size</p>
            <p className="text-xs text-muted">Choose what feels most comfortable to read.</p>
          </div>
        </div>

        <div
          className="grid grid-cols-3 gap-2"
          role="group"
          aria-label="Choose a text size"
        >
          {TEXT_SIZES.map((option) => {
            const active = scale === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setScale(option.value)}
                aria-pressed={active}
                className={cn(
                  'flex min-h-[48px] items-center justify-center gap-1.5 rounded-xl border-2 px-3 py-2 text-sm font-semibold transition-colors',
                  active
                    ? 'border-deep-rose bg-deep-rose text-white'
                    : 'border-blush-pink bg-white text-deep-rose hover:border-pink-glow hover:bg-soft-petal/60'
                )}
              >
                {active ? <Check className="h-4 w-4" aria-hidden="true" /> : null}
                <span className="text-base leading-none" aria-hidden="true">
                  {option.short}
                </span>
                <span className="sr-only sm:not-sr-only">{option.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default SeniorAccessibilityToolbar;
