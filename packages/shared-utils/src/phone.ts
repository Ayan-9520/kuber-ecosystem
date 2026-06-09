const INDIAN_MOBILE_REGEX = /^[6-9]\d{9}$/;

export function normalizeIndianPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) {
    return digits.slice(2);
  }
  if (digits.length === 10) {
    return digits;
  }
  return digits;
}

export function isValidIndianMobile(phone: string): boolean {
  return INDIAN_MOBILE_REGEX.test(normalizeIndianPhone(phone));
}

export function toE164Indian(phone: string): string {
  return `+91${normalizeIndianPhone(phone)}`;
}
