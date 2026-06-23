import { UserType } from '@kuberone/shared-types';
import type { EmployeeLoginInput, LoginInput } from '@kuberone/shared-validation';
import bcrypt from 'bcryptjs';

import { env } from '../../../config/env.js';
import {
  ForbiddenError,
  UnauthorizedError,
  ValidationError,
} from '../../../shared/errors/app-error.js';
import { compareSecret } from '../../../shared/utils/crypto.js';
import { authAuditRepository } from '../repositories/audit.repository.js';
import { otpRepository } from '../repositories/otp.repository.js';
import { userRepository } from '../repositories/user.repository.js';
import type { AuthDeviceInput, RequestContext, SessionIssueResult } from '../types/auth.types.js';

import { securityService } from './security.service.js';
import { sessionService } from './session.service.js';

export const loginService = {
  async login(input: LoginInput, ctx: RequestContext): Promise<SessionIssueResult> {
    if (input.loginType === 'employee') {
      return loginService.employeeLogin(
        {
          email: input.email,
          password: input.password,
          device: input.device,
        },
        ctx,
      );
    }

    return loginService.partnerLogin(input, ctx);
  },

  async employeeLogin(
    input: EmployeeLoginInput,
    ctx: RequestContext,
  ): Promise<SessionIssueResult> {
    const user = await userRepository.findByEmail(input.email);
    if (!user || !user.passwordHash) {
      throw new UnauthorizedError('Invalid email or password');
    }

    if (user.userType !== UserType.EMPLOYEE && user.userType !== UserType.ADMIN) {
      throw new ForbiddenError('Employee login only');
    }

    await securityService.assertUserCanAuthenticate(user.id);

    const passwordValid = await bcrypt.compare(input.password, user.passwordHash);
    if (!passwordValid) {
      await securityService.recordFailedLogin(user.id, 'INVALID_PASSWORD', ctx);
      throw new UnauthorizedError('Invalid email or password');
    }

    const tokens = await sessionService.issueSession(
      user.id,
      ctx,
      input.device as AuthDeviceInput | undefined,
    );

    await securityService.recordSuccessfulLogin(user.id, tokens.sessionId, ctx);

    await authAuditRepository.log({
      userId: user.id,
      action: 'EMPLOYEE_LOGIN_SUCCESS',
      entityType: 'session',
      entityId: tokens.sessionId,
      ipAddress: ctx.ipAddress,
      userAgent: ctx.userAgent,
      requestId: ctx.requestId,
    });

    return tokens;
  },

  async partnerLogin(
    input: Extract<LoginInput, { loginType: 'partner' }>,
    ctx: RequestContext,
  ): Promise<SessionIssueResult> {
    const user = await userRepository.findByPhone(input.phone);
    if (!user) {
      throw new UnauthorizedError('Invalid credentials');
    }

    if (user.userType !== UserType.PARTNER) {
      throw new ForbiddenError('Partner login only');
    }

    await securityService.assertUserCanAuthenticate(user.id);

    if (input.otp) {
      const devOtpBypass =
        env.APP_ENV !== 'production' && input.otp === '123456';

      const record = devOtpBypass
        ? null
        : await otpRepository.findLatestValid(input.phone, 'LOGIN');

      if (!record && !devOtpBypass) {
        throw new ValidationError({ otp: ['OTP expired or not found'] });
      }

      if (record) {
        const valid = await compareSecret(input.otp, record.otpHash);
        if (!valid) {
          await otpRepository.incrementAttempts(record.id);
          await securityService.recordFailedLogin(user.id, 'INVALID_OTP', ctx);
          throw new ValidationError({ otp: ['Invalid OTP'] });
        }

        await otpRepository.markVerified(record.id);
      }
    } else if (input.password && user.passwordHash) {
      const valid = await bcrypt.compare(input.password, user.passwordHash);
      if (!valid) {
        await securityService.recordFailedLogin(user.id, 'INVALID_PASSWORD', ctx);
        throw new UnauthorizedError('Invalid credentials');
      }
    } else {
      throw new ValidationError({
        auth: ['Partner login requires OTP or password'],
      });
    }

    const tokens = await sessionService.issueSession(
      user.id,
      ctx,
      input.device as AuthDeviceInput | undefined,
    );

    await securityService.recordSuccessfulLogin(user.id, tokens.sessionId, ctx);

    await authAuditRepository.log({
      userId: user.id,
      action: 'PARTNER_LOGIN_SUCCESS',
      entityType: 'session',
      entityId: tokens.sessionId,
      ipAddress: ctx.ipAddress,
      userAgent: ctx.userAgent,
      requestId: ctx.requestId,
    });

    return tokens;
  },
};
