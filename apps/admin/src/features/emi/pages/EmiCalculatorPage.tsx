import {
  buildAmortizationYearSummary,
  buildEmiBreakdown,
  tenureMonthsFromParts,
} from '@kuberone/shared-utils';
import { useMemo, useState } from 'react';

import { Button, Card, Input, PageHeader, StatCard } from '@/components/ui';
import { formatCurrency } from '@/lib/utils';

const TENURE_PRESETS = [
  { label: '5 years', years: 5, months: 0 },
  { label: '10 years', years: 10, months: 0 },
  { label: '15 years', years: 15, months: 0 },
  { label: '20 years', years: 20, months: 0 },
  { label: '25 years', years: 25, months: 0 },
  { label: '30 years', years: 30, months: 0 },
] as const;

export function EmiCalculatorPage() {
  const [form, setForm] = useState({
    loanAmount: '2500000',
    interestRate: '9.5',
    tenureYears: '20',
    tenureMonthsExtra: '0',
    processingFee: '0',
  });
  const [showResult, setShowResult] = useState(false);
  const [error, setError] = useState('');

  const result = useMemo(() => {
    if (!showResult) return null;

    const amount = Number(form.loanAmount);
    const rate = Number(form.interestRate);
    const tenure = tenureMonthsFromParts(Number(form.tenureYears), Number(form.tenureMonthsExtra));
    const fee = Number(form.processingFee || 0);

    if (amount <= 0 || rate < 0 || tenure <= 0) return null;

    const breakdown = buildEmiBreakdown(amount, rate, tenure, fee);
    return {
      ...breakdown,
      tenureMonths: tenure,
      amortizationSummary: buildAmortizationYearSummary(amount, rate, tenure),
    };
  }, [showResult, form]);

  const handleCalculate = () => {
    const amount = Number(form.loanAmount);
    const rate = Number(form.interestRate);
    const tenure = tenureMonthsFromParts(Number(form.tenureYears), Number(form.tenureMonthsExtra));

    if (amount <= 0) {
      setError('Enter a valid loan amount');
      setShowResult(false);
      return;
    }
    if (rate < 0 || rate > 100) {
      setError('Interest rate must be between 0 and 100%');
      setShowResult(false);
      return;
    }
    if (tenure <= 0 || tenure > 480) {
      setError('Tenure must be between 1 month and 40 years');
      setShowResult(false);
      return;
    }

    setError('');
    setShowResult(true);
  };

  const amortization = result?.amortizationSummary ?? [];

  return (
    <div className="page-container">
      <PageHeader
        title="EMI Calculator"
        subtitle="Reducing balance · monthly rest · EMI rounded to nearest rupee (Indian standard)"
      />

      <Card title="Loan Parameters" className="mb-4">
        <div className="form-grid">
          <Input
            label="Loan Amount (₹)"
            value={form.loanAmount}
            onChange={(e) => {
              setForm({ ...form, loanAmount: e.target.value });
              setShowResult(false);
            }}
            type="number"
          />
          <Input
            label="Interest Rate (% p.a.)"
            value={form.interestRate}
            onChange={(e) => {
              setForm({ ...form, interestRate: e.target.value });
              setShowResult(false);
            }}
            type="number"
            step="0.01"
          />

          <div>
            <p className="text-muted" style={{ fontSize: '0.85rem', marginBottom: '0.5rem' }}>
              Quick tenure
            </p>
            <div className="btn-row">
              {TENURE_PRESETS.map((preset) => (
                <Button
                  key={preset.label}
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setForm({
                      ...form,
                      tenureYears: String(preset.years),
                      tenureMonthsExtra: String(preset.months),
                    });
                    setShowResult(false);
                  }}
                >
                  {preset.label}
                </Button>
              ))}
            </div>
          </div>

          <div className="grid-2">
            <Input
              label="Tenure (years)"
              value={form.tenureYears}
              onChange={(e) => {
                setForm({ ...form, tenureYears: e.target.value });
                setShowResult(false);
              }}
              type="number"
            />
            <Input
              label="Extra months"
              value={form.tenureMonthsExtra}
              onChange={(e) => {
                setForm({ ...form, tenureMonthsExtra: e.target.value });
                setShowResult(false);
              }}
              type="number"
            />
          </div>

          <Input
            label="Processing Fee (₹) — optional"
            value={form.processingFee}
            onChange={(e) => {
              setForm({ ...form, processingFee: e.target.value });
              setShowResult(false);
            }}
            type="number"
          />

          <div>
            <Button variant="primary" onClick={handleCalculate}>
              Calculate EMI
            </Button>
          </div>
          {error && (
            <p className="text-error" style={{ color: 'var(--color-danger)' }}>
              {error}
            </p>
          )}
        </div>
      </Card>

      {result && (
        <>
          <div className="stat-grid">
            <StatCard label="Monthly EMI" value={formatCurrency(result.emi)} />
            <StatCard label="Total Interest" value={formatCurrency(result.interestPayable)} />
            <StatCard label="Total Repayment" value={formatCurrency(result.totalRepayment)} />
            <StatCard label="Total Cost (incl. fee)" value={formatCurrency(result.totalCost)} />
          </div>

          {amortization.length > 0 && (
            <Card title="Year-wise Amortization">
              <div className="data-table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Year</th>
                      <th>Principal Paid</th>
                      <th>Interest Paid</th>
                      <th>Outstanding</th>
                    </tr>
                  </thead>
                  <tbody>
                    {amortization.map((row) => (
                      <tr key={row.year}>
                        <td>{row.year}</td>
                        <td>{formatCurrency(row.principalPaid)}</td>
                        <td>{formatCurrency(row.interestPaid)}</td>
                        <td>{formatCurrency(row.outstandingBalance)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
