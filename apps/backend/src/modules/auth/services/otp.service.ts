import { UserType } from '@kuberone/shared-types';
import type { SendOtpInput, VerifyOtpInput } from '@kuberone/shared-validation';

import { env } from '../../../config/env.js';
import {
  ForbiddenError,
  UnauthorizedError,
  ValidationError,
} from '../../../shared/errors/app-error.js';
import { compareSecret, generateOtp, hashSecret } from '../../../shared/utils/crypto.js';
import { channelStatusService } from '../../notifications/services/channel-status.service.js';
import { OTP_TEMPLATE_MAP } from '../../sms/constants/sms.constants.js';
import { smsOrchestratorService } from '../../sms/sms.module.js';
import { authAuditRepository } from '../repositories/audit.repository.js';
import { otpRepository } from '../repositories/otp.repository.js';
import { userRepository } from '../repositories/user.repository.js';
import type { AuthDeviceInput, RequestContext, SessionIssueResult } from '../types/auth.types.js';

import { securityService } from './security.service.js';
import { sessionService } from './session.service.js';

async function dispatchOtp(
  input: { phone: string; purpose: SendOtpInput['purpose']; userId?: string },
  ctx: RequestContext,
): Promise<{ message: string }> {
  const recent = await otpRepository.findRecentByPhone(
    input.phone,
    input.purpose,
    new Date(Date.now() - env.OTP_RESEND_COOLDOWN_SECONDS * 1000),
  );
  securityService.assertOtpResendAllowed(recent?.createdAt);

  await otpRepository.invalidatePending(input.phone, input.purpose);

  const otp = env.APP_ENV === 'production' ? generateOtp() : '123456';
  const otpHash = await hashSecret(otp);
  const expiresAt = new Date(Date.now() + env.OTP_EXPIRY_SECONDS * 1000);

  await otpRepository.create({
    userId: input.userId,
    phone: input.phone,
    otpHash,
    purpose: input.purpose,
    expiresAt,
  });

  const windowStart = new Date(Date.now() - env.SMS_OTP_RATE_LIMIT_WINDOW_MS);
  const recentCount = await otpRepository.countRecentByPhone(input.phone, windowStart);
  if (recentCount >= env.SMS_OTP_RATE_LIMIT_PER_PHONE) {
    throw new ValidationError({ phone: ['OTP rate limit exceeded for this number'] });
  }

  if (env.APP_ENV !== 'production') {
    if (env.NODE_ENV === 'development') {
      console.info(`[DEV OTP] ${input.phone} → ${input.purpose}`);
    }
  } else {
    const smsChannel = channelStatusService.getStatus('sms');
    if (!smsChannel.deliverable) {
      throw new ValidationError({
        phone: [
          smsChannel.status === 'disabled'
            ? 'SMS OTP is temporarily disabled. Use password login or contact support.'
            : 'SMS OTP is not configured yet. Use password login or contact your administrator.',
        ],
      });
    }
    const templateCode = OTP_TEMPLATE_MAP[input.purpose] ?? 'LOGIN_OTP';
    await smsOrchestratorService.send({
      userId: input.userId,
      toPhone: input.phone,
      templateCode,
      eventType: 'LOGIN_OTP',
      category: 'OTP',
      priority: 'URGENT',
      isOtp: true,
      otpPurpose: input.purpose,
      variables: { otp, expiryMinutes: Math.floor(env.OTP_EXPIRY_SECONDS / 60) },
    });
  }

  await authAuditRepository.log({
    userId: input.userId,
    action: 'OTP_SENT',
    entityType: 'otp_verification',
    newValues: { phone: input.phone, purpose: input.purpose },
    ipAddress: ctx.ipAddress,
    userAgent: ctx.userAgent,
    requestId: ctx.requestId,
  });

  return { message: 'OTP sent successfully' };
}

