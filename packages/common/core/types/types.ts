// src/types.ts

export interface HomePageProps {
  user: unknown;
  pageState: PageState | null;
  onInjectCredential: (credentialId: string) => void;
}

export interface PageState {
  url: string;
  domain: string;
  hasLoginForm: boolean;
}

// Re-export specific types for convenience
export * from './items.types';
export * from './errors.types';

// ===== Type Exports =====

// Re-export all types from their respective modules
export type {
  User,
  UserSession,
} from './auth.types';

export type {
  PlatformAdapter,
  EncryptedVault,
  DeviceInfo,
  NetworkStatus,
} from './platform.types';

export type {
  SimpliPassError,
  AuthenticationError,
  CryptographyError,
  NetworkError,
  VaultError,
} from './errors.types';

export type {
  ValidationError,
} from './shared.types';

// Additional types for search and sorting
export interface SearchState {
  query: string;
  filters: SearchFilters;
  sortBy: SortOptions;
}

export interface SearchFilters {
  type?: 'credential' | 'bankCard' | 'secureNote';
  tags?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  category?: string;
  isFavorite?: boolean;
}

export type SortOptions = 'title' | 'createdAt' | 'updatedAt' | 'lastUsed';
