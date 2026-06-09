import { prisma } from '../../../config/database.js';
import { maskAadhaar, maskPan } from '../../../shared/utils/field-encryption.js';
import type { VerificationOutput } from '../types/documents.types.js';
import type { OcrExtraction } from '../types/documents.types.js';

export const verificationEngineService = {
  async autoVerify(
    _documentId: string,
    ocr: OcrExtraction,
    customerId?: string | null,
  ): Promise<VerificationOutput> {
    const riskFlags: string[] = [];
    const mismatches: string[] = [];

    if (ocr.confidenceScore < 60) {
      riskFlags.push('Low OCR confidence');
    }

    if (customerId) {
      const kyc = await prisma.kycProfile.findFirst({
        where: { entityType: 'CUSTOMER', entityId: customerId },
        select: { panMasked: true, aadhaarMasked: true, panVerified: true, aadhaarVerified: true },
      });

      if (kyc?.panMasked && ocr.panNumber) {
        const masked = maskPan(ocr.panNumber);
        if (kyc.panMasked !== masked && !kyc.panMasked.includes(ocr.panNumber.slice(-4))) {
          mismatches.push('PAN mismatch with KYC profile');
        }
      }

      if (kyc?.aadhaarMasked && ocr.aadhaarNumber) {
        const masked = maskAadhaar(ocr.aadhaarNumber);
        if (kyc.aadhaarMasked !== masked) {
          mismatches.push('Aadhaar mismatch with KYC profile');
        }
      }

      if (!kyc?.panVerified && ocr.panNumber) {
        riskFlags.push('PAN not verified in KYC');
      }
    }

    if (mismatches.length > 0) {
      return {
        result: 'REJECTED',
        mode: 'AUTO',
        riskFlags,
        mismatches,
        notes: 'Automatic verification failed due to mismatches',
      };
    }

    if (riskFlags.length > 0 || ocr.confidenceScore < 70) {
      return {
        result: 'NEEDS_REVIEW',
        mode: 'AUTO',
        riskFlags,
        mismatches,
        notes: 'Manual review recommended',
      };
    }

    return {
      result: 'APPROVED',
      mode: 'AUTO',
      riskFlags,
      mismatches,
      notes: 'Automatic verification passed',
    };
  },

  manualVerify(input: {
    result: 'APPROVED' | 'REJECTED' | 'NEEDS_REVIEW';
    notes?: string;
    rejectionReason?: string;
  }): VerificationOutput {
    return {
      result: input.result,
      mode: 'MANUAL',
      riskFlags: input.rejectionReason ? [input.rejectionReason] : [],
      mismatches: [],
      notes: input.notes,
    };
  },
};
