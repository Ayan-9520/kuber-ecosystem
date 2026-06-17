# KuberOne Traceability Matrix

**Generated:** 2026-06-13  
**Source:** Live code audit (not documentation)

---

## Core Domain Traceability

| Requirement | DB Model | Schema File | API Prefix | Validator | Service | RBAC | CRM Screen | Customer Screen | DSA Screen |
|-------------|----------|-------------|------------|-----------|---------|------|------------|-----------------|------------|
| Customer onboarding | Customer, CustomerProfile | customer.prisma | `/customers`, `/customer-profiles` | customer.validator | customer.service | customers.* | CustomersPage, CustomerDetailPage | ProfileScreen, RegisterScreen | CustomersListScreen |
| KYC verification | KycProfile, PanVerification, AadhaarVerification | kyc.prisma | `/kyc` | kyc.validator | kyc.service | kyc.* | **MISSING** (detail tab only) | KycScreen | PartnerKycScreen |
| Lead management | Lead, LeadSource, LeadActivity | lead.prisma | `/leads`, `/lead-*` | lead.validator | lead.service | leads.* | LeadsPage, LeadDetailPage | — | LeadsListScreen, LeadDetailScreen |
| Lead scoring | LeadScore, LeadScoringRule | lead-scoring.prisma | `/lead-scoring`, `/lead-scores` | lead-scoring.validator | lead-scoring.service | lead_scoring.* | LeadScoringAnalyticsPage | — | LeadDetailScreen (scores) |
| Loan application | Application, ApplicationTimeline | application.prisma | `/applications`, `/application-*` | application.validator | application.service | applications.* | ApplicationsPage, ApplicationDetailPage | ApplicationsScreen, ApplicationWizardScreen | ApplicationsListScreen |
| Eligibility check | EligibilityResult, EligibilityRule | application.prisma, product.prisma | `/eligibility`, `/eligibility-results`, `/eligibility-rules` | finance-engine.validator | finance-engine | eligibility.read | **MISSING** | EligibilityScreen | — |
| EMI calculation | FinanceCalculation | finance.prisma | `/emi`, `/savings` | finance-engine.validator | finance-engine | emi.read | **MISSING** | EmiScreen | — |
| Document management | Document, OcrResult, VerificationResult | document.prisma | `/documents`, `/ocr-results` | document.validator | document.service | documents.* | DocumentsPage, DocumentDetailPage | DocumentsScreen | DocumentsScreen, UploadDocumentScreen |
| Product catalog | Product, ProductVariant, Lender | product.prisma | `/products`, `/product-*`, `/lenders` | product.validator | product.service | products.* | ProductsPage | LoanProductsScreen | CreateLeadScreen (products) |
| Referrals | Referral, ReferralType | referral.prisma | `/referrals`, `/referral-types` | referral.validator | referral.service | referrals.* | ReferralsPage | ReferralsScreen | ReferralsScreen, CreateReferralScreen |
| Commissions | CommissionLedger, CommissionPayment | commission.prisma | `/commission-*` | commission.validator | commission.service | commissions.* | CommissionsPage | — | CommissionsHomeScreen + 5 sub-screens |
| Support tickets | Ticket, TicketMessage | support.prisma | `/tickets`, `/ticket-*` | support.validator | ticket.service | tickets.* | SupportHubPage, TicketDetailPage | SupportScreen, CreateTicketScreen | SupportScreen, CreateTicketScreen |
| Notifications | Notification, NotificationQueue | notification.prisma | `/notifications`, `/notification-*` | notification.validator | notification.service | notifications.* | NotificationsPage | NotificationsScreen | NotificationsScreen |
| Email / SMS / WhatsApp / Push | EmailQueue, SmsQueue, PushQueue | email.prisma, sms.prisma, push.prisma | `/email`, `/sms`, `/whatsapp`, `/push` | email/sms/push validators | channel services | channel permissions | EmailPage, SmsPage, WhatsAppPage, PushPage | Settings (prefs) | CommunicationHistoryScreen |
| Campaigns | *(no model)* | — | `/campaigns` | **none** | campaign.service (empty list) | notifications.read | CampaignsPage | — | — |
| Knowledge base | KnowledgeArticle, KnowledgeCategory | knowledge.prisma | `/knowledge` | knowledge.validator | knowledge-*.service | knowledge.* | KnowledgeDashboardPage + 8 sub | — | — |
| RAG pipeline | KnowledgeDocument, EmbeddingRecord | rag.prisma | `/rag` | rag.validator | rag.service | rag.* | RagDashboardPage + 4 sub | — | — |
| AI Advisor | AiRequest, AiResponse | ai-platform.prisma | `/ai` | ai-advisor.validator | ai-advisor.service | ai.read | CopilotDashboardPage | AiAdvisorScreen | AiAdvisorScreen |
| Voice AI | AiCopilotSession | copilot.prisma | `/ai/voice` | voice-ai.validator | voice-ai.service | ai.read | — | VoiceAiScreen | VoiceAiScreen |
| AI Copilot (CRM) | AiInsight, AiRecommendation | copilot.prisma | `/ai-copilot` | ai-copilot.validator | ai-copilot.service | copilot.read | Copilot pages (5) | — | — |
| Recommendations | Recommendation, ProductMatch | recommendations.prisma | `/recommendations` | recommendations.validator | recommendation-orchestrator | recommendations.* | RecommendationsAnalyticsPage | RecommendationsScreen | ApplicationDetailScreen |
| Analytics | Dashboard, MetricDefinition | analytics.prisma | `/analytics`, `/executive-analytics`, etc. | analytics.validator | analytics.service | analytics.* | AnalyticsHubPage + 3 hubs | — | LeadAnalyticsScreen, ReferralAnalyticsScreen |
| Audit logs | AuditLog, AuditEvent | audit.prisma, governance.prisma | `/audit-logs`, `/audit` | audit.validator | audit-event.service | audit.read | AuditPage, GovernanceHubPage | — | — |
| RBAC | User, Role, Permission | identity.prisma | `/users`, `/roles`, `/permissions` | user/role validators | user.service | rbac.* | UsersPage | — | — |
| UAT signoff | UatPlan, UatSignoff, UatApproval | uat.prisma, uat-final-signoff.prisma | `/uat` | uat.validator | uat-final-signoff.service | uat.* | UatHubPage | — | — |
| Go-live | GoLiveChecklist, LaunchEvent | go-live.prisma, go-live-execution.prisma | `/go-live` | go-live.validator | go-live-execution.service | golive.*, launch.* | GoLiveHubPage | — | — |
| Hypercare | HypercareSession, HypercareIssue | hypercare.prisma | `/hypercare` | hypercare.validator | hypercare.service | hypercare.* | HypercareHubPage | — | — |
| Monitoring | MonitoringAlert, MonitoringMetricSnapshot | monitoring.prisma | `/monitoring` | monitoring.validator | monitoring.service | monitoring.* | MonitoringHubPage | — | — |
| Error tracking | ErrorGroup, ErrorEvent | error-tracking.prisma | `/errors` | error-tracking.validator | error-tracking.service | errors.* | ErrorTrackingHubPage | — | — |
| Observability | ObservabilityLog, ObservabilityTrace | observability.prisma | `/observability` | observability.validator | observability.service | observability.* | ObservabilityHubPage | — | — |

