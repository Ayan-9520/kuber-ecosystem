import { Router } from 'express';

import { createAiAdvisorModule } from '../modules/ai-advisor/ai-advisor.module.js';
import { createAiCopilotModule } from '../modules/ai-copilot/ai-copilot.module.js';
import { createAnalyticsModule } from '../modules/analytics/analytics.module.js';
import {
  createApplicationsModule,
  createApplicationStatusModule,
  createApplicationTimelineModule,
  createEligibilityResultsModule,
  createBankLoginsModule,
  createCreditReviewsModule,
  createSanctionsModule,
  createDisbursementsModule,
} from '../modules/applications/applications.module.js';
import { createAuditLogsModule } from '../modules/audit/audit.module.js';
import { createAuthModule } from '../modules/auth/auth.module.js';
import { createBranchAnalyticsModule } from '../modules/branch-analytics/branch-analytics.module.js';
import { createBranchesModule } from '../modules/branches/branches.module.js';
import { createCampaignsModule } from '../modules/campaigns/campaigns.module.js';
import {
  createCommissionAdjustmentsModule,
  createCommissionAnalyticsModule,
  createCommissionApprovalsModule,
  createCommissionLedgerModule,
  createCommissionPaymentsModule,
  createCommissionRecoveriesModule,
  createCommissionRulesModule,
} from '../modules/commissions/commissions.module.js';
import { createCustomersModule, createCustomerProfilesModule, createCustomerAddressesModule, createCustomerEmploymentModule, createCustomerIncomeModule, createCustomerPreferencesModule, createCustomerConsentsModule } from '../modules/customers/customers.module.js';
import { createDocumentsModule, createDocumentTypesModule, createDocumentRequestsModule, createDocumentVersionsModule, createOcrResultsModule, createVerificationResultsModule, createDocumentDeficienciesModule } from '../modules/documents/documents.module.js';
import { createEligibilityModule } from '../modules/eligibility/eligibility.module.js';
import { createEmailModule } from '../modules/email/email.module.js';
import { createEmiModule } from '../modules/emi/emi.module.js';
import { createEmployeesModule } from '../modules/employees/employees.module.js';
import { createExecutiveAnalyticsModule } from '../modules/executive-analytics/executive-analytics.module.js';
import {
  createAiFinanceModule,
  createApprovalProbabilityModule,
  createFinanceEngineHistoryModule,
  createLoanComparisonModule,
  createSavingsCalculateModule,
} from '../modules/finance-engine/finance-engine.module.js';
import { createKnowledgeBaseModule } from '../modules/knowledge-base/knowledge-base.module.js';
import { createKycModule } from '../modules/kyc/kyc.module.js';
import { createLeadScoringModule } from '../modules/lead-scoring/lead-scoring.module.js';
import { createLeadsModule, createLeadSourcesModule, createLeadScoresModule, createLeadAssignmentsModule, createLeadActivitiesModule, createLeadNotesModule, createLeadFollowUpsModule, createLeadTimelineModule, createLeadAnalyticsModule } from '../modules/leads/leads.module.js';
import {
  createCommunicationLogsModule,
  createCommunicationProvidersModule,
  createDeadLetterModule,
  createEmailsModule,
  createLegacyPushModule,
  createNotificationPreferencesModule,
  createNotificationQueueModule,
  createNotificationsModule,
  createNotificationTemplatesModule,
  createNotificationWebhooksModule,
  createPushTopicsModule,
  createWhatsAppModule,
} from '../modules/notifications/notifications.module.js';
import { createPartnersModule } from '../modules/partners/partners.module.js';
import { createPermissionsModule } from '../modules/permissions/permissions.module.js';
import {
  createDocumentRulesModule,
  createEligibilityRulesModule,
  createLenderPoliciesModule,
  createLendersModule,
  createProductFamiliesModule,
  createProductLenderMappingsModule,
  createProductVariantsModule,
  createProductsModule,
} from '../modules/product/product.module.js';
import { createEnterprisePushModule } from '../modules/push/push.module.js';
import { createRagModule } from '../modules/rag/rag.module.js';
import { createRecommendationsModule } from '../modules/recommendations/recommendations.module.js';
import { createReferralsModule, createReferralTypesModule } from '../modules/referrals/referrals.module.js';
import { createRegionalAnalyticsModule } from '../modules/regional-analytics/regional-analytics.module.js';
import { createRolePermissionsModule, createRolesModule } from '../modules/roles/roles.module.js';
import { createSettingsModule } from '../modules/settings/settings.module.js';
import { createSmsModule } from '../modules/sms/sms.module.js';
import {
  createTicketAnalyticsModule,
  createTicketAssignmentsModule,
  createTicketCategoriesModule,
  createTicketEscalationsModule,
  createTicketMessagesModule,
  createTicketResolutionsModule,
  createTicketsModule,
} from '../modules/support/support.module.js';
import { createUserRolesModule, createUsersModule } from '../modules/users/users.module.js';

export const apiRouter: Router = Router();

