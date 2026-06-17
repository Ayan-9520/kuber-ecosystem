import { Router } from 'express';

import { RBAC_PERMISSIONS } from '../../../shared/constants/rbac.constants.js';
import { asyncHandler } from '../../../shared/middleware/async-handler.middleware.js';
import { authenticateWithSessionMiddleware } from '../../../shared/middleware/authenticate.middleware.js';
import { requireAnyPermission } from '../../../shared/middleware/rbac.middleware.js';
import { validateMiddleware } from '../../../shared/middleware/validate.middleware.js';
import { backupController } from '../controllers/backup.controller.js';
import {
  backupIdParamSchema,
  backupQuerySchema,
  listBackupHistoryQuerySchema,
  listBackupJobsQuerySchema,
  restoreRequestSchema,
  triggerBackupSchema,
} from '../validators/backup.validator.js';

export const backupRoutes: Router = Router();

const backupRead = requireAnyPermission(RBAC_PERMISSIONS.BACKUP_READ, 'backup.read');
const backupManage = requireAnyPermission(RBAC_PERMISSIONS.BACKUP_MANAGE, 'backup.manage');
const backupRestore = requireAnyPermission(RBAC_PERMISSIONS.BACKUP_RESTORE, 'backup.restore');

backupRoutes.get('/health', asyncHandler(backupController.health));
backupRoutes.use(authenticateWithSessionMiddleware);

backupRoutes.get('/', backupRead, validateMiddleware(backupQuerySchema, 'query'), asyncHandler(backupController.overview));
backupRoutes.get('/jobs', backupRead, validateMiddleware(listBackupJobsQuerySchema, 'query'), asyncHandler(backupController.listJobs));
backupRoutes.get('/history', backupRead, validateMiddleware(listBackupHistoryQuerySchema, 'query'), asyncHandler(backupController.history));
backupRoutes.get('/retention', backupRead, asyncHandler(backupController.retention));
backupRoutes.post('/', backupManage, validateMiddleware(triggerBackupSchema), asyncHandler(backupController.trigger));
backupRoutes.get('/history/:id', backupRead, validateMiddleware(backupIdParamSchema, 'params'), asyncHandler(backupController.getExecution));
backupRoutes.post('/history/:id/verify', backupManage, validateMiddleware(backupIdParamSchema, 'params'), asyncHandler(backupController.verify));
backupRoutes.post('/restore', backupRestore, validateMiddleware(restoreRequestSchema), asyncHandler(backupController.restore));
backupRoutes.get('/restore', backupRestore, asyncHandler(backupController.listRestores));
