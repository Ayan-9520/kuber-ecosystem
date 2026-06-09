export interface RequestContext {
  actorId: string;
  ipAddress?: string;
  userAgent?: string;
  requestId?: string;
}

export type SendSmsParams = {
  toPhone: string;
  userId?: string;
  templateCode?: string;
  body?: string;
  variables?: Record<string, unknown>;
  eventType?: string;
  category?: string;
  priority?: string;
  scheduleAt?: Date;
  isOtp?: boolean;
  otpPurpose?: string;
  retryCount?: number;
};
