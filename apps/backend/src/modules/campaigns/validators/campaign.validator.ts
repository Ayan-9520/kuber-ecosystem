export {
  createCampaignSchema,
  listCampaignsQuerySchema,
  updateCampaignMetricsSchema,
  updateCampaignSchema,
} from '@kuberone/shared-validation';

export { z } from 'zod';

import { z } from 'zod';

export const uuidParamSchema = z.object({
  id: z.string().uuid(),
});
