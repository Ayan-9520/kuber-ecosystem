import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

import { getS3Bucket, s3Client } from '../../../config/s3.js';
import { AppError } from '../../../shared/errors/app-error.js';
import { SIGNED_URL_EXPIRY_SECONDS } from '../constants/documents.constants.js';
import type { PresignedDownloadResult, PresignedUploadResult } from '../types/documents.types.js';
import { buildLocalDownloadUrl, shouldUseLocalDocumentStorage } from '../utils/document-storage.util.js';

import { localDocumentStorageService } from './local-document-storage.service.js';

export const s3StorageService = {
  async uploadObject(
    s3Key: string,
    body: Buffer,
    mimeType: string,
    metadata?: Record<string, string>,
  ): Promise<void> {
    if (shouldUseLocalDocumentStorage()) {
      await localDocumentStorageService.uploadObject(s3Key, body);
      return;
    }

    await s3Client.send(
      new PutObjectCommand({
        Bucket: getS3Bucket(),
        Key: s3Key,
        Body: body,
        ContentType: mimeType,
        ServerSideEncryption: 'AES256',
        Metadata: metadata,
      }),
    );
  },

  async deleteObject(s3Key: string): Promise<void> {
    if (shouldUseLocalDocumentStorage()) {
      await localDocumentStorageService.deleteObject(s3Key);
      return;
    }

    await s3Client.send(
      new DeleteObjectCommand({
        Bucket: getS3Bucket(),
        Key: s3Key,
      }),
    );
  },

  async objectExists(s3Key: string): Promise<boolean> {
    if (shouldUseLocalDocumentStorage()) {
      return localDocumentStorageService.objectExists(s3Key);
    }

    try {
      await s3Client.send(
        new HeadObjectCommand({
          Bucket: getS3Bucket(),
          Key: s3Key,
        }),
      );
      return true;
    } catch {
      return false;
    }
  },

  async getObjectMetadata(s3Key: string): Promise<{
    contentType?: string;
    contentLength?: number;
    exists: boolean;
  }> {
    if (shouldUseLocalDocumentStorage()) {
      return localDocumentStorageService.getObjectMetadata(s3Key);
    }

    try {
      const head = await s3Client.send(
        new HeadObjectCommand({
          Bucket: getS3Bucket(),
          Key: s3Key,
        }),
      );
      return {
        contentType: head.ContentType,
        contentLength: head.ContentLength,
        exists: true,
      };
    } catch {
      return { exists: false };
    }
  },

  async getPresignedUploadUrl(
    s3Key: string,
    mimeType: string,
    expiresIn = SIGNED_URL_EXPIRY_SECONDS,
  ): Promise<PresignedUploadResult> {
    if (shouldUseLocalDocumentStorage()) {
      throw new AppError(
        503,
        'STORAGE_UNAVAILABLE',
        'Presigned upload is unavailable in local development. Use POST /documents/upload instead.',
      );
    }

    const command = new PutObjectCommand({
      Bucket: getS3Bucket(),
      Key: s3Key,
      ContentType: mimeType,
      ServerSideEncryption: 'AES256',
    });
    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn });
    return { uploadUrl, s3Key, expiresIn };
  },

  async getPresignedDownloadUrl(
    s3Key: string,
    fileName?: string,
    expiresIn = SIGNED_URL_EXPIRY_SECONDS,
  ): Promise<PresignedDownloadResult> {
    if (shouldUseLocalDocumentStorage()) {
      const downloadUrl = buildLocalDownloadUrl(s3Key);
      return { downloadUrl, expiresIn };
    }

    const command = new GetObjectCommand({
      Bucket: getS3Bucket(),
      Key: s3Key,
      ResponseContentDisposition: fileName ? `attachment; filename="${fileName}"` : undefined,
    });
    const downloadUrl = await getSignedUrl(s3Client, command, { expiresIn });
    return { downloadUrl, expiresIn };
  },

  async readObject(s3Key: string): Promise<Buffer> {
    if (shouldUseLocalDocumentStorage()) {
      return localDocumentStorageService.readObject(s3Key);
    }

    const response = await s3Client.send(
      new GetObjectCommand({
        Bucket: getS3Bucket(),
        Key: s3Key,
      }),
    );
    const body = response.Body;
    if (!body) {
      throw new AppError(404, 'STORAGE_OBJECT_MISSING', 'Document file not found in storage');
    }
    return Buffer.from(await body.transformToByteArray());
  },
};
