import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';

import { Button, Card, Input, PageHeader, StatCard } from '@/components/ui';
import { formatCurrency } from '@/lib/utils';
import { emiService } from '@/services';

interface AmortizationYear {
  year: number;
  principalPaid: number;
  interestPaid: number;
  outstandingBalance: number;
}

export function EmiCalculatorPage() {
  const [form, setForm] = useState({
    loanAmount: '2500000',
    interestRate: '9.5',
    tenureMonths: '240',
  });

  const mutation = useMutation({
    mutationFn: () =>
      emiService.calculate({
        loanAmount: Number(form.loanAmount),
        interestRate: Number(form.interestRate),
        tenureMonths: Number(form.tenureMonths),
        includeAmortization: true,
        persist: false,
      }),
  });

  const result = mutation.data;
  const amortization = (result?.amortizationSummary as AmortizationYear[] | undefined) ?? [];

  const handleCalculate = () => {
    const amount = Number(form.loanAmount);
    const rate = Number(form.interestRate);
    const tenure = Number(form.tenureMonths);
    if (amount <= 0 || rate < 0 || tenure <= 0) return;
    mutation.mutate();
  };

  return (
    <div className="page-container">
      <PageHeader title="EMI Calculator" subtitle="Calculate monthly installments and amortization schedules" />

      <Card title="Loan Parameters" className="mb-4">
        <div className="form-grid" style={{ display: 'grid', gap: '1rem', maxWidth: 640 }}>
          <Input
            label="Loan Amount (₹)"
            value={form.loanAmount}
            onChange={(e) => setForm({ ...form, loanAmount: e.target.value })}
            type="number"
          />
          <Input
            label="Interest Rate (% p.a.)"
            value={form.interestRate}
            onChange={(e) => setForm({ ...form, interestRate: e.target.value })}
            type="number"
          />
          <Input
            label="Tenure (months)"
            value={form.tenureMonths}
            onChange={(e) => setForm({ ...form, tenureMonths: e.target.value })}
            type="number"
          />
          <div>
            <Button variant="primary" disabled={mutation.isPending} onClick={handleCalculate}>
              {mutation.isPending ? 'Calculating…' : 'Calculate EMI'}
            </Button>
          </div>
          {mutation.isError && (
            <p className="text-error" style={{ color: 'var(--color-danger)' }}>
              Failed to calculate EMI. Check inputs and try again.
            </p>
          )}
        </div>
      </Card>

      {result && (
        <>
          <div className="stat-grid">
            <StatCard label="Monthly EMI" value={formatCurrency(result.emi as number)} />
            <StatCard label="Total Interest" value={formatCurrency(result.interestPayable as number)} />
            <StatCard label="Total Repayment" value={formatCurrency(result.totalRepayment as number)} />
            <StatCard label="Principal" value={formatCurrency(result.principal as number)} />
          </div>

          {amortization.length > 0 && (
            <Card title="Amortization Summary">
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
