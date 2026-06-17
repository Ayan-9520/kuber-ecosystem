import { randomUUID } from 'node:crypto';

import { getPrisma } from './db.js';

const partnerCache = new Map<string, string>();
const lenderCache = new Map<string, string>();

export async function getAdminEmployee() {
  const prisma = getPrisma();
  const user = await prisma.user.findFirst({ where: { email: 'admin@kuberone.com' } });
  if (!user) throw new Error('Admin user missing from seeds');
  const employee = await prisma.employee.findFirst({ where: { userId: user.id } });
  if (!employee) throw new Error('Admin employee missing from seeds');
  return { user, employee };
}

export async function ensureIntegrationPartner(code = 'INT-PARTNER-001') {
  if (partnerCache.has(code)) {
    return { partnerId: partnerCache.get(code)! };
  }

  const prisma = getPrisma();
  const existingPartner = await prisma.partner.findFirst({ where: { partnerCode: code } });
  if (existingPartner) {
    partnerCache.set(code, existingPartner.id);
    return { partnerId: existingPartner.id, userId: existingPartner.userId };
  }
  const partnerType = await prisma.partnerType.findFirst({ where: { code: 'CHANNEL_PARTNER' } });
  if (!partnerType) throw new Error('Partner type seed missing');

  const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const phone = `9${suffix.replace(/\D/g, '').slice(-9)}`;
  const user = await prisma.user.create({
    data: {
      phone,
      email: `${code.toLowerCase()}-${suffix}@integration.test`,
      userType: 'PARTNER',
      status: 'ACTIVE',
      phoneVerified: true,
    },
  });

  const partner = await prisma.partner.create({
    data: {
      userId: user.id,
      partnerTypeId: partnerType.id,
      partnerCode: code,
      contactName: 'Integration Partner',
      phone,
      status: 'ACTIVE',
      kycStatus: 'VERIFIED',
    },
  });

  const dsaRole = await prisma.role.findFirst({ where: { code: 'DSA_PARTNER' } });
  if (dsaRole) {
    await prisma.userRole.create({
      data: { userId: user.id, roleId: dsaRole.id, isPrimary: true },
    });
  }

  partnerCache.set(code, partner.id);
  return { partnerId: partner.id, userId: user.id, phone };
}

export async function ensureIntegrationLender(code = 'INT-HDFC') {
  if (lenderCache.has(code)) {
    return { lenderId: lenderCache.get(code)! };
  }

  const prisma = getPrisma();
  const lender = await prisma.lender.upsert({
    where: { code },
    update: { isActive: true },
    create: {
      code,
      name: 'Integration Test Lender',
      lenderType: 'BANK',
      integrationType: 'MANUAL',
      isActive: true,
    },
  });

  lenderCache.set(code, lender.id);
  return { lenderId: lender.id };
}

export async function getDocumentTypeId(code = 'PAN') {
  const prisma = getPrisma();
  const docType = await prisma.documentType.findFirst({ where: { code } });
  if (!docType) throw new Error(`Document type ${code} missing`);
  return docType.id;
}

export function tinyPngBase64(): string {
  return Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
    'base64',
  ).toString('base64');
}

export function uniquePhone(): string {
  return `9${randomUUID().replace(/\D/g, '').slice(0, 9)}`;
}
