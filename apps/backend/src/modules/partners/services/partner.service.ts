import type { Prisma } from '@kuberone/database';
import type {
  CreatePartnerInput,
  ListPartnersQuery,
  RegisterPartnerInput,
  UpdatePartnerInput,
} from '@kuberone/shared-validation';

import { ConflictError, NotFoundError } from '../../../shared/errors/app-error.js';
import { partnerRepository } from '../repositories/partner.repository.js';

export interface RequestContext {
  actorId: string;
}

type PartnerRow = NonNullable<Awaited<ReturnType<typeof partnerRepository.findById>>>;

function toPartnerResponse(partner: PartnerRow) {
  return {
    id: partner.id,
    userId: partner.userId,
    partnerCode: partner.partnerCode,
    businessName: partner.businessName,
    contactName: partner.contactName,
    phone: partner.phone,
    email: partner.email,
    kycStatus: partner.kycStatus,
    status: partner.status,
    commissionTier: partner.commissionTier,
    partnerType: partner.partnerType?.name,
    partnerTypeId: partner.partnerTypeId,
    createdAt: partner.createdAt.toISOString(),
    updatedAt: partner.updatedAt.toISOString(),
  };
}

function buildPaginationMeta(page: number, limit: number, total: number) {
  return {
    page,
    limit,
    total,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  };
}

function buildListWhere(query: ListPartnersQuery): Prisma.PartnerWhereInput {
  return {
    deletedAt: null,
    ...(query.partnerTypeId ? { partnerTypeId: query.partnerTypeId } : {}),
    ...(query.status ? { status: query.status } : {}),
    ...(query.kycStatus ? { kycStatus: query.kycStatus } : {}),
    ...(query.search
      ? {
          OR: [
            { partnerCode: { contains: query.search } },
            { businessName: { contains: query.search } },
            { contactName: { contains: query.search } },
            { phone: { contains: query.search } },
            { email: { contains: query.search } },
          ],
        }
      : {}),
  };
}

async function generatePartnerCode(partnerTypeCode: string): Promise<string> {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const suffix = Date.now().toString(36).toUpperCase().slice(-6);
    const partnerCode = `${partnerTypeCode}-${suffix}`;
    const existing = await partnerRepository.findByPartnerCode(partnerCode);
    if (!existing) return partnerCode;
  }
  throw new ConflictError('Unable to generate unique partner code');
}

export const partnerService = {
  health: async (): Promise<{ module: string; status: string }> => ({
    module: 'partners',
    status: 'ok',
  }),

  async list(query: ListPartnersQuery) {
    const where = buildListWhere(query);
    const skip = (query.page - 1) * query.limit;
    const orderBy = { [query.sortBy]: query.sortOrder };

    const [rows, total] = await Promise.all([
      partnerRepository.list(where, skip, query.limit, orderBy),
      partnerRepository.count(where),
    ]);

    return {
      items: rows.map((row) => toPartnerResponse(row)),
      meta: buildPaginationMeta(query.page, query.limit, total),
    };
  },

  async getById(id: string) {
    const partner = await partnerRepository.findById(id);
    if (!partner) throw new NotFoundError('Partner', id);
    return toPartnerResponse(partner);
  },

  async create(input: CreatePartnerInput) {
    const existingCode = await partnerRepository.findByPartnerCode(input.partnerCode);
    if (existingCode) throw new ConflictError('Partner code already exists');

    const existingPhone = await partnerRepository.findUserByPhone(input.phone);
    if (existingPhone) throw new ConflictError('Phone already registered');

    const partner = await partnerRepository.create({
      userId: input.userId,
      partnerType: { connect: { id: input.partnerTypeId } },
      partnerCode: input.partnerCode,
      businessName: input.businessName,
      contactName: input.contactName,
      phone: input.phone,
      email: input.email,
      kycStatus: input.kycStatus,
      status: input.status,
      commissionTier: input.commissionTier,
    });

    return toPartnerResponse(partner);
  },

  async update(id: string, input: UpdatePartnerInput) {
    await this.getById(id);

    if (input.phone) {
      const existingPhone = await partnerRepository.findUserByPhone(input.phone);
      if (existingPhone) {
        const partner = await partnerRepository.findById(id);
        if (partner && existingPhone.id !== partner.userId) {
          throw new ConflictError('Phone already registered');
        }
      }
    }

    const partner = await partnerRepository.update(id, {
      ...(input.partnerTypeId !== undefined ? { partnerType: { connect: { id: input.partnerTypeId } } } : {}),
      ...(input.businessName !== undefined ? { businessName: input.businessName } : {}),
      ...(input.contactName !== undefined ? { contactName: input.contactName } : {}),
      ...(input.phone !== undefined ? { phone: input.phone } : {}),
      ...(input.email !== undefined ? { email: input.email } : {}),
      ...(input.kycStatus !== undefined ? { kycStatus: input.kycStatus } : {}),
      ...(input.status !== undefined ? { status: input.status } : {}),
      ...(input.commissionTier !== undefined ? { commissionTier: input.commissionTier } : {}),
    });

    return toPartnerResponse(partner);
  },

  async remove(id: string) {
    await this.getById(id);
    const partner = await partnerRepository.softDelete(id);
    return toPartnerResponse(partner);
  },

  async register(input: RegisterPartnerInput) {
    const existingPhone = await partnerRepository.findUserByPhone(input.phone);
    if (existingPhone) throw new ConflictError('Phone already registered');

    const partnerType = await partnerRepository.findPartnerTypeByCode(input.partnerTypeCode);
    if (!partnerType) throw new NotFoundError('Partner type', input.partnerTypeCode);

    const role = await partnerRepository.findRoleByCode('DSA_PARTNER');
    if (!role) throw new NotFoundError('Role', 'DSA_PARTNER');

    const partnerCode = await generatePartnerCode(input.partnerTypeCode);
    const partner = await partnerRepository.registerPartner({
      phone: input.phone,
      email: input.email,
      businessName: input.businessName ?? '',
      contactName: input.contactName,
      partnerTypeId: partnerType.id,
      partnerCode,
      roleId: role.id,
    });

    return toPartnerResponse(partner);
  },
};
