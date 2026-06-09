export function buildPaginationMeta(page: number, limit: number, total: number) {
  return { page, limit, total, totalPages: Math.ceil(total / limit) || 1 };
}

export function renderTemplateString(text: string, variables: Record<string, unknown> = {}): string {
  return renderTemplate(text, variables);
}

export function pct(part: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((part / total) * 1000) / 10;
}

export function renderTemplate(text: string, variables: Record<string, unknown> = {}): string {
  return text.replace(/\{\{(\w+)\}\}/g, (_, key: string) => {
    const val = variables[key];
    return val !== undefined && val !== null ? String(val) : '';
  });
}

export function isInDoNotDisturb(muteUntil?: Date | null, doNotDisturb?: boolean): boolean {
  if (doNotDisturb) return true;
  if (muteUntil && muteUntil.getTime() > Date.now()) return true;
  return false;
}
