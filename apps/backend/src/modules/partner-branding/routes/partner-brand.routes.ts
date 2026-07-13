import { Router } from 'express';

import { asyncHandler } from '../../../shared/middleware/async-handler.middleware.js';
import { authenticateWithSessionMiddleware } from '../../../shared/middleware/authenticate.middleware.js';
import { validateMiddleware } from '../../../shared/middleware/validate.middleware.js';
import { partnerBrandController } from '../controllers/partner-brand.controller.js';
import {
  generateBrandContentSchema,
  listProfessionalsQuerySchema,
  partnerBrandAchievementInputSchema,
  partnerBrandCertificateInputSchema,
  partnerBrandGalleryInputSchema,
  partnerBrandMediaInputSchema,
  partnerBrandReviewInputSchema,
  partnerBrandTeamMemberInputSchema,
  publishPartnerBrandSchema,
  slugParamSchema,
  updatePartnerBrandProfileSchema,
} from '../validators/partner-brand.validator.js';

export const publicPartnerBrandRoutes: Router = Router();

publicPartnerBrandRoutes.get('/health', asyncHandler(partnerBrandController.health));
publicPartnerBrandRoutes.get(
  '/',
  validateMiddleware(listProfessionalsQuerySchema, 'query'),
  asyncHandler(partnerBrandController.listProfessionals),
);
publicPartnerBrandRoutes.get(
  '/:slug',
  validateMiddleware(slugParamSchema, 'params'),
  asyncHandler(partnerBrandController.getPublicProfile),
);
publicPartnerBrandRoutes.get(
  '/:slug/share',
  validateMiddleware(slugParamSchema, 'params'),
  asyncHandler(partnerBrandController.getShareUrls),
);

export const partnerBrandRoutes: Router = Router();

partnerBrandRoutes.use(authenticateWithSessionMiddleware);
partnerBrandRoutes.get('/me', asyncHandler(partnerBrandController.getMyProfile));
partnerBrandRoutes.patch(
  '/me',
  validateMiddleware(updatePartnerBrandProfileSchema),
  asyncHandler(partnerBrandController.updateMyProfile),
);
partnerBrandRoutes.post(
  '/me/publish',
  validateMiddleware(publishPartnerBrandSchema),
  asyncHandler(partnerBrandController.publishMyProfile),
);
partnerBrandRoutes.post(
  '/me/generate-content',
  validateMiddleware(generateBrandContentSchema),
  asyncHandler(partnerBrandController.generateContent),
);
partnerBrandRoutes.post(
  '/me/achievements',
  validateMiddleware(partnerBrandAchievementInputSchema),
  asyncHandler(partnerBrandController.addAchievement),
);
partnerBrandRoutes.post(
  '/me/certificates',
  validateMiddleware(partnerBrandCertificateInputSchema),
  asyncHandler(partnerBrandController.addCertificate),
);
partnerBrandRoutes.post(
  '/me/reviews',
  validateMiddleware(partnerBrandReviewInputSchema),
  asyncHandler(partnerBrandController.addReview),
);
partnerBrandRoutes.post(
  '/me/media',
  validateMiddleware(partnerBrandMediaInputSchema),
  asyncHandler(partnerBrandController.addMedia),
);
partnerBrandRoutes.post(
  '/me/gallery',
  validateMiddleware(partnerBrandGalleryInputSchema),
  asyncHandler(partnerBrandController.addGalleryItem),
);
partnerBrandRoutes.post(
  '/me/team',
  validateMiddleware(partnerBrandTeamMemberInputSchema),
  asyncHandler(partnerBrandController.addTeamMember),
);
