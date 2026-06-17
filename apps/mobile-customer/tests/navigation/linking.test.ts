import { linking } from '@/navigation/linking';

describe('Customer deep linking', () => {
  it('defines app prefixes', () => {
    expect(linking.prefixes).toContain('kuberone://');
    expect(linking.prefixes).toContain('https://app.kuberone.com');
  });

  it('maps login route', () => {
    expect(linking.config?.screens?.Auth).toMatchObject({
      screens: { OtpLogin: 'login' },
    });
  });

  it('maps application detail deep link', () => {
    const main = linking.config?.screens?.Main as { screens?: Record<string, unknown> };
    const apps = main?.screens?.Applications as { screens?: Record<string, string> };
    expect(apps?.screens?.ApplicationDetail).toBe('applications/:id');
  });
});
