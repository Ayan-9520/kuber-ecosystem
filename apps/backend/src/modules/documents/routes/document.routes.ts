import { Router } from 'express';
import { z } from 'zod';

import { RBAC_PERMISSIONS } from '../../../shared/constants/rbac.constants.js';
import { authenticateWithSessionMiddleware } from '../../../shared/middleware/authenticate.middleware.js';
import { requireAnyPermission } from '../../../shared/middleware/rbac.middleware.js';
import { validateMiddleware } from '../../../shared/middleware/validate.middleware.js';
import {
  documentController,
  documentDeficiencyController,
  documentRequestController,
  documentTypeController,
  documentVersionController,
  ocrResultController,
  verificationResultController,
} from '../controllers/document.controller.js';
import {
  autoVerifySchema,
  confirmUploadSchema,
  createDocumentDeficiencySchema,
  createDocumentRequestSchema,
  createDocumentTypeSchema,
  listDocumentDeficienciesQuerySchema,
  listDocumentRequestsQuerySchema,
  listDocumentTypesQuerySchema,
  listDocumentVersionsQuerySchema,
  listDocumentsQuerySchema,
  listOcrResultsQuerySchema,
  listVerificationResultsQuerySchema,
  presignUploadSchema,
  replaceDocumentSchema,
  runOcrSchema,
  scanDeficienciesSchema,
  updateDocumentDeficiencySchema,
  updateDocumentRequestSchema,
  updateDocumentTypeSchema,
  uploadDocumentSchema,
  uuidParamSchema,
  verifyDocumentSchema,
} from '../validators/document.validator.js';

const docsRead = requireAnyPermission(RBAC_PERMISSIONS.DOCUMENTS_READ, 'documents.read');
const docsWrite = requireAnyPermission(RBAC_PERMISSIONS.DOCUMENTS_WRITE, 'documents.write');
const docsVerify = requireAnyPermission(
  RBAC_PERMISSIONS.DOCUMENTS_VERIFY,
  'documents.verify',
  RBAC_PERMISSIONS.DOCUMENTS_WRITE,
);
const docsApprove = requireAnyPermission(
  RBAC_PERMISSIONS.DOCUMENTS_APPROVE,
  'documents.approve',
  RBAC_PERMISSIONS.DOCUMENTS_VERIFY,
);
const docsDownload = requireAnyPermission(
  RBAC_PERMISSIONS.DOCUMENTS_DOWNLOAD,
  'documents.download',
  RBAC_PERMISSIONS.DOCUMENTS_READ,
);

const rejectSchema = z.object({ reason: z.string().min(1).max(200) });

export const documentRoutes = Router();
documentRoutes.use(authenticateWithSessionMiddleware);
documentRoutes.get('/', docsRead, validateMiddleware(listDocumentsQuerySchema, 'query'), documentController.list);
documentRoutes.post('/upload', docsWrite, validateMiddleware(uploadDocumentSchema), documentController.upload);
documentRoutes.post('/presign-upload', docsWrite, validateMiddleware(presignUploadSchema), documentController.presignUpload);
documentRoutes.post('/confirm-upload', docsWrite, validateMiddleware(confirmUploadSchema), documentController.confirmUpload);
documentRoutes.get('/:id/download-url', docsDownload, validateMiddleware(uuidParamSchema, 'params'), documentController.downloadUrl);
documentRoutes.get('/:id', docsRead, validateMiddleware(uuidParamSchema, 'params'), documentController.getById);
documentRoutes.patch(
  '/:id/replace',
  docsWrite,
  validateMiddleware(uuidParamSchema, 'params'),
  validateMiddleware(replaceDocumentSchema),
  documentController.replace,
);
documentRoutes.post(
  '/:id/verify',
  docsVerify,
  validateMiddleware(uuidParamSchema, 'params'),
  validateMiddleware(verifyDocumentSchema),
  documentController.verify,
);
documentRoutes.post('/:id/approve', docsApprove, validateMiddleware(uuidParamSchema, 'params'), documentController.approve);
documentRoutes.post(
  '/:id/reject',
  docsApprove,
  validateMiddleware(uuidParamSchema, 'params'),
  validateMiddleware(rejectSchema),
  documentController.reject,
);
documentRoutes.delete('/:id', docsWrite, validateMiddleware(uuidParamSchema, 'params'), documentController.remove);

