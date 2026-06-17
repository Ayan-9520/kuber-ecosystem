import type { PrismaClient } from '@prisma/client';

const ENVIRONMENTS = [
  { code: 'development', name: 'Development', type: 'DEVELOPMENT' as const, region: 'ap-south-1', vpcCidr: '10.0.0.0/16' },
  { code: 'qa', name: 'QA', type: 'QA' as const, region: 'ap-south-1', vpcCidr: '10.1.0.0/16' },
  { code: 'staging', name: 'Staging', type: 'STAGING' as const, region: 'ap-south-1', vpcCidr: '10.2.0.0/16' },
  { code: 'production', name: 'Production', type: 'PRODUCTION' as const, region: 'ap-south-1', vpcCidr: '10.10.0.0/16' },
];

const PRODUCTION_SERVICES = [
  { serviceType: 'ALB' as const, name: 'AWS Application Load Balancer', endpoint: 'https://api.kuberone.com', status: 'HEALTHY' as const, replicas: 2 },
  { serviceType: 'NGINX' as const, name: 'Nginx Reverse Proxy', status: 'HEALTHY' as const, replicas: 2 },
  { serviceType: 'API' as const, name: 'KuberOne API Cluster', endpoint: 'https://api.kuberone.com', status: 'HEALTHY' as const, replicas: 4 },
  { serviceType: 'WORKER' as const, name: 'Background Workers', status: 'HEALTHY' as const, replicas: 2 },
  { serviceType: 'SCHEDULER' as const, name: 'Job Schedulers', status: 'HEALTHY' as const, replicas: 1 },
  { serviceType: 'NOTIFICATION_WORKER' as const, name: 'Notification Workers', status: 'HEALTHY' as const, replicas: 2 },
  { serviceType: 'AI_WORKER' as const, name: 'AI Platform Workers', status: 'HEALTHY' as const, replicas: 2 },
  { serviceType: 'REDIS' as const, name: 'ElastiCache Redis', status: 'HEALTHY' as const, replicas: 2 },
  { serviceType: 'DATABASE' as const, name: 'RDS MySQL (Primary)', status: 'HEALTHY' as const, replicas: 1 },
  { serviceType: 'S3' as const, name: 'Object Storage', endpoint: 's3://kuberone-production', status: 'HEALTHY' as const, replicas: 1 },
  { serviceType: 'PROMETHEUS' as const, name: 'Prometheus', status: 'HEALTHY' as const, replicas: 1 },
  { serviceType: 'GRAFANA' as const, name: 'Grafana', endpoint: 'https://grafana.internal.kuberone.com', status: 'HEALTHY' as const, replicas: 1 },
  { serviceType: 'LOKI' as const, name: 'Loki Log Aggregation', status: 'HEALTHY' as const, replicas: 1 },
  { serviceType: 'OTEL' as const, name: 'OpenTelemetry Collector', status: 'HEALTHY' as const, replicas: 1 },
];

const DOMAINS = [
  { hostname: 'api.kuberone.com', serviceType: 'API' as const, sslProvider: 'AWS_ACM' as const },
  { hostname: 'admin.kuberone.com', serviceType: 'NGINX' as const, sslProvider: 'AWS_ACM' as const },
  { hostname: 'customer.kuberone.com', serviceType: 'NGINX' as const, sslProvider: 'CLOUDFLARE' as const },
  { hostname: 'partner.kuberone.com', serviceType: 'NGINX' as const, sslProvider: 'CLOUDFLARE' as const },
];

const CONFIGS = [
  { key: 'TARGET_USERS', category: 'scale', value: '10000', description: 'Target registered users' },
  { key: 'TARGET_CONCURRENT', category: 'scale', value: '1000', description: 'Target concurrent users' },
  { key: 'MULTI_REGION', category: 'scale', value: 'true', description: 'Multi-region ready' },
  { key: 'WAF_ENABLED', category: 'security', value: 'true', description: 'AWS WAF + Cloudflare' },
  { key: 'RDS_ENGINE', category: 'database', value: 'mysql', description: 'Production database engine' },
  { key: 'REDIS_CLUSTER', category: 'cache', value: 'elasticache', description: 'Redis cluster mode' },
  { key: 'S3_VERSIONING', category: 'storage', value: 'enabled', description: 'S3 versioning enabled' },
  { key: 'S3_CRR', category: 'storage', value: 'ready', description: 'Cross-region replication ready' },
  { key: 'JWT_SECRET', category: 'secrets', value: 'managed-in-secrets-manager', isSecret: true },
  { key: 'OPENAI_API_KEY', category: 'secrets', value: 'managed-in-secrets-manager', isSecret: true },
  { key: 'DATABASE_URL', category: 'secrets', value: 'managed-in-secrets-manager', isSecret: true },
];

export async function seedInfrastructure(prisma: PrismaClient): Promise<void> {
  const existing = await prisma.infrastructureEnvironment.count();
  if (existing > 0) {
    console.log('  → infrastructure seed skipped (data exists)');
    return;
  }

  const envMap = new Map<string, string>();

  for (const e of ENVIRONMENTS) {
    const env = await prisma.infrastructureEnvironment.create({
      data: {
        code: e.code,
        name: e.name,
        type: e.type,
        region: e.region,
        vpcCidr: e.vpcCidr,
        metadata: { ha: e.type === 'PRODUCTION', drReady: e.type === 'PRODUCTION' },
      },
    });
    envMap.set(e.code, env.id);
  }

  const prodId = envMap.get('production')!;
  const now = Date.now();

  for (const s of PRODUCTION_SERVICES) {
    const service = await prisma.infrastructureService.create({
      data: {
        environmentId: prodId,
        serviceType: s.serviceType,
        name: s.name,
        endpoint: s.endpoint,
        status: s.status,
        replicas: s.replicas,
        lastCheckedAt: new Date(),
        version: '1.0.0',
      },
    });

    await prisma.infrastructureHealthSnapshot.create({
      data: {
        environmentId: prodId,
        serviceId: service.id,
        status: s.status,
        latencyMs: 12 + Math.floor(Math.random() * 40),
        cpuPercent: 20 + Math.random() * 30,
        memoryPercent: 35 + Math.random() * 25,
        checkedAt: new Date(now - Math.random() * 3_600_000),
      },
    });
  }

  for (const d of DOMAINS) {
    await prisma.infrastructureDomain.create({
      data: {
        environmentId: prodId,
        hostname: d.hostname,
        serviceType: d.serviceType,
        sslProvider: d.sslProvider,
        sslExpiresAt: new Date(now + 90 * 86_400_000),
        hstsEnabled: true,
      },
    });
  }

  for (const c of CONFIGS) {
    await prisma.infrastructureConfig.create({ data: c });
  }

  console.log('  → infrastructure seeded');
}
