/**
 * Base Type Definitions
 * 
 * Fundamental type definitions used across all packages
 * to ensure type consistency and prevent duplication.
 */

// ===== Primitive Types =====

export type ID = string;
export type Timestamp = number;
export type UUID = string;

// ===== Platform Types =====

export type Platform = 'mobile' | 'extension';
export type PlatformOS = 'ios' | 'android' | 'web';

// ===== Status Types =====

export type LoadingStatus = 'idle' | 'loading' | 'success' | 'error';
export type NetworkStatus = 'online' | 'offline' | 'unknown';
export type SyncStatus = 'synced' | 'syncing' | 'error' | 'offline';

// ===== Result Types =====

export interface Result<T = any, E = string> {
  success: boolean;
  data?: T;
  error?: E;
}

export interface AsyncResult<T = any, E = string> extends Promise<Result<T, E>> {}

// ===== Pagination Types =====

export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

// ===== Filter Types =====

export interface BaseFilter {
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface DateFilter extends BaseFilter {
  startDate?: Date;
  endDate?: Date;
}

export interface CategoryFilter extends BaseFilter {
  category?: string;
  categories?: string[];
}

export interface TagFilter extends BaseFilter {
  tags?: string[];
  includeTags?: string[];
  excludeTags?: string[];
}

// ===== Sort Types =====

export interface SortOption {
  field: string;
  direction: 'asc' | 'desc';
  label: string;
}

export interface SortConfig {
  defaultSort: SortOption;
  availableSorts: SortOption[];
}

// ===== Validation Types =====

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => string | null;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface FieldValidation {
  field: string;
  value: any;
  rules: ValidationRule[];
  result: ValidationResult;
}

// ===== Error Types =====

export interface AppError {
  code: string;
  message: string;
  details?: any;
  timestamp: Date;
  userId?: string;
  context?: Record<string, any>;
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
  value?: any;
}

export interface NetworkError extends AppError {
  statusCode?: number;
  url?: string;
  method?: string;
}

export interface CryptoError extends AppError {
  algorithm?: string;
  operation?: 'encrypt' | 'decrypt' | 'hash' | 'derive';
}

// ===== Event Types =====

export interface BaseEvent {
  type: string;
  timestamp: Date;
  userId?: string;
  sessionId?: string;
}

export interface DataEvent<T = any> extends BaseEvent {
  data: T;
  metadata?: Record<string, any>;
}

export interface ErrorEvent extends BaseEvent {
  error: AppError;
  context?: Record<string, any>;
}

export interface UserEvent extends BaseEvent {
  action: string;
  target?: string;
  metadata?: Record<string, any>;
}

// ===== Configuration Types =====

export interface AppConfig {
  version: string;
  environment: 'development' | 'staging' | 'production';
  platform: Platform;
  features: Record<string, boolean>;
  limits: Record<string, number>;
}

export interface FeatureConfig {
  enabled: boolean;
  version?: string;
  settings?: Record<string, any>;
}

export interface SecurityConfig {
  encryptionAlgorithm: string;
  keyDerivationAlgorithm: string;
  keyDerivationIterations: number;
  saltLength: number;
  ivLength: number;
  sessionTimeout: number;
  maxRetryAttempts: number;
}

// ===== State Types =====

export interface BaseState {
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

export interface ListState<T> extends BaseState {
  items: T[];
  total: number;
  hasMore: boolean;
  filters: Record<string, any>;
  sort: SortOption;
}

export interface DetailState<T> extends BaseState {
  item: T | null;
  isEditing: boolean;
  hasChanges: boolean;
}

// ===== Form Types =====

export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'password' | 'email' | 'url' | 'number' | 'select' | 'textarea' | 'checkbox' | 'radio' | 'date';
  required: boolean;
  placeholder?: string;
  defaultValue?: any;
  validation?: ValidationRule[];
  options?: Array<{ value: string; label: string }>;
  disabled?: boolean;
  hidden?: boolean;
}

export interface FormState {
  values: Record<string, any>;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  isValid: boolean;
  isSubmitting: boolean;
  isDirty: boolean;
}

export interface FormConfig {
  fields: FormField[];
  initialValues: Record<string, any>;
  validationSchema?: any;
  onSubmit: (values: Record<string, any>) => void | Promise<void>;
  onCancel?: () => void;
}

// ===== Utility Types =====

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type ExcludeFields<T, K extends keyof T> = Omit<T, K>;

export type PickFields<T, K extends keyof T> = Pick<T, K>;

export type Nullable<T> = T | null;

export type Undefinable<T> = T | undefined;

export type OptionalNullable<T> = T | null | undefined;

// ===== Function Types =====

export type AsyncFunction<TArgs extends any[] = any[], TReturn = any> = (...args: TArgs) => Promise<TReturn>;

export type SyncFunction<TArgs extends any[] = any[], TReturn = any> = (...args: TArgs) => TReturn;

export type EventHandler<T = any> = (event: T) => void | Promise<void>;

export type ErrorHandler = (error: AppError) => void | Promise<void>;

export type Validator<T = any> = (value: T) => string | null;

export type Transformer<TInput = any, TOutput = any> = (input: TInput) => TOutput;

// ===== Collection Types =====

export interface Collection<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface GroupedCollection<T> {
  groups: Record<string, T[]>;
  total: number;
  groupCount: number;
}

export interface SortedCollection<T> {
  items: T[];
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  total: number;
}

// ===== Cache Types =====

export interface CacheEntry<T = any> {
  key: string;
  value: T;
  timestamp: Date;
  ttl: number;
  isExpired: boolean;
}

export interface CacheConfig {
  maxSize: number;
  defaultTTL: number;
  cleanupInterval: number;
}

// ===== Logger Types =====

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: Date;
  context?: Record<string, any>;
  userId?: string;
  sessionId?: string;
}

export interface LoggerConfig {
  level: LogLevel;
  enableConsole: boolean;
  enableRemote: boolean;
  remoteEndpoint?: string;
  maxEntries: number;
} 