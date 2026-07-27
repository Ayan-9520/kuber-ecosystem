import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, FileText, StickyNote } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import '../loan-fulfillment.css';
import { CaseJourneyTimeline } from '../components/CaseJourneyTimeline';
import {
  RevenueDistributionPanel,
  stakeholdersToRows,
  type DistributionRow,
} from '../components/RevenueDistributionPanel';
import {
  canLoanFulfillmentAction,
  isPartnerRole,
  resolveLoanFulfillmentRole,
} from '../data/permissions';
import { getProductLabel, getStageLabel, JOURNEY_STAGES } from '../data/stages';
import type { LoanCase, LoanCaseStage } from '../data/types';

import {
  Button,
  Card,
  DataTable,
  EmptyState,
  LoadingSpinner,
  PageHeader,
  Select,
  StatusBadge,
  Tabs,
} from '@/components/ui';
import { useAuth } from '@/hooks/usePermissions';
import { formatCurrency, formatDate, formatDateTime, getApiErrorMessage } from '@/lib/utils';
import { loanFulfillmentService } from '@/services/index';

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'customer', label: 'Customer' },
  { id: 'loan', label: 'Loan' },
  { id: 'documents', label: 'Documents' },
  { id: 'timeline', label: 'Timeline' },
  { id: 'revenue', label: 'Revenue' },
  { id: 'approvals', label: 'Approvals' },
  { id: 'tasks', label: 'Tasks' },
  { id: 'notes', label: 'Notes' },
  { id: 'activity', label: 'Activity' },
];

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="lf-info-label">{label}</div>
      <div className="lf-info-value">{value}</div>
    </div>
  );
}

function dash(v: unknown): string {
  if (v === null || v === undefined || v === '') return '—';
  return String(v);
}

