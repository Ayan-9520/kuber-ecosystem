/* eslint-disable @typescript-eslint/no-explicit-any */
export function createMockFn<T = unknown>(impl?: (...args: any[]) => T) {
  const calls: any[][] = [];
  const fn = (...args: any[]) => {
    calls.push(args);
    return impl?.(...args);
  };
  return Object.assign(fn, { mock: { calls } });
}

export function createPrismaMock() {
  const store: Record<string, unknown[]> = {};

  const model = (name: string) => ({
    findMany: createMockFn(async ({ where, skip = 0, take = 20 } = {}) => {
      const items = (store[name] ?? []) as Array<Record<string, unknown>>;
      return items.filter((item) => matchWhere(item, where)).slice(skip, skip + take);
    }),
    findFirst: createMockFn(async ({ where } = {}) => {
      const items = (store[name] ?? []) as Array<Record<string, unknown>>;
      return items.find((item) => matchWhere(item, where)) ?? null;
    }),
    findUnique: createMockFn(async ({ where }: { where: { id?: string } }) => {
      const items = (store[name] ?? []) as Array<Record<string, unknown>>;
      if (where.id) return items.find((item) => item.id === where.id) ?? null;
      return null;
    }),
    create: createMockFn(async ({ data }: { data: Record<string, unknown> }) => {
      const row = { id: `${name}-${Date.now()}`, ...data };
      store[name] = [...(store[name] ?? []), row];
      return row;
    }),
    update: createMockFn(async ({ where, data }: { where: { id: string }; data: Record<string, unknown> }) => {
      const items = (store[name] ?? []) as Array<Record<string, unknown>>;
      const idx = items.findIndex((item) => item.id === where.id);
      if (idx === -1) throw new Error(`${name} not found`);
      items[idx] = { ...items[idx], ...data };
      return items[idx];
    }),
    delete: createMockFn(async ({ where }: { where: { id: string } }) => {
      store[name] = ((store[name] ?? []) as Array<Record<string, unknown>>).filter(
        (item) => item.id !== where.id,
      );
    }),
    count: createMockFn(async ({ where } = {}) => {
      const items = (store[name] ?? []) as Array<Record<string, unknown>>;
      return items.filter((item) => matchWhere(item, where)).length;
    }),
  });

  return {
    store,
    seed(modelName: string, rows: Record<string, unknown>[]) {
      store[modelName] = rows;
    },
    user: model('user'),
    customer: model('customer'),
    lead: model('lead'),
    application: model('application'),
    document: model('document'),
    session: model('session'),
    otpVerification: model('otpVerification'),
    $disconnect: createMockFn(async () => undefined),
    $transaction: createMockFn(async (fn: (tx: unknown) => Promise<unknown>) => fn({})),
  };
}

function matchWhere(item: Record<string, unknown>, where?: Record<string, unknown>): boolean {
  if (!where) return true;
  return Object.entries(where).every(([key, value]) => item[key] === value);
}
