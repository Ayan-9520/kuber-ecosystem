import { DataScope, UserType } from '@kuberone/shared-types';

import type { AuthenticatedUser } from '@kuberone/shared-types';

export function createCustomerUser(overrides: Partial<AuthenticatedUser> = {}): AuthenticatedUser {
  return {
    id: 'user-customer-1',
    sub: 'user-customer-1',
    sessionId: 'session-1',
    userType: UserType.CUSTOMER,
    roles: ['CUSTOMER'],
    permissions: ['applications.read', 'documents.read'],
    dataScope: DataScope.OWN,
    customerId: 'customer-1',
    phone: '9876543210',
    ...overrides,
  };
}

export function createPartnerUser(overrides: Partial<AuthenticatedUser> = {}): AuthenticatedUser {
  return {
    id: 'user-partner-1',
    sub: 'user-partner-1',
    sessionId: 'session-partner-1',
    userType: UserType.PARTNER,
    roles: ['DSA_PARTNER'],
    permissions: ['leads.read', 'leads.write', 'commissions.read'],
    dataScope: DataScope.OWN,
    partnerId: 'partner-1',
    phone: '8888777766',
    ...overrides,
  };
}

export function createAuthTokens(overrides: Record<string, unknown> = {}) {
  return {
    accessToken: 'mobile-test-access-token',
    refreshToken: 'mobile-test-refresh-token',
    expiresIn: 900,
    ...overrides,
  };
}

export function createPushNotification(overrides: Record<string, unknown> = {}) {
  return {
    id: 'notif-1',
    title: 'Application approved',
    body: 'Your loan application has been sanctioned.',
    data: { deepLink: 'kuberone://applications/app-1' },
    ...overrides,
  };
}

export function createDocumentFixture(overrides: Record<string, unknown> = {}) {
  return {
    id: 'doc-1',
    fileName: 'aadhaar.pdf',
    status: 'PENDING_VERIFICATION',
    mimeType: 'application/pdf',
    ...overrides,
  };
}

export function createAiAdvisorResponse(overrides: Record<string, unknown> = {}) {
  return {
    conversationId: 'conv-1',
    message: 'Based on your profile, a personal loan at 10.5% APR may suit you.',
    sources: [{ title: 'Personal Loan FAQ', snippet: 'Eligibility criteria...' }],
    ...overrides,
  };
}
