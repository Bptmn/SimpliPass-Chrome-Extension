/**
 * App-wide Constants
 * 
 * Centralized constants used across all packages to ensure
 * consistency and prevent duplication.
 */

// ===== App Information =====
export const APP_NAME = 'SimpliPass';
export const APP_VERSION = '1.0.0';
export const APP_DESCRIPTION = 'Secure password manager for mobile and browser';

// ===== Security Constants =====
export const SECURITY = {
  // Encryption
  ENCRYPTION_ALGORITHM: 'AES-256-GCM',
  KEY_DERIVATION_ALGORITHM: 'PBKDF2',
  KEY_DERIVATION_ITERATIONS: 100000,
  SALT_LENGTH: 32,
  IV_LENGTH: 16,
  
  // Session
  DEFAULT_SESSION_TIMEOUT: 30 * 60 * 1000, // 30 minutes
  MOBILE_SESSION_TIMEOUT: 15 * 60 * 1000, // 15 minutes
  MAX_SESSION_TIMEOUT: 24 * 60 * 60 * 1000, // 24 hours
  
  // Password
  MIN_PASSWORD_LENGTH: 8,
  MAX_PASSWORD_LENGTH: 128,
  PASSWORD_GENERATOR_DEFAULT_LENGTH: 16,
  
  // Retry
  MAX_RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
} as const;

// ===== Storage Keys =====
export const STORAGE_KEYS = {
  // User
  USER_SECRET_KEY: 'userSecretKey',
  USER_SESSION: 'userSession',
  USER_SETTINGS: 'userSettings',
  
  // Vault (Extension only)
  ENCRYPTED_VAULT: 'encryptedVault',
  DEVICE_FINGERPRINT: 'deviceFingerprint',
  
  // UI State
  UI_STATE: 'uiState',
  SEARCH_STATE: 'searchState',
  THEME: 'theme',
  LANGUAGE: 'language',
  
  // App State
  LAST_SYNC: 'lastSync',
  APP_VERSION: 'appVersion',
} as const;

// ===== UI Constants =====
export const UI = {
  // Animation
  ANIMATION_DURATION: 300,
  TRANSITION_DURATION: 200,
  
  // Toast
  TOAST_DURATION: 3000,
  TOAST_DURATION_LONG: 5000,
  
  // Modal
  MODAL_BACKDROP_OPACITY: 0.5,
  
  // Loading
  LOADING_DELAY: 500, // Show loading after 500ms
  
  // Pagination
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
} as const;

// ===== Validation =====
export const VALIDATION = {
  // Email
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  
  // URL
  URL_REGEX: /^https?:\/\/.+/,
  
  // Password
  PASSWORD_REGEX: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
  
  // Credit Card
  CREDIT_CARD_REGEX: /^\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}$/,
  CVV_REGEX: /^\d{3,4}$/,
  
  // Expiry Date
  EXPIRY_REGEX: /^(0[1-9]|1[0-2])\/([0-9]{2})$/,
} as const;

// ===== Categories =====
export const DEFAULT_CATEGORIES = [
  { id: 'social', name: 'Social Media', color: '#3B82F6', icon: 'social' },
  { id: 'email', name: 'Email', color: '#10B981', icon: 'email' },
  { id: 'banking', name: 'Banking', color: '#F59E0B', icon: 'banking' },
  { id: 'shopping', name: 'Shopping', color: '#EF4444', icon: 'shopping' },
  { id: 'work', name: 'Work', color: '#8B5CF6', icon: 'work' },
  { id: 'entertainment', name: 'Entertainment', color: '#EC4899', icon: 'entertainment' },
  { id: 'utilities', name: 'Utilities', color: '#6B7280', icon: 'utilities' },
  { id: 'other', name: 'Other', color: '#9CA3AF', icon: 'other' },
] as const;

// ===== Card Types =====
export const CARD_TYPES = [
  { id: 'visa', name: 'Visa', pattern: /^4/ },
  { id: 'mastercard', name: 'Mastercard', pattern: /^5[1-5]/ },
  { id: 'amex', name: 'American Express', pattern: /^3[47]/ },
  { id: 'discover', name: 'Discover', pattern: /^6(?:011|5)/ },
  { id: 'jcb', name: 'JCB', pattern: /^(?:2131|1800|35)/ },
  { id: 'diners', name: 'Diners Club', pattern: /^3(?:0[0-5]|[68])/ },
  { id: 'unionpay', name: 'UnionPay', pattern: /^62/ },
  { id: 'other', name: 'Other', pattern: /.*/ },
] as const;

