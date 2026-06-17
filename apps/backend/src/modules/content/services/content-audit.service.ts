import type { Prisma } from '@kuberone/database';

import { contentRepository } from '../repositories/content.repository.js';

export const contentAuditService = {
  async log(params: {
    requestId?: string;
    action: string;
    actorId: string;
    before?: Prisma.InputJsonValue;
    after?: Prisma.InputJsonValue;
    ipAddress?: string;
    userAgent?: string;
  }) {
    return contentRepository.audit.create({
      requestId: params.requestId,
      action: params.action,
      actor: { connect: { id: params.actorId } },
      before: params.before,
      after: params.after,
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
    });
  },
};
