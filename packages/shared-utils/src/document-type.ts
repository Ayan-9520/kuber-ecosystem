/** Human-readable labels for seeded document type codes. */
export const DOCUMENT_TYPE_DISPLAY_LABELS: Record<string, string> = {
  PAN: 'PAN',
  AADHAAR: 'Aadhaar',
  BANK_STATEMENT: 'Bank Statement',
  SALARY_SLIP: 'Salary Slip',
  INCOME_PROOF: 'Income Proof',
  ITR: 'Income Tax Return',
  GST: 'GST Certificate',
  PROPERTY_DOCUMENT: 'Property Document',
  VEHICLE_DOCUMENT: 'Vehicle Document',
  VEHICLE_RC: 'Vehicle RC',
  INVOICE: 'Invoice / Proforma',
  BUSINESS_DOCUMENT: 'Business Document',
  BUSINESS_PROOF: 'Business Proof',
  MACHINE_QUOTATION: 'Machine Quotation',
  AGE_PROOF: 'Age Proof',
  MEDICAL_REPORT: 'Medical Report',
  PHOTO: 'Photo',
  SIGNATURE: 'Signature',
  CHEQUE: 'Cancelled Cheque',
  ADDRESS_PROOF: 'Address Proof',
};

/** Map wizard / checklist labels to backend document type codes. */
const LABEL_TO_CODE: Record<string, string> = {
  pan: 'PAN',
  'pan card': 'PAN',
  aadhaar: 'AADHAAR',
  'aadhaar card': 'AADHAAR',
  'bank statements': 'BANK_STATEMENT',
  'bank statement': 'BANK_STATEMENT',
  'income proof': 'INCOME_PROOF',
  'income proofs': 'INCOME_PROOF',
  'salary slip': 'SALARY_SLIP',
  'salary slips': 'SALARY_SLIP',
  itr: 'ITR',
  'income tax return': 'ITR',
  'property documents': 'PROPERTY_DOCUMENT',
  'property document': 'PROPERTY_DOCUMENT',
  'property papers': 'PROPERTY_DOCUMENT',
  'vehicle document': 'VEHICLE_DOCUMENT',
  'vehicle documents': 'VEHICLE_DOCUMENT',
  'rc & insurance': 'VEHICLE_RC',
  'rc and insurance': 'VEHICLE_RC',
  'vehicle rc': 'VEHICLE_RC',
  rc: 'VEHICLE_RC',
  'invoice / proforma': 'INVOICE',
  'invoice/proforma': 'INVOICE',
  'invoice / rc': 'INVOICE',
  invoice: 'INVOICE',
  proforma: 'INVOICE',
  'business document': 'BUSINESS_DOCUMENT',
  'business proof': 'BUSINESS_PROOF',
  'machine quotation': 'MACHINE_QUOTATION',
  'machinery quotation': 'MACHINE_QUOTATION',
  quotation: 'MACHINE_QUOTATION',
  'age proof': 'AGE_PROOF',
  'medical reports (if applicable)': 'MEDICAL_REPORT',
  'medical reports': 'MEDICAL_REPORT',
  'medical report': 'MEDICAL_REPORT',
  gst: 'GST',
  'gst certificate': 'GST',
  photograph: 'PHOTO',
  photo: 'PHOTO',
  signature: 'SIGNATURE',
  'cancelled cheque': 'CHEQUE',
  cheque: 'CHEQUE',
  'address proof': 'ADDRESS_PROOF',
  'address proofs': 'ADDRESS_PROOF',
};

/** Prefer primary code, then industry fallbacks when a product-specific type is not seeded yet. */
const CODE_FALLBACKS: Record<string, string[]> = {
  MACHINE_QUOTATION: ['MACHINE_QUOTATION', 'BUSINESS_DOCUMENT', 'INVOICE'],
  BUSINESS_PROOF: ['BUSINESS_PROOF', 'BUSINESS_DOCUMENT', 'GST'],
  INVOICE: ['INVOICE', 'VEHICLE_DOCUMENT', 'BUSINESS_DOCUMENT'],
  VEHICLE_RC: ['VEHICLE_RC', 'VEHICLE_DOCUMENT'],
  AGE_PROOF: ['AGE_PROOF', 'AADHAAR', 'ADDRESS_PROOF'],
  MEDICAL_REPORT: ['MEDICAL_REPORT'],
  INCOME_PROOF: ['INCOME_PROOF', 'SALARY_SLIP'],
};

