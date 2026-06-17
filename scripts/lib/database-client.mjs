import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const repoRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

/**
 * Loads the built @kuberone/database package from scripts (monorepo root has no workspace alias).
 */
export async function loadDatabase() {
  const dbModuleUrl = pathToFileURL(path.join(repoRoot, 'database/dist/index.js')).href;
  return import(dbModuleUrl);
}
