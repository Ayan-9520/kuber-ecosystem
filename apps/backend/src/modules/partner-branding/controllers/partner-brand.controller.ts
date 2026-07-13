import type { Request, Response } from 'express';

import { ForbiddenError } from '../../../shared/errors/app-error.js';
import { paginatedResponse, successResponse } from '../../../shared/responses/success-response.js';
import { partnerBrandService } from '../services/partner-brand.service.js';

function getBaseUrl(req: Request): string {
  const configured = process.env.PUBLIC_PROFILE_BASE_URL;
  if (configured) return configured.replace(/\/$/, '');
  const host = req.get('x-forwarded-host') ?? req.get('host') ?? 'localhost:5174';
  const proto = req.get('x-forwarded-proto') ?? (host.includes('localhost') ? 'http' : 'https');
  return `${proto}://${host}`;
}

function requirePartnerId(req: Request): string {
  const partnerId = req.user?.partnerId;
  if (!partnerId) throw new ForbiddenError('Partner account required');
  return partnerId;
}

export const partnerBrandController = {
  health: async (_req: Request, res: Response): Promise<void> => {
    res.json(successResponse(await partnerBrandService.health()));
  },

  listProfessionals: async (req: Request, res: Response): Promise<void> => {
    const result = await partnerBrandService.listProfessionals(req.query as never, getBaseUrl(req));
    res.json(paginatedResponse(result.items, result.meta, result.directoryTitle));
  },

  getPublicProfile: async (req: Request, res: Response): Promise<void> => {
    res.json(successResponse(await partnerBrandService.getPublicProfile(req.params.slug as string, getBaseUrl(req))));
  },

  getShareUrls: async (req: Request, res: Response): Promise<void> => {
    const profile = await partnerBrandService.getPublicProfile(req.params.slug as string, getBaseUrl(req));
    res.json(
      successResponse(
        partnerBrandService.getShareUrls(profile.slug, getBaseUrl(req), profile.displayName),
      ),
    );
  },

  getMyProfile: async (req: Request, res: Response): Promise<void> => {
    res.json(successResponse(await partnerBrandService.getMyProfile(requirePartnerId(req), getBaseUrl(req))));
  },

  updateMyProfile: async (req: Request, res: Response): Promise<void> => {
    res.json(
      successResponse(
        await partnerBrandService.updateMyProfile(requirePartnerId(req), req.body, getBaseUrl(req)),
      ),
    );
  },

  publishMyProfile: async (req: Request, res: Response): Promise<void> => {
    res.json(
      successResponse(
        await partnerBrandService.publishMyProfile(requirePartnerId(req), req.body.publish, getBaseUrl(req)),
      ),
    );
  },

  generateContent: async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw new ForbiddenError('Authentication required');
    res.json(
      successResponse(
        await partnerBrandService.generateContent(
          requirePartnerId(req),
          req.body,
          req.user,
          { ipAddress: req.ip },
        ),
      ),
    );
  },

  addAchievement: async (req: Request, res: Response): Promise<void> => {
    res.status(201).json(successResponse(await partnerBrandService.addAchievement(requirePartnerId(req), req.body)));
  },

  addCertificate: async (req: Request, res: Response): Promise<void> => {
    res.status(201).json(successResponse(await partnerBrandService.addCertificate(requirePartnerId(req), req.body)));
  },

  addReview: async (req: Request, res: Response): Promise<void> => {
    res.status(201).json(successResponse(await partnerBrandService.addReview(requirePartnerId(req), req.body)));
  },

  addMedia: async (req: Request, res: Response): Promise<void> => {
    res.status(201).json(successResponse(await partnerBrandService.addMedia(requirePartnerId(req), req.body)));
  },

  addGalleryItem: async (req: Request, res: Response): Promise<void> => {
    res.status(201).json(successResponse(await partnerBrandService.addGalleryItem(requirePartnerId(req), req.body)));
  },

  addTeamMember: async (req: Request, res: Response): Promise<void> => {
    res.status(201).json(successResponse(await partnerBrandService.addTeamMember(requirePartnerId(req), req.body)));
  },
};
