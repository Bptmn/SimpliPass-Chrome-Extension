/**
 * Shared Type Definitions
 * 
 * Core type definitions used across all packages to ensure
 * type consistency and prevent duplication.
 */

// ===== Base Types =====

export type Platform = 'mobile' | 'extension';
export type NetworkStatus = 'online' | 'offline' | 'unknown';
export type BiometricType = 'fingerprint' | 'face' | 'iris' | 'none';

// ===== User & Authentication =====

export interface User {
  id: string;
  email: string;
  masterPasswordHash: string;
  createdAt: Date;
  lastLoginAt: Date;
  isActive: boolean;
}

export interface UserSession {
  userId: string;
  userSecretKey: string;
  sessionId: string;
  createdAt: Date;
  expiresAt: Date;
  isActive: boolean;
}

export interface AuthState {
  user: User | null;
  session: UserSession | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// ===== Credentials =====

export interface Credential {
  id: string;
  userId: string;
  title: string;
  username: string;
  password: string;
  url: string;
  notes?: string;
  category: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  lastUsedAt?: Date;
  isFavorite: boolean;
}

export interface CredentialDecrypted extends Omit<Credential, 'password'> {
  password: string; // Decrypted password
}

export interface CredentialEncrypted extends Omit<Credential, 'password'> {
  password: string; // Encrypted password
}

export interface CredentialForm {
  title: string;
  username: string;
  password: string;
  url: string;
  notes?: string;
  category: string;
  tags: string[];
}

// ===== Bank Cards =====

export interface BankCard {
  id: string;
  userId: string;
  cardholderName: string;
  cardNumber: string;
  expiryMonth: number;
  expiryYear: number;
  cvv: string;
  cardType: string;
  bankName?: string;
  notes?: string;
  category: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  lastUsedAt?: Date;
  isFavorite: boolean;
}

export interface BankCardDecrypted extends Omit<BankCard, 'cardNumber' | 'cvv'> {
  cardNumber: string; // Decrypted card number
  cvv: string; // Decrypted CVV
}

export interface BankCardEncrypted extends Omit<BankCard, 'cardNumber' | 'cvv'> {
  cardNumber: string; // Encrypted card number
  cvv: string; // Encrypted CVV
}

export interface BankCardForm {
  cardholderName: string;
  cardNumber: string;
  expiryMonth: number;
  expiryYear: number;
  cvv: string;
  cardType: string;
  bankName?: string;
  notes?: string;
  category: string;
  tags: string[];
}

// ===== Secure Notes =====

export interface SecureNote {
  id: string;
  userId: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  lastUsedAt?: Date;
  isFavorite: boolean;
}

export interface SecureNoteDecrypted extends SecureNote {
  content: string; // Decrypted content
}

export interface SecureNoteEncrypted extends Omit<SecureNote, 'content'> {
  content: string; // Encrypted content
}

export interface SecureNoteForm {
  title: string;
  content: string;
  category: string;
  tags: string[];
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
  credentials: CredentialDecrypted[];
  bankCards: BankCardDecrypted[];
  secureNotes: SecureNoteDecrypted[];
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
    credentials: CredentialDecrypted[];
    bankCards: BankCardDecrypted[];
    secureNotes: SecureNoteDecrypted[];
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

// ===== Settings & Configuration =====

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

// ===== Export/Import =====

export interface ExportData {
  version: string;
  exportedAt: Date;
  userId: string;
  data: {
    credentials: CredentialDecrypted[];
    bankCards: BankCardDecrypted[];
    secureNotes: SecureNoteDecrypted[];
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