import request from 'supertest';

import { createApp } from '../../../src/app.js';

describe('Module health endpoints', () => {
  const app = createApp();

  const publicHealthRoutes = [
    '/api/v1/emi/health',
    '/api/v1/eligibility/health',
    '/api/v1/employees/health',
    '/api/v1/partners/health',
    '/api/v1/settings/health',
    '/api/v1/campaigns/health',
    '/api/v1/content/health',
    '/api/v1/automation/health',
    '/api/v1/knowledge/health',
    '/api/v1/rag/health',
    '/api/v1/recommendations/health',
    '/api/v1/lead-scoring/health',
    '/api/v1/ai-copilot/health',
    '/api/v1/ai/advisor/health',
  ];

  it.each(publicHealthRoutes)('GET %s responds', async (route) => {
    const res = await request(app).get(route);
    expect([200, 401, 403]).toContain(res.status);
  });

  it('GET /api/v1/analytics/health requires auth', async () => {
    const res = await request(app).get('/api/v1/analytics/health');
    expect(res.status).toBe(401);
  });
});