apiRouter.use('/auth', createAuthModule());
apiRouter.use('/users', createUsersModule());
apiRouter.use('/roles', createRolesModule());
apiRouter.use('/permissions', createPermissionsModule());
apiRouter.use('/user-roles', createUserRolesModule());
apiRouter.use('/role-permissions', createRolePermissionsModule());
apiRouter.use('/customers', createCustomersModule());
apiRouter.use('/customer-profiles', createCustomerProfilesModule());
apiRouter.use('/customer-addresses', createCustomerAddressesModule());
apiRouter.use('/customer-employment', createCustomerEmploymentModule());
apiRouter.use('/customer-income', createCustomerIncomeModule());
apiRouter.use('/customer-preferences', createCustomerPreferencesModule());
apiRouter.use('/customer-consents', createCustomerConsentsModule());
apiRouter.use('/partners', createPartnersModule());
apiRouter.use('/employees', createEmployeesModule());
apiRouter.use('/branches', createBranchesModule());
apiRouter.use('/product-families', createProductFamiliesModule());
apiRouter.use('/products', createProductsModule());
apiRouter.use('/product-variants', createProductVariantsModule());
apiRouter.use('/eligibility-rules', createEligibilityRulesModule());
apiRouter.use('/document-rules', createDocumentRulesModule());
apiRouter.use('/lenders', createLendersModule());
apiRouter.use('/lender-policies', createLenderPoliciesModule());
apiRouter.use('/product-lender-mappings', createProductLenderMappingsModule());
apiRouter.use('/leads', createLeadsModule());
apiRouter.use('/lead-sources', createLeadSourcesModule());
apiRouter.use('/lead-scores', createLeadScoresModule());
apiRouter.use('/lead-assignments', createLeadAssignmentsModule());
apiRouter.use('/lead-activities', createLeadActivitiesModule());
apiRouter.use('/lead-notes', createLeadNotesModule());
apiRouter.use('/lead-followups', createLeadFollowUpsModule());
apiRouter.use('/lead-timeline', createLeadTimelineModule());
apiRouter.use('/lead-analytics', createLeadAnalyticsModule());
apiRouter.use('/lead-scoring', createLeadScoringModule());
apiRouter.use('/recommendations', createRecommendationsModule());
apiRouter.use('/applications', createApplicationsModule());
apiRouter.use('/application-status', createApplicationStatusModule());
apiRouter.use('/application-timeline', createApplicationTimelineModule());
apiRouter.use('/eligibility-results', createEligibilityResultsModule());
apiRouter.use('/bank-logins', createBankLoginsModule());
apiRouter.use('/credit-reviews', createCreditReviewsModule());
apiRouter.use('/sanctions', createSanctionsModule());
apiRouter.use('/disbursements', createDisbursementsModule());
apiRouter.use('/eligibility', createEligibilityModule());
apiRouter.use('/emi', createEmiModule());
apiRouter.use('/savings', createSavingsCalculateModule());
apiRouter.use('/loan-comparison', createLoanComparisonModule());
apiRouter.use('/approval-probability', createApprovalProbabilityModule());
apiRouter.use('/finance-calculations', createFinanceEngineHistoryModule());
apiRouter.use('/finance-ai', createAiFinanceModule());
apiRouter.use('/documents', createDocumentsModule());
apiRouter.use('/document-types', createDocumentTypesModule());
apiRouter.use('/document-requests', createDocumentRequestsModule());
apiRouter.use('/document-versions', createDocumentVersionsModule());
apiRouter.use('/ocr-results', createOcrResultsModule());
apiRouter.use('/verification-results', createVerificationResultsModule());
apiRouter.use('/document-deficiencies', createDocumentDeficienciesModule());
apiRouter.use('/kyc', createKycModule());
apiRouter.use('/referrals', createReferralsModule());
apiRouter.use('/referral-types', createReferralTypesModule());
apiRouter.use('/commission-rules', createCommissionRulesModule());
apiRouter.use('/commission-ledger', createCommissionLedgerModule());
apiRouter.use('/commission-approvals', createCommissionApprovalsModule());
apiRouter.use('/commission-payments', createCommissionPaymentsModule());
apiRouter.use('/commission-adjustments', createCommissionAdjustmentsModule());
apiRouter.use('/commission-recoveries', createCommissionRecoveriesModule());
apiRouter.use('/commission-analytics', createCommissionAnalyticsModule());
apiRouter.use('/campaigns', createCampaignsModule());
apiRouter.use('/notifications', createNotificationsModule());
apiRouter.use('/notification-templates', createNotificationTemplatesModule());
apiRouter.use('/notification-preferences', createNotificationPreferencesModule());
apiRouter.use('/email', createEmailModule());
apiRouter.use('/emails', createEmailsModule());
apiRouter.use('/sms', createSmsModule());
apiRouter.use('/whatsapp', createWhatsAppModule());
apiRouter.use('/push', createEnterprisePushModule());
apiRouter.use('/pushes', createLegacyPushModule());
apiRouter.use('/communication-logs', createCommunicationLogsModule());
apiRouter.use('/communication-providers', createCommunicationProvidersModule());
apiRouter.use('/notification-dead-letters', createDeadLetterModule());
apiRouter.use('/notification-queue', createNotificationQueueModule());
apiRouter.use('/push-topics', createPushTopicsModule());
apiRouter.use('/webhooks/notifications', createNotificationWebhooksModule());
apiRouter.use('/tickets', createTicketsModule());
apiRouter.use('/ticket-messages', createTicketMessagesModule());
apiRouter.use('/ticket-assignments', createTicketAssignmentsModule());
apiRouter.use('/ticket-escalations', createTicketEscalationsModule());
apiRouter.use('/ticket-resolutions', createTicketResolutionsModule());
apiRouter.use('/ticket-categories', createTicketCategoriesModule());
apiRouter.use('/ticket-analytics', createTicketAnalyticsModule());
apiRouter.use('/analytics', createAnalyticsModule());
apiRouter.use('/executive-analytics', createExecutiveAnalyticsModule());
apiRouter.use('/branch-analytics', createBranchAnalyticsModule());
apiRouter.use('/regional-analytics', createRegionalAnalyticsModule());
apiRouter.use('/ai', createAiAdvisorModule());
apiRouter.use('/ai-copilot', createAiCopilotModule());
apiRouter.use('/knowledge', createKnowledgeBaseModule());
apiRouter.use('/rag', createRagModule());
apiRouter.use('/settings', createSettingsModule());
apiRouter.use('/audit-logs', createAuditLogsModule());
