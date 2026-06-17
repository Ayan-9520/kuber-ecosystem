import type { Prisma } from '@kuberone/database';

import { centralAuditService } from '../../governance/services/central-audit.service.js';

export const authAuditRepository = {
  log: (data: {
    userId?: string;
    action: string;
    entityType: string;
    entityId?: string;
    oldValues?: Prisma.InputJsonValue;
    newValues?: Prisma.InputJsonValue;
    ipAddress?: string;
    userAgent?: string;
    requestId?: string;
    source?: string;
    userRole?: string;
    sessionId?: string;
  }) => centralAuditService.log(data),
};
