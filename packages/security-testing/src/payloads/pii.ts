/** Indian financial PII patterns for leakage detection in responses/logs */
export const PII_SAMPLES = {
  pan: 'ABCDE1234F',
  aadhaar: '123456789012',
  card: '4111111111111111',
  email: 'customer@example.com',
  mobile: '+919876543210',
  ifsc: 'HDFC0001234',
};

export const PII_REGEX = {
  pan: /\b[A-Z]{5}[0-9]{4}[A-Z]\b/,
  aadhaar: /\b\d{12}\b/,
  card: /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/,
  email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/,
  mobile: /\b\+?91[\s-]?\d{10}\b/,
};

export function detectPiiLeakage(text: string): string[] {
  const findings: string[] = [];
  for (const [type, regex] of Object.entries(PII_REGEX)) {
    if (regex.test(text)) findings.push(type);
  }
  return findings;
}
