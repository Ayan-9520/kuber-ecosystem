import { createHash } from 'node:crypto';

import { PutObjectCommand } from '@aws-sdk/client-s3';

import { env } from '../../../config/env.js';
import { s3Client } from '../../../config/s3.js';

export function getBackupBucket(): string {
  return process.env.AWS_S3_BACKUP_BUCKET ?? `${env.AWS_S3_BUCKET ?? 'kuberone-documents'}-backups`;
}

export const backupS3Service = {
  async uploadBackup(key: string, body: Buffer, mimeType: string, metadata?: Record<string, string>) {
    const checksum = createHash('sha256').update(body).digest('hex');
    await s3Client.send(
      new PutObjectCommand({
        Bucket: getBackupBucket(),
        Key: key,
        Body: body,
        ContentType: mimeType,
        ServerSideEncryption: 'AES256',
        Metadata: { ...metadata, checksum },
      }),
    );
    return { checksum, sizeBytes: body.length, bucket: getBackupBucket(), key };
  },

  buildKey(scope: string, fileName: string): string {
    const date = new Date().toISOString().slice(0, 10);
    return `backups/${scope.toLowerCase()}/${date}/${fileName}`;
  },
};