export function LoanCaseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const role = resolveLoanFulfillmentRole({ roles: user?.roles, permissions: user?.permissions });
  const partnerView = isPartnerRole(role);
  const canEdit = canLoanFulfillmentAction(role, 'editCase');
  const canEditDist = canLoanFulfillmentAction(role, 'editDistribution');
  const canApprove = canLoanFulfillmentAction(role, 'approvePayouts');
  const canViewInternal = canLoanFulfillmentAction(role, 'viewInternalNotes');
  const canViewFullRevenue = canLoanFulfillmentAction(role, 'viewFullRevenue');
  const visibleTabs = partnerView
    ? TABS.filter((t) => t.id !== 'approvals' && t.id !== 'notes').map((t) =>
        t.id === 'revenue' ? { ...t, label: 'My Payout' } : t,
      )
    : TABS;

  const [tab, setTab] = useState('overview');
  const [distRows, setDistRows] = useState<DistributionRow[]>([]);
  const [nextStage, setNextStage] = useState('');
  const [stageComment, setStageComment] = useState('');
  const [notesDraft, setNotesDraft] = useState('');
  const [taskTitle, setTaskTitle] = useState('');
  const [taskPriority, setTaskPriority] = useState('MEDIUM');

  const caseQuery = useQuery({
    queryKey: ['loan-fulfillment', 'case', id],
    queryFn: () => loanFulfillmentService.getCase(id!),
    enabled: !!id,
  });

  const loanCase = caseQuery.data;

  useEffect(() => {
    if (loanCase?.stakeholders) {
      const rows = stakeholdersToRows(loanCase.stakeholders);
      setDistRows(partnerView ? rows.filter((r) => r.stakeholderType === 'PARTNER') : rows);
    }
    if (loanCase) {
      setNotesDraft(
        partnerView
          ? (loanCase.remarks ?? '')
          : (loanCase.internalNotes ?? loanCase.notes ?? loanCase.remarks ?? ''),
      );
    }
  }, [loanCase, partnerView]);

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ['loan-fulfillment', 'case', id] });
  };

  const advance = useMutation({
    mutationFn: () =>
      loanFulfillmentService.advanceStage(id!, {
        ...(nextStage ? { stage: nextStage as LoanCaseStage } : {}),
        ...(stageComment.trim() ? { comment: stageComment.trim() } : {}),
      }),
    onSuccess: () => {
      setStageComment('');
      setNextStage('');
      invalidate();
    },
  });

  const saveDist = useMutation({
    mutationFn: () =>
      loanFulfillmentService.setStakeholders(id!, {
        stakeholders: distRows.map((r) => ({
          stakeholderType: r.stakeholderType,
          stakeholderName: r.stakeholderName,
          sharePercent: r.sharePercent,
        })),
      }),
    onSuccess: invalidate,
  });

  const saveNotes = useMutation({
    mutationFn: () =>
      loanFulfillmentService.updateCase(id!, {
        internalNotes: notesDraft,
        remarks: notesDraft,
      }),
    onSuccess: invalidate,
  });

  const addTask = useMutation({
    mutationFn: () =>
      loanFulfillmentService.addTask(id!, {
        title: taskTitle.trim(),
        priority: taskPriority as 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT',
      }),
    onSuccess: () => {
      setTaskTitle('');
      invalidate();
    },
  });

  const decideApproval = useMutation({
    mutationFn: ({ approvalId, status }: { approvalId: string; status: 'APPROVED' | 'REJECTED' | 'ON_HOLD' }) =>
      loanFulfillmentService.decideApproval(id!, approvalId, { status }),
    onSuccess: invalidate,
  });

  const updateTask = useMutation({
    mutationFn: ({
      taskId,
      status,
    }: {
      taskId: string;
      status: 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
    }) => loanFulfillmentService.updateTask(id!, taskId, { status }),
    onSuccess: invalidate,
  });

  const verifyDocument = useMutation({
    mutationFn: (documentId: string) => loanFulfillmentService.verifyDocument(id!, documentId),
    onSuccess: invalidate,
  });

  if (caseQuery.isLoading) {
    return (
      <div className="page-container loan-fulfillment">
        <LoadingSpinner />
      </div>
    );
  }

  if (caseQuery.isError || !loanCase) {
    return (
      <div className="page-container loan-fulfillment">
        <div className="lf-empty">
          <EmptyState
            icon={<FileText size={32} />}
            title="Case not found"
            description="This loan case could not be loaded."
            action={
              <Button type="button" variant="secondary" onClick={() => navigate('/loan-fulfillment/cases')}>
                Back to cases
              </Button>
            }
          />
        </div>
      </div>
    );
  }

  const revenuePool =
    Number(loanCase.netRevenue ?? loanCase.revenueGenerated ?? loanCase.expectedRevenue ?? 0) || 0;

  const stageOptions = [
    { value: '', label: 'Advance to next stage' },
    ...JOURNEY_STAGES.filter((s) => s.id !== loanCase.stage).map((s) => ({
      value: s.id,
      label: s.label,
    })),
    { value: 'REJECTED', label: 'Rejected' },
    { value: 'ON_HOLD', label: 'On Hold' },
  ];

  return (
    <div className="page-container loan-fulfillment">
      <PageHeader
        title={loanCase.caseNumber}
        subtitle={`${loanCase.customerName} · ${getProductLabel(loanCase.product)}`}
        actions={
          <Button type="button" variant="ghost" onClick={() => navigate('/loan-fulfillment/cases')}>
            <ArrowLeft size={16} style={{ marginRight: 6 }} />
            Back
          </Button>
        }
      />

      <div className="lf-detail-header">
        <span className="lf-stage-pill">{getStageLabel(loanCase.stage)}</span>
        <StatusBadge status={loanCase.approvalStatus} />
        <StatusBadge status={loanCase.paymentStatus} />
        <span className="text-muted" style={{ fontSize: '0.85rem' }}>
          Updated {formatDateTime(loanCase.updatedAt)}
        </span>
      </div>

      {canEdit ? (
        <Card title="Advance stage" subtitle="Move the case through the fulfillment journey">
          {(advance.error || saveDist.error || saveNotes.error || addTask.error || updateTask.error || verifyDocument.error) && (
            <div className="alert alert-error" style={{ marginBottom: '0.75rem' }}>
              {getApiErrorMessage(
                advance.error ??
                  saveDist.error ??
                  saveNotes.error ??
                  addTask.error ??
                  updateTask.error ??
                  verifyDocument.error,
              )}
            </div>
          )}
          <div className="lf-filter-bar" style={{ marginBottom: 0 }}>
            <Select
              label="Target stage"
              options={stageOptions}
              value={nextStage}
              onChange={(e) => setNextStage(e.target.value)}
            />
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label" htmlFor="lf-stage-comment">
                Comment
              </label>
              <input
                id="lf-stage-comment"
                className="form-input"
                value={stageComment}
                onChange={(e) => setStageComment(e.target.value)}
                placeholder="Optional note"
              />
            </div>
            <Button type="button" loading={advance.isPending} onClick={() => advance.mutate()}>
              Advance
            </Button>
          </div>
        </Card>
      ) : null}

      <Tabs
        tabs={visibleTabs}
        active={visibleTabs.some((t) => t.id === tab) ? tab : visibleTabs[0]?.id ?? 'overview'}
        onChange={setTab}
      />

      {tab === 'overview' && <OverviewTab loanCase={loanCase} partnerView={partnerView} />}
      {tab === 'customer' && <CustomerTab loanCase={loanCase} partnerView={partnerView} />}
      {tab === 'loan' && <LoanTab loanCase={loanCase} />}
      {tab === 'documents' && (
        <DocumentsTab
          loanCase={loanCase}
          canEdit={canEdit}
          verifying={verifyDocument.isPending}
          onVerify={(documentId) => verifyDocument.mutate(documentId)}
        />
      )}
      {tab === 'timeline' && (
        <Card title="Journey timeline">
          <CaseJourneyTimeline currentStage={loanCase.stage} events={loanCase.timeline} />
        </Card>
      )}
      {tab === 'revenue' && (
        <Card
          title={partnerView ? 'My payout' : 'Revenue distribution'}
          subtitle={
            partnerView
              ? 'Partner-visible commission only — company margins are hidden'
              : canViewFullRevenue
                ? 'Stakeholder share of net revenue'
                : 'Your visible share'
          }
        >
          {partnerView ? (
            <div className="lf-info-grid" style={{ marginBottom: '1rem' }}>
              <InfoItem label="Expected commission" value={formatCurrency(loanCase.expectedCommission)} />
              <InfoItem label="Payment status" value={loanCase.paymentStatus} />
            </div>
          ) : null}
          {!canViewFullRevenue && !canEditDist && !partnerView ? (
            <EmptyState
              title="Limited revenue view"
              description="Full distribution is restricted to finance and operations roles."
            />
          ) : distRows.length === 0 ? (
            <div className="lf-empty">
              <EmptyState
                title="No distribution yet"
                description="Stakeholders will appear once revenue is configured for this case."
              />
            </div>
          ) : (
            <RevenueDistributionPanel
              rows={distRows}
              totalPool={revenuePool || distRows.reduce((s, r) => s + r.amount, 0)}
              editable={canEditDist && !partnerView}
              onChange={setDistRows}
              onSave={() => saveDist.mutate()}
              saving={saveDist.isPending}
            />
          )}
          {canViewFullRevenue ? (
            <div className="lf-info-grid" style={{ marginTop: '1.25rem' }}>
              <InfoItem label="Expected revenue" value={formatCurrency(loanCase.expectedRevenue)} />
              <InfoItem label="Revenue generated" value={formatCurrency(loanCase.revenueGenerated)} />
              <InfoItem label="GST" value={formatCurrency(loanCase.gstAmount)} />
              <InfoItem label="TDS" value={formatCurrency(loanCase.tdsAmount)} />
              <InfoItem label="Net revenue" value={formatCurrency(loanCase.netRevenue)} />
              <InfoItem label="Expected commission" value={formatCurrency(loanCase.expectedCommission)} />
            </div>
          ) : null}
        </Card>
      )}
      {tab === 'approvals' && !partnerView && (
        <ApprovalsTab
          loanCase={loanCase}
          canApprove={canApprove}
          deciding={decideApproval.isPending}
          onDecide={(approvalId, status) => decideApproval.mutate({ approvalId, status })}
        />
      )}
      {tab === 'tasks' && (
        <TasksTab
          loanCase={loanCase}
          canEdit={canEdit}
          taskTitle={taskTitle}
          taskPriority={taskPriority}
          onTitleChange={setTaskTitle}
          onPriorityChange={setTaskPriority}
          onAdd={() => {
            if (!taskTitle.trim()) return;
            addTask.mutate();
          }}
          adding={addTask.isPending}
          updating={updateTask.isPending}
          onUpdateStatus={(taskId, status) => updateTask.mutate({ taskId, status })}
        />
      )}
      {tab === 'notes' && !partnerView && (
        <Card title="Notes" subtitle={canViewInternal ? 'Internal notes' : 'Case remarks'}>
          {canViewInternal || canEdit ? (
            <>
              <textarea
                className="form-textarea"
                rows={8}
                value={notesDraft}
                onChange={(e) => setNotesDraft(e.target.value)}
                disabled={!canEdit}
              />
              {canEdit ? (
                <div style={{ marginTop: '0.75rem' }}>
                  <Button type="button" loading={saveNotes.isPending} onClick={() => saveNotes.mutate()}>
                    <StickyNote size={14} style={{ marginRight: 6 }} />
                    Save notes
                  </Button>
                </div>
              ) : null}
            </>
          ) : (
            <EmptyState title="No notes available" description="Notes are restricted for your role." />
          )}
        </Card>
      )}
      {tab === 'activity' && <ActivityTab loanCase={loanCase} />}
    </div>
  );
}

