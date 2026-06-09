export const PRODUCT_FAMILIES = {
  HL: { code: 'HL', name: 'Home Loan', isSecured: true },
  LAP: { code: 'LAP', name: 'Loan Against Property', isSecured: true },
  BL: { code: 'BL', name: 'Business Loan', isSecured: false },
  AL: { code: 'AL', name: 'Auto Loan', isSecured: true },
} as const;

export const VARIANT_LABELS: Record<string, string> = {
  FRESH: 'Fresh Loan',
  BT: 'Balance Transfer',
  TOP_UP: 'Top-Up',
  BT_TOP_UP: 'Balance Transfer + Top-Up',
  WORKING_CAPITAL: 'Working Capital Loan',
  OD: 'Overdraft Assistance',
  CC: 'Cash Credit Assistance',
};

export const LENDER_TYPE_LABELS: Record<string, string> = {
  BANK: 'Bank (PSU / Private)',
  NBFC: 'NBFC / Fintech Lender',
  HFC: 'Housing / Vehicle Finance Company',
};
