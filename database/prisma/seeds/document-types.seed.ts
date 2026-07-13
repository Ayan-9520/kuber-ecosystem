import type { PrismaClient } from '@prisma/client';
import { DocumentTypeCategory } from '@prisma/client';

const DOCUMENT_TYPES = [
  { code: 'PAN', name: 'PAN Card', category: DocumentTypeCategory.KYC, requiresOcr: true },
  { code: 'AADHAAR', name: 'Aadhaar Card', category: DocumentTypeCategory.KYC, requiresOcr: true },
  { code: 'ADDRESS_PROOF', name: 'Address Proof', category: DocumentTypeCategory.KYC, requiresOcr: false },
  { code: 'BANK_STATEMENT', name: 'Bank Statement', category: DocumentTypeCategory.INCOME, requiresOcr: false },
  { code: 'INCOME_PROOF', name: 'Income Proof', category: DocumentTypeCategory.INCOME, requiresOcr: false },
  { code: 'SALARY_SLIP', name: 'Salary Slip', category: DocumentTypeCategory.INCOME, requiresOcr: true },
  { code: 'ITR', name: 'Income Tax Return', category: DocumentTypeCategory.INCOME, requiresOcr: true },
  { code: 'GST', name: 'GST Certificate', category: DocumentTypeCategory.BUSINESS, requiresOcr: true },
  { code: 'PROPERTY_DOCUMENT', name: 'Property Document', category: DocumentTypeCategory.PROPERTY, requiresOcr: true },
  { code: 'VEHICLE_DOCUMENT', name: 'Vehicle Document', category: DocumentTypeCategory.VEHICLE, requiresOcr: true },
  { code: 'VEHICLE_RC', name: 'Vehicle RC', category: DocumentTypeCategory.VEHICLE, requiresOcr: true },
  { code: 'INVOICE', name: 'Invoice / Proforma', category: DocumentTypeCategory.VEHICLE, requiresOcr: false },
  { code: 'BUSINESS_DOCUMENT', name: 'Business Document', category: DocumentTypeCategory.BUSINESS, requiresOcr: false },
  { code: 'BUSINESS_PROOF', name: 'Business Proof', category: DocumentTypeCategory.BUSINESS, requiresOcr: false },
  { code: 'MACHINE_QUOTATION', name: 'Machine Quotation', category: DocumentTypeCategory.BUSINESS, requiresOcr: false },
  { code: 'AGE_PROOF', name: 'Age Proof', category: DocumentTypeCategory.IDENTITY, requiresOcr: true },
  { code: 'MEDICAL_REPORT', name: 'Medical Report', category: DocumentTypeCategory.OTHER, requiresOcr: false },
  { code: 'PHOTO', name: 'Photo', category: DocumentTypeCategory.IDENTITY, requiresOcr: false },
  { code: 'SIGNATURE', name: 'Signature', category: DocumentTypeCategory.IDENTITY, requiresOcr: false },
  { code: 'CHEQUE', name: 'Cancelled Cheque', category: DocumentTypeCategory.KYC, requiresOcr: true },
];

const DEFAULT_MIME = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];

export async function seedDocumentTypes(prisma: PrismaClient): Promise<void> {
  for (const type of DOCUMENT_TYPES) {
    await prisma.documentType.upsert({
      where: { code: type.code },
      update: {
        name: type.name,
        category: type.category,
        requiresOcr: type.requiresOcr,
        isActive: true,
      },
      create: {
        code: type.code,
        name: type.name,
        category: type.category,
        allowedMimeTypes: DEFAULT_MIME,
        maxSizeMb: 10,
        requiresOcr: type.requiresOcr,
        isActive: true,
      },
    });
  }

  console.log('  → document_types seeded');
}
