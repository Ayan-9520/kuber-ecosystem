import type { AuthenticatedUser } from '@kuberone/shared-types';
import type { ListMonitoringAlertsQuery, UpdateMonitoringAlertInput } from '@kuberone/shared-validation';

import { NotFoundError } from '../../../shared/errors/app-error.js';
import { monitoringRepository } from '../repositories/monitoring.repository.js';

function buildPaginationMeta(page: number, limit: number, total: number) {
  return { page, limit, total, totalPages: Math.ceil(total / limit) || 1 };
}

export const monitoringAlertService = {
  async list(_actor: AuthenticatedUser, query: ListMonitoringAlertsQuery) {
    const { page, limit, sortBy, sortOrder, status, severity, component, search } = query;
    const where = {
      ...(status ? { status } : {}),
      ...(severity ? { severity } : {}),
      ...(component ? { component } : {}),
      ...(search
        ? {
            OR: [
              { title: { contains: search } },
              { code: { contains: search } },
              { description: { contains: search } },
            ],
          }
        : {}),
    };
    const [items, total] = await Promise.all([
      monitoringRepository.alert.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          rule: { select: { id: true, code: true, name: true } },
          acknowledgedBy: { select: { id: true, email: true } },
          resolvedBy: { select: { id: true, email: true } },
        },
      }),
      monitoringRepository.alert.count(where),
    ]);
    return { items, meta: buildPaginationMeta(page, limit, total) };
  },

  async getById(_actor: AuthenticatedUser, id: string) {
    const alert = await monitoringRepository.alert.findById(id);
    if (!alert) throw new NotFoundError('MonitoringAlert', id);
    return alert;
  },

  async update(actor: AuthenticatedUser, id: string, input: UpdateMonitoringAlertInput) {
    const alert = await monitoringRepository.alert.findById(id);
    if (!alert) throw new NotFoundError('MonitoringAlert', id);

    const now = new Date();
    return monitoringRepository.alert.update(id, {
      ...(input.status !== undefined ? { status: input.status } : {}),
      ...(input.status === 'ACKNOWLEDGED'
        ? { acknowledgedBy: { connect: { id: actor.id } }, acknowledgedAt: now }
        : {}),
      ...(input.status === 'RESOLVED'
        ? { resolvedBy: { connect: { id: actor.id } }, resolvedAt: now, status: 'RESOLVED' }
        : {}),
      ...(input.comments ? { metadata: { comments: input.comments } } : {}),
    });
  },

  async summary() {
    const [open, critical, high, rules] = await Promise.all([
      monitoringRepository.alert.count({ status: 'OPEN' }),
      monitoringRepository.alert.count({ status: 'OPEN', severity: 'CRITICAL' }),
      monitoringRepository.alert.count({ status: 'OPEN', severity: 'HIGH' }),
      monitoringRepository.alertRule.count({ isActive: true }),
    ]);
    return { openAlerts: open, criticalAlerts: critical, highAlerts: high, activeRules: rules, totalAlertRules: 12 };
  },
};
