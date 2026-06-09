export interface RequestContext {
  actorId: string;
  ipAddress?: string;
  userAgent?: string;
  requestId?: string;
}

export type SendEmailParams = {
  toEmail: string;
  userId?: string;
  templateCode?: string;
  subject?: string;
  htmlBody?: string;
  textBody?: string;
  body?: string;
  variables?: Record<string, unknown>;
  eventType?: string;
  category?: string;
  priority?: string;
  scheduleAt?: Date;
  attachments?: Array<{
    filename: string;
    contentType: string;
    storageKey: string;
    sizeBytes: number;
    checksum?: string;
  }>;
};
