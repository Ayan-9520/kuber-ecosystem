export {
  formatDocumentChecklistLabel,
  formatDocumentTypeLabel,
  resolveDocumentTypeForLabel,
} from '@kuberone/shared-utils';

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
