import type { Prisma } from '@kuberone/database';
import type {
  CreateDocumentRuleInput,
  ListDocumentRulesQuery,
  ResolveDocumentsInput,
  UpdateDocumentRuleInput,
} from '@kuberone/shared-validation';

import { NotFoundError } from '../../../shared/errors/app-error.js';
import { authAuditRepository } from '../../auth/repositories/audit.repository.js';
import { documentRuleRepository } from '../repositories/document-rule.repository.js';
import type { RequestContext } from '../types/product.types.js';
import { auditProductMutation, buildPaginationMeta } from '../utils/product.utils.js';

import { documentEngineService } from './document-engine.service.js';
import { productService } from './product.service.js';

export const documentRuleService = {
  async list(query: ListDocumentRulesQuery) {
    const where: Prisma.DocumentRuleWhereInput = {
      ...(query.productId ? { productId: query.productId } : {}),
      ...(query.variantId ? { variantId: query.variantId } : {}),
      ...(query.stage ? { stage: query.stage as never } : {}),
    };
    const skip = (query.page - 1) * query.limit;
    const orderBy = { [query.sortBy ?? 'stage']: query.sortOrder };

    const [items, total] = await Promise.all([
      documentRuleRepository.list(where, skip, query.limit, orderBy),
      documentRuleRepository.count(where),
    ]);

    return { items, meta: buildPaginationMeta(query.page, query.limit, total) };
  },

  async getById(id: string) {
    const rule = await documentRuleRepository.findById(id);
    if (!rule) throw new NotFoundError('DocumentRule', id);
    return rule;
  },

  async create(input: CreateDocumentRuleInput, ctx: RequestContext) {
    await productService.getById(input.productId);

    const rule = await documentRuleRepository.create({
      ...input,
      stage: input.stage as never,
      employmentType: input.employmentType as never,
      createdById: ctx.actorId,
      updatedById: ctx.actorId,
    });

    await auditProductMutation(authAuditRepository.log, ctx, 'DOCUMENT_RULE_CREATED', 'document_rule', rule.id, input);
    return rule;
  },

  async update(id: string, input: UpdateDocumentRuleInput, ctx: RequestContext) {
    await documentRuleService.getById(id);
    const rule = await documentRuleRepository.update(id, {
      ...input,
      stage: input.stage as never,
      employmentType: input.employmentType as never,
      updatedById: ctx.actorId,
    });
    await auditProductMutation(authAuditRepository.log, ctx, 'DOCUMENT_RULE_UPDATED', 'document_rule', id, input);
    return rule;
  },

  async remove(id: string, ctx: RequestContext) {
    await documentRuleService.getById(id);
    await documentRuleRepository.delete(id);
    await auditProductMutation(authAuditRepository.log, ctx, 'DOCUMENT_RULE_DELETED', 'document_rule', id);
  },

  async resolve(input: ResolveDocumentsInput) {
    await productService.getById(input.productId);
    const rules = await documentRuleRepository.listForProduct(
      input.productId,
      input.variantId,
      input.employmentType,
    );
    return documentEngineService.resolve(rules, input.riskLevel);
  },
};
