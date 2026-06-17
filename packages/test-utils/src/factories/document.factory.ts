let seq = 1;

export function buildDocument(overrides: Record<string, unknown> = {}) {
  return {
    id: `doc-${seq++}`,
    customerId: 'customer-1',
    applicationId: 'app-1',
    documentTypeId: 'doctype-1',
    fileName: 'pan.pdf',
    mimeType: 'application/pdf',
    status: 'UPLOADED',
    storageKey: `documents/customer-1/pan-${seq}.pdf`,
    uploadedById: 'user-1',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}
