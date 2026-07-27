import { useMutation } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import '../loan-fulfillment.css';
import { PRODUCT_OPTIONS } from '../data/stages';
import type { CreateLoanCaseInput, LoanFulfillmentProduct } from '../data/types';

import { Button, Card, Input, PageHeader, Select } from '@/components/ui';
import { getApiErrorMessage } from '@/lib/utils';
import { loanFulfillmentService } from '@/services/index';

interface FormState {
  product: LoanFulfillmentProduct | '';
  lenderName: string;
  branchName: string;
  customerName: string;
  mobile: string;
  email: string;
  pan: string;
  occupation: string;
  employer: string;
  annualIncome: string;
  propertyAddress: string;
  city: string;
  state: string;
  referralSource: string;
  projectName: string;
  loanAmount: string;
  requestedAmount: string;
  partnerId: string;
  relationshipManagerId: string;
  salesEmployeeId: string;
  remarks: string;
}

const INITIAL: FormState = {
  product: '',
  lenderName: '',
  branchName: '',
  customerName: '',
  mobile: '',
  email: '',
  pan: '',
  occupation: '',
  employer: '',
  annualIncome: '',
  propertyAddress: '',
  city: '',
  state: '',
  referralSource: '',
  projectName: '',
  loanAmount: '',
  requestedAmount: '',
  partnerId: '',
  relationshipManagerId: '',
  salesEmployeeId: '',
  remarks: '',
};

function validate(form: FormState): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!form.product) errors.product = 'Product is required';
  if (!form.lenderName.trim()) errors.lenderName = 'Lender is required';
  if (!form.customerName.trim()) errors.customerName = 'Customer name is required';
  if (!form.mobile.trim() || form.mobile.trim().length < 8) errors.mobile = 'Valid mobile is required';
  if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
    errors.email = 'Invalid email';
  }
  const loanAmount = Number(form.loanAmount);
  const requestedAmount = Number(form.requestedAmount);
  if (!Number.isFinite(loanAmount) || loanAmount <= 0) errors.loanAmount = 'Loan amount must be positive';
  if (!Number.isFinite(requestedAmount) || requestedAmount <= 0) {
    errors.requestedAmount = 'Requested amount must be positive';
  }
  return errors;
}

