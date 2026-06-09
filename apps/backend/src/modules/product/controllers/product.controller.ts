import type { Request, Response } from 'express';

import { paginatedResponse, successResponse } from '../../../shared/responses/success-response.js';
import { documentRuleService } from '../services/document-rule.service.js';
import { eligibilityRuleService } from '../services/eligibility-rule.service.js';
import { lenderPolicyService } from '../services/lender-policy.service.js';
import { lenderService } from '../services/lender.service.js';
import { productFamilyService } from '../services/product-family.service.js';
import { productLenderMappingService } from '../services/product-lender-mapping.service.js';
import { productRecommendationService } from '../services/product-recommendation.service.js';
import { productVariantService } from '../services/product-variant.service.js';
import { productService } from '../services/product.service.js';
import type { RequestContext } from '../types/product.types.js';

function ctx(req: Request): RequestContext {
  return {
    actorId: req.user!.id,
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
    requestId: req.requestId,
  };
}

export const productFamilyController = {
  list: async (req: Request, res: Response) => {
    const result = await productFamilyService.list(req.query as never);
    res.json(paginatedResponse(result.items, result.meta));
  },
  getById: async (req: Request, res: Response) => {
    res.json(successResponse(await productFamilyService.getById(req.params.id as string)));
  },
  create: async (req: Request, res: Response) => {
    res.status(201).json(successResponse(await productFamilyService.create(req.body, ctx(req))));
  },
  update: async (req: Request, res: Response) => {
    res.json(successResponse(await productFamilyService.update(req.params.id as string, req.body, ctx(req))));
  },
  deactivate: async (req: Request, res: Response) => {
    res.json(successResponse(await productFamilyService.deactivate(req.params.id as string, ctx(req))));
  },
};

export const productController = {
  list: async (req: Request, res: Response) => {
    const result = await productService.list(req.query as never);
    res.json(paginatedResponse(result.items, result.meta));
  },
  getById: async (req: Request, res: Response) => {
    res.json(successResponse(await productService.getById(req.params.id as string)));
  },
  create: async (req: Request, res: Response) => {
    res.status(201).json(successResponse(await productService.create(req.body, ctx(req))));
  },
  update: async (req: Request, res: Response) => {
    res.json(successResponse(await productService.update(req.params.id as string, req.body, ctx(req))));
  },
  deactivate: async (req: Request, res: Response) => {
    res.json(successResponse(await productService.deactivate(req.params.id as string, ctx(req))));
  },
  remove: async (req: Request, res: Response) => {
    await productService.remove(req.params.id as string, ctx(req));
    res.status(204).send();
  },
  recommend: async (req: Request, res: Response) => {
    res.json(successResponse(await productRecommendationService.recommend(req.body)));
  },
};

export const productVariantController = {
  list: async (req: Request, res: Response) => {
    const result = await productVariantService.list(req.query as never);
    res.json(paginatedResponse(result.items, result.meta));
  },
  getById: async (req: Request, res: Response) => {
    res.json(successResponse(await productVariantService.getById(req.params.id as string)));
  },
  create: async (req: Request, res: Response) => {
    res.status(201).json(successResponse(await productVariantService.create(req.body, ctx(req))));
  },
  update: async (req: Request, res: Response) => {
    res.json(successResponse(await productVariantService.update(req.params.id as string, req.body, ctx(req))));
  },
  activate: async (req: Request, res: Response) => {
    res.json(successResponse(await productVariantService.setActive(req.params.id as string, true, ctx(req))));
  },
  deactivate: async (req: Request, res: Response) => {
    res.json(successResponse(await productVariantService.setActive(req.params.id as string, false, ctx(req))));
  },
};

