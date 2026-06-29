import { formatDocumentTypeLabel } from '@kuberone/shared-utils';

export { formatDocumentTypeLabel };

/** @deprecated Use formatDocumentTypeLabel from @kuberone/shared-utils */
export function documentTypeLabel(row: Record<string, unknown>): string {
  return formatDocumentTypeLabel(
    row.documentTypeName ??
      row.documentTypeCode ??
      row.typeName ??
      row.documentType ??
      row.type,
    row,
  );
}
