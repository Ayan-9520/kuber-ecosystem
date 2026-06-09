export interface RequestContext {
  actorId: string;
  ipAddress?: string;
  userAgent?: string;
  requestId?: string;
}

export interface OcrExtraction {
  extractedName?: string;
  panNumber?: string;
  aadhaarNumber?: string;
  dateOfBirth?: Date;
  address?: string;
  gstNumber?: string;
  vehicleNumber?: string;
  propertyDetails?: Record<string, unknown>;
  confidenceScore: number;
  extractedFields: Record<string, unknown>;
}

export interface VerificationOutput {
  result: 'APPROVED' | 'REJECTED' | 'NEEDS_REVIEW';
  mode: 'AUTO' | 'MANUAL';
  riskFlags: string[];
  mismatches: string[];
  notes?: string;
}

export interface DeficiencyFinding {
  deficiencyType: 'MISSING' | 'ILLEGIBLE' | 'EXPIRED' | 'MISMATCH' | 'INSUFFICIENT';
  description: string;
  documentTypeId?: string;
  documentId?: string;
  documentRequestId?: string;
}

export interface PresignedUploadResult {
  uploadUrl: string;
  s3Key: string;
  expiresIn: number;
}

export interface PresignedDownloadResult {
  downloadUrl: string;
  expiresIn: number;
}