function OverviewTab({ loanCase, partnerView }: { loanCase: LoanCase; partnerView: boolean }) {
  return (
    <div className="detail-grid">
      <Card title="Case summary">
        <div className="lf-info-grid">
          <InfoItem label="Case #" value={loanCase.caseNumber} />
          <InfoItem label="Stage" value={getStageLabel(loanCase.stage)} />
          <InfoItem label="Product" value={getProductLabel(loanCase.product)} />
          <InfoItem label="Lender" value={loanCase.lenderName} />
          <InfoItem label="Branch" value={dash(loanCase.branchName)} />
          {!partnerView ? (
            <InfoItem label="Partner" value={dash(loanCase.partnerName ?? loanCase.partnerId)} />
          ) : null}
          {!partnerView ? (
            <InfoItem label="RM" value={dash(loanCase.relationshipManagerName ?? loanCase.relationshipManagerId)} />
          ) : null}
          <InfoItem label="Loan amount" value={formatCurrency(loanCase.loanAmount)} />
          <InfoItem label="City" value={dash(loanCase.city)} />
          <InfoItem label="Created" value={formatDateTime(loanCase.createdAt)} />
          {partnerView ? (
            <InfoItem label="Expected commission" value={formatCurrency(loanCase.expectedCommission)} />
          ) : null}
        </div>
      </Card>
      <Card title="Journey">
        <CaseJourneyTimeline currentStage={loanCase.stage} events={loanCase.timeline} compact />
      </Card>
      {!partnerView && (loanCase.aiCaseSummary || loanCase.aiEligibilityScore != null) ? (
        <Card title="AI insights">
          <div className="lf-info-grid">
            <InfoItem label="Eligibility score" value={dash(loanCase.aiEligibilityScore)} />
            <InfoItem label="Risk score" value={dash(loanCase.aiRiskScore)} />
            <InfoItem label="Bank recommendation" value={dash(loanCase.aiBankRecommendation)} />
          </div>
          {loanCase.aiCaseSummary ? <p style={{ marginTop: '0.75rem' }}>{loanCase.aiCaseSummary}</p> : null}
        </Card>
      ) : null}
    </div>
  );
}