export const otpService = {
  async sendOtp(input: SendOtpInput, ctx: RequestContext): Promise<{ message: string }> {
    const user = await userRepository.findByPhone(input.phone);

    if (input.purpose === 'LOGIN') {
      if (!user) {
        throw new UnauthorizedError('No account found for this mobile number');
      }
      await securityService.assertUserCanAuthenticate(user.id);
    }

    if (input.purpose === 'CHANGE_MOBILE') {
      throw new ForbiddenError('Use authenticated change-mobile endpoint');
    }

    return dispatchOtp(
      { phone: input.phone, purpose: input.purpose, userId: user?.id },
      ctx,
    );
  },

  async verifyOtpAndLogin(
    input: VerifyOtpInput,
    ctx: RequestContext,
  ): Promise<SessionIssueResult> {
    const record = await otpRepository.findLatestValid(input.phone, input.purpose);
    if (!record) {
      throw new ValidationError({ otp: ['OTP expired or not found'] });
    }

    if (record.attempts >= env.OTP_MAX_ATTEMPTS) {
      throw new ValidationError({ otp: ['Maximum OTP attempts exceeded'] });
    }

    const valid = await compareSecret(input.otp, record.otpHash);
    if (!valid) {
      await otpRepository.incrementAttempts(record.id);
      throw new ValidationError({ otp: ['Invalid OTP'] });
    }

    await otpRepository.markVerified(record.id);

    const user = await userRepository.findByPhone(input.phone);
    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    await securityService.assertUserCanAuthenticate(user.id);

    if (user.userType !== UserType.CUSTOMER && user.userType !== UserType.PARTNER) {
      throw new ForbiddenError('OTP login is only available for customer and partner accounts');
    }

    const tokens = await sessionService.issueSession(
      user.id,
      ctx,
      input.device as AuthDeviceInput | undefined,
    );

    await securityService.recordSuccessfulLogin(user.id, tokens.sessionId, ctx);

    await authAuditRepository.log({
      userId: user.id,
      action: 'OTP_LOGIN_SUCCESS',
      entityType: 'session',
      entityId: tokens.sessionId,
      ipAddress: ctx.ipAddress,
      userAgent: ctx.userAgent,
      requestId: ctx.requestId,
    });

    return tokens;
  },

  async sendChangeMobileOtp(
    userId: string,
    newPhone: string,
    ctx: RequestContext,
  ): Promise<{ message: string }> {
    const existing = await userRepository.findByPhone(newPhone);
    if (existing && existing.id !== userId) {
      throw new ValidationError({ newPhone: ['Mobile number already registered'] });
    }

    return dispatchOtp({ phone: newPhone, purpose: 'CHANGE_MOBILE', userId }, ctx);
  },

  async verifyChangeMobile(
    userId: string,
    newPhone: string,
    otp: string,
    ctx: RequestContext,
  ): Promise<{ message: string }> {
    const record = await otpRepository.findLatestValid(newPhone, 'CHANGE_MOBILE');
    if (!record) {
      throw new ValidationError({ otp: ['OTP expired or not found'] });
    }

    if (record.attempts >= env.OTP_MAX_ATTEMPTS) {
      throw new ValidationError({ otp: ['Maximum OTP attempts exceeded'] });
    }

    const valid = await compareSecret(otp, record.otpHash);
    if (!valid) {
      await otpRepository.incrementAttempts(record.id);
      throw new ValidationError({ otp: ['Invalid OTP'] });
    }

    const user = await userRepository.findById(userId);
    const oldPhone = user?.phone;

    await otpRepository.markVerified(record.id);
    await userRepository.updatePhone(userId, newPhone);

    await authAuditRepository.log({
      userId,
      action: 'MOBILE_CHANGED',
      entityType: 'user',
      entityId: userId,
      oldValues: { phone: oldPhone },
      newValues: { phone: newPhone },
      ipAddress: ctx.ipAddress,
      userAgent: ctx.userAgent,
      requestId: ctx.requestId,
    });

    return { message: 'Mobile number updated successfully' };
  },
};
