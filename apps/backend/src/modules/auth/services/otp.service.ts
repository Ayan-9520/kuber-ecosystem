import { UserType } from '@kuberone/shared-types';
import type { SendOtpInput, VerifyOtpInput } from '@kuberone/shared-validation';

import { env } from '../../../config/env.js';
import {
  ConflictError,
  ForbiddenError,
  UnauthorizedError,
  ValidationError,
} from '../../../shared/errors/app-error.js';
import { compareSecret, generateOtp, hashSecret } from '../../../shared/utils/crypto.js';
import { emailOrchestratorService } from '../../email/email.module.js';
import { channelStatusService } from '../../notifications/services/channel-status.service.js';
import { customerRepository } from '../../customers/repositories/customer.repository.js';
import { OTP_TEMPLATE_MAP } from '../../sms/constants/sms.constants.js';
import { smsOrchestratorService } from '../../sms/sms.module.js';
import { authAuditRepository } from '../repositories/audit.repository.js';
import { otpRepository } from '../repositories/otp.repository.js';
import { userRepository } from '../repositories/user.repository.js';
import type { AuthDeviceInput, RequestContext, SessionIssueResult } from '../types/auth.types.js';

import { securityService } from './security.service.js';
import { sessionService } from './session.service.js';

function maskEmail(email: string): string {
  const [user, domain] = email.split('@');
  if (!user || !domain) return '***';
  const visible = user.slice(0, Math.min(2, user.length));
  return `${visible}***@${domain}`;
}

async function sendOtpEmail(params: {
  toEmail: string;
  otp: string;
  purpose: SendOtpInput['purpose'];
  userId?: string;
}): Promise<boolean> {
  const emailChannel = channelStatusService.getStatus('email');
  if (!emailChannel.deliverable) return false;

  const expiryMinutes = Math.max(1, Math.floor(env.OTP_EXPIRY_SECONDS / 60));
  // Fully render here so DB LOGIN_OTP template cannot blank-out {{otp}}.
  const subject = 'KuberOne Partner Login OTP';
  const textBody = `Your KuberOne Partner OTP is ${params.otp}. Valid for ${expiryMinutes} minute(s). Do not share this code.`;
  const htmlBody = `
        <div style="font-family:Arial,sans-serif;line-height:1.5;color:#0f172a">
          <h2 style="color:#0D6B57;margin:0 0 12px">KuberOne Partner Login</h2>
          <p>Your one-time password (OTP) is:</p>
          <p style="font-size:28px;font-weight:700;letter-spacing:6px;margin:16px 0">${params.otp}</p>
          <p>This code expires in ${expiryMinutes} minute(s). Do not share it with anyone.</p>
        </div>
      `;
  try {
    const result = await emailOrchestratorService.send({
      toEmail: params.toEmail,
      userId: params.userId,
      // Unique event type — no DB template → uses inline subject/body with real OTP.
      eventType: 'PARTNER_LOGIN_OTP',
      category: 'OTP',
      priority: 'URGENT',
      subject,
      htmlBody,
      textBody,
      variables: {
        otp: params.otp,
        expiryMinutes,
        expiryMinute: expiryMinutes,
      },
    });
    if ('skipped' in result && result.skipped) return false;
    if ('success' in result && result.success === false) return false;
    return true;
  } catch (error) {
    console.warn('[OTP email] failed:', error instanceof Error ? error.message : error);
    return false;
  }
}

async function dispatchOtp(
  input: { phone: string; purpose: SendOtpInput['purpose']; userId?: string; email?: string | null },
  ctx: RequestContext,
): Promise<{ message: string; emailSent?: boolean; emailHint?: string }> {
  const recent = await otpRepository.findRecentByPhone(
    input.phone,
    input.purpose,
    new Date(Date.now() - env.OTP_RESEND_COOLDOWN_SECONDS * 1000),
  );
  securityService.assertOtpResendAllowed(recent?.createdAt);

  await otpRepository.invalidatePending(input.phone, input.purpose);

  // Always store a real random OTP (emailed). Non-production still accepts 123456 on verify as phone/SMS bypass.
  const otp = generateOtp();
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
  if (env.APP_ENV === 'production' && recentCount >= env.SMS_OTP_RATE_LIMIT_PER_PHONE) {
    throw new ValidationError({ phone: ['OTP rate limit exceeded for this number'] });
  }

  let toEmail = input.email?.trim().toLowerCase() || null;
  if (!toEmail && input.userId) {
    const user = await userRepository.findById(input.userId);
    toEmail = user?.email?.trim().toLowerCase() || null;
  }

  let emailSent = false;
  if (toEmail) {
    emailSent = await sendOtpEmail({
      toEmail,
      otp,
      purpose: input.purpose,
      userId: input.userId,
    });
  }

  if (env.APP_ENV !== 'production') {
    console.info(
      `[OTP] phone=${input.phone} email=${toEmail ?? 'none'} purpose=${input.purpose} emailSent=${emailSent} (phone bypass 123456 still allowed)`,
    );
  } else {
    const smsChannel = channelStatusService.getStatus('sms');
    if (smsChannel.deliverable) {
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
    } else if (!emailSent) {
      throw new ValidationError({
        phone: [
          'Could not deliver OTP. Configure email SMTP or SMS gateway, then try again.',
        ],
      });
    }
  }

  await authAuditRepository.log({
    userId: input.userId,
    action: 'OTP_SENT',
    entityType: 'otp_verification',
    newValues: {
      phone: input.phone,
      purpose: input.purpose,
      emailSent,
      email: toEmail ? maskEmail(toEmail) : null,
    },
    ipAddress: ctx.ipAddress,
    userAgent: ctx.userAgent,
    requestId: ctx.requestId,
  });

  if (!emailSent && env.APP_ENV === 'production') {
    throw new ValidationError({
      phone: ['OTP email failed. Check SMTP settings or try again.'],
    });
  }

  const parts: string[] = [];
  if (emailSent && toEmail) parts.push(`email ${maskEmail(toEmail)}`);
  if (env.APP_ENV === 'production') {
    const smsChannel = channelStatusService.getStatus('sms');
    if (smsChannel.deliverable) parts.push(`mobile ${input.phone.slice(0, 2)}******${input.phone.slice(-2)}`);
  }
  const where = parts.length ? parts.join(' and ') : 'your registered email';
  const phoneBypassHint =
    env.APP_ENV !== 'production' && !emailSent
      ? ' If email is delayed, contact support or retry in a minute.'
      : '';

  return {
    message: emailSent
      ? `OTP sent to ${where}. Check your inbox (and spam).`
      : `Could not send email OTP yet.${phoneBypassHint}`,
    emailSent,
    emailHint: toEmail ? maskEmail(toEmail) : undefined,
  };
}

