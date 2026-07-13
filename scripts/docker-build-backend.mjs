#!/usr/bin/env node
/** Transpile backend for Docker (esbuild — avoids monorepo tsc path issues). */
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
const esbuildPath = [
  path.join(root, 'node_modules/esbuild'),
  path.join(root, 'node_modules/tsx/node_modules/esbuild'),
].find((candidate) => fs.existsSync(path.join(candidate, 'package.json')));
if (!esbuildPath) {
  throw new Error('esbuild not found — run pnpm install');
}
const { build } = require(esbuildPath);
const srcDir = path.join(root, 'apps/backend/src');
const outDir = path.join(root, 'apps/backend/dist');

function collectTsFiles(dir) {
  const entries = [];
  for (const name of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, name.name);
    if (name.isDirectory()) entries.push(...collectTsFiles(full));
    else if (name.name.endsWith('.ts') && !name.name.endsWith('.d.ts')) entries.push(full);
  }
  return entries;
}

const entryPoints = collectTsFiles(srcDir);
if (entryPoints.length === 0) {
  throw new Error(`No TypeScript sources under ${srcDir}`);
}

await build({
  entryPoints,
  outdir: outDir,
  outbase: srcDir,
  platform: 'node',
  format: 'esm',
  target: 'node20',
  packages: 'external',
  logLevel: 'info',
  sourcemap: false,
});

console.log(`Transpiled ${entryPoints.length} files -> ${outDir}`);
