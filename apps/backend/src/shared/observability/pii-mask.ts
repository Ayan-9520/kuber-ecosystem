const PAN_PATTERN = /\b[2-9]\d{3}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d?\d\b/g;
const AADHAAR_PATTERN = /\b[2-9]\d{3}[\s]?\d{4}[\s]?\d{4}\b/g;
const TOKEN_PATTERN = /(Bearer\s+)[A-Za-z0-9\-._~+/]+=*/gi;
const PASSWORD_KEYS = /password|passwd|secret|token|apikey|api_key|authorization|refresh_token|access_token/i;
const BANK_ACCOUNT_PATTERN = /\b\d{9,18}\b/g;

export function maskString(value: string): string {
  return value
    .replace(PAN_PATTERN, '****PAN****')
    .replace(AADHAAR_PATTERN, '****AADHAAR****')
    .replace(TOKEN_PATTERN, '$1****TOKEN****')
    .replace(BANK_ACCOUNT_PATTERN, '****BANK****');
}

export function maskPii<T>(input: T): T {
  if (input === null || input === undefined) return input;
  if (typeof input === 'string') return maskString(input) as T;
  if (Array.isArray(input)) return input.map((item) => maskPii(item)) as T;
  if (typeof input === 'object') {
    const result: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(input as Record<string, unknown>)) {
      if (PASSWORD_KEYS.test(key)) {
        result[key] = '****REDACTED****';
      } else {
        result[key] = maskPii(val);
      }
    }
    return result as T;
  }
  return input;
}
