export function daysAgo(n: number): string {
  return new Date(Date.now() - n * 86_400_000).toISOString();
}

export function paginate<T extends Record<string, unknown>>(
  items: T[],
  params?: Record<string, unknown>,
  searchKeys: string[] = ['name', 'fullName', 'email', 'phone', 'leadNumber', 'applicationNumber', 'documentNumber', 'title', 'code'],
): { items: T[]; meta: { page: number; limit: number; total: number; totalPages: number } } {
  const page = Math.max(1, Number(params?.page ?? 1));
  const limit = Math.max(1, Number(params?.limit ?? 20));
  const search = String(params?.search ?? '').toLowerCase().trim();
  const status = params?.status ? String(params.status) : '';
  const leadId = params?.leadId ? String(params.leadId) : '';
  const customerId = params?.customerId ? String(params.customerId) : '';
  const applicationId = params?.applicationId ? String(params.applicationId) : '';
  const documentId = params?.documentId ? String(params.documentId) : '';
  const ticketId = params?.ticketId ? String(params.ticketId) : '';

  let filtered = [...items];

  if (search) {
    filtered = filtered.filter((item) =>
      searchKeys.some((key) => String(item[key] ?? '').toLowerCase().includes(search)),
    );
  }
  if (status) filtered = filtered.filter((item) => String(item.status ?? '') === status);
  if (leadId) filtered = filtered.filter((item) => String(item.leadId ?? '') === leadId);
  if (customerId) filtered = filtered.filter((item) => String(item.customerId ?? '') === customerId);
  if (applicationId) filtered = filtered.filter((item) => String(item.applicationId ?? '') === applicationId);
  if (documentId) filtered = filtered.filter((item) => String(item.documentId ?? '') === documentId);
  if (ticketId) filtered = filtered.filter((item) => String(item.ticketId ?? '') === ticketId);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const start = (page - 1) * limit;

  return {
    items: filtered.slice(start, start + limit),
    meta: { page, limit, total, totalPages },
  };
}

export function findById<T extends { id: string }>(items: T[], id: string): T | undefined {
  return items.find((item) => item.id === id);
}

export async function mockDelay(ms = 120): Promise<void> {
  await new Promise((r) => setTimeout(r, ms));
}
