import { Router } from 'express';

import { asyncHandler } from '../../../shared/middleware/async-handler.middleware.js';
import { validateMiddleware } from '../../../shared/middleware/validate.middleware.js';
import { successResponse } from '../../../shared/responses/success-response.js';
import {
  websiteLeadIntakeSchema,
  websitePartnerIntakeSchema,
  websitePartnerAuthSchema,
  websiteVisitorIntakeSchema,
} from '../validators/lead.validator.js';
import { requireWebsiteIntakeKey } from '../middleware/website-intake-auth.middleware.js';
import { websiteIntakeService } from '../services/website-intake.service.js';

export const publicWebsiteIntakeRoutes: Router = Router();

publicWebsiteIntakeRoutes.use(requireWebsiteIntakeKey);

publicWebsiteIntakeRoutes.get('/health', (_req, res) => {
  res.json(successResponse({ module: 'website-intake', status: 'ok' }));
});

publicWebsiteIntakeRoutes.post(
  '/leads',
  validateMiddleware(websiteLeadIntakeSchema),
  asyncHandler(async (req, res) => {
    const result = await websiteIntakeService.ingestLead(req.body);
    res.status(result.duplicate ? 200 : 201).json(successResponse(result));
  }),
);

publicWebsiteIntakeRoutes.post(
  '/partners',
  validateMiddleware(websitePartnerIntakeSchema),
  asyncHandler(async (req, res) => {
    const result = await websiteIntakeService.ingestPartner(req.body);
    res.status(result.duplicate ? 200 : 201).json(successResponse(result));
  }),
);

publicWebsiteIntakeRoutes.post(
  '/partner-auth',
  validateMiddleware(websitePartnerAuthSchema),
  asyncHandler(async (req, res) => {
    const ctx = {
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      requestId: req.requestId,
    };
    const result = await websiteIntakeService.partnerAuth(req.body, ctx);
    res.json(successResponse(result));
  }),
);

publicWebsiteIntakeRoutes.post(
  '/visitors',
  validateMiddleware(websiteVisitorIntakeSchema),
  asyncHandler(async (req, res) => {
    const ctx = {
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    };
    const result = await websiteIntakeService.ingestVisitor(req.body, ctx);
    res.status(result.duplicate ? 200 : 201).json(successResponse(result));
  }),
);
