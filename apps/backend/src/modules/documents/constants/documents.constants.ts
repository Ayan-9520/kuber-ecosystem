export const DOCUMENT_TYPE_CODES = {
  PAN: 'PAN',
  AADHAAR: 'AADHAAR',
  BANK_STATEMENT: 'BANK_STATEMENT',
  SALARY_SLIP: 'SALARY_SLIP',
  ITR: 'ITR',
  GST: 'GST',
  PROPERTY_DOCUMENT: 'PROPERTY_DOCUMENT',
  VEHICLE_DOCUMENT: 'VEHICLE_DOCUMENT',
  BUSINESS_DOCUMENT: 'BUSINESS_DOCUMENT',
  PHOTO: 'PHOTO',
  SIGNATURE: 'SIGNATURE',
  CHEQUE: 'CHEQUE',
} as const;

export const DEFAULT_MIME_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];

export const SIGNED_URL_EXPIRY_SECONDS = 900;

export const PAN_REGEX = /[A-Z]{5}[0-9]{4}[A-Z]/;
export const AADHAAR_REGEX = /\b[2-9]\d{3}\s?\d{4}\s?\d{4}\b/;
export const GST_REGEX = /\d{2}[A-Z]{5}\d{4}[A-Z][A-Z0-9]Z[A-Z0-9]/;
export const VEHICLE_REGEX = /[A-Z]{2}[0-9]{1,2}[A-Z]{1,3}[0-9]{1,4}/;
