// Card logic helpers

export function formatCardNumber(value: string) {
  return value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim();
}

export function handleCardNumberChange(val: string, setCardNumber: (val: string) => void) {
  // Only keep digits, max 16
  const digits = val.replace(/\D/g, '').slice(0, 16);
  setCardNumber(digits);
}

export function getMonthOptions() {
  return Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
}

export function getYearOptions(currentYear: number = new Date().getFullYear()) {
  return Array.from({ length: 21 }, (_, i) => String(currentYear + i));
} 