export function CreateLoanCasePage() {
  const navigate = useNavigate();
  const [form, setForm] = useState<FormState>(INITIAL);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState(false);

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const create = useMutation({
    mutationFn: (payload: CreateLoanCaseInput) => loanFulfillmentService.createCase(payload),
    onSuccess: (data) => navigate(`/loan-fulfillment/cases/${data.id}`),
  });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    const nextErrors = validate(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    const payload: CreateLoanCaseInput = {
      product: form.product as LoanFulfillmentProduct,
      lenderName: form.lenderName.trim(),
      customerName: form.customerName.trim(),
      mobile: form.mobile.trim(),
      loanAmount: Number(form.loanAmount),
      requestedAmount: Number(form.requestedAmount),
    };

    if (form.branchName.trim()) payload.branchName = form.branchName.trim();
    if (form.email.trim()) payload.email = form.email.trim();
    if (form.pan.trim()) payload.pan = form.pan.trim().toUpperCase();
    if (form.occupation.trim()) payload.occupation = form.occupation.trim();
    if (form.employer.trim()) payload.employer = form.employer.trim();
    if (form.annualIncome.trim()) payload.annualIncome = Number(form.annualIncome);
    if (form.propertyAddress.trim()) payload.propertyAddress = form.propertyAddress.trim();
    if (form.city.trim()) payload.city = form.city.trim();
    if (form.state.trim()) payload.state = form.state.trim();
    if (form.referralSource.trim()) payload.referralSource = form.referralSource.trim();
    if (form.projectName.trim()) payload.projectName = form.projectName.trim();
    if (form.partnerId.trim()) payload.partnerId = form.partnerId.trim();
    if (form.relationshipManagerId.trim()) payload.relationshipManagerId = form.relationshipManagerId.trim();
    if (form.salesEmployeeId.trim()) payload.salesEmployeeId = form.salesEmployeeId.trim();
    if (form.remarks.trim()) payload.remarks = form.remarks.trim();

    create.mutate(payload);
  };

  const show = (key: string) => (touched && errors[key] ? errors[key] : undefined);

  return (
    <div className="page-container loan-fulfillment">
      <PageHeader
        title="Create Loan Case"
        subtitle="Start a new fulfillment journey for a customer"
        actions={
          <Button type="button" variant="ghost" onClick={() => navigate('/loan-fulfillment/cases')}>
            <ArrowLeft size={16} style={{ marginRight: 6 }} />
            Back to cases
          </Button>
        }
      />

      <form onSubmit={onSubmit}>
        {create.error ? (
          <div className="alert alert-error" style={{ marginBottom: '1rem' }}>
            {getApiErrorMessage(create.error)}
          </div>
        ) : null}

        <div className="lf-form-grid">
          <Card title="Product & lender">
            <div className="lf-form-section">
              <Select
                label="Product"
                options={[{ value: '', label: 'Select product' }, ...PRODUCT_OPTIONS]}
                value={form.product}
                onChange={(e) => setField('product', e.target.value as LoanFulfillmentProduct | '')}
              />
              {show('product') ? <p className="form-error">{show('product')}</p> : null}
              <Input
                label="Lender name"
                value={form.lenderName}
                onChange={(e) => setField('lenderName', e.target.value)}
              />
              {show('lenderName') ? <p className="form-error">{show('lenderName')}</p> : null}
              <Input
                label="Branch (optional)"
                value={form.branchName}
                onChange={(e) => setField('branchName', e.target.value)}
              />
              <Input
                label="Project name (optional)"
                value={form.projectName}
                onChange={(e) => setField('projectName', e.target.value)}
              />
              <Input
                label="Referral source (optional)"
                value={form.referralSource}
                onChange={(e) => setField('referralSource', e.target.value)}
              />
            </div>
          </Card>

          <Card title="Customer">
            <div className="lf-form-section">
              <Input
                label="Customer name"
                value={form.customerName}
                onChange={(e) => setField('customerName', e.target.value)}
              />
              {show('customerName') ? <p className="form-error">{show('customerName')}</p> : null}
              <Input
                label="Mobile"
                value={form.mobile}
                onChange={(e) => setField('mobile', e.target.value)}
              />
              {show('mobile') ? <p className="form-error">{show('mobile')}</p> : null}
              <Input
                label="Email (optional)"
                value={form.email}
                onChange={(e) => setField('email', e.target.value)}
              />
              {show('email') ? <p className="form-error">{show('email')}</p> : null}
              <Input label="PAN (optional)" value={form.pan} onChange={(e) => setField('pan', e.target.value)} />
              <Input
                label="Occupation (optional)"
                value={form.occupation}
                onChange={(e) => setField('occupation', e.target.value)}
              />
              <Input
                label="Employer (optional)"
                value={form.employer}
                onChange={(e) => setField('employer', e.target.value)}
              />
              <Input
                label="Annual income (optional)"
                type="number"
                value={form.annualIncome}
                onChange={(e) => setField('annualIncome', e.target.value)}
              />
              <Input
                label="City (optional)"
                value={form.city}
                onChange={(e) => setField('city', e.target.value)}
              />
              <Input
                label="State (optional)"
                value={form.state}
                onChange={(e) => setField('state', e.target.value)}
              />
              <label className="form-label" htmlFor="lf-property">
                Property address (optional)
              </label>
              <textarea
                id="lf-property"
                className="form-textarea"
                rows={2}
                value={form.propertyAddress}
                onChange={(e) => setField('propertyAddress', e.target.value)}
              />
            </div>
          </Card>

          <Card title="Loan amounts">
            <div className="lf-form-section">
              <Input
                label="Loan amount"
                type="number"
                value={form.loanAmount}
                onChange={(e) => setField('loanAmount', e.target.value)}
              />
              {show('loanAmount') ? <p className="form-error">{show('loanAmount')}</p> : null}
              <Input
                label="Requested amount"
                type="number"
                value={form.requestedAmount}
                onChange={(e) => setField('requestedAmount', e.target.value)}
              />
              {show('requestedAmount') ? <p className="form-error">{show('requestedAmount')}</p> : null}
            </div>
          </Card>

          <Card title="Assignment (optional)">
            <div className="lf-form-section">
              <Input
                label="Partner ID"
                value={form.partnerId}
                onChange={(e) => setField('partnerId', e.target.value)}
              />
              <Input
                label="Relationship manager ID"
                value={form.relationshipManagerId}
                onChange={(e) => setField('relationshipManagerId', e.target.value)}
              />
              <Input
                label="Sales employee ID"
                value={form.salesEmployeeId}
                onChange={(e) => setField('salesEmployeeId', e.target.value)}
              />
              <label className="form-label" htmlFor="lf-remarks">
                Remarks
              </label>
              <textarea
                id="lf-remarks"
                className="form-textarea"
                rows={3}
                value={form.remarks}
                onChange={(e) => setField('remarks', e.target.value)}
              />
            </div>
          </Card>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
          <Button type="submit" loading={create.isPending}>
            Create case
          </Button>
          <Button type="button" variant="secondary" onClick={() => navigate('/loan-fulfillment/cases')}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
