#!/usr/bin/env node
/**
 * Audits Express route handlers for validateMiddleware usage.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const modulesDir = path.join(__dirname, '../apps/backend/src/modules');

const ROUTE_RE = /\w+Routes?\.(get|post|put|patch|delete)\(\s*['"`]([^'"`]+)['"`]/g;

function walk(dir, files = []) {
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, files);
    else if (entry.endsWith('.routes.ts')) files.push(full);
  }
  return files;
}

const routes = [];
for (const file of walk(modulesDir)) {
  const content = readFileSync(file, 'utf8');
  const lines = content.split('\n');
  let match;
  const re = new RegExp(ROUTE_RE.source, 'g');
  while ((match = re.exec(content)) !== null) {
    const method = match[1].toUpperCase();
    const routePath = match[2];
    const lineIndex = content.slice(0, match.index).split('\n').length - 1;
    const window = lines.slice(Math.max(0, lineIndex - 8), lineIndex + 1).join('\n');
    const validated =
      window.includes('validateMiddleware') ||
      routePath === '/health' ||
      routePath.endsWith('/health') ||
      routePath.startsWith('/webhook');
    routes.push({
      file: path.relative(path.join(__dirname, '..'), file).replace(/\\/g, '/'),
      method,
      path: routePath,
      validated,
    });
  }
}

const total = routes.length;
const validated = routes.filter((r) => r.validated).length;
const unvalidated = routes.filter((r) => !r.validated);
const coverage = total ? Math.round((validated / total) * 1000) / 10 : 100;

console.log(JSON.stringify({ total, validated, unvalidated: unvalidated.length, coveragePercent: coverage }, null, 2));
if (process.argv.includes('--list-unvalidated')) {
  for (const r of unvalidated) {
    console.log(`${r.method} ${r.path} — ${r.file}`);
  }
}
