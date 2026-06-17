let seq = 1;

export function buildApplication(overrides: Record<string, unknown> = {}) {
  return {
    id: `app-${seq++}`,
    applicationNumber: `APP-${String(seq).padStart(6, '0')}`,
    customerId: 'customer-1',
    productId: 'product-1',
    status: 'DRAFT',
    loanAmount: 500000,
    tenureMonths: 60,
    branchId: 'branch-1',
    regionId: 'region-1',
    partnerId: null,
    assignedSalesId: 'emp-1',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}
