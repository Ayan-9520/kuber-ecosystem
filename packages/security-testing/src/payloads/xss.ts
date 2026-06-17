/** XSS probe payloads for CRM / content surfaces */
export const STORED_XSS_PAYLOADS = [
  '<script>alert(1)</script>',
  '<img src=x onerror=alert(1)>',
  'javascript:alert(1)',
  '<svg onload=alert(1)>',
  '"><script>alert(String.fromCharCode(88,83,83))</script>',
];

export const REFLECTED_XSS_PAYLOADS = [
  '<script>document.cookie</script>',
  '{{constructor.constructor("alert(1)")()}}',
  '<iframe src="javascript:alert(1)">',
];

/** Theme / CSS injection probes */
export const THEME_INJECTION_PAYLOADS = [
  '"; background: url(javascript:alert(1)); "',
  '</style><script>alert(1)</script>',
  '@import url("http://evil.com/xss.css");',
];

export function containsRawScriptTag(value: string): boolean {
  return /<script[\s>]/i.test(value) || /javascript:/i.test(value) || /on\w+\s*=/i.test(value);
}