export const otpService = {
  async sendOtp(
    input: SendOtpInput & { email?: string | null },
    ctx: RequestContext,
  ): Promise<{ message: string; emailSent?: boolean; emailHint?: string }> {
    const user = await userRepository.findByPhone(input.phone);

    if (input.purpose === 'LOGIN') {
      if (!user) {
        throw new UnauthorizedError('No account found for this mobile number');
      }
      await securityService.assertUserCanAuthenticate(user.id);
      if (user.userType === UserType.PARTNER) {
        await securityService.assertPartnerCanLogin(user.id);
      }
    }

    if (input.purpose === 'REGISTER') {
      if (user) {
        const customer = await userRepository.findCustomerByUserId(user.id);
        if (customer) {
          throw new ConflictError('Mobile already registered. Please login instead.');
        }
        if (user.userType !== UserType.CUSTOMER) {
          throw new ForbiddenError('This mobile is linked to another account type');
        }
      }
    }

    if (input.purpose === 'CHANGE_MOBILE') {
      throw new ForbiddenError('Use authenticated change-mobile endpoint');
    }

    return dispatchOtp(
      {
        phone: input.phone,
        purpose: input.purpose,
        userId: user?.id,
        email: input.email ?? user?.email,
      },
      ctx,
    );
  },

  async verifyOtpAndLogin(
    input: VerifyOtpInput,
    ctx: RequestContext,
  ): Promise<SessionIssueResult> {
    const devOtpBypass =
      env.APP_ENV !== 'production' &&
      input.otp === '123456' &&
      (input.purpose === 'LOGIN' || input.purpose === 'REGISTER');

    const record = devOtpBypass ? null : await otpRepository.findLatestValid(input.phone, input.purpose);
    if (!record && !devOtpBypass) {
      throw new ValidationError({ otp: ['OTP expired or not found'] });
    }

    if (record) {
      if (record.attempts >= env.OTP_MAX_ATTEMPTS) {
        throw new ValidationError({ otp: ['Maximum OTP attempts exceeded'] });
      }

      const valid = await compareSecret(input.otp, record.otpHash);
      if (!valid) {
        await otpRepository.incrementAttempts(record.id);
        throw new ValidationError({ otp: ['Invalid OTP'] });
      }

      await otpRepository.markVerified(record.id);
    }

    if (input.purpose === 'REGISTER') {
      try {
        await customerRepository.registerByPhone(input.phone);
      } catch (error) {
        if (error instanceof Error && error.message === 'PHONE_REGISTERED_OTHER_TYPE') {
          throw new ForbiddenError('This mobile is linked to another account type');
        }
        throw error;
      }
    }

    const user = await userRepository.findByPhone(input.phone);
    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    await securityService.assertUserCanAuthenticate(user.id);
    if (user.userType === UserType.PARTNER) {
      await securityService.assertPartnerCanLogin(user.id);
    }

    if (
      (input.purpose === 'LOGIN' || input.purpose === 'REGISTER') &&
      user.userType === UserType.CUSTOMER &&
      user.phone
    ) {
      await customerRepository.ensureByUserId(user.id, user.phone);
    }

    if (input.purpose === 'LOGIN' && user.userType !== UserType.CUSTOMER && user.userType !== UserType.PARTNER) {
      throw new ForbiddenError('OTP login is only available for customer and partner accounts');
    }

    if (input.purpose === 'REGISTER' && user.userType !== UserType.CUSTOMER) {
      throw new ForbiddenError('Registration is only available for customer accounts');
    }

    if (input.purpose !== 'REGISTER' && input.purpose !== 'LOGIN') {
      if (user.userType !== UserType.CUSTOMER && user.userType !== UserType.PARTNER) {
        throw new ForbiddenError('OTP login is only available for customer and partner accounts');
      }
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
