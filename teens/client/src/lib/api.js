const BASE = import.meta.env.VITE_API_URL || '/api';

export class ApiError extends Error {
  constructor(status, message, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

/**
 * Fetch wrapper. The demo session lives in an httpOnly cookie, so we never
 * handle tokens or user ids in JavaScript. The custom header is required by
 * the API's CSRF guard on state-changing requests.
 */
export async function request(path, { method = 'GET', body } = {}) {
  let res;
  try {
    res = await fetch(`${BASE}${path}`, {
      method,
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', 'X-FemAware-Client': '1' },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError(0, "Can't reach FemAware right now. Check your connection and try again.");
  }
  if (res.status === 204) return null;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(res.status, data.error || 'Something went wrong', data.details);
  return data;
}

const qs = (params) => {
  const s = new URLSearchParams(Object.entries(params).filter(([, v]) => v)).toString();
  return s ? `?${s}` : '';
};

export const api = {
  session: {
    start: () => request('/session', { method: 'POST' }),
    get: () => request('/session'),
    loadDemoData: () => request('/session/demo-data', { method: 'POST' }),
    deleteAll: () => request('/session', { method: 'DELETE' }),
  },
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
    summaryUrl: `${BASE}/insights/summary`,
  },
  guidance: {
    get: (key) => request(`/guidance/${encodeURIComponent(key)}`),
  },
};
