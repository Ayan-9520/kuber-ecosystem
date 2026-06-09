import { Router } from 'express';

import {
  documentDeficiencyRoutes,
  documentRequestRoutes,
  documentRoutes,
  documentTypeRoutes,
  documentVersionRoutes,
  ocrResultRoutes,
  verificationResultRoutes,
} from './routes/document.routes.js';

export function createDocumentsModule(): Router {
  const router = Router();
  router.use(documentRoutes);
  return router;
}

export function createDocumentTypesModule(): Router {
  const router = Router();
  router.use(documentTypeRoutes);
  return router;
}

export function createDocumentRequestsModule(): Router {
  const router = Router();
  router.use(documentRequestRoutes);
  return router;
}

export function createDocumentVersionsModule(): Router {
  const router = Router();
  router.use(documentVersionRoutes);
  return router;
}

export function createOcrResultsModule(): Router {
  const router = Router();
  router.use(ocrResultRoutes);
  return router;
}

export function createVerificationResultsModule(): Router {
  const router = Router();
  router.use(verificationResultRoutes);
  return router;
}

export function createDocumentDeficienciesModule(): Router {
  const router = Router();
  router.use(documentDeficiencyRoutes);
  return router;
}
