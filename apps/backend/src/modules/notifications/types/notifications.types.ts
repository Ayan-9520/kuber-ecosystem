import type { Prisma } from '@kuberone/database';

export interface RequestContext {
  actorId: string;
  ipAddress?: string;
  userAgent?: string;
  requestId?: string;
}

export interface RenderedTemplate {
  subject?: string;
  body: string;
  templateId?: string;
  templateCode?: string;
}

export const notificationInclude = {
  template: { select: { id: true, code: true, name: true, channel: true, version: true } },
} satisfies Prisma.NotificationInclude;

export const templateInclude = {
  createdBy: { select: { id: true, email: true } },
  parentTemplate: { select: { id: true, code: true, version: true } },
} satisfies Prisma.NotificationTemplateInclude;

export const communicationLogInclude = {
  template: { select: { id: true, code: true, name: true, channel: true } },
  recipientUser: { select: { id: true, email: true, phone: true } },
} satisfies Prisma.CommunicationLogInclude;
