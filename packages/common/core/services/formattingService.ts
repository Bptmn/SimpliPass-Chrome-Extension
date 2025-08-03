// formattingService.ts
// This service contains all business logic for data formatting across the application.
// Responsibilities:
// - Card number formatting and masking
// - Date formatting
// - Text formatting and sanitization
// - Display formatting utilities

// ===== Card Formatting Service =====

export const cardFormattingService = {
  /**
   * Formats card number with spaces every 4 digits
   */
  formatCardNumber: (number: string): string => {
    const cleaned = number.replace(/\s/g, '');
    return cleaned.replace(/(\d{4})/g, '$1 ').trim();
  },

  /**
   * Masks card number showing only last 4 digits
   */
  maskCardNumber: (number: string): string => {
    if (!number || number.length < 4) {
      return '**** **** **** ****';
    }
    
    const lastFour = number.slice(-4);
    return `**** **** **** ${lastFour}`;
  },

  /**
   * Formats expiration date as MM/YY
   */
  formatExpirationDate: (date: string): string => {
    const cleaned = date.replace(/\D/g, '');
    
    if (cleaned.length >= 2) {
      const month = cleaned.slice(0, 2);
      const year = cleaned.slice(2, 4);
      return `${month}/${year}`;
    }
    
    return cleaned;
  },

  /**
   * Formats cardholder name (capitalize first letters)
   */
  formatCardholderName: (name: string): string => {
    return name
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  },

  /**
   * Formats CVV (numeric only)
   */
  formatCVV: (cvv: string): string => {
    return cvv.replace(/\D/g, '');
  },

  /**
   * Gets card type from card number
   */
  getCardType: (number: string): string => {
    const cleaned = number.replace(/\s/g, '');
    
    // Visa
    if (/^4/.test(cleaned)) {
      return 'visa';
    }
    
    // Mastercard
    if (/^5[1-5]/.test(cleaned)) {
      return 'mastercard';
    }
    
    // American Express
    if (/^3[47]/.test(cleaned)) {
      return 'amex';
    }
    
    // Discover
    if (/^6(?:011|5)/.test(cleaned)) {
      return 'discover';
    }
    
    return 'unknown';
  }
};

// ===== Date Formatting Service =====

export const dateFormattingService = {
  /**
   * Formats date as MM/DD/YYYY
   */
  formatDate: (date: Date): string => {
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  },

  /**
   * Formats date as MM/YY
   */
  formatShortDate: (date: Date): string => {
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = String(date.getFullYear()).slice(-2);
    return `${month}/${year}`;
  },

  /**
   * Formats relative time (e.g., "2 hours ago")
   */
  formatRelativeTime: (date: Date): string => {
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMinutes < 1) {
      return 'Just now';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes === 1 ? '' : 's'} ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`;
    } else if (diffInDays < 7) {
      return `${diffInDays} day${diffInDays === 1 ? '' : 's'} ago`;
    } else {
      return dateFormattingService.formatDate(date);
    }
  }
};

// ===== Text Formatting Service =====

export const textFormattingService = {
  /**
   * Capitalizes first letter of each word
   */
  capitalizeWords: (text: string): string => {
    return text
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  },

  /**
   * Truncates text with ellipsis
   */
  truncateText: (text: string, maxLength: number): string => {
    if (text.length <= maxLength) {
      return text;
    }
    return text.slice(0, maxLength) + '...';
  },

  /**
   * Removes extra whitespace
   */
  normalizeWhitespace: (text: string): string => {
    return text.replace(/\s+/g, ' ').trim();
  },

  /**
   * Formats URL for display
   */
  formatURL: (url: string): string => {
    if (!url) return '';
    
    try {
      const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
      return urlObj.hostname;
    } catch {
      return url;
    }
  },

  /**
   * Masks sensitive data (like passwords)
   */
  maskSensitiveData: (data: string, maskChar: string = '*'): string => {
    if (!data) return '';
    return maskChar.repeat(data.length);
  },

  /**
   * Formats phone number
   */
  formatPhoneNumber: (phone: string): string => {
    const cleaned = phone.replace(/\D/g, '');
    
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    } else if (cleaned.length === 11 && cleaned.startsWith('1')) {
      return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
    }
    
    return phone;
  }
};

// ===== Display Formatting Service =====

export const displayFormattingService = {
  /**
   * Formats file size in human readable format
   */
  formatFileSize: (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  /**
   * Formats currency
   */
  formatCurrency: (amount: number, currency: string = 'USD'): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  },

  /**
   * Formats percentage
   */
  formatPercentage: (value: number, decimals: number = 1): string => {
    return `${(value * 100).toFixed(decimals)}%`;
  },

  /**
   * Formats number with commas
   */
  formatNumber: (number: number): string => {
    return new Intl.NumberFormat('en-US').format(number);
  },

  /**
   * Gets color for password strength indicator
   */
  getPasswordStrengthColor: (strength: 'weak' | 'average' | 'strong' | 'perfect', themeColors: any): string => {
    switch (strength) {
      case 'weak':
        return themeColors.error;
      case 'average':
        return themeColors.warning || themeColors.secondary;
      case 'strong':
        return themeColors.primary;
      case 'perfect':
        return themeColors.secondary;
      default:
        return themeColors.secondary;
    }
  }
};

// ===== Validation Formatting Service =====

export const validationFormattingService = {
  /**
   * Sanitizes input for validation
   */
  sanitizeInput: (input: string): string => {
    return input.trim();
  },

  /**
   * Normalizes email for validation
   */
  normalizeEmail: (email: string): string => {
    return email.toLowerCase().trim();
  },

  /**
   * Normalizes URL for validation
   */
  normalizeURL: (url: string): string => {
    if (!url) return '';
    
    // Add protocol if missing
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return `https://${url}`;
    }
    
    return url;
  }
};

// ===== Type Definitions =====

export interface CardFormattingService {
  formatCardNumber: (number: string) => string;
  maskCardNumber: (number: string) => string;
  formatExpirationDate: (date: string) => string;
  formatCardholderName: (name: string) => string;
  formatCVV: (cvv: string) => string;
  getCardType: (number: string) => string;
}

export interface DateFormattingService {
  formatDate: (date: Date) => string;
  formatShortDate: (date: Date) => string;
  formatRelativeTime: (date: Date) => string;
}

export interface TextFormattingService {
  capitalizeWords: (text: string) => string;
  truncateText: (text: string, maxLength: number) => string;
  normalizeWhitespace: (text: string) => string;
  formatURL: (url: string) => string;
  maskSensitiveData: (data: string, maskChar?: string) => string;
  formatPhoneNumber: (phone: string) => string;
}

export interface DisplayFormattingService {
  formatFileSize: (bytes: number) => string;
  formatCurrency: (amount: number, currency?: string) => string;
  formatPercentage: (value: number, decimals?: number) => string;
  formatNumber: (number: number) => string;
} 