import { z } from 'zod';

const indianMobile = z.string().regex(/^[6-9]\d{9}$/, 'Invalid Indian mobile number');

const otpPurposeEnum = z.enum([
  'LOGIN',
  'REGISTER',
  'VERIFY_PHONE',
  'CHANGE_MOBILE',
  'RESET_PASSWORD',
]);

const deviceSchema = z
  .object({
    deviceId: z.string().min(1).max(100),
    platform: z.enum(['IOS', 'ANDROID', 'WEB']),
    fcmToken: z.string().max(500).optional(),
    appVersion: z.string().max(20).optional(),
  })
  .optional();

export const sendOtpSchema = z.object({
  phone: indianMobile,
  purpose: otpPurposeEnum.default('LOGIN'),
});

export const verifyOtpSchema = z.object({
  phone: indianMobile,
  otp: z.string().length(6, 'OTP must be 6 digits'),
  purpose: otpPurposeEnum.default('LOGIN'),
  device: deviceSchema,
});

export const loginSchema = z.discriminatedUnion('loginType', [
  z.object({
    loginType: z.literal('employee'),
    email: z.string().email(),
    password: z.string().min(8),
    device: deviceSchema,
  }),
  z.object({
    loginType: z.literal('partner'),
    phone: indianMobile,
    password: z.string().min(8).optional(),
    otp: z.string().length(6).optional(),
    device: deviceSchema,
  }),
]);

export const employeeLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  device: deviceSchema,
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1),
});

export const changeMobileSendOtpSchema = z.object({
  newPhone: indianMobile,
});

export const changeMobileVerifySchema = z.object({
  newPhone: indianMobile,
  otp: z.string().length(6, 'OTP must be 6 digits'),
});

export type SendOtpInput = z.infer<typeof sendOtpSchema>;
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type EmployeeLoginInput = z.infer<typeof employeeLoginSchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;
export type ChangeMobileSendOtpInput = z.infer<typeof changeMobileSendOtpSchema>;
export type ChangeMobileVerifyInput = z.infer<typeof changeMobileVerifySchema>;
