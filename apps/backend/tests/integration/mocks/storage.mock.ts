import { createHash } from 'node:crypto';

const objects = new Map<string, { body: Buffer; mimeType: string; metadata?: Record<string, string> }>();

export const s3StorageService = {
  async uploadObject(
    s3Key: string,
    body: Buffer,
    mimeType: string,
    metadata?: Record<string, string>,
  ): Promise<void> {
    objects.set(s3Key, { body, mimeType, metadata });
  },

  async deleteObject(s3Key: string): Promise<void> {
    objects.delete(s3Key);
  },

  async objectExists(s3Key: string): Promise<boolean> {
    return objects.has(s3Key);
  },

  async getObjectMetadata(s3Key: string): Promise<{
    contentType?: string;
    contentLength?: number;
    exists: boolean;
  }> {
    const entry = objects.get(s3Key);
    if (!entry) return { exists: false };
    return {
      contentType: entry.mimeType,
      contentLength: entry.body.length,
      exists: true,
    };
  },

  async getPresignedUploadUrl(s3Key: string, mimeType: string, expiresIn = 3600) {
    return { uploadUrl: `mock://upload/${s3Key}`, s3Key, expiresIn, mimeType };
  },

  async getPresignedDownloadUrl(s3Key: string, fileName?: string, expiresIn = 3600) {
    return {
      downloadUrl: `mock://download/${s3Key}?name=${encodeURIComponent(fileName ?? 'file')}`,
      expiresIn,
    };
  },
};

export function resetStorageMock(): void {
  objects.clear();
}

export function storageChecksum(body: Buffer): string {
  return createHash('sha256').update(body).digest('hex');
}
