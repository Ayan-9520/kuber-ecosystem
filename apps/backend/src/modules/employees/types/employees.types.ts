import type { Prisma } from '@kuberone/database';

export interface RequestContext {
  actorId: string;
}

export const employeeInclude = {
  branch: {
    select: {
      id: true,
      code: true,
      name: true,
      regionId: true,
      city: true,
      state: true,
      isActive: true,
    },
  },
} satisfies Prisma.EmployeeInclude;

export type EmployeeWithBranch = Prisma.EmployeeGetPayload<{ include: typeof employeeInclude }>;

export interface EmployeeBranchSummary {
  id: string;
  code: string;
  name: string;
  regionId: string;
  city: string | null;
  state: string | null;
  isActive: boolean;
}

export interface EmployeeResponse {
  id: string;
  userId: string;
  branchId: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  designation: string | null;
  department: string | null;
  reportsToId: string | null;
  isActive: boolean;
  joinedAt: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  branch: EmployeeBranchSummary;
}

export interface EmployeeModuleContext {
  module: 'employees';
}
