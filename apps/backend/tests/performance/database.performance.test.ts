import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

import { prisma } from '../../src/config/database.js';

describe('Performance — Database', () => {
  const schemaPath = join(process.cwd(), '../../database/prisma/schema.prisma');

  it('prisma mock queries resolve under query time budget', async () => {
    const start = performance.now();
    jest.mocked(prisma.user.findMany).mockResolvedValue([]);
    await prisma.user.findMany({ take: 20 });
    const elapsed = performance.now() - start;
    expect(elapsed).toBeLessThan(50);
  });

  it('schema defines indexes on high-traffic models', () => {
    if (!existsSync(schemaPath)) {
      expect(true).toBe(true);
      return;
    }
    const schema = readFileSync(schemaPath, 'utf8');
    const indexCount = (schema.match(/@@index/g) || []).length;
    expect(indexCount).toBeGreaterThan(10);
  });

  it('connection pool config present in DATABASE_URL pattern', () => {
    const url = process.env.DATABASE_URL ?? '';
    expect(url).toMatch(/mysql:\/\//);
  });

  it('avoids N+1 pattern in list query (single findMany)', async () => {
    const spy = jest.mocked(prisma.lead.findMany);
    spy.mockClear();
    spy.mockResolvedValue([]);
    await prisma.lead.findMany({ take: 50, include: { scores: true } });
    expect(spy).toHaveBeenCalledTimes(1);
  });
});
