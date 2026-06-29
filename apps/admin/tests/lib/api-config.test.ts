import { describe, expect, it } from 'vitest';

import { normalizeApiBaseUrl } from '../api-config';

describe('normalizeApiBaseUrl', () => {
  it('keeps /api/v1 suffix', () => {
    expect(normalizeApiBaseUrl('/api/v1')).toBe('/api/v1');
    expect(normalizeApiBaseUrl('https://api.kuberone.com/api/v1')).toBe('https://api.kuberone.com/api/v1');
  });

  it('appends /api/v1 to tunnel root', () => {
    expect(normalizeApiBaseUrl('https://font-movements-district-poem.trycloudflare.com')).toBe(
      'https://font-movements-district-poem.trycloudflare.com/api/v1',
    );
  });

  it('fixes /api without version', () => {
    expect(normalizeApiBaseUrl('https://example.com/api')).toBe('https://example.com/api/v1');
  });
});
