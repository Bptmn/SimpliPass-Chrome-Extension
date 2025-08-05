// cards.ts
// Only pure, stateless helpers should remain here after refactor.

export function formatCardNumber(value: string) {
  return value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim();
}

export function handleCardNumberChange(value: string, setCardNumber: (value: string) => void) {
  const digitsOnly = value.replace(/\D/g, '');
  const truncated = digitsOnly.slice(0, 16);
  setCardNumber(truncated);
}

export function getMonthOptions() {
  return Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
}

export function getYearOptions(currentYear: number = new Date().getFullYear()) {
  return Array.from({ length: 21 }, (_, i) => String(currentYear + i));
}

export function formatCardExpirationDate(date: Date): string {
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yy = String(date.getFullYear()).slice(-2);
  return `${mm}/${yy}`;
}

export function parseCardExpirationDate(exp: string): Date | null {
  if (!exp.match(/^(0[1-9]|1[0-2])\/(\d{2})$/)) return null;
  const [mm, yy] = exp.split('/');
  return new Date(Number('20' + yy), Number(mm) - 1, 1);
} 