---

## Entity → Tables → APIs → UI → Permissions

| Entity | Tables | Primary APIs | CRM | Customer | DSA | Permission |
|--------|--------|--------------|-----|----------|-----|------------|
| Customer | Customer, CustomerProfile, CustomerAddress | GET/POST/PATCH `/customers` | ✓ | ✓ | ✓ | customers.read/write |
| KYC | KycProfile, PanVerification, AadhaarVerification | GET/POST `/kyc/*` | ✗ page | ✓ | ✓ | kyc.read/write |
| Lead | Lead, LeadScore, LeadActivity | GET/POST/PATCH `/leads` | ✓ | — | ✓ | leads.read/write |
| Application | Application, Sanction, Disbursement | GET/POST `/applications` | ✓ | ✓ | ✓ | applications.read/write |
| Document | Document, OcrResult | GET/POST `/documents` | ✓ | ✓ | ✓ | documents.read/write |
| Product | Product, ProductVariant | GET `/products` | ✓ | ✓ | ✓ (list) | products.read |
| Referral | Referral | GET/POST `/referrals` | ✓ | ✓ | ✓ | referrals.read/write |
| Commission | CommissionLedger, CommissionPayment | GET `/commission-*` | ✓ | — | ✓ | commissions.read |
| Ticket | Ticket, TicketMessage | GET/POST `/tickets` | ✓ | ✓ | ✓ | tickets.read/write |
| Partner | Partner | GET `/partners` | ✓ | — | ✓ | partners.read |
| Campaign | *(none)* | GET `/campaigns` (empty) | ✓ UI only | — | — | notifications.read |
| Employee | Employee | GET `/employees/health` | — | — | — | — |
| Branch | Branch | GET `/branches/health` | — | — | — | — |

