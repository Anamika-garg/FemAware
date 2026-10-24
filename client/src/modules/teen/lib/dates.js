/**
 * Date helpers. All health dates are stored as UTC midnight "calendar days"
 * (YYYY-MM-DD), so we work with ISO day strings to avoid time-zone drift.
 */
const DAY = 86_400_000;

export const toIsoDay = (date) => {
  const d = new Date(date);
  return new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())).toISOString().slice(0, 10);
};

/** ISO day string for an API date (already UTC midnight). */
export const apiDay = (value) => (value ? String(value).slice(0, 10) : null);

export const todayIso = () => toIsoDay(new Date());

export const addDays = (iso, n) => new Date(Date.parse(`${iso}T00:00:00Z`) + n * DAY).toISOString().slice(0, 10);

export const diffDays = (a, b) => Math.round((Date.parse(`${a}T00:00:00Z`) - Date.parse(`${b}T00:00:00Z`)) / DAY);

export function formatDay(iso, opts = { day: 'numeric', month: 'short' }) {
  if (!iso) return '—';
  return new Date(`${apiDay(iso)}T00:00:00Z`).toLocaleDateString(undefined, { timeZone: 'UTC', ...opts });
}

/** 6x7 grid of ISO days for a month view, weeks starting Monday. */
export function buildMonthGrid(year, month) {
  const first = new Date(Date.UTC(year, month, 1));
  const offset = (first.getUTCDay() + 6) % 7;
  const start = new Date(first.getTime() - offset * DAY);
  return Array.from({ length: 42 }, (_, i) => {
    const iso = new Date(start.getTime() + i * DAY).toISOString().slice(0, 10);
    return { iso, inMonth: new Date(`${iso}T00:00:00Z`).getUTCMonth() === month, day: Number(iso.slice(8)) };
  });
}

/** Is an ISO day inside a period entry? Open entries count only their start day. */
export function entryCoversDay(entry, iso) {
  const start = apiDay(entry.startDate);
  const end = apiDay(entry.endDate) || start;
  return iso >= start && iso <= end;
}
