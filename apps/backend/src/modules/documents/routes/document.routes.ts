import { Router } from 'express';
import { z } from 'zod';

import { RBAC_PERMISSIONS } from '../../../shared/constants/rbac.constants.js';
import { asyncHandler } from '../../../shared/middleware/async-handler.middleware.js';
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
documentRoutes.get('/', docsRead, validateMiddleware(listDocumentsQuerySchema, 'query'), asyncHandler(documentController.list));
documentRoutes.get('/local-download', docsDownload, asyncHandler(documentController.localDownload));
documentRoutes.post('/upload', docsWrite, validateMiddleware(uploadDocumentSchema), asyncHandler(documentController.upload));
documentRoutes.post('/presign-upload', docsWrite, validateMiddleware(presignUploadSchema), asyncHandler(documentController.presignUpload));
documentRoutes.post('/confirm-upload', docsWrite, validateMiddleware(confirmUploadSchema), asyncHandler(documentController.confirmUpload));
documentRoutes.get('/:id/download-url', docsDownload, validateMiddleware(uuidParamSchema, 'params'), asyncHandler(documentController.downloadUrl));
documentRoutes.get('/:id', docsRead, validateMiddleware(uuidParamSchema, 'params'), asyncHandler(documentController.getById));
documentRoutes.patch(
  '/:id/replace',
  docsWrite,
  validateMiddleware(uuidParamSchema, 'params'),
  validateMiddleware(replaceDocumentSchema),
  asyncHandler(documentController.replace),
);
documentRoutes.post(
  '/:id/verify',
  docsVerify,
  validateMiddleware(uuidParamSchema, 'params'),
  validateMiddleware(verifyDocumentSchema),
  asyncHandler(documentController.verify),
);
documentRoutes.post('/:id/approve', docsApprove, validateMiddleware(uuidParamSchema, 'params'), asyncHandler(documentController.approve));
documentRoutes.post(
  '/:id/reject',
  docsApprove,
  validateMiddleware(uuidParamSchema, 'params'),
  validateMiddleware(rejectSchema),
  asyncHandler(documentController.reject),
);
documentRoutes.delete('/:id', docsWrite, validateMiddleware(uuidParamSchema, 'params'), asyncHandler(documentController.remove));

export const documentTypeRoutes = Router();
documentTypeRoutes.use(authenticateWithSessionMiddleware);
documentTypeRoutes.get('/', docsRead, validateMiddleware(listDocumentTypesQuerySchema, 'query'), asyncHandler(documentTypeController.list));
documentTypeRoutes.post('/', docsWrite, validateMiddleware(createDocumentTypeSchema), asyncHandler(documentTypeController.create));
documentTypeRoutes.get('/:id', docsRead, validateMiddleware(uuidParamSchema, 'params'), asyncHandler(documentTypeController.getById));
documentTypeRoutes.patch(
  '/:id',
  docsWrite,
  validateMiddleware(uuidParamSchema, 'params'),
  validateMiddleware(updateDocumentTypeSchema),
  asyncHandler(documentTypeController.update),
);
documentTypeRoutes.post('/:id/deactivate', docsWrite, validateMiddleware(uuidParamSchema, 'params'), asyncHandler(documentTypeController.deactivate));

export const documentRequestRoutes = Router();
documentRequestRoutes.use(authenticateWithSessionMiddleware);
documentRequestRoutes.get('/', docsRead, validateMiddleware(listDocumentRequestsQuerySchema, 'query'), asyncHandler(documentRequestController.list));
documentRequestRoutes.post('/', docsWrite, validateMiddleware(createDocumentRequestSchema), asyncHandler(documentRequestController.create));
documentRequestRoutes.get('/:id', docsRead, validateMiddleware(uuidParamSchema, 'params'), asyncHandler(documentRequestController.getById));
documentRequestRoutes.patch(
  '/:id',
  docsWrite,
  validateMiddleware(uuidParamSchema, 'params'),
  validateMiddleware(updateDocumentRequestSchema),
  asyncHandler(documentRequestController.update),
);

export const documentVersionRoutes = Router();
documentVersionRoutes.use(authenticateWithSessionMiddleware);
documentVersionRoutes.get('/', docsRead, validateMiddleware(listDocumentVersionsQuerySchema, 'query'), asyncHandler(documentVersionController.list));
documentVersionRoutes.get('/:id', docsRead, validateMiddleware(uuidParamSchema, 'params'), asyncHandler(documentVersionController.getById));

export const ocrResultRoutes = Router();
ocrResultRoutes.use(authenticateWithSessionMiddleware);
ocrResultRoutes.get('/', docsRead, validateMiddleware(listOcrResultsQuerySchema, 'query'), asyncHandler(ocrResultController.list));
ocrResultRoutes.post('/run', docsWrite, validateMiddleware(runOcrSchema), asyncHandler(ocrResultController.run));
ocrResultRoutes.get('/:id', docsRead, validateMiddleware(uuidParamSchema, 'params'), asyncHandler(ocrResultController.getById));

export const verificationResultRoutes = Router();
verificationResultRoutes.use(authenticateWithSessionMiddleware);
verificationResultRoutes.get('/', docsRead, validateMiddleware(listVerificationResultsQuerySchema, 'query'), asyncHandler(verificationResultController.list));
verificationResultRoutes.post('/auto-verify', docsVerify, validateMiddleware(autoVerifySchema), asyncHandler(verificationResultController.autoVerify));
verificationResultRoutes.get('/:id', docsRead, validateMiddleware(uuidParamSchema, 'params'), asyncHandler(verificationResultController.getById));

export const documentDeficiencyRoutes = Router();
documentDeficiencyRoutes.use(authenticateWithSessionMiddleware);
documentDeficiencyRoutes.post('/scan', docsVerify, validateMiddleware(scanDeficienciesSchema), asyncHandler(documentDeficiencyController.scan));
documentDeficiencyRoutes.get('/', docsRead, validateMiddleware(listDocumentDeficienciesQuerySchema, 'query'), asyncHandler(documentDeficiencyController.list));
documentDeficiencyRoutes.post('/', docsWrite, validateMiddleware(createDocumentDeficiencySchema), asyncHandler(documentDeficiencyController.create));
documentDeficiencyRoutes.get('/:id', docsRead, validateMiddleware(uuidParamSchema, 'params'), asyncHandler(documentDeficiencyController.getById));
documentDeficiencyRoutes.patch(
  '/:id',
  docsWrite,
  validateMiddleware(uuidParamSchema, 'params'),
  validateMiddleware(updateDocumentDeficiencySchema),
  asyncHandler(documentDeficiencyController.update),
);