---

## API → Controller → Service → Permission → UI Consumer

| API Route | Controller Module | Service | Permission | UI Consumers |
|-----------|-------------------|---------|------------|--------------|
| GET `/leads` | lead.controller | lead.service | leads.read | LeadsPage, LeadsListScreen |
| POST `/leads` | lead.controller | lead.service | leads.write | CreateLeadScreen |
| GET `/customers` | customer.controller | customer.service | customers.read | CustomersPage, CustomersListScreen |
| GET `/applications` | application.controller | application.service | applications.read | ApplicationsPage, ApplicationsScreen |
| POST `/applications` | application.controller | application.service | applications.write | ApplicationWizardScreen |
| GET `/documents` | document.controller | document.service | documents.read | DocumentsPage, DocumentsScreen |
| POST `/documents/upload` | document.controller | s3-storage.service | documents.write | DocumentsScreen, UploadDocumentScreen |
| GET `/kyc/profile` | kyc.controller | kyc.service | kyc.read | KycScreen, ProfileScreen |
| POST `/emi/calculate` | finance-engine.controller | emi-calculator.service | emi.read | EmiScreen |
| POST `/eligibility/calculate` | finance-engine.controller | eligibility.service | eligibility.read | EligibilityScreen |
| GET `/commission-ledger` | commission.controller | commission-ledger.service | commissions.read | CommissionLedgerScreen |
| GET `/tickets` | ticket.controller | ticket.service | tickets.read | SupportHubPage, SupportScreen |
| POST `/ai/chat` | ai-advisor.controller | completion.service | ai.read | AiAdvisorScreen |
| POST `/ai/voice/sessions` | voice-ai.controller | voice-ai.service | ai.read | VoiceAiScreen |
| GET `/audit-logs` | audit-log.controller | audit.service | audit.read | AuditPage |
| GET `/monitoring/status` | monitoring.controller | monitoring-health.service | monitoring.read | MonitoringHubPage |

---

## Role → Permissions → Screens (sample)

| Role | Key Permissions | CRM Screens Accessible |
|------|-----------------|--------------------------|
| SUPER_ADMIN | `*` | All |
| ADMIN | `*` | All |
| MANAGEMENT | analytics.*, uat.*, golive.*, hypercare.*, leads.read | Dashboard, leads, analytics, UAT, go-live, hypercare |
| REGIONAL_MANAGER | leads.*, applications.*, customers.* | CRM core + branch analytics |
| BRANCH_MANAGER | leads.*, applications.* | CRM core |
| RELATIONSHIP_MANAGER | customers.*, kyc.*, emi.*, eligibility.* | CRM core (no admin-only ops) |
| SALES_EXECUTIVE | leads.*, applications.* | CRM core |
| CREDIT_EXECUTIVE | applications.approve, documents.verify | Applications, documents |
| SUPPORT | tickets.*, customers.read | Support, customers (read) |
| DSA_PARTNER | leads.*, applications.*, commissions.read | Mobile DSA app only |
| CUSTOMER | customers.*, applications.*, kyc.* | Mobile customer app only |

