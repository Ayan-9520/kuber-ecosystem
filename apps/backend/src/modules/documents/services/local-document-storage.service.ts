import { access, mkdir, readFile, stat, unlink, writeFile } from 'node:fs/promises';
import { dirname, normalize, resolve } from 'node:path';

const STORAGE_ROOT = resolve(process.cwd(), 'storage', 'documents');

function resolveLocalPath(storageKey: string): string {
  const normalizedKey = normalize(storageKey).replace(/^(\.\.(\/|\\|$))+/, '');
  const fullPath = resolve(STORAGE_ROOT, normalizedKey);
  if (!fullPath.startsWith(STORAGE_ROOT)) {
    throw new Error('Invalid storage key');
  }
  return fullPath;
}

export const localDocumentStorageService = {
  getRoot(): string {
    return STORAGE_ROOT;
  },

  async uploadObject(storageKey: string, body: Buffer): Promise<void> {
    const filePath = resolveLocalPath(storageKey);
    await mkdir(dirname(filePath), { recursive: true });
    await writeFile(filePath, body);
  },

  async deleteObject(storageKey: string): Promise<void> {
    try {
      await unlink(resolveLocalPath(storageKey));
    } catch {
      // ignore missing files
    }
  },

  async objectExists(storageKey: string): Promise<boolean> {
    try {
      await access(resolveLocalPath(storageKey));
      return true;
    } catch {
      return false;
    }
  },

  async getObjectMetadata(storageKey: string): Promise<{
    contentType?: string;
    contentLength?: number;
    exists: boolean;
  }> {
    try {
      const fileStat = await stat(resolveLocalPath(storageKey));
      return { contentLength: fileStat.size, exists: true };
    } catch {
      return { exists: false };
    }
  },

  async readObject(storageKey: string): Promise<Buffer> {
    return readFile(resolveLocalPath(storageKey));
  },

  resolvePath(storageKey: string): string {
    return resolveLocalPath(storageKey);
  },
};
