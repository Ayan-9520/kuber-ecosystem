import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

function walkRoutes(dir) {
  const results = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) results.push(...walkRoutes(full));
    else if (entry.endsWith('.routes.ts')) results.push(full);
  }
  return results;
}

function fixCorruption(content) {
  let next = content;
  let prev;
  do {
    prev = next;
    // Split-controller corruption: asyncHandler(oasyncHandler(tpController.send))
    next = next.replace(
      /asyncHandler\(([a-z]?)asyncHandler\(([\w.]+)\)\)/g,
      'asyncHandler($1$2)',
    );
    // Double wrap: asyncHandler(asyncHandler(xController.method))
    next = next.replace(/asyncHandler\(asyncHandler\(([\w.]+)\)\)/g, 'asyncHandler($1)');
  } while (next !== prev);
  return next;
}

const routesRoot = join(process.cwd(), 'apps/backend/src/modules');
let fixed = 0;
for (const file of walkRoutes(routesRoot)) {
  const original = readFileSync(file, 'utf8');
  const next = fixCorruption(original);
  if (next !== original) {
    writeFileSync(file, next);
    fixed += 1;
    console.log('fixed:', file.replace(/.*apps\\backend\\/, 'apps/backend/'));
  }
}
console.log(`Repaired ${fixed} route files.`);
