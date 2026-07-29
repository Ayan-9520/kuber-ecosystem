export type LenderApplicationStatus =
  | 'SUBMITTED'
  | 'PROCESSING'
  | 'APPROVED'
  | 'REJECTED'
  | 'DISBURSED';

export interface LenderApplication {
  externalRefId: string;
  status: LenderApplicationStatus;
  lenderName: string;
  remarks?: string;
  sanctionAmount?: number;
  sanctionDate?: string;
  disbursementAmount?: number;
  disbursementDate?: string;
}

export interface SubmitApplicationParams {
  applicantName: string;
  phone: string;
  email?: string;
  loanType: string;
  requestedAmount: number;
  propertyValue?: number;
  employmentType?: string;
  monthlyIncome?: number;
  existingObligations?: number;
  metadata?: Record<string, unknown>;
}

export interface LenderConnector {
  readonly lenderCode: string;
  readonly lenderName: string;

  submitApplication(params: SubmitApplicationParams): Promise<LenderApplication>;

  checkStatus(externalRefId: string): Promise<LenderApplication>;

  cancelApplication(externalRefId: string): Promise<{ success: boolean }>;
}
