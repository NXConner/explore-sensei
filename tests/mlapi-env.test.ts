import { describe, it, expect, vi } from 'vitest';
import { getMlApiUrl } from '@/config/env';

describe('getMlApiUrl', () => {
  it('returns undefined when not configured', () => {
    (global as any).importMeta = { env: {} };
    expect(getMlApiUrl()).toBeUndefined();
  });

  it('reads from env when set', () => {
    (import.meta as any).env = { VITE_MLAPI_URL: 'http://localhost:8000' };
    expect(getMlApiUrl()).toBe('http://localhost:8000');
  });
});
