import { Check } from 'lucide-react';

/** Generic renderer for server-defined assessment questions. */
export function QuestionField({ question: q, value, onChange }) {
  const id = `q-${q.id}`;

  if (q.kind === 'scale') {
    const v = value ?? Math.round((q.min + q.max) / 2);
    return (
      <div>
        <label htmlFor={id} className="block text-xl font-black">
          {q.prompt}
        </label>
        {q.help && <p className="mt-1 text-sm text-deep/80">{q.help}</p>}
        <p className="mt-4 text-center text-5xl font-black text-rose" aria-hidden>
          {value ?? '–'}
        </p>
        <input
          id={id}
          type="range"
          min={q.min}
          max={q.max}
          step={1}
          value={v}
          onChange={(e) => onChange(Number(e.target.value))}
          onClick={(e) => onChange(Number(e.currentTarget.value))}
          onKeyUp={(e) => onChange(Number(e.currentTarget.value))}
          className="mt-2 w-full accent-deep"
        />
        <div className="flex justify-between text-xs font-bold text-deep/70">
          <span>{q.min} · none</span>
          <span>{q.max} · worst</span>
        </div>
      </div>
    );
  }

  if (q.kind === 'number') {
    return (
      <div>
        <label htmlFor={id} className="block text-xl font-black">
          {q.prompt}
        </label>
        {q.help && <p className="mt-1 text-sm text-deep/80">{q.help}</p>}
        <input
          id={id}
          type="number"
          inputMode="numeric"
          min={q.min}
          max={q.max}
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value === '' ? null : Number(e.target.value))}
          className="mt-4 w-40 rounded-2xl border-2 border-blush bg-white px-4 py-3 text-2xl font-black focus:border-deep focus:outline-none"
        />
      </div>
    );
  }

  const multi = q.kind === 'multi';
  const selected = multi ? value || [] : value;
  const toggle = (v) => {
    if (!multi) return onChange(v);
    onChange(selected.includes(v) ? selected.filter((x) => x !== v) : [...selected, v]);
  };

  return (
    <fieldset>
      <legend className="text-xl font-black">{q.prompt}</legend>
      {q.help && <p className="mt-1 text-sm text-deep/80">{q.help}</p>}
      <div className="mt-4 grid gap-2">
        {q.options.map((o) => {
          const on = multi ? selected.includes(o.value) : selected === o.value;
          return (
            <button
              key={o.value}
              type="button"
              role={multi ? 'checkbox' : 'radio'}
              aria-checked={on}
              onClick={() => toggle(o.value)}
              className={`flex items-center gap-3 rounded-2xl border-2 px-4 py-3 text-left font-bold transition-colors ${
                on ? 'border-deep bg-deep text-white' : 'border-blush bg-white hover:border-rose'
              }`}
            >
              <span className={`grid size-5 shrink-0 place-items-center border-2 ${multi ? 'rounded' : 'rounded-full'} ${on ? 'border-white' : 'border-blush'}`}>
                {on && <Check aria-hidden className="size-3.5" />}
              </span>
              {o.label}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

/** Is the answer complete enough to continue? Multi-selects may be empty. */
export function isAnswered(q, value) {
  if (q.kind === 'multi') return true;
  if (q.kind === 'scale' || q.kind === 'number') return Number.isInteger(value) && value >= q.min && value <= q.max;
  return value !== undefined && value !== null;
}
