import { afterEach, describe, expect, it, vi } from 'vitest';
import { api, ApiError } from '../lib/api';

afterEach(() => vi.unstubAllGlobals());

describe('api client', () => {
  it('sends credentials, JSON and the CSRF header', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 201, json: async () => ({ item: { id: '1' } }) });
    vi.stubGlobal('fetch', fetchMock);
    await api.cycles.create({ startDate: '2026-10-01' });
    const [url, opts] = fetchMock.mock.calls[0];
    expect(url).toBe('/api/cycles');
    expect(opts).toMatchObject({ method: 'POST', credentials: 'include', body: '{"startDate":"2026-10-01"}' });
    expect(opts.headers['X-FemAware-Client']).toBe('1');
  });

  it('builds query strings for date filters', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => ({ items: [] }) });
    vi.stubGlobal('fetch', fetchMock);
    await api.symptoms.list({ from: '2026-01-01', to: '' });
    expect(fetchMock.mock.calls[0][0]).toBe('/api/symptoms?from=2026-01-01');
  });

  it('throws ApiError with server details', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: false, status: 400, json: async () => ({ error: 'Validation failed', details: { severity: 'bad' } }) }),
    );
    await expect(api.symptoms.create({})).rejects.toMatchObject({ status: 400, message: 'Validation failed', details: { severity: 'bad' } });
  });

  it('reports network failures kindly', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));
    await expect(api.session.get()).rejects.toBeInstanceOf(ApiError);
  });

  it('returns null for 204 responses', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, status: 204 }));
    expect(await api.cycles.remove('abc')).toBeNull();
  });
});
