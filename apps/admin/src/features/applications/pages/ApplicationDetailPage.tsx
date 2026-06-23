import { useQuery } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import {
  Button,
  Card,
  DataTable,
  EmptyState,
  LoadingSpinner,
  PageHeader,
  StatusBadge,
  Tabs,
} from '@/components/ui';
import { CopilotApplicationPanel } from '@/features/copilot';
import { ApplicationWorkflowPanel } from '@/features/applications/components/ApplicationWorkflowPanel';
import { RecommendationsPanel } from '@/features/recommendations';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import { applicationsService } from '@/services/index';

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'recommendations', label: 'Recommendations' },
  { id: 'copilot', label: 'AI Copilot' },
  { id: 'eligibility', label: 'Eligibility' },
  { id: 'bank-login', label: 'Bank Login' },
  { id: 'credit-review', label: 'Credit Review' },
  { id: 'sanction', label: 'Sanction' },
  { id: 'disbursement', label: 'Disbursement' },
  { id: 'timeline', label: 'Timeline' },
];

function str(v: unknown): string {
  if (v === null || v === undefined) return '—';
  return String(v);
}

function customerDisplayName(data: Record<string, unknown>): string {
  const nested = data.customer as Record<string, unknown> | undefined;
  return str(data.customerName ?? nested?.fullName ?? data.customerId);
}

function productDisplayName(data: Record<string, unknown>): string {
  const nested = data.product as Record<string, unknown> | undefined;
  return str(data.productName ?? nested?.name ?? data.productId);
}

function partnerDisplayName(data: Record<string, unknown>): string {
  const nested = data.partner as Record<string, unknown> | undefined;
  return str(data.partnerName ?? nested?.businessName ?? '—');
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="info-item-label">{label}</div>
      <div className="info-item-value">{value}</div>
    </div>
  );
}

function WizardMetadataView({ metadata }: { metadata: Record<string, unknown> }) {
  const personal = metadata.personal as Record<string, unknown> | undefined;
  const employment = metadata.employment as Record<string, unknown> | undefined;
  const income = metadata.income as Record<string, unknown> | undefined;
  const collateral = metadata.collateral as Record<string, unknown> | null | undefined;
  const business = metadata.business as Record<string, unknown> | null | undefined;
  const insurance = metadata.insurance as Record<string, unknown> | null | undefined;
  const creditCard = metadata.creditCard as Record<string, unknown> | null | undefined;
  const address = personal?.address as Record<string, unknown> | undefined;

  return (
    <div className="info-grid">
      <InfoItem
        label="Applicant"
        value={str([personal?.firstName, personal?.lastName].filter(Boolean).join(' '))}
      />
      <InfoItem label="Phone" value={str(personal?.phone)} />
      <InfoItem label="Email" value={str(personal?.email)} />
      <InfoItem
        label="City"
        value={str(address?.city ?? personal?.city)}
      />
      <InfoItem label="Employment" value={str(employment?.employmentType)} />
      <InfoItem label="Employer" value={str(employment?.employerName)} />
      <InfoItem label="Monthly Income" value={str(income?.monthlyIncome)} />
      {collateral?.type === 'property' && (
        <InfoItem label="Property" value={str(collateral.propertyType)} />
      )}
      {collateral?.type === 'vehicle' && (
        <InfoItem
          label="Vehicle"
          value={str([collateral.vehicleMake, collateral.vehicleModel].filter(Boolean).join(' '))}
        />
      )}
      {business && <InfoItem label="Turnover" value={str(business.turnover)} />}
      {insurance && (
        <InfoItem label="Insurance" value={`${str(insurance.policyType)} · ₹${str(insurance.sumAssured)}`} />
      )}
      {creditCard && (
        <InfoItem label="Credit Card" value={`${str(creditCard.cardType)} · ${str(creditCard.preference)}`} />
      )}
    </div>
  );
}

