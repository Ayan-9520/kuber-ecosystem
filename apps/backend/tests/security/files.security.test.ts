import { PATH_TRAVERSAL_PAYLOADS } from '@kuberone/security-testing';

import {
  buildS3Key,
  decodeBase64Content,
  sha256Checksum,
} from '../../src/modules/documents/utils/documents.utils.js';

describe('Security — File Upload & Storage', () => {
  it('sanitizes malicious filenames in S3 keys', () => {
    for (const traversal of PATH_TRAVERSAL_PAYLOADS) {
      const key = buildS3Key('CUSTOMER', 'cust-1', 'PAN', traversal);
      expect(key).not.toContain('../');
      expect(key).not.toContain('..\\');
      expect(key).toMatch(/^documents\//);
    }
  });

  it('rejects path segments in filename via sanitization', () => {
    const key = buildS3Key('CUSTOMER', 'cust-1', 'PAN', '../../etc/passwd.exe');
    expect(key).not.toContain('../');
    expect(key).toContain('passwd.exe');
  });

  it('computes SHA-256 checksum for integrity', () => {
    const buf = Buffer.from('test-document-content');
    const hash = sha256Checksum(buf);
    expect(hash).toHaveLength(64);
    expect(hash).toMatch(/^[a-f0-9]+$/);
    expect(sha256Checksum(buf)).toBe(hash);
  });

  it('decodes base64 without executing content', () => {
    const b64 = Buffer.from('PDF mock content').toString('base64');
    const buf = decodeBase64Content(`data:application/pdf;base64,${b64}`);
    expect(buf.toString()).toBe('PDF mock content');
  });

  it('blocks executable extension in sanitized key name', () => {
    const key = buildS3Key('CUSTOMER', 'c1', 'OTHER', 'malware.exe.sh');
    expect(key).toMatch(/malware\.exe\.sh/);
    expect(key.startsWith('documents/')).toBe(true);
  });
});
