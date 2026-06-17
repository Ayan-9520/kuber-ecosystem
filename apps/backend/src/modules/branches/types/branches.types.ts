import type { Prisma } from '@kuberone/database';

export interface RequestContext {
  actorId: string;
}

export const branchInclude = {
  region: {
    select: {
      id: true,
      code: true,
      name: true,
      isActive: true,
    },
  },
} satisfies Prisma.BranchInclude;

export type BranchWithRegion = Prisma.BranchGetPayload<{ include: typeof branchInclude }>;

export interface RegionSummary {
  id: string;
  code: string;
  name: string;
  isActive: boolean;
}

export interface BranchResponse {
  id: string;
  regionId: string;
  code: string;
  name: string;
  address: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  region: RegionSummary;
}

export interface RegionResponse {
  id: string;
  code: string;
  name: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BranchModuleContext {
  module: 'branches';
}
