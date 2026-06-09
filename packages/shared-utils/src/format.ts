export function formatCurrency(amount: number, currency = 'INR'): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: Date | string, locale = 'en-IN'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(d);
}

export function maskPhone(phone: string): string {
  if (phone.length < 4) return '****';
  return `${phone.slice(0, 2)}******${phone.slice(-2)}`;
}

export function maskPan(pan: string): string {
  if (pan.length < 4) return '****';
  return `${pan.slice(0, 2)}****${pan.slice(-2)}`;
}
