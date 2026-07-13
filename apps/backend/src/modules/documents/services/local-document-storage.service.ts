import { mkdir, access, readFile, stat, unlink, writeFile } from 'node:fs/promises';
import { dirname, normalize, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Resolve local document storage root.
 * Docker runs `node apps/backend/dist/server.js` with cwd=/app, so process.cwd()/storage
 * is wrong — use package-relative path (volume: /app/apps/backend/storage).
 */
function resolveStorageRoot(): string {
  const fromEnv = process.env.DOCUMENT_STORAGE_PATH?.trim();
  if (fromEnv) {
    return resolve(fromEnv);
  }

  // dist/modules/documents/services → apps/backend
  const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../../../..');
  return resolve(packageRoot, 'storage', 'documents');
}

const STORAGE_ROOT = resolveStorageRoot();

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

  async ensureRoot(): Promise<void> {
    await mkdir(STORAGE_ROOT, { recursive: true });
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
