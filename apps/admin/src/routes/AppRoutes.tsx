import { Navigate, Route, Routes } from 'react-router-dom';

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
import { ApplicationsPage, ApplicationDetailPage } from '@/features/applications';
import { AuditPage } from '@/features/audit';
import { LoginPage } from '@/features/auth';
import { BranchAnalyticsHubPage } from '@/features/branch-analytics';
import { CampaignsPage } from '@/features/campaigns';
import { CommissionsPage } from '@/features/commissions';
import { NotFoundPage } from '@/features/common/pages/NotFoundPage';
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
import { DocumentsPage, DocumentDetailPage } from '@/features/documents';
import { EmailPage } from '@/features/email';
import { ExecutiveAnalyticsHubPage } from '@/features/executive-analytics';
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
import { LeadsPage, LeadDetailPage, LeadAnalyticsPage, LeadScoringAnalyticsPage } from '@/features/leads';
import { NotificationsPage } from '@/features/notifications';
import { PartnersPage } from '@/features/partners';
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
import { CreateTicketPage, SupportHubPage, TicketDetailPage } from '@/features/support';
import { UsersPage } from '@/features/users';
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
          <Route path="leads/scoring-analytics" element={withPermission('leads', <LeadScoringAnalyticsPage />)} />
          <Route path="recommendations/analytics" element={withPermission('recommendations', <RecommendationsAnalyticsPage />)} />
          <Route path="leads/:id" element={withPermission('leads', <LeadDetailPage />)} />

          <Route path="customers" element={withPermission('customers', <CustomersPage />)} />
          <Route path="customers/:id" element={withPermission('customers', <CustomerDetailPage />)} />

          <Route path="applications" element={withPermission('applications', <ApplicationsPage />)} />
          <Route path="applications/:id" element={withPermission('applications', <ApplicationDetailPage />)} />

          <Route path="documents" element={withPermission('documents', <DocumentsPage />)} />
          <Route path="documents/:id" element={withPermission('documents', <DocumentDetailPage />)} />

          <Route path="products" element={withPermission('products', <ProductsPage />)} />
          <Route path="partners" element={withPermission('partners', <PartnersPage />)} />
          <Route path="referrals" element={withPermission('referrals', <ReferralsPage />)} />
          <Route path="commissions" element={withPermission('commissions', <CommissionsPage />)} />
          <Route path="notifications" element={withPermission('notifications', <NotificationsPage />)} />
          <Route path="email" element={withPermission('email', <EmailPage />)} />
          <Route path="sms" element={withPermission('sms', <SmsPage />)} />
          <Route path="push" element={withPermission('push', <PushPage />)} />
          <Route path="campaigns" element={withPermission('campaigns', <CampaignsPage />)} />
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
          <Route path="audit" element={withPermission('audit', <AuditPage />)} />
          <Route path="settings" element={withPermission('settings', <SettingsPage />)} />
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
