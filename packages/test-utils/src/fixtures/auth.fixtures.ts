import type { RequestContext } from './types.js';

export const authFixtures = {
  requestContext: (): RequestContext => ({
    ipAddress: '127.0.0.1',
    userAgent: 'jest-test-agent',
    requestId: 'req-test-001',
    actorId: 'user-1',
  }),

  employeeLogin: {
    loginType: 'employee' as const,
    email: 'admin@kuberone.com',
    password: 'Admin@123',
  },

  partnerLoginOtp: {
    loginType: 'partner' as const,
    phone: '9876543210',
    otp: '123456',
  },

  invalidEmployeeLogin: {
    loginType: 'employee' as const,
    email: 'not-an-email',
    password: 'short',
  },

  sendOtp: {
    phone: '9876543210',
    purpose: 'LOGIN' as const,
  },

  verifyOtp: {
    phone: '9876543210',
    otp: '123456',
    purpose: 'LOGIN' as const,
  },
};