// ===== Error Codes =====
export const ERROR_CODES = {
  // Authentication
  AUTH_INVALID_CREDENTIALS: 'AUTH_INVALID_CREDENTIALS',
  AUTH_USER_NOT_FOUND: 'AUTH_USER_NOT_FOUND',
  AUTH_SESSION_EXPIRED: 'AUTH_SESSION_EXPIRED',
  AUTH_BIOMETRIC_FAILED: 'AUTH_BIOMETRIC_FAILED',
  
  // Storage
  STORAGE_READ_FAILED: 'STORAGE_READ_FAILED',
  STORAGE_WRITE_FAILED: 'STORAGE_WRITE_FAILED',
  STORAGE_DELETE_FAILED: 'STORAGE_DELETE_FAILED',
  
  // Crypto
  CRYPTO_ENCRYPTION_FAILED: 'CRYPTO_ENCRYPTION_FAILED',
  CRYPTO_DECRYPTION_FAILED: 'CRYPTO_DECRYPTION_FAILED',
  CRYPTO_KEY_DERIVATION_FAILED: 'CRYPTO_KEY_DERIVATION_FAILED',
  
  // Network
  NETWORK_OFFLINE: 'NETWORK_OFFLINE',
  NETWORK_TIMEOUT: 'NETWORK_TIMEOUT',
  NETWORK_SERVER_ERROR: 'NETWORK_SERVER_ERROR',
  
  // Validation
  VALIDATION_FAILED: 'VALIDATION_FAILED',
  VALIDATION_REQUIRED_FIELD: 'VALIDATION_REQUIRED_FIELD',
  VALIDATION_INVALID_FORMAT: 'VALIDATION_INVALID_FORMAT',
  
  // Platform
  PLATFORM_NOT_SUPPORTED: 'PLATFORM_NOT_SUPPORTED',
  PLATFORM_FEATURE_UNAVAILABLE: 'PLATFORM_FEATURE_UNAVAILABLE',
} as const;

// ===== Event Types =====
export const EVENT_TYPES = {
  // Authentication
  USER_LOGIN: 'USER_LOGIN',
  USER_LOGOUT: 'USER_LOGOUT',
  SESSION_EXPIRED: 'SESSION_EXPIRED',
  
  // Data
  ITEM_CREATED: 'ITEM_CREATED',
  ITEM_UPDATED: 'ITEM_UPDATED',
  ITEM_DELETED: 'ITEM_DELETED',
  VAULT_SYNCED: 'VAULT_SYNCED',
  
  // Security
  PASSWORD_COPIED: 'PASSWORD_COPIED',
  BIOMETRIC_USED: 'BIOMETRIC_USED',
  SECURITY_ALERT: 'SECURITY_ALERT',
  
  // UI
  THEME_CHANGED: 'THEME_CHANGED',
  LANGUAGE_CHANGED: 'LANGUAGE_CHANGED',
  SETTINGS_UPDATED: 'SETTINGS_UPDATED',
} as const;

// ===== Notification Types =====
export const NOTIFICATION_TYPES = {
  INFO: 'info',
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR: 'error',
} as const;

// ===== Theme =====
export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system',
} as const;

// ===== Languages =====
export const LANGUAGES = {
  EN: 'en',
  FR: 'fr',
  ES: 'es',
  DE: 'de',
  IT: 'it',
  PT: 'pt',
  RU: 'ru',
  ZH: 'zh',
  JA: 'ja',
  KO: 'ko',
} as const;

// ===== Export/Import =====
export const EXPORT_FORMATS = {
  JSON: 'json',
  CSV: 'csv',
  TXT: 'txt',
} as const;

export const IMPORT_FORMATS = {
  JSON: 'json',
  CSV: 'csv',
  TXT: 'txt',
  KEEPASS: 'keepass',
  LASTPASS: 'lastpass',
  BITWARDEN: 'bitwarden',
} as const; 