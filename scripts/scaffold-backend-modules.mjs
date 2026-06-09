import { writeFileSync, existsSync } from 'fs';
import { join } from 'path';

const ROOT = join(import.meta.dirname, '..', 'apps', 'backend', 'src', 'modules');

const MODULES = [
  { name: 'auth', route: '/auth', entity: 'auth' },
  { name: 'users', route: '/users', entity: 'user' },
  { name: 'roles', route: '/admin/roles', entity: 'role' },
  { name: 'permissions', route: '/admin/permissions', entity: 'permission' },
  { name: 'customers', route: '/customers', entity: 'customer' },
  { name: 'partners', route: '/partners', entity: 'partner' },
  { name: 'employees', route: '/employees', entity: 'employee' },
  { name: 'branches', route: '/branches', entity: 'branch' },
  { name: 'products', route: '/products', entity: 'product' },
  { name: 'leads', route: '/leads', entity: 'lead' },
  { name: 'applications', route: '/applications', entity: 'application' },
  { name: 'eligibility', route: '/eligibility', entity: 'eligibility' },
  { name: 'emi', route: '/emi', entity: 'emi' },
  { name: 'documents', route: '/documents', entity: 'document' },
  { name: 'kyc', route: '/kyc', entity: 'kyc' },
  { name: 'referrals', route: '/referrals', entity: 'referral' },
  { name: 'commissions', route: '/commissions', entity: 'commission' },
  { name: 'campaigns', route: '/campaigns', entity: 'campaign' },
  { name: 'notifications', route: '/notifications', entity: 'notification' },
  { name: 'support', route: '/support', entity: 'ticket' },
  { name: 'analytics', route: '/analytics', entity: 'analytics' },
  { name: 'ai', route: '/ai', entity: 'ai' },
  { name: 'knowledge-base', route: '/knowledge', entity: 'knowledge' },
  { name: 'settings', route: '/settings', entity: 'setting' },
  { name: 'audit', route: '/audit', entity: 'audit' },
];

function pascalCase(str) {
  return str
    .split('-')
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join('');
}

function write(path, content) {
  if (!existsSync(path)) {
    writeFileSync(path, content, 'utf8');
  }
}

for (const mod of MODULES) {
  const dir = join(ROOT, mod.name);
  const ModuleName = pascalCase(mod.name);
  const EntityName = pascalCase(mod.entity);

  write(
    join(dir, `${mod.name}.module.ts`),
    `import { Router } from 'express';

import { ${mod.entity}Routes } from './routes/${mod.entity}.routes.js';

export function create${ModuleName}Module(): Router {
  const router = Router();
  router.use(${mod.entity}Routes);
  return router;
}
`,
  );

  write(
    join(dir, 'routes', `${mod.entity}.routes.ts`),
    `import { Router } from 'express';

import { ${mod.entity}Controller } from '../controllers/${mod.entity}.controller.js';

export const ${mod.entity}Routes: Router = Router();

${mod.entity}Routes.get('/health', ${mod.entity}Controller.health);
`,
  );

  write(
    join(dir, 'controllers', `${mod.entity}.controller.ts`),
    `import type { Request, Response } from 'express';

import { ${mod.entity}Service } from '../services/${mod.entity}.service.js';
import { successResponse } from '../../../shared/responses/success-response.js';

export const ${mod.entity}Controller = {
  health: async (_req: Request, res: Response): Promise<void> => {
    const result = await ${mod.entity}Service.health();
    res.json(successResponse(result));
  },
};
`,
  );

  write(
    join(dir, 'services', `${mod.entity}.service.ts`),
    `export const ${mod.entity}Service = {
  health: async (): Promise<{ module: string; status: string }> => {
    return { module: '${mod.name}', status: 'ok' };
  },
};
`,
  );

  write(
    join(dir, 'repositories', `${mod.entity}.repository.ts`),
    `import { prisma } from '../../../config/database.js';

export const ${mod.entity}Repository = {
  // Prisma queries for ${mod.name} module
  getClient: () => prisma,
};
`,
  );

  write(
    join(dir, 'types', `${mod.name}.types.ts`),
    `export interface ${EntityName}ModuleContext {
  module: '${mod.name}';
}
`,
  );

  write(
    join(dir, 'constants', `${mod.name}.constants.ts`),
    `export const ${mod.name.toUpperCase().replace(/-/g, '_')}_ROUTE_PREFIX = '${mod.route}';
`,
  );
}

console.log(`Scaffolded ${MODULES.length} backend modules`);
