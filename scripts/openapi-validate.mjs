#!/usr/bin/env node
import { execSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const openapiPaths = [
  join(root, 'openapi', 'v1', 'openapi.json'),
  join(root, 'apps', 'admin', 'public', 'openapi', 'kuberone-v1.yaml'),
];

console.log('==> Generating OpenAPI spec');
execSync('node scripts/generate-openapi.mjs', { cwd: root, stdio: 'inherit' });

const generated = openapiPaths[0];
if (!existsSync(generated)) {
  console.error('OpenAPI validation FAILED: generated spec missing at', generated);
  process.exit(1);
}

const spec = JSON.parse(readFileSync(generated, 'utf8'));
if (!spec.openapi || !spec.info?.title) {
  console.error('OpenAPI validation FAILED: invalid spec structure');
  process.exit(1);
}

const pathCount = Object.keys(spec.paths ?? {}).length;
if (pathCount < 10) {
  console.error(`OpenAPI validation FAILED: only ${pathCount} paths — expected enterprise API surface`);
  process.exit(1);
}

console.log(`OpenAPI validation PASSED (${pathCount} paths)`);
