import { documentTypeLabel } from '@/lib/document-utils';

function str(v: unknown): string {
  if (v === null || v === undefined || v === '') return '—';
  if (typeof v === 'object') {
    const obj = v as Record<string, unknown>;
    const nested = obj.fullName ?? obj.name ?? obj.code ?? obj.label ?? obj.title ?? obj.email;
    if (nested != null && nested !== '') return String(nested);
    return '—';
  }
  const asString = String(v);
  if (asString === '[object Object]') return '—';
  return asString;
}

/** Customer name from flat or nested API fields (never raw UUID when name exists). */
export function customerDisplayName(row: Record<string, unknown>): string {
  const nested = row.customer as Record<string, unknown> | undefined;
  const name =
    row.customerName ??
    nested?.fullName ??
    nested?.name ??
    row.customerCode ??
    nested?.customerCode;
  if (name != null && String(name).trim()) return String(name);
  const id = row.customerId ?? nested?.id;
  return id ? String(id) : '—';
}

/** Document type label from flat or nested API fields (never "[object Object]"). */
export function documentTypeDisplay(row: Record<string, unknown>): string {
  return documentTypeLabel(row);
}

/** Human-readable document reference (KFD-xxx), not raw UUID. */
export function documentNumberDisplay(row: Record<string, unknown>): string {
  const code = row.documentCode ?? row.documentNumber;
  if (code != null && String(code).trim()) return String(code);
  const fileName = row.fileName;
  if (typeof fileName === 'string' && fileName.trim()) return fileName.trim();
  return str(row.id);
}
