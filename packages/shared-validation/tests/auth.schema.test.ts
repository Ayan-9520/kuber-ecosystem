import {
  changeMobileSendOtpSchema,
  employeeLoginSchema,
  loginSchema,
  refreshTokenSchema,
  sendOtpSchema,
  verifyOtpSchema,
} from '../src/auth.schema.js';

describe('auth schemas', () => {
  it('validates send OTP', () => {
    expect(sendOtpSchema.parse({ phone: '9876543210' }).purpose).toBe('LOGIN');
  });

  it('rejects invalid phone for OTP', () => {
    expect(() => sendOtpSchema.parse({ phone: '12345' })).toThrow();
  });

  it('validates verify OTP', () => {
    const parsed = verifyOtpSchema.parse({ phone: '9123456789', otp: '123456' });
    expect(parsed.otp).toBe('123456');
  });

  it('validates employee login', () => {
    const parsed = employeeLoginSchema.parse({
      email: 'admin@kuberone.com',
      password: 'Admin@123',
    });
    expect(parsed.email).toContain('@');
  });

  it('validates discriminated login union', () => {
    const employee = loginSchema.parse({
      loginType: 'employee',
      email: 'a@b.com',
      password: 'password1',
    });
    expect(employee.loginType).toBe('employee');
  });

  it('validates refresh token', () => {
    expect(refreshTokenSchema.parse({ refreshToken: 'rt-1' }).refreshToken).toBe('rt-1');
  });

  it('validates change mobile OTP', () => {
    expect(changeMobileSendOtpSchema.parse({ newPhone: '9876543210' }).newPhone).toBe('9876543210');
  });
});
