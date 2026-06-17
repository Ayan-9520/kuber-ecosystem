import { linking } from '@/navigation/linking';

describe('DSA deep linking', () => {
  it('defines DSA prefixes', () => {
    expect(linking.prefixes).toContain('kuberone-dsa://');
  });

  it('maps lead detail route', () => {
    const main = linking.config?.screens?.Main as { screens?: Record<string, unknown> };
    const leads = main?.screens?.Leads as { screens?: Record<string, string> };
    expect(leads?.screens?.LeadDetail).toBe('leads/:id');
  });
});
