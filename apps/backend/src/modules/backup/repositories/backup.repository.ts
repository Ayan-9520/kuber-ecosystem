import type { Prisma } from '@kuberone/database';

import { prisma } from '../../../config/database.js';

export const backupRepository = {
  job: {
    findMany: (args: Prisma.BackupJobFindManyArgs) => prisma.backupJob.findMany(args),
    count: (where: Prisma.BackupJobWhereInput) => prisma.backupJob.count({ where }),
    findById: (id: string) => prisma.backupJob.findUnique({ where: { id } }),
    findByCode: (code: string) => prisma.backupJob.findUnique({ where: { code } }),
    create: (data: Prisma.BackupJobCreateInput) => prisma.backupJob.create({ data }),
    update: (id: string, data: Prisma.BackupJobUpdateInput) => prisma.backupJob.update({ where: { id }, data }),
    upsert: (code: string, create: Prisma.BackupJobCreateInput, update: Prisma.BackupJobUpdateInput) =>
      prisma.backupJob.upsert({ where: { code }, create, update }),
  },
  execution: {
    findMany: (args: Prisma.BackupExecutionFindManyArgs) => prisma.backupExecution.findMany(args),
    count: (where: Prisma.BackupExecutionWhereInput) => prisma.backupExecution.count({ where }),
    findById: (id: string) => prisma.backupExecution.findUnique({
      where: { id },
      include: { job: true, files: true },
    }),
    create: (data: Prisma.BackupExecutionCreateInput) => prisma.backupExecution.create({ data }),
    update: (id: string, data: Prisma.BackupExecutionUpdateInput) => prisma.backupExecution.update({ where: { id }, data }),
  },
  file: {
    create: (data: Prisma.BackupFileCreateInput) => prisma.backupFile.create({ data }),
    findMany: (args: Prisma.BackupFileFindManyArgs) => prisma.backupFile.findMany(args),
    deleteMany: (where: Prisma.BackupFileWhereInput) => prisma.backupFile.deleteMany({ where }),
  },
  retention: {
    findMany: () => prisma.backupRetention.findMany({ where: { isActive: true } }),
    upsert: (code: string, data: Prisma.BackupRetentionCreateInput) =>
      prisma.backupRetention.upsert({ where: { code }, create: data, update: data }),
  },
  restoreRequest: {
    findMany: (args: Prisma.RestoreRequestFindManyArgs) => prisma.restoreRequest.findMany(args),
    count: (where: Prisma.RestoreRequestWhereInput) => prisma.restoreRequest.count({ where }),
    findById: (id: string) => prisma.restoreRequest.findUnique({
      where: { id },
      include: { executions: true, requestedBy: { select: { id: true, email: true } } },
    }),
    create: (data: Prisma.RestoreRequestCreateInput) => prisma.restoreRequest.create({ data }),
    update: (id: string, data: Prisma.RestoreRequestUpdateInput) => prisma.restoreRequest.update({ where: { id }, data }),
  },
  restoreExecution: {
    create: (data: Prisma.RestoreExecutionCreateInput) => prisma.restoreExecution.create({ data }),
    update: (id: string, data: Prisma.RestoreExecutionUpdateInput) => prisma.restoreExecution.update({ where: { id }, data }),
  },
  drPlan: {
    findMany: (args?: Prisma.DisasterRecoveryPlanFindManyArgs) => prisma.disasterRecoveryPlan.findMany(args ?? {}),
    findById: (id: string) => prisma.disasterRecoveryPlan.findUnique({ where: { id }, include: { drills: { take: 10, orderBy: { createdAt: 'desc' } } } }),
    findByCode: (code: string) => prisma.disasterRecoveryPlan.findUnique({ where: { code } }),
    upsert: (code: string, create: Prisma.DisasterRecoveryPlanCreateInput, update: Prisma.DisasterRecoveryPlanUpdateInput) =>
      prisma.disasterRecoveryPlan.upsert({ where: { code }, create, update }),
    update: (id: string, data: Prisma.DisasterRecoveryPlanUpdateInput) =>
      prisma.disasterRecoveryPlan.update({ where: { id }, data }),
  },
  recoveryAudit: {
    findMany: (args: Prisma.RecoveryAuditFindManyArgs) => prisma.recoveryAudit.findMany(args),
    count: (where: Prisma.RecoveryAuditWhereInput) => prisma.recoveryAudit.count({ where }),
    create: (data: Prisma.RecoveryAuditCreateInput) => prisma.recoveryAudit.create({ data }),
    update: (id: string, data: Prisma.RecoveryAuditUpdateInput) => prisma.recoveryAudit.update({ where: { id }, data }),
  },
};
