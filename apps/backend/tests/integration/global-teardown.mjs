import { execSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const backendDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

export default async function globalTeardown() {
  try {
    execSync('pnpm exec tsx tests/integration/report-coverage.ts', {
      cwd: backendDir,
      stdio: 'inherit',
    });
  } catch (error) {
    console.warn('[integration] Coverage report failed:', error.message);
  }

  try {
    const { disconnectDatabase } = await import('@kuberone/database');
    await disconnectDatabase();
  } catch (error) {
    console.warn('[integration] Database disconnect failed:', error.message);
  }

  console.log('[integration] Global teardown complete');
}
