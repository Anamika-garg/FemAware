import { clearToken, getToken } from '../../../lib/api';
import { resolveApiBase } from '../../../lib/apiBase';

const BASE = `${resolveApiBase()}/teen`;

export class ApiError extends Error {
  constructor(status, message, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

/**
 * Fetch wrapper for the teen API. It signs requests with the same account
 * token as the rest of FemAware, and signs the user out if it has expired.
 */
async function send(path, { method = 'GET', body } = {}) {
  const token = getToken();
  try {
    return await fetch(`${BASE}${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError(0, "Can't reach FemAware right now. Check your connection and try again.");
  }
}

async function fail(res) {
  const data = await res.json().catch(() => ({}));
  if (res.status === 401 && getToken()) {
    clearToken();
    window.dispatchEvent(new Event('femaware:unauthorized'));
  }
  return new ApiError(res.status, data.error || 'Something went wrong', data.details);
}

export async function request(path, options) {
  const res = await send(path, options);
  if (res.status === 204) return null;
  if (!res.ok) throw await fail(res);
  return res.json().catch(() => ({}));
}

/** Download a file response (e.g. the summary) through the signed-in API. */
async function download(path, fallbackName) {
  const res = await send(path);
  if (!res.ok) throw await fail(res);
  const name = /filename="([^"]+)"/.exec(res.headers.get('Content-Disposition') || '')?.[1] || fallbackName;
  const url = URL.createObjectURL(await res.blob());
  const link = document.createElement('a');
  link.href = url;
  link.download = name;
  link.click();
  URL.revokeObjectURL(url);
}

const qs = (params) => {
  const s = new URLSearchParams(Object.entries(params).filter(([, v]) => v)).toString();
  return s ? `?${s}` : '';
};

export const api = {
  loadSampleData: () => request('/sample-data', { method: 'POST' }),
  cycles: {
    list: (range = {}) => request(`/cycles${qs(range)}`),
    create: (data) => request('/cycles', { method: 'POST', body: data }),
    update: (id, data) => request(`/cycles/${id}`, { method: 'PATCH', body: data }),
    remove: (id) => request(`/cycles/${id}`, { method: 'DELETE' }),
  },
  symptoms: {
    list: (range = {}) => request(`/symptoms${qs(range)}`),
    create: (data) => request('/symptoms', { method: 'POST', body: data }),
    update: (id, data) => request(`/symptoms/${id}`, { method: 'PATCH', body: data }),
    remove: (id) => request(`/symptoms/${id}`, { method: 'DELETE' }),
  },
  learning: {
    modules: () => request('/learning/modules'),
    module: (slug) => request(`/learning/modules/${encodeURIComponent(slug)}`),
    submitQuiz: (slug, answers) => request(`/learning/modules/${encodeURIComponent(slug)}/quiz`, { method: 'POST', body: { answers } }),
    progress: () => request('/learning/progress'),
  },
  assessments: {
    questions: (type) => request(`/assessments/questions/${type}`),
    submit: (type, answers) => request('/assessments', { method: 'POST', body: { type, answers } }),
    list: () => request('/assessments'),
    remove: (id) => request(`/assessments/${id}`, { method: 'DELETE' }),
  },
  insights: {
    get: () => request('/insights'),
    downloadSummary: () => download('/insights/summary', 'femaware-summary.txt'),
  },
  guidance: {
    get: (key) => request(`/guidance/${encodeURIComponent(key)}`),
  },
};
