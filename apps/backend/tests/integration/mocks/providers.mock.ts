/**
 * Integration tests use APP_ENV=testing with EMAIL_PROVIDER/SMS_PROVIDER/PUSH_PROVIDER=mock.
 * External HTTP providers are not invoked; notification records are persisted via mock workers.
 */
export const integrationProviderMocks = {
  email: { provider: 'mock' },
  sms: { provider: 'mock' },
  push: { provider: 'mock' },
  whatsapp: { provider: 'mock' },
  storage: { provider: 'local-mock' },
  openai: { provider: 'mock' },
};
