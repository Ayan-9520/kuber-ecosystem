#!/usr/bin/env node
/**
 * Auto-identify performance optimizations — slow queries, indexes, N+1, bundles.
 */
import { readFileSync, readdirSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const reportsDir = join(root, 'performance-testing', 'reports');
mkdirSync(reportsDir, { recursive: true });

const recommendations = [];
const autoFixes = [];

function walkTs(dir, files = []) {
  if (!existsSync(dir)) return files;
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory() && !e.name.includes('node_modules') && !e.name.includes('dist')) {
      walkTs(p, files);
    } else if (e.name.endsWith('.ts') && !e.name.endsWith('.test.ts')) {
      files.push(p);
    }
  }
  return files;
}

const schemaPath = join(root, 'database/prisma/schema.prisma');
if (existsSync(schemaPath)) {
  const schema = readFileSync(schemaPath, 'utf8');
  const models = [...schema.matchAll(/^model (\w+)/gm)].map((m) => m[1]);
  const indexed = new Set([...schema.matchAll(/@@index\(\[([^\]]+)\]/g)].map((m) => m[1]));
  for (const model of models) {
    const block = schema.split(`model ${model}`)[1]?.split(/^model /m)[0] ?? '';
    if (block.includes('@id') && !block.includes('@@index') && ['Lead', 'Application', 'Customer', 'Document'].includes(model)) {
      recommendations.push(`Consider @@index on ${model} for list/filter queries`);
    }
  }
  if (indexed.size < 15) {
    recommendations.push('Prisma schema has fewer than 15 compound indexes — review high-traffic filters');
  }
}

const repoFiles = walkTs(join(root, 'apps/backend/src/modules')).filter((f) => f.includes('repository'));
for (const file of repoFiles) {
  const content = readFileSync(file, 'utf8');
  if (/for\s*\([^)]+\)\s*\{[^}]*findMany|findUnique/s.test(content)) {
    recommendations.push(`Potential N+1 in ${file.replace(root, '')}`);
  }
  if (/findMany[\s\S]{0,200}findMany/.test(content)) {
    recommendations.push(`Sequential queries in ${file.replace(root, '')} — consider batching`);
  }
}

const adminDist = join(root, 'apps/admin/dist');
if (existsSync(adminDist)) {
  const assets = walkTs(adminDist).filter((f) => f.endsWith('.js'));
  for (const a of assets) {
    const size = readFileSync(a).length;
    if (size > 500_000) {
      recommendations.push(`Large admin bundle: ${a.replace(root, '')} (${Math.round(size / 1024)}KB) — code-split`);
    }
  }
} else {
  recommendations.push('Run admin build to analyze bundle sizes (vite build)');
}

if (recommendations.length === 0) {
  recommendations.push('No critical issues detected — run load tests against staging for production signals');
}

const report = {
  generatedAt: new Date().toISOString(),
  recommendations,
  autoFixes,
  prismaQueryLogging: 'Set DEBUG=prisma:query in backend .env for slow query capture',
  lighthouse: 'Run: npx lighthouse http://localhost:5173 --output json',
  reactProfiler: 'Enable React Profiler in admin dev tools for CRM component timing',
};

writeFileSync(join(reportsDir, 'optimization-report.json'), JSON.stringify(report, null, 2));
console.log(`Optimization report: ${recommendations.length} recommendations`);
recommendations.slice(0, 10).forEach((r) => console.log(' -', r));
