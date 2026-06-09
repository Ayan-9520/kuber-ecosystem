import type { Request, Response } from 'express';
import { Router } from 'express';

import { RBAC_PERMISSIONS } from '../../../shared/constants/rbac.constants.js';
import { authenticateWithSessionMiddleware } from '../../../shared/middleware/authenticate.middleware.js';
import { requireAnyPermission } from '../../../shared/middleware/rbac.middleware.js';
import { validateMiddleware } from '../../../shared/middleware/validate.middleware.js';
import {
  documentRuleController,
  eligibilityRuleController,
  lenderController,
  lenderPolicyController,
  productController,
  productFamilyController,
  productLenderMappingController,
  productVariantController,
} from '../controllers/product.controller.js';
import {
  createDocumentRuleSchema,
  createEligibilityRuleSchema,
  createLenderPolicySchema,
  createLenderSchema,
  createProductFamilySchema,
  createProductLenderMappingSchema,
  createProductSchema,
  createProductVariantSchema,
  evaluateEligibilitySchema,
  listDocumentRulesQuerySchema,
  listEligibilityRulesQuerySchema,
  listLenderPoliciesQuerySchema,
  listLendersQuerySchema,
  listProductLenderMappingsQuerySchema,
  listProductVariantsQuerySchema,
  listProductsQuerySchema,
  listQuerySchema,
  productRecommendationSchema,
  resolveDocumentsSchema,
  updateDocumentRuleSchema,
  updateEligibilityRuleSchema,
  updateLenderPolicySchema,
  updateLenderSchema,
  updateProductFamilySchema,
  updateProductLenderMappingSchema,
  updateProductSchema,
  updateProductVariantSchema,
  uuidParamSchema,
} from '../validators/product.validator.js';

const productsRead = requireAnyPermission(
  RBAC_PERMISSIONS.PRODUCTS_READ,
  'products.read',
  RBAC_PERMISSIONS.ELIGIBILITY_READ,
);
const productsWrite = requireAnyPermission(
  RBAC_PERMISSIONS.PRODUCTS_WRITE,
  'products.write',
  RBAC_PERMISSIONS.PRODUCTS_CONFIGURE,
);
const productsConfigure = requireAnyPermission(
  RBAC_PERMISSIONS.PRODUCTS_CONFIGURE,
  'products.configure',
  RBAC_PERMISSIONS.PRODUCTS_WRITE,
);
const lendersRead = requireAnyPermission(RBAC_PERMISSIONS.LENDERS_READ, 'lenders.read', RBAC_PERMISSIONS.PRODUCTS_READ);
const lendersWrite = requireAnyPermission(RBAC_PERMISSIONS.LENDERS_WRITE, 'lenders.write', RBAC_PERMISSIONS.PRODUCTS_WRITE);
const eligibilityRead = requireAnyPermission(RBAC_PERMISSIONS.ELIGIBILITY_READ, 'eligibility.read', RBAC_PERMISSIONS.PRODUCTS_READ);
const eligibilityWrite = requireAnyPermission(RBAC_PERMISSIONS.ELIGIBILITY_WRITE, 'eligibility.write', RBAC_PERMISSIONS.PRODUCTS_CONFIGURE);

function crudRoutes(
  router: Router,
  readPerm: ReturnType<typeof requireAnyPermission>,
  writePerm: ReturnType<typeof requireAnyPermission>,
  controller: {
    list: (req: Request, res: Response) => Promise<void>;
    getById: (req: Request, res: Response) => Promise<void>;
    create: (req: Request, res: Response) => Promise<void>;
    update: (req: Request, res: Response) => Promise<void>;
  },
  listSchema: typeof listQuerySchema,
  createSchema: unknown,
  updateSchema: unknown,
) {
  router.get('/', readPerm, validateMiddleware(listSchema, 'query'), controller.list);
  router.post('/', writePerm, validateMiddleware(createSchema as never), controller.create);
  router.get('/:id', readPerm, validateMiddleware(uuidParamSchema, 'params'), controller.getById);
  router.patch(
    '/:id',
    writePerm,
    validateMiddleware(uuidParamSchema, 'params'),
    validateMiddleware(updateSchema as never),
    controller.update,
  );
}

