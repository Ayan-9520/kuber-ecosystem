import { PrismaClient } from '@prisma/client';

const DEFAULT_DATABASE_URL = 'mysql://root@127.0.0.1:3306/kuberone_dev';
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = DEFAULT_DATABASE_URL;
}

const prisma = new PrismaClient();

async function main() {
  const dbName = await prisma.$queryRaw`SELECT DATABASE() AS name`;
  const tableCount = await prisma.$queryRaw`
    SELECT COUNT(*) AS cnt FROM information_schema.tables WHERE table_schema = DATABASE()
  `;

  const apps = await prisma.application.count();
  const leads = await prisma.lead.count();
  const partners = await prisma.partner.count();
  const customers = await prisma.customer.count();

  const recentApps = await prisma.application.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    select: {
      applicationNumber: true,
      status: true,
      requestedAmount: true,
      createdAt: true,
      customer: { select: { fullName: true } },
      product: { select: { name: true } },
    },
  });

  const sampleTables = await prisma.$queryRaw`
    SELECT table_name AS name
    FROM information_schema.tables
    WHERE table_schema = DATABASE()
      AND table_name IN ('leads','applications','customers','partners','products','users','ai_models','ai_prompts')
    ORDER BY table_name
  `;

  console.log('=== ACTIVE DATABASE ===');
  console.log(JSON.stringify(dbName, null, 2));
  console.log('Total tables:', tableCount[0]?.cnt ?? tableCount);
  console.log('\n=== COUNTS ===');
  console.log({ applications: apps, leads, partners, customers });
  console.log('\n=== KEY TABLES EXIST ===');
  console.log(sampleTables);
  console.log('\n=== RECENT APPLICATIONS ===');
  console.log(JSON.stringify(recentApps, null, 2));
}

main()
  .finally(() => prisma.$disconnect());
