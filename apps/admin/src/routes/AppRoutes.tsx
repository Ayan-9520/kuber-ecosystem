import { Navigate, Route, Routes } from 'react-router-dom';

import { ApiDocsShell } from '@/components/api-docs';
import { ProtectedRoute } from '@/components/guards/ProtectedRoute';
import { AppShell } from '@/components/layout/AppShell';
import {
  AiPlatformDashboardPage,
  AiModelsPage,
  AiPromptsPage,
  AiUsageAnalyticsPage,
  AiCostAnalyticsPage,
  AiErrorsPage,
} from '@/features/ai-platform';
import { AnalyticsHubPage } from '@/features/analytics';
import { AppStoreHubPage } from '@/features/app-store';
import { ApplicationsPage, ApplicationDetailPage } from '@/features/applications';
import { AuditPage } from '@/features/audit';
import { LoginPage } from '@/features/auth';
import { AutomationHubPage, JourneyBuilderPage } from '@/features/automation';
import { BackendDeploymentHubPage } from '@/features/backend-deployment';
import { BackupHubPage } from '@/features/backup';
import { BranchAnalyticsHubPage } from '@/features/branch-analytics';
import { BranchesPage } from '@/features/branches';
import { CampaignsPage, CampaignDetailPage } from '@/features/campaigns';
import { CommissionsPage } from '@/features/commissions';
import { NotFoundPage } from '@/features/common/pages/NotFoundPage';
import { ContentHubPage, ContentStudioPage } from '@/features/content';
import {
  ApplicationCopilotPage,
  BranchInsightsPage,
  CopilotDashboardPage,
  ExecutiveInsightsPage,
  LeadCopilotPage,
  ManagementInsightsPage,
} from '@/features/copilot';
import { CustomersPage, CustomerDetailPage } from '@/features/customers';
import { DashboardPage } from '@/features/dashboard';
import { DevOpsHubPage } from '@/features/devops';
import { DocumentsPage, DocumentDetailPage } from '@/features/documents';
import { DrHubPage } from '@/features/dr';
import { EligibilityCenterPage } from '@/features/eligibility';
import { EmailPage } from '@/features/email';
import { EmiCalculatorPage } from '@/features/emi';
import { EmployeesPage } from '@/features/employees';
import { ErrorDetailPage, ErrorTrackingHubPage } from '@/features/error-tracking';
import { ExecutiveAnalyticsHubPage } from '@/features/executive-analytics';
import { GoLiveHubPage } from '@/features/go-live';
import { GovernanceHubPage } from '@/features/governance';
import { HypercareHubPage } from '@/features/hypercare';
import { InfrastructureHubPage } from '@/features/infrastructure';
import {
  KnowledgeDashboardPage,
  KnowledgeArticlesPage,
  KnowledgeArticleDetailPage,
  KnowledgeCategoriesPage,
  KnowledgeTagsPage,
  KnowledgeSearchPage,
  KnowledgeApprovalQueuePage,
  KnowledgeReviewQueuePage,
  KnowledgeAnalyticsPage,
} from '@/features/knowledge';
import { KycHubPage } from '@/features/kyc';
import { LeadsPage, LeadDetailPage, LeadAnalyticsPage, LeadScoringAnalyticsPage } from '@/features/leads';
import { ManagementHubPage } from '@/features/management';
import { MobileReleaseHubPage } from '@/features/mobile-release';
import { MonitoringHubPage } from '@/features/monitoring';
import { NotificationsPage } from '@/features/notifications';
import { ObservabilityHubPage } from '@/features/observability';
import { PartnersPage } from '@/features/partners';
import { PlayStoreHubPage } from '@/features/play-store';
import { ProductionHubPage } from '@/features/production';
import { ProductsPage } from '@/features/products';
import { PushPage } from '@/features/push';
import {
  RagDashboardPage,
  RagIngestionPage,
  RagDocumentDetailPage,
  RagSearchPage,
  RagAnalyticsPage,
} from '@/features/rag';
import { RecommendationsAnalyticsPage } from '@/features/recommendations';
import { ReferralsPage } from '@/features/referrals';
import { RegionalAnalyticsHubPage } from '@/features/regional-analytics';
import { SettingsPage } from '@/features/settings';
import { SmsPage } from '@/features/sms';
import { StagingHubPage } from '@/features/staging';
import { CreateTicketPage, SupportHubPage, TicketDetailPage } from '@/features/support';
import { UatHubPage } from '@/features/uat';
import { UsersPage } from '@/features/users';
import { VoiceAiConsolePage } from '@/features/voice-ai';
import { WhatsAppPage } from '@/features/whatsapp';
import {
  AiPlatformGuidePage,
  ApiDocsHomePage,
  ApiReferencePage,
  AuthenticationGuidePage,
  DocsAnalyticsPage,
  EndpointPage,
  ErrorCatalogPage,
  ModuleEndpointsPage,
  OpenApiViewerPage,
  PaginationGuidePage,
  PostmanGuidePage,
  RateLimitGuidePage,
  RbacGuidePage,
  RedocPage,
  SdkGuidePage,
  SwaggerPage,
  TestingGuidePage,
  WebhookGuidePage,
  WorkflowsGuidePage,
} from '@/pages/api-docs';
import { DeveloperPortalHomePage } from '@/pages/developer-portal';
import { withPermission } from '@/routes/routePermissions';

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppShell />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={withPermission('dashboard', <DashboardPage />)} />

          <Route path="leads" element={withPermission('leads', <LeadsPage />)} />
          <Route path="leads/analytics" element={withPermission('leads', <LeadAnalyticsPage />)} />
          <Route path="leads/scoring-analytics" element={withPermission('lead-scoring', <LeadScoringAnalyticsPage />)} />
          <Route path="recommendations/analytics" element={withPermission('recommendations', <RecommendationsAnalyticsPage />)} />
          <Route path="leads/:id" element={withPermission('leads', <LeadDetailPage />)} />

          <Route path="customers" element={withPermission('customers', <CustomersPage />)} />
          <Route path="customers/:id" element={withPermission('customers', <CustomerDetailPage />)} />
          <Route path="kyc" element={withPermission('kyc', <KycHubPage />)} />

          <Route path="applications" element={withPermission('applications', <ApplicationsPage />)} />
          <Route path="applications/:id" element={withPermission('applications', <ApplicationDetailPage />)} />

          <Route path="documents" element={withPermission('documents', <DocumentsPage />)} />
          <Route path="documents/:id" element={withPermission('documents', <DocumentDetailPage />)} />

          <Route path="eligibility" element={withPermission('eligibility', <EligibilityCenterPage />)} />
          <Route path="emi" element={withPermission('emi', <EmiCalculatorPage />)} />
          <Route path="voice-ai" element={withPermission('voice-ai', <VoiceAiConsolePage />)} />

          <Route path="products" element={withPermission('products', <ProductsPage />)} />
          <Route path="partners" element={withPermission('partners', <PartnersPage />)} />
          <Route path="referrals" element={withPermission('referrals', <ReferralsPage />)} />
          <Route path="commissions" element={withPermission('commissions', <CommissionsPage />)} />
          <Route path="notifications" element={withPermission('notifications', <NotificationsPage />)} />
          <Route path="email" element={withPermission('email', <EmailPage />)} />
          <Route path="sms" element={withPermission('sms', <SmsPage />)} />
          <Route path="whatsapp" element={withPermission('whatsapp', <WhatsAppPage />)} />
          <Route path="push" element={withPermission('push', <PushPage />)} />
          <Route path="campaigns" element={withPermission('campaigns', <CampaignsPage />)} />
          <Route path="campaigns/:id" element={withPermission('campaigns', <CampaignDetailPage />)} />
          <Route path="automation" element={withPermission('automation', <AutomationHubPage />)} />
          <Route path="automation/journeys/:id" element={withPermission('automation', <JourneyBuilderPage />)} />
          <Route path="content" element={withPermission('content', <ContentHubPage />)} />
          <Route path="content/studio" element={withPermission('content', <ContentStudioPage />)} />
          <Route path="support" element={withPermission('support', <SupportHubPage />)} />
          <Route path="support/tickets/new" element={withPermission('support', <CreateTicketPage />)} />
          <Route path="support/tickets/:id" element={withPermission('support', <TicketDetailPage />)} />
          <Route path="copilot" element={withPermission('copilot', <CopilotDashboardPage />)} />
          <Route path="copilot/leads/:id" element={withPermission('copilot', <LeadCopilotPage />)} />
          <Route path="copilot/applications/:id" element={withPermission('copilot', <ApplicationCopilotPage />)} />
          <Route path="copilot/executive" element={withPermission('copilot', <ExecutiveInsightsPage />)} />
          <Route path="copilot/branch" element={withPermission('copilot', <BranchInsightsPage />)} />
          <Route path="copilot/management" element={withPermission('copilot', <ManagementInsightsPage />)} />

          <Route path="analytics" element={withPermission('analytics', <AnalyticsHubPage />)} />
          <Route path="management" element={withPermission('management', <ManagementHubPage />)} />
          <Route path="executive-analytics" element={withPermission('executive-analytics', <ExecutiveAnalyticsHubPage />)} />
          <Route path="branch-analytics" element={withPermission('branch-analytics', <BranchAnalyticsHubPage />)} />
          <Route path="regional-analytics" element={withPermission('regional-analytics', <RegionalAnalyticsHubPage />)} />

          <Route path="knowledge" element={withPermission('knowledge', <KnowledgeDashboardPage />)} />
          <Route path="knowledge/articles" element={withPermission('knowledge', <KnowledgeArticlesPage />)} />
          <Route path="knowledge/articles/:id" element={withPermission('knowledge', <KnowledgeArticleDetailPage />)} />
          <Route path="knowledge/categories" element={withPermission('knowledge', <KnowledgeCategoriesPage />)} />
          <Route path="knowledge/tags" element={withPermission('knowledge', <KnowledgeTagsPage />)} />
          <Route path="knowledge/search" element={withPermission('knowledge', <KnowledgeSearchPage />)} />
          <Route path="knowledge/approvals" element={withPermission('knowledge', <KnowledgeApprovalQueuePage />)} />
          <Route path="knowledge/reviews" element={withPermission('knowledge', <KnowledgeReviewQueuePage />)} />
          <Route path="knowledge/analytics" element={withPermission('knowledge', <KnowledgeAnalyticsPage />)} />

          <Route path="rag" element={withPermission('rag', <RagDashboardPage />)} />
          <Route path="rag/ingestion" element={withPermission('rag', <RagIngestionPage />)} />
          <Route path="rag/documents/:id" element={withPermission('rag', <RagDocumentDetailPage />)} />
          <Route path="rag/search" element={withPermission('rag', <RagSearchPage />)} />
          <Route path="rag/analytics" element={withPermission('rag', <RagAnalyticsPage />)} />

          <Route path="ai-platform" element={withPermission('ai-platform', <AiPlatformDashboardPage />)} />
          <Route path="ai-platform/models" element={withPermission('ai-platform', <AiModelsPage />)} />
          <Route path="ai-platform/prompts" element={withPermission('ai-platform', <AiPromptsPage />)} />
          <Route path="ai-platform/usage" element={withPermission('ai-platform', <AiUsageAnalyticsPage />)} />
          <Route path="ai-platform/costs" element={withPermission('ai-platform', <AiCostAnalyticsPage />)} />
          <Route path="ai-platform/errors" element={withPermission('ai-platform', <AiErrorsPage />)} />

          <Route path="users" element={withPermission('users', <UsersPage />)} />
          <Route path="employees" element={withPermission('employees', <EmployeesPage />)} />
          <Route path="branches" element={withPermission('branches', <BranchesPage />)} />
          <Route path="governance" element={withPermission('governance', <GovernanceHubPage />)} />
          <Route path="uat" element={withPermission('uat', <UatHubPage />)} />
          <Route path="monitoring" element={withPermission('monitoring', <MonitoringHubPage />)} />
          <Route path="observability" element={withPermission('observability', <ObservabilityHubPage />)} />
          <Route path="errors" element={withPermission('errors', <ErrorTrackingHubPage />)} />
          <Route path="errors/:id" element={withPermission('errors', <ErrorDetailPage />)} />
          <Route path="backup" element={withPermission('backup', <BackupHubPage />)} />
          <Route path="devops" element={withPermission('devops', <DevOpsHubPage />)} />
          <Route path="infrastructure" element={withPermission('infrastructure', <InfrastructureHubPage />)} />
          <Route path="staging" element={withPermission('staging', <StagingHubPage />)} />
          <Route path="production" element={withPermission('production', <ProductionHubPage />)} />
          <Route path="go-live" element={withPermission('go-live', <GoLiveHubPage />)} />
          <Route path="hypercare" element={withPermission('hypercare', <HypercareHubPage />)} />
          <Route path="mobile-releases" element={withPermission('mobile-releases', <MobileReleaseHubPage />)} />
          <Route path="play-store" element={withPermission('play-store', <PlayStoreHubPage />)} />
          <Route path="app-store" element={withPermission('app-store', <AppStoreHubPage />)} />
          <Route path="backend-deployment" element={withPermission('backend-deployment', <BackendDeploymentHubPage />)} />
          <Route path="dr" element={withPermission('dr', <DrHubPage />)} />
          <Route path="audit" element={withPermission('audit', <AuditPage />)} />
          <Route path="settings" element={withPermission('settings', <SettingsPage />)} />

          <Route path="developer-portal" element={withPermission('developer-portal', <ApiDocsShell />)}>
            <Route index element={<DeveloperPortalHomePage />} />
            <Route path="api" element={<ApiDocsHomePage />} />
            <Route path="api/reference" element={<ApiReferencePage />} />
            <Route path="api/reference/:moduleId" element={<ModuleEndpointsPage />} />
            <Route path="api/reference/:moduleId/endpoint/:endpointId" element={<EndpointPage />} />
            <Route path="api/guides/authentication" element={<AuthenticationGuidePage />} />
            <Route path="api/guides/errors" element={<ErrorCatalogPage />} />
            <Route path="api/guides/rbac" element={<RbacGuidePage />} />
            <Route path="api/guides/pagination" element={<PaginationGuidePage />} />
            <Route path="api/guides/rate-limits" element={<RateLimitGuidePage />} />
            <Route path="api/guides/webhooks" element={<WebhookGuidePage />} />
            <Route path="api/guides/workflows" element={<WorkflowsGuidePage />} />
            <Route path="api/guides/ai-platform" element={<AiPlatformGuidePage />} />
            <Route path="api/guides/sdk" element={<SdkGuidePage />} />
            <Route path="api/guides/postman" element={<PostmanGuidePage />} />
            <Route path="api/guides/testing" element={<TestingGuidePage />} />
            <Route path="api/swagger" element={<SwaggerPage />} />
            <Route path="api/redoc" element={<RedocPage />} />
            <Route path="api/openapi" element={<OpenApiViewerPage />} />
            <Route path="api/analytics" element={<DocsAnalyticsPage />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
