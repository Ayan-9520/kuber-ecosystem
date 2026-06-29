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
  BUSINESS_DOCUMENT: 'Business Document',
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
  'business document': 'BUSINESS_DOCUMENT',
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
    const byMapped = types.find((t) => String(t.code).toUpperCase() === mappedCode);
    if (byMapped) return byMapped;
    const altCodes =
      mappedCode === 'INCOME_PROOF' ? ['SALARY_SLIP', 'INCOME_PROOF'] : [mappedCode];
    for (const code of altCodes) {
      const match = types.find((t) => String(t.code).toUpperCase() === code);
      if (match) return match;
    }
  }

  const asCode = trimmed.toUpperCase().replace(/\s+/g, '_');
  const byCode = types.find((t) => String(t.code).toUpperCase() === asCode);
  if (byCode) return byCode;

  const firstWord = normalized.split(/\s+/)[0] ?? normalized;
  return (
    types.find((t) => String(t.name).toLowerCase() === normalized) ??
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
