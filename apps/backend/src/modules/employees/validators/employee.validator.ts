export {
  createEmployeeSchema,
  listEmployeesQuerySchema,
  updateEmployeeSchema,
} from '@kuberone/shared-validation';

export { z } from 'zod';

import { z } from 'zod';

export const uuidParamSchema = z.object({
  id: z.string().uuid(),
});
