export const cn = (...classes) => classes.filter(Boolean).join(' ');

export const initialsOf = (name = '') =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'CS';

export const pluralize = (count, singular, plural) =>
  `${count} ${count === 1 ? singular : plural || `${singular}s`}`;

export const titleCase = (value = '') =>
  value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
