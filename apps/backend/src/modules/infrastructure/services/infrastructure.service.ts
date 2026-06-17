import type { Prisma } from '@kuberone/database';

import { NotFoundError } from '../../../shared/errors/app-error.js';
import { monitoringHealthService } from '../../monitoring/services/monitoring-health.service.js';
import { PRODUCTION_DOMAINS, TARGET_SCALE } from '../constants/infrastructure.constants.js';
import { infrastructureRepository } from '../repositories/infrastructure.repository.js';

export class InfrastructureService {
  async getOverview() {
    const dashboard = await infrastructureRepository.getDashboardStats();
    const apiHealth = await monitoringHealthService.deepHealth().catch(() => null);

    return {
      ...dashboard,
      targetScale: TARGET_SCALE,
      productionDomains: PRODUCTION_DOMAINS,
      liveHealth: apiHealth,
      architecture: {
        layers: ['Cloudflare', 'AWS ALB', 'Nginx', 'Backend Cluster', 'Redis', 'PostgreSQL', 'S3', 'Monitoring'],
        cloud: 'aws',
        futureClouds: ['azure', 'gcp'],
        deploymentStrategies: ['blue-green', 'rolling', 'zero-downtime'],
      },
      security: {
        wafReady: true,
        ddosProtection: 'cloudflare',
        encryptionAtRest: true,
        encryptionInTransit: true,
        leastPrivilegeIam: true,
      },
    };
  }

  async listEnvironments(query: { page: number; limit: number; type?: string; isActive?: boolean }) {
    const where: Prisma.InfrastructureEnvironmentWhereInput = {};
    if (query.type) where.type = query.type as Prisma.EnumInfraEnvironmentTypeFilter['equals'];
    if (query.isActive !== undefined) where.isActive = query.isActive;

    const skip = (query.page - 1) * query.limit;
    return infrastructureRepository.listEnvironments(where, skip, query.limit);
  }

  async getEnvironment(code: string) {
    const env = await infrastructureRepository.findEnvironmentByCode(code);
    if (!env) throw new NotFoundError('Environment not found');
    return env;
  }

  async listServices(query: {
    page: number;
    limit: number;
    environmentId?: string;
    serviceType?: string;
    status?: string;
  }) {
    const where: Prisma.InfrastructureServiceWhereInput = {};
    if (query.environmentId) where.environmentId = query.environmentId;
    if (query.serviceType) where.serviceType = query.serviceType as Prisma.EnumInfraServiceTypeFilter['equals'];
    if (query.status) where.status = query.status as Prisma.EnumInfraHealthStatusFilter['equals'];

    const skip = (query.page - 1) * query.limit;
    return infrastructureRepository.listServices(where, skip, query.limit);
  }

  async listDomains(query: { page: number; limit: number; environmentId?: string }) {
    const where: Prisma.InfrastructureDomainWhereInput = {};
    if (query.environmentId) where.environmentId = query.environmentId;

    const skip = (query.page - 1) * query.limit;
    return infrastructureRepository.listDomains(where, skip, query.limit);
  }

  async listHealth(query: {
    page: number;
    limit: number;
    environmentId?: string;
    serviceId?: string;
    hours?: number;
  }) {
    const where: Prisma.InfrastructureHealthSnapshotWhereInput = {};
    if (query.environmentId) where.environmentId = query.environmentId;
    if (query.serviceId) where.serviceId = query.serviceId;
    if (query.hours) {
      where.checkedAt = { gte: new Date(Date.now() - query.hours * 3_600_000) };
    }

    const skip = (query.page - 1) * query.limit;
    return infrastructureRepository.listHealthSnapshots(where, skip, query.limit);
  }

  async getConfigs(category?: string) {
    const configs = await infrastructureRepository.listConfigs(category);
    return configs.map((c) => ({
      ...c,
      value: c.isSecret ? '***' : c.value,
    }));
  }

  async getDeploymentStatus() {
    const prod = await infrastructureRepository.findEnvironmentByCode('production');
    if (!prod) {
      return { environment: null, services: [], message: 'Production environment not seeded' };
    }

    const services = prod.services.map((s) => ({
      name: s.name,
      type: s.serviceType,
      status: s.status,
      replicas: s.replicas,
      endpoint: s.endpoint,
      lastCheckedAt: s.lastCheckedAt,
    }));

    return {
      environment: { code: prod.code, region: prod.region, type: prod.type },
      services,
      domains: prod.domains,
      strategies: ['blue-green', 'rolling', 'canary-ready'],
    };
  }
}

export const infrastructureService = new InfrastructureService();
