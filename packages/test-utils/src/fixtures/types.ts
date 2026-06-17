export interface RequestContext {
  ipAddress: string;
  userAgent: string;
  requestId: string;
  actorId?: string;
}
