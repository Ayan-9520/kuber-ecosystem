export function isCustomerProfileIncomplete(customer: Record<string, unknown>): boolean {
  const pct = Number(customer.profileCompletionPct ?? 0);
  if (pct > 0 && pct < 100) return true;
  const firstName = String(customer.firstName ?? '').trim();
  return !firstName;
}
