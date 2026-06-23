import { buildEmiBreakdown } from '@kuberone/shared-utils';

import {
  applicationsService,
  aiService,
  documentsService,
  eligibilityService,
} from '@/services';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: number;
}

export async function processAiMessage(
  message: string,
  context: { customerId?: string; monthlyIncome?: number; creditScore?: number },
): Promise<string> {
  const lower = message.toLowerCase();

  if (lower.includes('emi') || lower.includes('calculate')) {
    const amountMatch = message.match(/(\d[\d,]*)/);
    const amount = amountMatch?.[1] ? parseInt(amountMatch[1].replace(/,/g, ''), 10) : 1000000;
    try {
      const result = buildEmiBreakdown(amount, 9.5, 240, 0);
      return `For ${amount.toLocaleString('en-IN')} at 9.5% over 20 years:\n\n• EMI: ₹${result.emi.toLocaleString('en-IN')}\n• Total interest: ₹${result.interestPayable.toLocaleString('en-IN')}\n• Total repayment: ₹${result.totalRepayment.toLocaleString('en-IN')}\n\nUse the EMI Calculator for custom scenarios.`;
    } catch {
      return 'I could not calculate EMI right now. Please try the EMI Calculator from the home screen.';
    }
  }

  if (lower.includes('eligible') || lower.includes('eligibility')) {
    try {
      const result = await eligibilityService.calculate({
        productSlug: lower.includes('business') ? 'BUSINESS_LOAN' : 'HOME_LOAN',
        monthlyIncome: context.monthlyIncome ?? 80000,
        creditScore: context.creditScore ?? 750,
        age: 32,
        employmentType: 'SALARIED',
        requestedLoanAmount: 3000000,
        requestedTenureMonths: 240,
        customerId: context.customerId,
        persist: false,
      });
      const flags = (result.riskFlags as string[])?.join(', ') || 'None';
      return `Eligibility Result: ${result.outcome}\n\n• Approval probability: ${result.approvalProbability}%\n• Eligible amount: ₹${Number(result.eligibleAmount).toLocaleString('en-IN')}\n• Risk flags: ${flags}\n\nRun a full check in Eligibility Checker for accurate results.`;
    } catch {
      return 'Open Eligibility Checker to run a detailed assessment with your income and loan requirements.';
    }
  }

  if (lower.includes('document') || lower.includes('upload')) {
    try {
      if (context.customerId) {
        const docs = await documentsService.list({ customerId: context.customerId, limit: 5 });
        const pending = docs.items.filter((d) => d.status !== 'VERIFIED').length;
        return `You have ${docs.meta.total} documents on file. ${pending} pending verification.\n\nRequired docs typically include PAN, Aadhaar, income proof, and property/vehicle documents depending on loan type.\n\nGo to Documents tab to upload.`;
      }
    } catch {
      /* fall through */
    }
    return 'Standard documents: PAN, Aadhaar, salary slips/ITR, bank statements. Property loans need property papers. Upload from the Documents section.';
  }

  if (lower.includes('status') || lower.includes('application')) {
    try {
      if (context.customerId) {
        const apps = await applicationsService.list({ customerId: context.customerId, limit: 3 });
        if (apps.items.length === 0) return 'You have no active applications. Browse Products to apply for a loan.';
        const lines = apps.items.map(
          (a) => `• ${a.applicationNumber ?? a.id}: ${a.status}`,
        );
        return `Your recent applications:\n\n${lines.join('\n')}\n\nTap Applications tab for full tracking and timeline.`;
      }
    } catch {
      /* fall through */
    }
    return 'Check your application status in the Applications tab. You can see timeline, bank login, sanction, and disbursement stages.';
  }

  if (lower.includes('recommend') || lower.includes('which loan') || lower.includes('best loan')) {
    try {
      const recs = await aiService.productRecommendations({
        monthlyIncome: context.monthlyIncome ?? 80000,
        creditScore: context.creditScore ?? 750,
        preferredSegment: lower.includes('car') || lower.includes('auto') ? 'AUTO' : 'HOME',
      });
      if (recs.length === 0) return 'Browse our Products section for Home Loan, LAP, Business Loan, Auto Loan, and more.';
      const lines = recs.slice(0, 3).map((r) => `• ${r.productName} — ${r.reason}`);
      return `Based on your profile, I recommend:\n\n${lines.join('\n')}\n\nTap Products to compare features and apply.`;
    } catch {
      return 'Popular options: Home Loan (8.25%+), Personal/Business Loan, Auto Loan, LAP. Visit Products to explore and apply.';
    }
  }

  return `I'm your KuberOne AI Advisor. I can help with:\n\n• Loan recommendations\n• Eligibility checks\n• EMI calculations\n• Application status\n• Document guidance\n\nTry asking "What's my application status?" or "Calculate EMI for 50 lakhs"`;
}
