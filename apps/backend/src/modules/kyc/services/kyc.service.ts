import type { AuthenticatedUser } from '@kuberone/shared-types';
import type { SubmitPanInput, UpsertKycProfileInput } from '@kuberone/shared-validation';

import { env } from '../../../config/env.js';
import { ValidationError } from '../../../shared/errors/app-error.js';
import { compareSecret, hashSecret } from '../../../shared/utils/crypto.js';
import {
  assertCustomerAccess,
  resolveCustomerIdForActor,
} from '../../../shared/utils/customer-scope.js';
import {
  encryptField,
  maskAadhaar,
  maskPan,
} from '../../../shared/utils/field-encryption.js';
import { authAuditRepository } from '../../auth/repositories/audit.repository.js';
import { otpRepository } from '../../auth/repositories/otp.repository.js';
import { userRepository } from '../../auth/repositories/user.repository.js';
import { customerRepository } from '../../customers/repositories/customer.repository.js';
import { loadCustomer } from '../../customers/services/customer.service.js';
import { smsService } from '../../notifications/services/sms.service.js';
import { aadhaarVerificationRepository } from '../repositories/aadhaar-verification.repository.js';
import { kycAuditRepository } from '../repositories/kyc-audit.repository.js';
import { kycProfileRepository } from '../repositories/kyc-profile.repository.js';
import { panVerificationRepository } from '../repositories/pan-verification.repository.js';
import type { KycProfileResponse, RequestContext } from '../types/kyc.types.js';

export const kycProfileService = {
  async get(actor: AuthenticatedUser, customerId?: string): Promise<KycProfileResponse | null> {
    const resolvedId = await resolveCustomerId(actor, customerId);
    const profile = await kycProfileRepository.findByEntity('CUSTOMER', resolvedId);
    return profile ? toKycProfileResponse(profile) : null;
  },

  async upsert(actor: AuthenticatedUser, input: UpsertKycProfileInput, ctx: RequestContext) {
    const customer = await loadCustomer(input.customerId);
    assertCustomerAccess(actor, customer);

    let profile = await kycProfileRepository.findByEntity('CUSTOMER', input.customerId);
    const previousStatus = profile?.overallStatus ?? 'NOT_STARTED';

    if (!profile) {
      profile = await kycProfileRepository.create({
        entityType: 'CUSTOMER',
        entityId: input.customerId,
        photoS3Key: input.photoS3Key,
        ckycNumber: input.ckycNumber,
        overallStatus: 'IN_PROGRESS',
        completionPct: 10,
        createdById: ctx.actorId,
        updatedById: ctx.actorId,
      });
    } else {
      profile = await kycProfileRepository.update(profile.id, {
        photoS3Key: input.photoS3Key,
        ckycNumber: input.ckycNumber,
        overallStatus: profile.overallStatus === 'NOT_STARTED' ? 'IN_PROGRESS' : profile.overallStatus,
        updatedById: ctx.actorId,
      });
    }

    await customerRepository.updateKycStatus(input.customerId, 'IN_PROGRESS');

    await kycAuditRepository.create({
      kycProfileId: profile.id,
      action: 'VERIFY',
      performedById: ctx.actorId,
      previousStatus: previousStatus as never,
      newStatus: profile.overallStatus as never,
      reason: 'KYC profile upserted',
      ipAddress: ctx.ipAddress,
    });

    await authAuditRepository.log({
      userId: ctx.actorId,
      action: 'KYC_PROFILE_UPSERTED',
      entityType: 'kyc_profile',
      entityId: profile.id,
      newValues: { customerId: input.customerId },
      ipAddress: ctx.ipAddress,
      userAgent: ctx.userAgent,
      requestId: ctx.requestId,
    });

    return toKycProfileResponse(profile);
  },

  async listAudit(actor: AuthenticatedUser, customerId: string, page: number, limit: number) {
    const resolvedId = await resolveCustomerId(actor, customerId);
    const profile = await kycProfileRepository.findByEntity('CUSTOMER', resolvedId);
    if (!profile) {
      return { items: [], meta: { page, limit, total: 0, totalPages: 1 } };
    }

    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      kycAuditRepository.listByProfile(profile.id, skip, limit),
      kycAuditRepository.countByProfile(profile.id),
    ]);

    return {
      items,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
    };
  },
};

