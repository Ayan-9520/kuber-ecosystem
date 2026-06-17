import { createMockFn } from './prisma.mock.js';

export function createApiMock<T extends Record<string, unknown>>(defaults: T) {
  return {
    get: createMockFn(async (url: string) => ({ data: { success: true, data: defaults[url] ?? null } })),
    post: createMockFn(async (_url: string, body: unknown) => ({ data: { success: true, data: body } })),
    put: createMockFn(async (_url: string, body: unknown) => ({ data: { success: true, data: body } })),
    patch: createMockFn(async (_url: string, body: unknown) => ({ data: { success: true, data: body } })),
    delete: createMockFn(async () => ({ data: { success: true } })),
  };
}
