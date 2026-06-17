import type { Prisma } from '@kuberone/database';
import type {
  CreateBranchInput,
  CreateRegionInput,
  ListBranchesQuery,
  ListRegionsQuery,
  UpdateBranchInput,
  UpdateRegionInput,
} from '@kuberone/shared-validation';

import { ConflictError, NotFoundError } from '../../../shared/errors/app-error.js';
import { branchRepository, regionRepository } from '../repositories/branch.repository.js';
import type {
  BranchResponse,
  BranchWithRegion,
  RegionResponse,
  RequestContext,
} from '../types/branches.types.js';

function buildPaginationMeta(page: number, limit: number, total: number) {
  return {
    page,
    limit,
    total,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  };
}

export function toApiRegion(row: {
  id: string;
  code: string;
  name: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}): RegionResponse {
  return {
    id: row.id,
    code: row.code,
    name: row.name,
    isActive: row.isActive,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export function toApiBranch(row: BranchWithRegion): BranchResponse {
  return {
    id: row.id,
    regionId: row.regionId,
    code: row.code,
    name: row.name,
    address: row.address,
    city: row.city,
    state: row.state,
    pincode: row.pincode,
    isActive: row.isActive,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    region: {
      id: row.region.id,
      code: row.region.code,
      name: row.region.name,
      isActive: row.region.isActive,
    },
  };
}

function buildBranchListWhere(query: ListBranchesQuery): Prisma.BranchWhereInput {
  return {
    ...(query.regionId ? { regionId: query.regionId } : {}),
    ...(query.isActive !== undefined ? { isActive: query.isActive } : {}),
    ...(query.search
      ? {
          OR: [{ code: { contains: query.search } }, { name: { contains: query.search } }],
        }
      : {}),
  };
}

function buildRegionListWhere(query: ListRegionsQuery): Prisma.RegionWhereInput {
  return {
    ...(query.isActive !== undefined ? { isActive: query.isActive } : {}),
    ...(query.search
      ? {
          OR: [{ code: { contains: query.search } }, { name: { contains: query.search } }],
        }
      : {}),
  };
}

async function assertRegionExists(regionId: string) {
  const region = await regionRepository.findById(regionId);
  if (!region) throw new NotFoundError('Region', regionId);
  return region;
}

export const regionService = {
  async list(query: ListRegionsQuery) {
    const where = buildRegionListWhere(query);
    const skip = (query.page - 1) * query.limit;
    const orderBy = { [query.sortBy]: query.sortOrder };

    const [rows, total] = await Promise.all([
      regionRepository.list(where, skip, query.limit, orderBy),
      regionRepository.count(where),
    ]);

    return {
      items: rows.map(toApiRegion),
      meta: buildPaginationMeta(query.page, query.limit, total),
    };
  },

  async getById(id: string) {
    const row = await regionRepository.findById(id);
    if (!row) throw new NotFoundError('Region', id);
    return toApiRegion(row);
  },

  async create(input: CreateRegionInput) {
    const existing = await regionRepository.findByCode(input.code);
    if (existing) throw new ConflictError('Region code already exists');

    const row = await regionRepository.create({
      code: input.code,
      name: input.name,
      isActive: input.isActive,
    });

    return toApiRegion(row);
  },

  async update(id: string, input: UpdateRegionInput) {
    await regionService.getById(id);

    if (input.code) {
      const existing = await regionRepository.findByCode(input.code);
      if (existing && existing.id !== id) {
        throw new ConflictError('Region code already exists');
      }
    }

    const row = await regionRepository.update(id, {
      ...(input.code !== undefined ? { code: input.code } : {}),
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
    });

    return toApiRegion(row);
  },
};

export const branchService = {
  health: async (): Promise<{ module: string; status: string }> => ({
    module: 'branches',
    status: 'ok',
  }),

  async list(query: ListBranchesQuery) {
    const where = buildBranchListWhere(query);
    const skip = (query.page - 1) * query.limit;
    const orderBy = { [query.sortBy]: query.sortOrder };

    const [rows, total] = await Promise.all([
      branchRepository.list(where, skip, query.limit, orderBy),
      branchRepository.count(where),
    ]);

    return {
      items: rows.map(toApiBranch),
      meta: buildPaginationMeta(query.page, query.limit, total),
    };
  },

  async getById(id: string) {
    const row = await branchRepository.findById(id);
    if (!row) throw new NotFoundError('Branch', id);
    return toApiBranch(row);
  },

  async create(input: CreateBranchInput) {
    await assertRegionExists(input.regionId);

    const existing = await branchRepository.findByCode(input.code);
    if (existing) throw new ConflictError('Branch code already exists');

    const row = await branchRepository.create({
      region: { connect: { id: input.regionId } },
      code: input.code,
      name: input.name,
      address: input.address,
      city: input.city,
      state: input.state,
      pincode: input.pincode,
      isActive: input.isActive,
    });

    return toApiBranch(row);
  },

  async update(id: string, input: UpdateBranchInput) {
    await branchService.getById(id);

    if (input.regionId) {
      await assertRegionExists(input.regionId);
    }

    if (input.code) {
      const existing = await branchRepository.findByCode(input.code);
      if (existing && existing.id !== id) {
        throw new ConflictError('Branch code already exists');
      }
    }

    const row = await branchRepository.update(id, {
      ...(input.regionId !== undefined ? { region: { connect: { id: input.regionId } } } : {}),
      ...(input.code !== undefined ? { code: input.code } : {}),
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.address !== undefined ? { address: input.address } : {}),
      ...(input.city !== undefined ? { city: input.city } : {}),
      ...(input.state !== undefined ? { state: input.state } : {}),
      ...(input.pincode !== undefined ? { pincode: input.pincode } : {}),
      ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
    });

    return toApiBranch(row);
  },

  async remove(id: string, _ctx: RequestContext) {
    await branchService.getById(id);
    const row = await branchRepository.softDelete(id);
    return toApiBranch(row);
  },
};
