/**
 * Session Management Logic
 * 
 * Handles session management operations using platform adapters.
 * This provides a unified interface for session operations across platforms.
 */

import { getPlatformAdapter } from '../platform/platform.adapter';
import { useAuthStore } from '../states/auth.state';
import { UserSession } from '../types/auth.types';

/**
 * Initialize user session after successful authentication
 */
export const initializeUserSession = async (userId: string): Promise<void> => {
  try {
    
    // Get platform adapter
    const adapter = await getPlatformAdapter();
    
    // Get device fingerprint
    const deviceFingerprint = await adapter.getDeviceFingerprint();

    // Create session object
    const session: UserSession = {
      id: crypto.randomUUID(),
      userId,
      deviceFingerprint,
      isActive: true,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes
    };
    
    // Store in auth state
    useAuthStore.getState().setSession(session);
    useAuthStore.getState().setAuthenticated(true);
    
    // Store session metadata in platform storage
    await adapter.storeSessionMetadata({
      sessionId: session.id,
      userId: session.userId,
      deviceFingerprint: session.deviceFingerprint,
      createdAt: session.createdAt.toISOString(),
      expiresAt: session.expiresAt.toISOString(),
    });
    
    console.log('[Session] User session initialized successfully');
  } catch (error) {
    console.error('[Session] Failed to initialize user session:', error);
    throw new Error('Failed to initialize user session');
  }
};

/**
 * Clear user session and all related data
 */
export const clearUserSession = async (): Promise<void> => {
  try {
    console.log('[Session] Clearing user session...');
    
    // Get platform adapter
    const adapter = await getPlatformAdapter();
    
    // Clear auth state
    useAuthStore.getState().clearAuth();
    
    // Clear session metadata from platform storage
    await adapter.deleteSessionMetadata();
    
    // Clear user secret key
    await adapter.deleteUserSecretKey();
    
    console.log('[Session] User session cleared successfully');
  } catch (error) {
    console.error('[Session] Failed to clear user session:', error);
    throw new Error('Failed to clear user session');
  }
};

/**
 * Check if user session is valid
 */
export const isSessionValid = async (): Promise<boolean> => {
  try {
    const session = useAuthStore.getState().session;
    
    if (!session) {
      return false;
    }
    
    // Check if session has expired
    if (session.expiresAt < new Date()) {
      console.log('[Session] Session has expired');
      await clearUserSession();
      return false;
    }
    
    // Check if user secret key exists
    const adapter = await getPlatformAdapter();
    const userSecretKey = await adapter.getUserSecretKey();
    
    if (!userSecretKey) {
      console.log('[Session] User secret key not found');
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('[Session] Error checking session validity:', error);
    return false;
  }
};

/**
 * Refresh user session (extend expiration time)
 */
export const refreshUserSession = async (): Promise<void> => {
  try {
    const session = useAuthStore.getState().session;
    
    if (!session) {
      throw new Error('No active session to refresh');
    }
    
    // Extend session expiration
    const newExpiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
    
    // Update session in state
    useAuthStore.getState().setSession({
      ...session,
      expiresAt: newExpiresAt,
    });
    
    // Update session metadata in platform storage
    const adapter = await getPlatformAdapter();
    await adapter.storeSessionMetadata({
      sessionId: session.id,
      userId: session.userId,
      deviceFingerprint: session.deviceFingerprint,
      createdAt: session.createdAt.toISOString(),
      expiresAt: newExpiresAt.toISOString(),
    });
    
    console.log('[Session] User session refreshed successfully');
  } catch (error) {
    console.error('[Session] Failed to refresh user session:', error);
    throw new Error('Failed to refresh user session');
  }
}; 