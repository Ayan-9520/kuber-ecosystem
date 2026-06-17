import { jest } from '@jest/globals';

Object.assign(globalThis, { jest });

process.env.NODE_ENV = 'test';
process.env.APP_ENV = 'testing';
process.env.DATABASE_URL = process.env.DATABASE_URL ?? 'mysql://root:root@localhost:3306/kuberone_test';
process.env.JWT_ACCESS_SECRET =
  process.env.JWT_ACCESS_SECRET ?? 'test-access-secret-minimum-32-characters';
process.env.JWT_REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET ?? 'test-refresh-secret-minimum-32-characters';
process.env.OPENAI_API_KEY = process.env.OPENAI_API_KEY ?? 'sk-test-mock-key';
process.env.EMAIL_PROVIDER = 'mock';
process.env.SMS_PROVIDER = 'mock';
process.env.PUSH_PROVIDER = 'mock';
