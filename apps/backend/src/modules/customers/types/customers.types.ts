export interface RequestContext {
  actorId: string;
  ipAddress?: string;
  userAgent?: string;
  requestId?: string;
}

export interface UpsertCustomerProfileInput {
  customerId: string;
  actorId: string;
  photoS3Key?: string;
  alternatePhone?: string;
  alternateEmail?: string;
  preferredLanguage?: string;
  preferredContactChannel?: string;
  nationality?: string;
  residentialStatus?: string;
}
