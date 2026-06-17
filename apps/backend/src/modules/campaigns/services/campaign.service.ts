import type { Campaign } from '@kuberone/database';
import type { Prisma } from '@kuberone/database';
import type {
  CreateCampaignInput,
  ListCampaignsQuery,
  UpdateCampaignInput,
  UpdateCampaignMetricsInput,
} from '@kuberone/shared-validation';

import { NotFoundError } from '../../../shared/errors/app-error.js';
import { campaignRepository } from '../repositories/campaign.repository.js';

export interface RequestContext {
  actorId: string;
}

function buildPaginationMeta(page: number, limit: number, total: number) {
  return {
    page,
    limit,
    total,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  };
}

function toApiCampaign(row: Campaign) {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    type: row.channel,
    channel: row.channel,
    audience: row.audience,
    status: row.status,
    subject: row.subject,
    body: row.body,
    metadata: row.metadata,
    sent: row.sent,
    opened: row.opened,
    clicked: row.clicked,
    converted: row.converted,
    startDate: row.startDate?.toISOString() ?? null,
    endDate: row.endDate?.toISOString() ?? null,
    branchId: row.branchId,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function buildListWhere(query: ListCampaignsQuery): Prisma.CampaignWhereInput {
  return {
    ...(query.includeDeleted ? {} : { deletedAt: null }),
    ...(query.status ? { status: query.status as never } : {}),
    ...(query.channel ? { channel: query.channel as never } : {}),
    ...(query.audience ? { audience: query.audience as never } : {}),
    ...(query.branchId ? { branchId: query.branchId } : {}),
    ...(query.search
      ? {
          OR: [
            { name: { contains: query.search } },
            { description: { contains: query.search } },
            { subject: { contains: query.search } },
          ],
        }
      : {}),
    ...(query.fromDate || query.toDate
      ? {
          startDate: {
            ...(query.fromDate ? { gte: query.fromDate } : {}),
            ...(query.toDate ? { lte: query.toDate } : {}),
          },
        }
      : {}),
  };
}

export const campaignService = {
  health: async (): Promise<{ module: string; status: string }> => ({
    module: 'campaigns',
    status: 'ok',
  }),

  async list(query: ListCampaignsQuery) {
    const where = buildListWhere(query);
    const skip = (query.page - 1) * query.limit;
    const orderBy = { [query.sortBy]: query.sortOrder };

    const [rows, total] = await Promise.all([
      campaignRepository.list(where, skip, query.limit, orderBy),
      campaignRepository.count(where),
    ]);

    return {
      items: rows.map(toApiCampaign),
      meta: buildPaginationMeta(query.page, query.limit, total),
    };
  },

  async getById(id: string) {
    const row = await campaignRepository.findById(id);
    if (!row || row.deletedAt) throw new NotFoundError('Campaign', id);
    return toApiCampaign(row);
  },

  async create(input: CreateCampaignInput, ctx: RequestContext) {
    const row = await campaignRepository.create({
      name: input.name,
      description: input.description,
      channel: input.channel as never,
      audience: input.audience as never,
      status: (input.status ?? 'DRAFT') as never,
      subject: input.subject,
      body: input.body,
      metadata: input.metadata as Prisma.InputJsonValue | undefined,
      startDate: input.startDate,
      endDate: input.endDate,
      branch: input.branchId ? { connect: { id: input.branchId } } : undefined,
      createdBy: { connect: { id: ctx.actorId } },
      updatedBy: { connect: { id: ctx.actorId } },
    });
    return toApiCampaign(row);
  },

  async update(id: string, input: UpdateCampaignInput, ctx: RequestContext) {
    await this.getById(id);
    const row = await campaignRepository.update(id, {
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.description !== undefined ? { description: input.description } : {}),
      ...(input.channel !== undefined ? { channel: input.channel as never } : {}),
      ...(input.audience !== undefined ? { audience: input.audience as never } : {}),
      ...(input.status !== undefined ? { status: input.status as never } : {}),
      ...(input.subject !== undefined ? { subject: input.subject } : {}),
      ...(input.body !== undefined ? { body: input.body } : {}),
      ...(input.metadata !== undefined ? { metadata: input.metadata as Prisma.InputJsonValue } : {}),
      ...(input.startDate !== undefined ? { startDate: input.startDate } : {}),
      ...(input.endDate !== undefined ? { endDate: input.endDate } : {}),
      ...(input.branchId !== undefined
        ? input.branchId
          ? { branch: { connect: { id: input.branchId } } }
          : { branch: { disconnect: true } }
        : {}),
      updatedBy: { connect: { id: ctx.actorId } },
    });
    return toApiCampaign(row);
  },

  async updateMetrics(id: string, input: UpdateCampaignMetricsInput) {
    await this.getById(id);
    const row = await campaignRepository.update(id, {
      ...(input.sent !== undefined ? { sent: input.sent } : {}),
      ...(input.opened !== undefined ? { opened: input.opened } : {}),
      ...(input.clicked !== undefined ? { clicked: input.clicked } : {}),
      ...(input.converted !== undefined ? { converted: input.converted } : {}),
    });
    return toApiCampaign(row);
  },

  async remove(id: string, ctx: RequestContext) {
    await this.getById(id);
    const row = await campaignRepository.softDelete(id, ctx.actorId);
    return toApiCampaign(row);
  },
};
