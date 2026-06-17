jest.mock('@/lib/api', () => ({ apiPost: jest.fn(), apiGet: jest.fn() }));
jest.mock('@/lib/storage', () => ({ getOrCreateDeviceId: jest.fn(async () => 'dsa-device-1') }));

import { apiPost } from '@/lib/api';
import { authService } from '@/services/auth.service';
import { DEMO_CREDENTIALS } from '@kuberone/mobile-testing';

describe('DSA authService', () => {
  it('partnerLogin posts partner login type', async () => {
    (apiPost as jest.Mock).mockResolvedValue({ accessToken: 'a', refreshToken: 'r' });
    await authService.partnerLogin(DEMO_CREDENTIALS.dsaPartner.phone, DEMO_CREDENTIALS.dsaPartner.otp);
    expect(apiPost).toHaveBeenCalledWith(
      '/auth/login',
      expect.objectContaining({
        loginType: 'partner',
        phone: DEMO_CREDENTIALS.dsaPartner.phone,
        otp: DEMO_CREDENTIALS.dsaPartner.otp,
      }),
    );
  });
});
