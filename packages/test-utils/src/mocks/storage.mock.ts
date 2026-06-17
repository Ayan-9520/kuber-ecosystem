import { createMockFn } from './prisma.mock.js';

const files = new Map<string, Buffer>();

export function createS3Mock() {
  return {
    send: createMockFn(async (command: { input?: { Key?: string; Body?: Buffer } }) => {
      const key = command.input?.Key;
      if (!key) return {};
      if (command.input?.Body) {
        files.set(key, command.input.Body);
        return { ETag: '"mock-etag"' };
      }
      const body = files.get(key);
      if (!body) throw new Error('NoSuchKey');
      return { Body: body, ContentType: 'application/pdf' };
    }),
    getSignedUrl: createMockFn(async () => 'https://mock-s3.example.com/signed-url'),
    reset() {
      files.clear();
    },
    files,
  };
}

export function createStorageMock() {
  return {
    upload: createMockFn(async (key: string, body: Buffer) => {
      files.set(key, body);
      return { key, url: `https://storage.mock/${key}` };
    }),
    download: createMockFn(async (key: string) => files.get(key) ?? Buffer.from('')),
    delete: createMockFn(async (key: string) => {
      files.delete(key);
    }),
    getPresignedUrl: createMockFn(async (key: string) => `https://storage.mock/${key}?signed=true`),
    reset() {
      files.clear();
    },
  };
}
