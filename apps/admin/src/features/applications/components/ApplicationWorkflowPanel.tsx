import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';

import { Button, Card, Select } from '@/components/ui';
import { invalidateLeadQueries } from '@/features/leads/lead-query-utils';
import { formatCurrency, getApiErrorMessage } from '@/lib/utils';
import { applicationsService, employeesService, productsService } from '@/services/index';

type Props = {
  applicationId: string;
  data: Record<string, unknown>;
};

function str(v: unknown): string {
  if (v === null || v === undefined) return '';
  return String(v);
}

function num(v: unknown, fallback: number): number {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

export function ApplicationWorkflowPanel({ applicationId, data }: Props) {
  const queryClient = useQueryClient();
  const status = str(data.status);
  const [error, setError] = useState('');
  const [lenderId, setLenderId] = useState(str(data.selectedLenderId ?? data.lenderId));
  const [reviewerId, setReviewerId] = useState('');

  const lenders = useQuery({
    queryKey: ['lenders'],
    queryFn: () => productsService.lenders({ limit: 50, isActive: true }),
  });

  const employees = useQuery({
    queryKey: ['employees-for-review'],
    queryFn: () => employeesService.list({ limit: 50, isActive: true }),
  });

  const lenderOptions = useMemo(
    () =>
      (lenders.data?.items ?? []).map((l) => ({
        value: str(l.id),
        label: str(l.name ?? l.code),
      })),
    [lenders.data?.items],
  );

  const employeeOptions = useMemo(
    () =>
      (employees.data?.items ?? []).map((e) => ({
        value: str(e.id),
        label: [e.firstName, e.lastName].filter(Boolean).join(' ') || str(e.employeeCode),
      })),
    [employees.data?.items],
  );

  const resolvedLenderId = lenderId || lenderOptions[0]?.value || '';
  const resolvedReviewerId = reviewerId || employeeOptions[0]?.value || '';

  const invalidateAll = async () => {
    await queryClient.invalidateQueries({ queryKey: ['application', applicationId] });
    await queryClient.invalidateQueries({ queryKey: ['applications'] });
    await queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    const leadId = str(data.leadId);
    if (leadId) invalidateLeadQueries(queryClient, leadId);
  };

  const onSuccess = async () => {
    setError('');
    await invalidateAll();
  };

  const onError = (err: unknown) => setError(getApiErrorMessage(err));

  const submitApp = useMutation({
    mutationFn: () => applicationsService.submit(applicationId, { runEligibility: true }),
    onSuccess,
    onError,
  });

  const moveUnderReview = useMutation({
    mutationFn: () => applicationsService.update(applicationId, { status: 'UNDER_REVIEW' }),
    onSuccess,
    onError,
  });

  const moveDocPending = useMutation({
    mutationFn: () => applicationsService.update(applicationId, { status: 'DOCUMENT_PENDING' }),
    onSuccess,
    onError,
  });

  const rejectApp = useMutation({
    mutationFn: () =>
      applicationsService.update(applicationId, { status: 'REJECTED', statusReason: 'Rejected from admin workflow' }),
    onSuccess,
    onError,
  });

  const runEligibility = useMutation({
    mutationFn: () => applicationsService.evaluateEligibility({ applicationId }),
    onSuccess,
    onError,
  });

  const recordBankLogin = useMutation({
    mutationFn: () =>
      applicationsService.createBankLogin({
        applicationId,
        lenderId: resolvedLenderId,
        loginDate: new Date().toISOString(),
        status: 'SUBMITTED',
        loginReference: `BL-${Date.now()}`,
      }),
    onSuccess,
    onError,
  });

  const approveCredit = useMutation({
    mutationFn: () =>
      applicationsService.createCreditReview({
        applicationId,
        reviewerId: resolvedReviewerId || undefined,
        reviewType: 'INTERNAL',
        decision: 'APPROVED',
        cibilScore: 750,
        reviewNotes: 'Approved from admin workflow',
      }),
    onSuccess,
    onError,
  });

  const issueSanction = useMutation({
    mutationFn: () => {
      const amount = num(data.loanAmount ?? data.requestedAmount, 500000);
      const tenure = num(data.tenureMonths ?? data.requestedTenureMonths, 60);
      return applicationsService.createSanction({
        applicationId,
        lenderId: resolvedLenderId,
        sanctionAmount: amount,
        tenureMonths: tenure,
        interestRate: num(data.interestRate, 10.5),
        sanctionDate: new Date().toISOString(),
        status: 'ISSUED',
      });
    },
    onSuccess,
    onError,
  });

  const recordDisbursement = useMutation({
    mutationFn: () => {
      const amount = num(data.approvedAmount ?? data.loanAmount ?? data.requestedAmount, 500000);
      return applicationsService.createDisbursement({
        applicationId,
        lenderId: resolvedLenderId,
        disbursementAmount: amount,
        disbursementDate: new Date().toISOString(),
        status: 'COMPLETED',
        bankReference: `UTR-${Date.now()}`,
        disbursementMode: 'FULL',
      });
    },
    onSuccess,
    onError,
  });

  const busy =
    submitApp.isPending ||
    moveUnderReview.isPending ||
    moveDocPending.isPending ||
    rejectApp.isPending ||
    runEligibility.isPending ||
    recordBankLogin.isPending ||
    approveCredit.isPending ||
    issueSanction.isPending ||
    recordDisbursement.isPending;

  const amountLabel = formatCurrency(num(data.loanAmount ?? data.requestedAmount, 0));

  return (
    <Card title="Process Application">
      <p style={{ marginBottom: '1rem', color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
        Current status: <strong>{status}</strong>
        {amountLabel ? ` · ${amountLabel}` : ''}
      </p>

      {lenderOptions.length > 0 ? (
        <div style={{ marginBottom: '1rem', maxWidth: 320 }}>
          <label className="info-item-label" htmlFor="workflow-lender">
            Lender
          </label>
          <Select
            id="workflow-lender"
            options={[{ value: '', label: 'Select lender…' }, ...lenderOptions]}
            value={resolvedLenderId}
            onChange={(e) => setLenderId(e.target.value)}
          />
        </div>
      ) : null}

      {employeeOptions.length > 0 ? (
        <div style={{ marginBottom: '1rem', maxWidth: 320 }}>
          <label className="info-item-label" htmlFor="workflow-reviewer">
            Credit reviewer
          </label>
          <Select
            id="workflow-reviewer"
            options={[{ value: '', label: 'Auto (default employee)' }, ...employeeOptions]}
            value={reviewerId}
            onChange={(e) => setReviewerId(e.target.value)}
          />
        </div>
      ) : null}

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
        {status === 'DRAFT' ? (
          <Button variant="primary" loading={submitApp.isPending} disabled={busy} onClick={() => submitApp.mutate()}>
            Submit Application
          </Button>
        ) : null}

        {status === 'SUBMITTED' ? (
          <>
            <Button variant="primary" loading={moveUnderReview.isPending} disabled={busy} onClick={() => moveUnderReview.mutate()}>
              Start Review
            </Button>
            <Button variant="secondary" loading={moveDocPending.isPending} disabled={busy} onClick={() => moveDocPending.mutate()}>
              Request Documents
            </Button>
          </>
        ) : null}

        {['UNDER_REVIEW', 'DOCUMENT_PENDING', 'BANK_LOGIN'].includes(status) ? (
          <>
            <Button variant="secondary" loading={runEligibility.isPending} disabled={busy} onClick={() => runEligibility.mutate()}>
              Run Eligibility
            </Button>
            {status !== 'BANK_LOGIN' && resolvedLenderId ? (
              <Button variant="secondary" loading={recordBankLogin.isPending} disabled={busy} onClick={() => recordBankLogin.mutate()}>
                Record Bank Login
              </Button>
            ) : null}
            <Button variant="primary" loading={approveCredit.isPending} disabled={busy} onClick={() => approveCredit.mutate()}>
              Approve Credit Review
            </Button>
          </>
        ) : null}

        {status === 'CREDIT_REVIEW' && resolvedLenderId ? (
          <Button variant="primary" loading={issueSanction.isPending} disabled={busy} onClick={() => issueSanction.mutate()}>
            Issue Sanction
          </Button>
        ) : null}

        {status === 'SANCTIONED' && resolvedLenderId ? (
          <Button variant="primary" loading={recordDisbursement.isPending} disabled={busy} onClick={() => recordDisbursement.mutate()}>
            Record Disbursement
          </Button>
        ) : null}

        {['DISBURSED', 'CLOSED'].includes(status) ? (
          <span style={{ color: 'var(--color-success)', fontWeight: 600 }}>Loan disbursed — file complete</span>
        ) : null}

        {!['DISBURSED', 'CLOSED', 'REJECTED'].includes(status) ? (
          <Button variant="danger" loading={rejectApp.isPending} disabled={busy} onClick={() => rejectApp.mutate()}>
            Reject
          </Button>
        ) : null}
      </div>

      {error ? <p className="form-error" style={{ marginTop: '1rem' }}>{error}</p> : null}

      <p style={{ marginTop: '1rem', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
        Pipeline: Submit → Review → Eligibility / Bank Login → Credit Review → Sanction → Disbursement. Linked CRM lead status updates automatically.
      </p>
    </Card>
  );
}
