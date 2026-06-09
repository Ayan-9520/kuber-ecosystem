import type { CustomerRecord } from '../repositories/customer.repository.js';

export function toCustomerResponse(customer: CustomerRecord) {
  return {
    id: customer.id,
    userId: customer.userId,
    customerCode: customer.customerCode,
    firstName: customer.firstName,
    lastName: customer.lastName,
    fullName: customer.fullName,
    dateOfBirth: customer.dateOfBirth,
    gender: customer.gender,
    maritalStatus: customer.maritalStatus,
    profileCompletionPct: customer.profileCompletionPct,
    kycStatus: customer.kycStatus,
    rmEmployeeId: customer.rmEmployeeId,
    branchId: customer.branchId,
    source: customer.source,
    metadata: customer.metadata,
    version: customer.version,
    createdAt: customer.createdAt,
    updatedAt: customer.updatedAt,
    branch: customer.branch,
    rmEmployee: customer.rmEmployee,
    profile: customer.profile,
    preferences: customer.preferences,
  };
}
