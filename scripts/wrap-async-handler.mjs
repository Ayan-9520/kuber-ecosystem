import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const IMPORT_LINE =
  "import { asyncHandler } from '../../../shared/middleware/async-handler.middleware.js';";

function walkRoutes(dir) {
  const results = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) results.push(...walkRoutes(full));
    else if (entry.endsWith('.routes.ts')) results.push(full);
  }
  return results;
}

function wrapHandlers(content) {
  return content.replace(/(?<![\w.])(?<![(])(\w+Controller\.\w+)/g, (match, handler, offset, str) => {
    const before = str.slice(Math.max(0, offset - 14), offset);
    if (before.endsWith('asyncHandler(')) return match;
    return `asyncHandler(${handler})`;
  });
}

function ensureImport(content) {
  if (content.includes('async-handler.middleware')) return content;
  if (content.includes("import { RBAC_PERMISSIONS }")) {
    return content.replace(
      "import { RBAC_PERMISSIONS }",
      `${IMPORT_LINE}\nimport { RBAC_PERMISSIONS }`,
    );
  }
  if (content.includes("import { authenticateWithSessionMiddleware }")) {
    return content.replace(
      "import { authenticateWithSessionMiddleware }",
      `${IMPORT_LINE}\nimport { authenticateWithSessionMiddleware }`,
    );
  }
  const routerMatch = content.match(/^import \{ Router \} from 'express';$/m);
  if (routerMatch) {
    return content.replace(
      "import { Router } from 'express';",
      `import { Router } from 'express';\n\n${IMPORT_LINE}`,
    );
  }
  return content;
}

const routesRoot = join(process.cwd(), 'apps/backend/src/modules');
const files = walkRoutes(routesRoot);

let updated = 0;
for (const file of files) {
  const original = readFileSync(file, 'utf8');
  if (!/\w+Controller\.\w+/.test(original)) continue;

  let next = ensureImport(original);
  next = wrapHandlers(next);
  if (next !== original) {
    writeFileSync(file, next);
    updated += 1;
    console.log('updated:', file.replace(/.*apps\\backend\\/, 'apps/backend/'));
  }
}

console.log(`Done. Updated ${updated} route files.`);
