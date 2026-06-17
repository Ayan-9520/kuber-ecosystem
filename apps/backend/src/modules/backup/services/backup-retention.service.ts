import { backupRepository } from '../repositories/backup.repository.js';

export const backupRetentionService = {
  async list() {
    return backupRepository.retention.findMany();
  },

  async cleanup() {
    const policies = await backupRepository.retention.findMany();
    let deleted = 0;

    for (const policy of policies) {
      const cutoff = new Date();
      cutoff.setHours(cutoff.getHours() - policy.retentionHours);

      const expired = await backupRepository.execution.findMany({
        where: {
          status: { in: ['COMPLETED', 'VERIFIED'] },
          job: { schedule: policy.schedule },
          createdAt: { lt: cutoff },
        },
        take: 100,
      });

      for (const exec of expired) {
        await backupRepository.file.deleteMany({ executionId: exec.id });
        await backupRepository.execution.update(exec.id, {
          metadata: { archived: true, cleanedAt: new Date().toISOString() },
        });
        deleted++;
      }
    }

    return { deleted, policies: policies.length };
  },
};
