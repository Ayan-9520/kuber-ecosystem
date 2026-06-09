import type { PrismaClient } from '@prisma/client';

const CATEGORIES = [
  { code: 'GENERAL_INQUIRY', name: 'General Inquiry', description: 'General customer inquiries', sortOrder: 1 },
  { code: 'LOAN_APPLICATION', name: 'Loan Application', description: 'Loan application support', sortOrder: 2 },
  { code: 'KYC', name: 'KYC', description: 'KYC verification issues', sortOrder: 3 },
  { code: 'DOCUMENTS', name: 'Documents', description: 'Document upload and verification', sortOrder: 4 },
  { code: 'ELIGIBILITY', name: 'Eligibility', description: 'Eligibility and qualification queries', sortOrder: 5 },
  { code: 'EMI', name: 'EMI', description: 'EMI calculator and repayment queries', sortOrder: 6 },
  { code: 'DISBURSEMENT', name: 'Disbursement', description: 'Disbursement status and issues', sortOrder: 7 },
  { code: 'COMMISSION', name: 'Commission', description: 'Partner commission queries', sortOrder: 8 },
  { code: 'REFERRAL', name: 'Referral', description: 'Referral program support', sortOrder: 9 },
  { code: 'TECHNICAL_ISSUE', name: 'Technical Issue', description: 'App and platform technical issues', sortOrder: 10 },
  { code: 'COMPLAINT', name: 'Complaint', description: 'Customer complaints', sortOrder: 11 },
];

export async function seedTicketCategories(prisma: PrismaClient): Promise<void> {
  for (const category of CATEGORIES) {
    await prisma.ticketCategory.upsert({
      where: { code: category.code },
      update: { name: category.name, description: category.description, sortOrder: category.sortOrder, isActive: true },
      create: category,
    });
  }
  console.log('  → ticket_categories seeded');
}