function CustomerTab({ loanCase, partnerView }: { loanCase: LoanCase; partnerView: boolean }) {
  return (
    <Card title="Customer details">
      <div className="lf-info-grid">
        <InfoItem label="Name" value={loanCase.customerName} />
        <InfoItem label="Mobile" value={loanCase.mobile} />
        <InfoItem label="Email" value={dash(loanCase.email)} />
        {!partnerView ? <InfoItem label="PAN" value={dash(loanCase.pan)} /> : null}
        {!partnerView ? <InfoItem label="Aadhaar" value={dash(loanCase.aadhaarMasked)} /> : null}
        <InfoItem label="Occupation" value={dash(loanCase.occupation)} />
        <InfoItem label="Employer" value={dash(loanCase.employer)} />
        {!partnerView ? (
          <InfoItem label="Annual income" value={formatCurrency(loanCase.annualIncome)} />
        ) : null}
        <InfoItem label="Property" value={dash(loanCase.propertyAddress)} />
        <InfoItem label="City" value={dash(loanCase.city)} />
        <InfoItem label="State" value={dash(loanCase.state)} />
        <InfoItem label="Referral" value={dash(loanCase.referralSource)} />
      </div>
    </Card>
  );
}

function LoanTab({ loanCase }: { loanCase: LoanCase }) {
  return (
    <Card title="Loan details">
      <div className="lf-info-grid">
        <InfoItem label="Product" value={getProductLabel(loanCase.product)} />
        <InfoItem label="Lender" value={loanCase.lenderName} />
        <InfoItem label="Loan amount" value={formatCurrency(loanCase.loanAmount)} />
        <InfoItem label="Requested" value={formatCurrency(loanCase.requestedAmount)} />
        <InfoItem label="Eligible" value={formatCurrency(loanCase.eligibleAmount)} />
        <InfoItem label="Sanctioned" value={formatCurrency(loanCase.sanctionAmount)} />
        <InfoItem label="Disbursed" value={formatCurrency(loanCase.disbursementAmount)} />
        <InfoItem
          label="Interest rate"
          value={loanCase.interestRate != null ? `${loanCase.interestRate}%` : '—'}
        />
        <InfoItem
          label="Tenure"
          value={loanCase.tenureMonths != null ? `${loanCase.tenureMonths} months` : '—'}
        />
        <InfoItem label="EMI" value={formatCurrency(loanCase.emiAmount)} />
        <InfoItem label="Bank app #" value={dash(loanCase.bankApplicationNumber)} />
        <InfoItem label="Loan account #" value={dash(loanCase.loanAccountNumber)} />
        <InfoItem label="Expected sanction" value={formatDate(loanCase.expectedSanctionDate)} />
        <InfoItem label="Expected disbursement" value={formatDate(loanCase.expectedDisbursementDate)} />
        <InfoItem label="Project" value={dash(loanCase.projectName)} />
      </div>
    </Card>
  );
}

