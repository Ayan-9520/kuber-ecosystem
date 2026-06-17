let seq = 1;

export function buildCustomer(overrides: Record<string, unknown> = {}) {
  return {
    id: `customer-${seq++}`,
    userId: `user-${seq}`,
    firstName: 'Rahul',
    lastName: 'Sharma',
    email: 'rahul@example.com',
    phone: '9876543210',
    branchId: 'branch-1',
    regionId: 'region-1',
    kycStatus: 'PENDING',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

export function buildCustomerInput(overrides: Record<string, unknown> = {}) {
  return {
    firstName: 'Rahul',
    lastName: 'Sharma',
    email: 'rahul@example.com',
    phone: '9876543210',
    branchId: 'branch-1',
    ...overrides,
  };
}
