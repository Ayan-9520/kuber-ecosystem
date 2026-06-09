import type { ScanDeficienciesInput } from '@kuberone/shared-validation';

import { prisma } from '../../../config/database.js';
import type { DeficiencyFinding } from '../types/documents.types.js';

export const deficiencyEngineService = {
  async scan(input: ScanDeficienciesInput): Promise<DeficiencyFinding[]> {
    const findings: DeficiencyFinding[] = [];
    const now = new Date();

    const documents = await prisma.document.findMany({
      where: {
        deletedAt: null,
        ...(input.applicationId ? { applicationId: input.applicationId } : {}),
        ...(input.customerId ? { customerId: input.customerId } : {}),
      },
      include: { documentType: true },
    });

    for (const doc of documents) {
      if (doc.status === 'REJECTED') {
        findings.push({
          deficiencyType: 'MISMATCH',
          description: `Document ${doc.documentCode} (${doc.documentType.name}) was rejected`,
          documentId: doc.id,
          documentTypeId: doc.documentTypeId,
        });
      }

      if (doc.status === 'DEFICIENT') {
        findings.push({
          deficiencyType: 'INSUFFICIENT',
          description: `Document ${doc.documentCode} marked deficient`,
          documentId: doc.id,
          documentTypeId: doc.documentTypeId,
        });
      }

      if (doc.expiresAt && doc.expiresAt < now) {
        findings.push({
          deficiencyType: 'EXPIRED',
          description: `Document ${doc.documentCode} expired on ${doc.expiresAt.toISOString().slice(0, 10)}`,
          documentId: doc.id,
          documentTypeId: doc.documentTypeId,
        });
      }

      const latestOcr = await prisma.ocrResult.findFirst({
        where: { documentId: doc.id },
        orderBy: { processedAt: 'desc' },
      });

      if (doc.documentType.requiresOcr && latestOcr && Number(latestOcr.confidenceScore) < 50) {
        findings.push({
          deficiencyType: 'ILLEGIBLE',
          description: `Document ${doc.documentCode} has low OCR confidence (${latestOcr.confidenceScore})`,
          documentId: doc.id,
          documentTypeId: doc.documentTypeId,
        });
      }
    }

    const pendingRequests = await prisma.documentRequest.findMany({
      where: {
        status: 'PENDING',
        ...(input.applicationId ? { applicationId: input.applicationId } : {}),
        ...(input.customerId ? { customerId: input.customerId } : {}),
      },
      include: { documentType: true },
    });

    for (const req of pendingRequests) {
      findings.push({
        deficiencyType: 'MISSING',
        description: `Missing document: ${req.documentType.name}`,
        documentTypeId: req.documentTypeId,
        documentRequestId: req.id,
      });
    }

    if (input.requiredDocumentTypeIds?.length) {
      const presentTypeIds = new Set(documents.map((d) => d.documentTypeId));
      for (const typeId of input.requiredDocumentTypeIds) {
        if (!presentTypeIds.has(typeId)) {
          const docType = await prisma.documentType.findUnique({ where: { id: typeId } });
          findings.push({
            deficiencyType: 'MISSING',
            description: `Required document missing: ${docType?.name ?? typeId}`,
            documentTypeId: typeId,
          });
        }
      }
    }

    return findings;
  },
};
