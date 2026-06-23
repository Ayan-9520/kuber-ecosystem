import { PrismaClient } from '@prisma/client';

import { seedDemoCustomer } from './demo-customer.seed.js';
import { seedDemoDsaPartner } from './demo-dsa-partner.seed.js';
import { seedDemoLeads } from './demo-leads.seed.js';

/** Minimal users/leads for CI integration tests only — not used in dev/prod seed. */
export async function seedIntegrationFixtures(prisma: PrismaClient): Promise<void> {
  await seedDemoCustomer(prisma);
  await seedDemoDsaPartner(prisma);
  await seedDemoLeads(prisma);
  console.log('  → integration test fixtures seeded');
}
