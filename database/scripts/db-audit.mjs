import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const leadCount = await prisma.lead.count();
  const recent = await prisma.lead.findMany({
    take: 12,
    orderBy: { createdAt: 'desc' },
    select: {
      leadNumber: true,
      prospectName: true,
      prospectPhone: true,
      status: true,
      partner: { select: { partnerCode: true } },
      source: { select: { code: true } },
      createdAt: true,
    },
  });

  const tables = await prisma.$queryRaw`
    SELECT table_name AS name, table_rows AS approx_rows
    FROM information_schema.tables
    WHERE table_schema = DATABASE()
    ORDER BY table_name
  `;

  const leadTables = tables.filter((t) => String(t.name).startsWith('lead'));

  console.log('=== DATABASE AUDIT ===');
  console.log('Total tables:', tables.length);
  console.log('Leads in `leads` table:', leadCount);
  console.log('\nLead-related tables:');
  for (const t of leadTables) {
    console.log(`  ${t.name}: ~${t.approx_rows} rows`);
  }
  console.log('\nRecent leads:');
  for (const l of recent) {
    console.log(
      `  ${l.leadNumber} | ${l.prospectName} | ${l.prospectPhone} | ${l.status} | partner=${l.partner?.partnerCode ?? '-'} | source=${l.source?.code}`,
    );
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