---

## AI Feature Traceability

| AI Feature | Prompt Template | Service | API | CRM UI | Mobile UI | Monitoring |
|------------|-----------------|---------|-----|--------|-----------|------------|
| AI Advisor | ai-platform prompts | completion.service | POST `/ai/chat` | CopilotDashboardPage | AiAdvisorScreen | AiUsageAnalyticsPage |
| Voice AI | voice session prompts | voice-ai.service | POST `/ai/voice/sessions` | — | VoiceAiScreen | AiErrorsPage |
| Lead Scoring | scoring rules config | lead-scoring.service | GET `/lead-scoring` | LeadScoringAnalyticsPage | LeadDetailScreen | lead-scoring audit |
| Recommendations | recommendation rules | recommendation-orchestrator | GET `/recommendations/*` | RecommendationsAnalyticsPage | RecommendationsScreen | recommendations audit |
| Knowledge Base | article content | knowledge-article.service | GET `/knowledge/*` | Knowledge pages | — | KnowledgeAnalyticsPage |
| RAG | ingestion pipeline | rag.service | POST `/rag/search` | RagSearchPage | — | RagAnalyticsPage |
| AI Platform | AiPromptTemplate model | ai-platform services | GET `/ai-platform/*` | AiPlatformDashboardPage | — | AiCostsPage, AiErrorsPage |
| AI Copilot | copilot prompts | ai-copilot.service | POST `/ai-copilot/*` | 5 copilot pages | — | AiUsageAnalyticsPage |

---

## Audit Log Traceability

| Action | Audit Mechanism | Entity | Logged In |
|--------|-----------------|--------|-----------|
| User login/logout | authAuditRepository → centralAuditService | User | AuditLog + LoginHistory |
| OTP send/verify | authAuditRepository | OtpVerification | AuditLog |
| Session revoke | centralAuditService | Session | AuditLog |
| Lead score update | leadScoringRepository.createAudit | LeadScore | LeadScoringAudit |
| Knowledge publish | knowledgeRepository.createAudit | KnowledgeArticle | KnowledgeAudit |
| Go-live step | goLiveRepository.createAudit | LaunchEvent | LaunchAudit |
| UAT signoff | uat service audit hooks | UatSignoff | Uat tables |
| Document verify | document service | Document | AuditLog (partial) |
| Commission approve | commission service | CommissionLedger | AuditLog (partial) |

**Gap:** Not all CRUD operations on core entities (customers, applications) emit domain-specific audit records — rely on central audit middleware where applied.

---

## Data Flow Lifecycles

### Lead Lifecycle
```
LeadSource → POST /leads → Lead (DB) → LeadAssignment → LeadScore → LeadActivity
  → CRM: LeadsPage / DSA: LeadsListScreen
  → POST /applications (convert) → Application
```

### Application Lifecycle
```
POST /applications → Application → ApplicationStatusHistory → ApplicationTimeline
  → EligibilityResult → CreditReview → Sanction → Disbursement → Closure
  → CRM: ApplicationsPage / Customer: ApplicationWizardScreen / DSA: ApplicationsListScreen
```

### Document Lifecycle
```
DocumentRequest → POST /documents/upload → Document → OcrResult → VerificationResult
  → DocumentDeficiency (if failed) → CRM + Mobile DocumentsScreen
```

### Commission Lifecycle
```
CommissionRule → CommissionLedger → CommissionApproval → CommissionPayment
  → CRM: CommissionsPage / DSA: CommissionLedgerScreen, CommissionPaymentsScreen
```

### Support Lifecycle
```
POST /tickets → Ticket → TicketAssignment → TicketMessage → TicketEscalation → TicketResolution
  → CRM: SupportHubPage / Mobile: SupportScreen → TicketDetailScreen
```
