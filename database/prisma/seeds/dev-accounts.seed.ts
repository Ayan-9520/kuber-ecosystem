import { PrismaClient } from '@prisma/client';

import { seedDemoCustomer } from './demo-customer.seed.js';
import { seedDemoDsaPartner } from './demo-dsa-partner.seed.js';

/** Local dev login accounts only — OTP is always 123456 when APP_ENV≠production. */
export async function seedDevAccounts(prisma: PrismaClient): Promise<void> {
  await seedDemoCustomer(prisma);
  await seedDemoDsaPartner(prisma);
  console.log('  → dev accounts ready (customer 9876543210, DSA 8888777766, OTP 123456)');
}
