export {
  listSettingsQuerySchema,
  updateSettingSchema,
} from '@kuberone/shared-validation';

export { z } from 'zod';

import { z } from 'zod';

export const settingKeyParamSchema = z.object({
  key: z.string().min(1).max(100),
});
