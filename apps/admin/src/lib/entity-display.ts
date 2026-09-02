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

/** Partner or customer label for document list/detail (real CRM owner column). */
export function documentOwnerDisplay(row: Record<string, unknown>): string {
  const ownerType = String(row.ownerType ?? '');
  if (ownerType === 'PARTNER') {
    const flat = row.ownerDisplayName ?? row.partnerName;
    if (flat != null && String(flat).trim()) return String(flat);
    const nested = row.partner as Record<string, unknown> | undefined;
    const name =
      nested?.contactName ??
      nested?.businessName ??
      row.partnerCode ??
      nested?.partnerCode;
    if (name != null && String(name).trim()) {
      const code = row.partnerCode ?? nested?.partnerCode;
      return code ? `${name} (${code})` : String(name);
    }
    return row.partnerId ? String(row.partnerId) : '—';
  }
  const customer = customerDisplayName(row);
  return customer !== '—' ? customer : '—';
}

export function documentOwnerTypeLabel(row: Record<string, unknown>): string {
  const ownerType = String(row.ownerType ?? 'CUSTOMER');
  if (ownerType === 'PARTNER') return 'Partner';
  if (ownerType === 'CUSTOMER') return 'Customer';
  if (ownerType === 'APPLICATION') return 'Application';
  return ownerType.replace(/_/g, ' ');
}

export function applicationDisplay(row: Record<string, unknown>): string {
  const num = row.applicationNumber ?? (row.application as Record<string, unknown> | undefined)?.applicationNumber;
  if (num != null && String(num).trim()) return String(num);
  return row.applicationId ? String(row.applicationId) : '—';
}

export function fileSizeDisplay(row: Record<string, unknown>): string {
  const raw = row.fileSize ?? row.fileSizeBytes;
  if (raw == null || raw === '') return '—';
  const bytes = Number(raw);
  if (!Number.isFinite(bytes) || bytes <= 0) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
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
