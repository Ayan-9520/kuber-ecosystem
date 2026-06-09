import { describe, expect, it } from 'vitest';

import { createApp } from '../../src/app.js';

describe('Health endpoint', () => {
  it('returns service metadata', async () => {
    const app = createApp();
    const server = app.listen(0);
    const address = server.address();
    const port = typeof address === 'object' && address ? address.port : 0;

    const response = await fetch(`http://127.0.0.1:${port}/health`);
    const body = (await response.json()) as { success: boolean; data: { service: string } };

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.service).toBe('kuberone-api');

    server.close();
  });
});
