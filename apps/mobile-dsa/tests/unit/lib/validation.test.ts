import { validateIndianMobile, validateOtp } from '@/lib/validation';

describe('DSA validation', () => {
  it('accepts partner demo phone', () => {
    expect(validateIndianMobile('8888777766')).toBeNull();
  });

  it('validates OTP format', () => {
    expect(validateOtp('123456')).toBeNull();
    expect(validateOtp('12345')).not.toBeNull();
  });
});
