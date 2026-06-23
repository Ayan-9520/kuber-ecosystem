/** Map wizard checklist labels to seeded document type codes. */
const LABEL_TO_CODE: Record<string, string> = {
  pan: 'PAN',
  'pan card': 'PAN',
  aadhaar: 'AADHAAR',
  'aadhaar card': 'AADHAAR',
  'bank statements': 'BANK_STATEMENT',
  'bank statement': 'BANK_STATEMENT',
  'income proof': 'SALARY_SLIP',
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
};

export function resolveDocumentTypeForLabel(
  label: string,
  types: Array<Record<string, unknown>>,
): Record<string, unknown> | undefined {
  const normalized = label.trim().toLowerCase();
  const code = LABEL_TO_CODE[normalized];
  if (code) {
    const byCode = types.find((t) => String(t.code).toUpperCase() === code);
    if (byCode) return byCode;
  }

  const firstWord = normalized.split(/\s+/)[0] ?? normalized;
  return (
    types.find((t) => String(t.name).toLowerCase() === normalized) ??
    types.find((t) => String(t.name).toLowerCase().includes(firstWord)) ??
    types.find((t) => String(t.code).toLowerCase().includes(firstWord))
  );
}

export const MIME_MAP: Record<string, string> = {
  pdf: 'application/pdf',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  heic: 'image/heic',
};

export function guessMimeType(fileName: string, fallback?: string): string {
  const ext = fileName.split('.').pop()?.toLowerCase() ?? '';
  const fromExt = MIME_MAP[ext];
  const raw = (fallback?.trim() || fromExt || 'application/octet-stream').toLowerCase();
  if (raw === 'image/jpg' || raw === 'image/pjpeg') return 'image/jpeg';
  return raw;
}
