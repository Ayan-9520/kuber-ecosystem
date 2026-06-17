import type { Application } from 'express';
import request, { type SuperAgentTest } from 'supertest';

let appInstance: Application | undefined;

export async function getIntegrationApp(): Promise<Application> {
  if (!appInstance) {
    const { createApp } = await import('../../../src/app.js');
    appInstance = createApp();
  }
  return appInstance;
}

export async function getAgent(): Promise<SuperAgentTest> {
  const app = await getIntegrationApp();
  return request(app);
}

export const API = '/api/v1';