function DocumentsTab({
  loanCase,
  canEdit,
  verifying,
  onVerify,
}: {
  loanCase: LoanCase;
  canEdit: boolean;
  verifying: boolean;
  onVerify: (documentId: string) => void;
}) {
  const docs = loanCase.documents ?? [];
  if (!docs.length) {
    return (
      <div className="lf-empty">
        <EmptyState
          icon={<FileText size={32} />}
          title="No documents yet"
          description="Uploaded KYC and bank documents will appear here."
        />
      </div>
    );
  }
  return (
    <Card title="Documents">
      <DataTable
        columns={[
          { key: 'documentType', header: 'Type', render: (r) => String(r.documentType).replace(/_/g, ' ') },
          { key: 'fileName', header: 'File' },
          { key: 'uploadedByName', header: 'Uploaded by', render: (r) => dash(r.uploadedByName) },
          { key: 'createdAt', header: 'Uploaded', render: (r) => formatDateTime(r.createdAt as string) },
          {
            key: 'verifiedAt',
            header: 'Verified',
            render: (r) => (r.verifiedAt ? formatDateTime(r.verifiedAt as string) : 'Pending'),
          },
          {
            key: 'actions',
            header: '',
            render: (r) =>
              canEdit && !r.verifiedAt ? (
                <Button
                  type="button"
                  size="sm"
                  disabled={verifying}
                  onClick={(e) => {
                    e.stopPropagation();
                    onVerify(String(r.id));
                  }}
                >
                  Verify
                </Button>
              ) : null,
          },
        ]}
        data={docs as (typeof docs[number] & Record<string, unknown>)[]}
      />
    </Card>
  );
}

function ApprovalsTab({
  loanCase,
  canApprove,
  deciding,
  onDecide,
}: {
  loanCase: LoanCase;
  canApprove: boolean;
  deciding: boolean;
  onDecide: (approvalId: string, status: 'APPROVED' | 'REJECTED' | 'ON_HOLD') => void;
}) {
  const approvals = loanCase.approvals ?? [];
  if (!approvals.length) {
    return (
      <div className="lf-empty">
        <EmptyState title="No approvals" description="Finance and payout approvals will list here." />
      </div>
    );
  }
  return (
    <Card title="Approvals">
      <DataTable
        columns={[
          { key: 'step', header: 'Step' },
          {
            key: 'status',
            header: 'Status',
            render: (r) => <StatusBadge status={String(r.status)} />,
          },
          { key: 'actedByName', header: 'Acted by', render: (r) => dash(r.actedByName) },
          { key: 'actedAt', header: 'Acted at', render: (r) => formatDateTime(r.actedAt as string) },
          { key: 'comment', header: 'Comment', render: (r) => dash(r.comment) },
          {
            key: 'actions',
            header: '',
            render: (r) =>
              canApprove && r.status === 'PENDING' ? (
                <div style={{ display: 'flex', gap: '0.35rem' }}>
                  <Button
                    type="button"
                    size="sm"
                    disabled={deciding}
                    onClick={() => onDecide(String(r.id), 'APPROVED')}
                  >
                    Approve
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    disabled={deciding}
                    onClick={() => onDecide(String(r.id), 'REJECTED')}
                  >
                    Reject
                  </Button>
                </div>
              ) : null,
          },
        ]}
        data={approvals as (typeof approvals[number] & Record<string, unknown>)[]}
      />
    </Card>
  );
}

