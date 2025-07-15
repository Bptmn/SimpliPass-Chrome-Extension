/**
 * Shared Type Definitions
 * 
 * Core type definitions used across all packages to ensure
 * type consistency and prevent duplication.
 */

// ===== Platform Types =====

export type Platform = 'mobile' | 'extension';
export type NetworkStatus = 'online' | 'offline' | 'unknown';
export type BiometricType = 'fingerprint' | 'face' | 'iris' | 'none';

// ===== User & Session Types =====

export interface User {
  id: string;
  email: string;
  username: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserSession {
  id: string;
  userId: string;
  userSecretKey: string;
  deviceFingerprint: string;
  isActive: boolean;
  createdAt: Date;
  expiresAt: Date;
}

export interface AuthState {
  user: User | null;
  session: UserSession | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// ===== Categories & Tags =====

export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
  itemCount: number;
  createdAt: Date;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
  itemCount: number;
  createdAt: Date;
}

// ===== Vault & Storage =====

export interface Vault {
  userId: string;
  credentials: any[];
  bankCards: any[];
  secureNotes: any[];
  categories: Category[];
  tags: Tag[];
  lastSyncAt: Date;
  version: string;
}

export interface EncryptedVault {
  version: string;
  encryptedData: string;
  iv: string;
  salt: string;
  timestamp: number;
}

// ===== Crypto & Security =====

export interface CryptoKey {
  key: string;
  salt: string;
  iterations: number;
  algorithm: string;
}

export interface EncryptionResult {
  encryptedData: string;
  iv: string;
  salt: string;
  algorithm: string;
}

export interface DecryptionResult {
  decryptedData: string;
  algorithm: string;
}

// ===== UI & State =====

export interface UIState {
  isLoading: boolean;
  error: string | null;
  success: string | null;
  modal: {
    isOpen: boolean;
    type: string | null;
    data: any | null;
  };
}

export interface SearchState {
  query: string;
  filters: {
    category: string | null;
    tags: string[];
    favorites: boolean;
    type: 'all' | 'credentials' | 'cards' | 'notes';
  };
  results: {
    credentials: any[];
    bankCards: any[];
    secureNotes: any[];
  };
}

export interface SortOptions {
  field: 'title' | 'createdAt' | 'updatedAt' | 'lastUsedAt';
  direction: 'asc' | 'desc';
}

// ===== API & Network =====

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// ===== Events & Notifications =====

export interface AppEvent {
  type: string;
  payload: any;
  timestamp: Date;
  userId?: string;
}

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  duration?: number;
  action?: {
    label: string;
    handler: () => void;
  };
}

// ===== Settings =====

export interface UserSettings {
  userId: string;
  autoLockTimeout: number;
  biometricEnabled: boolean;
  clipboardTimeout: number;
  passwordGeneratorLength: number;
  passwordGeneratorIncludeSymbols: boolean;
  passwordGeneratorIncludeNumbers: boolean;
  passwordGeneratorIncludeUppercase: boolean;
  theme: 'light' | 'dark' | 'system';
  language: string;
  notifications: {
    securityAlerts: boolean;
    syncUpdates: boolean;
    passwordExpiry: boolean;
  };
}

// ===== Error Types =====

export interface AppError {
  code: string;
  message: string;
  details?: any;
  timestamp: Date;
  userId?: string;
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

// ===== Utility Types =====

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;
export type ExcludeFields<T, K extends keyof T> = Omit<T, K>;

// ===== Form Types =====

export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'password' | 'email' | 'url' | 'number' | 'select' | 'textarea';
  required: boolean;
  placeholder?: string;
  validation?: {
    pattern?: RegExp;
    minLength?: number;
    maxLength?: number;
    custom?: (value: any) => string | null;
  };
  options?: Array<{ value: string; label: string }>;
}

export interface FormState {
  values: Record<string, any>;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  isValid: boolean;
  isSubmitting: boolean;
}

// ===== Import/Export Types =====

export interface ExportData {
  version: string;
  exportedAt: Date;
  userId: string;
  data: {
    credentials: any[];
    bankCards: any[];
    secureNotes: any[];
    categories: Category[];
    tags: Tag[];
    settings: UserSettings;
  };
}

export interface ImportResult {
  success: boolean;
  imported: {
    credentials: number;
    bankCards: number;
    secureNotes: number;
    categories: number;
    tags: number;
  };
  errors: string[];
  warnings: string[];
} 