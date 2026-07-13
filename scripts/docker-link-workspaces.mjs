#!/usr/bin/env node
/** Link built workspace packages for Docker backend tsc (node_modules/@kuberone/* → dist). */
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const scopeDir = path.join(root, 'node_modules', '@kuberone');
const packages = [
  { name: 'shared-types', dir: path.join(root, 'packages', 'shared-types') },
  { name: 'shared-utils', dir: path.join(root, 'packages', 'shared-utils') },
  { name: 'shared-config', dir: path.join(root, 'packages', 'shared-config') },
  { name: 'shared-validation', dir: path.join(root, 'packages', 'shared-validation') },
  { name: 'database', dir: path.join(root, 'database') },
];

fs.mkdirSync(scopeDir, { recursive: true });

for (const { name, dir } of packages) {
  const link = path.join(scopeDir, name);
  const distIndex = path.join(dir, 'dist', 'index.js');
  if (!fs.existsSync(distIndex)) {
    throw new Error(`Missing built output: ${distIndex}`);
  }
  fs.rmSync(link, { recursive: true, force: true });
  fs.symlinkSync(dir, link, 'dir');
  console.log(`linked @kuberone/${name} -> ${dir}`);
}
