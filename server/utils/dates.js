export const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export const isValidISODate = (value) => {
  if (typeof value !== 'string' || !ISO_DATE_RE.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
};

export const toUTC = (isoDate) => {
  const [year, month, day] = isoDate.split('-').map(Number);
  return Date.UTC(year, month - 1, day);
};

export const toISODate = (date) => {
  const d = new Date(date);
  return [
    d.getUTCFullYear(),
    String(d.getUTCMonth() + 1).padStart(2, '0'),
    String(d.getUTCDate()).padStart(2, '0'),
  ].join('-');
};

export const todayISO = () => toISODate(new Date());

export const addDays = (isoDate, days) => {
  const date = new Date(toUTC(isoDate));
  date.setUTCDate(date.getUTCDate() + days);
  return toISODate(date);
};

export const diffDays = (fromDate, toDate) =>
  Math.round((toUTC(toDate) - toUTC(fromDate)) / 86400000);

export const minDate = (a, b) => (a < b ? a : b);
export const maxDate = (a, b) => (a > b ? a : b);

export const clampRange = (startDate, endDate, fallbackDays = 180) => {
  const end = isValidISODate(endDate) ? endDate : todayISO();
  const start = isValidISODate(startDate) ? startDate : addDays(end, -fallbackDays);
  return start <= end ? { start, end } : { start: end, end: start };
};

export const monthsAgoISO = (months) => {
  const now = new Date();
  const date = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - months, now.getUTCDate()));
  return toISODate(date);
};
