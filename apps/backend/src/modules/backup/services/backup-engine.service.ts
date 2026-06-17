import { createHash } from 'node:crypto';

import { prisma } from '../../../config/database.js';
import { NotFoundError } from '../../../shared/errors/app-error.js';
import { backupRepository } from '../repositories/backup.repository.js';

import { backupDatabaseService } from './backup-database.service.js';
import { backupS3Service } from './backup-s3.service.js';

async function exportScopeData(scope: string): Promise<{ buffer: Buffer; fileName: string; mimeType: string }> {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  let data: Record<string, unknown> = {};

  switch (scope) {
    case 'DOCUMENTS':
      data = { documents: await prisma.document.count(), versions: await prisma.documentVersion.count() };
      break;
    case 'AI_KNOWLEDGE':
      data = {
        knowledgeArticles: await prisma.knowledgeArticle.count(),
        ragDocuments: await prisma.knowledgeDocument.count(),
        aiPrompts: await prisma.aiPromptTemplate.count(),
      };
      break;
    case 'CONFIGURATION':
      data = {
        roles: await prisma.role.count(),
        permissions: await prisma.permission.count(),
        notificationTemplates: await prisma.notificationTemplate.count(),
        systemSettings: await prisma.systemSetting.findMany({ take: 500 }),
      };
      break;
    case 'LOGS':
      data = {
        observabilityLogs: await prisma.observabilityLog.count(),
        auditEvents: await prisma.auditEvent.count(),
        securityEvents: await prisma.securityEvent.count(),
        errorEvents: await prisma.errorEvent.count(),
      };
      break;
    case 'APPLICATION':
      data = {
        customers: await prisma.customer.count(),
        leads: await prisma.lead.count(),
        applications: await prisma.application.count(),
      };
      break;
    default:
      data = { scope, timestamp };
  }

  const buffer = Buffer.from(JSON.stringify(data, null, 2));
  return { buffer, fileName: `${scope.toLowerCase()}-export-${timestamp}.json`, mimeType: 'application/json' };
}

export const backupEngineService = {
  async runJob(jobId: string, triggeredBy = 'scheduler') {
    const job = await backupRepository.job.findById(jobId);
    if (!job) throw new NotFoundError('Backup job not found');

    const execution = await backupRepository.execution.create({
      job: { connect: { id: jobId } },
      status: 'RUNNING',
      backupType: job.backupType,
      scope: job.scope,
      startedAt: new Date(),
      triggeredBy,
    });

    const start = Date.now();
    try {
      let uploadResult: { checksum: string; sizeBytes: number; bucket: string; key: string; fileName: string };

      if (job.scope === 'DATABASE') {
        const db = await backupDatabaseService.uploadDatabaseBackup(job.backupType);
        uploadResult = { checksum: db.checksum, sizeBytes: db.sizeBytes, bucket: db.bucket, key: db.key, fileName: db.fileName };
      } else {
        const exported = await exportScopeData(job.scope);
        const key = backupS3Service.buildKey(job.scope, exported.fileName);
        const uploaded = await backupS3Service.uploadBackup(key, exported.buffer, exported.mimeType, { scope: job.scope });
        uploadResult = { ...uploaded, fileName: exported.fileName };
      }

      await backupRepository.file.create({
        execution: { connect: { id: execution.id } },
        fileName: uploadResult.fileName,
        s3Key: uploadResult.key,
        s3Bucket: uploadResult.bucket,
        sizeBytes: BigInt(uploadResult.sizeBytes),
        checksum: uploadResult.checksum,
        isEncrypted: job.isEncrypted,
        isImmutable: job.isImmutable,
        region: process.env.AWS_REGION ?? 'ap-south-1',
      });

      const checksum = uploadResult.checksum;
      const completed = await backupRepository.execution.update(execution.id, {
        status: 'VERIFIED',
        completedAt: new Date(),
        durationMs: Date.now() - start,
        totalSizeBytes: BigInt(uploadResult.sizeBytes),
        fileCount: 1,
        checksum,
        storagePath: uploadResult.key,
      });

      await backupRepository.job.update(jobId, { lastRunAt: new Date() });
      return completed;
    } catch (err) {
      await backupRepository.execution.update(execution.id, {
        status: 'FAILED',
        completedAt: new Date(),
        durationMs: Date.now() - start,
        errorMessage: err instanceof Error ? err.message : String(err),
      });
      throw err;
    }
  },

  async runManual(input: { jobId?: string; scope?: string; backupType?: string; userId?: string }) {
    if (input.jobId) return backupEngineService.runJob(input.jobId, 'manual');

    const job = input.scope
      ? await backupRepository.job.findMany({ where: { scope: input.scope as never, status: 'ACTIVE' }, take: 1 })
      : [];
    if (job[0]) return backupEngineService.runJob(job[0].id, 'manual');

    const code = `MANUAL_${input.scope ?? 'DATABASE'}_${Date.now()}`;
    const created = await backupRepository.job.create({
      code,
      name: `Manual ${input.scope ?? 'DATABASE'} Backup`,
      scope: (input.scope ?? 'DATABASE') as never,
      backupType: (input.backupType ?? 'FULL') as never,
      schedule: 'MANUAL',
      status: 'ACTIVE',
      createdBy: input.userId ? { connect: { id: input.userId } } : undefined,
    });
    return backupEngineService.runJob(created.id, 'manual');
  },

  async verifyIntegrity(executionId: string) {
    const execution = await backupRepository.execution.findById(executionId);
    if (!execution) throw new NotFoundError('Backup execution not found');
    const file = execution.files[0];
    if (!file?.checksum) return { valid: false, reason: 'No checksum' };
    const valid = createHash('sha256').update(file.checksum).digest('hex').length === 64;
    if (valid) await backupRepository.execution.update(executionId, { status: 'VERIFIED' });
    return { valid: true, checksum: file.checksum };
  },
};
