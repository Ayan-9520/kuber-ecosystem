import type { SendSmsOtpInput, VerifySmsOtpInput } from '@kuberone/shared-validation';

import { env } from '../../../config/env.js';
import { ValidationError } from '../../../shared/errors/app-error.js';
import { compareSecret, generateOtp, hashSecret } from '../../../shared/utils/crypto.js';
import { authAuditRepository } from '../../auth/repositories/audit.repository.js';
import { otpRepository } from '../../auth/repositories/otp.repository.js';
import { userRepository } from '../../auth/repositories/user.repository.js';
import { securityService } from '../../auth/services/security.service.js';
import { sessionService } from '../../auth/services/session.service.js';
import type { AuthDeviceInput, RequestContext, SessionIssueResult } from '../../auth/types/auth.types.js';
import { OTP_TEMPLATE_MAP } from '../constants/sms.constants.js';
import { smsAnalyticsRepository } from '../repositories/sms.repository.js';
import { normalizePhone, validatePhone } from '../utils/sms.utils.js';

import { smsOrchestratorService } from './sms-orchestrator.service.js';

function mapPurpose(purpose: SendSmsOtpInput['purpose']): 'LOGIN' | 'REGISTER' | 'CHANGE_MOBILE' {
  if (purpose === 'LOGIN') return 'LOGIN';
  if (purpose === 'REGISTER' || purpose === 'VERIFY_MOBILE') return 'REGISTER';
  if (purpose === 'CHANGE_MOBILE') return 'CHANGE_MOBILE';
  return 'LOGIN';
}

export const smsOtpService = {
  async sendOtp(input: SendSmsOtpInput, ctx: RequestContext) {
    const phone = normalizePhone(input.phone);
    if (!validatePhone(input.phone)) {
      throw new ValidationError({ phone: ['Invalid mobile number'] });
    }

    const otpPurpose = mapPurpose(input.purpose);
    const recent = await otpRepository.findRecentByPhone(
      phone,
      otpPurpose,
      new Date(Date.now() - env.OTP_RESEND_COOLDOWN_SECONDS * 1000),
    );
    securityService.assertOtpResendAllowed(recent?.createdAt);

    const windowStart = new Date(Date.now() - env.SMS_OTP_RATE_LIMIT_WINDOW_MS);
    const recentCount = await otpRepository.countRecentByPhone(phone, windowStart);
    if (recentCount >= env.SMS_OTP_RATE_LIMIT_PER_PHONE) {
      throw new ValidationError({ phone: ['OTP rate limit exceeded for this number'] });
    }

    const user = await userRepository.findByPhone(phone);
    await otpRepository.invalidatePending(phone, otpPurpose);

    const otp = env.NODE_ENV === 'production' ? generateOtp() : '123456';
    const otpHash = await hashSecret(otp);
    const expiresAt = new Date(Date.now() + env.OTP_EXPIRY_SECONDS * 1000);

    await otpRepository.create({
      userId: user?.id,
      phone,
      otpHash,
      purpose: otpPurpose,
      expiresAt,
    });

    const templateCode = OTP_TEMPLATE_MAP[input.purpose] ?? 'LOGIN_OTP';
    const expiryMinutes = Math.floor(env.OTP_EXPIRY_SECONDS / 60);

    if (env.NODE_ENV !== 'production') {
      console.info(`[DEV OTP] ${phone} → ${otp} (${input.purpose})`);
    } else {
      await smsOrchestratorService.send({
        toPhone: phone,
        userId: user?.id,
        templateCode,
        eventType: 'LOGIN_OTP',
        category: 'OTP',
        priority: 'URGENT',
        isOtp: true,
        otpPurpose: input.purpose,
        variables: { otp, expiryMinutes },
      });
    }

    await smsAnalyticsRepository.upsertDaily({ date: new Date(), category: 'OTP', field: 'otpSentCount' });

    await authAuditRepository.log({
      userId: user?.id,
      action: 'OTP_SENT',
      entityType: 'otp_verification',
      newValues: { phone, purpose: input.purpose, channel: 'SMS' },
      ipAddress: ctx.ipAddress,
      userAgent: ctx.userAgent,
      requestId: ctx.requestId,
    });

    return { message: 'OTP sent successfully' };
  },

  async verifyOtp(input: VerifySmsOtpInput, ctx: RequestContext): Promise<SessionIssueResult | { message: string }> {
    const phone = normalizePhone(input.phone);
    const otpPurpose = mapPurpose(input.purpose);

    const record = await otpRepository.findLatestValid(phone, otpPurpose);
    if (!record) {
      await smsAnalyticsRepository.upsertDaily({ date: new Date(), category: 'OTP', field: 'otpFailedCount' });
      throw new ValidationError({ otp: ['OTP expired or not found'] });
    }

    if (record.attempts >= env.OTP_MAX_ATTEMPTS) {
      throw new ValidationError({ otp: ['Maximum OTP attempts exceeded'] });
    }

    const valid = await compareSecret(input.otp, record.otpHash);
    if (!valid) {
      await otpRepository.incrementAttempts(record.id);
      await smsAnalyticsRepository.upsertDaily({ date: new Date(), category: 'OTP', field: 'otpFailedCount' });
      throw new ValidationError({ otp: ['Invalid OTP'] });
    }

    await otpRepository.markVerified(record.id);
    await smsAnalyticsRepository.upsertDaily({ date: new Date(), category: 'OTP', field: 'otpVerifiedCount' });

    if (input.purpose === 'LOGIN') {
      const user = await userRepository.findByPhone(phone);
      if (!user) throw new ValidationError({ phone: ['User not found'] });
      await securityService.assertUserCanAuthenticate(user.id);
      const tokens = await sessionService.issueSession(user.id, ctx, input.device as AuthDeviceInput | undefined);
      await securityService.recordSuccessfulLogin(user.id, tokens.sessionId, ctx);
      return tokens;
    }

    return { message: 'OTP verified successfully' };
  },
};
