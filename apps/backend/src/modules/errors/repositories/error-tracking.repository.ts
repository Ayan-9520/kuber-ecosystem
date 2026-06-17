import type { Prisma } from '@kuberone/database';

import { prisma } from '../../../config/database.js';

export const errorTrackingRepository = {
  group: {
    findMany: (args: Prisma.ErrorGroupFindManyArgs) => prisma.errorGroup.findMany(args),
    count: (where: Prisma.ErrorGroupWhereInput) => prisma.errorGroup.count({ where }),
    findById: (id: string) => prisma.errorGroup.findUnique({
      where: { id },
      include: {
        assignedTo: { select: { id: true, email: true } },
        occurrences: { take: 20, orderBy: { createdAt: 'desc' }, include: { event: true } },
        assignments: { take: 10, orderBy: { createdAt: 'desc' }, include: { assignedTo: { select: { id: true, email: true } }, assignedBy: { select: { id: true, email: true } } } },
        resolutions: { take: 5, orderBy: { createdAt: 'desc' }, include: { resolvedBy: { select: { id: true, email: true } } } },
        comments: { take: 20, orderBy: { createdAt: 'desc' }, include: { author: { select: { id: true, email: true } } } },
      },
    }),
    findByFingerprint: (fingerprint: string) => prisma.errorGroup.findUnique({ where: { fingerprint } }),
    create: (data: Prisma.ErrorGroupCreateInput) => prisma.errorGroup.create({ data }),
    update: (id: string, data: Prisma.ErrorGroupUpdateInput) => prisma.errorGroup.update({ where: { id }, data }),
  },
  event: {
    findMany: (args: Prisma.ErrorEventFindManyArgs) => prisma.errorEvent.findMany(args),
    count: (where: Prisma.ErrorEventWhereInput) => prisma.errorEvent.count({ where }),
    findById: (id: string) => prisma.errorEvent.findUnique({
      where: { id },
      include: { group: true, user: { select: { id: true, email: true } } },
    }),
    create: (data: Prisma.ErrorEventCreateInput) => prisma.errorEvent.create({ data }),
  },
  occurrence: {
    create: (data: Prisma.ErrorOccurrenceCreateInput) => prisma.errorOccurrence.create({ data }),
    countByGroup: (groupId: string) => prisma.errorOccurrence.count({ where: { groupId } }),
  },
  assignment: {
    create: (data: Prisma.ErrorAssignmentCreateInput) => prisma.errorAssignment.create({ data }),
    findMany: (args: Prisma.ErrorAssignmentFindManyArgs) => prisma.errorAssignment.findMany(args),
  },
  resolution: {
    create: (data: Prisma.ErrorResolutionCreateInput) => prisma.errorResolution.create({ data }),
  },
  comment: {
    create: (data: Prisma.ErrorCommentCreateInput) => prisma.errorComment.create({ data }),
  },
  analytics: {
    create: (data: Prisma.ErrorAnalyticsCreateInput) => prisma.errorAnalytics.create({ data }),
    findLatest: () => prisma.errorAnalytics.findFirst({ orderBy: { createdAt: 'desc' } }),
    findMany: (args: Prisma.ErrorAnalyticsFindManyArgs) => prisma.errorAnalytics.findMany(args),
  },
  alert: {
    findMany: (args: Prisma.ErrorAlertFindManyArgs) => prisma.errorAlert.findMany(args),
    count: (where: Prisma.ErrorAlertWhereInput) => prisma.errorAlert.count({ where }),
    findById: (id: string) => prisma.errorAlert.findUnique({ where: { id } }),
    create: (data: Prisma.ErrorAlertCreateInput) => prisma.errorAlert.create({ data }),
    update: (id: string, data: Prisma.ErrorAlertUpdateInput) => prisma.errorAlert.update({ where: { id }, data }),
  },
};
