import { jest } from '@jest/globals';
import type { NextFunction, Request, Response } from 'express';

import type { AuthenticatedUser } from '@kuberone/shared-types';

export function createMockRequest(overrides: Partial<Request> = {}): Request {
  return {
    headers: {},
    body: {},
    query: {},
    params: {},
    ...overrides,
  } as Request;
}

export function createMockResponse(): Response {
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
    setHeader: jest.fn().mockReturnThis(),
  };
  return res as unknown as Response;
}

export function createMockNext(): NextFunction {
  return jest.fn();
}

export function withUser(user: AuthenticatedUser, req: Request = createMockRequest()): Request {
  req.user = user;
  return req;
}
