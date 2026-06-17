export const DEMO_CREDENTIALS = {
  customer: {
    phone: '9876543210',
    otp: '123456',
    email: 'demo.customer@kuberone.com',
  },
  dsaPartner: {
    phone: '8888777766',
    otp: '123456',
    email: 'dsa.demo@kuberone.com',
  },
  admin: {
    email: 'admin@kuberone.com',
    password: 'Admin@123',
  },
} as const;

export const API_FIXTURES = {
  authTokens: {
    accessToken: 'test-access-token',
    refreshToken: 'test-refresh-token',
    expiresIn: 900,
  },
  paginatedEmpty: {
    items: [] as unknown[],
    meta: { page: 1, limit: 20, total: 0, totalPages: 0 },
  },
  networkError: { code: 'ERR_NETWORK', message: 'Network Error' },
  validationError: {
    success: false,
    error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: { phone: ['Invalid phone'] } },
  },
  unauthorized: {
    success: false,
    error: { code: 'UNAUTHORIZED', message: 'Unauthorized' },
  },
} as const;
