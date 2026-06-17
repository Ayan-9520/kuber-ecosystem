const HTML_TAG_PATTERN = /<[^>]*>/g;
const SCRIPT_PATTERN = /javascript:/gi;
const EVENT_HANDLER_PATTERN = /\bon\w+\s*=/gi;

export function stripHtml(input: string): string {
  return input.replace(HTML_TAG_PATTERN, '').replace(SCRIPT_PATTERN, '').replace(EVENT_HANDLER_PATTERN, '');
}

export function sanitizePlainText(input: string, maxLength = 10_000): string {
  return stripHtml(input).trim().slice(0, maxLength);
}

export function sanitizeObjectStrings<T extends Record<string, unknown>>(obj: T, maxLength = 10_000): T {
  const result = { ...obj };
  for (const key of Object.keys(result)) {
    const val = result[key];
    if (typeof val === 'string') {
      (result as Record<string, unknown>)[key] = sanitizePlainText(val, maxLength);
    }
  }
  return result;
}
