import {
  addDays,
  differenceInCalendarDays,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  isValid,
  parseISO,
  subDays,
} from 'date-fns';

export const toISODate = (date) => format(date, 'yyyy-MM-dd');
export const todayISO = () => toISODate(new Date());
export const fromISO = (iso) => (iso ? parseISO(iso) : null);

export const formatDate = (value, pattern = 'd MMM yyyy') => {
  if (!value) return '—';
  const date = typeof value === 'string' ? parseISO(value) : value;
  if (!isValid(date)) return '—';
  return format(date, pattern);
};

export const formatLongDate = (value) => formatDate(value, 'EEEE, d MMMM yyyy');
export const formatMonthYear = (value) => formatDate(value, 'MMMM yyyy');
export const formatShortDate = (value) => formatDate(value, 'd MMM');

export const relativeDay = (iso) => {
  if (!iso) return '';
  const date = parseISO(iso);
  const difference = differenceInCalendarDays(new Date(), date);
  if (difference === 0) return 'Today';
  if (difference === 1) return 'Yesterday';
  if (difference > 1 && difference < 7) return format(date, 'EEEE');
  return format(date, 'd MMM yyyy');
};

export const daysUntil = (iso) => {
  if (!iso) return null;
  return differenceInCalendarDays(parseISO(iso), new Date());
};

export const withinDays = (iso, start, end) => {
  if (!iso) return false;
  return iso >= start && iso <= end;
};

export const isFutureISO = (iso) => iso > todayISO();
export const isPastISO = (iso) => iso < todayISO();

export const calendarRangeFor = (monthDate) =>
  differenceInCalendarDays(monthDate, new Date());

export const monthBounds = (monthDate) => {
  const start = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
  const end = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);
  return { start, end };
};

export {
  addDays,
  differenceInCalendarDays,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  parseISO,
  subDays,
};
