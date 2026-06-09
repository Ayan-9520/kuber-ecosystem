export const PRODUCT_FAMILIES = {
  HL: { code: 'HL', name: 'Home Loan', isSecured: true },
  LAP: { code: 'LAP', name: 'Loan Against Property', isSecured: true },
  BL: { code: 'BL', name: 'Business Loan', isSecured: true },
  AL: { code: 'AL', name: 'Auto Loan', isSecured: true },
} as const;

export const VARIANT_CATALOG: Record<string, Array<{ code: string; name: string }>> = {
  HL: [
    { code: 'FRESH', name: 'Home Loan' },
    { code: 'BT', name: 'Home Loan BT' },
    { code: 'TOP_UP', name: 'Home Loan Top-Up' },
    { code: 'BT_TOP_UP', name: 'Home Loan BT + Top-Up' },
  ],
  LAP: [
    { code: 'FRESH', name: 'LAP' },
    { code: 'BT', name: 'LAP BT' },
    { code: 'TOP_UP', name: 'LAP Top-Up' },
    { code: 'BT_TOP_UP', name: 'LAP BT + Top-Up' },
  ],
  BL: [
    { code: 'FRESH', name: 'Business Loan' },
    { code: 'FRESH', name: 'MSME Loan' },
    { code: 'WORKING_CAPITAL', name: 'Working Capital' },
    { code: 'OD', name: 'OD' },
    { code: 'CC', name: 'CC' },
  ],
  AL: [
    { code: 'FRESH', name: 'New Car Loan' },
    { code: 'FRESH', name: 'Used Car Loan' },
    { code: 'FRESH', name: 'Commercial Vehicle Loan' },
    { code: 'FRESH', name: 'EV Loan' },
    { code: 'BT', name: 'Car Loan BT' },
    { code: 'TOP_UP', name: 'Car Loan Top-Up' },
    { code: 'BT_TOP_UP', name: 'Car Refinance' },
  ],
};