function codeToLabel(code: string): string {
  const upper = code.trim().toUpperCase();
  return DOCUMENT_TYPE_DISPLAY_LABELS[upper] ?? upper.replace(/_/g, ' ');
}

function objectTypeLabel(value: Record<string, unknown>): string | undefined {
  const nested = value.documentType;
  if (nested && typeof nested === 'object' && !Array.isArray(nested)) {
    const nestedLabel = objectTypeLabel(nested as Record<string, unknown>);
    if (nestedLabel) return nestedLabel;
  }

  const name = value.name;
  if (typeof name === 'string' && name.trim()) return name.trim();
  const code = value.code;
  if (typeof code === 'string' && code.trim()) return codeToLabel(code);
  const label = value.label ?? value.title ?? value.typeName ?? value.documentTypeName;
  if (typeof label === 'string' && label.trim()) return label.trim();
  const documentTypeCode = value.documentTypeCode;
  if (typeof documentTypeCode === 'string' && documentTypeCode.trim()) {
    return codeToLabel(documentTypeCode);
  }
  return undefined;
}

/**
 * Format a document type for display (never returns "[object Object]").
 */
export function formatDocumentTypeLabel(
  value: unknown,
  row?: Record<string, unknown>,
): string {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    const fromObject = objectTypeLabel(value as Record<string, unknown>);
    if (fromObject) return fromObject;
  }

  if (typeof value === 'string' && value.trim()) {
    const trimmed = value.trim();
    if (trimmed.startsWith('[object')) return 'Unknown Document';
    if (/^[A-Z][A-Z0-9_]*$/.test(trimmed)) return codeToLabel(trimmed);
    return trimmed;
  }

  if (row) {
    const fallbacks = [
      row.documentTypeName,
      row.typeName,
      row.documentTypeCode,
      row.type,
    ];
    for (const candidate of fallbacks) {
      const label = formatDocumentTypeLabel(candidate);
      if (label !== 'Unknown Document') return label;
    }
    const nested = row.documentType;
    if (nested && nested !== value) {
      const label = formatDocumentTypeLabel(nested, row);
      if (label !== 'Unknown Document') return label;
    }
  }

  return 'Unknown Document';
}

function findTypeByCodes(
  types: Array<Record<string, unknown>>,
  codes: string[],
): Record<string, unknown> | undefined {
  for (const code of codes) {
    const match = types.find((t) => String(t.code).toUpperCase() === code);
    if (match) return match;
  }
  return undefined;
}

/** Resolve a checklist label to a document type record from API list. */
export function resolveDocumentTypeForLabel(
  label: string,
  types: Array<Record<string, unknown>>,
): Record<string, unknown> | undefined {
  const trimmed = label.trim();
  if (!trimmed || types.length === 0) return undefined;

  const normalized = trimmed.toLowerCase();
  const mappedCode = LABEL_TO_CODE[normalized];
  if (mappedCode) {
    const codes = CODE_FALLBACKS[mappedCode] ?? [mappedCode];
    const byMapped = findTypeByCodes(types, codes);
    if (byMapped) return byMapped;
  }

  const asCode = trimmed.toUpperCase().replace(/\s+/g, '_');
  const byCode = types.find((t) => String(t.code).toUpperCase() === asCode);
  if (byCode) return byCode;

  const firstWord = normalized.split(/\s+/)[0] ?? normalized;
  return (
    types.find((t) => String(t.name).toLowerCase() === normalized) ??
    types.find((t) => String(t.name).toLowerCase().includes(normalized)) ??
    types.find((t) => String(t.name).toLowerCase().includes(firstWord)) ??
    types.find((t) => String(t.code).toLowerCase().includes(firstWord))
  );
}

/** Display label for a checklist row when type id is not yet resolved. */
export function formatDocumentChecklistLabel(label: string): string {
  const normalized = label.trim().toLowerCase();
  const code = LABEL_TO_CODE[normalized] ?? label.trim().toUpperCase().replace(/\s+/g, '_');
  return DOCUMENT_TYPE_DISPLAY_LABELS[code] ?? label.trim();
}
