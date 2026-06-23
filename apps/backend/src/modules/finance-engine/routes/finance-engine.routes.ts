import { Router } from 'express';

import { asyncHandler } from '../../../shared/middleware/async-handler.middleware.js';
import { RBAC_PERMISSIONS } from '../../../shared/constants/rbac.constants.js';
import { authenticateWithSessionMiddleware } from '../../../shared/middleware/authenticate.middleware.js';
import { requireAnyPermission } from '../../../shared/middleware/rbac.middleware.js';
import { validateMiddleware } from '../../../shared/middleware/validate.middleware.js';
import { financeEngineController } from '../controllers/finance-engine.controller.js';
import {
  calculateApprovalProbabilitySchema,
  calculateEligibilitySchema,
  calculateEmiSchema,
  calculateLoanComparisonSchema,
  calculateSavingsSchema,
  lenderRecommendationSchema,
  listFinanceCalculationsQuerySchema,
  productRecommendationSchema,
  uuidParamSchema,
} from '../validators/finance-engine.validator.js';

const emiRead = requireAnyPermission(RBAC_PERMISSIONS.EMI_READ, 'emi.read');
const eligibilityRead = requireAnyPermission(RBAC_PERMISSIONS.ELIGIBILITY_READ, 'eligibility.read');

export const emiCalculateRoutes = Router();
emiCalculateRoutes.use(authenticateWithSessionMiddleware);
emiCalculateRoutes.post('/calculate', emiRead, validateMiddleware(calculateEmiSchema), asyncHandler(financeEngineController.calculateEmi));

export const eligibilityCalculateRoutes = Router();
eligibilityCalculateRoutes.use(authenticateWithSessionMiddleware);
eligibilityCalculateRoutes.post(
  '/calculate',
  eligibilityRead,
  validateMiddleware(calculateEligibilitySchema),
  asyncHandler(financeEngineController.calculateEligibility),
);

export const savingsCalculateRoutes = Router();
savingsCalculateRoutes.use(authenticateWithSessionMiddleware);
savingsCalculateRoutes.post(
  '/calculate',
  emiRead,
  validateMiddleware(calculateSavingsSchema),
  asyncHandler(financeEngineController.calculateSavings),
);

export const loanComparisonRoutes = Router();
loanComparisonRoutes.use(authenticateWithSessionMiddleware);
loanComparisonRoutes.post('/', eligibilityRead, validateMiddleware(calculateLoanComparisonSchema), asyncHandler(financeEngineController.compareLoans));

export const approvalProbabilityRoutes = Router();
approvalProbabilityRoutes.use(authenticateWithSessionMiddleware);
approvalProbabilityRoutes.post(
  '/',
  eligibilityRead,
  validateMiddleware(calculateApprovalProbabilitySchema),
  asyncHandler(financeEngineController.calculateApprovalProbability),
);

export const financeEngineHistoryRoutes = Router();
financeEngineHistoryRoutes.use(authenticateWithSessionMiddleware);
financeEngineHistoryRoutes.get(
  '/',
  eligibilityRead,
  validateMiddleware(listFinanceCalculationsQuerySchema, 'query'),
  asyncHandler(financeEngineController.listCalculations),
);
financeEngineHistoryRoutes.get(
  '/:id',
  eligibilityRead,
  validateMiddleware(uuidParamSchema, 'params'),
  asyncHandler(financeEngineController.getCalculationById),
);

export const aiFinanceRoutes = Router();
aiFinanceRoutes.use(authenticateWithSessionMiddleware);
aiFinanceRoutes.post(
  '/product-recommendations',
  eligibilityRead,
  validateMiddleware(productRecommendationSchema),
  asyncHandler(financeEngineController.getProductRecommendations),
);
aiFinanceRoutes.post(
  '/lender-recommendations',
  eligibilityRead,
  validateMiddleware(lenderRecommendationSchema),
  asyncHandler(financeEngineController.getLenderRecommendations),
);
