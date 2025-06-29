// Shared Constants
export const APP_NAME = 'SimpliPass';
export const APP_VERSION = '1.0.0';

export const STORAGE_KEYS = {
  USER_SECRET_KEY: 'UserSecretKey',
  REMEMBER_EMAIL: 'simplipass_remembered_email',
} as const;

export const DATABASE_CONFIG = {
  NAME: 'SimpliPassCache',
  VERSION: 1,
  STORES: {
    USER: 'user',
    CREDENTIALS: 'credentials',
  },
} as const;

export const PASSWORD_DEFAULTS = {
  LENGTH: 16,
  HAS_NUMBERS: true,
  HAS_UPPERCASE: true,
  HAS_LOWERCASE: true,
  HAS_SPECIAL_CHARACTERS: true,
} as const;

export const VALIDATION_RULES = {
  MIN_PASSWORD_LENGTH: 8,
  MAX_PASSWORD_LENGTH: 128,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
} as const;