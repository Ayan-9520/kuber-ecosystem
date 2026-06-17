import { randomUUID } from 'node:crypto';

import { NotFoundError } from '../../../shared/errors/app-error.js';
import { ERROR_ALERT_RULES } from '../constants/error-tracking.constants.js';
import { errorTrackingRepository } from '../repositories/error-tracking.repository.js';

export const errorAlertService = {
  async list(params: {
    page: number; limit: number; status?: string; severity?: string; source?: string; search?: string;
  }) {
    const { page, limit, status, severity, source, search } = params;
    const where = {
      ...(status ? { status: status as never } : {}),
      ...(severity ? { severity: severity as never } : {}),
      ...(source ? { source: source as never } : {}),
      ...(search ? { OR: [{ title: { contains: search } }, { code: { contains: search } }] } : {}),
    };
    const [items, total] = await Promise.all([
      errorTrackingRepository.alert.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy: { createdAt: 'desc' } }),
      errorTrackingRepository.alert.count(where),
    ]);
    return { items, meta: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 } };
  },

  async evaluateOnCapture(groupId: string, ctx: { source: string; priority: string; occurrenceCount: number; message: string }) {
    for (const rule of ERROR_ALERT_RULES) {
      const matchesSource = rule.source === ctx.source || rule.source === 'BACKEND';
      const matchesThreshold = ctx.occurrenceCount >= rule.threshold;

      if (!matchesSource || !matchesThreshold) continue;
      if (rule.severity === 'CRITICAL' && ctx.priority !== 'CRITICAL' && rule.code !== 'CRASH_LOOP') continue;

      const code = `${rule.code}-${groupId.slice(0, 8)}`;
      const existing = await errorTrackingRepository.alert.findMany({ where: { code, status: 'OPEN' }, take: 1 });
      if (existing.length > 0) continue;

      await errorTrackingRepository.alert.create({
        ruleCode: rule.code,
        code: `${code}-${randomUUID().slice(0, 6)}`,
        title: rule.name,
        description: ctx.message.slice(0, 500),
        severity: rule.severity as never,
        status: 'OPEN',
        source: ctx.source as never,
        group: { connect: { id: groupId } },
        channels: ['EMAIL', 'WEBHOOK'],
      });
    }
  },

  async updateAlert(id: string, data: { status?: string; acknowledgedById?: string; resolvedById?: string }) {
    const alert = await errorTrackingRepository.alert.findById(id);
    if (!alert) throw new NotFoundError('Error alert not found');
    return errorTrackingRepository.alert.update(id, {
      ...(data.status ? { status: data.status as never } : {}),
      ...(data.acknowledgedById ? { acknowledgedBy: { connect: { id: data.acknowledgedById } }, acknowledgedAt: new Date() } : {}),
      ...(data.resolvedById ? { resolvedBy: { connect: { id: data.resolvedById } }, resolvedAt: new Date() } : {}),
    });
  },
};