export function ApplicationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [tab, setTab] = useState('overview');

  const application = useQuery({
    queryKey: ['application', id],
    queryFn: () => applicationsService.getById(id!),
    enabled: !!id,
  });

  const eligibility = useQuery({
    queryKey: ['application-eligibility', id],
    queryFn: () => applicationsService.eligibility({ applicationId: id!, page: 1, limit: 20 }),
    enabled: !!id && tab === 'eligibility',
  });

  const bankLogins = useQuery({
    queryKey: ['application-bank-logins', id],
    queryFn: () => applicationsService.bankLogins({ applicationId: id!, page: 1, limit: 20 }),
    enabled: !!id && tab === 'bank-login',
  });

  const creditReviews = useQuery({
    queryKey: ['application-credit-reviews', id],
    queryFn: () => applicationsService.creditReviews({ applicationId: id!, page: 1, limit: 20 }),
    enabled: !!id && tab === 'credit-review',
  });

  const sanctions = useQuery({
    queryKey: ['application-sanctions', id],
    queryFn: () => applicationsService.sanctions({ applicationId: id!, page: 1, limit: 20 }),
    enabled: !!id && tab === 'sanction',
  });

  const disbursements = useQuery({
    queryKey: ['application-disbursements', id],
    queryFn: () => applicationsService.disbursements({ applicationId: id!, page: 1, limit: 20 }),
    enabled: !!id && tab === 'disbursement',
  });

  const timeline = useQuery({
    queryKey: ['application-timeline', id],
    queryFn: () => applicationsService.timeline({ applicationId: id!, page: 1, limit: 50 }),
    enabled: !!id && tab === 'timeline',
  });

  if (application.isLoading) return <LoadingSpinner />;
  if (application.isError || !application.data) {
    return (
      <div className="page-container">
        <EmptyState title="Application not found" />
        <Button variant="secondary" onClick={() => navigate('/applications')} style={{ marginTop: '1rem' }}>
          Back to Applications
        </Button>
      </div>
    );
  }

  const data = application.data;

  return (
    <div className="page-container">
      <PageHeader
        title={`Application ${str(data.applicationNumber ?? data.id)}`}
        subtitle={customerDisplayName(data)}
        actions={
          <Button variant="ghost" onClick={() => navigate('/applications')}>
            <ArrowLeft size={16} />
            Back
          </Button>
        }
      />

      <div style={{ marginBottom: '1rem' }}>
        <StatusBadge status={str(data.status)} />
      </div>

      <Tabs tabs={TABS} active={tab} onChange={setTab} />

      {id ? <ApplicationWorkflowPanel applicationId={id} data={data} /> : null}

      {tab === 'recommendations' && id && <RecommendationsPanel entityType="APPLICATION" entityId={id} />}

      {tab === 'copilot' && id && <CopilotApplicationPanel applicationId={id} />}

      {tab === 'overview' && (
        <div className="detail-grid">
          <Card title="Application Details">
            <div className="info-grid">
              <InfoItem label="Customer" value={customerDisplayName(data)} />
              <InfoItem label="Product" value={productDisplayName(data)} />
              <InfoItem label="DSA / Partner" value={partnerDisplayName(data)} />
              <InfoItem label="Loan Amount" value={formatCurrency((data.loanAmount ?? data.requestedAmount) as number)} />
              <InfoItem label="Tenure" value={`${str(data.tenureMonths)} months`} />
              <InfoItem label="Interest Rate" value={data.interestRate ? `${data.interestRate}%` : '—'} />
              <InfoItem label="Lender" value={str(data.lenderName ?? data.lenderId)} />
              <InfoItem label="Branch" value={str(data.branchName ?? data.branchId)} />
              <InfoItem label="Linked Lead" value={str(data.leadNumber ?? data.leadId)} />
              {data.leadId ? (
                <div style={{ gridColumn: '1 / -1' }}>
                  <Button variant="secondary" size="sm" onClick={() => navigate(`/leads/${data.leadId}`)}>
                    Open CRM Lead
                  </Button>
                </div>
              ) : null}
              <InfoItem label="Submitted" value={formatDateTime(data.submittedAt as string)} />
              <InfoItem label="Created" value={formatDateTime(data.createdAt as string)} />
            </div>
          </Card>
          <Card title="Pipeline Status">
            <div className="info-grid">
              <InfoItem label="Current Stage" value={str(data.currentStage ?? data.status)} />
              <InfoItem label="Eligibility" value={str(data.eligibilityStatus)} />
              <InfoItem label="Credit Review" value={str(data.creditReviewStatus)} />
              <InfoItem label="Sanction" value={str(data.sanctionStatus)} />
              <InfoItem label="Disbursement" value={str(data.disbursementStatus)} />
            </div>
          </Card>
          {(data.wizardMetadata as Record<string, unknown> | null) && (
            <Card title="Applicant Profile (Wizard)">
              <WizardMetadataView metadata={data.wizardMetadata as Record<string, unknown>} />
            </Card>
          )}
        </div>
      )}

      {tab === 'eligibility' && (
        <Card title="Eligibility Results">
          {eligibility.isLoading ? (
            <LoadingSpinner />
          ) : (eligibility.data?.items.length ?? 0) === 0 ? (
            <EmptyState title="No eligibility results" />
          ) : (
            <DataTable
              columns={[
                { key: 'ruleName', header: 'Rule', render: (r) => str(r.ruleName ?? r.ruleId) },
                {
                  key: 'result',
                  header: 'Result',
                  render: (r) => <StatusBadge status={str(r.result ?? r.status)} />,
                },
                { key: 'score', header: 'Score', render: (r) => str(r.score) },
                { key: 'evaluatedAt', header: 'Evaluated', render: (r) => formatDateTime(r.evaluatedAt as string) },
              ]}
              data={eligibility.data?.items ?? []}
            />
          )}
        </Card>
      )}

      {tab === 'bank-login' && (
        <Card title="Bank Login Sessions">
          {bankLogins.isLoading ? (
            <LoadingSpinner />
          ) : (bankLogins.data?.items.length ?? 0) === 0 ? (
            <EmptyState title="No bank login records" />
          ) : (
            <DataTable
              columns={[
                { key: 'bankName', header: 'Bank', render: (r) => str(r.bankName ?? r.lenderName) },
                {
                  key: 'status',
                  header: 'Status',
                  render: (r) => <StatusBadge status={str(r.status)} />,
                },
                { key: 'loginAt', header: 'Login Time', render: (r) => formatDateTime((r.loginAt ?? r.createdAt) as string) },
              ]}
              data={bankLogins.data?.items ?? []}
            />
          )}
        </Card>
      )}

      {tab === 'credit-review' && (
        <Card title="Credit Reviews">
          {creditReviews.isLoading ? (
            <LoadingSpinner />
          ) : (creditReviews.data?.items.length ?? 0) === 0 ? (
            <EmptyState title="No credit reviews" />
          ) : (
            <DataTable
              columns={[
                { key: 'reviewerName', header: 'Reviewer', render: (r) => str(r.reviewerName ?? r.reviewerId) },
                {
                  key: 'decision',
                  header: 'Decision',
                  render: (r) => <StatusBadge status={str(r.decision ?? r.status)} />,
                },
                { key: 'creditScore', header: 'Credit Score', render: (r) => str(r.creditScore) },
                { key: 'reviewedAt', header: 'Reviewed', render: (r) => formatDateTime(r.reviewedAt as string) },
              ]}
              data={creditReviews.data?.items ?? []}
            />
          )}
        </Card>
      )}

      {tab === 'sanction' && (
        <Card title="Sanction Details">
          {sanctions.isLoading ? (
            <LoadingSpinner />
          ) : (sanctions.data?.items.length ?? 0) === 0 ? (
            <EmptyState title="No sanction records" />
          ) : (
            <DataTable
              columns={[
                { key: 'sanctionedAmount', header: 'Amount', render: (r) => formatCurrency(r.sanctionedAmount as number) },
                { key: 'interestRate', header: 'Rate', render: (r) => (r.interestRate ? `${r.interestRate}%` : '—') },
                { key: 'tenureMonths', header: 'Tenure', render: (r) => `${str(r.tenureMonths)} mo` },
                {
                  key: 'status',
                  header: 'Status',
                  render: (r) => <StatusBadge status={str(r.status)} />,
                },
                { key: 'sanctionedAt', header: 'Sanctioned', render: (r) => formatDateTime(r.sanctionedAt as string) },
              ]}
              data={sanctions.data?.items ?? []}
            />
          )}
        </Card>
      )}

      {tab === 'disbursement' && (
        <Card title="Disbursements">
          {disbursements.isLoading ? (
            <LoadingSpinner />
          ) : (disbursements.data?.items.length ?? 0) === 0 ? (
            <EmptyState title="No disbursement records" />
          ) : (
            <DataTable
              columns={[
                { key: 'disbursedAmount', header: 'Amount', render: (r) => formatCurrency(r.disbursedAmount as number) },
                { key: 'utrNumber', header: 'UTR', render: (r) => str(r.utrNumber) },
                {
                  key: 'status',
                  header: 'Status',
                  render: (r) => <StatusBadge status={str(r.status)} />,
                },
                { key: 'disbursedAt', header: 'Disbursed', render: (r) => formatDateTime(r.disbursedAt as string) },
              ]}
              data={disbursements.data?.items ?? []}
            />
          )}
        </Card>
      )}

      {tab === 'timeline' && (
        <Card title="Application Timeline">
          {timeline.isLoading ? (
            <LoadingSpinner />
          ) : (timeline.data?.items.length ?? 0) === 0 ? (
            <EmptyState title="No timeline events" />
          ) : (
            <div className="timeline">
              {(timeline.data?.items ?? []).map((event) => (
                <div key={String(event.id)} className="timeline-item">
                  <div className="timeline-dot" />
                  <div className="timeline-content">
                    <div className="timeline-title">{str(event.title ?? event.eventType ?? event.stage)}</div>
                    <div className="timeline-desc">{str(event.description)}</div>
                    <div className="timeline-time">{formatDateTime((event.occurredAt ?? event.createdAt) as string)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
