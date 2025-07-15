// Represents a credit card expiration date (month and year only)
export interface ExpirationDate {
  month: number; // 1-12
  year: number;  // Full year (e.g., 2027)
}

// Utility functions for ExpirationDate
export const createExpirationDate = (month: number, year: number): ExpirationDate => ({
  month: Math.max(1, Math.min(12, month)), // Ensure 1-12
  year: Math.max(2000, year), // Ensure reasonable year
});

export const formatExpirationDate = (expDate: ExpirationDate): string => {
  const month = String(expDate.month).padStart(2, '0');
  const year = String(expDate.year).slice(-2); // Get last 2 digits
  return `${month}/${year}`;
};

export const parseExpirationDate = (dateString: string): ExpirationDate | null => {
  const match = dateString.match(/^(0[1-9]|1[0-2])\/(\d{2})$/);
  if (!match) return null;
  
  const month = parseInt(match[1], 10);
  const year = parseInt('20' + match[2], 10);
  
  return createExpirationDate(month, year);
};

export const isExpirationDateValid = (expDate: ExpirationDate): boolean => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1; // getMonth() returns 0-11
  
  return expDate.year > currentYear || 
         (expDate.year === currentYear && expDate.month >= currentMonth);
}; 