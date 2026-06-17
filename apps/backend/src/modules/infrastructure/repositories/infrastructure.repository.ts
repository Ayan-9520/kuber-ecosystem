import type { Prisma } from '@kuberone/database';
import { prisma } from '@kuberone/database';

export class InfrastructureRepository {
  async listEnvironments(where: Prisma.InfrastructureEnvironmentWhereInput, skip: number, take: number) {
    const [items, total] = await Promise.all([
      prisma.infrastructureEnvironment.findMany({
        where,
        skip,
        take,
        orderBy: { type: 'asc' },
        include: { _count: { select: { services: true, domains: true } } },
      }),
      prisma.infrastructureEnvironment.count({ where }),
    ]);
    return { items, total };
  }

  async findEnvironmentByCode(code: string) {
    return prisma.infrastructureEnvironment.findUnique({
      where: { code },
      include: { services: true, domains: true },
    });
  }

  async findEnvironment(id: string) {
    return prisma.infrastructureEnvironment.findUnique({
      where: { id },
      include: { services: true, domains: true },
    });
  }

  async listServices(where: Prisma.InfrastructureServiceWhereInput, skip: number, take: number) {
    const [items, total] = await Promise.all([
      prisma.infrastructureService.findMany({
        where,
        skip,
        take,
        orderBy: { serviceType: 'asc' },
        include: { environment: { select: { code: true, name: true, type: true } } },
      }),
      prisma.infrastructureService.count({ where }),
    ]);
    return { items, total };
  }

  async listDomains(where: Prisma.InfrastructureDomainWhereInput, skip: number, take: number) {
    const [items, total] = await Promise.all([
      prisma.infrastructureDomain.findMany({ where, skip, take, orderBy: { hostname: 'asc' } }),
      prisma.infrastructureDomain.count({ where }),
    ]);
    return { items, total };
  }

  async listHealthSnapshots(where: Prisma.InfrastructureHealthSnapshotWhereInput, skip: number, take: number) {
    const [items, total] = await Promise.all([
      prisma.infrastructureHealthSnapshot.findMany({
        where,
        skip,
        take,
        orderBy: { checkedAt: 'desc' },
        include: { service: { select: { name: true, serviceType: true } } },
      }),
      prisma.infrastructureHealthSnapshot.count({ where }),
    ]);
    return { items, total };
  }

  async listConfigs(category?: string) {
    return prisma.infrastructureConfig.findMany({
      where: category ? { category } : undefined,
      orderBy: { key: 'asc' },
    });
  }

  async getDashboardStats() {
    const [environments, services, healthy, degraded, unhealthy, domains, recentHealth] = await Promise.all([
      prisma.infrastructureEnvironment.count({ where: { isActive: true } }),
      prisma.infrastructureService.count(),
      prisma.infrastructureService.count({ where: { status: 'HEALTHY' } }),
      prisma.infrastructureService.count({ where: { status: 'DEGRADED' } }),
      prisma.infrastructureService.count({ where: { status: 'UNHEALTHY' } }),
      prisma.infrastructureDomain.count({ where: { isActive: true } }),
      prisma.infrastructureHealthSnapshot.findMany({
        take: 10,
        orderBy: { checkedAt: 'desc' },
        include: { service: true, environment: { select: { code: true } } },
      }),
    ]);

    return {
      environments,
      services: { total: services, healthy, degraded, unhealthy },
      domains,
      recentHealth,
      availabilityPercent: services > 0 ? Math.round((healthy / services) * 100) : 100,
    };
  }
}

export const infrastructureRepository = new InfrastructureRepository();