export const panVerificationService = {
  async submit(actor: AuthenticatedUser, input: SubmitPanInput, ctx: RequestContext) {
    const customerId = await resolveCustomerId(actor, input.customerId);
    const customer = await loadCustomer(customerId);
    assertCustomerAccess(actor, customer);

    const pan = input.pan.toUpperCase();
    const panEncrypted = encryptField(pan);
    const panMasked = maskPan(pan);

    let profile = await kycProfileRepository.findByEntity('CUSTOMER', customerId);
    if (!profile) {
      profile = await kycProfileRepository.create({
        entityType: 'CUSTOMER',
        entityId: customerId,
        overallStatus: 'IN_PROGRESS',
        completionPct: 20,
        createdById: ctx.actorId,
        updatedById: ctx.actorId,
      });
    }

    const verified = env.NODE_ENV !== 'production';
    const verification = await panVerificationRepository.create({
      kycProfileId: profile.id,
      panEncrypted,
      panMasked,
      nameOnPan: input.nameOnPan,
      verificationStatus: verified ? 'VERIFIED' : 'PENDING',
      verificationProvider: env.NODE_ENV === 'production' ? 'NSDL' : 'MANUAL',
      verifiedAt: verified ? new Date() : undefined,
      createdById: ctx.actorId,
    });

    const updatedProfile = await kycProfileRepository.update(profile.id, {
      panEncrypted,
      panMasked,
      panVerified: verified,
      panVerifiedAt: verified ? new Date() : undefined,
      overallStatus: verified ? 'IN_PROGRESS' : profile.overallStatus,
      completionPct: Math.max(profile.completionPct, verified ? 50 : 30),
      updatedById: ctx.actorId,
    });

    if (verified) {
      await customerRepository.updateKycStatus(customerId, 'IN_PROGRESS');
    }

    await kycAuditRepository.create({
      kycProfileId: profile.id,
      action: 'VERIFY',
      performedById: ctx.actorId,
      previousStatus: profile.overallStatus as never,
      newStatus: updatedProfile.overallStatus as never,
      reason: `PAN verification ${verified ? 'verified' : 'submitted'}`,
      ipAddress: ctx.ipAddress,
    });

    await authAuditRepository.log({
      userId: ctx.actorId,
      action: 'KYC_PAN_SUBMITTED',
      entityType: 'pan_verification',
      entityId: verification.id,
      newValues: { panMasked, status: verification.verificationStatus },
      ipAddress: ctx.ipAddress,
      userAgent: ctx.userAgent,
      requestId: ctx.requestId,
    });

    return {
      verificationId: verification.id,
      panMasked,
      status: verification.verificationStatus,
      verifiedAt: verification.verifiedAt,
      profile: toKycProfileResponse(updatedProfile),
    };
  },

  async list(actor: AuthenticatedUser, customerId?: string) {
    const resolvedId = await resolveCustomerId(actor, customerId);
    const profile = await kycProfileRepository.findByEntity('CUSTOMER', resolvedId);
    if (!profile) return [];
    return panVerificationRepository.listByProfile(profile.id).then((items) =>
      items.map((item) => ({
        id: item.id,
        panMasked: item.panMasked,
        nameOnPan: item.nameOnPan,
        verificationStatus: item.verificationStatus,
        verificationProvider: item.verificationProvider,
        verifiedAt: item.verifiedAt,
        failureReason: item.failureReason,
        createdAt: item.createdAt,
      })),
    );
  },
};

const AADHAAR_OTP_PURPOSE = 'AADHAAR_VERIFY';

