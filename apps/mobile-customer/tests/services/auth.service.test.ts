jest.mock('@/lib/api', () => ({
  apiPost: jest.fn(),
  apiGet: jest.fn(),
}));

jest.mock('@/lib/storage', () => ({
  getOrCreateDeviceId: jest.fn(async () => 'device-test-1'),
}));

import { apiGet, apiPost } from '@/lib/api';
import { authService } from '@/services/auth.service';
import { DEMO_CREDENTIALS } from '@kuberone/mobile-testing';

describe('Customer authService', () => {
  beforeEach(() => jest.clearAllMocks());

  it('sendOtp posts to auth endpoint', async () => {
    (apiPost as jest.Mock).mockResolvedValue({ message: 'OTP sent' });
    await authService.sendOtp(DEMO_CREDENTIALS.customer.phone, 'LOGIN');
    expect(apiPost).toHaveBeenCalledWith('/auth/send-otp', {
      phone: DEMO_CREDENTIALS.customer.phone,
      purpose: 'LOGIN',
    });
  });

  it('verifyOtp includes device payload', async () => {
    (apiPost as jest.Mock).mockResolvedValue({ accessToken: 'a', refreshToken: 'r' });
    await authService.verifyOtp(DEMO_CREDENTIALS.customer.phone, DEMO_CREDENTIALS.customer.otp);
    expect(apiPost).toHaveBeenCalledWith(
      '/auth/verify-otp',
      expect.objectContaining({
        phone: DEMO_CREDENTIALS.customer.phone,
        otp: DEMO_CREDENTIALS.customer.otp,
        device: expect.objectContaining({ deviceId: 'device-test-1' }),
      }),
    );
  });

  it('me fetches current user', async () => {
    (apiGet as jest.Mock).mockResolvedValue({ id: 'u1' });
    const user = await authService.me();
    expect(apiGet).toHaveBeenCalledWith('/auth/me');
    expect(user.id).toBe('u1');
  });
});
