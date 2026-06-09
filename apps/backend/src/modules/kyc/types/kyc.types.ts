export interface RequestContext {
  actorId: string;
  ipAddress?: string;
  userAgent?: string;
  requestId?: string;
}

export interface KycProfileResponse {
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
}
