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
import { RecommendationsPanel } from '@/features/recommendations';
import { formatDate, formatDateTime } from '@/lib/utils';
import { applicationsService, auditService, customersService, documentsService, kycService } from '@/services/index';

const TABS = [
  { id: 'recommendations', label: 'Recommendations' },
  { id: 'profile', label: 'Profile' },
  { id: 'kyc', label: 'KYC' },
  { id: 'documents', label: 'Documents' },
  { id: 'applications', label: 'Applications' },
  { id: 'timeline', label: 'Timeline' },
  { id: 'notes', label: 'Notes' },
];

function str(v: unknown): string {
  if (v === null || v === undefined) return '—';
  return String(v);
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="info-item-label">{label}</div>
      <div className="info-item-value">{value}</div>
    </div>
  );
}

export function CustomerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [tab, setTab] = useState('profile');

  const customer = useQuery({
    queryKey: ['customer', id],
    queryFn: () => customersService.getById(id!),
    enabled: !!id,
  });

  const profile = useQuery({
    queryKey: ['customer-profile', id],
    queryFn: () => customersService.profile(id!),
    enabled: !!id && tab === 'profile',
  });

  const kyc = useQuery({
    queryKey: ['customer-kyc', id],
    queryFn: () => kycService.list({ customerId: id!, page: 1, limit: 20 }),
    enabled: !!id && tab === 'kyc',
  });

  const documents = useQuery({
    queryKey: ['customer-documents', id],
    queryFn: () => documentsService.list({ customerId: id!, page: 1, limit: 50 }),
    enabled: !!id && tab === 'documents',
  });

  const applications = useQuery({
    queryKey: ['customer-applications', id],
    queryFn: () => applicationsService.list({ customerId: id!, page: 1, limit: 50 }),
    enabled: !!id && tab === 'applications',
  });

  const timeline = useQuery({
    queryKey: ['customer-timeline', id],
    queryFn: () => auditService.list({ entityId: id!, entityType: 'CUSTOMER', page: 1, limit: 50 }),
    enabled: !!id && tab === 'timeline',
  });

  if (customer.isLoading) return <LoadingSpinner />;
  if (customer.isError || !customer.data) {
    return (
      <div className="page-container">
        <EmptyState title="Customer not found" />
        <Button variant="secondary" onClick={() => navigate('/customers')} style={{ marginTop: '1rem' }}>
          Back to Customers
        </Button>
      </div>
    );
  }

  const data = customer.data;
  const profileData = profile.data ?? {};

  return (
    <div className="page-container">
      <PageHeader
        title={str(data.fullName ?? data.name ?? data.customerNumber)}
        subtitle={`Customer ${str(data.customerNumber ?? data.id)}`}
        actions={
          <Button variant="ghost" onClick={() => navigate('/customers')}>
            <ArrowLeft size={16} />
            Back
          </Button>
        }
      />

      <div style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem' }}>
        <StatusBadge status={str(data.status)} />
        {data.kycStatus != null && String(data.kycStatus) !== '' ? (
          <StatusBadge status={str(data.kycStatus)} />
        ) : null}
      </div>

      <Tabs tabs={TABS} active={tab} onChange={setTab} />

      {tab === 'recommendations' && id && <RecommendationsPanel entityType="CUSTOMER" entityId={id} />}

      {tab === 'profile' && (
        <div className="detail-grid">
          <Card title="Personal Information">
            {profile.isLoading ? (
              <LoadingSpinner />
            ) : (
              <div className="info-grid">
                <InfoItem label="Phone" value={str(data.phone)} />
                <InfoItem label="Email" value={str(data.email)} />
                <InfoItem label="PAN" value={str(data.panNumber ?? data.pan)} />
                <InfoItem label="Date of Birth" value={formatDate(data.dateOfBirth as string)} />
                <InfoItem label="Gender" value={str(data.gender)} />
                <InfoItem label="Alternate Phone" value={str(profileData.alternatePhone)} />
                <InfoItem label="Alternate Email" value={str(profileData.alternateEmail)} />
                <InfoItem label="Nationality" value={str(profileData.nationality)} />
                <InfoItem label="Preferred Language" value={str(profileData.preferredLanguage)} />
                <InfoItem label="Contact Channel" value={str(profileData.preferredContactChannel)} />
                <InfoItem label="Created" value={formatDateTime(data.createdAt as string)} />
              </div>
            )}
          </Card>
          <Card title="Account">
            <div className="info-grid">
              <InfoItem label="Customer ID" value={str(data.id)} />
              <InfoItem label="Status" value={str(data.status)} />
              <InfoItem label="KYC Status" value={str(data.kycStatus)} />
              <InfoItem label="Branch" value={str(data.branchName ?? data.branchId)} />
            </div>
          </Card>
        </div>
      )}

      {tab === 'kyc' && (
        <Card title="KYC Records">
          {kyc.isLoading ? (
            <LoadingSpinner />
          ) : (kyc.data?.items.length ?? 0) === 0 ? (
            <EmptyState title="No KYC records" description="KYC verification records will appear here." />
          ) : (
            <DataTable
              columns={[
                { key: 'kycType', header: 'Type', render: (r) => str(r.kycType ?? r.type) },
                { key: 'documentNumber', header: 'Document #', render: (r) => str(r.documentNumber) },
                {
                  key: 'status',
                  header: 'Status',
                  render: (r) => <StatusBadge status={str(r.status)} />,
                },
                { key: 'verifiedAt', header: 'Verified', render: (r) => formatDateTime(r.verifiedAt as string) },
              ]}
              data={kyc.data?.items ?? []}
              onRowClick={(row) => row.id && navigate(`/documents/${row.id}`)}
            />
          )}
        </Card>
      )}

      {tab === 'documents' && (
        <Card title="Documents">
          {documents.isLoading ? (
            <LoadingSpinner />
          ) : (documents.data?.items.length ?? 0) === 0 ? (
            <EmptyState title="No documents" />
          ) : (
            <DataTable
              columns={[
                { key: 'documentType', header: 'Type', render: (r) => str(r.documentType ?? r.type) },
                {
                  key: 'status',
                  header: 'Status',
                  render: (r) => <StatusBadge status={str(r.status)} />,
                },
                { key: 'uploadedAt', header: 'Uploaded', render: (r) => formatDateTime((r.uploadedAt ?? r.createdAt) as string) },
              ]}
              data={documents.data?.items ?? []}
              onRowClick={(row) => navigate(`/documents/${row.id}`)}
            />
          )}
        </Card>
      )}

      {tab === 'applications' && (
        <Card title="Loan Applications">
          {applications.isLoading ? (
            <LoadingSpinner />
          ) : (applications.data?.items.length ?? 0) === 0 ? (
            <EmptyState title="No applications" description="Loan applications for this customer will appear here." />
          ) : (
            <DataTable
              columns={[
                { key: 'applicationNumber', header: 'Application #', render: (r) => str(r.applicationNumber) },
                { key: 'productName', header: 'Product', render: (r) => str(r.productName ?? r.productId) },
                {
                  key: 'status',
                  header: 'Status',
                  render: (r) => <StatusBadge status={str(r.status)} />,
                },
                { key: 'createdAt', header: 'Created', render: (r) => formatDate(r.createdAt as string) },
              ]}
              data={applications.data?.items ?? []}
              onRowClick={(row) => navigate(`/applications/${row.id}`)}
            />
          )}
        </Card>
      )}

      {tab === 'timeline' && (
        <Card title="Activity Timeline">
          {timeline.isLoading ? (
            <LoadingSpinner />
          ) : (timeline.data?.items.length ?? 0) === 0 ? (
            <EmptyState title="No activity" description="Audit events for this customer will appear here." />
          ) : (
            <div className="timeline">
              {(timeline.data?.items ?? []).map((event) => (
                <div key={String(event.id)} className="timeline-item">
                  <div className="timeline-dot" />
                  <div className="timeline-content">
                    <div className="timeline-title">{str(event.action ?? event.eventType)}</div>
                    <div className="timeline-desc">{str(event.description ?? event.entityType)}</div>
                    <div className="timeline-time">{formatDateTime((event.createdAt ?? event.occurredAt) as string)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {tab === 'notes' && (
        <Card title="Notes">
          <EmptyState
            title="No notes yet"
            description="Internal notes for this customer can be added from the CRM workflow."
          />
        </Card>
      )}
    </div>
  );
}
