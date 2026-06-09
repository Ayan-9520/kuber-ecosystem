import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

import { getS3Bucket, s3Client } from '../../../config/s3.js';
import { SIGNED_URL_EXPIRY_SECONDS } from '../constants/documents.constants.js';
import type { PresignedDownloadResult, PresignedUploadResult } from '../types/documents.types.js';

export const s3StorageService = {
  async uploadObject(
    s3Key: string,
    body: Buffer,
    mimeType: string,
    metadata?: Record<string, string>,
  ): Promise<void> {
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
    await s3Client.send(
      new DeleteObjectCommand({
        Bucket: getS3Bucket(),
        Key: s3Key,
      }),
    );
  },

  async objectExists(s3Key: string): Promise<boolean> {
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

  async getPresignedUploadUrl(
    s3Key: string,
    mimeType: string,
    expiresIn = SIGNED_URL_EXPIRY_SECONDS,
  ): Promise<PresignedUploadResult> {
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
    const command = new GetObjectCommand({
      Bucket: getS3Bucket(),
      Key: s3Key,
      ResponseContentDisposition: fileName ? `attachment; filename="${fileName}"` : undefined,
    });
    const downloadUrl = await getSignedUrl(s3Client, command, { expiresIn });
    return { downloadUrl, expiresIn };
  },
};
