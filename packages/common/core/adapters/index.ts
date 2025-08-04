// Export all adapters for easy importing
export { auth, type IAuthAdapter } from './auth.adapter';
export { db, type IDatabaseAdapter } from './database.adapter';
export { platform, initializePlatform, detectPlatform, type PlatformAdapter } from './platform.adapter';
export { storage, type IPlatformStorageAdapter } from './platform.storage.adapter';