import { validateIndianMobile, validateOtp } from '@/lib/validation';

describe('Customer validation', () => {
  describe('validateIndianMobile', () => {
    it('accepts valid Indian mobile', () => {
      expect(validateIndianMobile('9876543210')).toBeNull();
      expect(validateIndianMobile('+91 98765 43210')).toBeNull();
    });

    it('rejects invalid length', () => {
      expect(validateIndianMobile('12345')).toMatch(/10-digit/);
    });

    it('rejects invalid starting digit', () => {
      expect(validateIndianMobile('5876543210')).toMatch(/6–9/);
    });
  });

  describe('validateOtp', () => {
    it('accepts 6-digit OTP', () => {
      expect(validateOtp('123456')).toBeNull();
    });

    it('rejects non-numeric OTP', () => {
      expect(validateOtp('12ab56')).toMatch(/6-digit/);
    });
  });
});
