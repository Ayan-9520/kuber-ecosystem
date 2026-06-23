/** Round to nearest rupee — standard for Indian loan EMI display. */
export function roundRupee(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.round(value);
}

/**
 * Standard reducing-balance EMI (monthly rest).
 * Formula: P × r × (1+r)^n / ((1+r)^n − 1)
 * where r = annualRate / 12 / 100, n = tenure in months.
 */
export function calculateEmiRaw(
  principal: number,
  annualRatePct: number,
  tenureMonths: number,
): number {
  if (principal <= 0 || tenureMonths <= 0) return 0;
  if (annualRatePct === 0) return principal / tenureMonths;

  const monthlyRate = annualRatePct / 12 / 100;
  const factor = Math.pow(1 + monthlyRate, tenureMonths);
  return (principal * monthlyRate * factor) / (factor - 1);
}

/** EMI rounded to nearest rupee (HDFC/SBI-style calculators). */
export function calculateEmi(
  principal: number,
  annualRatePct: number,
  tenureMonths: number,
): number {
  return roundRupee(calculateEmiRaw(principal, annualRatePct, tenureMonths));
}

export interface AmortizationMonthRow {
  month: number;
  emi: number;
  principalPaid: number;
  interestPaid: number;
  outstandingBalance: number;
}

export interface AmortizationYearSummary {
  year: number;
  principalPaid: number;
  interestPaid: number;
  outstandingBalance: number;
}

export interface EmiBreakdown {
  emi: number;
  principal: number;
  interestPayable: number;
  totalRepayment: number;
  processingFee: number;
  totalCost: number;
}

/** Month-wise reducing-balance schedule; last EMI adjusted to clear balance. */
export function buildAmortizationSchedule(
  loanAmount: number,
  annualRatePct: number,
  tenureMonths: number,
): AmortizationMonthRow[] {
  if (loanAmount <= 0 || tenureMonths <= 0) return [];

  const emi = calculateEmi(loanAmount, annualRatePct, tenureMonths);
  const monthlyRate = annualRatePct / 12 / 100;
  let balance = loanAmount;
  const schedule: AmortizationMonthRow[] = [];

  for (let month = 1; month <= tenureMonths; month++) {
    const interestPaid =
      annualRatePct === 0 ? 0 : roundRupee(balance * monthlyRate);
    const isLast = month === tenureMonths;
    const principalPaid = isLast
      ? roundRupee(balance)
      : roundRupee(Math.min(Math.max(emi - interestPaid, 0), balance));
    const monthEmi = isLast ? principalPaid + interestPaid : emi;
    balance = roundRupee(Math.max(balance - principalPaid, 0));

    schedule.push({
      month,
      emi: monthEmi,
      principalPaid,
      interestPaid,
      outstandingBalance: balance,
    });
  }

  return schedule;
}

export function buildAmortizationYearSummary(
  loanAmount: number,
  annualRatePct: number,
  tenureMonths: number,
): AmortizationYearSummary[] {
  const schedule = buildAmortizationSchedule(loanAmount, annualRatePct, tenureMonths);
  if (schedule.length === 0) return [];

  const years = Math.ceil(tenureMonths / 12);
  const summary: AmortizationYearSummary[] = [];

  for (let year = 1; year <= years; year++) {
    const startMonth = (year - 1) * 12;
    const endMonth = Math.min(year * 12, tenureMonths);
    let principalPaid = 0;
    let interestPaid = 0;

    for (let i = startMonth; i < endMonth; i++) {
      principalPaid += schedule[i]!.principalPaid;
      interestPaid += schedule[i]!.interestPaid;
    }

    const lastRow = schedule[endMonth - 1];

    summary.push({
      year,
      principalPaid: roundRupee(principalPaid),
      interestPaid: roundRupee(interestPaid),
      outstandingBalance: lastRow?.outstandingBalance ?? 0,
    });
  }

  return summary;
}

export function buildEmiBreakdown(
  loanAmount: number,
  annualRatePct: number,
  tenureMonths: number,
  processingFee = 0,
): EmiBreakdown {
  const schedule = buildAmortizationSchedule(loanAmount, annualRatePct, tenureMonths);
  const emi = calculateEmi(loanAmount, annualRatePct, tenureMonths);
  const interestPayable = roundRupee(
    schedule.reduce((sum, row) => sum + row.interestPaid, 0),
  );
  const totalRepayment = roundRupee(loanAmount + interestPayable);

  return {
    emi,
    principal: loanAmount,
    interestPayable,
    totalRepayment,
    processingFee: roundRupee(processingFee),
    totalCost: roundRupee(totalRepayment + processingFee),
  };
}

/** Convert years + extra months to total tenure months. */
export function tenureMonthsFromParts(years: number, months: number): number {
  const y = Math.max(0, Math.floor(years));
  const m = Math.max(0, Math.floor(months));
  return y * 12 + m;
}
