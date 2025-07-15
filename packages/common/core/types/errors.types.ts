// Base error class for SimpliPass
export class SimpliPassError extends Error {
  constructor(
    message: string,
    public code: string,
    public layer: 'hook' | 'service' | 'library',
    public originalError?: Error
  ) {
    super(message);
    this.name = 'SimpliPassError';
  }
}

// Layer 1: Hook Errors
export class HookError extends SimpliPassError {
  constructor(message: string, originalError?: Error) {
    super(message, 'HOOK_ERROR', 'hook', originalError);
    this.name = 'HookError';
  }
}

// Layer 2: Service Errors
export class AuthenticationError extends SimpliPassError {
  constructor(message: string, originalError?: Error) {
    super(message, 'AUTH_ERROR', 'service', originalError);
    this.name = 'AuthenticationError';
  }
}

export class SessionError extends SimpliPassError {
  constructor(message: string, originalError?: Error) {
    super(message, 'SESSION_ERROR', 'service', originalError);
    this.name = 'SessionError';
  }
}

export class VaultError extends SimpliPassError {
  constructor(message: string, originalError?: Error) {
    super(message, 'VAULT_ERROR', 'service', originalError);
    this.name = 'VaultError';
  }
}

export class ItemError extends SimpliPassError {
  constructor(message: string, originalError?: Error) {
    super(message, 'ITEM_ERROR', 'service', originalError);
    this.name = 'ItemError';
  }
}

// Layer 3: Library Errors
export class CryptographyError extends SimpliPassError {
  constructor(message: string, originalError?: Error) {
    super(message, 'CRYPTO_ERROR', 'library', originalError);
    this.name = 'CryptographyError';
  }
}

export class NetworkError extends SimpliPassError {
  constructor(message: string, originalError?: Error) {
    super(message, 'NETWORK_ERROR', 'library', originalError);
    this.name = 'NetworkError';
  }
}

export class StorageError extends SimpliPassError {
  constructor(message: string, originalError?: Error) {
    super(message, 'STORAGE_ERROR', 'library', originalError);
    this.name = 'StorageError';
  }
}

export class PlatformError extends SimpliPassError {
  constructor(message: string, originalError?: Error) {
    super(message, 'PLATFORM_ERROR', 'library', originalError);
    this.name = 'PlatformError';
  }
}

// Error handling utility
export function withErrorHandling<T>(
  operation: () => Promise<T>,
  errorHandler: (error: SimpliPassError) => void
): Promise<T> {
  return operation().catch((error) => {
    const simpliPassError = new SimpliPassError(
      error.message,
      'UNKNOWN_ERROR',
      'library',
      error
    );
    errorHandler(simpliPassError);
    throw simpliPassError;
  });
} 