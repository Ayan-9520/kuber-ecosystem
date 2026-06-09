import type { Request, Response } from 'express';

import { paginatedResponse, successResponse } from '../../../shared/responses/success-response.js';
import { customerAddressService } from '../services/customer-address.service.js';
import { customerConsentService } from '../services/customer-consent.service.js';
import { customerEmploymentService } from '../services/customer-employment.service.js';
import { customerIncomeService } from '../services/customer-income.service.js';
import { customerPreferencesService } from '../services/customer-preferences.service.js';
import { customerProfileService } from '../services/customer-profile.service.js';
import { customerService } from '../services/customer.service.js';
import type { RequestContext } from '../types/customers.types.js';

function buildContext(req: Request): RequestContext {
  return {
    actorId: req.user!.id,
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
    requestId: req.requestId,
  };
}

export const customerController = {
  list: async (req: Request, res: Response): Promise<void> => {
    const result = await customerService.list(req.user!, req.query as never);
    res.json(paginatedResponse(result.items, result.meta));
  },
  getById: async (req: Request, res: Response): Promise<void> => {
    const result = await customerService.getById(req.user!, req.params.id as string);
    res.json(successResponse(result));
  },
  create: async (req: Request, res: Response): Promise<void> => {
    const result = await customerService.create(req.user!, req.body, buildContext(req));
    res.status(201).json(successResponse(result));
  },
  update: async (req: Request, res: Response): Promise<void> => {
    const result = await customerService.update(
      req.user!,
      req.params.id as string,
      req.body,
      buildContext(req),
    );
    res.json(successResponse(result));
  },
  remove: async (req: Request, res: Response): Promise<void> => {
    await customerService.remove(req.user!, req.params.id as string, buildContext(req));
    res.status(204).send();
  },
};

export const customerProfileController = {
  get: async (req: Request, res: Response): Promise<void> => {
    const customerId = (req.query.customerId as string) ?? req.user!.customerId!;
    const result = await customerProfileService.get(req.user!, customerId);
    res.json(successResponse(result));
  },
  upsert: async (req: Request, res: Response): Promise<void> => {
    const result = await customerProfileService.upsert(req.user!, req.body, buildContext(req));
    res.json(successResponse(result));
  },
};

export const customerAddressController = {
  list: async (req: Request, res: Response): Promise<void> => {
    const { customerId, addressType } = req.query as { customerId: string; addressType?: string };
    const result = await customerAddressService.list(req.user!, customerId, addressType);
    res.json(successResponse(result));
  },
  create: async (req: Request, res: Response): Promise<void> => {
    const result = await customerAddressService.create(req.user!, req.body, buildContext(req));
    res.status(201).json(successResponse(result));
  },
  update: async (req: Request, res: Response): Promise<void> => {
    const result = await customerAddressService.update(
      req.user!,
      req.params.id as string,
      req.body,
      buildContext(req),
    );
    res.json(successResponse(result));
  },
  remove: async (req: Request, res: Response): Promise<void> => {
    await customerAddressService.remove(req.user!, req.params.id as string, buildContext(req));
    res.status(204).send();
  },
};

export const customerEmploymentController = {
  list: async (req: Request, res: Response): Promise<void> => {
    const { customerId, isCurrent } = req.query as never;
    const result = await customerEmploymentService.list(req.user!, customerId, isCurrent);
    res.json(successResponse(result));
  },
  create: async (req: Request, res: Response): Promise<void> => {
    const result = await customerEmploymentService.create(req.user!, req.body, buildContext(req));
    res.status(201).json(successResponse(result));
  },
  update: async (req: Request, res: Response): Promise<void> => {
    const result = await customerEmploymentService.update(
      req.user!,
      req.params.id as string,
      req.body,
      buildContext(req),
    );
    res.json(successResponse(result));
  },
  remove: async (req: Request, res: Response): Promise<void> => {
    await customerEmploymentService.remove(req.user!, req.params.id as string, buildContext(req));
    res.status(204).send();
  },
};

export const customerIncomeController = {
  list: async (req: Request, res: Response): Promise<void> => {
    const { customerId, employmentId } = req.query as {
      customerId: string;
      employmentId?: string;
    };
    const result = await customerIncomeService.list(req.user!, customerId, employmentId);
    res.json(successResponse(result));
  },
  create: async (req: Request, res: Response): Promise<void> => {
    const result = await customerIncomeService.create(req.user!, req.body, buildContext(req));
    res.status(201).json(successResponse(result));
  },
  update: async (req: Request, res: Response): Promise<void> => {
    const result = await customerIncomeService.update(
      req.user!,
      req.params.id as string,
      req.body,
      buildContext(req),
    );
    res.json(successResponse(result));
  },
  remove: async (req: Request, res: Response): Promise<void> => {
    await customerIncomeService.remove(req.user!, req.params.id as string, buildContext(req));
    res.status(204).send();
  },
};

export const customerPreferencesController = {
  get: async (req: Request, res: Response): Promise<void> => {
    const customerId = (req.query.customerId as string) ?? req.user!.customerId!;
    const result = await customerPreferencesService.get(req.user!, customerId);
    res.json(successResponse(result));
  },
  upsert: async (req: Request, res: Response): Promise<void> => {
    const result = await customerPreferencesService.upsert(req.user!, req.body, buildContext(req));
    res.json(successResponse(result));
  },
};

export const customerConsentController = {
  list: async (req: Request, res: Response): Promise<void> => {
    const { customerId, consentType } = req.query as {
      customerId: string;
      consentType?: string;
    };
    const result = await customerConsentService.list(req.user!, customerId, consentType);
    res.json(successResponse(result));
  },
  create: async (req: Request, res: Response): Promise<void> => {
    const result = await customerConsentService.create(req.user!, req.body, buildContext(req));
    res.status(201).json(successResponse(result));
  },
};
