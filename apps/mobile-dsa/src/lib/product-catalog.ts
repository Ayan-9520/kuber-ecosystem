/** Flagship products for DSA lead creation pickers. */
export const DSA_PRODUCT_OPTIONS = [
  { code: 'HL-01', label: 'Home Loan' },
  { code: 'LAP-01', label: 'Loan Against Property' },
  { code: 'AL-01', label: 'New Car Loan' },
  { code: 'AL-02', label: 'Used Car Loan' },
  { code: 'PL-01', label: 'Personal Loan' },
  { code: 'BL-01', label: 'Business Loan' },
  { code: 'ML-01', label: 'Machinery Loan' },
  { code: 'INS-01', label: 'Insurance' },
  { code: 'CC-01', label: 'Credit Cards' },
] as const;

export function matchProductOption(
  items: Array<Record<string, unknown>>,
  code: string,
): Record<string, unknown> | undefined {
  const normalized = code.toUpperCase();
  return (
    items.find((p) => String(p.code).toUpperCase() === normalized) ??
    items.find((p) => String(p.name).toLowerCase().includes(normalized.split('-')[0]?.toLowerCase() ?? ''))
  );
}

export function sortProductsForDsa(items: Array<Record<string, unknown>>): Array<Record<string, unknown>> {
  const order = new Map<string, number>(DSA_PRODUCT_OPTIONS.map((entry, index) => [entry.code, index]));
  return [...items].sort((a, b) => {
    const aCode = String(a.code ?? '').toUpperCase();
    const bCode = String(b.code ?? '').toUpperCase();
    return (order.get(aCode) ?? 99) - (order.get(bCode) ?? 99);
  });
}
