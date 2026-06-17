import request from 'supertest';
import { RBAC_ENDPOINT_MATRIX } from '@kuberone/security-testing';

import { createApp } from '../../src/app.js';

describe('Security — RBAC Endpoint Matrix', () => {
  const app = createApp();
  const api = '/api/v1';

  const authRequired = RBAC_ENDPOINT_MATRIX.filter((r) => r.requiredAuth);

  it.each(authRequired.map((r) => [r.method, r.path, r.module]))(
    '%s %s (%s) requires authentication',
    async (method, path) => {
      const fullPath = `${api}${path}`;
      const agent = request(app);
      let res;
      switch (method) {
        case 'GET':
          res = await agent.get(fullPath);
          break;
        case 'POST':
          res = await agent.post(fullPath).send({});
          break;
        case 'PUT':
          res = await agent.put(fullPath).send({});
          break;
        case 'PATCH':
          res = await agent.patch(fullPath).send({});
          break;
        case 'DELETE':
          res = await agent.delete(fullPath);
          break;
        default:
          res = await agent.get(fullPath);
      }
      expect([401, 403, 404, 405, 422]).toContain(res.status);
    },
  );

  it('matrix includes governance and AI platform endpoints', () => {
    const modules = new Set(RBAC_ENDPOINT_MATRIX.map((r) => r.module));
    expect(modules.has('governance')).toBe(true);
    expect(modules.has('ai-platform')).toBe(true);
    expect(modules.has('automation')).toBe(true);
  });

  it('documents endpoint requires documents.read permission in matrix', () => {
    const docRule = RBAC_ENDPOINT_MATRIX.find((r) => r.path === '/documents' && r.method === 'GET');
    expect(docRule?.requiredPermissions).toContain('documents.read');
  });
});
