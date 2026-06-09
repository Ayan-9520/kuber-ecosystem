import type { Prisma } from '@kuberone/database';
import type { AuthenticatedUser } from '@kuberone/shared-types';
import type { ListLeadScoresQuery, ScoreLeadInput, ScoringProfile } from '@kuberone/shared-validation';

import { NotFoundError } from '../../../shared/errors/app-error.js';
import { leadScoringService } from '../../lead-scoring/lead-scoring.module.js';
import { GRADE_ALIASES } from '../constants/leads.constants.js';
import { leadScoreRepository } from '../repositories/lead-score.repository.js';
import { leadRepository } from '../repositories/lead.repository.js';
import type { RequestContext } from '../types/leads.types.js';
import { buildPaginationMeta } from '../utils/leads.utils.js';

export const leadScoreService = {
  async list(query: ListLeadScoresQuery) {
    const where: Prisma.LeadScoreWhereInput = {
      ...(query.leadId ? { leadId: query.leadId } : {}),
      ...(query.grade ? { grade: query.grade as never } : {}),
    };
    const skip = (query.page - 1) * query.limit;
    const orderBy = { [query.sortBy]: query.sortOrder };

    const [items, total] = await Promise.all([
      leadScoreRepository.list(where, skip, query.limit, orderBy),
      leadScoreRepository.count(where),
    ]);

    return {
      items: items.map((s) => ({
        ...s,
        gradeAlias: GRADE_ALIASES[s.grade] ?? s.grade,
      })),
      meta: buildPaginationMeta(query.page, query.limit, total),
    };
  },

  async getById(id: string) {
    const score = await leadScoreRepository.findById(id);
    if (!score) throw new NotFoundError('LeadScore', id);
    return { ...score, gradeAlias: GRADE_ALIASES[score.grade] ?? score.grade };
  },

  async scoreLead(input: ScoreLeadInput, ctx: RequestContext, _profileOverride?: ScoringProfile) {
    const lead = await leadRepository.findById(input.leadId);
    if (!lead) throw new NotFoundError('Lead', input.leadId);

    const actor = { id: ctx.actorId } as AuthenticatedUser;
    const record = await leadScoringService.calculate(actor, input.leadId, ctx, {
      aiScore: input.aiScore ?? 50,
      force: true,
    });

    return {
      ...record,
      gradeAlias: GRADE_ALIASES[record.grade],
    };
  },

  async getLatestForLead(leadId: string) {
    const score = await leadScoreRepository.findLatestByLeadId(leadId);
    if (!score) return null;
    return { ...score, gradeAlias: GRADE_ALIASES[score.grade] ?? score.grade };
  },
};
