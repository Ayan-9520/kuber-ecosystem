import type { PrismaClient } from '@prisma/client';

const ROLES = [
  { code: 'SUPER_ADMIN', name: 'Super Admin', description: 'Full platform access', isSystem: true },
  { code: 'ADMIN', name: 'Admin', description: 'Platform administrator', isSystem: true },
  { code: 'MANAGEMENT', name: 'Management', description: 'Executive management dashboards', isSystem: true },
  { code: 'COMPLIANCE_MANAGER', name: 'Compliance Manager', description: 'Compliance and audit oversight', isSystem: true },
  { code: 'REGIONAL_MANAGER', name: 'Regional Manager', description: 'Regional operations lead', isSystem: true },
  { code: 'BRANCH_MANAGER', name: 'Branch Manager', description: 'Branch operations lead', isSystem: true },
  { code: 'RELATIONSHIP_MANAGER', name: 'Relationship Manager', description: 'Customer relationship management', isSystem: true },
  { code: 'SALES_EXECUTIVE', name: 'Sales Executive', description: 'Lead and application sales', isSystem: true },
  { code: 'CREDIT_EXECUTIVE', name: 'Credit Executive', description: 'Credit review leadership', isSystem: true },
  { code: 'CREDIT_ANALYST', name: 'Credit Analyst', description: 'Credit review and analysis', isSystem: true },
  { code: 'OPERATIONS_EXECUTIVE', name: 'Operations Executive', description: 'LOS operations leadership', isSystem: true },
  { code: 'OPS_EXECUTIVE', name: 'Operations Executive', description: 'LOS operations', isSystem: true },
  { code: 'SUPPORT', name: 'Support', description: 'Customer support agent', isSystem: true },
  { code: 'DSA_PARTNER', name: 'DSA Partner', description: 'DSA mobile app user', isSystem: true },
  { code: 'CUSTOMER', name: 'Customer', description: 'Customer mobile app user', isSystem: true },
];

export async function seedRoles(prisma: PrismaClient): Promise<void> {
  for (const role of ROLES) {
    await prisma.role.upsert({
      where: { code: role.code },
      update: { name: role.name, description: role.description },
      create: role,
    });
  }
  console.log('  → roles seeded');
}
