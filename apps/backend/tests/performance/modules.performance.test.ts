import { PERF_API_CATALOG } from '@kuberone/performance-testing';
import request from 'supertest';

import { createApp } from '../../src/app.js';

describe('Performance — Module API Gateway', () => {
  const app = createApp();

  const modules = [
    { name: 'auth', path: '/api/v1/auth/me' },
    { name: 'leads', path: '/api/v1/leads' },
    { name: 'customers', path: '/api/v1/customers' },
    { name: 'applications', path: '/api/v1/applications' },
    { name: 'documents', path: '/api/v1/documents' },
    { name: 'referrals', path: '/api/v1/referrals' },
    { name: 'commissions', path: '/api/v1/commission-ledger' },
    { name: 'support', path: '/api/v1/tickets' },
    { name: 'analytics', path: '/api/v1/analytics/dashboard' },
    { name: 'ai', path: '/api/v1/ai/advisor/health' },
    { name: 'notifications', path: '/api/v1/notifications' },
  ];

  it('API catalog covers all backend performance modules', () => {
    expect(PERF_API_CATALOG.auth.health).toContain('/health');
    expect(PERF_API_CATALOG.ai.chat).toContain('/ai/chat');
    expect(PERF_API_CATALOG.notifications.list).toContain('/notifications');
  });

  it.each(modules)('$name module gateway under 1s', async ({ path }) => {
    const start = performance.now();
    const res = await request(app).get(path);
    const elapsed = performance.now() - start;
    expect(res.status).toBeLessThan(500);
    expect(elapsed).toBeLessThan(1000);
  });
});
