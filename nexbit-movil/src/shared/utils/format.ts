const currencyFormatter = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
});

export function formatCurrency(value: number): string {
  return currencyFormatter.format(value);
}

function toDate(value: string | number | Date): Date {
  return value instanceof Date ? value : new Date(value);
}

export function formatDate(value: string | number | Date): string {
  return new Intl.DateTimeFormat('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(toDate(value));
}

export function formatShortDate(value: string | number | Date): string {
  return new Intl.DateTimeFormat('es-CO', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(toDate(value));
}

export function formatTime(value: string | number | Date): string {
  return new Intl.DateTimeFormat('es-CO', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(toDate(value));
}

export function formatDateTime(value: string | number | Date): string {
  return new Intl.DateTimeFormat('es-CO', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(toDate(value));
}

export function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, '');
  if (digits.length === 10) {
    return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
  }
  return value;
}
