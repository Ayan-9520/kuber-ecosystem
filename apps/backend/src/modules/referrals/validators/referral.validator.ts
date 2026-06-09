export {
  convertReferralSchema,
  createReferralSchema,
  createReferralTypeSchema,
  listReferralsQuerySchema,
  listReferralTypesQuerySchema,
  rejectReferralSchema,
  updateReferralSchema,
  updateReferralTypeSchema,
  validateReferralCodeSchema,
} from '@kuberone/shared-validation';

export { z } from 'zod';

import { z } from 'zod';

export const uuidParamSchema = z.object({
  id: z.string().uuid(),
});
