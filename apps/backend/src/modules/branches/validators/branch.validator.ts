export {
  createBranchSchema,
  createRegionSchema,
  listBranchesQuerySchema,
  listRegionsQuerySchema,
  updateBranchSchema,
  updateRegionSchema,
} from '@kuberone/shared-validation';

export { z } from 'zod';

import { z } from 'zod';

export const uuidParamSchema = z.object({
  id: z.string().uuid(),
});
