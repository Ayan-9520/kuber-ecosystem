import type { Prisma } from '@kuberone/database';

import { automationRepository } from '../repositories/automation.repository.js';

export const automationAuditService = {
  async log(params: {
    workflowId?: string;
    action: string;
    actorId: string;
    before?: Prisma.InputJsonValue;
    after?: Prisma.InputJsonValue;
    ipAddress?: string;
    userAgent?: string;
  }) {
    return automationRepository.audit.create({
      workflow: params.workflowId ? { connect: { id: params.workflowId } } : undefined,
      action: params.action,
      actor: { connect: { id: params.actorId } },
      before: params.before,
      after: params.after,
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
    });
  },
};
