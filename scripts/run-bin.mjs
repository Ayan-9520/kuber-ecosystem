#!/usr/bin/env node
/** Run a package bin from root node_modules (hoisted monorepo-safe). */
import { existsSync, readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const [binName, ...args] = process.argv.slice(2);

function isRunnableBin(filePath) {
  return /\.(?:m?js|cjs)$/i.test(filePath);
}

function resolvePackageBin(name) {
  const pkgDir = resolve(root, 'node_modules', name);
  const pkgJsonPath = resolve(pkgDir, 'package.json');
  if (!existsSync(pkgJsonPath)) return null;

  try {
    const pkg = JSON.parse(readFileSync(pkgJsonPath, 'utf8'));
    const binEntry = pkg.bin?.[name] ?? pkg.bin;
    if (typeof binEntry === 'string') {
      const resolved = resolve(pkgDir, binEntry);
      if (existsSync(resolved)) return resolved;
    }
  } catch {
    // fall through to legacy candidates
  }

  const legacy = [
    resolve(pkgDir, 'bin', `${name}.js`),
    resolve(pkgDir, 'bin', name),
    resolve(pkgDir, `${name}.mjs`),
  ];
  return legacy.find((p) => existsSync(p)) ?? null;
}

const candidates = [
  resolvePackageBin(binName),
  resolve(root, 'node_modules', binName, 'bin', `${binName}.js`),
  resolve(root, 'node_modules', binName, 'bin', binName),
  resolve(root, 'node_modules', binName, `${binName}.mjs`),
].filter(Boolean);

const binPath = candidates.find((p) => existsSync(p) && isRunnableBin(p));

if (!binPath) {
  console.error(`Cannot find bin "${binName}" in root node_modules`);
  process.exit(1);
}

const result = spawnSync(process.execPath, [binPath, ...args], {
  stdio: 'inherit',
  cwd: process.cwd(),
  env: process.env,
});

process.exit(result.status ?? 1);