export const aadhaarVerificationService = {
  async sendOtp(actor: AuthenticatedUser, customerId: string | undefined, aadhaar: string, ctx: RequestContext) {
    const resolvedId = await resolveCustomerId(actor, customerId);
    const customer = await loadCustomer(resolvedId);
    assertCustomerAccess(actor, customer);

    const otpPhoneKey = `aadhaar:${resolvedId}`;
    await otpRepository.invalidatePending(otpPhoneKey, AADHAAR_OTP_PURPOSE);

    const otp = env.NODE_ENV === 'production' ? String(Math.floor(100000 + Math.random() * 900000)) : '123456';
    const otpHash = await hashSecret(otp);
    const expiresAt = new Date(Date.now() + env.OTP_EXPIRY_SECONDS * 1000);

    await otpRepository.create({
      userId: ctx.actorId,
      phone: otpPhoneKey,
      otpHash,
      purpose: AADHAAR_OTP_PURPOSE,
      expiresAt,
    });

    if (env.NODE_ENV !== 'production') {
      console.info(`[DEV AADHAAR OTP] ${maskAadhaar(aadhaar)} → ${otp}`);
    } else {
      const user = await userRepository.findById(customer.userId);
      if (user?.phone) {
        await smsService.send({
          userId: customer.userId,
          toPhone: user.phone,
          eventType: 'LOGIN_OTP',
          body: `Your Aadhaar verification OTP is ${otp}. Valid for ${Math.floor(env.OTP_EXPIRY_SECONDS / 60)} minutes.`,
          variables: { otp },
        });
      }
    }

    await authAuditRepository.log({
      userId: ctx.actorId,
      action: 'KYC_AADHAAR_OTP_SENT',
      entityType: 'customer',
      entityId: resolvedId,
      ipAddress: ctx.ipAddress,
      userAgent: ctx.userAgent,
      requestId: ctx.requestId,
    });

    return { message: 'Aadhaar OTP sent successfully' };
  },

  async verify(
    actor: AuthenticatedUser,
    customerId: string | undefined,
    aadhaar: string,
    otp: string,
    ctx: RequestContext,
  ) {
    const resolvedId = await resolveCustomerId(actor, customerId);
    const customer = await loadCustomer(resolvedId);
    assertCustomerAccess(actor, customer);

    const otpPhoneKey = `aadhaar:${resolvedId}`;
    const record = await otpRepository.findLatestValid(otpPhoneKey, AADHAAR_OTP_PURPOSE);
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

    await otpRepository.markVerified(record.id);

    const aadhaarEncrypted = encryptField(aadhaar);
    const aadhaarMasked = maskAadhaar(aadhaar);

    let profile = await kycProfileRepository.findByEntity('CUSTOMER', resolvedId);
    if (!profile) {
      profile = await kycProfileRepository.create({
        entityType: 'CUSTOMER',
        entityId: resolvedId,
        overallStatus: 'IN_PROGRESS',
        completionPct: 20,
        createdById: ctx.actorId,
        updatedById: ctx.actorId,
      });
    }

    const verification = await aadhaarVerificationRepository.create({
      kycProfileId: profile.id,
      aadhaarEncrypted,
      aadhaarMasked,
      verificationMethod: 'OTP',
      verificationStatus: 'VERIFIED',
      verifiedAt: new Date(),
      createdById: ctx.actorId,
    });

    const panVerified = profile.panVerified;
    const overallStatus = panVerified ? 'COMPLETE' : 'IN_PROGRESS';
    const completionPct = panVerified ? 100 : Math.max(profile.completionPct, 70);

    const updatedProfile = await kycProfileRepository.update(profile.id, {
      aadhaarEncrypted,
      aadhaarMasked,
      aadhaarVerified: true,
      aadhaarVerifiedAt: new Date(),
      overallStatus: overallStatus as never,
      completionPct,
      updatedById: ctx.actorId,
    });

    await customerRepository.updateKycStatus(
      resolvedId,
      overallStatus === 'COMPLETE' ? 'VERIFIED' : 'IN_PROGRESS',
    );

    await kycAuditRepository.create({
      kycProfileId: profile.id,
      action: 'VERIFY',
      performedById: ctx.actorId,
      previousStatus: profile.overallStatus as never,
      newStatus: updatedProfile.overallStatus as never,
      reason: 'Aadhaar OTP verified',
      ipAddress: ctx.ipAddress,
    });

    await authAuditRepository.log({
      userId: ctx.actorId,
      action: 'KYC_AADHAAR_VERIFIED',
      entityType: 'aadhaar_verification',
      entityId: verification.id,
      newValues: { aadhaarMasked },
      ipAddress: ctx.ipAddress,
      userAgent: ctx.userAgent,
      requestId: ctx.requestId,
    });

    return {
      verificationId: verification.id,
      aadhaarMasked,
      status: verification.verificationStatus,
      verifiedAt: verification.verifiedAt,
      profile: toKycProfileResponse(updatedProfile),
    };
  },

  async list(actor: AuthenticatedUser, customerId?: string) {
    const resolvedId = await resolveCustomerId(actor, customerId);
    const profile = await kycProfileRepository.findByEntity('CUSTOMER', resolvedId);
    if (!profile) return [];
    return aadhaarVerificationRepository.listByProfile(profile.id).then((items) =>
      items.map((item) => ({
        id: item.id,
        aadhaarMasked: item.aadhaarMasked,
        verificationMethod: item.verificationMethod,
        verificationStatus: item.verificationStatus,
        verifiedAt: item.verifiedAt,
        createdAt: item.createdAt,
      })),
    );
  },
};

async function resolveCustomerId(actor: AuthenticatedUser, customerId?: string): Promise<string> {
  const resolved = resolveCustomerIdForActor(actor, customerId);
  if (!resolved) {
    const customer = await customerRepository.findByUserId(actor.id);
    if (!customer) throw new ValidationError({ customerId: ['Customer not found'] });
    return customer.id;
  }
  return resolved;
}

function toKycProfileResponse(profile: {
  id: string;
  entityType: string;
  entityId: string;
  panMasked: string | null;
  panVerified: boolean;
  panVerifiedAt: Date | null;
  aadhaarMasked: string | null;
  aadhaarVerified: boolean;
  aadhaarVerifiedAt: Date | null;
  ckycNumber: string | null;
  addressProofStatus: string;
  overallStatus: string;
  completionPct: number;
  expiresAt: Date | null;
  lastReviewedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}): KycProfileResponse {
  return {
    id: profile.id,
    entityType: profile.entityType,
    entityId: profile.entityId,
    panMasked: profile.panMasked,
    panVerified: profile.panVerified,
    panVerifiedAt: profile.panVerifiedAt,
    aadhaarMasked: profile.aadhaarMasked,
    aadhaarVerified: profile.aadhaarVerified,
    aadhaarVerifiedAt: profile.aadhaarVerifiedAt,
    ckycNumber: profile.ckycNumber,
    addressProofStatus: profile.addressProofStatus,
    overallStatus: profile.overallStatus,
    completionPct: profile.completionPct,
    expiresAt: profile.expiresAt,
    lastReviewedAt: profile.lastReviewedAt,
    createdAt: profile.createdAt,
    updatedAt: profile.updatedAt,
  };
}
