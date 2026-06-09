import { randomUUID } from 'crypto';

import { prisma } from '../../../config/database.js';

const PRESIGN_TTL_MS = 15 * 60 * 1000;

export const presignedUploadRepository = {
  create: (data: {
    requestedById: string;
    s3Key: string;
    documentTypeId: string;
    ownerType: string;
    customerId?: string;
    leadId?: string;
    applicationId?: string;
    partnerId?: string;
    employeeId?: string;
    fileName: string;
    mimeType: string;
    fileSizeBytes: number;
  }) => {
    const uploadToken = randomUUID();
    const expiresAt = new Date(Date.now() + PRESIGN_TTL_MS);
    return prisma.presignedUploadIntent.create({
      data: {
        uploadToken,
        s3Key: data.s3Key,
        requestedById: data.requestedById,
        documentTypeId: data.documentTypeId,
        ownerType: data.ownerType as never,
        customerId: data.customerId,
        leadId: data.leadId,
        applicationId: data.applicationId,
        partnerId: data.partnerId,
        employeeId: data.employeeId,
        fileName: data.fileName,
        mimeType: data.mimeType,
        fileSizeBytes: data.fileSizeBytes,
        expiresAt,
      },
    });
  },

  findValidByToken: (uploadToken: string, requestedById: string) =>
    prisma.presignedUploadIntent.findFirst({
      where: {
        uploadToken,
        requestedById,
        consumedAt: null,
        expiresAt: { gt: new Date() },
      },
    }),

  markConsumed: (id: string) =>
    prisma.presignedUploadIntent.update({
      where: { id },
      data: { consumedAt: new Date() },
    }),
};
