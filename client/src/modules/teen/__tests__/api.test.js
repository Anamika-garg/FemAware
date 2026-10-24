import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { api, ApiError } from '../lib/api';

beforeEach(() => localStorage.setItem('femaware_token', 'test-token'));
afterEach(() => {
  vi.unstubAllGlobals();
  localStorage.clear();
});

describe('teen api client', () => {
  it('sends JSON and the account token to the teen API', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 201, json: async () => ({ item: { id: '1' } }) });
    vi.stubGlobal('fetch', fetchMock);
    await api.cycles.create({ startDate: '2026-10-01' });
    const [url, opts] = fetchMock.mock.calls[0];
    expect(url).toBe('/api/teen/cycles');
    expect(opts).toMatchObject({ method: 'POST', body: '{"startDate":"2026-10-01"}' });
    expect(opts.headers.Authorization).toBe('Bearer test-token');
  });

  it('builds query strings for date filters', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => ({ items: [] }) });
    vi.stubGlobal('fetch', fetchMock);
    await api.symptoms.list({ from: '2026-01-01', to: '' });
    expect(fetchMock.mock.calls[0][0]).toBe('/api/teen/symptoms?from=2026-01-01');
  });

  it('throws ApiError with server details', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: false, status: 400, json: async () => ({ error: 'Validation failed', details: { severity: 'bad' } }) }),
    );
    await expect(api.symptoms.create({})).rejects.toMatchObject({ status: 400, message: 'Validation failed', details: { severity: 'bad' } });
  });

  it('signs out when the account token is rejected', async () => {
    const listener = vi.fn();
    window.addEventListener('femaware:unauthorized', listener);
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 401, json: async () => ({ error: 'Please sign in' }) }));
    await expect(api.cycles.list()).rejects.toMatchObject({ status: 401 });
    expect(localStorage.getItem('femaware_token')).toBeNull();
    expect(listener).toHaveBeenCalledTimes(1);
    window.removeEventListener('femaware:unauthorized', listener);
  });

  it('reports network failures kindly', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));
    await expect(api.insights.get()).rejects.toBeInstanceOf(ApiError);
  });

  it('returns null for 204 responses', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, status: 204 }));
    expect(await api.cycles.remove('abc')).toBeNull();
  });
});
