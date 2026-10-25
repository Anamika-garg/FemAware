/**
 * Resolve the API root from `VITE_API_URL`.
 *
 * Deployments are often configured with just the origin
 * (`https://api.example.com`) while every Express route lives under `/api`.
 * Accept both forms so a missing suffix cannot turn every request into a 404.
 */
export const resolveApiBase = (value) => {
  const configured = value === undefined ? import.meta.env.VITE_API_URL : value;
  const trimmed = String(configured || '')
    .trim()
    .replace(/\/+$/, '');

  if (!trimmed) return '/api';
  return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
};