export const eligibilityRuleController = {
  list: async (req: Request, res: Response) => {
    const result = await eligibilityRuleService.list(req.query as never);
    res.json(paginatedResponse(result.items, result.meta));
  },
  getById: async (req: Request, res: Response) => {
    res.json(successResponse(await eligibilityRuleService.getById(req.params.id as string)));
  },
  create: async (req: Request, res: Response) => {
    res.status(201).json(successResponse(await eligibilityRuleService.create(req.body, ctx(req))));
  },
  update: async (req: Request, res: Response) => {
    res.json(successResponse(await eligibilityRuleService.update(req.params.id as string, req.body, ctx(req))));
  },
  remove: async (req: Request, res: Response) => {
    await eligibilityRuleService.remove(req.params.id as string, ctx(req));
    res.status(204).send();
  },
  evaluate: async (req: Request, res: Response) => {
    res.json(successResponse(await eligibilityRuleService.evaluate(req.body)));
  },
};

export const documentRuleController = {
  list: async (req: Request, res: Response) => {
    const result = await documentRuleService.list(req.query as never);
    res.json(paginatedResponse(result.items, result.meta));
  },
  getById: async (req: Request, res: Response) => {
    res.json(successResponse(await documentRuleService.getById(req.params.id as string)));
  },
  create: async (req: Request, res: Response) => {
    res.status(201).json(successResponse(await documentRuleService.create(req.body, ctx(req))));
  },
  update: async (req: Request, res: Response) => {
    res.json(successResponse(await documentRuleService.update(req.params.id as string, req.body, ctx(req))));
  },
  remove: async (req: Request, res: Response) => {
    await documentRuleService.remove(req.params.id as string, ctx(req));
    res.status(204).send();
  },
  resolve: async (req: Request, res: Response) => {
    res.json(successResponse(await documentRuleService.resolve(req.body)));
  },
};

export const lenderController = {
  list: async (req: Request, res: Response) => {
    const result = await lenderService.list(req.query as never);
    res.json(paginatedResponse(result.items, result.meta));
  },
  getById: async (req: Request, res: Response) => {
    res.json(successResponse(await lenderService.getById(req.params.id as string)));
  },
  create: async (req: Request, res: Response) => {
    res.status(201).json(successResponse(await lenderService.create(req.body, ctx(req))));
  },
  update: async (req: Request, res: Response) => {
    res.json(successResponse(await lenderService.update(req.params.id as string, req.body, ctx(req))));
  },
  deactivate: async (req: Request, res: Response) => {
    res.json(successResponse(await lenderService.deactivate(req.params.id as string, ctx(req))));
  },
};

export const lenderPolicyController = {
  list: async (req: Request, res: Response) => {
    const result = await lenderPolicyService.list(req.query as never);
    res.json(paginatedResponse(result.items, result.meta));
  },
  getById: async (req: Request, res: Response) => {
    res.json(successResponse(await lenderPolicyService.getById(req.params.id as string)));
  },
  create: async (req: Request, res: Response) => {
    res.status(201).json(successResponse(await lenderPolicyService.create(req.body, ctx(req))));
  },
  update: async (req: Request, res: Response) => {
    res.json(successResponse(await lenderPolicyService.update(req.params.id as string, req.body, ctx(req))));
  },
};

export const productLenderMappingController = {
  list: async (req: Request, res: Response) => {
    const result = await productLenderMappingService.list(req.query as never);
    res.json(paginatedResponse(result.items, result.meta));
  },
  getById: async (req: Request, res: Response) => {
    res.json(successResponse(await productLenderMappingService.getById(req.params.id as string)));
  },
  create: async (req: Request, res: Response) => {
    res.status(201).json(successResponse(await productLenderMappingService.create(req.body, ctx(req))));
  },
  update: async (req: Request, res: Response) => {
    res.json(successResponse(await productLenderMappingService.update(req.params.id as string, req.body, ctx(req))));
  },
  remove: async (req: Request, res: Response) => {
    await productLenderMappingService.remove(req.params.id as string, ctx(req));
    res.status(204).send();
  },
};
