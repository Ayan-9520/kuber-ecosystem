import request from 'supertest';

import { createApp } from '../../../src/app.js';

describe('GET /health', () => {
  const app = createApp();

  it('returns service health payload', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.service).toBe('kuberone-api');
  });
});
