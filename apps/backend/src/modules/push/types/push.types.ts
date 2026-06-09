export interface RequestContext {
  actorId: string;
  ipAddress?: string;
  userAgent?: string;
  requestId?: string;
}

export type SendPushParams = {
  userId: string;
  deviceId?: string;
  pushDeviceId?: string;
  templateCode?: string;
  title?: string;
  body?: string;
  variables?: Record<string, unknown>;
  payload?: Record<string, unknown>;
  eventType?: string;
  category?: string;
  priority?: string;
  scheduleAt?: Date;
  topicCode?: string;
  retryCount?: number;
  appTarget?: string;
};