export const productFamilyRoutes = Router();
productFamilyRoutes.use(authenticateWithSessionMiddleware);
crudRoutes(productFamilyRoutes, productsRead, productsConfigure, productFamilyController, listQuerySchema, createProductFamilySchema, updateProductFamilySchema);
productFamilyRoutes.post('/:id/deactivate', productsConfigure, validateMiddleware(uuidParamSchema, 'params'), productFamilyController.deactivate);

export const productRoutes = Router();
productRoutes.use(authenticateWithSessionMiddleware);
productRoutes.post('/recommend', productsRead, validateMiddleware(productRecommendationSchema), productController.recommend);
crudRoutes(productRoutes, productsRead, productsWrite, productController, listProductsQuerySchema, createProductSchema, updateProductSchema);
productRoutes.post('/:id/deactivate', productsWrite, validateMiddleware(uuidParamSchema, 'params'), productController.deactivate);
productRoutes.delete('/:id', productsConfigure, validateMiddleware(uuidParamSchema, 'params'), productController.remove);

export const productVariantRoutes = Router();
productVariantRoutes.use(authenticateWithSessionMiddleware);
crudRoutes(productVariantRoutes, productsRead, productsWrite, productVariantController, listProductVariantsQuerySchema, createProductVariantSchema, updateProductVariantSchema);
productVariantRoutes.post('/:id/activate', productsWrite, validateMiddleware(uuidParamSchema, 'params'), productVariantController.activate);
productVariantRoutes.post('/:id/deactivate', productsWrite, validateMiddleware(uuidParamSchema, 'params'), productVariantController.deactivate);

export const eligibilityRuleRoutes = Router();
eligibilityRuleRoutes.use(authenticateWithSessionMiddleware);
eligibilityRuleRoutes.post('/evaluate', eligibilityRead, validateMiddleware(evaluateEligibilitySchema), eligibilityRuleController.evaluate);
crudRoutes(eligibilityRuleRoutes, eligibilityRead, eligibilityWrite, eligibilityRuleController, listEligibilityRulesQuerySchema, createEligibilityRuleSchema, updateEligibilityRuleSchema);
eligibilityRuleRoutes.delete('/:id', eligibilityWrite, validateMiddleware(uuidParamSchema, 'params'), eligibilityRuleController.remove);

export const documentRuleRoutes = Router();
documentRuleRoutes.use(authenticateWithSessionMiddleware);
documentRuleRoutes.post('/resolve', eligibilityRead, validateMiddleware(resolveDocumentsSchema), documentRuleController.resolve);
crudRoutes(documentRuleRoutes, eligibilityRead, eligibilityWrite, documentRuleController, listDocumentRulesQuerySchema, createDocumentRuleSchema, updateDocumentRuleSchema);
documentRuleRoutes.delete('/:id', eligibilityWrite, validateMiddleware(uuidParamSchema, 'params'), documentRuleController.remove);

export const lenderRoutes = Router();
lenderRoutes.use(authenticateWithSessionMiddleware);
crudRoutes(lenderRoutes, lendersRead, lendersWrite, lenderController, listLendersQuerySchema, createLenderSchema, updateLenderSchema);
lenderRoutes.post('/:id/deactivate', lendersWrite, validateMiddleware(uuidParamSchema, 'params'), lenderController.deactivate);

export const lenderPolicyRoutes = Router();
lenderPolicyRoutes.use(authenticateWithSessionMiddleware);
crudRoutes(lenderPolicyRoutes, lendersRead, lendersWrite, lenderPolicyController, listLenderPoliciesQuerySchema, createLenderPolicySchema, updateLenderPolicySchema);

export const productLenderMappingRoutes = Router();
productLenderMappingRoutes.use(authenticateWithSessionMiddleware);
crudRoutes(productLenderMappingRoutes, productsRead, productsConfigure, productLenderMappingController, listProductLenderMappingsQuerySchema, createProductLenderMappingSchema, updateProductLenderMappingSchema);
productLenderMappingRoutes.delete('/:id', productsConfigure, validateMiddleware(uuidParamSchema, 'params'), productLenderMappingController.remove);
