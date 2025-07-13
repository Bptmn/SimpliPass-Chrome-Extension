/**
 * Session Management Logic
 * 
 * Handles session management operations using platform adapters.
 * This provides a unified interface for session operations across platforms.
 */

import { getPlatformAdapter } from '../adapters/adapter.factory';

// ===== Types =====

export interface SessionData {
  userSecretKey: string;
  expiresAt: number;
  createdAt: number;
}

export interface SessionResult {
  success: boolean;
  data?: SessionData;
  error?: string;
}

export interface SessionOptions {
  rememberMe?: boolean;
  sessionTimeout?: number;
}

// ===== Session Management =====

/**
 * Create a new session
 */
export async function createSession(
  userSecretKey: string,
  options: SessionOptions = {}
): Promise<SessionResult> {
  try {
    const adapter = await getPlatformAdapter();
    
    // Calculate session expiration
    const sessionTimeout = options.sessionTimeout || 30 * 60 * 1000; // 30 minutes default
    const expiresAt = Date.now() + sessionTimeout;
    
    const sessionData: SessionData = {
      userSecretKey,
      expiresAt,
      createdAt: Date.now(),
    };
    
    // Store the user secret key separately
    await adapter.storeUserSecretKey(userSecretKey);
    
    // Store session metadata separately
    const sessionMetadata = JSON.stringify(sessionData);
    await adapter.storeSessionMetadata(sessionMetadata);
    
    console.log('[Session] Session created successfully');
    return {
      success: true,
      data: sessionData,
    };
  } catch (error) {
    console.error('[Session] Failed to create session:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create session',
    };
  }
}

/**
 * Get current session
 */
export async function getSession(): Promise<SessionResult> {
  try {
    const adapter = await getPlatformAdapter();
    
    // Get session metadata
    const sessionMetadata = await adapter.getSessionMetadata();
    
    if (!sessionMetadata) {
      return {
        success: false,
        error: 'No active session found',
      };
    }
    
    // Parse session metadata
    try {
      const parsed = JSON.parse(sessionMetadata);
      if (parsed.userSecretKey && parsed.expiresAt && parsed.createdAt) {
        return {
          success: true,
          data: parsed as SessionData,
        };
      }
    } catch (parseError) {
      console.error('[Session] Failed to parse session metadata:', parseError);
      return {
        success: false,
        error: 'Invalid session metadata format',
      };
    }
    
    return {
      success: false,
      error: 'Invalid session data format',
    };
  } catch (error) {
    console.error('[Session] Failed to get session:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get session',
    };
  }
}

/**
 * Validate current session
 */
export async function validateSession(): Promise<SessionResult> {
  try {
    const sessionResult = await getSession();
    
    if (!sessionResult.success || !sessionResult.data) {
      return {
        success: false,
        error: 'No valid session found',
      };
    }
    
    const { expiresAt } = sessionResult.data;
    
    // Check if session has expired
    if (Date.now() > expiresAt) {
      console.log('[Session] Session has expired');
      await clearSession();
      return {
        success: false,
        error: 'Session has expired',
      };
    }
    
    return sessionResult;
  } catch (error) {
    console.error('[Session] Failed to validate session:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to validate session',
    };
  }
}

/**
 * Refresh session
 */
export async function refreshSession(
  options: SessionOptions = {}
): Promise<SessionResult> {
  try {
    const currentSession = await getSession();
    
    if (!currentSession.success || !currentSession.data) {
      return {
        success: false,
        error: 'No active session to refresh',
      };
    }
    
    // Create a new session with the same user secret key
    return await createSession(currentSession.data.userSecretKey, options);
  } catch (error) {
    console.error('[Session] Failed to refresh session:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to refresh session',
    };
  }
}

/**
 * Clear current session
 */
export async function clearSession(): Promise<SessionResult> {
  try {
    const adapter = await getPlatformAdapter();
    
    // Clear user secret key
    await adapter.deleteUserSecretKey();
    
    // Clear session metadata
    await adapter.deleteSessionMetadata();
    
    // Clear session data
    await adapter.clearSession();
    
    console.log('[Session] Session cleared successfully');
    return {
      success: true,
    };
  } catch (error) {
    console.error('[Session] Failed to clear session:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to clear session',
    };
  }
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  try {
    const sessionResult = await validateSession();
    return sessionResult.success;
  } catch (error) {
    console.warn('[Session] Failed to check authentication status:', error);
    return false;
  }
}

/**
 * Get session time remaining
 */
export async function getSessionTimeRemaining(): Promise<number> {
  try {
    const sessionResult = await getSession();
    
    if (!sessionResult.success || !sessionResult.data) {
      return 0;
    }
    
    const { expiresAt } = sessionResult.data;
    const remaining = expiresAt - Date.now();
    
    return Math.max(0, remaining);
  } catch (error) {
    console.warn('[Session] Failed to get session time remaining:', error);
    return 0;
  }
}

/**
 * Extend session timeout
 */
export async function extendSession(
  additionalTime: number = 30 * 60 * 1000 // 30 minutes
): Promise<SessionResult> {
  try {
    const currentSession = await getSession();
    
    if (!currentSession.success || !currentSession.data) {
      return {
        success: false,
        error: 'No active session to extend',
      };
    }
    
    // Create new session with extended timeout
    const newExpiresAt = Date.now() + additionalTime;
    const sessionData: SessionData = {
      ...currentSession.data,
      expiresAt: newExpiresAt,
    };
    
    // Store updated session metadata
    const adapter = await getPlatformAdapter();
    const sessionMetadata = JSON.stringify(sessionData);
    await adapter.storeSessionMetadata(sessionMetadata);
    
    console.log('[Session] Session extended successfully');
    return {
      success: true,
      data: sessionData,
    };
  } catch (error) {
    console.error('[Session] Failed to extend session:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to extend session',
    };
  }
} 