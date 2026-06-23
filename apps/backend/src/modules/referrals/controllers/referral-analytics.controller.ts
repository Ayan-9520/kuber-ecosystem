import type { Request, Response } from 'express';

import { successResponse } from '../../../shared/responses/success-response.js';
import { referralAnalyticsService } from '../services/referral-analytics.service.js';

export const referralAnalyticsController = {
  summary: async (req: Request, res: Response) => {
    const query = req.query as {
      partnerId?: string;
      referrerPartnerId?: string;
      fromDate?: string;
      toDate?: string;
    };
    res.json(
      successResponse(
        await referralAnalyticsService.getSummary(
          {
            partnerId: query.partnerId,
            referrerPartnerId: query.referrerPartnerId,
            fromDate: query.fromDate ? new Date(query.fromDate) : undefined,
            toDate: query.toDate ? new Date(query.toDate) : undefined,
          },
          req.user!,
        ),
      ),
    );
  },
};
