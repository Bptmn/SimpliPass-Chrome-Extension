/**
 * Session Management Service
 * 
 * Handles user session initialization, validation, and cleanup.
 * Sessions are stored in platform-specific storage.
 */

import { platform } from '../adapters/platform.adapter';
import { useAuthStore } from '../states/auth';
import { UserSession } from '../types/auth.types';

/**
 * Generate a unique session ID
 */
function generateSessionId(): string {
  return crypto.randomUUID();
}

/**
 * Initialize user session after successful authentication
 */
export async function initializeUserSession(userId: string, _userSecretKey: string): Promise<UserSession> {
  try {
    // Create session
    const session: UserSession = {
      id: generateSessionId(),
      userId,
      isActive: true,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes
    };
    
    // Store session metadata in platform storage
    await platform.storeSessionMetadata({
      sessionId: session.id,
      userId: session.userId,
      isActive: session.isActive,
      createdAt: session.createdAt.toISOString(),
      expiresAt: session.expiresAt.toISOString(),
    });
    
    return session;
  } catch (_error) {
    throw new Error('Failed to initialize user session');
  }
}

/**
 * Clear user session and all related data
 */
export async function clearUserSession(): Promise<void> {
  try {
    // Clear auth state
    useAuthStore.getState().clearAuth();
    
    // Clear session metadata from platform storage
    await platform.deleteSessionMetadata();
  } catch (_error) {
    throw new Error('Failed to clear user session');
  }
}

/**
 * Check if user session is valid
 */
export async function validateUserSession(): Promise<boolean> {
  try {
    // Get session metadata
    const sessionMetadata = await platform.getSessionMetadata();
    
    if (!sessionMetadata) {
      return false;
    }
    
    // Validate session metadata
    const session = sessionMetadata as UserSession;
    const now = new Date();
    const expiresAt = new Date(session.expiresAt);
    
    if (now > expiresAt || !session.isActive) {
      return false;
    }
    
    // Update session metadata
    await platform.storeSessionMetadata({
      ...sessionMetadata,
      expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // Extend session
    });
    
    return true;
  } catch (_error) {
    return false;
  }
}

/**
 * Check if user session is valid (alias for validateUserSession)
 */
export const isSessionValid = validateUserSession;

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
    await platform.storeSessionMetadata({
      sessionId: session.id,
      userId: session.userId,
      createdAt: session.createdAt.toISOString(),
      expiresAt: newExpiresAt.toISOString(),
    });
    
    console.log('[Session] User session refreshed successfully');
  } catch (error) {
    console.error('[Session] Failed to refresh user session:', error);
    throw new Error('Failed to refresh user session');
  }
}; 