function TasksTab({
  loanCase,
  canEdit,
  taskTitle,
  taskPriority,
  onTitleChange,
  onPriorityChange,
  onAdd,
  adding,
  updating,
  onUpdateStatus,
}: {
  loanCase: LoanCase;
  canEdit: boolean;
  taskTitle: string;
  taskPriority: string;
  onTitleChange: (v: string) => void;
  onPriorityChange: (v: string) => void;
  onAdd: () => void;
  adding: boolean;
  updating: boolean;
  onUpdateStatus: (taskId: string, status: 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED') => void;
}) {
  const tasks = loanCase.tasks ?? [];
  return (
    <Card title="Tasks">
      {canEdit ? (
        <div className="lf-filter-bar" style={{ marginBottom: '1rem' }}>
          <div className="form-group" style={{ flex: 1 }}>
            <label className="form-label" htmlFor="lf-task-title">
              New task
            </label>
            <input
              id="lf-task-title"
              className="form-input"
              value={taskTitle}
              onChange={(e) => onTitleChange(e.target.value)}
              placeholder="Task title"
            />
          </div>
          <Select
            label="Priority"
            options={[
              { value: 'LOW', label: 'Low' },
              { value: 'MEDIUM', label: 'Medium' },
              { value: 'HIGH', label: 'High' },
              { value: 'URGENT', label: 'Urgent' },
            ]}
            value={taskPriority}
            onChange={(e) => onPriorityChange(e.target.value)}
          />
          <Button type="button" loading={adding} onClick={onAdd} disabled={!taskTitle.trim()}>
            Add task
          </Button>
        </div>
      ) : null}
      {!tasks.length ? (
        <div className="lf-empty">
          <EmptyState title="No open tasks" description="Create a task to track follow-ups on this case." />
        </div>
      ) : (
        <DataTable
          columns={[
            { key: 'title', header: 'Title' },
            { key: 'priority', header: 'Priority' },
            {
              key: 'status',
              header: 'Status',
              render: (r) => <StatusBadge status={String(r.status)} />,
            },
            { key: 'assignedToName', header: 'Assignee', render: (r) => dash(r.assignedToName) },
            { key: 'dueAt', header: 'Due', render: (r) => formatDate(r.dueAt as string) },
            {
              key: 'actions',
              header: '',
              render: (r) => {
                if (!canEdit) return null;
                const status = String(r.status);
                if (status === 'COMPLETED' || status === 'CANCELLED') return null;
                return (
                  <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                    {status === 'OPEN' ? (
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        disabled={updating}
                        onClick={(e) => {
                          e.stopPropagation();
                          onUpdateStatus(String(r.id), 'IN_PROGRESS');
                        }}
                      >
                        Start
                      </Button>
                    ) : null}
                    <Button
                      type="button"
                      size="sm"
                      disabled={updating}
                      onClick={(e) => {
                        e.stopPropagation();
                        onUpdateStatus(String(r.id), 'COMPLETED');
                      }}
                    >
                      Complete
                    </Button>
                  </div>
                );
              },
            },
          ]}
          data={tasks as (typeof tasks[number] & Record<string, unknown>)[]}
        />
      )}
    </Card>
  );
}

function ActivityTab({ loanCase }: { loanCase: LoanCase }) {
  const activities = loanCase.activities ?? [];
  if (!activities.length) {
    return (
      <div className="lf-empty">
        <EmptyState title="No activity yet" description="Case actions and audit events will show here." />
      </div>
    );
  }
  return (
    <Card title="Activity log">
      <ul className="lf-activity-list">
        {activities.map((a) => (
          <li key={a.id} className="lf-activity-item">
            <div>
              <strong>{a.action}</strong>
              {a.detail ? ` — ${a.detail}` : ''}
            </div>
            <span>
              {[a.userName, a.createdAt ? formatDateTime(a.createdAt) : null].filter(Boolean).join(' · ')}
            </span>
          </li>
        ))}
      </ul>
    </Card>
  );
}
