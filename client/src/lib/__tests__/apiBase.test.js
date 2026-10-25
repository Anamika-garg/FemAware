import { afterEach, describe, expect, it, vi } from 'vitest';
import { resolveApiBase } from '../apiBase';

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('resolveApiBase', () => {
  it('appends /api to a bare deployment origin', () => {
    expect(resolveApiBase('https://fem-aware-l3wu.vercel.app')).toBe(
      'https://fem-aware-l3wu.vercel.app/api'
    );
  });

  it('keeps an existing /api suffix', () => {
    expect(resolveApiBase('https://fem-aware-l3wu.vercel.app/api')).toBe(
      'https://fem-aware-l3wu.vercel.app/api'
    );
  });

  it('trims trailing slashes before deciding', () => {
    expect(resolveApiBase('https://api.example.com/')).toBe('https://api.example.com/api');
    expect(resolveApiBase('https://api.example.com/api/')).toBe('https://api.example.com/api');
  });

  it('falls back to the relative API root', () => {
    expect(resolveApiBase('')).toBe('/api');
    expect(resolveApiBase('/')).toBe('/api');
    vi.stubEnv('VITE_API_URL', '');
    expect(resolveApiBase()).toBe('/api');
  });
});