export const documentTypeRoutes = Router();
documentTypeRoutes.use(authenticateWithSessionMiddleware);
documentTypeRoutes.get('/', docsRead, validateMiddleware(listDocumentTypesQuerySchema, 'query'), documentTypeController.list);
documentTypeRoutes.post('/', docsWrite, validateMiddleware(createDocumentTypeSchema), documentTypeController.create);
documentTypeRoutes.get('/:id', docsRead, validateMiddleware(uuidParamSchema, 'params'), documentTypeController.getById);
documentTypeRoutes.patch(
  '/:id',
  docsWrite,
  validateMiddleware(uuidParamSchema, 'params'),
  validateMiddleware(updateDocumentTypeSchema),
  documentTypeController.update,
);
documentTypeRoutes.post('/:id/deactivate', docsWrite, validateMiddleware(uuidParamSchema, 'params'), documentTypeController.deactivate);

export const documentRequestRoutes = Router();
documentRequestRoutes.use(authenticateWithSessionMiddleware);
documentRequestRoutes.get('/', docsRead, validateMiddleware(listDocumentRequestsQuerySchema, 'query'), documentRequestController.list);
documentRequestRoutes.post('/', docsWrite, validateMiddleware(createDocumentRequestSchema), documentRequestController.create);
documentRequestRoutes.get('/:id', docsRead, validateMiddleware(uuidParamSchema, 'params'), documentRequestController.getById);
documentRequestRoutes.patch(
  '/:id',
  docsWrite,
  validateMiddleware(uuidParamSchema, 'params'),
  validateMiddleware(updateDocumentRequestSchema),
  documentRequestController.update,
);

export const documentVersionRoutes = Router();
documentVersionRoutes.use(authenticateWithSessionMiddleware);
documentVersionRoutes.get('/', docsRead, validateMiddleware(listDocumentVersionsQuerySchema, 'query'), documentVersionController.list);
documentVersionRoutes.get('/:id', docsRead, validateMiddleware(uuidParamSchema, 'params'), documentVersionController.getById);

export const ocrResultRoutes = Router();
ocrResultRoutes.use(authenticateWithSessionMiddleware);
ocrResultRoutes.get('/', docsRead, validateMiddleware(listOcrResultsQuerySchema, 'query'), ocrResultController.list);
ocrResultRoutes.post('/run', docsWrite, validateMiddleware(runOcrSchema), ocrResultController.run);
ocrResultRoutes.get('/:id', docsRead, validateMiddleware(uuidParamSchema, 'params'), ocrResultController.getById);

export const verificationResultRoutes = Router();
verificationResultRoutes.use(authenticateWithSessionMiddleware);
verificationResultRoutes.get('/', docsRead, validateMiddleware(listVerificationResultsQuerySchema, 'query'), verificationResultController.list);
verificationResultRoutes.post('/auto-verify', docsVerify, validateMiddleware(autoVerifySchema), verificationResultController.autoVerify);
verificationResultRoutes.get('/:id', docsRead, validateMiddleware(uuidParamSchema, 'params'), verificationResultController.getById);

export const documentDeficiencyRoutes = Router();
documentDeficiencyRoutes.use(authenticateWithSessionMiddleware);
documentDeficiencyRoutes.post('/scan', docsVerify, validateMiddleware(scanDeficienciesSchema), documentDeficiencyController.scan);
documentDeficiencyRoutes.get('/', docsRead, validateMiddleware(listDocumentDeficienciesQuerySchema, 'query'), documentDeficiencyController.list);
documentDeficiencyRoutes.post('/', docsWrite, validateMiddleware(createDocumentDeficiencySchema), documentDeficiencyController.create);
documentDeficiencyRoutes.get('/:id', docsRead, validateMiddleware(uuidParamSchema, 'params'), documentDeficiencyController.getById);
documentDeficiencyRoutes.patch(
  '/:id',
  docsWrite,
  validateMiddleware(uuidParamSchema, 'params'),
  validateMiddleware(updateDocumentDeficiencySchema),
  documentDeficiencyController.update,
);
