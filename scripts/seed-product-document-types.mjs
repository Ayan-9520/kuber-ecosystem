import { PrismaClient, DocumentTypeCategory } from '@prisma/client';

const prisma = new PrismaClient();

const types = [
  { code: 'VEHICLE_RC', name: 'Vehicle RC', category: DocumentTypeCategory.VEHICLE, requiresOcr: true },
  { code: 'INVOICE', name: 'Invoice / Proforma', category: DocumentTypeCategory.VEHICLE, requiresOcr: false },
  { code: 'BUSINESS_PROOF', name: 'Business Proof', category: DocumentTypeCategory.BUSINESS, requiresOcr: false },
  { code: 'MACHINE_QUOTATION', name: 'Machine Quotation', category: DocumentTypeCategory.BUSINESS, requiresOcr: false },
  { code: 'AGE_PROOF', name: 'Age Proof', category: DocumentTypeCategory.IDENTITY, requiresOcr: true },
  { code: 'MEDICAL_REPORT', name: 'Medical Report', category: DocumentTypeCategory.OTHER, requiresOcr: false },
] ;

const mime = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];

async function main() {
  for (const type of types) {
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
        allowedMimeTypes: mime,
        maxSizeMb: 10,
        requiresOcr: type.requiresOcr,
        isActive: true,
      },
    });
    console.log('upserted', type.code);
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (err) => {
    console.error(err);
    await prisma.$disconnect();
    process.exit(1);
  });
